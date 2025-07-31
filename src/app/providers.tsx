"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { HydrationProvider } from "@/contexts/HydrationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </NextThemesProvider>
    </HydrationProvider>
  );
} 