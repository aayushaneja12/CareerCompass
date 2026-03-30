"""
Career guidance tool nodes for LangGraph.
Handles: skill gap, roadmap, resume, projects, profile, mentor mode, progress.
"""
import json
from datetime import date, timedelta
from backend.state import GraphState
from backend.services import ProfileService, CareerService, ResumeService


def _extract_target_role(text: str) -> str | None:
    normalized = text.strip().lower()
    markers = ["for ", "to become ", "as a ", "as an "]
    for marker in markers:
        if marker in normalized:
            role = normalized.split(marker, 1)[1].strip(" .,!?")
            return role[:80] if role else None
    return None


def _format_next_steps(next_steps: list[str]) -> str:
    if not next_steps:
        return "- Define your target role and current baseline\n- Prioritize 2 critical gaps this month"
    lines = []
    for idx, step in enumerate(next_steps[:6], start=1):
        lines.append(f"{idx}. {step}")
    return "\n".join(lines)


def _gap_label(gap: dict) -> str:
    return str(gap.get("skill") or gap.get("name") or "Unspecified skill")


# ================================================
# SKILL GAP ANALYSIS
# ================================================

async def skill_gap_node(state: GraphState) -> GraphState:
    """
    Analyze skill gaps between current profile and target role.
    Triggered by "skill_gap" intent.
    """
    try:
        if not state.user_id:
            state.last_reply = "Please sign in to run skill-gap analysis."
            return state

        # Get user profile
        profile = await ProfileService.get_or_create_profile(state.user_id)
        
        # Determine target role (from message or state)
        target_role = state.selected_role
        if not target_role:
            # Try to extract from message
            msg = state.messages[-1].content.lower()
            target_role = _extract_target_role(msg)
        
        if not target_role:
            state.last_reply = "Which role would you like to target? (e.g., 'Data Scientist', 'Backend Engineer')"
            return state
        
        state.selected_role = target_role
        
        # Generate skill gap report
        gap_report = await CareerService.analyze_skill_gap(profile, target_role)
        state.skill_gap_result = gap_report.model_dump()
        
        # Prepare summary for LLM
        summary = f"""
Skill Gap Analysis for {target_role}:
- Readiness: {gap_report.readiness_text} ({gap_report.readiness_score}%)
    - High Priority Gaps: {', '.join(_gap_label(g) for g in gap_report.high_priority_gaps[:4]) if gap_report.high_priority_gaps else 'None'}
- Timeline: {gap_report.suggested_timeline}

    Next Steps:
    {_format_next_steps(gap_report.next_steps)}
"""
        state.last_reply = summary
        
    except Exception as e:
        state.last_reply = f"Error analyzing skill gap: {str(e)}"
    
    return state


# ================================================
# CAREER ROADMAP
# ================================================

async def career_roadmap_node(state: GraphState) -> GraphState:
    """
    Generate or fetch career roadmap.
    Triggered by "roadmap" intent.
    """
    try:
        if not state.user_id:
            state.last_reply = "Please sign in to generate a roadmap."
            return state

        profile = await ProfileService.get_or_create_profile(state.user_id)
        
        # Determine target role
        target_role = state.selected_role
        if not target_role:
            target_role = _extract_target_role(state.messages[-1].content)
        if not target_role:
            state.last_reply = "What's your target role? I'll create a roadmap to get you there."
            return state
        
        state.selected_role = target_role
        
        # Generate roadmap
        roadmap = await CareerService.generate_roadmap(profile, target_role)
        state.roadmap_data = roadmap.model_dump()
        
        roadmap_json = roadmap.roadmap_json or {}
        if isinstance(roadmap_json, str):
            try:
                roadmap_json = json.loads(roadmap_json)
            except json.JSONDecodeError:
                roadmap_json = {}
        phases = roadmap_json.get("phases", [])
        
        summary = f"""
Career Roadmap: {target_role}
{roadmap_json.get('overview', '')}

Phases: {len(phases)}
"""
        for phase in phases[:3]:
            summary += f"\n- {phase.get('phase_name')}: {phase.get('duration')}"
        
        state.last_reply = summary
        
    except Exception as e:
        state.last_reply = f"Error generating roadmap: {str(e)}"
    
    return state


# ================================================
# RESUME ANALYSIS
# ================================================

async def resume_analyzer_node(state: GraphState) -> GraphState:
    """
    Analyze resume and provide feedback.
    Triggered by "resume" intent.
    """
    try:
        if not state.user_id:
            state.last_reply = "Please sign in to run resume analysis."
            return state

        # Extract resume text from message
        msg = state.messages[-1].content
        
        # Check if resume is in message (simple heuristic)
        if len(msg) < 100:
            state.last_reply = "Please paste your entire resume or provide a detailed description of your experience. Include roles, companies, achievements, skills, and education."
            return state
        
        target_role = state.selected_role
        
        # Analyze resume
        review = await ResumeService.analyze_resume(
            state.user_id,
            msg,
            target_role
        )
        state.resume_review_result = review.model_dump()
        
        summary = f"""
Resume Review - Score: {review.score}/100 (ATS: {review.ats_score}/100)

Strengths:
{chr(10).join('- ' + s for s in review.strengths[:3])}

Areas to Improve:
{chr(10).join('- ' + w for w in review.weaknesses[:3])}

Top Keyword Gaps:
{chr(10).join('- ' + k for k in review.keyword_gaps[:3])}

Suggestion: {review.summary_suggestions or 'Overall, your resume has a solid foundation. Focus on quantifying your achievements.'}
"""
        state.last_reply = summary
        
    except Exception as e:
        state.last_reply = f"Error analyzing resume: {str(e)}"
    
    return state


# ================================================
# PROJECT GENERATOR
# ================================================

async def project_generator_node(state: GraphState) -> GraphState:
    """
    Suggest portfolio projects based on profile and target role.
    Triggered by "projects" intent.
    """
    try:
        if not state.user_id:
            state.last_reply = "Please sign in to generate project suggestions."
            return state

        profile = await ProfileService.get_or_create_profile(state.user_id)
        
        target_role = state.selected_role
        if not target_role:
            target_role = _extract_target_role(state.messages[-1].content)
        if not target_role:
            target_role = profile.target_roles[0] if profile.target_roles else "Software Engineer"
        
        # Generate projects
        projects = await CareerService.suggest_projects(profile, target_role, count=3)
        state.projects_suggestion = [p.model_dump() for p in projects]
        
        summary = f"Suggested Projects for {target_role}:\n\n"
        for i, proj in enumerate(projects, 1):
            summary += f"{i}. {proj.title} ({proj.difficulty_level})\n"
            summary += f"   Skills: {', '.join(proj.skills_covered[:3])}\n"
            summary += f"   Portfolio Value: {proj.portfolio_value}\n\n"
        
        state.last_reply = summary
        
    except Exception as e:
        state.last_reply = f"Error generating projects: {str(e)}"
    
    return state


# ================================================
# PROFILE MANAGEMENT
# ================================================

async def profile_management_node(state: GraphState) -> GraphState:
    """
    Fetch and summarize user profile.
    Triggered by "profile" intent.
    """
    try:
        if not state.user_id:
            state.last_reply = "Please sign in to view your profile."
            return state

        profile = await ProfileService.get_or_create_profile(state.user_id)
        state.profile_data = profile.model_dump()
        
        summary = f"""
Your Career Profile:

Current Role: {profile.current_role or 'Not set'}
Experience: {profile.experience_years or 0} years
Location: {profile.location or 'Not set'}

Skills: {', '.join(profile.skills) if profile.skills else 'Not set'}
Target Roles: {', '.join(profile.target_roles) if profile.target_roles else 'Not set'}

Education: {profile.education_level or 'Not set'}
Strengths: {', '.join(profile.strengths) if profile.strengths else 'Not set'}

Want to update any of these? Ask away!
"""
        state.last_reply = summary
        
    except Exception as e:
        state.last_reply = f"Error loading profile: {str(e)}"
    
    return state


# ================================================
# MENTOR MODE
# ================================================

async def mentor_mode_node(state: GraphState) -> GraphState:
    """
    Switch to mentor mode or adjust coaching style.
    Triggered by "mentor_mode" intent.
    """
    state.current_mode = "mentor"
    state.last_reply = """
Mentor mode activated.

I'm now in strategic mentoring mode. I'll:
- Focus on long-term career progression
- Relate advice to your stored profile and goals
- Encourage consistency and accountability
- Give realistic, grounded guidance instead of generic motivation
- Help break down big goals into concrete steps

What would you like mentoring on today?
"""
    return state


# ================================================
# PROGRESS TRACKING
# ================================================

async def progress_tracking_node(state: GraphState) -> GraphState:
    """
    Track weekly goals and progress.
    Triggered by "progress" intent.
    """
    try:
        if not state.user_id:
            state.last_reply = "Please sign in to view and track your progress."
            return state

        msg = state.messages[-1].content.lower()
        progress = await CareerService.get_progress(state.user_id)

        if not progress:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)
            state.last_reply = (
                "You don't have progress data saved for this week yet. "
                f"Start with 2-3 SMART goals for {week_start.isoformat()} to {week_end.isoformat()}, "
                "then log accomplishments mid-week."
            )
            return state

        goals = progress.get("weekly_goals") or []
        completed_goals = [g for g in goals if str(g.get("status", "")).lower() == "completed"]
        total_goals = len(goals)
        completion_pct = int((len(completed_goals) / total_goals) * 100) if total_goals else 0

        if "goal" in msg and "set" in msg:
            state.last_reply = (
                "To set stronger weekly goals, use this format: 'Outcome + metric + deadline'. "
                "Example: Complete 3 LeetCode medium problems by Friday evening."
            )
            return state

        state.last_reply = (
            f"Weekly Progress Snapshot ({progress.get('week_start')} to {progress.get('week_end')}):\n"
            f"- Goals completed: {len(completed_goals)}/{total_goals} ({completion_pct}%)\n"
            f"- Learning minutes: {progress.get('total_minutes_learning', 0)}\n"
            f"- Projects started/completed: {progress.get('projects_started', 0)}/{progress.get('projects_completed', 0)}\n"
            f"- Accomplishments logged: {len(progress.get('accomplishments') or [])}\n"
            f"- Challenges logged: {len(progress.get('challenges') or [])}\n\n"
            "If you'd like, I can now help you define your top 3 priorities for next week based on this data."
        )
        
    except Exception as e:
        state.last_reply = f"Error: {str(e)}"
    
    return state
