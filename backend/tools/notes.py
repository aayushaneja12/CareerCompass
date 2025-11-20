import re
from datetime import datetime
from backend.supabase_client import supabase
from backend.state import GraphState, SessionNotes

def notes_node(state: GraphState) -> GraphState:
    text = state.messages[-1].content

    summary = None
    actions = []

    summary_match = re.search(r"summary:(.*)", text, re.IGNORECASE)
    if summary_match:
        summary = summary_match.group(1).strip()

    actions = re.findall(r"-\s*(.*)", text)

    # store notes
    data = {
        "booking_id": state.booking.id if state.booking else None,
        "author_id": None,
        "visibility": "private",
        "content": {
            "summary": summary or "Session notes recorded.",
            "actions": actions,
        },
    }

    supabase.table("session_notes").insert(data).execute()

    state.last_reply = (
        "I've saved your session notes.\n\n"
        "**Summary**\n"
        f"{summary}\n\n"
        "**Action Items**\n"
        + "".join(f"- {a}\n" for a in actions)
        + "\nLet me know if you'd like help planning your next steps."
    )
    return state
