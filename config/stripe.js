/**
 * Stripe configuration
 */
require('dotenv').config();

// Resolve base URL for Stripe redirects, prioritizing FRONTEND_URL per requirement
const frontendUrl = process.env.FRONTEND_URL;
const fallbackUrl = (
  process.env.RAILWAY_PUBLIC_URL ||
  process.env.APP_URL ||
  process.env.SERVER_URL ||
  'http://localhost:3000'
);
const resolvedBaseUrl = frontendUrl || fallbackUrl;

const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret',
  currency: 'aud',
  successUrl: `${resolvedBaseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${resolvedBaseUrl}/booking/cancel`
};

module.exports = stripeConfig;