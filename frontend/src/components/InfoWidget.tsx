import { Target, BarChart3, FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Widget {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const InfoWidget = () => {
  const widgets: Widget[] = [
    { title: "Career Paths", value: "Explore options", icon: <Target className="w-4 h-4" />, color: "text-primary" },
    { title: "Skill Gaps", value: "Analyze now", icon: <BarChart3 className="w-4 h-4" />, color: "text-accent" },
    { title: "Resume Builder", value: "Tailor for JD", icon: <FileText className="w-4 h-4" />, color: "text-blue-500" },
    { title: "Learning", value: "Get suggestions", icon: <Lightbulb className="w-4 h-4" />, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-3 p-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Access</h3>
      <div className="space-y-2">
        {widgets.map((widget, index) => (
          <div
            key={index}
            className={cn(
              "glass-card rounded-xl p-3.5 hover-lift cursor-pointer group"
            )}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={widget.color}>{widget.icon}</span>
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            </div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
              {widget.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoWidget;
