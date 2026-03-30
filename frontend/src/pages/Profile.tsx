import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Compass, Save, Edit2, Check, XCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProfile, ProfileUpdateRequest } from "@/integrations/supabase/career-types";
import { useSidebarState } from "@/hooks/useSidebarState";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isLoading, error: profileError, updateUserProfile, isUpdating } = useProfile();

  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarState();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newTargetRole, setNewTargetRole] = useState("");

  useEffect(() => {
    if (profile && !formData) {
      setFormData(profile);
    }
  }, [profile, formData]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && formData) {
      const updated = {
        ...formData,
        skills: [...(formData.skills || []), newSkill],
      };
      setFormData(updated);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    if (formData) {
      const updated = {
        ...formData,
        skills: formData.skills.filter((_, i) => i !== index),
      };
      setFormData(updated);
    }
  };

  const handleAddTargetRole = () => {
    if (newTargetRole.trim() && formData) {
      const updated = {
        ...formData,
        target_roles: [...(formData.target_roles || []), newTargetRole],
      };
      setFormData(updated);
      setNewTargetRole("");
    }
  };

  const handleRemoveTargetRole = (index: number) => {
    if (formData) {
      const updated = {
        ...formData,
        target_roles: formData.target_roles.filter((_, i) => i !== index),
      };
      setFormData(updated);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    const updates: ProfileUpdateRequest = {
      full_name: formData.full_name,
      current_role: formData.current_role,
      experience_years: formData.experience_years,
      target_roles: formData.target_roles,
      skills: formData.skills,
      career_goals: formData.career_goals,
      strengths: formData.strengths,
      weak_areas: formData.weak_areas,
    };

    try {
      await updateUserProfile(updates);
      setIsEditing(false);
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <div className="flex-1 flex flex-col">
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
                    <Compass className="w-4 h-4 text-primary" />
                    Profile
                  </h1>
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
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  <Compass className="w-4 h-4 text-primary" />
                  Career Profile
                </h1>
                <p className="text-xs text-muted-foreground">Manage your career information</p>
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
            {profileError && (
              <Alert variant="destructive">
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Career Profile</CardTitle>
                  <CardDescription>Your career information and goals</CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isUpdating}
                      variant="default"
                      size="sm"
                      className="rounded-lg"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {isUpdating ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(profile);
                      }}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {formData ? (
                  <>
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full-name">Full Name</Label>
                          {isEditing ? (
                            <Input
                              id="full-name"
                              value={formData.full_name || ""}
                              onChange={(e) => handleInputChange("full_name", e.target.value)}
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <p className="text-sm font-medium">
                              {formData.full_name || <span className="text-muted-foreground italic">Not set</span>}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <p className="text-sm font-medium">{formData.email || <span className="text-muted-foreground italic">Not set</span>}</p>
                        </div>
                      </div>
                    </div>

                    {/* Career Information */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm">Career Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-role">Current Role</Label>
                          {isEditing ? (
                            <Input
                              id="current-role"
                              value={formData.current_role || ""}
                              onChange={(e) => handleInputChange("current_role", e.target.value)}
                              placeholder="e.g., Software Engineer"
                            />
                          ) : (
                            <p className="text-sm font-medium">
                              {formData.current_role || <span className="text-muted-foreground italic">Not set</span>}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience</Label>
                          {isEditing ? (
                            <Input
                              id="experience"
                              type="number"
                              value={formData.experience_years || ""}
                              onChange={(e) => handleInputChange("experience_years", parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          ) : (
                            <p className="text-sm font-medium">{formData.experience_years || 0} years</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        {isEditing ? (
                          <Input
                            id="location"
                            value={formData.location || ""}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            placeholder="e.g., San Francisco, CA"
                          />
                        ) : (
                          <p className="text-sm font-medium">
                            {formData.location || <span className="text-muted-foreground italic">Not set</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Target Roles */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm">Target Roles</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.target_roles.map((role, idx) => (
                          <Badge key={idx} variant="secondary" className="rounded-full">
                            {role}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveTargetRole(idx)}
                                className="ml-2 hover:text-destructive"
                              >
                                ✕
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            value={newTargetRole}
                            onChange={(e) => setNewTargetRole(e.target.value)}
                            placeholder="Add target role"
                            onKeyPress={(e) => e.key === "Enter" && handleAddTargetRole()}
                          />
                          <Button onClick={handleAddTargetRole} size="sm" variant="outline">
                            Add
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm">Skills</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.skills.map((skill, idx) => (
                          <Badge key={idx} variant="default" className="rounded-full">
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveSkill(idx)}
                                className="ml-2 hover:text-background"
                              >
                                ✕
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add new skill"
                            onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                          />
                          <Button onClick={handleAddSkill} size="sm" variant="outline">
                            Add
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Goals */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm">Career Goals</h3>
                      {isEditing ? (
                        <Textarea
                          value={formData.career_goals || ""}
                          onChange={(e) => handleInputChange("career_goals", e.target.value)}
                          placeholder="Describe your career goals..."
                          className="min-h-24"
                        />
                      ) : (
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {formData.career_goals || <span className="text-muted-foreground italic">Not set</span>}
                        </p>
                      )}
                    </div>

                    {/* Strengths & Weak Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Strengths</h3>
                        {isEditing ? (
                          <Textarea
                            value={formData.strengths.join("\n")}
                            onChange={(e) =>
                              handleInputChange("strengths", e.target.value.split("\n").filter((s) => s.trim()))
                            }
                            placeholder="List your strengths (one per line)"
                            className="min-h-24"
                          />
                        ) : (
                          <ul className="text-sm space-y-1">
                            {formData.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                            {formData.strengths.length === 0 && (
                              <span className="text-muted-foreground italic">Not set</span>
                            )}
                          </ul>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Areas for Development</h3>
                        {isEditing ? (
                          <Textarea
                            value={formData.weak_areas.join("\n")}
                            onChange={(e) =>
                              handleInputChange("weak_areas", e.target.value.split("\n").filter((s) => s.trim()))
                            }
                            placeholder="List areas to improve (one per line)"
                            className="min-h-24"
                          />
                        ) : (
                          <ul className="text-sm space-y-1">
                            {formData.weak_areas.map((w, i) => (
                              <li key={i}>• {w}</li>
                            ))}
                            {formData.weak_areas.length === 0 && (
                              <span className="text-muted-foreground italic">Not set</span>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No profile data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
