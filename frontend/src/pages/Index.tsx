import { useState, useRef, useEffect } from "react";
import { LogOut, Compass, Target, BarChart3, BookOpen, FileText, Lightbulb, GraduationCap, Upload, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSidebarState } from "@/hooks/useSidebarState";
import { sendChatMessage } from "@/integrations/supabase/chat";

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
  const location = useLocation();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("Chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        if (currentConversationId) loadMessages(currentConversationId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentConversationId]);

  useEffect(() => {
    if (currentConversationId) loadMessages(currentConversationId);
    else setMessages([]);
  }, [currentConversationId]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const state = location.state as { prefillMessage?: string; openConversationId?: string } | null;
    if (state?.openConversationId) {
      setCurrentConversationId(state.openConversationId);
    }
    if (state?.prefillMessage) {
      handleSendMessage(state.prefillMessage);
    }
    if (state?.prefillMessage || state?.openConversationId) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname, currentConversationId]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isMobileSidebarOpen]);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("conversations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      toast({ title: "Error loading conversations", description: error.message, variant: "destructive" });
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      if (error) throw error;
      setMessages((data || []).map((msg) => ({ id: msg.id, role: msg.sender_type as "user" | "assistant", content: msg.content, created_at: msg.created_at })));
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast({ title: "Error loading messages", description: error.message, variant: "destructive" });
    }
  };

  const generateTitle = (message: string): string => {
    const words = message.trim().split(/\s+/).slice(0, 6);
    return words.join(" ") + (message.split(/\s+/).length > 6 ? "..." : "");
  };

  const createNewChat = () => { setCurrentConversationId(null); setMessages([]); };
  const selectChat = (chatId: string) => { setCurrentConversationId(chatId); };

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const result = await sendChatMessage({
        message: content,
        conversation_id: currentConversationId,
      });

      const conversationId = result.conversation_id || currentConversationId;
      if (conversationId && conversationId !== currentConversationId) {
        setCurrentConversationId(conversationId);
        await loadConversations();
      }

      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: result.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (conversationId) {
        await loadMessages(conversationId);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (selectedMode: string) => {
    setMode(selectedMode);
    const routeMap: Record<string, string> = {
      Chat: "/",
      "Skill Gap": "/skill-gap",
      Roadmap: "/roadmap",
      Resume: "/resume",
      Projects: "/projects",
      Progress: "/progress",
    };
    const destination = routeMap[selectedMode];
    if (destination && destination !== location.pathname) {
      navigate(destination);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Error signing out", description: error.message, variant: "destructive" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Unsupported file type", description: "Please upload a PDF or Word document (.pdf, .doc, .docx)", variant: "destructive" });
      return;
    }

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        navigate("/resume", { state: { prefillResumeText: text } });
      };
      reader.readAsText(file);
      toast({ title: "Text resume loaded", description: "Opening Resume Review with your uploaded content." });
    } else {
      navigate("/resume", { state: { uploadedFileName: file.name } });
      toast({
        title: "Document selected",
        description: "Open Resume Review and paste the extracted text for best analysis quality.",
      });
    }

    e.target.value = "";
  };

  const featureTiles = [
    { icon: Target, label: "Profile", color: "text-primary", path: "/profile" },
    { icon: BarChart3, label: "Skill Gap", color: "text-accent", path: "/skill-gap" },
    { icon: Lightbulb, label: "Roadmap", color: "text-amber-500", path: "/roadmap" },
    { icon: FileText, label: "Resume", color: "text-blue-500", path: "/resume" },
    { icon: GraduationCap, label: "Projects", color: "text-violet-500", path: "/projects" },
    { icon: BookOpen, label: "Progress", color: "text-rose-400", path: "/progress" },
  ];
  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-dvh md:h-screen w-full overflow-hidden bg-background">
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNewChat={createNewChat}
          chatHistory={conversations.map(conv => ({ id: conv.id, title: conv.title }))}
          onSelectChat={selectChat}
          currentChatId={currentConversationId || ""}
        />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 md:hidden",
          isMobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out md:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          isCollapsed={false}
          onToggleCollapse={() => setIsMobileSidebarOpen(false)}
          onNewChat={createNewChat}
          chatHistory={conversations.map(conv => ({ id: conv.id, title: conv.title }))}
          onSelectChat={selectChat}
          currentChatId={currentConversationId || ""}
          onNavigate={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-lg px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg md:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  CareerCompass
                </h1>
                <p className="text-xs text-muted-foreground truncate">AI Career Readiness Assistant</p>
              </div>
            </div>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-1.5">
              <select
                value={mode}
                onChange={(e) => handleModeChange(e.target.value)}
                className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-xs sm:flex-none"
              >
                <option>Chat</option>
                <option>Skill Gap</option>
                <option>Roadmap</option>
                <option>Resume</option>
                <option>Projects</option>
                <option>Progress</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs h-8"
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <div className={cn("flex-1", hasMessages ? "overflow-y-auto" : "overflow-hidden") }>
              {!hasMessages ? (
                <div className="h-full overflow-y-auto no-scrollbar px-3 sm:px-6">
                  <div className="min-h-full flex items-start justify-center py-6 sm:py-8 lg:items-center">
                    <div className="text-center max-w-2xl px-2 sm:px-0">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 gold-glow">
                      <Compass className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 tracking-tight">
                      Welcome to CareerCompass
                    </h2>
                    <p className="text-muted-foreground mb-5 text-sm">
                      Your AI-powered guide to career readiness. Here's what I can help with:
                    </p>

                    {/* Feature tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      {featureTiles.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className="glass-card rounded-xl p-3 sm:p-4 hover-lift cursor-pointer group text-center"
                          >
                            <Icon className={cn("w-5 h-5 mx-auto mb-2", item.color)} />
                            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                              {item.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Upload Document Button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 sm:px-8 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document (CV / Recommendation Letter)
                    </Button>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>View Profile</Button>
                      <Button variant="outline" size="sm" onClick={() => navigate("/skill-gap")}>Analyze Skills</Button>
                      <Button variant="outline" size="sm" onClick={() => navigate("/roadmap")}>Generate Roadmap</Button>
                    </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-3 sm:py-4 max-w-3xl mx-auto w-full">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} role={message.role} content={message.content} />
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 px-3 sm:px-6 py-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                      <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
