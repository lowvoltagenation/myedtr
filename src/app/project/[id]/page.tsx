import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, MessageCircle, Clock, User } from "lucide-react";
import Link from "next/link";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  // Get user type
  const { data: userData } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect("/login");
  }

  // Get project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      users!client_id (
        id,
        email,
        name,
        avatar_url,
        location,
        created_at
      )
    `)
    .eq('id', params.id)
    .single();

  if (projectError || !project) {
    redirect("/dashboard");
  }

  // Get applications for this project
  const { data: applications } = await supabase
    .from('project_applications')
    .select(`
      *,
      editor_profiles (
        name,
        avatar_url,
        specialties,
        bio,
        location,
        per_video_rate,
        years_experience,
        created_at
      )
    `)
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  // Check if current user has applied (for editors)
  const userApplication = applications?.find(app => app.editor_id === user.id);

  // Get the accepted editor (if any)
  const acceptedApplication = applications?.find(app => app.status === 'accepted');

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'Standard (1-2 weeks)';
      case 'medium': return 'Urgent (3-7 days)';
      case 'high': return 'Rush (1-3 days)';
      default: return urgency;
    }
  };

  const isClient = userData.user_type === 'client';
  const isProjectOwner = isClient && project.client_id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={isClient ? "/dashboard/client" : "/dashboard/editor"} 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h1>
              <p className="text-gray-600 dark:text-muted-foreground">
                {isClient ? "Manage your project and review applications" : "Project details and application status"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/messages/${project.id}`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              {!isClient && userApplication && userApplication.status === 'accepted' && (
                <Button size="lg" className="w-full sm:w-auto">
                  Start Working
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {project.requirements && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h3>
                    <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
                      {project.requirements}
                    </p>
                  </div>
                )}

                {project.style_preferences && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Style Preferences</h3>
                    <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
                      {project.style_preferences}
                    </p>
                  </div>
                )}

                {project.additional_notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Additional Notes</h3>
                    <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
                      {project.additional_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {project.users.avatar_url ? (
                    <img
                      src={project.users.avatar_url}
                      alt={project.users.name || project.users.email}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {project.users.name || project.users.email.split('@')[0]}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">
                      {project.users.email}
                    </p>
                  </div>
                </div>

                {project.users.location && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 text-gray-400 dark:text-gray-500">📍</div>
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">
                      {project.users.location}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">
                    Member since {formatDate(project.users.created_at)}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">
                    Project posted on
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(project.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Editor Information (if project has accepted editor) */}
            {acceptedApplication && acceptedApplication.editor_profiles && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Assigned Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    {acceptedApplication.editor_profiles.avatar_url ? (
                      <img
                        src={acceptedApplication.editor_profiles.avatar_url}
                        alt={acceptedApplication.editor_profiles.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {acceptedApplication.editor_profiles.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        Video Editor
                      </p>
                    </div>
                  </div>

                  {acceptedApplication.editor_profiles.bio && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground line-clamp-3">
                        {acceptedApplication.editor_profiles.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {acceptedApplication.editor_profiles.per_video_rate && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">Rate</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${acceptedApplication.editor_profiles.per_video_rate}/video
                        </p>
                      </div>
                    )}
                    
                    {acceptedApplication.editor_profiles.years_experience && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">Experience</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {acceptedApplication.editor_profiles.years_experience} years
                        </p>
                      </div>
                    )}
                  </div>

                  {acceptedApplication.editor_profiles.location && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 text-gray-400 dark:text-gray-500">📍</div>
                      <span className="text-sm text-gray-600 dark:text-muted-foreground">
                        {acceptedApplication.editor_profiles.location}
                      </span>
                    </div>
                  )}

                  {acceptedApplication.editor_profiles.specialties && acceptedApplication.editor_profiles.specialties.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {acceptedApplication.editor_profiles.specialties.map((specialty: string) => (
                          <Badge key={specialty} variant="secondary" className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">
                      Accepted on
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(acceptedApplication.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Applications Section */}
            {isProjectOwner && applications && applications.length > 0 && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Applications ({applications.length})</CardTitle>
                  <CardDescription className="dark:text-muted-foreground">
                    Review and manage editor applications for your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div 
                        key={application.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {application.editor_profiles?.avatar_url ? (
                              <img
                                src={application.editor_profiles.avatar_url}
                                alt={application.editor_profiles.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {application.editor_profiles?.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                                Applied {formatDate(application.created_at)}
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                Proposed rate: ${application.proposed_rate}/hour
                              </p>
                              {application.cover_letter && (
                                <p className="text-sm text-gray-600 dark:text-muted-foreground mt-2 line-clamp-3">
                                  {application.cover_letter}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                application.status === 'accepted' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : application.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              }
                            >
                              {application.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Editor Application Status */}
            {!isClient && userApplication && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Your Application</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge 
                      className={
                        userApplication.status === 'accepted' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : userApplication.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }
                    >
                      {userApplication.status}
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">
                      Applied {formatDate(userApplication.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">
                    <strong>Proposed rate:</strong> ${userApplication.proposed_rate}/hour
                  </p>
                  {userApplication.cover_letter && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Cover Letter:</p>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        {userApplication.cover_letter}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Budget</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${project.budget}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Deadline</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Urgency</p>
                    <Badge className={getUrgencyColor(project.urgency)}>
                      {getUrgencyLabel(project.urgency)}
                    </Badge>
                  </div>
                </div>

                {project.project_type && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Project Type</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{project.project_type}</p>
                  </div>
                )}

                {project.video_length && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Expected Length</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{project.video_length}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">Status</p>
                  <Badge 
                    className={
                      project.status === 'open' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : project.status === 'assigned'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : project.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : project.status === 'completed'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}