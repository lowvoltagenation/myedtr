import { stripe, STRIPE_CONFIG, StripePlan, StripeSubscriptionStatus } from './config';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class StripeService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
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
      throw new Error('Stripe not initialized - missing environment variables');
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        user_id: userId,
      },
    });

    // Update the subscription record with customer ID
    await this.supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', userId);

    return customer.id;
  }

  /**
   * Create a checkout session for subscription
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
      throw new Error('Stripe not initialized - missing environment variables');
    }

    const customerId = await this.getOrCreateCustomer(userId, email, name);
    const priceId = STRIPE_CONFIG.plans[plan].priceId;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan: plan,
        },
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return session.url;
  }

  /**
   * Create a customer portal session for subscription management
   */
  async createPortalSession(userId: string, returnUrl: string): Promise<string> {
    if (!stripe) {
      throw new Error('Stripe not initialized - missing environment variables');
    }

    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!subscription?.stripe_customer_id) {
      throw new Error('No Stripe customer found for user');
    }

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

    if (!userId || !plan) {
      throw new Error('Missing user_id or plan in subscription metadata');
    }

    // Map Stripe plan to our tier system
    const tierLevel = plan === 'pro' ? 'pro' : 'premium';

    // Update subscription in database
    await this.supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        tier_level: tierLevel,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    console.log(`Subscription created for user ${userId}: ${plan} tier`);
  }

  /**
   * Handle subscription updated webhook
   */
  async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const userId = subscription.metadata.user_id;

    if (!userId) {
      throw new Error('Missing user_id in subscription metadata');
    }

    const plan = subscription.metadata.plan;
    const tierLevel = plan === 'pro' ? 'pro' : 'premium';

    await this.supabase
      .from('subscriptions')
      .update({
        tier_level: tierLevel,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
  }

  /**
   * Handle subscription cancelled webhook
   */
  async handleSubscriptionCancelled(subscription: any): Promise<void> {
    await this.supabase
      .from('subscriptions')
      .update({
        tier_level: 'free',
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log(`Subscription cancelled: ${subscription.id}`);
  }

  /**
   * Handle invoice payment succeeded webhook
   */
  async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      // Update subscription status to active
      await this.supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      console.log(`Invoice payment succeeded for subscription: ${subscriptionId}`);
    }
  }

  /**
   * Handle invoice payment failed webhook
   */
  async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      await this.supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      console.log(`Invoice payment failed for subscription: ${subscriptionId}`);
    }
  }
} 