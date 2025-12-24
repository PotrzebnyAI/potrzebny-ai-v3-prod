import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, handleWebhookEvent } from '@/lib/payments';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    Sentry.captureException(err, { extra: { signature } });
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  try {
    await handleWebhookEvent(event);
  } catch (err) {
    console.error('Webhook handler error:', err);
    Sentry.captureException(err, { extra: { eventType: event.type } });
    // Return 200 to acknowledge receipt even if processing failed
    // Stripe will retry on 5xx errors
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing for webhook
export const dynamic = 'force-dynamic';
