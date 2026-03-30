import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Compass, Zap, Target, TrendingUp, CheckCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCareerAnalysis } from "@/hooks/useCareerAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SkillGapReport, AnalyzeSkillGapRequest } from "@/integrations/supabase/career-types";
import { useSidebarState } from "@/hooks/useSidebarState";

const SkillGap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { skillGapReport, isAnalyzingSkillGap, error, analyzeSkillGap, clearError } = useCareerAnalysis();

  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarState();
  const [targetRole, setTargetRole] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      toast({ title: "Error", description: "Please enter a target role", variant: "destructive" });
      return;
    }

    try {
      clearError();
      const request: AnalyzeSkillGapRequest = { target_role: targetRole };
      await analyzeSkillGap(request);
      setHasAnalyzed(true);
    } catch (err) {
      console.error("Analysis error:", err);
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

  const getImportanceColor = (importance: string) => {
    switch (importance.toLowerCase()) {
      case "critical":
        return "text-red-500 bg-red-50 border-red-200";
      case "high":
        return "text-orange-500 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-500 bg-blue-50 border-blue-200";
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const parseStep = (step: string) => {
    const parts = step.split("|").map((part) => part.trim());
    if (parts.length < 4) {
      return {
        phase: "Phase 1",
        priority: "Medium",
        action: step,
        outcome: "",
      };
    }

    return {
      phase: parts[0],
      priority: parts[1].replace("Priority:", "").trim(),
      action: parts[2].replace("Action:", "").trim(),
      outcome: parts[3].replace("Outcome:", "").trim(),
    };
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
                  <Zap className="w-4 h-4 text-primary" />
                  Skill Gap Analysis
                </h1>
                <p className="text-xs text-muted-foreground">Identify missing skills for your target role</p>
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
          <div className="max-w-4xl mx-auto space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Analysis Form */}
            <Card>
              <CardHeader>
                <CardTitle>Analyze Your Skills</CardTitle>
                <CardDescription>Enter a role to identify skill gaps and opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-role">Target Role</Label>
                  <div className="flex gap-2">
                    <Input
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Senior Product Manager"
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                    />
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzingSkillGap}
                      className="rounded-lg"
                    >
                      {isAnalyzingSkillGap ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {hasAnalyzed && skillGapReport && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Readiness Score</CardTitle>
                        <CardDescription>For {skillGapReport.target_role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Readiness</span>
                        <span className={cn("text-2xl font-bold", getReadinessColor(skillGapReport.readiness_score))}>
                          {Math.round(skillGapReport.readiness_score)}%
                        </span>
                      </div>
                      <Progress value={skillGapReport.readiness_score} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        Level: <span className="font-medium">{skillGapReport.readiness_text}</span>
                      </p>
                    </div>

                    {skillGapReport.suggested_timeline && (
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm">
                          <strong>Suggested Timeline:</strong> {skillGapReport.suggested_timeline}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Current Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Current Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillGapReport.current_skills.length > 0 ? (
                        skillGapReport.current_skills.map((skill, idx) => (
                          <Badge key={idx} variant="default" className="rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No skills recorded yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Skill Gaps by Priority */}
                {(skillGapReport.high_priority_gaps.length > 0 ||
                  skillGapReport.medium_priority_gaps.length > 0 ||
                  skillGapReport.low_priority_gaps.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skill Gaps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* High Priority */}
                      {skillGapReport.high_priority_gaps.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm text-red-500">Critical Skills to Learn</h3>
                          <div className="grid gap-2">
                            {skillGapReport.high_priority_gaps.map((gap: any, idx: number) => (
                              <div key={idx} className=" p-3 rounded-lg border border-red-200 bg-red-50">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{gap.skill || gap.name || `Gap ${idx + 1}`}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {gap.suggested_path || gap.description || "No additional details"}
                                    </p>
                                  </div>
                                  <Badge variant="destructive" className="ml-2 flex-shrink-0">
                                    Critical
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medium Priority */}
                      {skillGapReport.medium_priority_gaps.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm text-yellow-600">Important Skills</h3>
                          <div className="grid gap-2">
                            {skillGapReport.medium_priority_gaps.map((gap: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{gap.skill || gap.name || `Gap ${idx + 1}`}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {gap.suggested_path || gap.description || "No additional details"}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="ml-2 flex-shrink-0">
                                    Medium
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Low Priority */}
                      {skillGapReport.low_priority_gaps.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm text-blue-600">Nice-to-Have Skills</h3>
                          <div className="grid gap-2">
                            {skillGapReport.low_priority_gaps.map((gap: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{gap.skill || gap.name || `Gap ${idx + 1}`}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {gap.suggested_path || gap.description || "No additional details"}
                                    </p>
                                  </div>
                                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                    Low
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                {skillGapReport.next_steps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {skillGapReport.next_steps.map((rawStep, idx) => {
                          const step = parseStep(rawStep);
                          return (
                            <div key={idx} className="rounded-lg border p-3">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-xs font-semibold text-primary">{step.phase}</span>
                                <Badge variant="outline" className="text-xs">{step.priority}</Badge>
                              </div>
                              <p className="text-sm font-medium">{step.action}</p>
                              {step.outcome && <p className="text-xs text-muted-foreground mt-1">Expected outcome: {step.outcome}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!hasAnalyzed && !isAnalyzingSkillGap && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Enter a role to get started with skill gap analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGap;
