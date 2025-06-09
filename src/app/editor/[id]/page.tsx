import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Star, MessageCircle, ArrowLeft, Play, ExternalLink } from "lucide-react";
import Link from "next/link";

interface EditorProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Utility function to extract video info from URLs
function getVideoInfo(url: string): { type: 'youtube' | 'vimeo' | 'other', id: string | null, thumbnailUrl: string | null } {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const id = match ? match[1] : null;
    return {
      type: 'youtube',
      id,
      thumbnailUrl: id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
    };
  } else if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const id = match ? match[1] : null;
    return {
      type: 'vimeo',
      id,
      thumbnailUrl: null // Vimeo thumbnails require API call
    };
  }
  return { type: 'other', id: null, thumbnailUrl: null };
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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available for new projects';
      case 'busy': return 'Currently busy';
      case 'unavailable': return 'Not available';
      default: return 'Status unknown';
    }
  };

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
                            ${profile.hourly_rate}/hour
                          </div>
                        </div>
                        
                        {/* Availability */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getAvailabilityColor(profile.availability_status)}`}>
                          {getAvailabilityText(profile.availability_status)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <Button size="lg" className="w-full md:w-auto">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Editor
                        </Button>
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
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-white">Portfolio Videos</CardTitle>
                  <CardDescription className="dark:text-gray-400">Recent work and projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.portfolio_urls.filter((url: string) => url.trim()).map((url: string, index: number) => {
                      const videoInfo = getVideoInfo(url);
                      
                      return (
                        <div key={index} className="group relative">
                          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            {videoInfo.thumbnailUrl ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={videoInfo.thumbnailUrl}
                                  alt={`Portfolio video ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback if thumbnail fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <Play className="w-12 h-12 text-gray-400" />
                                </div>
                                {/* Play button overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                  <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Play className="w-6 h-6 text-gray-800" />
                                  </div>
                                </div>
                              </div>
                            ) : videoInfo.type === 'vimeo' ? (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 dark:text-gray-300">Vimeo Video</p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                <div className="text-center">
                                  <ExternalLink className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 dark:text-gray-300">External Link</p>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Video link */}
                          <Link 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 cursor-pointer"
                          >
                            <span className="sr-only">Watch video {index + 1}</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  {profile.portfolio_urls.filter((url: string) => url.trim()).length === 0 && (
                    <div className="text-center py-8">
                      <Play className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">No portfolio videos added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <p className="text-sm text-gray-600 text-center dark:text-gray-400">
                  Typically responds within 1 hour
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 