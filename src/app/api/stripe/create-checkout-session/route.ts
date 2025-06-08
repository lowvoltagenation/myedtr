import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripeService } from '@/lib/stripe/service';
import { StripePlan } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const { plan, successUrl, cancelUrl } = await request.json();

    // Validate plan
    if (!plan || !['pro', 'featured'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      );
    }

    // Validate URLs
    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Success and cancel URLs are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    const stripeService = new StripeService(supabase);

    // Create checkout session
    const checkoutUrl = await stripeService.createCheckoutSession(
      user.id,
      user.email!,
      plan as StripePlan,
      successUrl,
      cancelUrl,
      profile?.name
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 