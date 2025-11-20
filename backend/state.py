from __future__ import annotations
from typing import List, Literal, Optional, Annotated
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
    messages: Annotated[List[BaseMessage], add_messages] = Field(default_factory=list)

    intent: Optional[str] = None

    booking: Optional[Booking] = None
    notes: Optional[SessionNotes] = None
    feedback: Optional[Feedback] = None
    event: Optional[EventInfo] = None

    user_id: Optional[str] = None
    conversation_id: Optional[str] = None

    last_reply: Optional[str] = None
