from backend.supabase_client import supabase
from backend.state import GraphState


def profile_node(state: GraphState) -> GraphState:
    """
    Fetch the user's PRP profile from the database.
    We look up by user_id first (recommended), then by email if available.
    """

    user_id = getattr(state, "user_id", None)
    user_email = getattr(state, "user_email", None)

    if not user_id and not user_email:
        state.last_reply = (
            "I don’t have your profile linked yet. "
            "Log in or tell me your SP Jain email so I can pull up your PRP records."
        )
        return state

    query = supabase.table("profiles").select("id, email, full_name, role")

    # Prefer user_id → it's guaranteed accurate
    if user_id:
        query = query.eq("id", user_id)
    else:
        query = query.eq("email", user_email)

    resp = query.single().execute()
    row = resp.data

    if not row:
        state.last_reply = (
            "I couldn’t find your PRP profile in the system. "
            "It might not be registered yet."
        )
        return state

    state.last_reply = (
        "Here’s what I found in your PRP profile:\n\n"
        f"- Name: {row.get('full_name', 'N/A')}\n"
        f"- Email: {row.get('email', 'N/A')}\n"
        f"- Role: {row.get('role', 'student')}"
    )
    return state
