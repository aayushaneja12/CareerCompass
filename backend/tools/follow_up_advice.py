# tools/feedback.py
from datetime import datetime
from backend.supabase_client import supabase
from backend.state import GraphState

def feedback_node(state: GraphState) -> GraphState:
    """
    Stores follow-up advice written by the student.
    Requires:
    - state.booking_id (the booking this feedback belongs to)
    - state.user_id    (the student)
    """

    text = state.messages[-1].content if state.messages else ""
    booking_id = getattr(state, "booking_id", None)
    user_id = getattr(state, "user_id", None)

    if not booking_id:
        state.last_reply = (
            "I can only record follow-up notes when they're linked to a coaching session. "
            "Try saying this after you've booked or referenced a session."
        )
        return state

    data = {
        "booking_id": booking_id,
        "author_id": user_id,
        "source": "student",                      
        "advice": text,
        "status": "open",                         # valid default
        "created_at": datetime.utcnow().isoformat()
    }

    supabase.table("follow_up_advice").insert(data).execute()

    state.last_reply = (
        "Got it — I’ve saved this as a follow-up action for your coaching session."
    )
    return state
