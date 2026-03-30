"""
Career guidance services for skill gap analysis, roadmaps, and project suggestions.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
import json
import os
from backend.supabase_client import supabase
from backend.models import (
    SkillGapReport,
    Roadmap,
    RoadmapItem,
    ProjectIdea,
    UserProfile,
)


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=GROQ_API_KEY)


class CareerService:
    @staticmethod
    def _roadmap_db_to_model(row: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(row or {})
        if "current_role" not in normalized and "current_position" in normalized:
            normalized["current_role"] = normalized.get("current_position")
        return normalized

    @staticmethod
    async def analyze_skill_gap(
        user_profile: UserProfile,
        target_role: str,
    ) -> SkillGapReport:
        """
        Analyze skill gaps between user's current profile and target role requirements.
        Uses LLM to structure the analysis.
        """
        try:
            # Build context from profile
            profile_context = f"""
User Profile:
- Current Role: {user_profile.current_role or 'Not specified'}
- Experience: {user_profile.experience_years or 0} years
- Skills: {', '.join(user_profile.skills) if user_profile.skills else 'None listed'}
- Education: {user_profile.education_level or 'Not specified'} in {user_profile.education_field or 'Not specified'}
- Strengths: {', '.join(user_profile.strengths) if user_profile.strengths else 'Not specified'}
- Weak Areas: {', '.join(user_profile.weak_areas) if user_profile.weak_areas else 'Not specified'}
"""
            
            prompt = f"""You are a career advisor analyzing skill gaps.

{profile_context}

Target Role: {target_role}

Provide a detailed skill gap analysis in JSON format with:
1. readiness_score (0-100): How ready is the user for this role?
2. readiness_text: One of "Beginner", "Intermediate", "Advanced"
3. required_skills: Top 8-10 skills required for the role
4. current_skills: Skills the user already has
5. high_priority_gaps: Critical skills to learn (array)
6. medium_priority_gaps: Important but not urgent (array)
7. low_priority_gaps: Nice-to-have skills (array)
8. next_steps: 6-9 concrete actions in this exact style:
    "Phase <1|2|3> | Priority: <High|Medium|Low> | Action: <specific action> | Outcome: <measurable expected result>"
9. suggested_timeline: E.g., "3-6 months" for full readiness

Return only valid JSON, no markdown."""
            
            response = llm.invoke([
                SystemMessage(content="You are a career advisor. Respond only with valid JSON."),
                HumanMessage(content=prompt)
            ])
            
            # Parse LLM response
            try:
                analysis = json.loads(response.content)
            except json.JSONDecodeError:
                # Fallback if LLM didn't return valid JSON
                analysis = {
                    "readiness_score": 50,
                    "readiness_text": "Intermediate",
                    "required_skills": [],
                    "current_skills": user_profile.skills,
                    "high_priority_gaps": [],
                    "medium_priority_gaps": [],
                    "low_priority_gaps": [],
                    "next_steps": ["Build foundational knowledge", "Practice with projects"],
                    "suggested_timeline": "3-6 months"
                }
            
            # Save to database
            report_data = {
                "user_id": user_profile.user_id,
                "target_role": target_role,
                "readiness_score": analysis.get("readiness_score", 50),
                "readiness_text": analysis.get("readiness_text", "Intermediate"),
                "current_skills": analysis.get("current_skills", []),
                "required_skills": analysis.get("required_skills", []),
                "high_priority_gaps": analysis.get("high_priority_gaps", []),
                "medium_priority_gaps": analysis.get("medium_priority_gaps", []),
                "low_priority_gaps": analysis.get("low_priority_gaps", []),
                "next_steps": analysis.get("next_steps", []),
                "suggested_timeline": analysis.get("suggested_timeline", ""),
                "created_at": datetime.utcnow().isoformat(),
            }
            
            response = supabase.table("skill_gap_reports").insert(report_data).execute()
            return SkillGapReport(**response.data[0])
        
        except Exception as e:
            print(f"Error analyzing skill gap: {e}")
            raise

    @staticmethod
    async def generate_roadmap(
        user_profile: UserProfile,
        target_role: str,
        current_role_override: Optional[str] = None,
    ) -> Roadmap:
        """
        Generate a career roadmap from current state to target role.
        """
        try:
            current_role = current_role_override or user_profile.current_role or "Transitioning"
            prompt = f"""You are a career planning expert. Create a detailed career roadmap.

Current Profile:
- Role: {current_role}
- Experience: {user_profile.experience_years or 0} years
- Skills: {', '.join(user_profile.skills) if user_profile.skills else 'None'}

Target: {target_role}

Generate a roadmap with phases. Return JSON with:
1. title: Roadmap title
2. overview: Brief summary
3. phases: Array of phase objects, each with:
   - phase_number: 1, 2, 3, etc.
   - phase_name: "Foundation", "Core Skills", "Projects", "Interview Prep", "Application"
   - goals: Array of phase goals
   - duration: E.g., "4 weeks"
    - tasks: Array of task objects, each task object with:
      - title: concise action
      - description: what to do and how
      - resources: optional array of suggested resources

Keep phases realistic (3-5 phases). Be specific and actionable.
Return only valid JSON."""
            
            response = llm.invoke([
                SystemMessage(content="You are a career advisor. Respond only with valid JSON."),
                HumanMessage(content=prompt)
            ])
            
            try:
                roadmap_data = json.loads(response.content)
            except json.JSONDecodeError:
                roadmap_data = {
                    "title": f"Path to {target_role}",
                    "overview": "A structured career progression plan",
                    "phases": []
                }
            
            # Save roadmap to database
            road_payload = {
                "user_id": user_profile.user_id,
                "target_role": target_role,
                "current_position": current_role,
                "status": "active",
                "roadmap_json": roadmap_data,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
            
            response = supabase.table("roadmaps").insert(road_payload).execute()
            roadmap = Roadmap(**CareerService._roadmap_db_to_model(response.data[0]))
            
            # Create roadmap items (tasks)
            if "phases" in roadmap_data:
                items = []
                for phase in roadmap_data["phases"]:
                    for task in phase.get("tasks", []):
                        if isinstance(task, str):
                            title = task
                            description = None
                            resources = []
                        else:
                            title = task.get("title", "")
                            description = task.get("description")
                            resources = task.get("resources") if isinstance(task.get("resources"), list) else []

                        if not title:
                            continue

                        item = {
                            "roadmap_id": roadmap.id,
                            "phase_number": phase.get("phase_number"),
                            "phase_name": phase.get("phase_name"),
                            "item_type": "task",
                            "title": title,
                            "description": description,
                            "resources": resources,
                            "status": "pending",
                            "estimated_duration": phase.get("duration"),
                            "created_at": datetime.utcnow().isoformat(),
                        }
                        items.append(item)
                
                if items:
                    supabase.table("roadmap_items").insert(items).execute()
            
            return roadmap
        
        except Exception as e:
            print(f"Error generating roadmap: {e}")
            raise

    @staticmethod
    async def suggest_projects(
        user_profile: UserProfile,
        target_role: str,
        count: int = 3,
    ) -> List[ProjectIdea]:
        """
        Suggest portfolio projects based on user level and role.
        """
        try:
            difficulty = "Beginner"
            if user_profile.experience_years and user_profile.experience_years >= 2:
                difficulty = "Intermediate"
            if user_profile.experience_years and user_profile.experience_years >= 5:
                difficulty = "Advanced"
            
            prompt = f"""You are a project ideation expert for career development.

User Level: {difficulty} ({user_profile.experience_years or 0} years exp)
Target Role: {target_role}
Current Skills: {', '.join(user_profile.skills) if user_profile.skills else 'General'}

Suggest {count} portfolio projects suitable for this profile. For each project, provide JSON:
{{
  "title": "Project name",
  "difficulty_level": "{difficulty}",
  "description": "What the project does",
  "skills_covered": ["skill1", "skill2"],
  "tech_stack": ["tech1", "tech2"],
  "relevance_to_role": "Why this matters for {target_role}",
  "relevance_score": 85,
  "portfolio_value": "How it looks on portfolio",
    "implementation_steps": [{{"step": "step1"}}, {{"step": "step2"}}],
  "datasets_ideas": ["dataset1"],
  "resources": ["link1"]
}}

Return a JSON array of {count} projects with no other text."""
            
            response = llm.invoke([
                SystemMessage(content="You are a project advisor. Respond only with valid JSON array."),
                HumanMessage(content=prompt)
            ])
            
            try:
                projects_data = json.loads(response.content)
            except json.JSONDecodeError:
                projects_data = []
            
            # Save projects
            projects = []
            for proj_data in projects_data[:count]:
                raw_steps = proj_data.get("implementation_steps", [])
                normalized_steps = []
                if isinstance(raw_steps, list):
                    for step in raw_steps:
                        if isinstance(step, dict):
                            normalized_steps.append(step)
                        elif isinstance(step, str):
                            normalized_steps.append({"step": step})

                proj_payload = {
                    "user_id": user_profile.user_id,
                    **proj_data,
                    "implementation_steps": normalized_steps,
                    "status": "saved",
                    "saved_at": datetime.utcnow().isoformat(),
                }
                resp = supabase.table("saved_projects").insert(proj_payload).execute()
                projects.append(ProjectIdea(**resp.data[0]))
            
            return projects
        
        except Exception as e:
            print(f"Error suggesting projects: {e}")
            raise

    @staticmethod
    async def get_user_roadmap(user_id: str, target_role: Optional[str] = None) -> Optional[Roadmap]:
        """Fetch active roadmap, optionally filtered by target role."""
        try:
            query = supabase.table("roadmaps").select("*").eq("user_id", user_id).eq("status", "active")
            if target_role:
                query = query.eq("target_role", target_role)
            response = query.execute()
            if response.data:
                return Roadmap(**CareerService._roadmap_db_to_model(response.data[0]))
            return None
        except Exception as e:
            print(f"Error fetching roadmap: {e}")
            raise

    @staticmethod
    async def get_roadmap_items(roadmap_id: str, user_id: Optional[str] = None) -> List[RoadmapItem]:
        """Fetch all items for a roadmap."""
        try:
            if user_id:
                roadmap = (
                    supabase.table("roadmaps")
                    .select("id")
                    .eq("id", roadmap_id)
                    .eq("user_id", user_id)
                    .limit(1)
                    .execute()
                )
                if not roadmap.data:
                    return []

            response = supabase.table("roadmap_items").select("*").eq("roadmap_id", roadmap_id).execute()
            return [RoadmapItem(**item) for item in response.data]
        except Exception as e:
            print(f"Error fetching roadmap items: {e}")
            raise

    @staticmethod
    async def update_roadmap_item_status(item_id: str, status: str) -> RoadmapItem:
        """Mark roadmap item as completed or update status."""
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat(),
            }
            if status == "completed":
                update_data["completed_at"] = datetime.utcnow().isoformat()
            
            response = supabase.table("roadmap_items").update(update_data).eq("id", item_id).execute()
            return RoadmapItem(**response.data[0])
        except Exception as e:
            print(f"Error updating roadmap item: {e}")
            raise

    @staticmethod
    async def get_progress(user_id: str, week_start: Optional[str] = None):
        """Fetch progress metrics, latest by default or a specific week."""
        try:
            query = supabase.table("progress_metrics").select("*").eq("user_id", user_id)
            if week_start:
                query = query.eq("week_start", week_start)
            response = query.order("week_start", desc=True).limit(1).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching progress: {e}")
            raise

    @staticmethod
    async def upsert_progress(user_id: str, payload: Dict[str, Any]):
        """Create or update weekly progress metrics for a user."""
        try:
            now_iso = datetime.utcnow().isoformat()
            data = {
                "user_id": user_id,
                "week_start": payload.get("week_start"),
                "week_end": payload.get("week_end"),
                "weekly_goals": payload.get("weekly_goals", []),
                "accomplishments": payload.get("accomplishments", []),
                "challenges": payload.get("challenges", []),
                "total_minutes_learning": payload.get("total_minutes_learning", 0),
                "projects_started": payload.get("projects_started", 0),
                "projects_completed": payload.get("projects_completed", 0),
                "recommended_focus": payload.get("recommended_focus", []),
                "updated_at": now_iso,
            }

            # Set created_at on insert; harmless if ignored on update path.
            if not data.get("week_start"):
                raise ValueError("week_start is required")
            if not data.get("week_end"):
                raise ValueError("week_end is required")
            data["created_at"] = now_iso

            response = (
                supabase.table("progress_metrics")
                .upsert(data, on_conflict="user_id,week_start")
                .execute()
            )
            return response.data[0] if response.data else data
        except Exception as e:
            print(f"Error upserting progress: {e}")
            raise
