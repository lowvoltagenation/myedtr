import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Briefcase, Users, MessageCircle, Calendar } from "lucide-react";

export default async function ClientDashboard() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      project_applications(
        id,
        status,
        editor_profiles(display_name)
      )
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  const activeProjects = projects?.filter(p => p.status === 'open') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
  const totalApplications = projects?.reduce((acc, p) => acc + (p.project_applications?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Dashboard</h1>
              <p className="text-gray-600">Manage your projects and find the perfect editors</p>
            </div>
            <div className="flex gap-3">
              <Link href="/messages">
                <Button variant="outline" size="lg" className="w-full md:w-auto">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="ghost" size="lg" className="w-full md:w-auto">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </Link>
              <Link href="/dashboard/client/post-project">
                <Button size="lg" className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Project
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
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{activeProjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedProjects.length}</p>
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
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Projects currently seeking editors</CardDescription>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No active projects</p>
                  <Link href="/dashboard/client/post-project">
                    <Button>Post Your First Project</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.slice(0, 3).map((project: any) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {project.project_applications?.length || 0} applications
                        </span>
                        <span className="font-medium text-purple-600">
                          ${project.budget}
                        </span>
                      </div>
                    </div>
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
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest editor applications to your projects</CardDescription>
            </CardHeader>
            <CardContent>
              {totalApplications === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No applications yet</p>
                  <p className="text-sm text-gray-500">Post a project to start receiving applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects?.flatMap(p => 
                    p.project_applications?.map((app: any) => (
                      <div key={app.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {app.editor_profiles?.display_name}
                            </h4>
                            <p className="text-sm text-gray-600">Applied to: {p.title}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">View Application</Button>
                          {app.status === 'pending' && (
                            <>
                              <Button size="sm">Accept</Button>
                              <Button size="sm" variant="outline">Decline</Button>
                            </>
                          )}
                        </div>
                      </div>
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