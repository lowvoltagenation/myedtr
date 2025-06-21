import { NextRequest, NextResponse } from 'next/server';
import { getStripeInfo, STRIPE_CONFIG } from '@/lib/stripe/config';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated (optional, for security)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            /* no-op in route */
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    const stripeInfo = getStripeInfo();
    
    // Return configuration info (sanitized for security)
    const configInfo = {
      mode: stripeInfo.mode,
      isConfigured: stripeInfo.isConfigured,
      hasSecretKey: stripeInfo.hasSecretKey,
      hasPublishableKey: stripeInfo.hasPublishableKey,
      hasWebhookSecret: stripeInfo.hasWebhookSecret,
      plans: {
        pro: {
          hasPriceId: !!STRIPE_CONFIG.plans.pro.priceId,
          priceId: user ? STRIPE_CONFIG.plans.pro.priceId : '[HIDDEN]', // Only show to authenticated users
          amount: STRIPE_CONFIG.plans.pro.amount,
        },
        featured: {
          hasPriceId: !!STRIPE_CONFIG.plans.featured.priceId,
          priceId: user ? STRIPE_CONFIG.plans.featured.priceId : '[HIDDEN]',
          amount: STRIPE_CONFIG.plans.featured.amount,
        },
      },
      currency: STRIPE_CONFIG.currency,
    };

    return NextResponse.json(configInfo);
  } catch (error) {
    console.error('Error getting Stripe config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 