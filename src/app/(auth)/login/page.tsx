import { LoginForm } from "@/components/auth/login-form";
import { Play } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Play className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold gradient-text">CutBase</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 