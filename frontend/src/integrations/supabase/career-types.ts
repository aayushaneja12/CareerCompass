/**
 * Career Copilot API Types
 * These types match the backend Pydantic models
 */

// ========================================
// USER PROFILE
// ========================================

export interface UserProfile {
  id?: string;
  user_id: string;

  // Personal
  full_name?: string;
  email?: string;

  // Career
  current_role?: string;
  experience_years?: number;
  target_roles: string[];
  preferred_industries: string[];
  location?: string;

  // Skills & Education
  skills: string[];
  certifications: string[];
  education_level?: string; // "Bachelor's", "Master's", etc.
  education_field?: string;

  // Goals
  career_goals?: string;
  interests: Record<string, any>;
  strengths: string[];
  weak_areas: string[];

  // Preferences
  mentoring_style?: string; // "directive", "reflective"
  cultural_background?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// ========================================
// CAREER ROADMAP
// ========================================

export interface RoadmapPhase {
  phase_number: number;
  phase_name: string;
  goals: string[];
  duration: string; // "4 weeks"
  items: Record<string, any>[];
}

export interface Roadmap {
  id?: string;
  user_id: string;
  target_role: string;
  current_role?: string;
  status: string;
  roadmap_json?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface RoadmapItem {
  id?: string;
  roadmap_id: string;
  phase_number: number;
  phase_name: string;
  item_type: string; // "goal", "task", "milestone"
  title: string;
  description?: string;
  status: string; // "pending", "in_progress", "completed"
  estimated_duration?: string;
  resources: string[];
  created_at?: string;
  completed_at?: string;
}

// ========================================
// SKILL GAP ANALYSIS
// ========================================

export interface SkillGapItem {
  skill: string;
  importance: string; // "critical", "high", "medium", "low"
  current_level: string; // "none", "beginner", "intermediate", "advanced"
  target_level: string;
  suggested_path?: string;
}

export interface SkillGapReport {
  id?: string;
  user_id: string;
  target_role: string;

  readiness_score: number; // 0-100
  readiness_text: string; // "Beginner", "Intermediate", etc.

  current_skills: string[];
  required_skills: string[];

  gaps: SkillGapItem[];
  high_priority_gaps: Record<string, any>[];
  medium_priority_gaps: Record<string, any>[];
  low_priority_gaps: Record<string, any>[];

  next_steps: string[];
  suggested_timeline?: string;

  created_at?: string;
}

// ========================================
// RESUME REVIEW
// ========================================

export interface ResumeReview {
  id?: string;
  user_id: string;

  resume_text: string;
  target_role?: string;

  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  keyword_gaps: string[];
  ats_score?: number;

  summary_suggestions?: string;
  headline_suggestions: string[];
  bullet_improvements: Record<string, any>;

  created_at?: string;
}

// ========================================
// PROJECT IDEAS
// ========================================

export interface ProjectIdea {
  id?: string;
  user_id?: string;

  title: string;
  difficulty_level: string; // "Beginner", "Intermediate", "Advanced"
  description: string;
  skills_covered: string[];
  tech_stack: string[];

  relevance_to_role?: string;
  relevance_score?: number;
  portfolio_value: string;

  implementation_steps: Record<string, any>[];
  datasets_ideas: string[];
  resources: string[];

  status: string; // "saved", "in_progress", "completed"
  saved_at?: string;
  started_at?: string;
  completed_at?: string;
}

// ========================================
// PROGRESS METRICS
// ========================================

export interface WeeklyGoal {
  goal: string;
  status: string; // "completed", "pending", "skipped"
}

export interface ProgressMetrics {
  id?: string;
  user_id: string;

  week_start: string; // ISO date
  week_end: string;

  weekly_goals: WeeklyGoal[];
  accomplishments: string[];
  challenges: string[];

  total_minutes_learning: number;
  projects_started: number;
  projects_completed: number;

  recommended_focus: string[];

  created_at?: string;
  updated_at?: string;
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

export interface ProfileUpdateRequest {
  full_name?: string;
  current_role?: string;
  experience_years?: number;
  target_roles?: string[];
  skills?: string[];
  career_goals?: string;
  strengths?: string[];
  weak_areas?: string[];
}

export interface GenerateRoadmapRequest {
  target_role: string;
  current_role?: string;
}

export interface AnalyzeSkillGapRequest {
  target_role: string;
}

export interface AnalyzeResumeRequest {
  resume_text: string;
  target_role?: string;
}

export interface GenerateProjectsRequest {
  target_role: string;
  difficulty_level?: string;
  count?: number;
}

export interface WeeklyGoalRequest {
  goal: string;
}

export interface UpdateRoadmapItemRequest {
  status: string; // "pending", "in_progress", "completed"
}
