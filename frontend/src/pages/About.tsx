import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu, Compass } from "lucide-react";

const About = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
              >
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  About CareerCompass
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Career Readiness Assistant
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Project Overview */}
            <section className="bg-card rounded-xl p-6 border border-border shadow-elegant">
              <h2 className="text-2xl font-bold text-primary mb-4">
                About CareerCompass
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                CareerCompass is an AI-powered career readiness assistant developed for SP Jain School of Global Management&apos;s Professional Readiness Program (PRP). It evolved from an initial prototype called Mentra, which proved the concept of a conversational AI assistant for PRP queries.
              </p>
              <p className="text-foreground leading-relaxed mb-4">
                The current version shifts focus from general PRP support to a more specific career readiness assistant, addressing three key interconnected objectives: suggesting suitable career options, determining skill gaps in relation to intended careers, and providing improvement guidance. Additionally, a prototype has been designed to create tailored resumes aligned with job descriptions.
              </p>
              <p className="text-muted-foreground text-sm">
                Submitted as part of the Bachelor of Data Science Capstone Project at SP Jain School of Global Management, Sydney, Australia — March 2026.
              </p>
            </section>

            {/* What Problems Does It Solve */}
            <section className="bg-card rounded-xl p-6 border border-border shadow-elegant">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Problem Statement
              </h2>
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">
                  Students often face uncertainty when making career decisions. Existing approaches rely on generic platforms or limited one-on-one interactions with mentors, which cannot scale.
                </p>
                <p className="text-foreground leading-relaxed">
                  <span className="font-semibold text-accent">For Students:</span> Get AI-driven career path recommendations, identify skill gaps against target roles, receive personalized learning suggestions, and tailor resumes for specific job descriptions.
                </p>
                <p className="text-foreground leading-relaxed">
                  <span className="font-semibold text-accent">For the PRP:</span> Enhance the program by embedding an intelligent assistant that supports scalable, personalized career guidance alongside existing mentoring.
                </p>
              </div>
            </section>

            {/* Implemented Features */}
            <section className="bg-card rounded-xl p-6 border border-border shadow-elegant">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Features & Modules
              </h2>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Career Path Recommendation</h3>
                    <p className="text-sm text-muted-foreground">
                      Suggests suitable career options based on user profile, skills, and interests with a visual roadmap showing steps to reach the target role.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Skill Gap Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Compares current skills against the requirements of a target role, identifying missing skills and priority learning areas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Personalized Learning Suggestions</h3>
                    <p className="text-sm text-muted-foreground">
                      Recommends courses, projects, and practice tasks tailored to user goals and identified weaknesses (partially implemented).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Resume Tailoring (Prototype)</h3>
                    <p className="text-sm text-muted-foreground">
                      Allows users to upload a resume and job description. The AI optimizes keywords, suggests bullet point improvements, and aligns the resume with job requirements.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Current Status */}
            <section className="bg-card rounded-xl p-6 border border-border shadow-elegant">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Current Development Status
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-accent mb-2">✓ Implemented</h3>
                  <ul className="space-y-1 text-sm text-foreground">
                    <li>• Career Path Recommendation module (functional)</li>
                    <li>• Skill Gap Analysis module (functional)</li>
                    <li>• Conversational AI interface</li>
                    <li>• Structured input mapping and workflow routing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-500 mb-2">⏳ In Progress</h3>
                  <ul className="space-y-1 text-sm text-foreground">
                    <li>• Personalized Learning Suggestions module</li>
                    <li>• Resume Tailoring prototype</li>
                    <li>• Skill Assessment / Adaptive Quizzes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-muted-foreground mb-2">🔜 Planned for Capstone II</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Full evaluation and refinement</li>
                    <li>• Enhanced inference capabilities</li>
                    <li>• Integration with broader PRP ecosystem</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Technology */}
            <section className="bg-card rounded-xl p-6 border border-border shadow-elegant">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Technology & Architecture
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Built With</h3>
                  <div className="flex flex-wrap gap-3">
                    {["React", "TypeScript", "Supabase", "AI/LLM", "Workflow Routing", "Structured Mapping"].map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Architecture</h3>
                  <p className="text-sm text-muted-foreground">
                    CareerCompass uses a workflow-centric design with structured input mapping, light inference, and modular tool routing. The system moves beyond a simple chatbot towards a decision support tool.
                  </p>
                </div>
              </div>
            </section>

            {/* Team */}
            <section className="bg-card rounded-xl p-6 border border-border shadow-elegant">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Development Team
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                CareerCompass is developed by Bachelor of Data Science students at SP Jain School of Global Management, under the supervision of Abhijit Dasgupta.
              </p>
              <div className="grid gap-3">
                {[
                  { initial: "D", name: "Devanshi Rhea Aucharaz", id: "BJ24DSY005" },
                  { initial: "M", name: "Makhabat Zhyrgalbekova", id: "BS23DSY034" },
                  { initial: "A", name: "Aayush Aneja", id: "BS23DM002" },
                  { initial: "T", name: "Trisha Mukherjee", id: "BS23DMU052" },
                ].map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {member.initial}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <section className="bg-primary/5 rounded-xl p-6 border border-primary/15">
              <h2 className="text-lg font-bold text-primary mb-2">
                📝 Draft Report Notice
              </h2>
              <p className="text-sm text-foreground mb-2">
                This is a draft system submitted in partial fulfillment of the Capstone Project requirements. Features, tools, and modules are subject to further development, evaluation, and refinement in Capstone Project II.
              </p>
              <p className="text-sm text-foreground">
                The system currently operates with structured input mapping and light inference. Full AI model integration and comprehensive evaluation are planned for the next phase.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
