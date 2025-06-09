import Stripe from 'stripe';

// Initialize Stripe with API version (only if secret key is available)
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  : null;

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  plans: {
    pro: {
      priceId: process.env.STRIPE_PRO_PRICE_ID || '',
      amount: 2900, // $29.00 in cents
    },
    featured: {
      priceId: process.env.STRIPE_FEATURED_PRICE_ID || '',
      amount: 5900, // $59.00 in cents
    },
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
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