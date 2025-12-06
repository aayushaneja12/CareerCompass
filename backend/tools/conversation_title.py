from datetime import datetime
from backend.supabase_client import supabase
from backend.state import GraphState

MAX_TITLE_LEN = 80


def _pick_seed_text(state: GraphState) -> str:
    """Pick first user message if possible, else last message."""
    if not state.messages:
        return ""

    for msg in state.messages:
        sender = getattr(msg, "type", "")
        if sender == "human":
            return msg.content or ""

    return state.messages[-1].content or ""


def _generate_title(text: str) -> str:
    """Create a clean, short title."""
    if not text:
        return "PRP Conversation"

    raw = " ".join(text.strip().split())

    for sep in [".", "?", "!", "\n"]:
        if sep in raw:
            raw = raw.split(sep)[0]
            break

    if len(raw) > MAX_TITLE_LEN:
        raw = raw[: MAX_TITLE_LEN - 1].rstrip() + "…"

    if raw:
        raw = raw[0].upper() + raw[1:]

    return raw or "PRP Conversation"


def conversation_title_node(state: GraphState) -> GraphState:
    """
    Writes conversation title to Supabase *only if* not yet set.
    """
    conv_id = getattr(state, "conversation_id", None)
    if not conv_id:
        return state

    # Fetch existing conversation
    resp = (
        supabase.table("conversations")
        .select("id, title")
        .eq("id", conv_id)
        .single()
        .execute()
    )

    row = resp.data
    if not row:
        return state

    existing_title = (row.get("title") or "").strip()
    if existing_title:
        return state  # already titled

    # Generate title
    seed = _pick_seed_text(state)
    title = _generate_title(seed)

    # Write to DB
    supabase.table("conversations").update({"title": title}).eq("id", conv_id).execute()

    # Save on state
    state.conversation_title = title

    return state
