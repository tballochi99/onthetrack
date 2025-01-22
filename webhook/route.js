import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        const { userId, cartItems } = session.metadata;
        const parsedCartItems = JSON.parse(cartItems);


        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error in webhook:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  return NextResponse.json({ message: 'Webhook endpoint is working' });
}