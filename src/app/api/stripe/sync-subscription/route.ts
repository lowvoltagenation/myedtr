import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe/config';
import { StripeService } from '@/lib/stripe/service';

export async function POST(request: NextRequest) {
  try {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    console.log('🔄 Manual subscription sync requested for user:', user.id);

    // Get user's Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      );
    }

    console.log('🔍 Checking Stripe customer:', subscription.stripe_customer_id);

    // Get active subscriptions from Stripe
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: subscription.stripe_customer_id,
      status: 'active',
      limit: 10
    });

    console.log('📊 Found', stripeSubscriptions.data.length, 'active subscriptions');

    const stripeService = new StripeService(supabase);

    if (stripeSubscriptions.data.length > 0) {
      // Process the most recent active subscription
      const latestSubscription = stripeSubscriptions.data[0];
      console.log('✅ Processing subscription:', latestSubscription.id);
      
      await stripeService.handleSubscriptionUpdated(latestSubscription);
      
      return NextResponse.json({
        success: true,
        message: 'Subscription synced successfully',
        subscription: {
          id: latestSubscription.id,
          status: latestSubscription.status,
          plan: latestSubscription.metadata?.plan || 'unknown'
        }
      });
    } else {
      // No active subscriptions found, reset to free
      console.log('🆓 No active subscriptions found, setting to free tier');
      
      await supabase
        .from('subscriptions')
        .update({
          tier_id: 'free',
          status: 'inactive',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      return NextResponse.json({
        success: true,
        message: 'No active subscription found, reset to free tier',
        subscription: {
          status: 'inactive',
          tier: 'free'
        }
      });
    }

  } catch (error) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
} 