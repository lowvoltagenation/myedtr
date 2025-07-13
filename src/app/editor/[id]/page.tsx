import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PortfolioVideos } from "@/components/profile/portfolio-videos";

interface EditorProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorProfilePage({ params }: EditorProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Get editor profile
  const { data: profile, error } = await supabase
    .from('editor_profiles')
    .select(`
      *,
      users!inner(email, user_type)
    `)
    .eq('id', id)
    .single();

  if (error || !profile) {
    notFound();
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white border-b dark:bg-slate-900 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/browse" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 dark:text-purple-400 dark:hover:text-purple-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse Editors
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">{profile.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4 dark:text-gray-300">
                          {profile.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {profile.location}
                            </div>
                          )}
                          {profile.experience_level && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {profile.experience_level}
                            </div>
                          )}
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${profile.per_video_rate}/video
                          </div>
                        </div>

                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center md:justify-start">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1 dark:text-gray-300">5.0 (No reviews yet)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed dark:text-gray-300">{profile.bio}</p>
              </CardContent>
            </Card>

            {/* Portfolio */}
            {profile.portfolio_description && (
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-white">Portfolio & Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line dark:text-gray-300">
                    {profile.portfolio_description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Videos */}
            {profile.portfolio_urls && profile.portfolio_urls.length > 0 && (
              <PortfolioVideos 
                portfolioUrls={profile.portfolio_urls} 
                editorName={profile.name}
              />
            )}

            {/* Reviews Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Reviews</CardTitle>
                <CardDescription className="dark:text-gray-400">Client feedback and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-300">No reviews yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to hire {profile.name}!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties?.map((specialty: string) => (
                    <Badge key={specialty} variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="font-medium dark:text-white">&lt; 1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Projects Completed</span>
                  <span className="font-medium dark:text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Client Satisfaction</span>
                  <span className="font-medium dark:text-white">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="font-medium dark:text-white">
                    {new Date(profile.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 