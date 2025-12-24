import { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { createServerSupabaseClient } from './db';
import { loginSchema } from './validation';
import { auditLog } from './audit';

// Password requirements
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const validation = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!validation.success) {
          throw new Error('Invalid email or password format');
        }

        const supabase = createServerSupabaseClient();

        // Get user
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email.toLowerCase())
          .is('deleted_at', null)
          .single();

        if (error || !user) {
          throw new Error('Invalid email or password');
        }

        // Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
          const remainingMinutes = Math.ceil(
            (new Date(user.locked_until).getTime() - Date.now()) / (1000 * 60)
          );
          throw new Error(`Account locked. Try again in ${remainingMinutes} minutes.`);
        }

        // Verify password
        if (!user.password_hash) {
          throw new Error('Please sign in with Google or reset your password');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isValid) {
          // Increment failed attempts
          const newAttempts = (user.failed_login_attempts || 0) + 1;
          const lockUntil =
            newAttempts >= MAX_LOGIN_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()
              : null;

          await supabase
            .from('users')
            .update({
              failed_login_attempts: newAttempts,
              locked_until: lockUntil,
            })
            .eq('id', user.id);

          if (lockUntil) {
            throw new Error(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`);
          }

          throw new Error('Invalid email or password');
        }

        // Check email verification
        if (!user.email_verified) {
          throw new Error('Please verify your email before signing in');
        }

        // Check 2FA if enabled
        if (user.two_factor_enabled) {
          if (!credentials.totpCode) {
            throw new Error('2FA_REQUIRED');
          }

          const isValidTotp = authenticator.verify({
            token: credentials.totpCode,
            secret: user.two_factor_secret!,
          });

          if (!isValidTotp) {
            throw new Error('Invalid 2FA code');
          }
        }

        // Reset failed attempts and update last login
        const ipAddress = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || null;

        await supabase
          .from('users')
          .update({
            failed_login_attempts: 0,
            locked_until: null,
            last_login_at: new Date().toISOString(),
            last_login_ip: ipAddress,
          })
          .eq('id', user.id);

        // Audit log
        await auditLog({
          userId: user.id,
          action: 'auth.login',
          resourceType: 'user',
          resourceId: user.id,
          ipAddress,
          userAgent: req?.headers?.['user-agent'] || null,
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.email_verified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        const supabase = createServerSupabaseClient();

        // Check if user exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, google_id')
          .eq('email', profile.email.toLowerCase())
          .single();

        if (existingUser && !existingUser.google_id) {
          // Link Google account to existing user
          await supabase
            .from('users')
            .update({
              google_id: account.providerAccountId,
              email_verified: new Date().toISOString(),
            })
            .eq('id', existingUser.id);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
        token.emailVerified = (user as any).emailVerified;
      }

      if (account?.provider === 'google') {
        const supabase = createServerSupabaseClient();
        const { data } = await supabase
          .from('users')
          .select('id, role')
          .eq('email', token.email!)
          .single();

        if (data) {
          token.id = data.id;
          token.role = data.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await auditLog({
          userId: token.id as string,
          action: 'auth.logout',
          resourceType: 'user',
          resourceId: token.id as string,
        });
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (!PASSWORD_REGEX.test(password)) {
    errors.push('Password must contain uppercase, lowercase, number, and special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// 2FA utilities
export function generateTOTPSecret(): { secret: string; otpauthUrl: string } {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri('user@potrzebny.ai', 'Potrzebny.AI', secret);

  return { secret, otpauthUrl };
}

export function verifyTOTP(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

// Session type augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: string;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    emailVerified?: Date | null;
  }
}
