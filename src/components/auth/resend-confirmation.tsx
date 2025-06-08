"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResendConfirmation() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const handleResend = async () => {
    setIsLoading(true);
    setMessage("");

    const email = localStorage.getItem('signup_email');
    if (!email) {
      setMessage("Email not found. Please try signing up again.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Confirmation email sent! Check your inbox.");
      }
    } catch (err) {
      setMessage("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleResend}
        disabled={isLoading}
        className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "Resend confirmation"}
      </button>
      {message && (
        <p className={`text-xs mt-1 ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
} 