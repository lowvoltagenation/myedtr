'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react";
import { TierBadge } from "@/components/ui/tier-badge";
import { TIER_CONFIG } from "@/types/subscription";
import { useStripe } from "@/hooks/useStripe";
import { useSubscription } from "@/hooks/useSubscription";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const { createCheckoutSession, createPortalSession, loading, error } = useStripe();
  const subscription = useSubscription(user?.id);
  const supabase = createClient();

  // Check for URL parameters to show success/cancel messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccess(true);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (urlParams.get('canceled') === 'true') {
      setCanceled(true);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const tiers = Object.values(TIER_CONFIG);

  const getFeatureList = (tier: typeof TIER_CONFIG.free) => {
    const features = [];
    
    if (tier.features.portfolio_limit) {
      features.push(`${tier.features.portfolio_limit} portfolio videos`);
    } else {
      features.push('Unlimited portfolio videos');
    }

    if (tier.features.messages_per_month) {
      features.push(`${tier.features.messages_per_month} messages per month`);
    } else {
      features.push('Unlimited messaging');
    }

    if (tier.features.search_priority === 'featured') {
      features.push('Featured search placement');
    } else if (tier.features.search_priority === 'high') {
      features.push('Priority search placement');
    } else {
      features.push('Standard search placement');
    }

    if (tier.features.analytics === 'advanced') {
      features.push('Advanced analytics & insights');
    } else if (tier.features.analytics === 'basic') {
      features.push('Basic analytics');
    }

    if (tier.features.custom_themes) {
      features.push('Custom profile themes');
    }

    if (tier.features.spotlight) {
      features.push('Weekly editor spotlight');
    }

    if (tier.features.video_intro) {
      features.push('Video introduction capability');
    }

    if (tier.features.early_access) {
      features.push('Early access to new features');
    }

    features.push(`${tier.features.support.replace('_', ' ')} support`);

    return features;
  };

  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    return annual ? monthlyPrice * 10 : monthlyPrice; // 2 months free annually
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login?redirect=/pricing';
      return;
    }

    if (planId === 'premium') {
      await createCheckoutSession('featured');
    } else if (planId === 'pro') {
      await createCheckoutSession('pro');
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    await createPortalSession();
  };

  const getButtonConfig = (tier: any) => {
    const currentTier = subscription.tier;
    const isCurrentTier = currentTier === tier.id;
    const isFreeTier = tier.id === 'free';
    const hasActiveSubscription = currentTier !== 'free'; // Simplified for now

    if (isFreeTier) {
      return {
        text: isCurrentTier ? 'Current Plan' : 'Downgrade to Free',
        disabled: isCurrentTier,
        variant: 'secondary' as const,
        onClick: isCurrentTier ? undefined : handleManageSubscription,
      };
    }

    if (isCurrentTier && hasActiveSubscription) {
      return {
        text: 'Manage Subscription',
        disabled: false,
        variant: 'outline' as const,
        onClick: handleManageSubscription,
      };
    }

    if (hasActiveSubscription && !isCurrentTier) {
      return {
        text: currentTier === 'pro' && tier.id === 'premium' ? 'Upgrade to Featured' : 'Change Plan',
        disabled: false,
        variant: 'default' as const,
        onClick: () => handleSubscribe(tier.id),
      };
    }

    return {
      text: user ? 'Get Started' : 'Sign Up to Continue',
      disabled: false,
      variant: 'default' as const,
      onClick: () => handleSubscribe(tier.id),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-8 mx-auto max-w-md">
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-800 dark:text-green-300">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Payment successful!</p>
                <p className="text-sm">Your subscription has been activated.</p>
              </div>
            </div>
          </div>
        )}

        {canceled && (
          <div className="mb-8 mx-auto max-w-md">
            <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-300">
              <XCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Payment canceled</p>
                <p className="text-sm">You can try again anytime.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 mx-auto max-w-md">
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <XCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Payment error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-muted-foreground mb-8">
            Select the perfect plan to showcase your video editing skills
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!annual ? 'text-gray-900 dark:text-foreground font-medium' : 'text-gray-500 dark:text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                annual ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  annual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${annual ? 'text-gray-900 dark:text-foreground font-medium' : 'text-gray-500 dark:text-muted-foreground'}`}>
              Annual
            </span>
            {annual && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Save 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => {
            const price = getPrice(tier.price_monthly);
            const isPopular = tier.popular;
            
            return (
              <Card 
                key={tier.id} 
                className={`relative flex flex-col ${
                  isPopular 
                    ? 'border-purple-200 dark:border-purple-800 shadow-xl scale-105 bg-gradient-to-b from-white to-purple-50 dark:from-card dark:to-purple-950/20' 
                    : 'border-gray-200 dark:border-border shadow-lg hover:shadow-xl transition-shadow'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-center mb-4">
                    <TierBadge tier={tier.id} size="lg" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">
                    {tier.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 mt-2">
                    {tier.description}
                  </CardDescription>

                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900 dark:text-foreground">
                        ${price}
                      </span>
                      {price > 0 && (
                        <span className="text-gray-500 dark:text-muted-foreground ml-1">
                          /{annual ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {annual && price > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        ${tier.price_monthly}/month billed annually
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col h-full">
                  {/* Features List - This will grow to fill space */}
                  <ul className="space-y-3 flex-grow mb-6">
                    {getFeatureList(tier).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button Section - This will stay at bottom */}
                  <div className="space-y-3 mt-auto">
                    {(() => {
                      const buttonConfig = getButtonConfig(tier);
                      return (
                        <Button 
                          className={`w-full ${
                            buttonConfig.variant === 'secondary'
                              ? 'bg-gray-600 hover:bg-gray-700'
                              : buttonConfig.variant === 'outline'
                              ? 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50'
                              : isPopular
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                          }`}
                          variant={buttonConfig.variant}
                          size="lg"
                          disabled={buttonConfig.disabled || loading}
                          onClick={buttonConfig.onClick}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              {buttonConfig.text}
                              {buttonConfig.text.includes('Get Started') && (
                                <ArrowRight className="w-4 h-4 ml-2" />
                              )}
                            </>
                          )}
                        </Button>
                      );
                    })()}

                    {tier.id !== 'free' && !getButtonConfig(tier).text.includes('Manage') && (
                      <p className="text-xs text-gray-500 dark:text-muted-foreground text-center">
                        Start your free trial today. No credit card required.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-foreground mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-card rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-foreground mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-gray-600 dark:text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately 
                and we'll prorate your billing accordingly.
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-foreground mb-2">
                What happens if I exceed my usage limits?
              </h3>
              <p className="text-gray-600 dark:text-muted-foreground">
                If you reach your plan's limits, you'll be prompted to upgrade. Your account won't be 
                suspended, but you'll need to upgrade to continue using premium features.
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-foreground mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600 dark:text-muted-foreground">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start, 
                and you can cancel anytime during the trial period.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to elevate your video editing career?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of video editors already growing their business with MyEdtr
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 