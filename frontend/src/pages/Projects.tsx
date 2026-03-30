import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Compass, Code2, Star, Bookmark, BookmarkCheck, Layers, GitBranch } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCareerAnalysis } from "@/hooks/useCareerAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GenerateProjectsRequest } from "@/integrations/supabase/career-types";
import { useSidebarState } from "@/hooks/useSidebarState";

const Projects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, isGeneratingProjects, error, suggestProjects, clearError } = useCareerAnalysis();

  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarState();
  const [targetRole, setTargetRole] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [count, setCount] = useState(3);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      toast({ title: "Error", description: "Please enter a target role", variant: "destructive" });
      return;
    }

    try {
      clearError();
      const request: GenerateProjectsRequest = {
        target_role: targetRole,
        difficulty_level: difficulty || undefined,
        count: count,
      };
      await suggestProjects(request);
      setHasGenerated(true);
    } catch (err) {
      console.error("Generation error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleSaveProject = (projectId: string | undefined) => {
    if (!projectId) return;
    const newSaved = new Set(savedProjects);
    if (newSaved.has(projectId)) {
      newSaved.delete(projectId);
      toast({ title: "Removed", description: "Project removed from saved" });
    } else {
      newSaved.add(projectId);
      toast({ title: "Saved", description: "Project saved for later" });
    }
    setSavedProjects(newSaved);
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "advanced":
        return "text-red-500 bg-red-50";
      case "intermediate":
        return "text-yellow-500 bg-yellow-50";
      case "beginner":
        return "text-green-500 bg-green-50";
      default:
        return "text-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-lg px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hover:bg-muted rounded-xl w-9 h-9"
              >
                {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
              <div>
                <h1 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  Project Ideas
                </h1>
                <p className="text-xs text-muted-foreground">Build portfolio projects for your career</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs h-8"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Filters Form */}
            <Card>
              <CardHeader>
                <CardTitle>Get Project Suggestions</CardTitle>
                <CardDescription>Build real-world projects to strengthen your portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-role">Target Role</Label>
                    <Input
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Data Scientist"
                      onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="">Any Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="count">Number of Ideas</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="10"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value) || 3)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGeneratingProjects}
                      className="w-full rounded-lg"
                    >
                      {isGeneratingProjects ? "Generating..." : "Get Ideas"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            {hasGenerated && projects.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {projects.map((project, idx) => (
                  <Card key={project.id || idx} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{project.title}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={cn("text-xs", getDifficultyColor(project.difficulty_level))}>
                              {project.difficulty_level}
                            </Badge>
                            {project.relevance_score !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                {Math.round(project.relevance_score * 100) / 100} relevance
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveProject(project.id)}
                          className={cn(
                            "flex-shrink-0",
                            savedProjects.has(project.id || "") && "text-primary"
                          )}
                        >
                          {savedProjects.has(project.id || "") ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold mb-1">Project Brief</h4>
                        <p className="text-sm text-foreground">{project.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground mb-1">Expected Outcome</p>
                          <p className="text-sm">{project.portfolio_value || "A portfolio-ready case study with measurable impact."}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground mb-1">Role Relevance</p>
                          <p className="text-sm">{project.relevance_to_role || `Build evidence for ${targetRole || "your target role"} interviews.`}</p>
                        </div>
                      </div>

                      {/* Tech Stack */}
                      {project.tech_stack.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            Tech Stack
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {project.tech_stack.map((tech, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills Covered */}
                      {project.skills_covered.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold mb-2">Skills You'll Learn</h4>
                          <div className="flex flex-wrap gap-1">
                            {project.skills_covered.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Implementation Steps */}
                      {project.implementation_steps && project.implementation_steps.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold mb-2">Implementation Steps</h4>
                          <ol className="space-y-1">
                            {project.implementation_steps.map((step: any, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground">
                                {i + 1}. {typeof step === "string" ? step : step.title || JSON.stringify(step).substring(0, 50)}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Resources */}
                      {project.resources && project.resources.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold mb-2">Helpful Resources</h4>
                          <ul className="space-y-1">
                            {project.resources.map((resource, i) => (
                              <li key={i} className="text-xs text-blue-600 hover:underline cursor-pointer">
                                • {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button variant="outline" className="w-full text-xs h-8 rounded-lg">
                        Start This Project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {hasGenerated && projects.length === 0 && !isGeneratingProjects && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No projects found. Try a different role or filters.
                  </p>
                </CardContent>
              </Card>
            )}

            {!hasGenerated && !isGeneratingProjects && (
              <div className="text-center py-12">
                <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Enter a role to get personalized project suggestions</p>
              </div>
            )}

            {/* Saved Projects Summary */}
            {savedProjects.size > 0 && (
              <div className="fixed bottom-6 right-6">
                <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded-full">
                  <BookmarkCheck className="w-3.5 h-3.5 mr-2" />
                  {savedProjects.size} saved
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
