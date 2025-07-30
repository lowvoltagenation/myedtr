import { stripe, STRIPE_CONFIG, StripePlan, StripeSubscriptionStatus, STRIPE_MODE, isStripeConfigured } from './config';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Plan configurations using modern inline pricing
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

export class StripeService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    
    // Log current Stripe mode for debugging
    console.log(`StripeService initialized in ${STRIPE_MODE} mode`, {
      isConfigured: isStripeConfigured(),
      hasStripeInstance: !!stripe
    });
  }

  /**
   * Create or get a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string> {
    // Check if user already has a Stripe customer ID
    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (subscription?.stripe_customer_id) {
      return subscription.stripe_customer_id;
    }

    if (!stripe) {
      throw new Error(`Stripe not initialized - missing ${STRIPE_MODE} mode environment variables`);
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        user_id: userId,
        stripe_mode: STRIPE_MODE, // Track which mode was used to create customer
      },
    });

    // Update the subscription record with customer ID
    await this.supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', userId);

    console.log(`Created Stripe customer in ${STRIPE_MODE} mode:`, customer.id);
    return customer.id;
  }

  /**
   * Create a checkout session for subscription using modern price_data approach
   */
  async createCheckoutSession(
    userId: string,
    email: string,
    plan: StripePlan,
    successUrl: string,
    cancelUrl: string,
    name?: string
  ): Promise<string> {
    if (!stripe) {
      throw new Error(`Stripe not initialized - missing ${STRIPE_MODE} mode environment variables`);
    }

    const customerId = await this.getOrCreateCustomer(userId, email, name);
    const planConfig = PLAN_CONFIG[plan];

    if (!planConfig) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    console.log(`Creating checkout session in ${STRIPE_MODE} mode:`, {
      plan,
      planConfig,
      customerId
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
            },
            unit_amount: planConfig.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        plan: plan,
        stripe_mode: STRIPE_MODE,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan: plan,
          stripe_mode: STRIPE_MODE,
        },
      },
      // Allow promotion codes for discounts
      allow_promotion_codes: true,
      // Set billing address collection
      billing_address_collection: 'required',
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    console.log(`✅ Checkout session created successfully in ${STRIPE_MODE} mode:`, session.id);
    return session.url;
  }

  /**
   * Create a customer portal session for subscription management
   */
  async createPortalSession(userId: string, returnUrl: string): Promise<string> {
    if (!stripe) {
      throw new Error(`Stripe not initialized - missing ${STRIPE_MODE} mode environment variables`);
    }

    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!subscription?.stripe_customer_id) {
      throw new Error('No Stripe customer found for user');
    }

    console.log(`Creating portal session in ${STRIPE_MODE} mode for customer:`, subscription.stripe_customer_id);

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Handle subscription created webhook
   */
  async handleSubscriptionCreated(subscription: any): Promise<void> {
    const userId = subscription.metadata.user_id;
    const plan = subscription.metadata.plan;
    const subscriptionMode = subscription.metadata.stripe_mode || 'unknown';

    console.log(`Processing subscription created webhook:`, {
      subscriptionId: subscription.id,
      userId,
      plan,
      currentMode: STRIPE_MODE,
      subscriptionMode
    });

    if (!userId || !plan) {
      throw new Error('Missing user_id or plan in subscription metadata');
    }

    // Map Stripe plan to our tier system
    const tierLevel = plan === 'pro' ? 'pro' : 'featured';

    // Upsert subscription in database (insert if not exists, update if exists)
    const { error } = await this.supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        tier_id: tierLevel,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error upserting subscription:', error);
      throw error;
    }

    console.log(`Subscription created for user ${userId}: ${plan} tier in ${STRIPE_MODE} mode`);
  }

  /**
   * Handle subscription updated webhook
   */
  async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const userId = subscription.metadata.user_id;
    const subscriptionMode = subscription.metadata.stripe_mode || 'unknown';

    console.log(`Processing subscription updated webhook:`, {
      subscriptionId: subscription.id,
      userId,
      status: subscription.status,
      currentMode: STRIPE_MODE,
      subscriptionMode
    });

    if (!userId) {
      throw new Error('Missing user_id in subscription metadata');
    }

    const plan = subscription.metadata.plan;
    const tierLevel = plan === 'pro' ? 'pro' : 'featured';

    // Upsert subscription data - use user_id from metadata
    const { error } = await this.supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        tier_id: tierLevel,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    console.log(`Subscription updated for user ${userId}: ${subscription.status} in ${STRIPE_MODE} mode`);
  }

  /**
   * Handle subscription cancelled webhook
   */
  async handleSubscriptionCancelled(subscription: any): Promise<void> {
    const subscriptionMode = subscription.metadata?.stripe_mode || 'unknown';
    
    console.log(`Processing subscription cancelled webhook:`, {
      subscriptionId: subscription.id,
      currentMode: STRIPE_MODE,
      subscriptionMode
    });

    // Get user_id from subscription to properly update
    const userId = subscription.metadata?.user_id;
    if (userId) {
      await this.supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          tier_id: 'free',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
    } else {
      // Fallback if no user_id in metadata
      await this.supabase
        .from('subscriptions')
        .update({
          tier_id: 'free',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
    }

    console.log(`Subscription cancelled: ${subscription.id} in ${STRIPE_MODE} mode`);
  }

  /**
   * Handle invoice payment succeeded webhook
   */
  async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    const subscriptionId = invoice.subscription;
    
    console.log(`Processing invoice payment succeeded webhook:`, {
      invoiceId: invoice.id,
      subscriptionId,
      currentMode: STRIPE_MODE
    });
    
    if (subscriptionId) {
      // Update subscription status to active
      await this.supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      console.log(`Invoice payment succeeded for subscription: ${subscriptionId} in ${STRIPE_MODE} mode`);
    }
  }

  /**
   * Handle invoice payment failed webhook
   */
  async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    const subscriptionId = invoice.subscription;
    
    console.log(`Processing invoice payment failed webhook:`, {
      invoiceId: invoice.id,
      subscriptionId,
      currentMode: STRIPE_MODE
    });
    
    if (subscriptionId) {
      await this.supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      console.log(`Invoice payment failed for subscription: ${subscriptionId} in ${STRIPE_MODE} mode`);
    }
  }

  /**
   * Get current Stripe configuration info
   */
  getStripeInfo() {
    return {
      mode: STRIPE_MODE,
      isConfigured: isStripeConfigured(),
      hasStripeInstance: !!stripe,
      planConfig: PLAN_CONFIG,
      usesPriceData: true, // Indicates we're using modern approach
    };
  }
} 