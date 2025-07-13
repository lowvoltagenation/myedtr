"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

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

const EXPERIENCE_LEVELS = [
  "Beginner (0-1 years)",
  "Intermediate (2-4 years)", 
  "Advanced (5-7 years)",
  "Expert (8+ years)"
];

interface CreateProfileFormProps {
  userId: string;
}

export function CreateProfileForm({ userId }: CreateProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    specialties: [] as string[],
    industry_niches: [] as string[],
    experience_level: "",
    per_video_rate: "",
    location: "",
    portfolio_description: "",

  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Validate required fields
      if (!formData.display_name || !formData.bio || formData.specialties.length === 0 || formData.industry_niches.length === 0 || !formData.per_video_rate) {
        throw new Error("Please fill in all required fields including at least one specialty and one industry niche");
      }

      if (parseFloat(formData.per_video_rate) <= 0) {
        throw new Error("Per video rate must be greater than 0");
      }

      // Create the profile
      const { error: insertError } = await supabase
        .from('editor_profiles')
        .insert({
          user_id: userId,
          name: formData.display_name,
          bio: formData.bio,
          specialties: formData.specialties,
          industry_niches: formData.industry_niches,
          per_video_rate: parseFloat(formData.per_video_rate),
          location: formData.location || null
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Success! Redirect to dashboard
      router.push("/dashboard/editor");
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="display_name" className="dark:text-foreground">Display Name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Your professional name"
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="dark:text-foreground">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State/Country"
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="dark:text-foreground">Professional Bio *</Label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell clients about your video editing experience, style, and what makes you unique..."
            rows={4}
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Specialties *</h3>
        <p className="text-sm text-gray-600 dark:text-muted-foreground">Select all areas you specialize in (choose at least one)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SPECIALTIES.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => handleSpecialtyToggle(specialty)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-center ${
                formData.specialties.includes(specialty)
                  ? "bg-purple-100 border-purple-400 text-purple-700 dark:bg-purple-900/40 dark:border-purple-500 dark:text-purple-300"
                  : "bg-white border-gray-300 text-gray-700 hover:border-purple-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:border-purple-400"
              }`}
            >
              {formData.specialties.includes(specialty) && (
                <CheckCircle className="w-4 h-4 inline mr-2" />
              )}
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Industry Niches */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Industry Niches *</h3>
        <p className="text-sm text-gray-600 dark:text-muted-foreground">Select the industries you prefer to work with (choose at least one)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {INDUSTRY_NICHES.map((niche) => (
            <button
              key={niche}
              type="button"
              onClick={() => handleIndustryNicheToggle(niche)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-center ${
                formData.industry_niches.includes(niche)
                  ? "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300"
                  : "bg-white border-gray-300 text-gray-700 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:border-blue-400"
              }`}
            >
              {formData.industry_niches.includes(niche) && (
                <CheckCircle className="w-4 h-4 inline mr-2" />
              )}
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Experience & Rate */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Experience & Pricing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="experience_level" className="dark:text-foreground">Experience Level</Label>
            <select
              id="experience_level"
              value={formData.experience_level}
              onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select experience level</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="per_video_rate" className="dark:text-foreground">Per Video Rate (USD) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <Input
                id="per_video_rate"
                type="number"
                value={formData.per_video_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, per_video_rate: e.target.value }))}
                placeholder="500"
                min="1"
                step="1"
                className="pl-8 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">Set your rate per video project</p>
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio</h3>
        <div className="space-y-2">
          <Label htmlFor="portfolio_description" className="dark:text-foreground">Portfolio Description</Label>
          <textarea
            id="portfolio_description"
            value={formData.portfolio_description}
            onChange={(e) => setFormData(prev => ({ ...prev, portfolio_description: e.target.value }))}
            placeholder="Describe your best work, notable projects, or provide links to your portfolio..."
            rows={4}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
      </div>



      {/* Submit */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Profile...
            </>
          ) : (
            "Create Profile"
          )}
        </Button>
      </div>
    </form>
  );
} 