import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  plans: {
    pro: {
      priceId: process.env.STRIPE_PRO_PRICE_ID!,
      amount: 2900, // $29.00 in cents
    },
    featured: {
      priceId: process.env.STRIPE_FEATURED_PRICE_ID!,
      amount: 5900, // $59.00 in cents
    },
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
} as const;

// Type definitions
export type StripePlan = 'pro' | 'featured';
export type StripeSubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid'; 