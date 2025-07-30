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
          additional_notes: formData.additional_notes || null,
          status: 'open'
        });

      console.log('Creating project with client_id:', userId);
      console.log('Project creation error:', insertError);

      if (insertError) {
        console.error('Failed to create project:', insertError);
        throw new Error(insertError.message);
      }

      console.log('Project created successfully!');

      // Success! Redirect to dashboard with force refresh
      router.push("/dashboard/client");
      router.refresh();
      
      // Also trigger a window reload as backup to ensure fresh data
      window.location.href = "/dashboard/client";

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
        
        <div className="space-y-2">
          <Label htmlFor="title" className="dark:text-foreground">Project Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Wedding Video Editing for Sarah & John"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="dark:text-foreground">Project Description *</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your project in detail. What type of video editing do you need? What's the story you want to tell?"
            rows={4}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="project_type" className="dark:text-foreground">Project Type</Label>
            <select
              id="project_type"
              value={formData.project_type}
              onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              <option value="">Select project type</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_length" className="dark:text-foreground">Expected Video Length</Label>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget & Timeline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="budget" className="dark:text-foreground">Budget (USD) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Total project budget</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="dark:text-foreground">Deadline *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
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
          <Label className="dark:text-foreground">Project Urgency</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {URGENCY_LEVELS.map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, urgency: value }))}
                className={`p-4 rounded-lg border text-sm font-medium transition-all ${
                  formData.urgency === value
                    ? color === "green" 
                      ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300"
                      : color === "yellow"
                      ? "bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300"
                      : "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500"
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Requirements</h3>
        
        <div className="space-y-2">
          <Label htmlFor="requirements" className="dark:text-foreground">Specific Requirements</Label>
          <textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
            placeholder="List any specific requirements: software preferences, file formats, resolution, special effects needed, etc."
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>


        <div className="space-y-2">
          <Label htmlFor="additional_notes" className="dark:text-foreground">Additional Notes</Label>
          <textarea
            id="additional_notes"
            value={formData.additional_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
            placeholder="Any other information that would help editors understand your project better"
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
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
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
          Your project will be visible to all editors immediately after posting
        </p>
      </div>
    </form>
  );
} 