import { NextRequest, NextResponse } from 'next/server';
import { getStripeInfo } from '@/lib/stripe/config';
import { createServerClient } from '@supabase/ssr';

// Plan configurations (same as in service.ts)
const PLAN_CONFIG = {
  pro: {
    name: 'MyEdtr Pro',
    description: 'Core professional features for serious editors',
    amount: 2900, // $29.00 in cents
  },
  featured: {
    name: 'MyEdtr Featured', 
    description: 'Premium tier with maximum visibility and features',
    amount: 5900, // $59.00 in cents
  }
} as const;

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
    
    // Return configuration info using modern approach
    const configInfo = {
      mode: stripeInfo.mode,
      isConfigured: stripeInfo.isConfigured,
      hasSecretKey: stripeInfo.hasSecretKey,
      hasPublishableKey: stripeInfo.hasPublishableKey,
      hasWebhookSecret: stripeInfo.hasWebhookSecret,
      usesPriceData: true, // Modern approach
      requiresPriceIds: false, // No longer needed
      plans: {
        pro: {
          name: PLAN_CONFIG.pro.name,
          description: PLAN_CONFIG.pro.description,
          amount: PLAN_CONFIG.pro.amount,
          displayPrice: `$${(PLAN_CONFIG.pro.amount / 100).toFixed(2)}`,
        },
        featured: {
          name: PLAN_CONFIG.featured.name,
          description: PLAN_CONFIG.featured.description,
          amount: PLAN_CONFIG.featured.amount,
          displayPrice: `$${(PLAN_CONFIG.featured.amount / 100).toFixed(2)}`,
        },
      },
      currency: 'usd', // Fixed currency
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