"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface HydrationContextType {
  isHydrated: boolean;
}

const HydrationContext = createContext<HydrationContextType>({
  isHydrated: false,
});

export function HydrationProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Small delay to ensure all providers have initialized
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <HydrationContext.Provider value={{ isHydrated }}>
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydration() {
  return useContext(HydrationContext);
}