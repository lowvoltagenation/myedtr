"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { MessageCircle, Eye, Check, X, DollarSign, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ApplicationCardProps {
  application: {
    id: string;
    status: string;
    created_at: string;
    cover_letter: string;
    proposed_rate: number;
    editor_id: string;
    users: {
      id: string;
      editor_profiles: {
        name: string;
        avatar_url?: string;
        bio?: string;
        specialties?: string[];
      };
    };
  };
  project: {
    id: string;
    title: string;
    budget?: number;
    deadline?: string;
  };
}

export function ApplicationCard({ application, project }: ApplicationCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(application.status);
  const router = useRouter();
  const supabase = createClient();

  const updateApplicationStatus = async (newStatus: 'accepted' | 'rejected') => {
    console.log('🔄 Updating application status via API:', { 
      applicationId: application.id, 
      newStatus,
      currentStatus: application.status
    });
    
    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      console.log('📝 API Response:', { 
        status: response.status, 
        data,
        success: response.ok 
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update application');
      }

      console.log('✅ Application updated successfully via API');
      setStatus(newStatus);
      
      // Refresh the page to update data
      router.refresh();
    } catch (error) {
      console.error('❌ Error updating application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update application: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="border rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={application.users.editor_profiles.avatar_url} />
            <AvatarFallback>
              {application.users.editor_profiles.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900 truncate">
                  {application.users.editor_profiles.name}
                </h4>
                <p className="text-sm text-gray-600">Applied to: {project.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge className={getStatusColor(status)}>
                {status}
              </Badge>
            </div>

            {/* Proposed Rate */}
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <DollarSign className="h-4 w-4" />
              <span>Proposed rate: ${application.proposed_rate}/hour</span>
            </div>

            {/* Specialties */}
            {application.users.editor_profiles.specialties && (
              <div className="flex flex-wrap gap-1 mb-3">
                {application.users.editor_profiles.specialties.slice(0, 3).map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* View Application Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Application from {application.users.editor_profiles.name}</DialogTitle>
                    <DialogDescription>
                      Applied to "{project.title}" on {new Date(application.created_at).toLocaleDateString()}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Editor Info */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={application.users.editor_profiles.avatar_url} />
                        <AvatarFallback>
                          {application.users.editor_profiles.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{application.users.editor_profiles.name}</h3>
                        <p className="text-sm text-gray-600">{application.users.editor_profiles.bio}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm font-medium">${application.proposed_rate}/hour</span>
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <h3 className="font-semibold mb-2">Cover Letter</h3>
                      <div className="bg-white border rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {application.cover_letter}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {status === 'pending' && (
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => updateApplicationStatus('accepted')}
                          disabled={loading}
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept Application
                        </Button>
                        <Button 
                          onClick={() => updateApplicationStatus('rejected')}
                          disabled={loading}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Accept/Decline for pending applications */}
              {status === 'pending' && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => updateApplicationStatus('accepted')}
                    disabled={loading}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateApplicationStatus('rejected')}
                    disabled={loading}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Decline
                  </Button>
                </>
              )}

              {/* Message Editor for accepted applications */}
              {status === 'accepted' && (
                <Link href={`/messages/${project.id}`}>
                  <Button size="sm">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}