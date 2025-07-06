"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Camera, 
  Save, 
  Loader2, 
  Upload, 
  X, 
  CheckCircle,
  MapPin,
  DollarSign,
  Globe,
  Phone,
  Mail,
  Eye
} from "lucide-react";
import Link from "next/link";
import { TierBadge } from "@/components/ui/tier-badge";
import { UsageMeter } from "@/components/ui/usage-meter";
import { useSubscription } from "@/hooks/useSubscription";
import { usePortfolioLimits } from "@/hooks/useFeatureGate";
import { ProtectedUploadButton } from "@/components/ui/protected-button";
import { PortfolioUpgradePrompt } from "@/components/ui/upgrade-prompt";

interface UserProfile {
  id: string;
  name: string;
  bio: string;
  avatar_url?: string;
  website_url?: string;
  location?: string;
  per_video_rate?: number;
  specialties?: string[];
  industry_niches?: string[];
  tier_level: 'free' | 'pro' | 'premium';
  user_type: 'editor' | 'client';
  availability_status?: string;
  years_experience?: number;
  portfolio_urls?: string[];
}

const SPECIALTIES = [
  "Video Editing",
  "Motion Graphics",
  "Color Grading",
  "Sound Design/Audio",
  "Animation",
  "Short-Form Content (TikTok/Instagram/YouTube Shorts)",
  "Long-Form Content (YouTube/Podcasts)"
];

const INDUSTRY_NICHES = [
  "Real Estate",
  "Fitness & Health",
  "Educational",
  "Business/Corporate",
  "Podcasts",
  "E-commerce/Product",
  "Personal Brands/Influencers",
  "Agencies",
  "Music",
  "Sports",
  "Other"
];

export default function EditProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Add subscription hook
  const subscription = useSubscription(user?.id);
  const portfolioLimits = usePortfolioLimits(user?.id, subscription.tier);
  const [usageData, setUsageData] = useState({
    portfolioUploads: 0,
    messagesSent: 0
  });

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website_url: "",
    location: "",
    per_video_rate: "",
    specialties: [] as string[],
    industry_niches: [] as string[],
    availability_status: "available",
    years_experience: "",
    portfolio_urls: [] as string[]
  });

  // Load usage data
  const loadUsageData = async () => {
    if (!user?.id) return;

    try {
      const [portfolioUsage, messagesUsage] = await Promise.all([
        subscription.checkUsageLimit('portfolio_uploads').catch(err => {
          console.warn('Portfolio usage tracking unavailable:', err);
          return { currentUsage: 0, limit: null, canPerform: true };
        }),
        subscription.checkUsageLimit('messages_sent').catch(err => {
          console.warn('Messages usage tracking unavailable:', err);
          return { currentUsage: 0, limit: null, canPerform: true };
        })
      ]);

      setUsageData({
        portfolioUploads: portfolioUsage.currentUsage,
        messagesSent: messagesUsage.currentUsage
      });
    } catch (error) {
      console.warn('Usage tracking not available, using defaults:', error);
      // Set default values if usage tracking is not available
      setUsageData({
        portfolioUploads: 0,
        messagesSent: 0
      });
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProfile();
      } else {
        router.push('/login');
      }
    };

    getUser();
  }, []);

  // Load usage data when subscription is ready
  useEffect(() => {
    if (user?.id && !subscription.loading) {
      loadUsageData().catch(error => {
        console.warn('Usage data loading failed, continuing without usage tracking:', error);
        // Set safe defaults and continue
        setUsageData({
          portfolioUploads: 0,
          messagesSent: 0
        });
      });
    }
  }, [user?.id, subscription.loading]);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Check user type
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (userData?.user_type === 'editor') {
        const { data: editorProfile, error } = await supabase
          .from('editor_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          setError('Profile not found');
          return;
        }

        const profileData = {
          ...editorProfile,
          user_type: 'editor' as const
        };

        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
          bio: profileData.bio || "",
          website_url: profileData.website_url || "",
          location: profileData.location || "",
          per_video_rate: profileData.per_video_rate?.toString() || "",
          specialties: profileData.specialties || [],
          industry_niches: profileData.industry_niches || [],
          availability_status: profileData.availability_status || "available",
          years_experience: profileData.years_experience?.toString() || "",
          portfolio_urls: profileData.portfolio_urls || []
        });
      } else {
        // For clients, get data from users table
        const { data: clientData, error: clientError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (clientError) {
          setError('User profile not found');
          return;
        }

        const profileData = {
          id: session.user.id,
          name: clientData.name || session.user.email?.split('@')[0] || 'Client',
          bio: clientData.bio || '',
          user_type: 'client' as const,
          tier_level: 'free' as const,
          avatar_url: clientData.avatar_url,
          location: clientData.location
        };

        setProfile(profileData);
        setFormData({
          name: profileData.name,
          bio: profileData.bio,
          website_url: "",
          location: profileData.location || "",
          per_video_rate: "",
          specialties: [],
          industry_niches: [],
          availability_status: "available",
          years_experience: "",
          portfolio_urls: []
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleIndustryNicheToggle = (niche: string) => {
    setFormData(prev => ({
      ...prev,
      industry_niches: prev.industry_niches.includes(niche)
        ? prev.industry_niches.filter(n => n !== niche)
        : [...prev.industry_niches, niche]
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Create unique filename with user ID folder structure for RLS
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true  // Allow overwriting existing files
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      if (profile?.user_type === 'editor') {
        const { error: updateError } = await supabase
          .from('editor_profiles')
          .update({ avatar_url: avatarUrl })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else if (profile?.user_type === 'client') {
        // For clients, update the users table with avatar_url
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      setSuccess('Avatar updated successfully!');

      // Notify header component to refresh profile
      window.dispatchEvent(new CustomEvent('profileUpdated'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    setError(null);

    try {
      if (profile.user_type === 'editor') {
        const updateData = {
          name: formData.name,
          bio: formData.bio,
          website_url: formData.website_url || null,
          location: formData.location || null,
          per_video_rate: formData.per_video_rate ? parseFloat(formData.per_video_rate) : null,
          specialties: formData.specialties,
          industry_niches: formData.industry_niches,
          availability_status: formData.availability_status,
          years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
          portfolio_urls: formData.portfolio_urls.filter(url => url.trim()),
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('editor_profiles')
          .update(updateData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else if (profile.user_type === 'client') {
        // For clients, update the users table
        const updateData = {
          name: formData.name,
          bio: formData.bio,
          location: formData.location,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);

        if (error) throw error;
      }

      setSuccess('Profile updated successfully!');
      
      // Refresh profile data to get the latest from database
      await loadProfile();

      // Notify header component to refresh profile
      window.dispatchEvent(new CustomEvent('profileUpdated'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Profile save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addPortfolioUrl = async () => {
    // Check if user can add more portfolio items
    if (!portfolioLimits.canUpload) {
      return; // Button should prevent this, but extra safety
    }

    setFormData(prev => ({
      ...prev,
      portfolio_urls: [...prev.portfolio_urls, ""]
    }));

    // Increment usage tracking if this is a new upload (optional - don't let errors block functionality)
    if (user?.id && subscription.tier) {
      try {
        await subscription.incrementUsage('portfolio_uploads');
        await portfolioLimits.refresh(); // Refresh limits
      } catch (error) {
        console.warn('Usage tracking not available, continuing without tracking:', error);
        // Don't let usage tracking errors prevent portfolio functionality
      }
    }
  };

  const updatePortfolioUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio_urls: prev.portfolio_urls.map((url, i) => i === index ? value : url)
    }));
  };

  const removePortfolioUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio_urls: prev.portfolio_urls.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">Unable to load your profile.</p>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">Edit Profile</h1>
              <p className="text-gray-600 dark:text-muted-foreground">Manage your profile information and settings</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:w-auto">
              {profile.user_type === 'editor' && (
                <Link href={`/editor/${profile.id}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </Link>
              )}
              <Link href={profile.user_type === 'editor' ? '/dashboard/editor' : '/dashboard/client'} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {success}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Basic Information</CardTitle>
                <CardDescription className="dark:text-muted-foreground">Update your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your professional name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, State/Country"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell clients about your background, experience, and what makes you unique..."
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="website"
                        value={formData.website_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                        placeholder="https://yourwebsite.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {profile.user_type === 'editor' && (
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.years_experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                        placeholder="5"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Editor-specific fields */}
            {profile.user_type === 'editor' && (
              <>
                {/* Specialties */}
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Specialties</CardTitle>
                    <CardDescription className="dark:text-muted-foreground">Select your areas of expertise</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SPECIALTIES.map((specialty) => (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() => handleSpecialtyToggle(specialty)}
                          className={`p-2 rounded-md border text-xs font-medium transition-all text-center ${
                            formData.specialties.includes(specialty)
                              ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300"
                              : "bg-white dark:bg-card border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:border-purple-200 dark:hover:border-purple-500"
                          }`}
                        >
                          {formData.specialties.includes(specialty) && (
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                          )}
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Industry Niches */}
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Industry Niches</CardTitle>
                    <CardDescription className="dark:text-muted-foreground">Select the industries you prefer to work with</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {INDUSTRY_NICHES.map((niche) => (
                        <button
                          key={niche}
                          type="button"
                          onClick={() => handleIndustryNicheToggle(niche)}
                          className={`p-2 rounded-md border text-xs font-medium transition-all text-center ${
                            formData.industry_niches.includes(niche)
                              ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                              : "bg-white dark:bg-card border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:border-blue-200 dark:hover:border-blue-500"
                          }`}
                        >
                          {formData.industry_niches.includes(niche) && (
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                          )}
                          {niche}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Pricing & Availability</CardTitle>
                    <CardDescription className="dark:text-muted-foreground">Set your rates and availability status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="per_video_rate" className="dark:text-foreground">Per Video Rate (USD)</Label>
                      <div className="relative max-w-xs">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
                        <Input
                          id="per_video_rate"
                          type="number"
                          value={formData.per_video_rate}
                          onChange={(e) => setFormData(prev => ({ ...prev, per_video_rate: e.target.value }))}
                          placeholder="500"
                          min="1"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="dark:text-foreground">Availability Status</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "available", label: "Available", color: "green" },
                          { value: "busy", label: "Busy", color: "yellow" },
                          { value: "unavailable", label: "Unavailable", color: "red" }
                        ].map(({ value, label, color }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, availability_status: value }))}
                            className={`px-3 py-2 rounded-md border text-xs font-medium transition-all ${
                              formData.availability_status === value
                                ? color === "green" 
                                  ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300"
                                  : color === "yellow"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300"
                                  : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300"
                                : "bg-white dark:bg-card border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Portfolio URLs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Portfolio Links</CardTitle>
                    <CardDescription className="dark:text-muted-foreground">
                      Add links to your work and portfolio
                      {subscription.tier === 'free' && (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {' '}(Limited to 3 videos on Free plan)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.portfolio_urls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => updatePortfolioUrl(index, e.target.value)}
                          placeholder="https://vimeo.com/your-video"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePortfolioUrl(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Feature-gated add button */}
                    {portfolioLimits.canUpload ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPortfolioUrl}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Portfolio Link
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <ProtectedUploadButton
                          canUpload={portfolioLimits.canUpload}
                          currentTier={subscription.tier}
                          currentCount={portfolioLimits.currentCount}
                          limit={portfolioLimits.limit || 3}
                          onUpload={addPortfolioUrl}
                          variant="outline"
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Add Portfolio Link
                        </ProtectedUploadButton>
                        
                        {/* Show upgrade prompt for free users */}
                        {subscription.tier === 'free' && (
                          <PortfolioUpgradePrompt 
                            currentCount={portfolioLimits.currentCount}
                            limit={portfolioLimits.limit || 3}
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Photo - moved to top */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Profile Photo</CardTitle>
                <CardDescription className="dark:text-muted-foreground">Upload a professional headshot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile?.name || "Profile"}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center border-4 border-white dark:border-gray-600 shadow-lg">
                      <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  
                  <div className="w-full">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-colors text-center">
                        {uploadingAvatar ? (
                          <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                            <Upload className="w-4 h-4 mr-2" />
                            Change Photo
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Subscription Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!subscription.loading && (
                  <div className="w-full">
                    <TierBadge tier={subscription.tier} size="lg" className="w-full justify-center" />
                  </div>
                )}

                {subscription.tier === 'free' && (
                  <div className="text-center space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        You're on the free plan with limited features.
                      </p>
                    </div>
                    <Link href="/pricing">
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                )}

                {subscription.tier === 'pro' && (
                  <div className="text-center space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        You have access to professional features.
                      </p>
                    </div>
                    <Link href="/pricing">
                      <Button variant="outline" className="w-full">
                        Upgrade to Featured
                      </Button>
                    </Link>
                  </div>
                )}

                {subscription.tier === 'featured' && (
                  <div className="text-center">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        You have access to all premium features!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Usage This Month</CardTitle>
                <CardDescription className="dark:text-muted-foreground">Track your current usage against plan limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!subscription.loading && (
                  <>
                    <UsageMeter
                      metricName="Portfolio Videos"
                      current={usageData.portfolioUploads}
                      limit={subscription.tier === 'free' ? 3 : null}
                      tier={subscription.tier}
                      showUpgrade={true}
                    />
                    
                    <UsageMeter
                      metricName="Messages Sent"
                      current={usageData.messagesSent}
                      limit={subscription.tier === 'free' ? 5 : subscription.tier === 'pro' ? 50 : null}
                      tier={subscription.tier}
                      showUpgrade={true}
                    />
                  </>
                )}

                {subscription.loading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button - moved outside grid to appear at bottom on mobile */}
        <div className="mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 