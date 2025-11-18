import { useState } from "react";
import { FileText, Wrench, Info, ChevronRight, MessageSquarePlus, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  onNewChat?: () => void;
  chatHistory?: Array<{ id: string; title: string }>;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
}

const Sidebar = ({ isCollapsed, onNewChat, chatHistory = [], onSelectChat, currentChatId }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("services");
  const [expandedSection, setExpandedSection] = useState<string | null>("services");

  const tabs = [
    { id: "new-chat", label: "New Chat", icon: MessageSquarePlus, action: onNewChat },
    { id: "history", label: "History", icon: History },
    { id: "services", label: "Services", icon: Wrench },
    { id: "about", label: "About Project", icon: Info },
  ];

  const services = [
    "FAQ",
    "Attendance",
    "Events",
    "Quizzes",
    "Progress",
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-[hsl(var(--sidebar-background))] border-r-2 border-[hsl(var(--sidebar-border))] transition-smooth flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--sidebar-border))]">
        {!isCollapsed && (
          <h2 className="text-[hsl(var(--sidebar-primary))] font-bold text-lg text-glow">
            PRP AI Agent
          </h2>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isExpanded = expandedSection === tab.id;

          return (
            <div key={tab.id}>
              <button
                onClick={() => {
                  if (tab.id === "new-chat" && tab.action) {
                    tab.action();
                  } else if (tab.id === "about") {
                    navigate("/about");
                  } else {
                    if (location.pathname !== "/") {
                      navigate("/");
                    }
                    setActiveTab(tab.id);
                    setExpandedSection(isExpanded ? null : tab.id);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 transition-smooth hover:bg-[hsl(var(--sidebar-accent))]",
                  isActive && "bg-[hsl(var(--sidebar-accent))] border-l-4 border-[hsl(var(--sidebar-primary))]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-smooth",
                    isActive
                      ? "text-[hsl(var(--sidebar-accent-foreground))]"
                      : "text-[hsl(var(--sidebar-foreground))]"
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span
                      className={cn(
                        "flex-1 text-left font-medium transition-smooth",
                        isActive && "text-[hsl(var(--sidebar-accent-foreground))]"
                      )}
                    >
                      {tab.label}
                    </span>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-smooth",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </>
                )}
              </button>

              {/* Expandable section for History */}
              {tab.id === "history" && isExpanded && !isCollapsed && (
                <div className="bg-[hsl(var(--card))] border-l-2 border-[hsl(var(--sidebar-primary))] ml-4 max-h-64 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="px-6 py-2 text-sm text-[hsl(var(--muted-foreground))] italic">
                      No chat history yet
                    </div>
                  ) : (
                    chatHistory.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => onSelectChat?.(chat.id)}
                        className={cn(
                          "w-full text-left px-6 py-2 text-sm transition-smooth truncate",
                          currentChatId === chat.id
                            ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
                        )}
                      >
                        {chat.title}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Expandable section for Services */}
              {tab.id === "services" && isExpanded && !isCollapsed && (
                <div className="bg-[hsl(var(--card))] border-l-2 border-[hsl(var(--sidebar-primary))] ml-4">
                  {services.map((service) => (
                    <button
                      key={service}
                      className="w-full text-left px-6 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] transition-smooth"
                    >
                      {service}
                    </button>
                  ))}
                </div>
              )}


              {/* About section */}
              {tab.id === "about" && isExpanded && !isCollapsed && (
                <div className="bg-[hsl(var(--card))] border-l-2 border-[hsl(var(--sidebar-primary))] ml-4 p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                    PRP AI Agent MVP
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    An intelligent assistant for the Professional Readiness Program
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Disclaimer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="flex items-start gap-2 p-3 bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]">
            <Info className="w-4 h-4 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Features may change during development
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;