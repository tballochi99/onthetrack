import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import User from '../../../../db/models/User';
import Purchase from '../../../../db/models/Purchase';
import Cart from '../../../../db/models/Cart';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const sig = headers().get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        if (session.mode === 'subscription') {
          await User.findByIdAndUpdate(session.metadata.userId, {
            role: 'pro',
            subscriptionId: session.subscription,
            subscriptionStatus: 'active'
          });
        } 
        else if (session.mode === 'payment') {
          const cartData = JSON.parse(session.metadata.cartData);
          if (cartData && cartData.items) {
            const userId = new mongoose.Types.ObjectId(session.metadata.userId);
            await Purchase.create({
              userId,
              sessionId: session.id,
              items: cartData.items.map(item => ({
                compositionId: new mongoose.Types.ObjectId(item.compositionId),
                title: item.title,
                artist: item.artist,
                licenseName: item.licenseName,
                licensePrice: item.licensePrice,
                coverImage: item.coverImage,
                file: item.file
              })),
              totalAmount: session.amount_total / 100
            });
            await Cart.deleteOne({ userId });
          }
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await User.findOneAndUpdate(
          { subscriptionId: subscription.id },
          {
            role: 'free',
            subscriptionStatus: 'cancelled'
          }
        );
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}