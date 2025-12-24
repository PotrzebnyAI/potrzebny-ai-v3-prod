import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/db';
import { updateProfileSchema } from '@/lib/validation';
import { auditLog, AUDIT_ACTIONS } from '@/lib/audit';
import {
  success,
  unauthorized,
  notFound,
  handleError,
  generateTraceId,
} from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return unauthorized(traceId);
    }

    const supabase = createServerSupabaseClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        users!inner(id, email, role, email_verified, two_factor_enabled, created_at)
      `)
      .eq('user_id', session.user.id)
      .single();

    if (error || !profile) {
      return notFound('Profile not found', traceId);
    }

    return success(
      {
        id: profile.id,
        userId: profile.user_id,
        email: profile.users.email,
        role: profile.users.role,
        emailVerified: profile.users.email_verified,
        twoFactorEnabled: profile.users.two_factor_enabled,
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        phone: profile.phone,
        language: profile.language,
        timezone: profile.timezone,
        bio: profile.bio,
        website: profile.website,
        socialLinks: profile.social_links,
        notificationPreferences: profile.notification_preferences,
        onboardingCompleted: profile.onboarding_completed,
        createdAt: profile.users.created_at,
      },
      200,
      traceId
    );
  } catch (error) {
    return handleError(error, traceId);
  }
}

export async function PUT(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return unauthorized(traceId);
    }

    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return success(null, 400, traceId);
    }

    const updateData = validation.data;
    const supabase = createServerSupabaseClient();

    // Get old values for audit log
    const { data: oldProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    // Build update object with snake_case keys
    const dbUpdateData: Record<string, unknown> = {};
    if (updateData.firstName !== undefined) dbUpdateData.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) dbUpdateData.last_name = updateData.lastName;
    if (updateData.displayName !== undefined) dbUpdateData.display_name = updateData.displayName;
    if (updateData.phone !== undefined) dbUpdateData.phone = updateData.phone;
    if (updateData.language !== undefined) dbUpdateData.language = updateData.language;
    if (updateData.timezone !== undefined) dbUpdateData.timezone = updateData.timezone;
    if (updateData.bio !== undefined) dbUpdateData.bio = updateData.bio;
    if (updateData.website !== undefined) dbUpdateData.website = updateData.website;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(dbUpdateData)
      .eq('user_id', session.user.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.USER_PROFILE_UPDATED,
      resourceType: 'profile',
      resourceId: profile.id,
      oldValues: oldProfile,
      newValues: dbUpdateData,
      req,
    });

    return success(profile, 200, traceId);
  } catch (error) {
    return handleError(error, traceId);
  }
}
