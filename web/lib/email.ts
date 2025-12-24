import { Resend } from 'resend';
import { createServerSupabaseClient } from './db';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@potrzebny.ai';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Potrzebny.AI';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface TemplateEmailOptions {
  to: string | string[];
  templateName: string;
  variables: Record<string, string>;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send an email using a template from the database
 */
export async function sendTemplateEmail(options: TemplateEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createServerSupabaseClient();

  // Get template from database
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('name', options.templateName)
    .eq('is_active', true)
    .single();

  if (templateError || !template) {
    console.error('Template not found:', options.templateName);
    return { success: false, error: `Template "${options.templateName}" not found` };
  }

  // Replace variables in subject and body
  let subject = template.subject;
  let bodyHtml = template.body_html;
  let bodyText = template.body_text;

  for (const [key, value] of Object.entries(options.variables)) {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    bodyHtml = bodyHtml.replace(new RegExp(placeholder, 'g'), value);
    bodyText = bodyText.replace(new RegExp(placeholder, 'g'), value);
  }

  return sendEmail({
    to: options.to,
    subject,
    html: bodyHtml,
    text: bodyText,
    replyTo: options.replyTo,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  await sendTemplateEmail({
    to: email,
    templateName: 'welcome',
    variables: {
      first_name: firstName || 'Użytkownik',
      login_url: `${process.env.NEXTAUTH_URL}/login`,
    },
  });
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(email: string, token: string, firstName?: string): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  await sendTemplateEmail({
    to: email,
    templateName: 'email_verification',
    variables: {
      first_name: firstName || 'Użytkownik',
      verification_url: verificationUrl,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await sendTemplateEmail({
    to: email,
    templateName: 'password_reset',
    variables: {
      reset_url: resetUrl,
    },
  });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionEmail(
  email: string,
  firstName: string,
  planName: string,
  amount: number,
  billingCycle: string,
  nextBillingDate: string
): Promise<void> {
  await sendTemplateEmail({
    to: email,
    templateName: 'subscription_created',
    variables: {
      first_name: firstName,
      plan_name: planName,
      amount: `${(amount / 100).toFixed(2)}`,
      billing_cycle: billingCycle === 'monthly' ? 'miesięcznie' : 'rocznie',
      next_billing_date: nextBillingDate,
    },
  });
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail(email: string, firstName: string): Promise<void> {
  await sendTemplateEmail({
    to: email,
    templateName: 'payment_failed',
    variables: {
      first_name: firstName,
      billing_url: `${process.env.NEXTAUTH_URL}/billing`,
    },
  });
}

/**
 * Send 2FA enabled notification
 */
export async function send2FAEnabledEmail(email: string, firstName: string): Promise<void> {
  await sendTemplateEmail({
    to: email,
    templateName: 'two_factor_enabled',
    variables: {
      first_name: firstName,
    },
  });
}

/**
 * Send login alert
 */
export async function sendLoginAlertEmail(
  email: string,
  firstName: string,
  loginTime: string,
  ipAddress: string,
  device: string
): Promise<void> {
  await sendTemplateEmail({
    to: email,
    templateName: 'login_alert',
    variables: {
      first_name: firstName,
      login_time: loginTime,
      ip_address: ipAddress,
      device: device,
    },
  });
}

/**
 * Send magic link for passwordless login
 */
export async function sendMagicLinkEmail(email: string, token: string): Promise<void> {
  const magicLinkUrl = `${process.env.NEXTAUTH_URL}/api/auth/magic-link/verify?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Zaloguj się do Potrzebny.AI',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1 style="color: #0ea5e9;">Zaloguj się do Potrzebny.AI</h1>
          <p>Kliknij poniższy przycisk aby się zalogować:</p>
          <a href="${magicLinkUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Zaloguj się
          </a>
          <p style="color: #666; font-size: 14px;">
            Link wygaśnie za 15 minut.<br>
            Jeśli nie prosiłeś o ten link, zignoruj tę wiadomość.
          </p>
        </body>
      </html>
    `,
    text: `Zaloguj się do Potrzebny.AI\n\nKliknij poniższy link aby się zalogować:\n${magicLinkUrl}\n\nLink wygaśnie za 15 minut.`,
  });
}

/**
 * Send trial ending reminder
 */
export async function sendTrialEndingEmail(
  email: string,
  firstName: string,
  daysRemaining: number,
  planName: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Twój okres próbny kończy się za ${daysRemaining} dni - Potrzebny.AI`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1 style="color: #0ea5e9;">Twój okres próbny kończy się wkrótce</h1>
          <p>Cześć ${firstName},</p>
          <p>Twój okres próbny planu <strong>${planName}</strong> kończy się za <strong>${daysRemaining} dni</strong>.</p>
          <p>Aby kontynuować korzystanie z pełnych funkcji, dodaj metodę płatności:</p>
          <a href="${process.env.NEXTAUTH_URL}/billing"
             style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Zarządzaj subskrypcją
          </a>
        </body>
      </html>
    `,
    text: `Cześć ${firstName},\n\nTwój okres próbny planu ${planName} kończy się za ${daysRemaining} dni.\n\nDodaj metodę płatności: ${process.env.NEXTAUTH_URL}/billing`,
  });
}
