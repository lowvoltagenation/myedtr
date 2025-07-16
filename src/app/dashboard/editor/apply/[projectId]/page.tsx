"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calendar, Clock, User, Briefcase, AlertCircle, CheckCircle, MessageCircle } from "lucide-react";
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
  name: string;
  per_video_rate: number;
  specialties: string[];
  bio: string;
}

interface Application {
  id: string;
  cover_letter: string;
  proposed_rate: number;
  status: string;
  created_at: string;
}

export default function ApplyToProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [editorProfile, setEditorProfile] = useState<EditorProfile | null>(null);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      fetchProjectAndProfile();
    }
  }, [projectId, isAuthenticated, authLoading, user?.id]);

  const fetchProjectAndProfile = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    try {

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
      setProposedRate(profile.per_video_rate?.toString() || "");

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

      setProject(projectData);

      // Check if user already applied (this is where the 406 error occurs)
      console.log('🔍 Checking for existing application:', { projectId, editorId: user.id });
      const { data: applicationData, error: appError } = await supabase
        .from('project_applications')
        .select('*')
        .eq('project_id', projectId)
        .eq('editor_id', user.id)
        .single();

      if (appError) {
        console.log('📝 Application check error (this is expected if no application exists):', appError);
        // Only log the error if it's not a "not found" error
        if (appError.code !== 'PGRST116') {
          console.error('❌ Unexpected application check error:', appError);
        }
      }

      if (applicationData) {
        setExistingApplication(applicationData);
        return;
      }

      // Check if project is still open (only if they haven't applied)
      if (projectData.status !== 'open') {
        setError('This project is no longer accepting applications');
        return;
      }

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
      setError('Please enter a valid price per video');
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    try {
      if (!user?.id) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default: return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Project</h3>
              <p className="text-gray-600 dark:text-muted-foreground mb-4">{error}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Application Submitted!</h3>
              <p className="text-gray-600 dark:text-muted-foreground mb-4">
                Your application has been sent to the client. You'll be notified when they respond.
              </p>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">Redirecting to dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={existingApplication ? "/dashboard/editor/applications" : "/dashboard/editor/browse-projects"} className="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {existingApplication ? "Back to My Applications" : "Back to Projects"}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {existingApplication ? "Project Details" : "Apply to Project"}
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            {existingApplication 
              ? "View the project details and your application status"
              : "Submit your application for this video editing project"
            }
          </p>
        </div>

        {/* Application Status Banner (if already applied) */}
        {existingApplication && (
          <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(existingApplication.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Application {existingApplication.status === 'pending' ? 'Submitted' : existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
                    </h3>
                    <p className="text-gray-600 dark:text-muted-foreground text-sm">
                      Applied on {new Date(existingApplication.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusColor(existingApplication.status)}>
                    {existingApplication.status}
                  </Badge>
                  {existingApplication.status === 'accepted' && (
                    <Link href={`/messages/${projectId}`}>
                      <Button size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message Client
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl dark:text-white">{project?.title}</CardTitle>
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
                    <Badge variant="outline">
                      {project?.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-muted-foreground">
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Project Description</h3>
                    <p className="text-gray-700 dark:text-muted-foreground">{project?.description}</p>
                  </div>
                  
                  {project?.requirements && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h3>
                      <p className="text-gray-700 dark:text-muted-foreground">{project.requirements}</p>
                    </div>
                  )}
                  
                  {project?.style_preferences && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Style Preferences</h3>
                      <p className="text-gray-700 dark:text-muted-foreground">{project.style_preferences}</p>
                    </div>
                  )}
                  
                  {project?.additional_notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Additional Notes</h3>
                      <p className="text-gray-700 dark:text-muted-foreground">{project.additional_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Show Application Form or Existing Application */}
            {existingApplication ? (
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-white">Your Application</CardTitle>
                  <CardDescription className="dark:text-muted-foreground">
                    Here's what you submitted for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cover Letter</h4>
                      <div className="bg-gray-50 dark:bg-muted/30 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-muted-foreground whitespace-pre-wrap">
                          {existingApplication.cover_letter}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Proposed Rate</h4>
                      <div className="flex items-center gap-1 text-lg font-semibold text-gray-900 dark:text-white">
                        <DollarSign className="h-5 w-5" />
                        <span>${existingApplication.proposed_rate}/video</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Link href="/dashboard/editor/applications" className="flex-1">
                        <Button variant="outline" className="w-full">
                          View All Applications
                        </Button>
                      </Link>
                      {existingApplication.status === 'accepted' && (
                        <Link href={`/messages/${projectId}`} className="flex-1">
                          <Button className="w-full">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message Client
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-white">Your Application</CardTitle>
                  <CardDescription className="dark:text-muted-foreground">Tell the client why you're the right fit for this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cover Letter */}
                    <div>
                      <Label htmlFor="coverLetter" className="dark:text-foreground">Cover Letter *</Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Introduce yourself and explain why you're perfect for this project. Mention relevant experience, your approach, and what makes you stand out..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={8}
                        className="mt-2"
                        required
                      />
                      <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                        {coverLetter.length}/1000 characters
                      </p>
                    </div>

                    {/* Proposed Rate */}
                    <div>
                      <Label htmlFor="proposedRate" className="dark:text-foreground">Price per Video *</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4" />
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
                      <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                                                    Your current rate: ${editorProfile?.per_video_rate}/video
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                          <p className="text-red-700 dark:text-red-400">{error}</p>
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
            )}
          </div>

          {/* Sidebar - Your Profile */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
                <CardDescription className="dark:text-muted-foreground">
                  {existingApplication ? "This is how the client sees you" : "This is how the client will see you"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{editorProfile?.name}</h3>
                    <p className="text-gray-600 dark:text-muted-foreground text-sm line-clamp-3">{editorProfile?.bio}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">Specialties:</p>
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
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                                                <span className="font-semibold">${editorProfile?.per_video_rate}/video</span>
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