import { NextRequest } from 'next/server';
import { resetPasswordSchema } from '@/lib/validation';
import { hashPassword, validatePassword } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/db';
import { rateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { auditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { hashToken } from '@/lib/encryption';
import {
  success,
  badRequest,
  notFound,
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

    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return badRequest('Validation failed', traceId, errors);
    }

    const { token, password } = validation.data;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return badRequest('Password requirements not met', traceId, {
        password: passwordValidation.errors,
      });
    }

    const tokenHash = hashToken(token);
    const supabase = createServerSupabaseClient();

    // Find the reset token
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .single();

    if (error || !resetToken) {
      return notFound('Invalid or expired reset token', traceId);
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return badRequest('Reset token has expired', traceId);
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('id', resetToken.user_id);

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id);

    // Invalidate all sessions for this user
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', resetToken.user_id);

    // Audit log
    await auditLog({
      userId: resetToken.user_id,
      action: AUDIT_ACTIONS.AUTH_PASSWORD_RESET,
      resourceType: 'user',
      resourceId: resetToken.user_id,
      req,
    });

    return success(
      { message: 'Password reset successfully. You can now sign in with your new password.' },
      200,
      traceId
    );
  } catch (error) {
    return handleError(error, traceId);
  }
}
