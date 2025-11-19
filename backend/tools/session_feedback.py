import re
from datetime import datetime
from backend.supabase_client import supabase
from backend.state import GraphState


def session_feedback_node(state: GraphState) -> GraphState:
    """
    Collects and stores session feedback:
    - rating (1-5)
    - optional comment

    Requires:
    - state.booking_id
    - state.user_id
    """

    text = state.messages[-1].content if state.messages else ""
    booking_id = getattr(state, "booking_id", None)
    user_id = getattr(state, "user_id", None)

    # Require a booking first
    if not booking_id:
        state.last_reply = (
            "To submit feedback, tell me which coaching session you're reviewing."
        )
        return state

    # Extract rating (1–5)
    rating_match = re.search(r"\b([1-5])\b", text)
    if not rating_match:
        state.last_reply = (
            "Please provide a rating from 1 to 5.\n"
            "Example: 'I rate the session 5. It was really helpful!'"
        )
        return state

    rating = int(rating_match.group(1))

    # Everything else in the message = comment
    comment = text.replace(str(rating), "").strip()
    if not comment:
        comment = None

    data = {
        "booking_id": booking_id,
        "submitted_by": user_id,
        "role": "student",
        "rating": rating,
        "comments": comment,
        "created_at": datetime.utcnow().isoformat()
    }

    supabase.table("session_feedback").insert(data).execute()

    state.last_reply = (
        f"Thanks for your feedback! I've recorded your rating of {rating}/5."
        + (f"\nYour note: {comment}" if comment else "")
    )

    return state
