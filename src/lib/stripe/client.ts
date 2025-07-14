import { loadStripe, Stripe } from '@stripe/stripe-js';

// Determine which Stripe mode to use (same logic as server-side)
const STRIPE_MODE = (process.env.STRIPE_MODE || 'test') as 'test' | 'live';

// Get the appropriate publishable key based on mode
const getPublishableKey = (): string => {
  if (STRIPE_MODE === 'live') {
    return process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || '';
  } else {
    return process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY || '';
  }
};

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = getPublishableKey();
    
    if (!publishableKey) {
      const mode = STRIPE_MODE;
      throw new Error(`Missing NEXT_PUBLIC_STRIPE_${mode.toUpperCase()}_PUBLISHABLE_KEY environment variable`);
    }
    
    console.log(`🔄 Initializing Stripe in ${STRIPE_MODE} mode`);
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

// Utility function to get current Stripe mode on client-side
export const getStripeMode = (): 'test' | 'live' => STRIPE_MODE;

// Utility function to check if client-side Stripe is configured
export const isStripeConfigured = (): boolean => {
  return !!getPublishableKey();
};

// Utility function to get configuration info
export const getStripeClientInfo = () => ({
  mode: STRIPE_MODE,
  isConfigured: isStripeConfigured(),
  hasPublishableKey: !!getPublishableKey(),
  usesPriceData: true, // Modern approach doesn't need pre-created price IDs
}); 