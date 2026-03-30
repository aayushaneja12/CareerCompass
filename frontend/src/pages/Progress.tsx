import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, TrendingUp, Target, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useProgress } from "@/hooks/useProgress";
import { ProgressMetrics } from "@/integrations/supabase/career-types";

interface WeeklyGoal {
  id: string;
  goal: string;
  status: "completed" | "in-progress" | "pending";
}

interface WeekData {
  weekStart: string;
  weekEnd: string;
  goals: WeeklyGoal[];
  accomplishments: string[];
  challenges: string[];
  minutesLearning: number;
  projectsStarted: number;
  projectsCompleted: number;
  recommendedFocus: string[];
}

const Progress = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { progress, isLoading, isSaving, error, load, save } = useProgress();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarState();
  const [isEditing, setIsEditing] = useState(false);

  // Weekly data state
  const [currentWeek, setCurrentWeek] = useState<WeekData>({
    weekStart: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    weekEnd: new Date().toISOString().split("T")[0],
    goals: [],
    accomplishments: [],
    challenges: [],
    minutesLearning: 0,
    projectsStarted: 0,
    projectsCompleted: 0,
    recommendedFocus: [],
  });

  const [newGoal, setNewGoal] = useState("");
  const [newAccomplishment, setNewAccomplishment] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [newFocus, setNewFocus] = useState("");

  useEffect(() => {
    load().catch(() => {
      // Error state is already handled by hook.
    });
  }, [load]);

  useEffect(() => {
    if (!progress) return;
    setCurrentWeek(mapProgressToWeekData(progress));
  }, [progress]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const goal: WeeklyGoal = {
        id: Date.now().toString(),
        goal: newGoal,
        status: "pending",
      };
      setCurrentWeek({
        ...currentWeek,
        goals: [...currentWeek.goals, goal],
      });
      setNewGoal("");
    }
  };

  const handleToggleGoal = (goalId: string) => {
    setCurrentWeek({
      ...currentWeek,
      goals: currentWeek.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              status: g.status === "completed" ? "pending" : "completed",
            }
          : g
      ),
    });
  };

  const handleRemoveGoal = (goalId: string) => {
    setCurrentWeek({
      ...currentWeek,
      goals: currentWeek.goals.filter((g) => g.id !== goalId),
    });
  };

  const handleAddAccomplishment = () => {
    if (newAccomplishment.trim()) {
      setCurrentWeek({
        ...currentWeek,
        accomplishments: [...currentWeek.accomplishments, newAccomplishment],
      });
      setNewAccomplishment("");
    }
  };

  const handleRemoveAccomplishment = (index: number) => {
    setCurrentWeek({
      ...currentWeek,
      accomplishments: currentWeek.accomplishments.filter((_, i) => i !== index),
    });
  };

  const handleAddChallenge = () => {
    if (newChallenge.trim()) {
      setCurrentWeek({
        ...currentWeek,
        challenges: [...currentWeek.challenges, newChallenge],
      });
      setNewChallenge("");
    }
  };

  const handleAddFocus = () => {
    if (newFocus.trim()) {
      setCurrentWeek({
        ...currentWeek,
        recommendedFocus: [...currentWeek.recommendedFocus, newFocus.trim()],
      });
      setNewFocus("");
    }
  };

  const handleRemoveFocus = (index: number) => {
    setCurrentWeek({
      ...currentWeek,
      recommendedFocus: currentWeek.recommendedFocus.filter((_, i) => i !== index),
    });
  };

  const handleRemoveChallenge = (index: number) => {
    setCurrentWeek({
      ...currentWeek,
      challenges: currentWeek.challenges.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    try {
      await save(mapWeekDataToPayload(currentWeek));
      toast({ title: "Success", description: "Weekly progress saved" });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  const completedGoals = currentWeek.goals.filter((g) => g.status === "completed").length;
  const pendingGoals = currentWeek.goals.length - completedGoals;
  const completionRate = currentWeek.goals.length > 0 ? (completedGoals / currentWeek.goals.length) * 100 : 0;

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
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Progress Tracking
                </h1>
                <p className="text-xs text-muted-foreground">Monitor your weekly achievements</p>
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
          <div className="max-w-3xl mx-auto space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Loading saved progress...</p>
                </CardContent>
              </Card>
            )}

            {/* Week Selector */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>This Week's Progress</CardTitle>
                  <CardDescription>
                    Week of {new Date(currentWeek.weekStart).toLocaleDateString()} to{" "}
                    {new Date(currentWeek.weekEnd).toLocaleDateString()}
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    Edit Week
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      variant="default"
                      size="sm"
                      className="rounded-lg"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{currentWeek.minutesLearning}</p>
                    <p className="text-xs text-muted-foreground mt-1">Minutes Learning</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-500">{currentWeek.projectsStarted}</p>
                    <p className="text-xs text-muted-foreground mt-1">Projects Started</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">{currentWeek.projectsCompleted}</p>
                    <p className="text-xs text-muted-foreground mt-1">Projects Completed</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className={cn("text-3xl font-bold", completionRate === 100 ? "text-green-500" : "text-yellow-500")}>
                      {Math.round(completionRate)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Goal Completion</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Metrics</CardTitle>
                  <CardDescription>Update measurable inputs used in your progress score.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Learning Minutes</label>
                    <Input
                      type="number"
                      min={0}
                      value={currentWeek.minutesLearning}
                      onChange={(e) => setCurrentWeek({ ...currentWeek, minutesLearning: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Projects Started</label>
                    <Input
                      type="number"
                      min={0}
                      value={currentWeek.projectsStarted}
                      onChange={(e) => setCurrentWeek({ ...currentWeek, projectsStarted: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Projects Completed</label>
                    <Input
                      type="number"
                      min={0}
                      value={currentWeek.projectsCompleted}
                      onChange={(e) => setCurrentWeek({ ...currentWeek, projectsCompleted: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Weekly Goals
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {completedGoals} of {currentWeek.goals.length} completed
                    </p>
                  </div>
                </div>
                {currentWeek.goals.length > 0 && <ProgressBar value={completionRate} className="mt-3 h-2" />}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                  <div className="rounded-md border p-2">Completed steps: <span className="font-medium text-foreground">{completedGoals}</span></div>
                  <div className="rounded-md border p-2">Pending steps: <span className="font-medium text-foreground">{pendingGoals}</span></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentWeek.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <button
                      onClick={() => handleToggleGoal(goal.id)}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors",
                        goal.status === "completed"
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground hover:border-primary"
                      )}
                    >
                      {goal.status === "completed" && (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        goal.status === "completed" && "line-through text-muted-foreground"
                      )}
                    >
                      {goal.goal}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveGoal(goal.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add a new goal"
                      onKeyPress={(e) => e.key === "Enter" && handleAddGoal()}
                    />
                    <Button onClick={handleAddGoal} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accomplishments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Accomplishments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentWeek.accomplishments.map((acc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2 rounded-lg bg-green-50 border border-green-200"
                  >
                    <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-sm flex-1">{acc}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAccomplishment(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      value={newAccomplishment}
                      onChange={(e) => setNewAccomplishment(e.target.value)}
                      placeholder="Add an accomplishment"
                      onKeyPress={(e) => e.key === "Enter" && handleAddAccomplishment()}
                    />
                    <Button onClick={handleAddAccomplishment} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Challenges & Blockers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentWeek.challenges.map((challenge, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200"
                  >
                    <span className="text-yellow-500 flex-shrink-0 mt-0.5">!</span>
                    <span className="text-sm flex-1">{challenge}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveChallenge(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      value={newChallenge}
                      onChange={(e) => setNewChallenge(e.target.value)}
                      placeholder="Add a challenge"
                      onKeyPress={(e) => e.key === "Enter" && handleAddChallenge()}
                    />
                    <Button onClick={handleAddChallenge} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Recommended Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentWeek.recommendedFocus.length > 0 ? (
                  currentWeek.recommendedFocus.map((focus, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm rounded-md border p-2">
                      <span className="text-primary flex-shrink-0 mt-1">→</span>
                      <span className="flex-1">{focus}</span>
                      {isEditing && (
                        <button onClick={() => handleRemoveFocus(idx)} className="text-muted-foreground hover:text-destructive">✕</button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No focus areas yet.</p>
                )}

                {isEditing && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      value={newFocus}
                      onChange={(e) => setNewFocus(e.target.value)}
                      placeholder="Add a focus area"
                      onKeyPress={(e) => e.key === "Enter" && handleAddFocus()}
                    />
                    <Button onClick={handleAddFocus} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Week Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Goals</p>
                    <p className="text-2xl font-bold">{currentWeek.goals.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Learning Hours</p>
                    <p className="text-2xl font-bold">{(currentWeek.minutesLearning / 60).toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Projects Completed</p>
                    <p className="text-2xl font-bold">{currentWeek.projectsCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;

function mapProgressToWeekData(progress: ProgressMetrics): WeekData {
  return {
    weekStart: progress.week_start,
    weekEnd: progress.week_end,
    goals: (progress.weekly_goals || []).map((g, idx) => ({
      id: `${idx}-${g.goal}`,
      goal: g.goal,
      status: g.status === "completed" ? "completed" : "pending",
    })),
    accomplishments: progress.accomplishments || [],
    challenges: progress.challenges || [],
    minutesLearning: progress.total_minutes_learning || 0,
    projectsStarted: progress.projects_started || 0,
    projectsCompleted: progress.projects_completed || 0,
    recommendedFocus: progress.recommended_focus || [],
  };
}

function mapWeekDataToPayload(currentWeek: WeekData) {
  return {
    week_start: currentWeek.weekStart,
    week_end: currentWeek.weekEnd,
    weekly_goals: currentWeek.goals.map((g) => ({
      goal: g.goal,
      status: g.status === "in-progress" ? "pending" : g.status,
    })),
    accomplishments: currentWeek.accomplishments,
    challenges: currentWeek.challenges,
    total_minutes_learning: currentWeek.minutesLearning,
    projects_started: currentWeek.projectsStarted,
    projects_completed: currentWeek.projectsCompleted,
    recommended_focus: currentWeek.recommendedFocus,
  };
}
