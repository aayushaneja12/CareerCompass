import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

const About = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-black via-[#1a1410] to-[#2e2520]">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-[hsl(var(--sidebar-border))] bg-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-[hsl(var(--sidebar-accent))] rounded-lg transition-smooth"
              >
                <Menu className="w-5 h-5 text-[hsl(var(--sidebar-foreground))]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[hsl(var(--sidebar-primary))] text-glow">
                  About PRP AI Agent
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Learn about the Professional Readiness Program Assistant
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Project Overview */}
            <section className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))] shadow-elegant">
              <h2 className="text-2xl font-bold text-[hsl(var(--sidebar-primary))] mb-4">
                About Mentra
              </h2>
              <p className="text-[hsl(var(--foreground))] leading-relaxed mb-4">
                Mentra is an AI-powered conversational assistant developed for SP Jain School of Global Management&apos;s Professional Readiness Program (PRP). Designed as part of the Bachelor of Data Science Capstone Project, Mentra centralizes PRP-related information and automates routine support tasks.
              </p>
              <p className="text-[hsl(var(--foreground))] leading-relaxed mb-4">
                Students often need guidance on improving CVs, optimizing LinkedIn profiles, crafting cover letters, and preparing for interviews. They also have questions about immigration policies, work rights, and skill development. Mentra addresses these needs by providing personalized career guidance, real-time PRP updates, and connecting to relevant data sources for accurate, context-aware responses.
              </p>
              <p className="text-[hsl(var(--muted-foreground))] text-sm">
                This is an independent prototype in active development, aiming to enhance the effectiveness and efficiency of the Professional Readiness Program.
              </p>
            </section>

            {/* What Problems Does It Solve */}
            <section className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))] shadow-elegant">
              <h2 className="text-2xl font-bold text-[hsl(var(--sidebar-primary))] mb-4">
                What Problems Does Mentra Solve?
              </h2>
              <div className="space-y-3">
                <p className="text-[hsl(var(--foreground))] leading-relaxed">
                  <span className="font-semibold text-[hsl(var(--accent))]">For Students:</span> Get instant answers to common PRP questions, receive personalized career guidance, and stay updated on events, attendance, and mentoring opportunities—all in one place.
                </p>
                <p className="text-[hsl(var(--foreground))] leading-relaxed">
                  <span className="font-semibold text-[hsl(var(--accent))]">For Mentors:</span> Reduce time spent answering repetitive questions and compiling reports, allowing more focus on personalized one-on-one coaching and strategic guidance.
                </p>
              </div>
            </section>

            {/* What Mentra Can Do */}
            <section className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))] shadow-elegant">
              <h2 className="text-2xl font-bold text-[hsl(var(--sidebar-primary))] mb-4">
                What Mentra Can Do
              </h2>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">Career Guidance</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Get help with CV optimization, LinkedIn profiles, cover letters, and interview preparation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">Event & Attendance Updates</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Stay informed about PRP events, sessions, and track your attendance records
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">FAQ & Common Questions</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Instant answers to frequently asked questions about immigration, work rights, and PRP requirements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">Skill Development</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Receive insights on developing the right skill set for professional readiness
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">Coaching Sessions</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Access information about mentoring opportunities and one-on-one coaching availability
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Project Scope */}
            <section className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))] shadow-elegant">
              <h2 className="text-2xl font-bold text-[hsl(var(--sidebar-primary))] mb-4">
                Current Capabilities
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[hsl(var(--accent))] mb-2">✓ Available Now</h3>
                  <ul className="space-y-1 text-sm text-[hsl(var(--foreground))]">
                    <li>• Natural language conversation interface</li>
                    <li>• PRP event and attendance queries</li>
                    <li>• Secure database with anonymized data access</li>
                    <li>• Career guidance assistance</li>
                    <li>• FAQ responses</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--muted-foreground))] mb-2">⚠ Not Yet Available</h3>
                  <ul className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                    <li>• Full deployment across official SP Jain systems</li>
                    <li>• Real-time sensitive student data integration</li>
                    <li>• Third-party platform integrations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Technology & Security */}
            <section className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))] shadow-elegant">
              <h2 className="text-2xl font-bold text-[hsl(var(--sidebar-primary))] mb-4">
                Technology & Security
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Built With</h3>
                  <div className="flex flex-wrap gap-3">
                    {["React", "TypeScript", "Python", "Supabase", "LangChain", "NLP Models"].map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Security & Privacy</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Mentra uses Row-Level Security (RLS) in Supabase to ensure data protection. All student data used in testing is anonymized or synthetic, adhering to institutional privacy policies.
                  </p>
                </div>
              </div>
            </section>

            {/* Project Timeline */}
            <section className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))] shadow-elegant">
              <h2 className="text-2xl font-bold text-[hsl(var(--sidebar-primary))] mb-4">
                Development Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Phase 1: Research & Planning</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">System architecture, database design, and UI mockups</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Phase 2: Implementation</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">AI agent development, NLP integration, and frontend interface</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Phase 3: Testing & Validation</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Accuracy evaluation, user feedback, and refinements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Expected Completion</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">January 2026</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Project Team */}
            <section className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))] shadow-elegant">
              <h2 className="text-2xl font-bold text-[hsl(var(--sidebar-primary))] mb-4">
                Development Team
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                Mentra is developed by Bachelor of Data Science students at SP Jain School of Global Management as part of their Capstone Project.
              </p>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-[hsl(var(--sidebar-accent-foreground))] font-semibold text-sm">
                    T
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Trisha</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Frontend - UI/UX Design & Development</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-[hsl(var(--sidebar-accent-foreground))] font-semibold text-sm">
                    D
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Devanshi</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Middleware - Data Integration & Configuration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-[hsl(var(--sidebar-accent-foreground))] font-semibold text-sm">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">Makhabat</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Backend - Core Logic & API Development</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="bg-[hsl(var(--accent))]/10 rounded-lg p-6 border border-[hsl(var(--accent))]/20">
              <h2 className="text-lg font-bold text-[hsl(var(--accent))] mb-2">
                ⚠️ Development Notice
              </h2>
              <p className="text-sm text-[hsl(var(--foreground))] mb-2">
                Mentra is an independent prototype developed for educational purposes. This is an active MVP and tools, features, and integrations may change during the development process.
              </p>
              <p className="text-sm text-[hsl(var(--foreground))]">
                For testing purposes, the system uses anonymized or mock PRP data to ensure student privacy and comply with institutional policies.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;