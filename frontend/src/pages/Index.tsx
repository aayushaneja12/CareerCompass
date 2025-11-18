import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import InfoWidget from "@/components/InfoWidget";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const Index = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("prp-chat-sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    const saved = localStorage.getItem("prp-current-chat-id");
    return saved || "";
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chatSessions.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    localStorage.setItem("prp-chat-sessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem("prp-current-chat-id", currentChatId);
  }, [currentChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setChatSessions(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleSendMessage = (content: string) => {
    if (!currentChatId) {
      createNewChat();
      return;
    }

    const userMessage: Message = { role: "user", content };
    
    setChatSessions(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = [...chat.messages, userMessage];
        const newTitle = chat.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "..." : "") : chat.title;
        return { ...chat, messages: updatedMessages, title: newTitle };
      }
      return chat;
    }));

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "Hello! I'm the PRP AI Agent. I'm here to help you with all your Professional Readiness Program questions. You can ask me about badges, events, attendance, quizzes, and track your progress. How can I assist you today?",
      };
      
      setChatSessions(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, aiMessage] };
        }
        return chat;
      }));
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onNewChat={createNewChat}
        chatHistory={chatSessions.map(chat => ({ id: chat.id, title: chat.title }))}
        onSelectChat={selectChat}
        currentChatId={currentChatId}
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
                  PRP AI Agent 🤖
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Your Interactive Mentor
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWidgets(!showWidgets)}
              className="hover:bg-[hsl(var(--accent))] transition-smooth"
            >
              {showWidgets ? "Hide" : "Show"} Widgets
            </Button>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 italic">
            "Ask anything about PRP — from badges to events, I'm here to help!"
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
                      <span className="text-4xl">🤖</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4 text-glow">
                      Welcome to PRP AI Agent
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-8 text-lg">
                      Ready to track your PRP progress today? I can help you with:
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      {[
                        "📚 PRP Documentation & FAQs",
                        "📊 Track Your Attendance",
                        "📅 Upcoming Events & Sessions",
                        "✅ Quiz Schedules & Results",
                        "🏆 Badge Progress & Achievements",
                        "📈 Overall Progress Dashboard",
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
                  {messages.map((message, index) => (
                    <ChatMessage key={index} role={message.role} content={message.content} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <ChatInput onSend={handleSendMessage} />
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