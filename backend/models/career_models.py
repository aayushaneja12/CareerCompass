"""
Career-related Pydantic models for type safety and validation.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


# ========================================
# USER PROFILE
# ========================================

class UserProfile(BaseModel):
    id: Optional[str] = None
    user_id: str
    
    # Personal
    full_name: Optional[str] = None
    email: Optional[str] = None
    
    # Career
    current_role: Optional[str] = None
    experience_years: Optional[int] = None
    target_roles: List[str] = Field(default_factory=list)
    preferred_industries: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    
    # Skills & Education
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    education_level: Optional[str] = None  # "Bachelor's", "Master's", etc.
    education_field: Optional[str] = None
    
    # Goals
    career_goals: Optional[str] = None
    interests: Dict[str, Any] = Field(default_factory=dict)
    strengths: List[str] = Field(default_factory=list)
    weak_areas: List[str] = Field(default_factory=list)
    
    # Preferences
    mentoring_style: Optional[str] = None  # "directive", "reflective"
    cultural_background: Optional[str] = None
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

    @field_validator(
        "target_roles",
        "preferred_industries",
        "skills",
        "certifications",
        "strengths",
        "weak_areas",
        mode="before",
    )
    @classmethod
    def _none_to_list(cls, value):
        return [] if value is None else value

    @field_validator("interests", mode="before")
    @classmethod
    def _none_to_dict(cls, value):
        return {} if value is None else value


# ========================================
# CAREER ROADMAP
# ========================================

class RoadmapPhase(BaseModel):
    phase_number: int
    phase_name: str
    goals: List[str]
    duration: str  # "4 weeks"
    items: List[Dict[str, Any]] = Field(default_factory=list)


class RoadmapBase(BaseModel):
    target_role: str
    current_role: Optional[str] = None
    status: str = "active"


class Roadmap(RoadmapBase):
    id: Optional[str] = None
    user_id: str
    roadmap_json: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class RoadmapItem(BaseModel):
    id: Optional[str] = None
    roadmap_id: str
    phase_number: int
    phase_name: str
    item_type: str  # "goal", "task", "milestone"
    title: str
    description: Optional[str] = None
    status: str = "pending"  # "pending", "in_progress", "completed"
    estimated_duration: Optional[str] = None
    resources: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========================================
# SKILL GAP ANALYSIS
# ========================================

class SkillGap(BaseModel):
    skill: str
    importance: str  # "critical", "high", "medium", "low"
    current_level: str  # "none", "beginner", "intermediate", "advanced"
    target_level: str
    suggested_path: Optional[str] = None


class SkillGapReport(BaseModel):
    id: Optional[str] = None
    user_id: str
    target_role: str
    
    readiness_score: float  # 0-100
    readiness_text: str     # "Beginner", "Intermediate", etc.
    
    current_skills: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    
    gaps: List[SkillGap] = Field(default_factory=list)
    high_priority_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    medium_priority_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    low_priority_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    
    next_steps: List[str] = Field(default_factory=list)
    suggested_timeline: Optional[str] = None
    
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

    @field_validator(
        "current_skills",
        "required_skills",
        "gaps",
        "high_priority_gaps",
        "medium_priority_gaps",
        "low_priority_gaps",
        "next_steps",
        mode="before",
    )
    @classmethod
    def _none_to_list(cls, value):
        return [] if value is None else value


# ========================================
# RESUME REVIEW
# ========================================

class ResumeReview(BaseModel):
    id: Optional[str] = None
    user_id: str
    
    resume_text: str
    target_role: Optional[str] = None
    
    score: float  # 0-100
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    keyword_gaps: List[str] = Field(default_factory=list)
    ats_score: Optional[float] = None
    
    summary_suggestions: Optional[str] = None
    headline_suggestions: List[str] = Field(default_factory=list)
    bullet_improvements: Dict[str, Any] = Field(default_factory=dict)
    
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

    @field_validator(
        "strengths",
        "weaknesses",
        "keyword_gaps",
        "headline_suggestions",
        mode="before",
    )
    @classmethod
    def _none_to_list(cls, value):
        return [] if value is None else value

    @field_validator("bullet_improvements", mode="before")
    @classmethod
    def _none_to_dict(cls, value):
        return {} if value is None else value


# ========================================
# PROJECT IDEAS
# ========================================

class ProjectIdea(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    
    title: str
    difficulty_level: str  # "Beginner", "Intermediate", "Advanced"
    description: str
    skills_covered: List[str] = Field(default_factory=list)
    tech_stack: List[str] = Field(default_factory=list)
    
    relevance_to_role: Optional[str] = None
    relevance_score: Optional[float] = None
    portfolio_value: str
    
    implementation_steps: List[Dict[str, Any]] = Field(default_factory=list)
    datasets_ideas: List[str] = Field(default_factory=list)
    resources: List[str] = Field(default_factory=list)
    
    status: str = "saved"  # "saved", "in_progress", "completed"
    saved_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

    @field_validator(
        "skills_covered",
        "tech_stack",
        "implementation_steps",
        "datasets_ideas",
        "resources",
        mode="before",
    )
    @classmethod
    def _none_to_list(cls, value):
        return [] if value is None else value

    @field_validator("implementation_steps", mode="before")
    @classmethod
    def _normalize_implementation_steps(cls, value):
        if value is None:
            return []
        if not isinstance(value, list):
            return []

        normalized_steps = []
        for step in value:
            if isinstance(step, dict):
                normalized_steps.append(step)
            elif isinstance(step, str):
                normalized_steps.append({"step": step})

        return normalized_steps


# ========================================
# PROGRESS METRICS
# ========================================

class WeeklyGoal(BaseModel):
    goal: str
    status: str = "pending"  # "completed", "pending", "skipped"


class ProgressMetrics(BaseModel):
    id: Optional[str] = None
    user_id: str
    
    week_start: str  # ISO date
    week_end: str
    
    weekly_goals: List[WeeklyGoal] = Field(default_factory=list)
    accomplishments: List[str] = Field(default_factory=list)
    challenges: List[str] = Field(default_factory=list)
    
    total_minutes_learning: int = 0
    projects_started: int = 0
    projects_completed: int = 0
    
    recommended_focus: List[str] = Field(default_factory=list)
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

    @field_validator(
        "weekly_goals",
        "accomplishments",
        "challenges",
        "recommended_focus",
        mode="before",
    )
    @classmethod
    def _none_to_list(cls, value):
        return [] if value is None else value


# ========================================
# API REQUEST/RESPONSE
# ========================================

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    current_role: Optional[str] = None
    experience_years: Optional[int] = None
    target_roles: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    career_goals: Optional[str] = None
    strengths: Optional[List[str]] = None
    weak_areas: Optional[List[str]] = None


class GenerateRoadmapRequest(BaseModel):
    target_role: str
    current_role: Optional[str] = None


class AnalyzeSkillGapRequest(BaseModel):
    target_role: str


class AnalyzeResumeRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None


class GenerateProjectsRequest(BaseModel):
    target_role: str
    difficulty_level: Optional[str] = None  # Filter by difficulty
    count: int = 3


class SetWeeklyGoalRequest(BaseModel):
    goal: str


class UpdateRoadmapItemRequest(BaseModel):
    status: str  # "pending", "in_progress", "completed"
