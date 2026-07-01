import { getUncachableStripeClient, getStripeWebhookSecret } from './stripeClient';
import { logger } from './lib/logger';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const webhookSecret = await getStripeWebhookSecret();
    if (!webhookSecret) {
      logger.warn('STRIPE_WEBHOOK_SECRET not set — skipping webhook signature verification');
      return;
    }

    const stripe = await getUncachableStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    logger.info({ type: event.type, id: event.id }, 'Stripe webhook received');

    // Handle specific events as needed — currently just acknowledge receipt
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        logger.info({ type: event.type }, 'Subscription event received');
        break;
      case 'checkout.session.completed':
        logger.info({ type: event.type }, 'Checkout session completed');
        break;
      case 'invoice.payment_succeeded':
        logger.info({ type: event.type }, 'Invoice payment succeeded');
        break;
      case 'invoice.payment_failed':
        logger.warn({ type: event.type }, 'Invoice payment failed');
        break;
      default:
        logger.info({ type: event.type }, 'Unhandled Stripe event type');
    }
  }
}
