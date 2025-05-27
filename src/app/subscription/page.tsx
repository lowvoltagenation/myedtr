"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Check, Star, Zap, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  buttonText: string;
  restrictions: {
    maxProjects?: number;
    maxApplications?: number;
    maxMessages?: number;
    advancedFilters: boolean;
    prioritySupport: boolean;
    portfolioUpload: boolean;
    analytics: boolean;
  };
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Basic',
    price: 0,
    description: 'Perfect for getting started',
    icon: <Star className="h-6 w-6" />,
    buttonText: 'Current Plan',
    features: [
      'Create editor profile',
      'Browse projects',
      'Apply to 5 projects per month',
      'Basic messaging',
      'Post 2 projects per month',
      'Basic support'
    ],
    restrictions: {
      maxProjects: 2,
      maxApplications: 5,
      maxMessages: 50,
      advancedFilters: false,
      prioritySupport: false,
      portfolioUpload: false,
      analytics: false
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    description: 'For active freelancers and growing businesses',
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    buttonText: 'Upgrade to Pro',
    features: [
      'Everything in Basic',
      'Unlimited project applications',
      'Unlimited messaging',
      'Post 10 projects per month',
      'Advanced search filters',
      'Portfolio image uploads',
      'Basic analytics',
      'Priority support'
    ],
    restrictions: {
      maxProjects: 10,
      maxApplications: -1, // unlimited
      maxMessages: -1, // unlimited
      advancedFilters: true,
      prioritySupport: true,
      portfolioUpload: true,
      analytics: true
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 39,
    description: 'For agencies and power users',
    icon: <Crown className="h-6 w-6" />,
    buttonText: 'Upgrade to Premium',
    features: [
      'Everything in Pro',
      'Unlimited projects',
      'Video portfolio uploads',
      'Advanced analytics & insights',
      'White-label profiles',
      'Dedicated account manager',
      'Custom integrations',
      'Priority listing in search'
    ],
    restrictions: {
      maxProjects: -1, // unlimited
      maxApplications: -1, // unlimited
      maxMessages: -1, // unlimited
      advancedFilters: true,
      prioritySupport: true,
      portfolioUpload: true,
      analytics: true
    }
  }
];

export default function SubscriptionPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const supabase = createClient();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUser(user);

      // Get user details and current subscription
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData) {
        setCurrentUser({ ...user, ...userData });
      }

      // Get editor profile if exists (for tier_level)
      const { data: profileData } = await supabase
        .from('editor_profiles')
        .select('tier_level')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setCurrentPlan(profileData.tier_level || 'free');
        setUserProfile(profileData);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlan) return;
    
    const supabase = createClient();
    
    try {
      // Update editor profile tier level
      if (userProfile) {
        const { error } = await supabase
          .from('editor_profiles')
          .update({ tier_level: planId })
          .eq('user_id', currentUser.id);

        if (error) throw error;
        
        setCurrentPlan(planId);
        
        // Show success message (in a real app, this would integrate with payment processing)
        alert(`Successfully ${planId === 'free' ? 'downgraded to' : 'upgraded to'} ${PLANS.find(p => p.id === planId)?.name} plan!`);
      } else {
        // If no editor profile exists, we can't upgrade (they need to create a profile first)
        alert('Please create an editor profile first to manage your subscription.');
        router.push('/dashboard/editor/create-profile');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Failed to update plan. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link 
            href={currentUser?.user_type === 'client' ? '/dashboard/client' : '/dashboard/editor'} 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock more features and grow your video editing business with our flexible pricing plans
          </p>
          
          {currentPlan && (
            <div className="mt-6">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Current Plan: {PLANS.find(p => p.id === currentPlan)?.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-purple-500 shadow-xl' : 'hover:shadow-lg'
              } ${currentPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {currentPlan === plan.id && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    Active
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-4 p-3 rounded-full bg-purple-100 text-purple-600 w-fit">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 text-lg">/month</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  className="w-full"
                  variant={currentPlan === plan.id ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Current Plan' : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Feature Comparison</CardTitle>
            <CardDescription className="text-center">
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    {PLANS.map(plan => (
                      <th key={plan.id} className="text-center py-3 px-4">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Monthly Projects</td>
                    {PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.restrictions.maxProjects === -1 ? 'Unlimited' : plan.restrictions.maxProjects}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Monthly Applications</td>
                    {PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.restrictions.maxApplications === -1 ? 'Unlimited' : plan.restrictions.maxApplications}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Advanced Filters</td>
                    {PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.restrictions.advancedFilters ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Portfolio Upload</td>
                    {PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.restrictions.portfolioUpload ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Analytics</td>
                    {PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.restrictions.analytics ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Priority Support</td>
                    {PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.restrictions.prioritySupport ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ or Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h4>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What happens if I exceed my limits?</h4>
                <p className="text-gray-600 text-sm">
                  You'll be notified when approaching limits and can upgrade your plan to continue using all features.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
                <p className="text-gray-600 text-sm">
                  The Basic plan is free forever. You can upgrade to paid plans when you need more features.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
                <p className="text-gray-600 text-sm">
                  We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 