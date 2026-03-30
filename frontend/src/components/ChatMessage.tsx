import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-2 sm:gap-3 px-3 sm:px-6 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "glass-card text-card-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
