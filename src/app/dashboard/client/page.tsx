import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Briefcase, Users, MessageCircle, Calendar } from "lucide-react";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { ApplicationCard } from "@/components/client/application-card";

export default function ClientDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ClientDashboardContent />
    </Suspense>
  );
}

async function ClientDashboardContent() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  // Get user's projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      *,
      project_applications(
        id,
        status,
        created_at,
        cover_letter,
        proposed_rate,
        editor_id,
        users!project_applications_editor_id_fkey(
          id,
          editor_profiles(name, avatar_url, bio, specialties)
        )
      )
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error('Projects query error:', projectsError);
  }
  
  const activeProjects = projects?.filter(p => p.status === 'open') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
  const totalApplications = projects?.reduce((acc, p) => acc + (p.project_applications?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Client Dashboard</h1>
              <p className="text-gray-600 dark:text-muted-foreground">Manage your projects and find the perfect editors</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              {/* Mobile: Upgrade Plan on top, full width */}
              <Link href="/pricing" className="md:order-2">
                <Button variant="ghost" size="lg" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </Link>
              
              {/* Mobile: Post New Project below, full width */}
              <Link href="/dashboard/client/post-project" className="md:order-3">
                <Button size="lg" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Project
                </Button>
              </Link>
              
              {/* Desktop only: Messages button */}
              <Link href="/messages" className="hidden md:block md:order-1">
                <Button variant="outline" size="lg" className="w-auto">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
            </div>
          </div>
        </div>


        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeProjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hidden md:block">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedProjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Active Projects</CardTitle>
              <CardDescription className="dark:text-muted-foreground">Projects currently seeking editors</CardDescription>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-muted-foreground mb-4">No active projects</p>
                  <Link href="/dashboard/client/post-project">
                    <Button>Post Your First Project</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.slice(0, 3).map((project: any) => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <div className="border dark:border-border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                          <span className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-muted-foreground">
                            {project.project_applications?.length || 0} applications
                          </span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            ${project.budget}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {activeProjects.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline">View All Projects</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Applications</CardTitle>
              <CardDescription className="dark:text-muted-foreground">Latest editor applications to your projects</CardDescription>
            </CardHeader>
            <CardContent>
              {totalApplications === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-muted-foreground mb-2">No applications yet</p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">Post a project to start receiving applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects?.flatMap(p => 
                    p.project_applications?.map((app: any) => (
                      <ApplicationCard 
                        key={app.id}
                        application={app}
                        project={p}
                      />
                    ))
                  ).slice(0, 3)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 