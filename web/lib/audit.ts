import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from './db';
import * as Sentry from '@sentry/nextjs';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  req?: NextRequest;
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, unknown>;
}

/**
 * Create an audit log entry
 * Logs to database and Sentry for important events
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  const supabase = createServerSupabaseClient();

  // Extract IP and user agent from request if provided
  let ipAddress = entry.ipAddress;
  let userAgent = entry.userAgent;

  if (entry.req) {
    ipAddress =
      entry.req.headers.get('cf-connecting-ip') ||
      entry.req.headers.get('x-real-ip') ||
      entry.req.headers.get('x-forwarded-for')?.split(',')[0] ||
      null;
    userAgent = entry.req.headers.get('user-agent');
  }

  const logEntry = {
    user_id: entry.userId || null,
    action: entry.action,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId || null,
    old_values: entry.oldValues || null,
    new_values: entry.newValues || null,
    ip_address: ipAddress,
    user_agent: userAgent,
    severity: entry.severity || 'info',
    metadata: entry.metadata || {},
    request_id: crypto.randomUUID(),
  };

  try {
    const { error } = await supabase.from('audit_logs').insert(logEntry);

    if (error) {
      console.error('Failed to create audit log:', error);
      Sentry.captureException(error, {
        extra: { auditLog: logEntry },
      });
    }
  } catch (error) {
    console.error('Audit log error:', error);
    Sentry.captureException(error, {
      extra: { auditLog: logEntry },
    });
  }

  // Log to Sentry for important events
  if (
    entry.severity === 'warning' ||
    entry.severity === 'error' ||
    entry.severity === 'critical'
  ) {
    Sentry.addBreadcrumb({
      category: 'audit',
      message: entry.action,
      level: entry.severity === 'critical' ? 'fatal' : entry.severity,
      data: {
        userId: entry.userId,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
      },
    });
  }
}

/**
 * Pre-defined audit actions
 */
export const AUDIT_ACTIONS = {
  // Auth
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_REGISTER: 'auth.register',
  AUTH_PASSWORD_RESET_REQUEST: 'auth.password_reset_request',
  AUTH_PASSWORD_RESET: 'auth.password_reset',
  AUTH_PASSWORD_CHANGE: 'auth.password_change',
  AUTH_2FA_ENABLED: 'auth.2fa_enabled',
  AUTH_2FA_DISABLED: 'auth.2fa_disabled',
  AUTH_EMAIL_VERIFIED: 'auth.email_verified',
  AUTH_FAILED_LOGIN: 'auth.failed_login',
  AUTH_ACCOUNT_LOCKED: 'auth.account_locked',

  // User
  USER_PROFILE_UPDATED: 'user.profile_updated',
  USER_SETTINGS_UPDATED: 'user.settings_updated',
  USER_AVATAR_UPDATED: 'user.avatar_updated',
  USER_DELETED: 'user.deleted',

  // Subscription
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',

  // Payment
  PAYMENT_METHOD_ADDED: 'payment.method_added',
  PAYMENT_METHOD_REMOVED: 'payment.method_removed',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Content
  CONTENT_CREATED: 'content.created',
  CONTENT_UPDATED: 'content.updated',
  CONTENT_DELETED: 'content.deleted',
  CONTENT_PUBLISHED: 'content.published',
  CONTENT_UNPUBLISHED: 'content.unpublished',

  // Therapy Notes (GDPR sensitive)
  THERAPY_NOTE_CREATED: 'therapy_note.created',
  THERAPY_NOTE_VIEWED: 'therapy_note.viewed',
  THERAPY_NOTE_UPDATED: 'therapy_note.updated',
  THERAPY_NOTE_DELETED: 'therapy_note.deleted',
  THERAPY_NOTE_SHARED: 'therapy_note.shared',
  THERAPY_NOTE_EXPORTED: 'therapy_note.exported',

  // API Keys
  API_KEY_CREATED: 'api_key.created',
  API_KEY_REVOKED: 'api_key.revoked',
  API_KEY_USED: 'api_key.used',

  // Admin
  ADMIN_USER_UPDATED: 'admin.user_updated',
  ADMIN_USER_DELETED: 'admin.user_deleted',
  ADMIN_SUBSCRIPTION_MODIFIED: 'admin.subscription_modified',
  ADMIN_CONTENT_MODERATED: 'admin.content_moderated',
  ADMIN_SETTINGS_CHANGED: 'admin.settings_changed',

  // System
  SYSTEM_ERROR: 'system.error',
  SYSTEM_SECURITY_ALERT: 'system.security_alert',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const supabase = createServerSupabaseClient();
  const { limit = 50, offset = 0, action, startDate, endDate } = options;

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (action) {
    query = query.eq('action', action);
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get audit logs for a resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const supabase = createServerSupabaseClient();
  const { limit = 50, offset = 0 } = options;

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * GDPR data access request - log and retrieve all user data access
 */
export async function logDataAccessRequest(userId: string, requestorId: string) {
  await auditLog({
    userId: requestorId,
    action: 'gdpr.data_access_request',
    resourceType: 'user',
    resourceId: userId,
    severity: 'warning',
    metadata: {
      requestedAt: new Date().toISOString(),
      reason: 'GDPR Article 15 - Right of access',
    },
  });
}

/**
 * GDPR data deletion request - log data deletion
 */
export async function logDataDeletionRequest(userId: string, requestorId: string) {
  await auditLog({
    userId: requestorId,
    action: 'gdpr.data_deletion_request',
    resourceType: 'user',
    resourceId: userId,
    severity: 'critical',
    metadata: {
      requestedAt: new Date().toISOString(),
      reason: 'GDPR Article 17 - Right to erasure',
    },
  });
}
