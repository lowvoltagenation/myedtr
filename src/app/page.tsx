import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users, Star, Clock, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 gradient-bg rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 gradient-bg-alt rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute top-40 left-40 w-80 h-80 gradient-bg rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block gradient-bg-subtle rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <span className="text-sm font-semibold text-primary">✨ Trusted by 10,000+ creators</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight">
              Find the Perfect{" "}
              <span className="gradient-text">Video Editor</span>{" "}
              for Your Project
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with professional video editors who specialize in motion graphics, 
              color grading, and storytelling. Get your projects done faster with quality you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/browse">
                <Button size="lg" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto rounded-xl">
                  Browse Editors
                </Button>
              </Link>
              <Link href="/signup?type=editor">
                <Button size="lg" className="btn-primary bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-4 text-lg w-full sm:w-auto rounded-xl font-semibold text-white border-0">
                  Join as Editor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block gradient-bg-subtle rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Why Choose MyEdtr?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Built for <span className="gradient-text">Creative Excellence</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We've crafted the most comprehensive platform for video editing professionals and clients, 
              with everything you need to create amazing content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Curated Talent</CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Every editor is vetted for quality and professionalism
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  We carefully review portfolios and skills to ensure you're working with the best talent in the industry.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-bg-alt rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Fast Turnaround</CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Get your projects completed on time, every time
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  Our editors are committed to meeting deadlines while maintaining the highest quality standards.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Secure Payments</CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Protected transactions with milestone-based payments
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  Your payments are secure and released only when you're satisfied with the work delivered.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Quality Guarantee</CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Unlimited revisions until you're 100% satisfied
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  We stand behind our work with a satisfaction guarantee and unlimited revisions.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Easy Collaboration</CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Built-in messaging and project management tools
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  Communicate seamlessly with your editor through our integrated platform.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-6">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Specialized Skills</CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Find editors with specific expertise for your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  From motion graphics to color grading, find editors who specialize in exactly what you need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators and editors who trust MyEdtr for their video projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup?type=client">
              <Button size="lg" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary px-8 py-4 text-lg w-full sm:w-auto rounded-xl font-semibold transition-all duration-300">
                Post Your Project
              </Button>
            </Link>
            <Link href="/signup?type=editor">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg w-full sm:w-auto rounded-xl font-semibold border-0 transition-all duration-300">
                Start Editing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-foreground">MyEdtr</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The premier marketplace for video editing professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-foreground">For Clients</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/browse" className="hover:text-primary transition-colors">Browse Editors</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-foreground">For Editors</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/signup?type=editor" className="hover:text-primary transition-colors">Join as Editor</Link></li>
                <li><Link href="/editor-resources" className="hover:text-primary transition-colors">Resources</Link></li>
                <li><Link href="/success-stories" className="hover:text-primary transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-foreground">Support</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-muted-foreground">&copy; 2024 MyEdtr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
