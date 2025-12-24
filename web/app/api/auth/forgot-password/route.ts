import { NextRequest } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validation';
import { createServerSupabaseClient } from '@/lib/db';
import { rateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { auditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateSecureToken, hashToken } from '@/lib/encryption';
import {
  success,
  badRequest,
  rateLimited,
  handleError,
  generateTraceId,
} from '@/lib/api-response';

export async function POST(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    // Strict rate limiting for password reset
    const rateLimitResult = await rateLimit(req, RATE_LIMIT_CONFIGS.auth);
    if (!rateLimitResult.success) {
      return rateLimited(rateLimitResult.resetAt, traceId);
    }

    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return badRequest('Invalid email', traceId);
    }

    const { email } = validation.data;
    const supabase = createServerSupabaseClient();

    // Find user by email
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    // Always return success to prevent email enumeration
    const successMessage = 'If an account exists with this email, a password reset link will be sent.';

    if (!user) {
      return success({ message: successMessage }, 200, traceId);
    }

    // Generate reset token
    const resetToken = generateSecureToken(32);
    const tokenHash = hashToken(resetToken);

    // Invalidate any existing tokens
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('used_at', null);

    // Create new token
    await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    });

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    // Audit log
    await auditLog({
      userId: user.id,
      action: AUDIT_ACTIONS.AUTH_PASSWORD_RESET_REQUEST,
      resourceType: 'user',
      resourceId: user.id,
      req,
    });

    return success({ message: successMessage }, 200, traceId);
  } catch (error) {
    return handleError(error, traceId);
  }
}
