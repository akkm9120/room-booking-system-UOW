/**
 * Stripe configuration
 */
require('dotenv').config();

const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret',
  currency: 'aud',
  successUrl: process.env.FRONTEND_URL + '/booking/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: process.env.FRONTEND_URL + '/booking/cancel'
};

module.exports = stripeConfig;