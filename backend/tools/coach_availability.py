import re
from datetime import datetime
from backend.supabase_client import supabase
from backend.state import GraphState

def coach_availability_node(state: GraphState) -> GraphState:
    """
    Returns the next 10 available coaching slots.
    Later we can extend this to accept:
    - specific coach ("show me slots for Andrew")
    - specific day ("this Friday")
    - next available slot only
    """

    resp = (
        supabase.table("coach_availability")
        .select("coach_id, start_time, end_time, is_booked")
        .eq("is_booked", False)
        .gte("start_time", datetime.utcnow().isoformat())
        .order("start_time", desc=False)
        .limit(10)
        .execute()
    )

    slots = resp.data or []

    if not slots:
        state.last_reply = "I couldn’t find any free coaching slots right now."
        return state

    lines = []
    for slot in slots:
        coach_id = slot.get("coach_id")
        start = slot.get("start_time")
        end = slot.get("end_time")

        line = f"- Coach {coach_id}: {start} – {end}"
        lines.append(line)

    state.last_reply = "Here are some upcoming free slots:\n\n" + "\n".join(lines)
    return state
