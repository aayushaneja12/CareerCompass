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
    def _normalize_string_list(value: Any) -> List[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            text = value.strip()
            return [text] if text else []
        return []

    @staticmethod
    def _normalize_gap_items(value: Any, importance: str) -> List[Dict[str, Any]]:
        """Accept list[str] or list[dict] and normalize to SkillGap-like dictionaries."""
        normalized: List[Dict[str, Any]] = []
        if not isinstance(value, list):
            return normalized

        for item in value:
            if isinstance(item, dict):
                skill = str(item.get("skill") or item.get("name") or "").strip()
                if not skill:
                    continue
                normalized.append({
                    "skill": skill,
                    "importance": str(item.get("importance") or importance),
                    "current_level": str(item.get("current_level") or "none"),
                    "target_level": str(item.get("target_level") or "intermediate"),
                    "suggested_path": item.get("suggested_path"),
                })
                continue

            skill_text = str(item).strip()
            if not skill_text:
                continue
            normalized.append({
                "skill": skill_text,
                "importance": importance,
                "current_level": "none",
                "target_level": "intermediate",
                "suggested_path": None,
            })

        return normalized

    @staticmethod
    def _parse_json_object(content: Any) -> Optional[Dict[str, Any]]:
        """Best-effort parse for model outputs that may include markdown fences or extra text."""
        if content is None:
            return None

        text = content if isinstance(content, str) else str(content)
        text = text.strip()
        if not text:
            return None

        # Fast path: already valid JSON object
        try:
            parsed = json.loads(text)
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            pass

        # Handle fenced markdown blocks like ```json ... ```
        if "```" in text:
            chunks = text.split("```")
            for chunk in chunks:
                candidate = chunk.strip()
                if candidate.lower().startswith("json"):
                    candidate = candidate[4:].strip()
                if not candidate:
                    continue
                try:
                    parsed = json.loads(candidate)
                    if isinstance(parsed, dict):
                        return parsed
                except json.JSONDecodeError:
                    continue

        # Extract the first top-level JSON object from mixed text.
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = text[start:end + 1]
            try:
                parsed = json.loads(candidate)
                return parsed if isinstance(parsed, dict) else None
            except json.JSONDecodeError:
                return None

        return None

    @staticmethod
    def _roadmap_db_to_model(row: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(row or {})
        if "current_role" not in normalized and "current_position" in normalized:
            normalized["current_role"] = normalized.get("current_position")
        return normalized

    @staticmethod
    def _normalize_roadmap_data(value: Any, target_role: str) -> Dict[str, Any]:
        if not isinstance(value, dict):
            return {
                "title": f"Path to {target_role}",
                "overview": "A structured career progression plan",
                "phases": [],
            }

        title = str(value.get("title") or f"Path to {target_role}").strip()
        overview = str(value.get("overview") or "A structured career progression plan").strip()

        raw_phases = value.get("phases")
        if not isinstance(raw_phases, list):
            raw_phases = []

        normalized_phases: List[Dict[str, Any]] = []
        for idx, phase in enumerate(raw_phases, start=1):
            if isinstance(phase, str):
                normalized_phases.append(
                    {
                        "phase_number": idx,
                        "phase_name": phase.strip() or f"Phase {idx}",
                        "goals": [],
                        "duration": "4 weeks",
                        "tasks": [],
                    }
                )
                continue

            if not isinstance(phase, dict):
                continue

            tasks = phase.get("tasks")
            if not isinstance(tasks, list):
                tasks = phase.get("steps") if isinstance(phase.get("steps"), list) else []

            goals = phase.get("goals")
            if not isinstance(goals, list):
                goals = []

            normalized_phases.append(
                {
                    "phase_number": phase.get("phase_number") if isinstance(phase.get("phase_number"), int) else idx,
                    "phase_name": str(phase.get("phase_name") or phase.get("name") or f"Phase {idx}").strip(),
                    "goals": [str(g).strip() for g in goals if str(g).strip()],
                    "duration": str(phase.get("duration") or "4 weeks").strip(),
                    "tasks": tasks,
                }
            )

        return {
            "title": title,
            "overview": overview,
            "phases": normalized_phases,
        }

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
            analysis = CareerService._parse_json_object(response.content)
            if analysis is None:
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
            
            current_skills = CareerService._normalize_string_list(
                analysis.get("current_skills", user_profile.skills)
            )
            required_skills = CareerService._normalize_string_list(
                analysis.get("required_skills", [])
            )
            high_priority_gaps = CareerService._normalize_gap_items(
                analysis.get("high_priority_gaps", []),
                "critical",
            )
            medium_priority_gaps = CareerService._normalize_gap_items(
                analysis.get("medium_priority_gaps", []),
                "medium",
            )
            low_priority_gaps = CareerService._normalize_gap_items(
                analysis.get("low_priority_gaps", []),
                "low",
            )
            next_steps = CareerService._normalize_string_list(analysis.get("next_steps", []))

            # Save to database
            report_data = {
                "user_id": user_profile.user_id,
                "target_role": target_role,
                "readiness_score": analysis.get("readiness_score", 50),
                "readiness_text": analysis.get("readiness_text", "Intermediate"),
                "current_skills": current_skills,
                "required_skills": required_skills,
                "high_priority_gaps": high_priority_gaps,
                "medium_priority_gaps": medium_priority_gaps,
                "low_priority_gaps": low_priority_gaps,
                "next_steps": next_steps,
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
            
            parsed_roadmap = CareerService._parse_json_object(response.content)
            roadmap_data = CareerService._normalize_roadmap_data(parsed_roadmap, target_role)
            
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
                    raw_tasks = phase.get("tasks", [])
                    if not isinstance(raw_tasks, list):
                        raw_tasks = []
                    for task in raw_tasks:
                        if isinstance(task, str):
                            title = task
                            description = None
                            resources = []
                        else:
                            if not isinstance(task, dict):
                                continue
                            title = str(
                                task.get("title")
                                or task.get("task")
                                or task.get("name")
                                or task.get("action")
                                or ""
                            ).strip()
                            description = task.get("description") or task.get("details")
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
