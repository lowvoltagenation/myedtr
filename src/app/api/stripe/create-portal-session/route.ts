import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripeService } from '@/lib/stripe/service';

export async function POST(request: NextRequest) {
  try {
    const { returnUrl } = await request.json();

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Return URL is required' },
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

    const stripeService = new StripeService(supabase);

    try {
      // Create portal session
      const portalUrl = await stripeService.createPortalSession(user.id, returnUrl);
      return NextResponse.json({ url: portalUrl });
    } catch (error: any) {
      if (error.message === 'No Stripe customer found for user') {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 