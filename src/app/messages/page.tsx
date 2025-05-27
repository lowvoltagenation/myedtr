"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Calendar, DollarSign, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Conversation {
  project_id: string;
  project_title: string;
  project_status: string;
  project_type: string;
  urgency: string;
  budget: number;
  deadline: string;
  other_participant: string;
  other_participant_type: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const supabase = createClient();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      setCurrentUser({ ...user, user_type: userData?.user_type });

      // Get conversations based on user type
      let query;
      
      if (userData?.user_type === 'client') {
        // For clients, get all projects with accepted applications that have messages
        query = supabase
          .from('projects')
          .select(`
            id,
            title,
            status,
            project_type,
            urgency,
            budget,
            deadline,
            project_applications!inner (
              editor_id,
              status,
              editor:users!project_applications_editor_id_fkey (
                id,
                editor_profiles (name)
              )
            ),
            messages (
              content,
              created_at,
              sender_id
            )
          `)
          .eq('client_id', user.id)
          .eq('project_applications.status', 'accepted')
          .not('messages', 'is', null);
      } else {
        // For editors, get all projects they have accepted applications for that have messages
        query = supabase
          .from('project_applications')
          .select(`
            project_id,
            projects!inner (
              id,
              title,
              status,
              project_type,
              urgency,
              budget,
              deadline,
              client_id,
              messages (
                content,
                created_at,
                sender_id
              )
            )
          `)
          .eq('editor_id', user.id)
          .eq('status', 'accepted')
          .not('projects.messages', 'is', null);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Process the data to create conversation objects
      const conversationMap = new Map();

      if (userData?.user_type === 'client') {
        // Process client conversations
        data?.forEach((project: any) => {
          if (project.messages && project.messages.length > 0 && project.project_applications[0]) {
            const messages = project.messages.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            const lastMessage = messages[0];
            const editorProfile = project.project_applications[0].editor?.editor_profiles;
            
            conversationMap.set(project.id, {
              project_id: project.id,
              project_title: project.title,
              project_status: project.status,
              project_type: project.project_type,
              urgency: project.urgency,
              budget: project.budget,
              deadline: project.deadline,
              other_participant: editorProfile?.name || 'Editor',
              other_participant_type: 'editor',
              last_message: lastMessage.content,
              last_message_time: lastMessage.created_at,
              unread_count: messages.filter((msg: any) => 
                msg.sender_id !== user.id
              ).length
            });
          }
        });
      } else {
        // Process editor conversations
        data?.forEach((application: any) => {
          const project = application.projects;
          if (project.messages && project.messages.length > 0) {
            const messages = project.messages.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            const lastMessage = messages[0];
            
            conversationMap.set(project.id, {
              project_id: project.id,
              project_title: project.title,
              project_status: project.status,
              project_type: project.project_type,
              urgency: project.urgency,
              budget: project.budget,
              deadline: project.deadline,
              other_participant: 'Client',
              other_participant_type: 'client',
              last_message: lastMessage.content,
              last_message_time: lastMessage.created_at,
              unread_count: messages.filter((msg: any) => 
                msg.sender_id !== user.id
              ).length
            });
          }
        });
      }

      // Convert map to array and sort by last message time
      const conversationsArray = Array.from(conversationMap.values()).sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      setConversations(conversationsArray);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={currentUser?.user_type === 'client' ? '/dashboard/client' : '/dashboard/editor'} 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Your active project conversations</p>
        </div>

        {/* Conversations List */}
        {conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link key={conversation.project_id} href={`/messages/${conversation.project_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {conversation.project_title}
                          </h3>
                          <div className="flex gap-2">
                            {conversation.urgency && (
                              <Badge variant={getUrgencyColor(conversation.urgency)}>
                                {conversation.urgency}
                              </Badge>
                            )}
                            {conversation.project_type && (
                              <Badge variant="outline">
                                {conversation.project_type}
                              </Badge>
                            )}
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive">
                                {conversation.unread_count} new
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <User className="h-4 w-4" />
                          <span>Conversation with {conversation.other_participant}</span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            <span className="font-medium">Last message:</span> {conversation.last_message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(conversation.last_message_time).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          {conversation.budget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>Budget: ${conversation.budget}</span>
                            </div>
                          )}
                          
                          {conversation.deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {new Date(conversation.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {conversation.project_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Conversations Yet
              </h3>
              <p className="text-gray-600 mb-4">
                {currentUser?.user_type === 'client' 
                  ? "Once you accept an editor's application and they start messaging you, conversations will appear here."
                  : "Once your application gets accepted and you start messaging with clients, conversations will appear here."
                }
              </p>
              <Link href={currentUser?.user_type === 'client' ? '/dashboard/client' : '/dashboard/editor/browse-projects'}>
                <Button>
                  {currentUser?.user_type === 'client' ? 'View Projects' : 'Browse Projects'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 