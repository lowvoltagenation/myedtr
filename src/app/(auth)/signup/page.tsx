"use client";

import { useState, Suspense } from "react";
import { SignupForm } from "@/components/auth/signup-form";
import { Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function SignupContent() {
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<"client" | "editor" | null>(
    searchParams.get("type") as "client" | "editor" | null
  );

  if (selectedType) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedType === "client" ? "Sign Up to Hire Editors" : "Sign Up to Offer Services"}
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            Create your {selectedType === "client" ? "business" : "editor"} account
          </p>
        </div>
        
        <SignupForm initialUserType={selectedType} />
        
        <div className="text-center mt-6">
          <button
            onClick={() => setSelectedType(null)}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-muted-foreground dark:hover:text-foreground mb-2"
          >
            ← Choose different account type
          </button>
          <p className="text-gray-600 dark:text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Join MyEdtr
        </h1>
        <p className="text-xl text-gray-600 dark:text-muted-foreground">
          Choose how you want to use MyEdtr
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card 
          className="relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 hover:border-purple-500"
          onClick={() => setSelectedType("client")}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl mb-2">For Business</CardTitle>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              Hire Editors
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-base">
              Post projects and connect with talented video editors. Get professional results for your business.
            </CardDescription>
            <ul className="mt-4 text-left text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start">
                <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                Post unlimited projects
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                Browse editor portfolios
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                Secure payment system
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className="relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 hover:border-cyan-500"
          onClick={() => setSelectedType("editor")}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
            </div>
            <CardTitle className="text-2xl mb-2">For Video Editors</CardTitle>
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
              Offer Services
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-base">
              Showcase your skills and connect with businesses looking for video editing services.
            </CardDescription>
            <ul className="mt-4 text-left text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start">
                <span className="text-cyan-600 dark:text-cyan-400 mr-2">✓</span>
                Create your portfolio
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 dark:text-cyan-400 mr-2">✓</span>
                Apply to projects
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 dark:text-cyan-400 mr-2">✓</span>
                Set your own rates
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-gray-600 dark:text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SignupContent />
      </Suspense>
    </div>
  );
}