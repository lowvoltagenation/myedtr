import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { User, Settings, Briefcase, MessageCircle, Clock, DollarSign, Calendar, MapPin } from "lucide-react";

export default async function EditorDashboard() {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Editor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile.display_name || user.email}</p>
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
                  <Settings className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </Link>
              <Link href="/dashboard/editor/browse-projects">
                <Button size="lg" className="w-full md:w-auto">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Projects
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
                  <p className="text-sm font-medium text-gray-600">Active Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{activeApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Accepted Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{acceptedApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Status</p>
                  <Badge variant={profile.availability_status === 'available' ? 'default' : 'secondary'}>
                    {profile.availability_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your editor profile and portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{profile.bio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.specialties?.slice(0, 3).map((specialty: string) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {profile.specialties?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">${profile.hourly_rate}/hr</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 space-y-2">
                  <Link href="/dashboard/editor/edit-profile">
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href={`/editor/${profile.id}`}>
                    <Button variant="ghost" className="w-full">
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Projects */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Projects</CardTitle>
                  <CardDescription>Browse and apply to new projects</CardDescription>
                </div>
                <Link href="/dashboard/editor/browse-projects">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {availableProjects && availableProjects.length > 0 ? (
                <div className="space-y-4">
                  {availableProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <div className="flex gap-2">
                          {project.urgency && (
                            <Badge variant={project.urgency === 'rush' ? 'destructive' : project.urgency === 'urgent' ? 'default' : 'secondary'}>
                              {project.urgency}
                            </Badge>
                          )}
                          {project.project_type && (
                            <Badge variant="outline">
                              {project.project_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
                          <Button size="sm">
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No new projects available</p>
                  <p className="text-sm text-gray-500">Check back later for new opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        {applications && applications.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Track your project applications</CardDescription>
                </div>
                <Link href="/dashboard/editor/applications">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{application.projects?.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-1">{application.projects?.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                          <Button size="sm">
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