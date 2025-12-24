import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/db';
import { hashToken } from '@/lib/encryption';
import { auditLog, AUDIT_ACTIONS } from '@/lib/audit';
import {
  success,
  badRequest,
  notFound,
  handleError,
  generateTraceId,
} from '@/lib/api-response';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const body = await req.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return badRequest('Invalid token', traceId);
    }

    const { token } = validation.data;
    const tokenHash = hashToken(token);

    const supabase = createServerSupabaseClient();

    // Find the verification token
    const { data: verificationToken, error } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('verified_at', null)
      .single();

    if (error || !verificationToken) {
      return notFound('Invalid or expired verification token', traceId);
    }

    // Check if token is expired
    if (new Date(verificationToken.expires_at) < new Date()) {
      return badRequest('Verification token has expired', traceId);
    }

    // Update user email_verified
    await supabase
      .from('users')
      .update({ email_verified: new Date().toISOString() })
      .eq('id', verificationToken.user_id);

    // Mark token as used
    await supabase
      .from('email_verification_tokens')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verificationToken.id);

    // Audit log
    await auditLog({
      userId: verificationToken.user_id,
      action: AUDIT_ACTIONS.AUTH_EMAIL_VERIFIED,
      resourceType: 'user',
      resourceId: verificationToken.user_id,
      req,
    });

    return success(
      { message: 'Email verified successfully. You can now sign in.' },
      200,
      traceId
    );
  } catch (error) {
    return handleError(error, traceId);
  }
}
