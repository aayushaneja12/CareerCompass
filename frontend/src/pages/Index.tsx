import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import InfoWidget from "@/components/InfoWidget";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();

    // Subscribe to realtime message updates
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          // Reload messages when changes occur
          if (currentConversationId) {
            loadMessages(currentConversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all conversations for the current user
  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error loading conversations",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Load messages for a specific conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map((msg) => ({
        id: msg.id,
        role: msg.sender_type as "user" | "assistant",
        content: msg.content,
        created_at: msg.created_at,
      }));

      setMessages(formattedMessages);
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Generate a title from the first message (3-6 words)
  const generateTitle = (message: string): string => {
    const words = message.trim().split(/\s+/).slice(0, 6);
    return words.join(" ") + (message.split(/\s+/).length > 6 ? "..." : "");
  };

  // Create a new conversation
  const createNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  // Select an existing conversation
  const selectChat = (chatId: string) => {
    setCurrentConversationId(chatId);
  };

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let conversationId = currentConversationId;

      // If no active conversation, create one
      if (!conversationId) {
        const title = generateTitle(content);
        const { data: newConversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title,
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
        await loadConversations(); // Refresh conversation list
      }

      // Insert user message
      const { error: userMsgError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: "user",
        content,
      });

      if (userMsgError) throw userMsgError;

      // Simulate AI response
      setTimeout(async () => {
        const aiMessage = {
          conversation_id: conversationId,
          sender_id: null,
          sender_type: "assistant",
          content:
            "Hello! I'm the PRP AI Agent. I'm here to help you with all your Professional Readiness Program questions. You can ask me about badges, events, attendance, quizzes, and track your progress. How can I assist you today?",
        };

        const { error: aiMsgError } = await supabase.from("messages").insert(aiMessage);

        if (aiMsgError) {
          console.error("Error inserting AI message:", aiMsgError);
        }

        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onNewChat={createNewChat}
        chatHistory={conversations.map(conv => ({ id: conv.id, title: conv.title }))}
        onSelectChat={selectChat}
        currentChatId={currentConversationId || ""}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hover:bg-[hsl(var(--accent))] transition-smooth"
              >
                {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </Button>
              <div>
                <h1 className="text-xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                  Mentra- PRP AI Agent 🧠
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Your AI Haven for Your Career Elevation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWidgets(!showWidgets)}
                className="hover:bg-[hsl(var(--accent))] transition-smooth"
              >
                {showWidgets ? "Hide" : "Show"} Widgets
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-[hsl(var(--accent))] transition-smooth"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 italic">
            "I’m here to make your PRP journey easier, one question at a time."
          </p>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center max-w-2xl">
                    <div className="w-20 h-20 rounded-full bg-[hsl(var(--primary))] mx-auto mb-6 flex items-center justify-center gold-glow animate-pulse">
                      <span className="text-4xl">🧠</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4 text-glow">
                      Welcome to Mentra- PRP AI Agent
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-8 text-lg">
                      Ready to track your PRP progress today? I can help you with:
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      {[
                        "📖 Learn About PRP",
                        "📊 Check My Attendance",
                        "📅 What’s Coming Up?",
                        "📝 My Quizzes & Results",
                        "🏆 My Badge Progress",
                        "📈 My PRP Overview",
                        "🤝 Mentor Me, Mentra",
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-4 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
                            "hover:border-[hsl(var(--primary))] hover:gold-glow transition-smooth cursor-default"
                          )}
                        >
                          <p className="text-sm text-[hsl(var(--foreground))]">{item}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleSendMessage("Hello!")}
                      className={cn(
                        "mt-8 px-8 py-6 text-lg font-semibold rounded-full",
                        "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:scale-105",
                        "gold-glow transition-smooth"
                      )}
                    >
                      Start Chatting
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} role={message.role} content={message.content} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>

          {/* Right Widget Panel */}
          {showWidgets && (
            <div className="w-80 border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-y-auto">
              <InfoWidget />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;