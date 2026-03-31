from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, timedelta
from pathlib import Path

from backend.graphstructure import build_graph
from backend.state import GraphState
from langchain_core.messages import HumanMessage, AIMessage
from backend.models import (
    ProfileUpdateRequest,
    AnalyzeSkillGapRequest,
    GenerateRoadmapRequest,
    AnalyzeResumeRequest,
    GenerateProjectsRequest,
)
from backend.services import ProfileService, CareerService, ResumeService

from dotenv import load_dotenv

ROOT_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ROOT_ENV_PATH)

# Optional: only if you want auth checking via Supabase JWT
from backend.supabase_client import supabase


app = FastAPI(title="Mentra PRP AI Agent API")

# ✅ CORS so browser allows frontend -> backend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://career-compass-opal.vercel.app/",
    ],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Build graph ONCE at startup (faster than rebuilding every request)
graph = build_graph()


class ChatRequest(BaseModel):
    message: str
    # Optional: if you later want multi-turn threads
    conversation_id: Optional[str] = None

    # Optional: if you want frontend to send chat history
    # history: Optional[List[Dict[str, str]]] = None


class ChatResponse(BaseModel):
    reply: str
    intent: Optional[str] = None
    conversation_id: Optional[str] = None


class ProgressUpdateRequest(BaseModel):
    week_start: Optional[str] = None
    week_end: Optional[str] = None
    weekly_goals: List[Dict[str, Any]] = []
    accomplishments: List[str] = []
    challenges: List[str] = []
    total_minutes_learning: int = 0
    projects_started: int = 0
    projects_completed: int = 0
    recommended_focus: List[str] = []


def get_user_from_bearer(authorization: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    If frontend sends Authorization: Bearer <access_token>,
    verify it with Supabase and return user info.
    """
    if not authorization:
        return None

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    token = parts[1]
    try:
        user_resp = supabase.auth.get_user(token)
        if user_resp and user_resp.user:
            return {
                "id": user_resp.user.id,
                "email": user_resp.user.email,
            }
    except Exception:
        return None

    return None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, authorization: Optional[str] = Header(default=None)):
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Minimal state based on your existing CLI pattern
    try:
        conversation_messages = []
        if payload.conversation_id:
            conv_resp = (
                supabase.table("conversations")
                .select("id,user_id")
                .eq("id", payload.conversation_id)
                .eq("user_id", user["id"])
                .limit(1)
                .execute()
            )
            if not conv_resp.data:
                raise HTTPException(status_code=403, detail="Conversation access denied")

            history_resp = (
                supabase.table("messages")
                .select("content,sender_type")
                .eq("conversation_id", payload.conversation_id)
                .order("created_at", desc=False)
                .execute()
            )
            history_rows = (history_resp.data or [])[-12:]
            for row in history_rows:
                sender_type = row.get("sender_type")
                content = row.get("content") or ""
                if sender_type == "assistant":
                    conversation_messages.append(AIMessage(content=content))
                else:
                    conversation_messages.append(HumanMessage(content=content))

        state = GraphState(
            messages=[*conversation_messages, HumanMessage(content=payload.message)],
            last_reply=None,
            intent=None,
            user_id=user["id"],
            conversation_id=payload.conversation_id,
        )

        out = await graph.ainvoke(state)
        new_state = GraphState(**out)

        return ChatResponse(
            reply=new_state.last_reply or "(no reply)",
            intent=new_state.intent,
            conversation_id=new_state.conversation_id,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# CAREER COPILOT API ENDPOINTS
# ============================================================================

@app.get("/profile")
async def get_profile(authorization: Optional[str] = Header(default=None)):
    """Get user's career profile."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        profile = await ProfileService.get_or_create_profile(user["id"], user.get("email"))
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/profile")
async def update_profile(
    req: ProfileUpdateRequest,
    authorization: Optional[str] = Header(default=None)
):
    """Update user's career profile."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        profile = await ProfileService.update_profile(user["id"], req)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/skill-gap")
async def analyze_skill_gap(
    req: AnalyzeSkillGapRequest,
    authorization: Optional[str] = Header(default=None)
):
    """Analyze skill gaps for target role."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        profile = await ProfileService.get_or_create_profile(user["id"], user.get("email"))
        gap_report = await CareerService.analyze_skill_gap(profile, req.target_role)
        return gap_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/roadmap")
async def generate_roadmap(
    req: GenerateRoadmapRequest,
    authorization: Optional[str] = Header(default=None)
):
    """Generate career roadmap."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        profile = await ProfileService.get_or_create_profile(user["id"], user.get("email"))
        roadmap = await CareerService.generate_roadmap(
            profile,
            req.target_role,
            current_role_override=req.current_role,
        )
        return roadmap
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/roadmap/{roadmap_id}")
async def get_roadmap(roadmap_id: str, authorization: Optional[str] = Header(default=None)):
    """Fetch roadmap and items."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        items = await CareerService.get_roadmap_items(roadmap_id, user_id=user["id"])
        return {"id": roadmap_id, "items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resume-review")
async def analyze_resume(
    req: AnalyzeResumeRequest,
    authorization: Optional[str] = Header(default=None)
):
    """Analyze resume and provide feedback."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        review = await ResumeService.analyze_resume(
            user["id"],
            req.resume_text,
            req.target_role
        )
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/projects")
async def suggest_projects(
    req: GenerateProjectsRequest,
    authorization: Optional[str] = Header(default=None)
):
    """Suggest portfolio projects."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        profile = await ProfileService.get_or_create_profile(user["id"], user.get("email"))
        projects = await CareerService.suggest_projects(
            profile,
            req.target_role,
            req.count
        )
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/progress")
async def get_progress(
    week_start: Optional[str] = Query(default=None),
    authorization: Optional[str] = Header(default=None),
):
    """Get latest progress metrics or progress for a specific week."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        progress = await CareerService.get_progress(user["id"], week_start=week_start)
        if progress:
            return progress

        # Return a default record shape if none exists yet
        today = date.today()
        week_start_date = today - timedelta(days=today.weekday())
        week_end_date = week_start_date + timedelta(days=6)
        return {
            "user_id": user["id"],
            "week_start": week_start_date.isoformat(),
            "week_end": week_end_date.isoformat(),
            "weekly_goals": [],
            "accomplishments": [],
            "challenges": [],
            "total_minutes_learning": 0,
            "projects_started": 0,
            "projects_completed": 0,
            "recommended_focus": [],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/progress")
async def upsert_progress(
    req: ProgressUpdateRequest,
    authorization: Optional[str] = Header(default=None),
):
    """Create/update weekly progress metrics for the authenticated user."""
    user = get_user_from_bearer(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        payload = req.model_dump()
        progress = await CareerService.upsert_progress(user["id"], payload)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
