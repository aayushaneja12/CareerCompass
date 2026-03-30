from __future__ import annotations
from typing import List, Literal, Optional, Annotated, Dict, Any
from pydantic import BaseModel, Field
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class Booking(BaseModel):
    name: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    topic: Optional[str] = None
    status: Literal["pending", "confirmed", "cancelled"] = "pending"

class SessionNotes(BaseModel):
    student: Optional[str] = None
    date: Optional[str] = None
    summary: Optional[str] = None
    action_items: List[str] = Field(default_factory=list)

class Feedback(BaseModel):
    student: Optional[str] = None
    message: Optional[str] = None
    created_at: Optional[str] = None

class EventInfo(BaseModel):
    query: Optional[str] = None
    result: Optional[str] = None

class GraphState(BaseModel):
    # Uses Langchain BaseMessage
    messages: Annotated[List[BaseMessage], add_messages] = Field(default_factory=list)

    intent: Optional[str] = None

    booking: Optional[Booking] = None
    notes: Optional[SessionNotes] = None
    feedback: Optional[Feedback] = None
    event: Optional[EventInfo] = None

    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    conversation_title: Optional[str] = None 

    last_reply: Optional[str] = None

    # Career Copilot Fields
    current_mode: str = "chat"  # chat, mentor, skill_gap, roadmap, resume, projects, profile
    selected_role: Optional[str] = None  # Target role for analyses
    profile_data: Optional[Dict[str, Any]] = None  # Cached UserProfile
    skill_gap_result: Optional[Dict[str, Any]] = None  # SkillGapReport
    roadmap_data: Optional[Dict[str, Any]] = None  # Roadmap
    resume_review_result: Optional[Dict[str, Any]] = None  # ResumeReview
    projects_suggestion: Optional[List[Dict[str, Any]]] = None  # ProjectIdea list
