import { SignupForm } from "@/components/auth/signup-form";
import { Play } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SignupFormWrapper() {
  return <SignupForm />;
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold gradient-text">MyEdtr</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join MyEdtr</h1>
          <p className="text-gray-600 dark:text-muted-foreground">Create your account to get started</p>
        </div>
        
        <Suspense fallback={<div>Loading...</div>}>
          <SignupFormWrapper />
        </Suspense>
        
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 