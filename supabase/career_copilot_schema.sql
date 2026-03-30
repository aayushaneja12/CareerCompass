-- ============================================================================
-- Career Copilot Schema Extension
-- Non-breaking additions to existing mentra-prp-ai-agent schema
-- ============================================================================

-- Use pgcrypto for gen_random_uuid(), which matches existing project tables.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    full_name TEXT,
    email TEXT,

    current_position TEXT,
    experience_years SMALLINT,
    target_roles TEXT[],
    preferred_industries TEXT[],
    location TEXT,

    skills TEXT[],
    certifications TEXT[],
    education_level TEXT,
    education_field TEXT,

    career_goals TEXT,
    interests JSONB DEFAULT '{}'::jsonb,
    strengths TEXT[],
    weak_areas TEXT[],

    mentoring_style TEXT,
    cultural_background TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- ============================================================================
-- 2. CAREER ROADMAPS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    target_role TEXT NOT NULL,
    current_position TEXT,
    
    status TEXT DEFAULT 'active',
    roadmap_json JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 3. ROADMAP ITEMS (Phases, Milestones, Tasks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roadmap_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,

    phase_number SMALLINT,
    phase_name TEXT,
    item_type TEXT,

    title TEXT NOT NULL,
    description TEXT,

    status TEXT DEFAULT 'pending',

    estimated_duration TEXT,
    priority INT DEFAULT 0,
    resources TEXT[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 4. SKILL GAP REPORTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.skill_gap_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    target_role TEXT NOT NULL,

    readiness_score DECIMAL(5, 2),
    readiness_text TEXT,

    current_skills TEXT[],
    required_skills TEXT[],

    high_priority_gaps JSONB,
    medium_priority_gaps JSONB,
    low_priority_gaps JSONB,

    next_steps TEXT[],
    suggested_timeline TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    days_to_refresh SMALLINT DEFAULT 30
);

-- ============================================================================
-- 5. RESUME REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resume_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    resume_text TEXT,
    target_role TEXT,

    score DECIMAL(5, 2),
    strengths TEXT[],
    weaknesses TEXT[],
    keyword_gaps TEXT[],
    ats_score DECIMAL(5, 2),

    summary_suggestions TEXT,
    headline_suggestions TEXT[],
    bullet_improvements JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 6. SAVED PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saved_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    difficulty_level TEXT,
    description TEXT,
    skills_covered TEXT[],
    tech_stack TEXT[],

    relevance_to_role TEXT,
    relevance_score DECIMAL(5, 2),

    portfolio_value TEXT,

    implementation_steps JSONB,
    datasets_ideas TEXT[],
    resources TEXT[],

    status TEXT DEFAULT 'saved',
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 7. PROGRESS METRICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.progress_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    week_start DATE NOT NULL,
    week_end DATE NOT NULL,

    weekly_goals JSONB,
    accomplishments TEXT[],
    challenges TEXT[],

    total_minutes_learning INT,
    projects_started INT DEFAULT 0,
    projects_completed INT DEFAULT 0,

    recommended_focus TEXT[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,

    UNIQUE (user_id, week_start)
);

-- ============================================================================
-- RLS POLICIES (Row-Level Security)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gap_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only see/edit their own
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Roadmaps: Users can only access their own
DROP POLICY IF EXISTS "Users can view own roadmaps" ON roadmaps;
CREATE POLICY "Users can view own roadmaps" ON roadmaps
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own roadmaps" ON roadmaps;
CREATE POLICY "Users can manage own roadmaps" ON roadmaps
    FOR ALL USING (auth.uid() = user_id);

-- Roadmap Items: Inherit from parent roadmap
DROP POLICY IF EXISTS "Users can access own roadmap items" ON roadmap_items;
CREATE POLICY "Users can access own roadmap items" ON roadmap_items
    FOR SELECT USING (
        roadmap_id IN (
            SELECT id FROM roadmaps WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage own roadmap items" ON roadmap_items;
CREATE POLICY "Users can manage own roadmap items" ON roadmap_items
    FOR ALL USING (
        roadmap_id IN (
            SELECT id FROM roadmaps WHERE user_id = auth.uid()
        )
    );

-- Similar policies for other tables (skill_gap_reports, resume_reviews, saved_projects, progress_metrics)
DROP POLICY IF EXISTS "Users can view own skill gap reports" ON skill_gap_reports;
CREATE POLICY "Users can view own skill gap reports" ON skill_gap_reports
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own skill gap reports" ON skill_gap_reports;
CREATE POLICY "Users can manage own skill gap reports" ON skill_gap_reports
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own resume reviews" ON resume_reviews;
CREATE POLICY "Users can view own resume reviews" ON resume_reviews
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own resume reviews" ON resume_reviews;
CREATE POLICY "Users can manage own resume reviews" ON resume_reviews
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own projects" ON saved_projects;
CREATE POLICY "Users can view own projects" ON saved_projects
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own projects" ON saved_projects;
CREATE POLICY "Users can manage own projects" ON saved_projects
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own progress metrics" ON progress_metrics;
CREATE POLICY "Users can view own progress metrics" ON progress_metrics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own progress metrics" ON progress_metrics;
CREATE POLICY "Users can manage own progress metrics" ON progress_metrics
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES (for common queries)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id_status ON roadmaps(user_id, status);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_roadmap_status ON roadmap_items(roadmap_id, status);
CREATE INDEX IF NOT EXISTS idx_skill_gap_user_role ON skill_gap_reports(user_id, target_role);
CREATE INDEX IF NOT EXISTS idx_resume_reviews_user ON resume_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_projects_user_status ON saved_projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_progress_metrics_user_week ON progress_metrics(user_id, week_start);
