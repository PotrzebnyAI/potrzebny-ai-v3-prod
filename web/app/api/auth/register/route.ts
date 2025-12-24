import { NextRequest } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { hashPassword, validatePassword } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/db';
import { rateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { auditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email';
import { generateSecureToken, hashToken } from '@/lib/encryption';
import {
  success,
  created,
  badRequest,
  conflict,
  rateLimited,
  handleError,
  generateTraceId,
} from '@/lib/api-response';

export async function POST(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, RATE_LIMIT_CONFIGS.auth);
    if (!rateLimitResult.success) {
      return rateLimited(rateLimitResult.resetAt, traceId);
    }

    // Parse and validate body
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return badRequest('Validation failed', traceId, errors);
    }

    const { email, password, firstName, lastName } = validation.data;

    // Additional password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return badRequest('Password requirements not met', traceId, {
        password: passwordValidation.errors,
      });
    }

    const supabase = createServerSupabaseClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return conflict('Email already registered', traceId);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'user',
      })
      .select('id, email')
      .single();

    if (userError || !user) {
      throw new Error('Failed to create user');
    }

    // Create profile
    await supabase.from('profiles').insert({
      user_id: user.id,
      first_name: firstName || null,
      last_name: lastName || null,
      display_name: firstName && lastName ? `${firstName} ${lastName}` : null,
    });

    // Create gamification data
    await supabase.from('gamification_data').insert({
      user_id: user.id,
      total_xp: 0,
      current_level: 1,
    });

    // Generate verification token
    const verificationToken = generateSecureToken(32);
    const tokenHash = hashToken(verificationToken);

    await supabase.from('email_verification_tokens').insert({
      user_id: user.id,
      email,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, firstName);

    // Send welcome email
    await sendWelcomeEmail(email, firstName || 'Użytkownik');

    // Audit log
    await auditLog({
      userId: user.id,
      action: AUDIT_ACTIONS.AUTH_REGISTER,
      resourceType: 'user',
      resourceId: user.id,
      req,
    });

    return created(
      {
        id: user.id,
        email: user.email,
        message: 'Registration successful. Please check your email to verify your account.',
      },
      traceId
    );
  } catch (error) {
    return handleError(error, traceId);
  }
}
