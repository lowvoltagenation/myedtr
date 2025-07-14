import Stripe from 'stripe';

// Determine which Stripe mode to use
// Default to test mode unless explicitly set to live
export const STRIPE_MODE = (process.env.STRIPE_MODE || 'test') as 'test' | 'live';

// Get the appropriate keys based on mode
const getStripeKeys = () => {
  if (STRIPE_MODE === 'live') {
    return {
      secretKey: process.env.STRIPE_LIVE_SECRET_KEY,
      publishableKey: process.env.STRIPE_LIVE_PUBLISHABLE_KEY,
      clientPublishableKey: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_LIVE_WEBHOOK_SECRET,
    };
  } else {
    return {
      secretKey: process.env.STRIPE_TEST_SECRET_KEY,
      publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY,
      clientPublishableKey: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET,
    };
  }
};

const stripeKeys = getStripeKeys();

// Initialize Stripe with the appropriate secret key
export const stripe = stripeKeys.secretKey 
  ? new Stripe(stripeKeys.secretKey, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  : null;

// Export the current publishable key for client-side usage  
export const STRIPE_PUBLISHABLE_KEY = stripeKeys.publishableKey;

// Modern Stripe configuration - no longer requires pre-created price IDs
export const STRIPE_CONFIG = {
  mode: STRIPE_MODE,
  currency: 'usd',
  webhookSecret: stripeKeys.webhookSecret || '',
  // Modern approach: Plans are defined inline using price_data
  // See StripeService for plan configurations
} as const;

// Utility function to check if Stripe is properly configured
export const isStripeConfigured = (): boolean => {
  return !!(stripeKeys.secretKey && stripeKeys.clientPublishableKey);
};

// Utility function to get current mode info
export const getStripeInfo = () => ({
  mode: STRIPE_MODE,
  isConfigured: isStripeConfigured(),
  hasSecretKey: !!stripeKeys.secretKey,
  hasPublishableKey: !!stripeKeys.publishableKey,
  hasClientPublishableKey: !!stripeKeys.clientPublishableKey,
  hasWebhookSecret: !!stripeKeys.webhookSecret,
  requiresPriceIds: false, // Modern approach doesn't need pre-created price IDs
});

// Type definitions
export type StripePlan = 'pro' | 'featured';
export type StripeMode = 'test' | 'live';
export type StripeSubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid'; 