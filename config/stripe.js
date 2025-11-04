/**
 * Stripe configuration
 */
require('dotenv').config();

// Resolve a safe base URL for Stripe redirects
const resolvedBaseUrl = (
  process.env.FRONTEND_URL ||
  process.env.APP_URL ||
  process.env.SERVER_URL ||
  process.env.RAILWAY_PUBLIC_URL ||
  // Fallbacks for local and current production deployment
  'https://room-booking-system-uow-production.up.railway.app/api'
);

const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret',
  currency: 'aud',
  successUrl: `${resolvedBaseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${resolvedBaseUrl}/booking/cancel`
};

module.exports = stripeConfig;