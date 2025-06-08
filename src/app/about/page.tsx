"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  MessageCircle,
  CreditCard,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Users,
  Clock,
  Award,
  DollarSign,
  Globe,
  Camera,
  Edit,
  Briefcase,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Search,
    title: "Browse Expert Editors",
    description: "Find the perfect video editor for your project from our curated community of professionals"
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat directly with editors to discuss your vision, timeline, and requirements"
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Protected payments with milestone-based releases and dispute resolution"
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Get your videos edited quickly with clear timelines and progress tracking"
  },
  {
    icon: Star,
    title: "Quality Guarantee",
    description: "All editors are vetted for quality and professionalism with client reviews"
  },
  {
    icon: Zap,
    title: "Easy Collaboration",
    description: "Share files, feedback, and revisions seamlessly through our platform"
  }
];

const howItWorks = [
  {
    step: 1,
    title: "Post Your Project",
    description: "Describe your video editing needs, timeline, and budget",
    icon: Edit,
    color: "from-blue-500 to-blue-600"
  },
  {
    step: 2,
    title: "Review Proposals",
    description: "Receive proposals from qualified editors with samples and quotes",
    icon: Users,
    color: "from-purple-500 to-purple-600"
  },
  {
    step: 3,
    title: "Choose Your Editor",
    description: "Select the best editor based on portfolio, reviews, and communication",
    icon: Award,
    color: "from-green-500 to-green-600"
  },
  {
    step: 4,
    title: "Collaborate & Deliver",
    description: "Work together through our platform and receive your finished video",
    icon: CheckCircle,
    color: "from-orange-500 to-orange-600"
  }
];

const editorSteps = [
  {
    step: 1,
    title: "Create Your Profile",
    description: "Showcase your skills, experience, and portfolio",
    icon: Camera,
    color: "from-pink-500 to-pink-600"
  },
  {
    step: 2,
    title: "Browse Projects",
    description: "Find projects that match your expertise and interests",
    icon: Search,
    color: "from-indigo-500 to-indigo-600"
  },
  {
    step: 3,
    title: "Submit Proposals",
    description: "Send compelling proposals with samples and pricing",
    icon: Briefcase,
    color: "from-teal-500 to-teal-600"
  },
  {
    step: 4,
    title: "Get Paid",
    description: "Complete projects and receive secure payments",
    icon: DollarSign,
    color: "from-yellow-500 to-yellow-600"
  }
];

const tiers = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "Basic project posting",
      "Message up to 3 editors",
      "Standard support",
      "Basic file sharing"
    ],
    badge: null
  },
  {
    name: "Pro",
    price: "29",
    description: "For serious content creators",
    features: [
      "Unlimited project posting",
      "Priority editor matching",
      "Advanced collaboration tools",
      "Priority support",
      "Analytics dashboard",
      "Custom branding"
    ],
    badge: "Most Popular"
  },
  {
    name: "Premium",
    price: "99",
    description: "For agencies and teams",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "White-label solutions",
      "Dedicated account manager",
      "API access",
      "Custom integrations"
    ],
    badge: "Enterprise"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 text-sm font-medium">
              How MyEdtr Works
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-foreground mb-6">
            Connect. Collaborate. Create.
          </h1>
          <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto mb-12">
            MyEdtr is the premier marketplace connecting content creators with professional video editors. 
            Whether you need a quick edit or a complete production, we make it easy to find the perfect collaborator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" size="lg" className="px-8">
                Browse Editors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white dark:bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-4">
              Why Choose MyEdtr?
            </h2>
            <p className="text-lg text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
              We've built the most comprehensive platform for video editing collaboration, 
              with tools and features designed for both creators and editors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Clients */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-4">
              For Content Creators
            </h2>
            <p className="text-lg text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
              Getting your videos edited is simple with our streamlined process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs">
                    Step {step.step}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/dashboard/client/post-project">
              <Button size="lg">
                Post Your Project
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Editors */}
      <section className="py-20 px-6 bg-white dark:bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-4">
              For Video Editors
            </h2>
            <p className="text-lg text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
              Build your freelance business and find great clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {editorSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs">
                    Step {step.step}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/dashboard/editor/create-profile">
              <Button size="lg">
                Start Editing
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your needs. Upgrade or downgrade anytime.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <Card key={index} className={`relative ${index === 1 ? 'border-purple-200 shadow-xl scale-105' : ''}`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-3 py-1">
                      {tier.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {tier.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${tier.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing">
                    <Button 
                      className={`w-full ${index === 1 ? '' : 'variant-outline'}`}
                      variant={index === 1 ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and editors who are already collaborating on MyEdtr. 
            Your next great video is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8">
                Sign Up Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-600 px-8">
                Browse Editors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold text-white">MyEdtr</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The premier marketplace for video editing collaboration. Connect with professional editors 
                and bring your creative vision to life.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-gray-400" />
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <Camera className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/browse" className="hover:text-white transition-colors">Browse Editors</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/messages" className="hover:text-white transition-colors">Messages</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 MyEdtr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 