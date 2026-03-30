import { useEffect, useState } from "react";
import { Wrench, Info, Home, History, ChevronDown, Compass, Target, BarChart3, Lightbulb, FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  onNewChat?: () => void;
  chatHistory?: Array<{ id: string; title: string }>;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
  onNavigate?: () => void;
}

const services = [
  { id: "profile", label: "Profile", icon: Target, path: "/profile" },
  { id: "skill-gap", label: "Skill Gap", icon: BarChart3, path: "/skill-gap" },
  { id: "roadmap", label: "Roadmap", icon: Lightbulb, path: "/roadmap" },
  { id: "resume", label: "Resume", icon: FileText, path: "/resume" },
  { id: "projects", label: "Projects", icon: Wrench, path: "/projects" },
  { id: "progress", label: "Progress", icon: BarChart3, path: "/progress" },
];

const Sidebar = ({ isCollapsed, onToggleCollapse, onNewChat, chatHistory, onSelectChat, currentChatId, onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [localChatHistory, setLocalChatHistory] = useState<Array<{ id: string; title: string }>>([]);
  const isChatContext = typeof onNewChat === "function";
  const hasExternalHistory = Array.isArray(chatHistory);
  const effectiveChatHistory = hasExternalHistory ? chatHistory : localChatHistory;
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    const saved = localStorage.getItem("careercompass.sidebar.expandedSection");
    if (saved === "history" || saved === "services") {
      return saved;
    }
    return null;
  });

  useEffect(() => {
    if (hasExternalHistory) {
      return;
    }

    const loadConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLocalChatHistory([]);
        return;
      }

      const { data, error } = await supabase
        .from("conversations")
        .select("id,title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setLocalChatHistory([]);
        return;
      }

      setLocalChatHistory((data || []).map((row) => ({
        id: row.id,
        title: row.title || "Untitled chat",
      })));
    };

    loadConversations();
  }, [hasExternalHistory, location.pathname]);

  useEffect(() => {
    if (expandedSection) {
      localStorage.setItem("careercompass.sidebar.expandedSection", expandedSection);
    }
  }, [expandedSection]);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <aside
      className={cn(
        "relative h-dvh md:h-screen bg-sidebar flex shrink-0 flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
          className={cn(
            "absolute top-4 right-2 z-10 rounded-lg border border-border/50 bg-background/80 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            isCollapsed && "right-1"
          )}
        >
          {isCollapsed ? <Menu className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Brand header */}
      <div className="p-4 flex items-center gap-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">CareerCompass</h2>
              <p className="text-[10px] text-muted-foreground">Career Readiness AI</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center mx-auto">
            <Compass className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      {/* Primary action */}
      <div className="px-3 mb-2">
        <button
          onClick={() => {
            onNewChat?.();
            if (location.pathname !== "/") {
              navigate("/");
            }
            onNavigate?.();
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl transition-all duration-200",
            "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20",
            "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
            isCollapsed ? "p-2.5 justify-center" : "px-4 py-2.5"
          )}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Home</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto px-2 space-y-0.5">
        {/* History Section (chat page only) */}
        <div>
          <button
            onClick={() => toggleSection("history")}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl transition-all duration-200",
              isCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5",
              expandedSection === "history"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <History className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">History</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", expandedSection === "history" && "rotate-180")} />
              </>
            )}
          </button>
          {expandedSection === "history" && !isCollapsed && (
            <div className="ml-3 mt-1 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {effectiveChatHistory.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground italic">No conversations yet</p>
              ) : (
                effectiveChatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      if (onSelectChat) {
                        onSelectChat(chat.id);
                        if (location.pathname !== "/") {
                          navigate("/");
                        }
                        onNavigate?.();
                        return;
                      }
                      navigate("/", { state: { openConversationId: chat.id } });
                      onNavigate?.();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs rounded-lg truncate transition-all duration-150",
                      currentChatId === chat.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    {chat.title}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Services Section */}
        <div>
          <button
            onClick={() => toggleSection("services")}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl transition-all duration-200",
              isCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5",
              expandedSection === "services"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <Wrench className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">Services</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", expandedSection === "services" && "rotate-180")} />
              </>
            )}
          </button>
          {expandedSection === "services" && !isCollapsed && (
            <div className="ml-3 mt-1 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {services.map((service) => {
                const Icon = service.icon;
                const isActive = location.pathname === service.path;
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      navigate(service.path);
                      onNavigate?.();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs rounded-lg transition-all duration-150 flex items-center gap-2",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {service.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* About Project */}
        <button
          onClick={() => {
            navigate("/about");
            onNavigate?.();
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl transition-all duration-200",
            isCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5",
            location.pathname === "/about"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          )}
        >
          <Info className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="flex-1 text-left text-sm">About Project</span>}
        </button>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="px-3 py-2.5 rounded-xl bg-primary/10 border border-border/40">
            <p className="text-[10px] text-gray-900 leading-relaxed">
              <Info className="w-3 h-3 inline mr-1 text-gray-800" />
              SP Jain Capstone Project
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
