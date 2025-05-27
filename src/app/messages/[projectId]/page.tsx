"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Send, User, Calendar, DollarSign, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_type?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  project_type: string;
  urgency: string;
  client_id: string;
}

interface ProjectApplication {
  id: string;
  editor_id: string;
  status: string;
  proposed_rate: number;
  editor_name?: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [application, setApplication] = useState<ProjectApplication | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherParticipant, setOtherParticipant] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription for new messages
    const supabase = createClient();
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        }, 
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = async () => {
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

      // Get project details
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!projectData) {
        router.push('/dashboard');
        return;
      }

      setProject(projectData);

      // Get accepted application for this project
      const { data: applicationData } = await supabase
        .from('project_applications')
        .select(`
          *,
          editor:users!project_applications_editor_id_fkey (
            id,
            editor_profiles (name)
          )
        `)
        .eq('project_id', projectId)
        .eq('status', 'accepted')
        .single();

      if (applicationData) {
        setApplication({
          ...applicationData,
          editor_name: applicationData.editor?.editor_profiles?.name || 'Unknown Editor'
        });
      }

      // Determine other participant name
      if (userData?.user_type === 'client') {
        setOtherParticipant(applicationData?.editor?.editor_profiles?.name || 'Editor');
      } else {
        // Get client name
        const { data: clientData } = await supabase
          .from('users')
          .select(`
            id,
            editor_profiles (name)
          `)
          .eq('id', projectData.client_id)
          .single();
        
        setOtherParticipant('Client');
      }

      // Get messages with sender details
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            user_type,
            editor_profiles (name)
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        const formattedMessages = messagesData.map(msg => ({
          ...msg,
          sender_name: msg.sender?.editor_profiles?.name || 
                      (msg.sender?.user_type === 'client' ? 'Client' : 'User'),
          sender_type: msg.sender?.user_type
        }));
        setMessages(formattedMessages);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !currentUser) return;

    setSending(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          project_id: projectId,
          sender_id: currentUser.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={currentUser?.user_type === 'client' ? '/dashboard/client' : '/dashboard/editor'} 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Messages: {project.title}
              </h1>
              <p className="text-gray-600">
                Conversation with {otherParticipant}
              </p>
            </div>
            
            <div className="flex gap-2">
              {project.urgency && (
                <Badge variant={getUrgencyColor(project.urgency)}>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === currentUser?.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm mb-1">
                          <span className="font-medium">
                            {message.sender_id === currentUser?.id ? 'You' : message.sender_name}
                          </span>
                          <span className="ml-2 opacity-75 text-xs">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[80px] resize-none"
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="self-end"
                  >
                    {sending ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          </div>

          {/* Project Details Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {project.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>Budget: ${project.budget}</span>
                    </div>
                  )}
                  
                  {project.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {application && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                    <div className="text-sm text-gray-600">
                      <p>Editor: {application.editor_name}</p>
                      <p>Proposed Rate: ${application.proposed_rate}/hr</p>
                      <p>Status: {application.status}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <Badge variant="outline" className="w-full justify-center">
                    Project Status: {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 