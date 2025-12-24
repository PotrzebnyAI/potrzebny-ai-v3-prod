import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createApiResponse, createErrorResponse } from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';
import { getPlanById, calculateTrialEndDate } from '@/lib/subscription-plans';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const createSubscriptionSchema = z.object({
  planId: z.string().min(1),
  billingPeriod: z.enum(['monthly', 'yearly']),
  paymentMethodId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const traceId = crypto.randomUUID();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse('Nieautoryzowany dostęp', 401, traceId);
    }

    const rateLimitResult = await rateLimit(session.user.id, 10, 60000);
    if (!rateLimitResult.success) {
      return createErrorResponse('Zbyt wiele żądań. Spróbuj ponownie za chwilę.', 429, traceId);
    }

    const body = await request.json();
    const validationResult = createSubscriptionSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.errors[0].message, 400, traceId);
    }

    const { planId, billingPeriod, paymentMethodId } = validationResult.data;

    // Get the plan
    const plan = getPlanById(planId);
    if (!plan) {
      return createErrorResponse('Nie znaleziono planu subskrypcji', 404, traceId);
    }

    // Check if user already has an active subscription
    const existingSubscription = await db.query(
      `SELECT id, status, plan_id FROM subscriptions
       WHERE user_id = $1 AND status IN ('active', 'trialing')`,
      [session.user.id]
    );

    if (existingSubscription.rows.length > 0) {
      return createErrorResponse('Masz już aktywną subskrypcję. Anuluj ją najpierw, aby zmienić plan.', 400, traceId);
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const customerResult = await db.query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [session.user.id]
    );

    if (customerResult.rows[0]?.stripe_customer_id) {
      stripeCustomerId = customerResult.rows[0].stripe_customer_id;
    } else {
      // Create Stripe customer
      const userResult = await db.query(
        'SELECT email, name FROM users WHERE id = $1',
        [session.user.id]
      );

      const customer = await stripe.customers.create({
        email: userResult.rows[0].email,
        name: userResult.rows[0].name,
        metadata: {
          userId: session.user.id,
        },
      });

      stripeCustomerId = customer.id;

      await db.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [stripeCustomerId, session.user.id]
      );
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Get the correct price ID
    const priceId = billingPeriod === 'yearly'
      ? plan.stripePriceIdYearly
      : plan.stripePriceIdMonthly;

    // Create Stripe subscription with 3-day trial
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      trial_period_days: plan.trialDays,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        billingPeriod,
      },
    });

    // Calculate trial end date
    const trialEndDate = calculateTrialEndDate(plan.trialDays);
    const priceAmount = billingPeriod === 'yearly' ? plan.priceYearlyPln : plan.priceMonthlyPln;

    // Create subscription record in database
    const subscriptionId = crypto.randomUUID();
    await db.query(
      `INSERT INTO subscriptions (
        id, user_id, plan_id, stripe_subscription_id, stripe_customer_id,
        status, billing_period, price_pln, trial_start, trial_end,
        current_period_start, current_period_end, cancel_at_period_end,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
      [
        subscriptionId,
        session.user.id,
        plan.id,
        stripeSubscription.id,
        stripeCustomerId,
        'trialing',
        billingPeriod,
        priceAmount * 100, // Store in grosz (cents)
        new Date(),
        trialEndDate,
        new Date(),
        trialEndDate,
        false,
      ]
    );

    // Update user role based on plan category
    const roleMapping: Record<string, string> = {
      educational: 'student',
      patient: 'patient',
      doctor: 'doctor',
      therapist: 'therapist',
      parent: 'parent',
      admin: 'admin',
    };

    await db.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
      [roleMapping[plan.category] || 'user', session.user.id]
    );

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'subscription.created',
      resource: 'subscription',
      resourceId: subscriptionId,
      details: {
        planId: plan.id,
        planName: plan.namePl,
        billingPeriod,
        trialDays: plan.trialDays,
        priceAmount,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Get client secret for payment if needed
    const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

    return createApiResponse({
      subscriptionId,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      trialEnd: trialEndDate.toISOString(),
      clientSecret: paymentIntent?.client_secret || null,
      plan: {
        id: plan.id,
        name: plan.namePl,
        price: priceAmount,
        billingPeriod,
      },
      message: `Rozpoczęto ${plan.trialDays}-dniowy okres próbny. Po zakończeniu subskrypcja odnowi się automatycznie.`,
    }, traceId);
  } catch (error) {
    console.error('Error creating subscription:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return createErrorResponse(`Błąd płatności: ${error.message}`, 400, traceId);
    }

    return createErrorResponse('Wystąpił błąd podczas tworzenia subskrypcji', 500, traceId);
  }
}
