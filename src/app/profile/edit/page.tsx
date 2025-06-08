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

interface UserProfile {
  id: string;
  name: string;
  bio: string;
  avatar_url?: string;
  website_url?: string;
  location?: string;
  hourly_rate?: number;
  specialties?: string[];
  tier_level: 'free' | 'pro' | 'premium';
  user_type: 'editor' | 'client';
  availability_status?: string;
  years_experience?: number;
  portfolio_urls?: string[];
}

const SPECIALTIES = [
  "Motion Graphics",
  "Color Grading", 
  "Storytelling",
  "Documentary",
  "Commercial",
  "Music Videos",
  "Wedding Videos",
  "Corporate Videos",
  "YouTube Content",
  "Social Media Content"
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

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website_url: "",
    location: "",
    hourly_rate: "",
    specialties: [] as string[],
    availability_status: "available",
    years_experience: "",
    portfolio_urls: [] as string[]
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
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
          hourly_rate: profileData.hourly_rate?.toString() || "",
          specialties: profileData.specialties || [],
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
          hourly_rate: "",
          specialties: [],
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
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          specialties: formData.specialties,
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
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addPortfolioUrl = () => {
    setFormData(prev => ({
      ...prev,
      portfolio_urls: [...prev.portfolio_urls, ""]
    }));
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
              <p className="text-gray-600">Manage your profile information and settings</p>
            </div>
            <div className="flex gap-3">
              {profile.user_type === 'editor' && (
                <Link href={`/editor/${profile.id}`}>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </Link>
              )}
              <Link href={profile.user_type === 'editor' ? '/dashboard/editor' : '/dashboard/client'}>
                <Button variant="ghost">
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
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your basic profile details</CardDescription>
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
                    <CardTitle>Specialties</CardTitle>
                    <CardDescription>Select your areas of expertise</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SPECIALTIES.map((specialty) => (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() => handleSpecialtyToggle(specialty)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            formData.specialties.includes(specialty)
                              ? "bg-purple-100 border-purple-300 text-purple-700"
                              : "bg-white border-gray-200 text-gray-700 hover:border-purple-200"
                          }`}
                        >
                          {formData.specialties.includes(specialty) && (
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                          )}
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Availability</CardTitle>
                    <CardDescription>Set your rates and availability status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="hourly_rate"
                            type="number"
                            value={formData.hourly_rate}
                            onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                            placeholder="50"
                            min="1"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Availability Status</Label>
                        <div className="flex gap-2">
                          {[
                            { value: "available", label: "Available", color: "green" },
                            { value: "busy", label: "Busy", color: "yellow" },
                            { value: "unavailable", label: "Unavailable", color: "red" }
                          ].map(({ value, label, color }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, availability_status: value }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.availability_status === value
                                  ? color === "green" 
                                    ? "bg-green-100 border-green-300 text-green-700"
                                    : color === "yellow"
                                    ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                                    : "bg-red-100 border-red-300 text-red-700"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Portfolio URLs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Links</CardTitle>
                    <CardDescription>Add links to your work and portfolio</CardDescription>
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPortfolioUrl}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add Portfolio Link
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Upload a professional photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Click the camera icon to upload a new photo
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Max size: 5MB. Formats: JPG, PNG, GIF
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <Badge variant="outline" className="capitalize">
                    {profile.user_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan</span>
                  <Badge className={`${
                    profile.tier_level === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    profile.tier_level === 'pro' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {profile.tier_level}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="text-sm text-gray-900">{user?.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 