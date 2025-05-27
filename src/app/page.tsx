import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users, Star, Clock, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find the Perfect{" "}
              <span className="gradient-text">Video Editor</span>{" "}
              for Your Project
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with professional video editors who specialize in motion graphics, 
              color grading, and storytelling. Get your projects done faster with quality you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Editors
                </Button>
              </Link>
              <Link href="/auth/register?type=editor">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join as Editor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CutBase?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built the most comprehensive platform for video editing professionals and clients.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Curated Talent</CardTitle>
                <CardDescription>
                  Every editor is vetted for quality and professionalism
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We carefully review portfolios and skills to ensure you're working with the best talent in the industry.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Fast Turnaround</CardTitle>
                <CardDescription>
                  Get your projects completed on time, every time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our editors are committed to meeting deadlines while maintaining the highest quality standards.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Protected transactions with milestone-based payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your payments are secure and released only when you're satisfied with the work delivered.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Quality Guarantee</CardTitle>
                <CardDescription>
                  Unlimited revisions until you're 100% satisfied
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We stand behind our work with a satisfaction guarantee and unlimited revisions.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Zap className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Easy Collaboration</CardTitle>
                <CardDescription>
                  Built-in messaging and project management tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Communicate seamlessly with your editor through our integrated platform.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Play className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Specialized Skills</CardTitle>
                <CardDescription>
                  Find editors with specific expertise for your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  From motion graphics to color grading, find editors who specialize in exactly what you need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators and editors who trust CutBase for their video projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?type=client">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Post Your Project
              </Button>
            </Link>
            <Link href="/auth/register?type=editor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-purple-600">
                Start Editing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Play className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">CutBase</span>
              </div>
              <p className="text-gray-400">
                The premier marketplace for video editing professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Clients</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/browse" className="hover:text-white transition-colors">Browse Editors</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Editors</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/signup?type=editor" className="hover:text-white transition-colors">Join as Editor</Link></li>
                <li><Link href="/editor-resources" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link href="/success-stories" className="hover:text-white transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CutBase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
