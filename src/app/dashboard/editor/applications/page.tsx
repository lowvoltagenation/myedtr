"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calendar, Clock, Briefcase, Eye, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  project_id: string;
  cover_letter: string;
  proposed_rate: number;
  status: string;
  created_at: string;
  projects: {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    status: string;
    project_type: string;
    urgency: string;
    created_at: string;
  };
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Applications' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' }
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const supabase = createClient();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get all applications with project details
      const { data: applicationsData, error } = await supabase
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

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      setApplications(applicationsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    if (statusFilter === "all") return applications;
    return applications.filter(app => app.status === statusFilter);
  }, [applications, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'rush': return 'destructive';
      case 'urgent': return 'default';
      case 'standard': return 'secondary';
      default: return 'outline';
    }
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const accepted = applications.filter(app => app.status === 'accepted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    
    return { total, pending, accepted, rejected };
  }, [applications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/editor" className="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Applications</h1>
          <p className="text-gray-600 dark:text-muted-foreground">Track your project applications and their status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accepted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-red-600 dark:text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-muted-foreground">
                Showing {filteredApplications.length} of {applications.length} applications
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {application.projects.title}
                        </h3>
                        <div className="flex gap-2">
                          <Badge variant={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          {application.projects.urgency && (
                            <Badge variant={getUrgencyColor(application.projects.urgency)}>
                              {application.projects.urgency}
                            </Badge>
                          )}
                          {application.projects.project_type && (
                            <Badge variant="outline">
                              {application.projects.project_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-muted-foreground mb-4 line-clamp-2">
                        {application.projects.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Proposed: ${application.proposed_rate}/hr</span>
                        </div>
                        
                        {application.projects.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Budget: ${application.projects.budget}</span>
                          </div>
                        )}
                        
                        {application.projects.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(application.projects.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cover Letter Preview */}
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Your Cover Letter:</h4>
                    <p className="text-gray-700 dark:text-muted-foreground text-sm line-clamp-3">
                      {application.cover_letter}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <Link href={`/dashboard/editor/apply/${application.project_id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Project
                        </Button>
                      </Link>
                      
                      {application.status === 'accepted' && (
                        <Link href={`/messages/${application.project_id}`}>
                          <Button size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message Client
                          </Button>
                        </Link>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-muted-foreground">
                      Project Status: {application.projects.status}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {statusFilter === "all" ? "No Applications Yet" : `No ${statusFilter} Applications`}
              </h3>
              <p className="text-gray-600 dark:text-muted-foreground mb-4">
                {statusFilter === "all" 
                  ? "You haven't applied to any projects yet. Start browsing available projects!"
                  : `You don't have any ${statusFilter} applications.`
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard/editor/browse-projects">
                  <Button>
                    Browse Projects
                  </Button>
                </Link>
                {statusFilter !== "all" && (
                  <Button variant="outline" onClick={() => setStatusFilter("all")}>
                    Show All Applications
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 