"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  ChevronDown
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  tier_level: 'free' | 'pro' | 'premium';
  user_type: 'editor' | 'client';
}

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string, sessionUser: any) => {
    try {
      // Check if user is an editor or client
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (userData?.user_type === 'editor') {
        // Get editor profile with explicit avatar_url selection
        const { data: editorProfile } = await supabase
          .from('editor_profiles')
          .select('id, name, avatar_url, tier_level')
          .eq('user_id', userId)
          .single();

        if (editorProfile) {
          setProfile({
            ...editorProfile,
            user_type: 'editor'
          });
        } else {
          // Editor profile doesn't exist yet
          setProfile({
            id: userId,
            name: sessionUser?.email?.split('@')[0] || 'Editor',
            user_type: 'editor',
            tier_level: 'free'
          });
        }
      } else {
        // For clients, we'll use user data directly or default
        setProfile({
          id: userId,
          name: sessionUser?.email?.split('@')[0] || 'Client',
          user_type: userData?.user_type || 'client',
          tier_level: 'free'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback profile
      setProfile({
        id: userId,
        name: sessionUser?.email?.split('@')[0] || 'User',
        user_type: 'client',
        tier_level: 'free'
      });
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user);
        } else {
          setProfile(null);
        }
      }
    );

    // Listen for profile updates from other components
    const handleProfileUpdate = () => {
      if (user) {
        // Force a complete refresh
        setProfile(null);
        setTimeout(() => fetchProfile(user.id, user), 100);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [supabase.auth, user, fetchProfile]);

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
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-foreground">MyEdtr</span>
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
              {user && profile?.user_type === 'client' && (
                <Link 
                  href="/dashboard/client" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith('/dashboard/client') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {user && profile?.user_type === 'editor' && (
                <Link 
                  href="/dashboard/editor" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith('/dashboard/editor') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
              )}
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
              
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : user ? (
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
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile?.name || "User"}
                          className="h-8 w-8 rounded-full object-cover border-2 border-red-500 cursor-pointer"
                          onLoad={() => console.log('Header avatar loaded!')}
                          onError={(e) => console.error('Header avatar failed:', e)}
                        />
                      ) : (
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                            {profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                          </div>
                        </Button>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium leading-none">
                              {profile?.name || user.email}
                            </p>
                            <Badge className={`text-xs px-2 py-0.5 ${getTierBadgeColor(profile?.tier_level || 'free')}`}>
                              {profile?.tier_level || 'free'}
                            </Badge>
                          </div>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground capitalize">
                            {profile?.user_type || 'user'}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Profile Actions */}
                      <DropdownMenuItem asChild>
                        <Link href="/profile/edit" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Edit Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      {profile?.user_type === 'editor' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/editor/${profile.id}`} className="flex items-center">
                            <Star className="mr-2 h-4 w-4" />
                            <span>Public Profile</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {/* Dashboard */}
                      <DropdownMenuItem asChild>
                        <Link 
                          href={profile?.user_type === 'editor' ? '/dashboard/editor' : '/dashboard/client'} 
                          className="flex items-center"
                        >
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Messages */}
                      <DropdownMenuItem asChild>
                        <Link href="/messages" className="flex items-center">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          <span>Messages</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Subscription */}
                      <DropdownMenuItem asChild>
                        <Link href="/subscription" className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Subscription</span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Settings */}
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Sign Out */}
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {/* Mobile Search */}
              <div className="px-3 pb-3">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Editors
              </Link>
              
              {user && profile?.user_type === 'client' && (
                <Link
                  href="/dashboard/client"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              {user && profile?.user_type === 'editor' && (
                <Link
                  href="/dashboard/editor"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </Link>

              {user && (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/messages"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/subscription"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
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