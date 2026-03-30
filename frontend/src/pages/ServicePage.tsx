import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Target, BarChart3, Lightbulb, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const serviceData: Record<string, {
  title: string;
  description: string;
  icon: any;
  color: string;
  steps: string[];
  prompts: string[];
}> = {
  "career-paths": {
    title: "Career Path Finder",
    description: "Discover career paths tailored to your profile, skills, and interests. Get a visual roadmap with actionable steps to reach your target role.",
    icon: Target,
    color: "text-primary",
    steps: [
      "Tell CareerCompass about your current skills and interests",
      "Receive personalized career path suggestions",
      "View a step-by-step roadmap for each recommended role",
      "Get actionable next steps to start your journey",
    ],
    prompts: [
      "I'm interested in data science and have a background in statistics. What career paths would suit me?",
      "Suggest career paths for someone with skills in Python, SQL, and communication.",
      "I want to transition from marketing to product management. What steps should I take?",
      "What are the best career paths in tech for a business graduate?",
    ],
  },
  "skill-analysis": {
    title: "Skill Gap Analysis",
    description: "Compare your current skills against the requirements of your target role. Identify missing skills and get priority learning areas.",
    icon: BarChart3,
    color: "text-secondary",
    steps: [
      "Share your current skill set with CareerCompass",
      "Specify your target role or career goal",
      "Receive a detailed gap analysis comparing your skills vs. requirements",
      "Get prioritized recommendations on what to learn first",
    ],
    prompts: [
      "I know Python, Excel, and basic SQL. What skills am I missing for a Data Analyst role?",
      "Compare my skills (React, Node.js, MongoDB) against a Full Stack Developer job.",
      "What skills do I need to become a Product Manager if I currently work in QA?",
      "Analyze the gap between my marketing skills and a Growth Hacker role.",
    ],
  },
  "learning-plans": {
    title: "Learning Suggestions",
    description: "Get personalized recommendations for courses, projects, and practice tasks tailored to your goals and current skill level.",
    icon: Lightbulb,
    color: "text-accent",
    steps: [
      "Share your career goal and current skill level",
      "CareerCompass analyzes your strengths and weaknesses",
      "Receive tailored course and project recommendations",
      "Follow a structured learning plan to upskill efficiently",
    ],
    prompts: [
      "Suggest a learning plan to become a machine learning engineer in 6 months.",
      "I'm a beginner in web development. What courses and projects should I start with?",
      "Recommend resources to improve my data visualization and storytelling skills.",
      "Create a study plan for someone preparing for a cloud architecture certification.",
    ],
  },
  "resume-builder": {
    title: "Resume Tailoring",
    description: "Optimize your resume for specific job descriptions. Get keyword suggestions, bullet point improvements, and alignment tips.",
    icon: FileText,
    color: "text-primary",
    steps: [
      "Share your current resume content or key experiences",
      "Paste the job description you're targeting",
      "CareerCompass analyzes alignment and suggests improvements",
      "Get optimized bullet points and keyword recommendations",
    ],
    prompts: [
      "Here's my resume and a job description for a Software Engineer at Google. How should I tailor it?",
      "Optimize my resume bullet points for a Product Manager role at a startup.",
      "What keywords should I add to my resume for a Data Scientist position?",
      "Review my resume and suggest improvements for a UX Designer application.",
    ],
  },
};

const ServicePage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const service = serviceId ? serviceData[serviceId] : null;

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Service not found</h2>
          <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chat
          </Button>
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  const handleUsePrompt = (prompt: string) => {
    // Navigate to chat and pass the prompt via state
    navigate("/", { state: { prefillMessage: prompt } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-lg px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-muted w-9 h-9"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center")}>
              <Icon className={cn("w-5 h-5", service.color)} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{service.title}</h1>
              <p className="text-xs text-muted-foreground">CareerCompass Service</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Description */}
        <div className="glass-card rounded-2xl p-6">
          <p className="text-muted-foreground leading-relaxed">{service.description}</p>
        </div>

        {/* How to Use */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">How to Use</h2>
          <div className="grid gap-3">
            {service.steps.map((step, i) => (
              <div key={i} className="glass-card rounded-xl p-4 flex items-start gap-4 hover-lift">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ready-to-Use Prompts */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Try These Prompts</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {service.prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleUsePrompt(prompt)}
                className="glass-card rounded-xl p-4 text-left hover-lift group cursor-pointer transition-all duration-200 hover:border-primary/30"
              >
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                  "{prompt}"
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Send className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Use this prompt</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
