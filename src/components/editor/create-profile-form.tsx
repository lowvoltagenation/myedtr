"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

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
    experience_level: "",
    hourly_rate: "",
    location: "",
    portfolio_description: "",
    availability: "available" as "available" | "busy" | "unavailable"
  });

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Validate required fields
      if (!formData.display_name || !formData.bio || formData.specialties.length === 0 || !formData.hourly_rate) {
        throw new Error("Please fill in all required fields");
      }

      if (parseFloat(formData.hourly_rate) <= 0) {
        throw new Error("Hourly rate must be greater than 0");
      }

      // Create the profile
      const { error: insertError } = await supabase
        .from('editor_profiles')
        .insert({
          user_id: userId,
          name: formData.display_name,
          bio: formData.bio,
          specialties: formData.specialties,
          hourly_rate: parseFloat(formData.hourly_rate),
          location: formData.location || null,
          availability_status: formData.availability
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Your professional name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State/Country"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio *</Label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell clients about your video editing experience, style, and what makes you unique..."
            rows={4}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Specialties *</h3>
        <p className="text-sm text-gray-600">Select all areas you specialize in (choose at least one)</p>
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
      </div>

      {/* Experience & Rate */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Experience & Pricing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="experience_level">Experience Level</Label>
            <select
              id="experience_level"
              value={formData.experience_level}
              onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select experience level</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate (USD) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                placeholder="50"
                min="1"
                step="1"
                className="pl-8"
                required
              />
            </div>
            <p className="text-xs text-gray-500">Set your standard hourly rate</p>
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
        <div className="space-y-2">
          <Label htmlFor="portfolio_description">Portfolio Description</Label>
          <textarea
            id="portfolio_description"
            value={formData.portfolio_description}
            onChange={(e) => setFormData(prev => ({ ...prev, portfolio_description: e.target.value }))}
            placeholder="Describe your best work, notable projects, or provide links to your portfolio..."
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
        <div className="space-y-2">
          <Label>Current Status</Label>
          <div className="flex gap-3">
            {[
              { value: "available", label: "Available", color: "green" },
              { value: "busy", label: "Busy", color: "yellow" },
              { value: "unavailable", label: "Unavailable", color: "red" }
            ].map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, availability: value as any }))}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  formData.availability === value
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

      {/* Submit */}
      <div className="pt-6 border-t">
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