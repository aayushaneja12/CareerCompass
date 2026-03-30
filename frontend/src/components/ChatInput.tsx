import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-card/80 backdrop-blur-lg border-t border-border/50">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex gap-2 sm:gap-3 items-end glass-card rounded-2xl p-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about career paths, skills, resumes..."
            className={cn(
              "min-h-[48px] max-h-[160px] resize-none border-0 bg-transparent",
              "text-foreground placeholder:text-muted-foreground/60",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "text-sm"
            )}
            disabled={disabled}
          />
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            size="icon"
            className={cn(
              "rounded-xl w-10 h-10 flex-shrink-0",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
              "transition-all duration-200 hover:scale-105",
              "disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="hidden sm:block text-center text-[10px] text-muted-foreground/40 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </form>
    </div>
  );
};

export default ChatInput;
