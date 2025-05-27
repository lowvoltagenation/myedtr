import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Star, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'unavailable': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/browse" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
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
                            <span className="text-sm text-gray-600 ml-1">5.0 (No reviews yet)</span>
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
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>

            {/* Portfolio */}
            {profile.portfolio_description && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio & Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {profile.portfolio_description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>Client feedback and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reviews yet</p>
                  <p className="text-sm text-gray-500">Be the first to hire {profile.name}!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties?.map((specialty: string) => (
                    <Badge key={specialty} variant="secondary" className="bg-purple-100 text-purple-700">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">&lt; 1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects Completed</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client Satisfaction</span>
                  <span className="font-medium">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
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
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <p className="text-sm text-gray-600 text-center">
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