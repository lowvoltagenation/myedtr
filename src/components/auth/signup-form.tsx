"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, Users, Briefcase } from "lucide-react";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"client" | "editor">("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "editor" || type === "client") {
      setUserType(type);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=${userType}`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Check if user needs to confirm email
        if (!data.session) {
          // Store email for resend functionality
          localStorage.setItem('signup_email', email);
          // User created but needs email confirmation
          router.push("/signup-success");
          return;
        }

        // Wait a moment for the trigger to complete user setup
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect to appropriate dashboard
        if (userType === "editor") {
          // Check if editor profile exists, if not redirect to create profile
          const { data: editorProfile } = await supabase
            .from('editor_profiles')
            .select('id')
            .eq('user_id', data.user.id)
            .single();
            
          if (!editorProfile) {
            router.push("/dashboard/editor/create-profile");
          } else {
            router.push("/dashboard/editor");
          }
        } else {
          router.push("/dashboard/client");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* User Type Selection */}
          <div className="space-y-2">
            <Label className="dark:text-foreground">I want to:</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("client")}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  userType === "client"
                    ? "border-purple-600 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-300"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                }`}
                disabled={isLoading}
              >
                <Briefcase className="h-5 w-5 mb-2" />
                <div className="font-medium">Hire Editors</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Post projects and find talent</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType("editor")}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  userType === "editor"
                    ? "border-purple-600 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-300"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                }`}
                disabled={isLoading}
              >
                <Users className="h-5 w-5 mb-2" />
                <div className="font-medium">Offer Services</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Showcase skills and get hired</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="dark:text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="dark:text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent dark:hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 dark:text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 dark:text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="dark:text-foreground">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent dark:hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 dark:text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 dark:text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <div className="mt-4 text-xs text-gray-600 dark:text-muted-foreground text-center">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="text-purple-600 hover:underline dark:text-purple-400 dark:hover:text-purple-300">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-purple-600 hover:underline dark:text-purple-400 dark:hover:text-purple-300">
            Privacy Policy
          </a>
          .
        </div>
      </CardContent>
    </Card>
  );
} 