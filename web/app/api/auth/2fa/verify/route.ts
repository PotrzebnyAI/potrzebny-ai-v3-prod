import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, verifyTOTP } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/db';
import { twoFactorVerifySchema } from '@/lib/validation';
import { auditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { send2FAEnabledEmail } from '@/lib/email';
import {
  success,
  unauthorized,
  badRequest,
  handleError,
  generateTraceId,
} from '@/lib/api-response';

export async function POST(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return unauthorized(traceId);
    }

    const body = await req.json();
    const validation = twoFactorVerifySchema.safeParse(body);

    if (!validation.success) {
      return badRequest('Invalid code format', traceId);
    }

    const { code } = validation.data;
    const supabase = createServerSupabaseClient();

    // Get user's secret
    const { data: user } = await supabase
      .from('users')
      .select('two_factor_secret, email')
      .eq('id', session.user.id)
      .single();

    if (!user?.two_factor_secret) {
      return badRequest('2FA setup not started. Please generate a new QR code.', traceId);
    }

    // Verify the code
    const isValid = verifyTOTP(code, user.two_factor_secret);

    if (!isValid) {
      return badRequest('Invalid verification code', traceId);
    }

    // Enable 2FA
    await supabase
      .from('users')
      .update({ two_factor_enabled: true })
      .eq('id', session.user.id);

    // Get profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('user_id', session.user.id)
      .single();

    // Send confirmation email
    await send2FAEnabledEmail(user.email, profile?.first_name || 'Użytkownik');

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.AUTH_2FA_ENABLED,
      resourceType: 'user',
      resourceId: session.user.id,
      req,
    });

    return success(
      { message: 'Two-factor authentication enabled successfully' },
      200,
      traceId
    );
  } catch (error) {
    return handleError(error, traceId);
  }
}
