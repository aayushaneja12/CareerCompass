from datetime import datetime
from typing import List, Dict
from backend.supabase_client import supabase
from backend.state import GraphState


def _get_upcoming_events(limit: int = 5) -> List[Dict]:
    """
    Returns upcoming PRP events ordered by soonest start_time.
    """
    resp = (
        supabase.table("events")
        .select("id, title, start_time, end_time, location, description")
        .gte("start_time", datetime.utcnow().isoformat())
        .order("start_time", desc=False)
        .limit(limit)
        .execute()
    )

    return resp.data or []


def event_info_node(state: GraphState) -> GraphState:
    """
    Returns the next 5 upcoming PRP events.
    """
    events = _get_upcoming_events()

    if not events:
        state.last_reply = (
            "There are no upcoming PRP events at the moment. "
            "If you're expecting an event, check again later."
        )
        return state

    parts = []
    for ev in events:
        title = ev.get("title", "Untitled Event")
        loc = ev.get("location", "TBA")
        start = ev.get("start_time")
        end = ev.get("end_time")
        desc = ev.get("description") or "No additional details provided."

        parts.append(
            f"**{title}**\n"
            f"• When: {start} – {end}\n"
            f"• Where: {loc}\n"
            f"• Details: {desc}"
        )

    state.last_reply = "\n\n".join(parts)
    return state
