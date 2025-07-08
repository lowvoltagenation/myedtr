"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  User,
  Settings,
  LogOut,
  MessageCircle,
  Briefcase,
  Star,
  CreditCard,
  Bell,
  Menu,
  X,
  ChevronDown,
  Eye,
  Crown,
  LayoutDashboard
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TierBadge } from "@/components/ui/tier-badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth, useAvatar } from "@/hooks/useAuth";

// Create supabase client once outside component
const supabase = createClient();

export function Header() {
  // Auth context - simplified single source of truth
  const { user, profile, isAuthenticated, isEditor, isClient, loading, hydrated } = useAuth();
  const { avatarUrl, fallbackLetter, hasAvatar, retryAvatar } = useAvatar();
  
  // Local component state
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [avatarError, setAvatarError] = useState(false); // Keep for now, will simplify further
  
  const router = useRouter();
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();

  // Add subscription hook (keep existing integration)
  const subscription = useSubscription(user?.id);

  // Handle theme hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'pro': return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/(auth)');
  
  // Only hide header on auth pages, not on home page
  if (isAuthPage) return null;

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                {!mounted ? (
                  // Show placeholder during hydration
                  <div className="h-8 w-[120px] bg-muted rounded animate-pulse" />
                ) : resolvedTheme === 'dark' ? (
                  <Image 
                    src="/logo-dark.svg" 
                    alt="MyEdtr" 
                    width={120} 
                    height={32}
                    className="h-8 w-auto" 
                    priority
                  />
                ) : (
                  <Image 
                    src="/logo-light.svg" 
                    alt="MyEdtr" 
                    width={120} 
                    height={32}
                    className="h-8 w-auto" 
                    priority
                  />
                )}
              </Link>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/browse" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/browse' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Browse Editors
              </Link>
              <Link 
                href="/about" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/about' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                How it Works
              </Link>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search for video editing services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
              </form>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {(loading || !hydrated) ? (
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-8 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                  <div className="w-12 h-8 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <>
                  {/* Messages */}
                  <Link href="/messages">
                    <Button variant="ghost" size="sm" className="relative">
                      <MessageCircle className="w-4 h-4" />
                      {/* Notification badge placeholder */}
                      {/* <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
                    </Button>
                  </Link>

                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {/* <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
                  </Button>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                        {loading ? (
                          <div className="h-8 w-8 bg-gray-200 dark:bg-muted rounded-full animate-pulse" />
                        ) : hasAvatar && !avatarError ? (
                          <img
                            src={avatarUrl!}
                            alt={profile?.name || user?.email || "User"}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={() => {
                              setAvatarError(true);
                              // Automatically retry avatar loading
                              setTimeout(() => retryAvatar(), 1000);
                            }}
                            onLoad={() => setAvatarError(false)}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                            {fallbackLetter}
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                              {loading ? (
                                <span className="h-4 bg-gray-200 dark:bg-muted rounded w-20 block animate-pulse"></span>
                              ) : (
                                profile?.name || user?.email?.split('@')[0] || "User"
                              )}
                            </p>
                            {!subscription.loading && !loading && (
                              <TierBadge tier={subscription.tier} size="sm" />
                            )}
                          </div>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Dashboard Link */}
                      {isClient && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/client">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {isEditor && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/editor">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {isEditor && profile?.id && (
                        <DropdownMenuItem asChild>
                          <Link href={`/editor/${profile.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Public Profile
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem asChild>
                        <Link href="/profile/edit">
                          <Settings className="mr-2 h-4 w-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>

                      {subscription.tier === 'free' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/pricing" className="text-purple-600 font-medium">
                              <Crown className="mr-2 h-4 w-4" />
                              Upgrade to Pro
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">
                      Join
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-card border-t dark:border-border">
              {/* Mobile Search */}
              <div className="px-3 pb-3">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full"
                    />
                  </div>
                </form>
              </div>

              {/* Mobile Navigation */}
              <Link
                href="/browse"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Editors
              </Link>
              
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </Link>

              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  {isClient && (
                    <Link
                      href="/dashboard/client"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {isEditor && (
                    <Link
                      href="/dashboard/editor"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/messages"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/pricing"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
} 