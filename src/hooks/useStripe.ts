import { useState } from 'react';
import { getStripe } from '@/lib/stripe/client';

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (plan: 'pro' | 'featured') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/pricing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating checkout session:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPortalSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/settings`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating portal session:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    createPortalSession,
    loading,
    error,
  };
} 