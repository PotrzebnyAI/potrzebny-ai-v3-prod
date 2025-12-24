import Stripe from 'stripe';
import { createServerSupabaseClient } from './db';
import { auditLog, AUDIT_ACTIONS } from './audit';
import { sendSubscriptionEmail, sendPaymentFailedEmail } from './email';
import * as Sentry from '@sentry/nextjs';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  // Educational Panel
  EDUCATIONAL_BASIC: {
    id: 'educational_basic',
    name: 'Educational Basic',
    panelType: 'educational',
    priceMonthly: 2900, // 29 PLN in grosze
    priceYearly: 29000, // 290 PLN (2 months free)
    stripePriceIdMonthly: 'price_educational_basic_monthly',
    stripePriceIdYearly: 'price_educational_basic_yearly',
    features: ['Dostęp do kursów', 'Fiszki AI', 'Quizy', 'Śledzenie postępów'],
  },
  EDUCATIONAL_PRO: {
    id: 'educational_pro',
    name: 'Educational Pro',
    panelType: 'educational',
    priceMonthly: 4900,
    priceYearly: 49000,
    stripePriceIdMonthly: 'price_educational_pro_monthly',
    stripePriceIdYearly: 'price_educational_pro_yearly',
    features: ['Wszystko z Basic', 'Certyfikaty', 'Konsultacje', 'Priorytetowe wsparcie'],
  },
  EDUCATIONAL_PREMIUM: {
    id: 'educational_premium',
    name: 'Educational Premium',
    panelType: 'educational',
    priceMonthly: 7900,
    priceYearly: 79000,
    stripePriceIdMonthly: 'price_educational_premium_monthly',
    stripePriceIdYearly: 'price_educational_premium_yearly',
    features: ['Wszystko z Pro', 'Materiały premium', 'Mentoring', 'Dostęp VIP'],
  },

  // Patient Panel
  PATIENT_STANDARD: {
    id: 'patient_standard',
    name: 'Patient Standard',
    panelType: 'patient',
    priceMonthly: 4900,
    priceYearly: 49000,
    stripePriceIdMonthly: 'price_patient_standard_monthly',
    stripePriceIdYearly: 'price_patient_standard_yearly',
    features: ['Notatki terapeutyczne', 'Śledzenie nastroju', 'Przypomnienia'],
  },
  PATIENT_PREMIUM: {
    id: 'patient_premium',
    name: 'Patient Premium',
    panelType: 'patient',
    priceMonthly: 7900,
    priceYearly: 79000,
    stripePriceIdMonthly: 'price_patient_premium_monthly',
    stripePriceIdYearly: 'price_patient_premium_yearly',
    features: ['Wszystko ze Standard', 'Analityka zaawansowana', 'Eksport danych'],
  },

  // Doctor Panel
  DOCTOR_RESEARCH: {
    id: 'doctor_research',
    name: 'Doctor Research',
    panelType: 'doctor',
    priceMonthly: 7900,
    priceYearly: 79000,
    stripePriceIdMonthly: 'price_doctor_research_monthly',
    stripePriceIdYearly: 'price_doctor_research_yearly',
    features: ['Dostęp do baz badań', 'Narzędzia analizy', 'Cytowania'],
  },
  DOCTOR_ENTERPRISE: {
    id: 'doctor_enterprise',
    name: 'Doctor Enterprise',
    panelType: 'doctor',
    priceMonthly: 79900,
    priceYearly: 799000,
    stripePriceIdMonthly: 'price_doctor_enterprise_monthly',
    stripePriceIdYearly: 'price_doctor_enterprise_yearly',
    features: ['Wszystko z Research', 'API dostęp', 'Dedykowane wsparcie'],
  },

  // Super Mózg Add-on
  SUPER_MOZG: {
    id: 'super_mozg',
    name: 'Super Mózg',
    panelType: 'super-mozg',
    priceMonthly: 7900,
    priceYearly: 79000,
    stripePriceIdMonthly: 'price_super_mozg_monthly',
    stripePriceIdYearly: 'price_super_mozg_yearly',
    features: ['Metryki kognitywne', 'Sen & dieta', 'Brain games'],
  },

  // Parent Panel
  PARENT_PREMIUM: {
    id: 'parent_premium',
    name: 'Parent Premium',
    panelType: 'parent-premium',
    priceMonthly: 4900,
    priceYearly: 49000,
    stripePriceIdMonthly: 'price_parent_premium_monthly',
    stripePriceIdYearly: 'price_parent_premium_yearly',
    features: ['Raporty zaawansowane', 'Alerty', 'Konsultacje z ekspertami'],
  },

  // Therapist Training
  THERAPIST_29: {
    id: 'therapist_29',
    name: 'Therapist Training Basic',
    panelType: 'therapist-training-29',
    priceMonthly: 2900,
    priceYearly: 29000,
    stripePriceIdMonthly: 'price_therapist_29_monthly',
    stripePriceIdYearly: 'price_therapist_29_yearly',
    features: ['Techniki terapii', 'Superwizja', 'Szablony'],
  },
  THERAPIST_79: {
    id: 'therapist_79',
    name: 'Therapist Training Pro',
    panelType: 'therapist-training-79',
    priceMonthly: 7900,
    priceYearly: 79000,
    stripePriceIdMonthly: 'price_therapist_79_monthly',
    stripePriceIdYearly: 'price_therapist_79_yearly',
    features: ['Wszystko z Basic', 'Moduły zaawansowane', 'Certyfikacja'],
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Create or get Stripe customer for user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const supabase = createServerSupabaseClient();

  // Check if customer already exists
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .not('stripe_customer_id', 'is', null)
    .limit(1)
    .single();

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Create a subscription with 3-day trial
 */
export async function createSubscription(
  userId: string,
  planId: PlanId,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  paymentMethodId?: string
): Promise<Stripe.Subscription> {
  const supabase = createServerSupabaseClient();
  const plan = SUBSCRIPTION_PLANS[planId];

  // Get user info
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('user_id', userId)
    .single();

  const customerName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : undefined;

  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(userId, user.email, customerName);

  // Attach payment method if provided
  if (paymentMethodId) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  // Get the correct price ID
  const priceId =
    billingCycle === 'monthly'
      ? plan.stripePriceIdMonthly
      : plan.stripePriceIdYearly;

  // Create subscription with 3-day trial
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: 3,
    payment_behavior: 'default_incomplete',
    trial_settings: {
      end_behavior: {
        missing_payment_method: 'pause',
      },
    },
    metadata: {
      userId,
      planId,
      panelType: plan.panelType,
    },
    expand: ['latest_invoice.payment_intent'],
  });

  // Save to database
  const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

  await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_id: planId,
    panel_type: plan.panelType,
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    price_pln: price,
    billing_cycle: billingCycle,
  });

  // Audit log
  await auditLog({
    userId,
    action: AUDIT_ACTIONS.SUBSCRIPTION_CREATED,
    resourceType: 'subscription',
    resourceId: subscription.id,
    newValues: { planId, billingCycle, price },
  });

  return subscription;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<Stripe.Subscription> {
  const supabase = createServerSupabaseClient();

  // Get subscription from database
  const { data: dbSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!dbSubscription) {
    throw new Error('Subscription not found');
  }

  let subscription: Stripe.Subscription;

  if (cancelImmediately) {
    subscription = await stripe.subscriptions.cancel(subscriptionId);
  } else {
    subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  // Update database
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  // Audit log
  await auditLog({
    userId: dbSubscription.user_id,
    action: AUDIT_ACTIONS.SUBSCRIPTION_CANCELED,
    resourceType: 'subscription',
    resourceId: subscriptionId,
    newValues: { cancelImmediately },
  });

  return subscription;
}

/**
 * Update subscription (change plan)
 */
export async function updateSubscription(
  subscriptionId: string,
  newPlanId: PlanId,
  billingCycle: 'monthly' | 'yearly'
): Promise<Stripe.Subscription> {
  const plan = SUBSCRIPTION_PLANS[newPlanId];
  const priceId =
    billingCycle === 'monthly'
      ? plan.stripePriceIdMonthly
      : plan.stripePriceIdYearly;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
    metadata: {
      ...subscription.metadata,
      planId: newPlanId,
      panelType: plan.panelType,
    },
  });

  const supabase = createServerSupabaseClient();

  await supabase
    .from('subscriptions')
    .update({
      plan_id: newPlanId,
      panel_type: plan.panelType,
      price_pln: billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly,
      billing_cycle: billingCycle,
    })
    .eq('stripe_subscription_id', subscriptionId);

  return updatedSubscription;
}

/**
 * Add a payment method
 */
export async function addPaymentMethod(
  userId: string,
  paymentMethodId: string,
  setAsDefault: boolean = false
): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const customerId = await getOrCreateStripeCustomer(userId, user.email);

  // Attach payment method
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  // Set as default if requested
  if (setAsDefault) {
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  // Save to database
  const card = paymentMethod.card;

  await supabase.from('payment_methods').insert({
    user_id: userId,
    type: paymentMethod.type,
    provider: 'stripe',
    stripe_payment_method_id: paymentMethodId,
    last_four: card?.last4,
    brand: card?.brand,
    exp_month: card?.exp_month,
    exp_year: card?.exp_year,
    is_default: setAsDefault,
  });

  await auditLog({
    userId,
    action: AUDIT_ACTIONS.PAYMENT_METHOD_ADDED,
    resourceType: 'payment_method',
    resourceId: paymentMethodId,
  });
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<void> {
  await stripe.paymentMethods.detach(paymentMethodId);

  const supabase = createServerSupabaseClient();

  await supabase
    .from('payment_methods')
    .delete()
    .eq('stripe_payment_method_id', paymentMethodId)
    .eq('user_id', userId);

  await auditLog({
    userId,
    action: AUDIT_ACTIONS.PAYMENT_METHOD_REMOVED,
    resourceType: 'payment_method',
    resourceId: paymentMethodId,
  });
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  const supabase = createServerSupabaseClient();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;

      if (!userId) {
        Sentry.captureMessage('Subscription without userId', { extra: { subscriptionId: subscription.id } });
        return;
      }

      await supabase
        .from('subscriptions')
        .upsert({
          stripe_subscription_id: subscription.id,
          user_id: userId,
          plan_id: subscription.metadata.planId || 'unknown',
          panel_type: subscription.metadata.panelType || 'educational',
          status: subscription.status,
          stripe_customer_id: subscription.customer as string,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
          price_pln: 0, // Will be updated from metadata
          billing_cycle: 'monthly',
        }, {
          onConflict: 'stripe_subscription_id',
        });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (!subscriptionId) return;

      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('stripe_subscription_id', subscriptionId);

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: invoice.metadata?.userId || null,
        type: 'subscription',
        amount: invoice.amount_paid,
        currency: invoice.currency.toUpperCase(),
        status: 'completed',
        stripe_payment_intent_id: invoice.payment_intent as string,
        stripe_invoice_id: invoice.id,
        description: `Subscription payment for ${invoice.lines.data[0]?.description || 'plan'}`,
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (!subscriptionId) return;

      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', subscriptionId);

      // Get user to send notification
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (subscription?.user_id) {
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', subscription.user_id)
          .single();

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', subscription.user_id)
          .single();

        if (user) {
          await sendPaymentFailedEmail(user.email, profile?.first_name || 'Użytkownik');
        }

        await auditLog({
          userId: subscription.user_id,
          action: AUDIT_ACTIONS.PAYMENT_FAILED,
          resourceType: 'subscription',
          resourceId: subscriptionId,
          severity: 'warning',
        });
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      Sentry.addBreadcrumb({
        category: 'payment',
        message: 'Payment succeeded',
        level: 'info',
        data: { paymentIntentId: paymentIntent.id },
      });
      break;
    }

    default:
      // Unhandled event type
      break;
  }
}

/**
 * Create a Stripe Checkout Session for one-time purchase
 */
export async function createCheckoutSession(
  userId: string,
  planId: PlanId,
  billingCycle: 'monthly' | 'yearly',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const supabase = createServerSupabaseClient();
  const plan = SUBSCRIPTION_PLANS[planId];

  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const customerId = await getOrCreateStripeCustomer(userId, user.email);
  const priceId =
    billingCycle === 'monthly'
      ? plan.stripePriceIdMonthly
      : plan.stripePriceIdYearly;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card', 'p24', 'blik'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: 3,
      metadata: {
        userId,
        planId,
        panelType: plan.panelType,
      },
    },
    metadata: {
      userId,
      planId,
    },
  });

  return session;
}

/**
 * Get customer's invoices
 */
export async function getInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

/**
 * Get user's active subscriptions
 */
export async function getActiveSubscriptions(userId: string) {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false });

  return data || [];
}
