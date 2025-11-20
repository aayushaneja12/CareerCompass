import re
from datetime import datetime
from backend.supabase_client import supabase
from backend.state import GraphState


DATE_RE = r"(20\d{2}-\d{2}-\d{2})"
TIME_RE = r"(\d{1,2}:\d{2})"


def _parse_booking_request(text: str):
    """Extract date, time, topic from user message."""
    date_match = re.search(DATE_RE, text)
    time_match = re.search(TIME_RE, text)
    topic_match = re.search(r"(?:about|for) ([a-zA-Z ]+)", text)

    date = date_match.group(1) if date_match else None
    time = time_match.group(1) if time_match else None
    topic = topic_match.group(1).strip() if topic_match else None

    return date, time, topic


def _handle_cancellation(state: GraphState, text: str) -> GraphState:
    """Cancel existing booking for the user."""
    user_id = getattr(state, "user_id", None)
    if not user_id:
        state.last_reply = "I can’t cancel anything because I don’t know who you are."
        return state

    # Try to parse specific booking
    date_match = re.search(DATE_RE, text)
    time_match = re.search(TIME_RE, text)

    query = (
        supabase.table("bookings")
        .select("id, session_date, start_time, coach_id, status")
        .eq("student_id", user_id)
        .neq("status", "cancelled")
    )

    if date_match:
        query = query.eq("session_date", date_match.group(1))

    if time_match:
        query = query.eq("start_time", time_match.group(1))

    resp = query.execute()
    bookings = resp.data or []

    if not bookings:
        state.last_reply = "I couldn’t find any active booking to cancel."
        return state

    booking = bookings[0]

    # mark booking cancelled
    supabase.table("bookings").update(
        {
            "status": "cancelled",
            "cancelled_at": datetime.utcnow().isoformat(),
            "cancelled_by": user_id,
            "cancelled_reason": "user",
        }
    ).eq("id", booking["id"]).execute()

    # free the slot
    supabase.table("coach_availability").update(
        {"is_booked": False}
    ).eq("coach_id", booking["coach_id"]).eq(
        "start_time", booking["start_time"]
    ).execute()

    state.last_reply = (
        f"Your session on {booking['session_date']} at "
        f"{booking['start_time']} has been cancelled."
    )
    return state


def booking_node(state: GraphState) -> GraphState:
    text = state.messages[-1].content.lower()

    # CANCELLATION INTENT
    if "cancel" in text or "remove booking" in text:
        return _handle_cancellation(state, text)

    # NEW BOOKING INTENT
    date, time, topic = _parse_booking_request(text)

    if not date or not time:
        state.last_reply = (
            "I need a date (YYYY-MM-DD) and time (HH:MM) to book a coaching session."
        )
        return state

    # time must be in future
    try:
        dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
        if dt < datetime.utcnow():
            state.last_reply = "You can't book a session in the past."
            return state
    except ValueError:
        state.last_reply = "Your date or time format seems off."
        return state

    user_id = getattr(state, "user_id", None)
    if not user_id:
        state.last_reply = "I need your user profile linked to book a session."
        return state

    # Check if user already has a booking at that time
    conflict = (
        supabase.table("bookings")
        .select("id")
        .eq("student_id", user_id)
        .eq("session_date", date)
        .eq("start_time", time)
        .neq("status", "cancelled")
        .execute()
        .data
    )

    if conflict:
        state.last_reply = (
            "You already have a session booked at that time. "
            "Try another time slot."
        )
        return state

    # Find available coach slot
    slot = (
        supabase.table("coach_availability")
        .select("id, coach_id")
        .eq("start_time", time)
        .eq("is_booked", False)
        .limit(1)
        .execute()
        .data
    )

    if not slot:
        state.last_reply = "No coach is available at that time. Try another slot."
        return state

    coach_id = slot[0]["coach_id"]

    # Insert booking
    booking = {
        "student_id": user_id,
        "coach_id": coach_id,
        "slot_id": slot[0]["id"],
        "session_date": date,
        "start_time": time,
        "topic": topic,
        "status": "confirmed",
    }

    created = supabase.table("bookings").insert(booking).execute().data[0]

    # Mark the slot booked
    supabase.table("coach_availability").update(
        {"is_booked": True}
    ).eq("id", slot[0]["id"]).execute()

    state.last_reply = (
        f"Your coaching session is booked! 🎉\n"
        f"Date: {date}\n"
        f"Time: {time}\n"
        f"Coach: {coach_id}\n"
        f"Topic: {topic or 'Not specified'}"
    )
    return state
