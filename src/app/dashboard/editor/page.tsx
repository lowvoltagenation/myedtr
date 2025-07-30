import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { User, Settings, Briefcase, MessageCircle, Clock, DollarSign, Calendar, MapPin } from "lucide-react";
import { Suspense } from "react";
import { EditorDashboardSkeleton } from "@/components/ui/loading-skeleton";

export default function EditorDashboard() {
  return (
    <Suspense fallback={<EditorDashboardSkeleton />}>
      <EditorDashboardContent />
    </Suspense>
  );
}

async function EditorDashboardContent() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  // Check if user has an editor profile
  const { data: profile } = await supabase
    .from('editor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get user's subscription status
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Debug logging
  console.log('Subscription data:', subscription);
  console.log('Subscription error:', subscriptionError);
  if (subscriptionError) {
    console.log('Subscription error details:', JSON.stringify(subscriptionError, null, 2));
  }
  if (subscription) {
    console.log('All subscription fields:', Object.keys(subscription));
    console.log('Full subscription object:', JSON.stringify(subscription, null, 2));
  }

  // If no profile exists, redirect to create one
  if (!profile) {
    redirect("/dashboard/editor/create-profile");
  }

  // Get editor's applications and stats
  const { data: applications } = await supabase
    .from('project_applications')
    .select(`
      *,
      projects (
        id,
        title,
        description,
        budget,
        deadline,
        status,
        project_type,
        urgency,
        created_at
      )
    `)
    .eq('editor_id', user.id)
    .order('created_at', { ascending: false });

  // Get available projects (not applied to yet)
  const appliedProjectIds = applications?.map(app => app.project_id) || [];
  const { data: availableProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'open')
    .not('id', 'in', `(${appliedProjectIds.length > 0 ? appliedProjectIds.join(',') : 'null'})`)
    .order('created_at', { ascending: false })
    .limit(6);

  // Calculate stats
  const activeApplications = applications?.filter(app => app.status === 'pending').length || 0;
  const acceptedApplications = applications?.filter(app => app.status === 'accepted').length || 0;
  const totalApplications = applications?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Editor Dashboard</h1>
              <p className="text-gray-600 dark:text-muted-foreground">Welcome back, {profile.display_name || user.email}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <Link href="/messages" className="hidden md:block">
                <Button variant="outline" size="lg" className="w-full md:w-auto border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              {(() => {
                // Default to 'free' if no subscription record exists
                const tierLevel = subscription?.tier_id || 'free';
                console.log('Checking upgrade button condition:');
                console.log('subscription:', subscription);
                console.log('tierLevel (with fallback):', tierLevel);
                console.log('Should show button:', tierLevel === 'free');
                return tierLevel === 'free';
              })() && (
                <Link href="/pricing" className="w-full md:w-auto">
                  <Button variant="outline" size="lg" className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600">
                    <Settings className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}
              <Link href="/dashboard/editor/browse-projects" className="w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto border border-purple-600 dark:border-purple-500">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Active Applications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Accepted Projects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{acceptedApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Your Profile</CardTitle>
              <CardDescription className="dark:text-muted-foreground">Manage your editor profile and portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
                  <p className="text-gray-600 dark:text-muted-foreground text-sm line-clamp-3">{profile.bio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.specialties?.slice(0, 3).map((specialty: string) => (
                      <Badge key={specialty} variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {specialty}
                      </Badge>
                    ))}
                    {profile.specialties?.length > 3 && (
                      <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                        +{profile.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">${profile.per_video_rate}/video</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 space-y-2">
                  <Link href="/profile/edit">
                    <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href={`/editor/${profile.id}`}>
                    <Button variant="ghost" className="w-full dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Projects */}
          <Card className="lg:col-span-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white">Available Projects</CardTitle>
                  <CardDescription className="dark:text-muted-foreground">Browse and apply to new projects</CardDescription>
                </div>
                <Link href="/dashboard/editor/browse-projects">
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {availableProjects && availableProjects.length > 0 ? (
                <div className="space-y-4">
                  {availableProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                        <div className="flex gap-2">
                          {project.urgency && (
                            <Badge variant={project.urgency === 'rush' ? 'destructive' : project.urgency === 'urgent' ? 'default' : 'secondary'}>
                              {project.urgency}
                            </Badge>
                          )}
                          {project.project_type && (
                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                              {project.project_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-muted-foreground">
                          {project.budget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${project.budget}</span>
                            </div>
                          )}
                          {project.deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <Link href={`/dashboard/editor/apply/${project.id}`}>
                          <Button size="sm" className="border border-purple-600 dark:border-purple-500">
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-muted-foreground mb-4">No new projects available</p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground/70">Check back later for new opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        {applications && applications.length > 0 && (
          <Card className="mt-8 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white">Recent Applications</CardTitle>
                  <CardDescription className="dark:text-muted-foreground">Track your project applications</CardDescription>
                </div>
                <Link href="/dashboard/editor/applications">
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{application.projects?.title}</h3>
                      <p className="text-gray-600 dark:text-muted-foreground text-sm line-clamp-1">{application.projects?.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-muted-foreground/70">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Proposed: ${application.proposed_rate}/hr</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        application.status === 'accepted' ? 'default' :
                        application.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {application.status}
                      </Badge>
                      {application.status === 'accepted' && (
                        <Link href={`/project/${application.project_id}`}>
                          <Button size="sm" className="border border-purple-600 dark:border-purple-500">
                            View Project
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 