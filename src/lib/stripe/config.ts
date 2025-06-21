import Stripe from 'stripe';

// Determine which Stripe mode to use
// Default to test mode unless explicitly set to live
export const STRIPE_MODE = (process.env.STRIPE_MODE || 'test') as 'test' | 'live';

// Get the appropriate keys based on mode
const getStripeKeys = () => {
  if (STRIPE_MODE === 'live') {
    return {
      secretKey: process.env.STRIPE_LIVE_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_LIVE_WEBHOOK_SECRET,
    };
  } else {
    return {
      secretKey: process.env.STRIPE_TEST_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY,
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

// Stripe configuration
export const STRIPE_CONFIG = {
  mode: STRIPE_MODE,
  currency: 'usd',
  plans: {
    pro: {
      // Use mode-specific price IDs if available, fallback to generic ones
      priceId: STRIPE_MODE === 'live' 
        ? (process.env.STRIPE_LIVE_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || '')
        : (process.env.STRIPE_TEST_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || ''),
      amount: 2900, // $29.00 in cents
    },
    featured: {
      priceId: STRIPE_MODE === 'live'
        ? (process.env.STRIPE_LIVE_FEATURED_PRICE_ID || process.env.STRIPE_FEATURED_PRICE_ID || '')
        : (process.env.STRIPE_TEST_FEATURED_PRICE_ID || process.env.STRIPE_FEATURED_PRICE_ID || ''),
      amount: 5900, // $59.00 in cents
    },
  },
  webhookSecret: stripeKeys.webhookSecret || '',
} as const;

// Utility function to check if Stripe is properly configured
export const isStripeConfigured = (): boolean => {
  return !!(stripeKeys.secretKey && stripeKeys.publishableKey);
};

// Utility function to get current mode info
export const getStripeInfo = () => ({
  mode: STRIPE_MODE,
  isConfigured: isStripeConfigured(),
  hasSecretKey: !!stripeKeys.secretKey,
  hasPublishableKey: !!stripeKeys.publishableKey,
  hasWebhookSecret: !!stripeKeys.webhookSecret,
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