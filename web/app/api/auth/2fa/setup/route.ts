import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, generateTOTPSecret } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/db';
import QRCode from 'qrcode';
import {
  success,
  unauthorized,
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

    const supabase = createServerSupabaseClient();

    // Check if 2FA is already enabled
    const { data: user } = await supabase
      .from('users')
      .select('two_factor_enabled, email')
      .eq('id', session.user.id)
      .single();

    if (user?.two_factor_enabled) {
      return success(
        { message: '2FA is already enabled for this account' },
        200,
        traceId
      );
    }

    // Generate TOTP secret
    const { secret, otpauthUrl } = generateTOTPSecret();

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(
      otpauthUrl.replace('user@potrzebny.ai', user?.email || '')
    );

    // Store secret temporarily (not enabled yet)
    await supabase
      .from('users')
      .update({ two_factor_secret: secret })
      .eq('id', session.user.id);

    return success(
      {
        secret,
        qrCode: qrCodeDataUrl,
        message: 'Scan the QR code with your authenticator app, then verify with a code.',
      },
      200,
      traceId
    );
  } catch (error) {
    return handleError(error, traceId);
  }
}
