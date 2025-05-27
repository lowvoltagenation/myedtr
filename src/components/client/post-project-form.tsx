"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Calendar, DollarSign } from "lucide-react";

const PROJECT_TYPES = [
  "YouTube Video",
  "Commercial/Advertisement",
  "Wedding Video",
  "Corporate Video",
  "Documentary",
  "Music Video",
  "Social Media Content",
  "Event Coverage",
  "Training/Educational",
  "Other"
];

const URGENCY_LEVELS = [
  { value: "low", label: "Standard (1-2 weeks)", color: "green" },
  { value: "medium", label: "Urgent (3-7 days)", color: "yellow" },
  { value: "high", label: "Rush (1-3 days)", color: "red" }
];

interface PostProjectFormProps {
  userId: string;
}

export function PostProjectForm({ userId }: PostProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_type: "",
    budget: "",
    deadline: "",
    urgency: "low",
    requirements: "",
    video_length: "",
    style_preferences: "",
    additional_notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Validate required fields
      if (!formData.title || !formData.description || !formData.budget || !formData.deadline) {
        throw new Error("Please fill in all required fields");
      }

      if (parseFloat(formData.budget) <= 0) {
        throw new Error("Budget must be greater than 0");
      }

      // Create the project
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          client_id: userId,
          title: formData.title,
          description: formData.description,
          project_type: formData.project_type || null,
          budget: parseFloat(formData.budget),
          deadline: formData.deadline,
          urgency: formData.urgency,
          requirements: formData.requirements || null,
          video_length: formData.video_length || null,
          style_preferences: formData.style_preferences || null,
          additional_notes: formData.additional_notes || null,
          status: 'open'
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Success! Redirect to dashboard
      router.push("/dashboard/client");
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
        
        <div className="space-y-2">
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Wedding Video Editing for Sarah & John"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Project Description *</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your project in detail. What type of video editing do you need? What's the story you want to tell?"
            rows={4}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="project_type">Project Type</Label>
            <select
              id="project_type"
              value={formData.project_type}
              onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select project type</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_length">Expected Video Length</Label>
            <Input
              id="video_length"
              value={formData.video_length}
              onChange={(e) => setFormData(prev => ({ ...prev, video_length: e.target.value }))}
              placeholder="e.g., 3-5 minutes, 30 seconds, 1 hour"
            />
          </div>
        </div>
      </div>

      {/* Budget & Timeline */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Budget & Timeline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (USD) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="500"
                min="1"
                step="1"
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500">Total project budget</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="pl-10"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Project Urgency</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {URGENCY_LEVELS.map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, urgency: value }))}
                className={`p-4 rounded-lg border text-sm font-medium transition-all ${
                  formData.urgency === value
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

      {/* Project Requirements */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Project Requirements</h3>
        
        <div className="space-y-2">
          <Label htmlFor="requirements">Specific Requirements</Label>
          <textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
            placeholder="List any specific requirements: software preferences, file formats, resolution, special effects needed, etc."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="style_preferences">Style Preferences</Label>
          <textarea
            id="style_preferences"
            value={formData.style_preferences}
            onChange={(e) => setFormData(prev => ({ ...prev, style_preferences: e.target.value }))}
            placeholder="Describe the style you're looking for: cinematic, documentary, fast-paced, minimalist, etc."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_notes">Additional Notes</Label>
          <textarea
            id="additional_notes"
            value={formData.additional_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
            placeholder="Any other information that would help editors understand your project better"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-6 border-t">
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting Project...
            </>
          ) : (
            "Post Project"
          )}
        </Button>
        <p className="text-sm text-gray-500 text-center mt-3">
          Your project will be visible to all editors immediately after posting
        </p>
      </div>
    </form>
  );
} 