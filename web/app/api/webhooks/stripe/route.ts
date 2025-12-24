import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const traceId = crypto.randomUUID();

  try {
    switch (event.type) {
      // === SUBSCRIPTION EVENTS ===
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[${traceId}] Subscription created: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        await db.query(
          `UPDATE subscriptions SET
            status = $1,
            current_period_start = $2,
            current_period_end = $3,
            cancel_at_period_end = $4,
            updated_at = NOW()
           WHERE stripe_subscription_id = $5`,
          [
            subscription.status,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
            subscription.cancel_at_period_end,
            subscription.id,
          ]
        );

        console.log(`[${traceId}] Subscription updated: ${subscription.id} -> ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await db.query(
          `UPDATE subscriptions SET
            status = 'canceled',
            canceled_at = NOW(),
            updated_at = NOW()
           WHERE stripe_subscription_id = $1`,
          [subscription.id]
        );

        // Get user ID and update role
        const subResult = await db.query(
          'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
          [subscription.id]
        );

        if (subResult.rows[0]) {
          await db.query(
            `UPDATE users SET role = 'user', updated_at = NOW() WHERE id = $1`,
            [subResult.rows[0].user_id]
          );

          await createAuditLog({
            userId: subResult.rows[0].user_id,
            action: 'subscription.canceled',
            resource: 'subscription',
            resourceId: subscription.id,
            details: { reason: 'stripe_webhook' },
            ipAddress: 'stripe_webhook',
          });
        }

        console.log(`[${traceId}] Subscription canceled: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        // Trial ending in 3 days - send notification
        const subscription = event.data.object as Stripe.Subscription;

        const subResult = await db.query(
          'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
          [subscription.id]
        );

        if (subResult.rows[0]) {
          // Create notification for user
          await db.query(
            `INSERT INTO notifications (id, user_id, type, title, message, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              crypto.randomUUID(),
              subResult.rows[0].user_id,
              'trial_ending',
              'Twój okres próbny kończy się wkrótce',
              'Za 3 dni Twój bezpłatny okres próbny dobiegnie końca. Po tym czasie subskrypcja odnowi się automatycznie.',
            ]
          );
        }

        console.log(`[${traceId}] Trial will end: ${subscription.id}`);
        break;
      }

      // === INVOICE EVENTS ===
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          // Update subscription status to active after successful payment
          await db.query(
            `UPDATE subscriptions SET
              status = 'active',
              updated_at = NOW()
             WHERE stripe_subscription_id = $1`,
            [invoice.subscription]
          );

          // Record transaction
          await db.query(
            `INSERT INTO transactions (
              id, user_id, subscription_id, stripe_invoice_id, stripe_payment_intent_id,
              amount_pln, currency, status, description, created_at
            )
            SELECT
              $1, s.user_id, s.id, $2, $3, $4, $5, $6, $7, NOW()
            FROM subscriptions s
            WHERE s.stripe_subscription_id = $8`,
            [
              crypto.randomUUID(),
              invoice.id,
              invoice.payment_intent,
              invoice.amount_paid,
              invoice.currency.toUpperCase(),
              'completed',
              `Płatność za subskrypcję - ${invoice.lines.data[0]?.description || 'Potrzebny.AI'}`,
              invoice.subscription,
            ]
          );
        }

        console.log(`[${traceId}] Invoice paid: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          await db.query(
            `UPDATE subscriptions SET
              status = 'past_due',
              updated_at = NOW()
             WHERE stripe_subscription_id = $1`,
            [invoice.subscription]
          );

          // Notify user about failed payment
          const subResult = await db.query(
            'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
            [invoice.subscription]
          );

          if (subResult.rows[0]) {
            await db.query(
              `INSERT INTO notifications (id, user_id, type, title, message, created_at)
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [
                crypto.randomUUID(),
                subResult.rows[0].user_id,
                'payment_failed',
                'Płatność nie powiodła się',
                'Nie udało się pobrać płatności za Twoją subskrypcję. Zaktualizuj metodę płatności, aby uniknąć przerwania usługi.',
              ]
            );
          }
        }

        console.log(`[${traceId}] Invoice payment failed: ${invoice.id}`);
        break;
      }

      // === CHECKOUT EVENTS ===
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        console.log(`[${traceId}] Checkout completed: ${checkoutSession.id}`);
        break;
      }

      // === PAYMENT METHOD EVENTS ===
      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log(`[${traceId}] Payment method attached: ${paymentMethod.id}`);
        break;
      }

      default:
        console.log(`[${traceId}] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, traceId });
  } catch (error) {
    console.error(`[${traceId}] Webhook error:`, error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
};
