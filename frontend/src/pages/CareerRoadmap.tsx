import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Compass, MapPin, Layers, CheckCircle2, Circle, Clock, Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCareerAnalysis } from "@/hooks/useCareerAnalysis";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GenerateRoadmapRequest } from "@/integrations/supabase/career-types";
import { useSidebarState } from "@/hooks/useSidebarState";

const CareerRoadmap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { roadmap, roadmapItems, isGeneratingRoadmap, isFetchingRoadmapDetails, error, generateRoadmap, fetchRoadmapItems, clearError } = useCareerAnalysis();

  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [currentRole, setCurrentRole] = useState(profile?.current_role || "");
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (!currentRole && profile?.current_role) {
      setCurrentRole(profile.current_role);
    }
  }, [profile?.current_role, currentRole]);

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      toast({ title: "Error", description: "Please enter a target role", variant: "destructive" });
      return;
    }

    try {
      clearError();
      const request: GenerateRoadmapRequest = {
        target_role: targetRole,
        current_role: currentRole || undefined,
      };
      const generatedRoadmap = await generateRoadmap(request);
      setHasGenerated(true);

      if (generatedRoadmap.id) {
        await fetchRoadmapItems(generatedRoadmap.id);
      }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Layers className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const groupedItems = roadmapItems.reduce((acc, item) => {
    const phase = item.phase_number;
    if (!acc[phase]) {
      acc[phase] = { phase_name: item.phase_name, items: [] };
    }
    acc[phase].items.push(item);
    return acc;
  }, {} as Record<number, any>);

  const fallbackPhases = (roadmap?.roadmap_json?.phases as Array<any> | undefined) || [];
  const displayPhases =
    Object.keys(groupedItems).length > 0
      ? Object.entries(groupedItems).map(([phaseNum, phaseData]) => ({
          key: phaseNum,
          phase_name: phaseData.phase_name,
          items: phaseData.items,
        }))
      : fallbackPhases.map((phase, index) => ({
          key: String(phase.phase_number || index + 1),
          phase_name: phase.phase_name || `Phase ${index + 1}`,
          items: (phase.tasks || []).map((task: any, taskIndex: number) => ({
            id: `fallback-${index}-${taskIndex}`,
            item_type: "task",
            status: "pending",
            title: typeof task === "string" ? task : task.title || `Task ${taskIndex + 1}`,
            description: typeof task === "string" ? undefined : task.description,
            resources: typeof task === "string" ? [] : task.resources || [],
            estimated_duration: phase.duration,
          })),
        }));

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
                  <MapPin className="w-4 h-4 text-primary" />
                  Career Roadmap
                </h1>
                <p className="text-xs text-muted-foreground truncate">Plan your path to your target role</p>
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

            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Your Roadmap</CardTitle>
                <CardDescription>Create a personalized pathway to your career goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-role">Target Role</Label>
                    <Input
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Product Manager"
                      onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-role">Current Role (Optional)</Label>
                    <Input
                      id="current-role"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder={profile?.current_role || "e.g., Software Engineer"}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGeneratingRoadmap}
                  className="w-full rounded-lg"
                >
                  {isGeneratingRoadmap ? "Generating..." : "Generate Roadmap"}
                </Button>
              </CardContent>
            </Card>

            {/* Roadmap Results */}
            {hasGenerated && roadmap && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Career Roadmap</CardTitle>
                        <CardDescription>
                          From {roadmap.current_role || "your current role"} to {roadmap.target_role}
                        </CardDescription>
                      </div>
                      <Badge variant={roadmap.status === "active" ? "default" : "secondary"}>
                        {roadmap.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Phases Timeline */}
                {displayPhases.length > 0 && (
                  <div className="space-y-4">
                    {displayPhases
                      .sort((a, b) => parseInt(a.key) - parseInt(b.key))
                      .map((phaseData, index) => (
                        <Card key={phaseData.key}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                    {index + 1}
                                  </div>
                                </div>
                                <div>
                                  <CardTitle className="text-base">{phaseData.phase_name}</CardTitle>
                                  <p className="text-xs text-muted-foreground">
                                    {phaseData.items.length} task{phaseData.items.length !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {phaseData.items.map((item: any, itemIndex: number) => (
                              <div key={item.id || itemIndex} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0">
                                <div className="mt-1">{getStatusIcon(item.status)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-medium text-sm">{item.title}</p>
                                      {item.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="flex-shrink-0">
                                      {item.item_type}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {item.estimated_duration && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {item.estimated_duration}
                                      </Badge>
                                    )}
                                    {item.resources && item.resources.length > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {item.resources.length} resource{item.resources.length !== 1 ? "s" : ""}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}

                {/* Empty State */}
                {displayPhases.length === 0 && !isFetchingRoadmapDetails && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        No roadmap items available. Your roadmap data is being processed.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {isFetchingRoadmapDetails && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">Loading roadmap details...</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!hasGenerated && !isGeneratingRoadmap && (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Generate a roadmap to see your career path</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerRoadmap;
