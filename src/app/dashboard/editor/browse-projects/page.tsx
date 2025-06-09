"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Search, DollarSign, Calendar, Clock, Briefcase, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  project_type: string;
  urgency: string;
  created_at: string;
  requirements?: string;
  style_preferences?: string;
}

const PROJECT_TYPES = [
  'YouTube Video',
  'Commercial',
  'Wedding',
  'Corporate',
  'Music Video',
  'Documentary',
  'Social Media',
  'Educational',
  'Event',
  'Other'
];

const URGENCY_LEVELS = ['standard', 'urgent', 'rush'];

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [budgetRange, setBudgetRange] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const supabase = createClient();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's applications to filter out already applied projects
      const { data: applications } = await supabase
        .from('project_applications')
        .select('project_id')
        .eq('editor_id', user.id);

      const appliedIds = applications?.map(app => app.project_id) || [];
      setAppliedProjectIds(appliedIds);

      // Get all open projects
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter out already applied projects
      if (appliedProjectIds.includes(project.id)) return false;

      // Search filter
      const matchesSearch = searchTerm === "" || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_type?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = selectedType === "all" || project.project_type === selectedType;

      // Urgency filter
      const matchesUrgency = selectedUrgency === "all" || project.urgency === selectedUrgency;

      // Budget filter
      const matchesBudget = budgetRange === "all" || (() => {
        const budget = project.budget || 0;
        switch (budgetRange) {
          case "under-500": return budget < 500;
          case "500-1000": return budget >= 500 && budget <= 1000;
          case "1000-2500": return budget >= 1000 && budget <= 2500;
          case "2500-5000": return budget >= 2500 && budget <= 5000;
          case "over-5000": return budget > 5000;
          default: return true;
        }
      })();

      return matchesSearch && matchesType && matchesUrgency && matchesBudget;
    });
  }, [projects, appliedProjectIds, searchTerm, selectedType, selectedUrgency, budgetRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Projects</h1>
          <p className="text-gray-600 dark:text-muted-foreground">Find and apply to video editing projects</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Project Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Project Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PROJECT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Urgency Filter */}
              <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  {URGENCY_LEVELS.map(urgency => (
                    <SelectItem key={urgency} value={urgency}>
                      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Budget Filter */}
              <Select value={budgetRange} onValueChange={setBudgetRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="under-500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                  <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                  <SelectItem value="over-5000">Over $5,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Showing {filteredProjects.length} of {projects.length - appliedProjectIds.length} available projects
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedUrgency("all");
                  setBudgetRange("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg dark:hover:shadow-2xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-2 dark:text-white">{project.title}</CardTitle>
                    <div className="flex flex-col gap-1">
                      {project.urgency && (
                        <Badge variant={
                          project.urgency === 'rush' ? 'destructive' : 
                          project.urgency === 'urgent' ? 'default' : 
                          'secondary'
                        }>
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
                  <CardDescription className="line-clamp-3 dark:text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Project Details */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-muted-foreground">
                      {project.budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">${project.budget}</span>
                        </div>
                      )}
                      {project.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Posted time */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Posted {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Action Button */}
                    <Link href={`/dashboard/editor/apply/${project.id}`} className="block">
                      <Button className="w-full">
                        Apply to Project
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Projects Found</h3>
              <p className="text-gray-600 dark:text-muted-foreground mb-4">
                {appliedProjectIds.length > 0 
                  ? "You've applied to all available projects matching your criteria."
                  : "No projects match your current filters."
                }
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedUrgency("all");
                  setBudgetRange("all");
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 