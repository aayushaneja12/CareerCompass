from backend.supabase_client import supabase
from backend.state import GraphState


MAX_TITLE_LEN = 80


def _pick_seed_text(state: GraphState) -> str:
    """
    Pick the most reasonable text to base the title on.
    Prefer the first user message; fall back to latest.
    """
    if not state.messages:
        return ""

    # try first user message
    for msg in state.messages:
        sender = getattr(msg, "sender", getattr(msg, "role", "user"))
        if sender == "user":
            return msg.content or ""

    # fallback: last message content
    return state.messages[-1].content or ""


def _generate_title(text: str) -> str:
    """
    Simple heuristic title generator:
    - take first sentence or line
    - trim length
    - make it title-like
    """
    if not text:
        return "PRP Conversation"

    # strip and collapse whitespace
    raw = " ".join(text.strip().split())

    # cut at first strong boundary (. ? ! or newline)
    for sep in [".", "?", "!", "\n"]:
        if sep in raw:
            raw = raw.split(sep)[0]
            break

    # hard length cap
    if len(raw) > MAX_TITLE_LEN:
        raw = raw[:MAX_TITLE_LEN - 1].rstrip() + "…"

    # basic normalisation
    # e.g. "help with my cv and interviews" -> "Help with my CV and interviews"
    if raw:
        raw = raw[0].upper() + raw[1:]

    return raw or "PRP Conversation"


def conversation_title_node(state: GraphState) -> GraphState:
    """
    Automatically sets a short title for the conversation
    in the `conversations` table, if it doesn't have one yet.
    """

    conv_id = getattr(state, "conversation_id", None)
    if not conv_id:
        # no persisted conversation yet
        return state

    # Check if conversation already has a title
    resp = (
        supabase.table("conversations")
        .select("id, title")
        .eq("id", conv_id)
        .single()
        .execute()
    )

    row = resp.data
    if not row:
        # conversation doesn't exist (shouldn't happen, but be safe)
        return state

    existing_title = (row.get("title") or "").strip()
    if existing_title:
        # already titled, do nothing
        return state

    # Generate title based on conversation content
    seed_text = _pick_seed_text(state)
    title = _generate_title(seed_text)

    # Persist title
    supabase.table("conversations").update(
        {"title": title}
    ).eq("id", conv_id).execute()

    # Optional: attach to state for downstream use
    state.conversation_title = title

    return state
