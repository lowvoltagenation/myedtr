"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowLeft, Send, User, Calendar, DollarSign, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_type?: string;
  sender_avatar_url?: string;
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
  const [otherParticipant, setOtherParticipant] = useState<string>("");
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastMessageCheck, setLastMessageCheck] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { user, profile, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user && profile) {
      fetchData();
    }
  }, [user, profile, projectId]);

  // Separate effect for real-time subscription to avoid conflicts
  useEffect(() => {
    if (!user || !profile || !projectId) return;

    console.log('🔄 Setting up real-time subscription for project:', projectId);
    const supabase = createClient();
    
    // Create a unique channel name to avoid conflicts
    const channelName = `messages-${projectId}-${user.id}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        }, 
        async (payload) => {
          console.log('🔴 Real-time message received:', payload);
          const newMessage = payload.new as any;
          
          // Skip if this message is from the current user (already added optimistically)
          if (newMessage.sender_id === user.id) {
            console.log('🔄 Skipping own message from real-time update');
            return;
          }
          
          try {
            // Fetch sender details for the new message
            const { data: senderData, error: senderError } = await supabase
              .from('users')
              .select(`
                id,
                user_type,
                name,
                avatar_url,
                editor_profiles (name, avatar_url)
              `)
              .eq('id', newMessage.sender_id)
              .single();
            
            if (senderError) {
              console.warn('Error fetching sender data for real-time message:', senderError);
            }
            
            // Format the new message with sender details
            let senderName = 'User';
            let senderAvatar = null;
            
            if (senderData?.user_type === 'editor') {
              senderName = senderData?.editor_profiles?.[0]?.name || 'Editor';
              senderAvatar = senderData?.editor_profiles?.[0]?.avatar_url || senderData?.avatar_url;
            } else if (senderData?.user_type === 'client') {
              senderName = senderData?.name || 'Client';
              senderAvatar = senderData?.avatar_url;
            }
            
            const formattedMessage: Message = {
              ...newMessage,
              sender_name: senderName,
              sender_type: senderData?.user_type,
              sender_avatar_url: senderAvatar
            };
            
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some(msg => msg.id === formattedMessage.id);
              if (exists) {
                console.log('🔄 Message already exists, skipping duplicate');
                return prev;
              }
              console.log('✅ Adding new real-time message to state');
              return [...prev, formattedMessage];
            });
          } catch (error) {
            console.error('Error processing real-time message:', error);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('🔄 Subscription status:', status);
        if (err) {
          console.error('🔄 Subscription error:', err);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active');
          setRealtimeConnected(true);
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Real-time subscription timed out - will use polling instead');
          setRealtimeConnected(false);
          // Don't retry - just use polling fallback
        } else if (status === 'CLOSED') {
          console.warn('⚠️ Real-time subscription closed');
          setRealtimeConnected(false);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription channel error');
          setRealtimeConnected(false);
        }
      });

    console.log('🔄 Channel setup complete:', channelName);

    return () => {
      console.log('🔄 Cleaning up subscription:', channelName);
      supabase.removeChannel(channel);
    };
  }, [projectId, user, profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Periodic refresh as fallback when real-time isn't working
  useEffect(() => {
    if (!realtimeConnected && user && profile) {
      console.log('🔄 Setting up periodic refresh (real-time not connected)');
      const interval = setInterval(refreshMessages, 3000); // Check every 3 seconds
      
      return () => {
        console.log('🔄 Cleaning up periodic refresh');
        clearInterval(interval);
      };
    }
  }, [realtimeConnected, user, profile, projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const refreshMessages = async () => {
    if (!user || !profile) return;
    
    console.log('🔄 Manually refreshing messages...');
    const supabase = createClient();
    
    try {
      // Get messages created after our last check
      const { data: newMessages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            user_type,
            name,
            avatar_url,
            editor_profiles (name, avatar_url)
          )
        `)
        .eq('project_id', projectId)
        .gt('created_at', lastMessageCheck.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error refreshing messages:', error);
        return;
      }

      if (newMessages && newMessages.length > 0) {
        console.log(`📨 Found ${newMessages.length} new messages`);
        
        const formattedMessages = newMessages.map(msg => {
          let senderName = 'User';
          let senderAvatar = null;
          
          if (msg.sender?.user_type === 'editor') {
            senderName = msg.sender?.editor_profiles?.[0]?.name || 'Editor';
            senderAvatar = msg.sender?.editor_profiles?.[0]?.avatar_url || msg.sender?.avatar_url;
          } else if (msg.sender?.user_type === 'client') {
            senderName = msg.sender?.name || 'Client';
            senderAvatar = msg.sender?.avatar_url;
          }
          
          return {
            ...msg,
            sender_name: senderName,
            sender_type: msg.sender?.user_type,
            sender_avatar_url: senderAvatar
          };
        });

        setMessages(prev => {
          // Filter out any duplicates and add new messages
          const existingIds = new Set(prev.map(msg => msg.id));
          const newUniqueMessages = formattedMessages.filter(msg => !existingIds.has(msg.id));
          if (newUniqueMessages.length > 0) {
            console.log(`✅ Adding ${newUniqueMessages.length} new messages to chat`);
            
            // Update the last message check time to the latest new message
            const latestNewMessage = newUniqueMessages[newUniqueMessages.length - 1];
            setLastMessageCheck(new Date(latestNewMessage.created_at));
            
            return [...prev, ...newUniqueMessages];
          }
          return prev;
        });
      } else {
        console.log('📨 No new messages found');
      }
      
      // Only update lastMessageCheck if we didn't find new messages
      // (if we found new messages, it's already updated above)
    } catch (error) {
      console.error('Error in manual refresh:', error);
    }
  };

  const fetchData = async () => {
    const supabase = createClient();
    
    try {
      if (!user || !profile) {
        router.push('/login');
        return;
      }

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
          editor_name: applicationData.editor?.editor_profiles?.[0]?.name || 'Unknown Editor'
        });
      }

      // Determine other participant name
      if (profile?.user_type === 'client') {
        setOtherParticipant(applicationData?.editor?.editor_profiles?.[0]?.name || 'Editor');
      } else {
        // Get client name from users table
        const { data: clientData, error: clientError } = await supabase
          .from('users')
          .select('name')
          .eq('id', projectData.client_id)
          .single();
          
        if (clientError) {
          console.warn('Failed to fetch client name:', clientError);
        }
        
        setOtherParticipant(clientData?.name || 'Client');
      }

      // Get messages with sender details including both client and editor info
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            user_type,
            name,
            avatar_url,
            editor_profiles (name, avatar_url)
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      if (messagesData) {
        const formattedMessages = messagesData.map(msg => {
          // Determine name based on user type
          let senderName = 'User';
          let senderAvatar = null;
          
          console.log('🔍 Formatting message:', {
            msgId: msg.id,
            senderData: msg.sender,
            userType: msg.sender?.user_type
          });
          
          if (msg.sender?.user_type === 'editor') {
            senderName = msg.sender?.editor_profiles?.[0]?.name || 'Editor';
            senderAvatar = msg.sender?.editor_profiles?.[0]?.avatar_url || msg.sender?.avatar_url;
          } else if (msg.sender?.user_type === 'client') {
            senderName = msg.sender?.name || 'Client';
            senderAvatar = msg.sender?.avatar_url;
          }
          
          console.log('🔍 Final message data:', {
            msgId: msg.id,
            senderName,
            senderAvatar,
            senderType: msg.sender?.user_type
          });
          
          return {
            ...msg,
            sender_name: senderName,
            sender_type: msg.sender?.user_type,
            sender_avatar_url: senderAvatar
          };
        });
        setMessages(formattedMessages);
        
        // Update the last message check time to the latest message
        if (formattedMessages.length > 0) {
          const latestMessage = formattedMessages[formattedMessages.length - 1];
          setLastMessageCheck(new Date(latestMessage.created_at));
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return;

    setSending(true);
    const supabase = createClient();
    const messageContent = newMessage.trim();

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      project_id: projectId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      sender_name: 'You',
      sender_type: profile?.user_type,
      sender_avatar_url: profile?.avatar_url
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          project_id: projectId,
          sender_id: user.id,
          content: messageContent
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...optimisticMessage, id: data.id, created_at: data.created_at }
            : msg
        )
      );

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      // Restore the message text
      setNewMessage(messageContent);
      
      // Show error to user (you could add a toast notification here)
      alert('Failed to send message. Please try again.');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Not Found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={profile?.user_type === 'client' ? '/dashboard/client' : '/dashboard/editor'} 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Messages: {project.title}
              </h1>
              <p className="text-gray-600 dark:text-muted-foreground">
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
              <CardHeader className="border-b dark:border-border">
                <CardTitle className="text-lg dark:text-white">Conversation</CardTitle>
              </CardHeader>
              
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isOwnMessage = message.sender_id === user?.id;
                    const senderName = isOwnMessage ? 'You' : message.sender_name;
                    const fallbackLetter = (message.sender_name || 'U').charAt(0).toUpperCase();
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {/* Avatar - show on left for others, right for own messages */}
                        {!isOwnMessage && (
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={message.sender_avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {fallbackLetter}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {/* Message Bubble */}
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-purple-600 text-white dark:bg-purple-500'
                              : 'bg-gray-100 text-gray-900 dark:bg-muted dark:text-foreground'
                          }`}
                        >
                          <div className="text-sm mb-1">
                            <span className="font-medium">
                              {senderName}
                            </span>
                            <span className={`ml-2 opacity-75 text-xs ${
                              isOwnMessage 
                                ? 'text-purple-100' 
                                : 'text-gray-500 dark:text-muted-foreground'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {/* Avatar for own messages on the right */}
                        {isOwnMessage && (
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={message.sender_avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {fallbackLetter}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 dark:text-muted-foreground py-8">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t dark:border-border p-4">
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
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          </div>

          {/* Project Details Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {project.budget && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                      <span>Budget: ${project.budget}</span>
                    </div>
                  )}
                  
                  {project.deadline && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-muted-foreground">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                      <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {application && (
                  <div className="pt-4 border-t dark:border-border">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Application Details</h4>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground">
                      <p>Editor: {application.editor_name}</p>
                      <p>Proposed Rate: ${application.proposed_rate}/hr</p>
                      <p>Status: {application.status}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t dark:border-border">
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