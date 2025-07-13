import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResendConfirmation } from "@/components/auth/resend-confirmation";

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Account Created!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <div className="flex justify-center">
                <Mail className="w-12 h-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Check Your Email</h3>
              <p className="text-gray-600 dark:text-muted-foreground">
                We've sent you a confirmation email. Please click the link in the email to verify your account and complete the signup process.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">What's next?</h4>
              <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>1. Check your inbox (and spam folder)</li>
                <li>2. Click the verification link</li>
                <li>3. You'll be automatically signed in</li>
                <li>4. Complete your profile setup</li>
              </ol>
            </div>

            <div className="space-y-3 pt-4">
              <Button asChild className="w-full">
                <Link href="/login">
                  Already verified? Sign In
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/signup">
                  Try Again
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <div className="text-sm text-gray-600 dark:text-muted-foreground">
            Didn't receive the email?{" "}
            <ResendConfirmation />
          </div>
        </div>
      </div>
    </div>
  );
} 