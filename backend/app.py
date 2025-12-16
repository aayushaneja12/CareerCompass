from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.graphstructure import build_graph
from backend.state import GraphState
from langchain_core.messages import HumanMessage

from dotenv import load_dotenv
load_dotenv()

# Optional: only if you want auth checking via Supabase JWT
from backend.supabase_client import supabase


app = FastAPI(title="Mentra PRP AI Agent API")

# ✅ CORS so browser allows frontend -> backend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
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
def chat(payload: ChatRequest, authorization: Optional[str] = Header(default=None)):
    user = get_user_from_bearer(authorization)

    # Minimal state based on your existing CLI pattern
    try:
        state = GraphState(
            messages=[HumanMessage(content=payload.message)],
            last_reply=None,
            intent=None,
        )

        # If your GraphState supports extra fields like user_id, set it:
        # if user:
        #     state.user_id = user["id"]

        out = graph.invoke(state)
        new_state = GraphState(**out)

        return ChatResponse(
            reply=new_state.last_reply or "(no reply)",
            intent=new_state.intent,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
