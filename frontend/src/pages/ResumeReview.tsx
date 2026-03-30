import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Compass, FileText, TrendingUp, AlertCircle, CheckCircle, Zap, Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCareerAnalysis } from "@/hooks/useCareerAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnalyzeResumeRequest } from "@/integrations/supabase/career-types";
import { useSidebarState } from "@/hooks/useSidebarState";

const ResumeReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { resumeReview, isAnalyzingResume, error, analyzeResume, clearError } = useCareerAnalysis();

  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const state = location.state as { prefillResumeText?: string; uploadedFileName?: string } | null;
    if (!state) return;

    if (state.prefillResumeText) {
      setResumeText(state.prefillResumeText);
      toast({ title: "Resume prefilled", description: "You can now run analysis." });
    }

    if (state.uploadedFileName) {
      toast({
        title: "File selected",
        description: `Paste extracted text from ${state.uploadedFileName} to run analysis.`,
      });
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, toast]);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast({ title: "Error", description: "Please paste your resume content", variant: "destructive" });
      return;
    }

    try {
      clearError();
      const request: AnalyzeResumeRequest = {
        resume_text: resumeText,
        target_role: targetRole || undefined,
      };
      await analyzeResume(request);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      toast({
        title: "Unsupported file type",
        description: "Please upload a .txt resume file or paste resume text directly.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setResumeText(text);
      toast({ title: "Resume loaded", description: "You can now run analysis." });
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-50";
    if (score >= 60) return "text-yellow-500 bg-yellow-50";
    if (score >= 40) return "text-orange-500 bg-orange-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div className="flex h-dvh md:h-screen w-full overflow-hidden bg-background">
      <div className="hidden md:block">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 md:hidden",
          isMobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out md:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          isCollapsed={false}
          onToggleCollapse={() => setIsMobileSidebarOpen(false)}
          onNavigate={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-lg px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg md:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Resume Review
                </h1>
                <p className="text-xs text-muted-foreground truncate">Get AI-powered feedback on your resume</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs h-8"
            >
              <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
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
                <CardTitle>Submit Your Resume</CardTitle>
                <CardDescription>Paste your resume content for AI analysis and optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-role">Target Role (Optional)</Label>
                  <Input
                    id="target-role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Content</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Textarea
                    id="resume"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here..."
                    className="min-h-48 font-mono text-xs"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Upload .txt Resume
                  </Button>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzingResume}
                  className="w-full rounded-lg"
                >
                  {isAnalyzingResume ? "Analyzing..." : "Analyze Resume"}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {hasAnalyzed && resumeReview && (
              <>
                {/* Score Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Score</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className={cn("text-3xl font-bold", getScoreColor(resumeReview.score))}>
                          {Math.round(resumeReview.score)}%
                        </span>
                      </div>
                      <Progress value={resumeReview.score} className="h-3" />
                    </div>

                    {resumeReview.ats_score !== undefined && (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm">
                          <strong>ATS Compatibility Score:</strong> {Math.round(resumeReview.ats_score)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This indicates how well your resume will be parsed by Applicant Tracking Systems
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Strengths */}
                {resumeReview.strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        What&apos;s Working Well
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resumeReview.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 flex-shrink-0 mt-1">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Weaknesses */}
                {resumeReview.weaknesses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resumeReview.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-orange-500 flex-shrink-0 mt-1">!</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Keyword Gaps */}
                {resumeReview.keyword_gaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Missing Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Consider adding these keywords to improve job matching:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {resumeReview.keyword_gaps.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Summary Suggestions */}
                {resumeReview.summary_suggestions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Professional Summary Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{resumeReview.summary_suggestions}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Headline Suggestions */}
                {resumeReview.headline_suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Better Headline Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resumeReview.headline_suggestions.map((headline, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          {headline}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Bullet Improvements */}
                {Object.keys(resumeReview.bullet_improvements).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Bullet Point Improvements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {"current" in resumeReview.bullet_improvements && "improved" in resumeReview.bullet_improvements && (
                        <div className="space-y-2 rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground">Before</p>
                          <p className="text-sm">{String(resumeReview.bullet_improvements.current)}</p>
                          <p className="text-xs text-muted-foreground">After</p>
                          <p className="text-sm font-medium">{String(resumeReview.bullet_improvements.improved)}</p>
                        </div>
                      )}
                      {Object.entries(resumeReview.bullet_improvements).map(([section, suggestions]: any, idx) => (
                        <div key={idx} className="space-y-2">
                          {(section === "current" || section === "improved") && "current" in resumeReview.bullet_improvements && "improved" in resumeReview.bullet_improvements ? null : (
                            <>
                          <p className="font-medium text-sm">{section}</p>
                          {Array.isArray(suggestions) && suggestions.length > 0 ? (
                            <ul className="space-y-1">
                              {suggestions.map((suggestion: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground">
                                  • {suggestion}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              {typeof suggestions === "string" ? suggestions : "No suggestions"}
                            </p>
                          )}
                            </>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!hasAnalyzed && !isAnalyzingResume && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Paste your resume to get started with AI analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeReview;
