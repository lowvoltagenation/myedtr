"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calendar, Clock, User, Briefcase, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  project_type: string;
  urgency: string;
  requirements?: string;
  style_preferences?: string;
  additional_notes?: string;
  created_at: string;
  client_id: string;
}

interface EditorProfile {
  id: string;
  display_name: string;
  hourly_rate: number;
  specialties: string[];
  bio: string;
}

export default function ApplyToProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [editorProfile, setEditorProfile] = useState<EditorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  useEffect(() => {
    fetchProjectAndProfile();
  }, [projectId]);

  const fetchProjectAndProfile = async () => {
    const supabase = createClient();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get editor profile
      const { data: profile } = await supabase
        .from('editor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        router.push('/dashboard/editor/create-profile');
        return;
      }

      setEditorProfile(profile);
      setProposedRate(profile.hourly_rate?.toString() || "");

      // Get project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        setError('Project not found');
        return;
      }

      // Check if project is still open
      if (projectData.status !== 'open') {
        setError('This project is no longer accepting applications');
        return;
      }

      // Check if user already applied
      const { data: existingApplication } = await supabase
        .from('project_applications')
        .select('id')
        .eq('project_id', projectId)
        .eq('editor_id', user.id)
        .single();

      if (existingApplication) {
        setError('You have already applied to this project');
        return;
      }

      setProject(projectData);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coverLetter.trim()) {
      setError('Please write a cover letter');
      return;
    }

    if (!proposedRate || isNaN(Number(proposedRate)) || Number(proposedRate) <= 0) {
      setError('Please enter a valid hourly rate');
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to apply');
        return;
      }

      const { error: insertError } = await supabase
        .from('project_applications')
        .insert({
          project_id: projectId,
          editor_id: user.id,
          cover_letter: coverLetter.trim(),
          proposed_rate: Number(proposedRate),
          status: 'pending'
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/editor');
      }, 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Project</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/dashboard/editor/browse-projects">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Your application has been sent to the client. You'll be notified when they respond.
              </p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/editor/browse-projects" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply to Project</h1>
          <p className="text-gray-600">Submit your application for this video editing project</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{project?.title}</CardTitle>
                  <div className="flex gap-2">
                    {project?.urgency && (
                      <Badge variant={
                        project.urgency === 'rush' ? 'destructive' : 
                        project.urgency === 'urgent' ? 'default' : 
                        'secondary'
                      }>
                        {project.urgency}
                      </Badge>
                    )}
                    {project?.project_type && (
                      <Badge variant="outline">
                        {project.project_type}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  {project?.budget && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">${project.budget}</span>
                    </div>
                  )}
                  {project?.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted {new Date(project?.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Project Description</h3>
                    <p className="text-gray-700">{project?.description}</p>
                  </div>
                  
                  {project?.requirements && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                      <p className="text-gray-700">{project.requirements}</p>
                    </div>
                  )}
                  
                  {project?.style_preferences && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Style Preferences</h3>
                      <p className="text-gray-700">{project.style_preferences}</p>
                    </div>
                  )}
                  
                  {project?.additional_notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
                      <p className="text-gray-700">{project.additional_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Application Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Application</CardTitle>
                <CardDescription>Tell the client why you're the right fit for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Cover Letter */}
                  <div>
                    <Label htmlFor="coverLetter">Cover Letter *</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Introduce yourself and explain why you're perfect for this project. Mention relevant experience, your approach, and what makes you stand out..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={8}
                      className="mt-2"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {coverLetter.length}/1000 characters
                    </p>
                  </div>

                  {/* Proposed Rate */}
                  <div>
                    <Label htmlFor="proposedRate">Your Hourly Rate *</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="proposedRate"
                        type="number"
                        placeholder="50"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        className="pl-10"
                        min="1"
                        step="0.01"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Your current rate: ${editorProfile?.hourly_rate}/hour
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    <Link href="/dashboard/editor/browse-projects">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Your Profile */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
                <CardDescription>This is how the client will see you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{editorProfile?.display_name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{editorProfile?.bio}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {editorProfile?.specialties?.slice(0, 4).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {editorProfile?.specialties && editorProfile.specialties.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{editorProfile.specialties.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">${editorProfile?.hourly_rate}/hour</span>
                  </div>
                  
                  <Link href={`/editor/${editorProfile?.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-full">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 