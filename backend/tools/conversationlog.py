from datetime import datetime
from backend.supabase_client import supabase
from backend.state import GraphState


def _ensure_conversation(state: GraphState) -> str:
    """
    Creates a new conversation if none is attached to the state.
    Returns conversation_id as UUID string.
    """
    conv_id = getattr(state, "conversation_id", None)
    user_id = getattr(state, "user_id", None)

    if conv_id:
        return conv_id

    payload = {
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat()
    }

    resp = supabase.table("conversations").insert(payload).execute()

    conv_id = resp.data[0]["id"]

    state.conversation_id = conv_id
    return conv_id


def conversation_log_node(state: GraphState) -> GraphState:
    """
    Logs the last user message AND the assistant reply (state.last_reply)
    into the messages table.
    """

    if not state.messages:
        return state

    conv_id = _ensure_conversation(state)
    rows = []

    # ---- USER MESSAGE ----
    last_msg = state.messages[-1]

    # Determine sender_type correctly
    sender_type = getattr(last_msg, "sender", "user")  # fallback "user"
    sender_id = state.user_id if sender_type == "user" else None

    rows.append(
        {
            "conversation_id": conv_id,
            "sender_type": sender_type,     # MUST be: user | assistant | staff
            "sender_id": sender_id,         # only non-null for users
            "content": last_msg.content,
            "created_at": datetime.utcnow().isoformat(),
        }
    )

    # ---- ASSISTANT REPLY ----
    if state.last_reply:
        rows.append(
            {
                "conversation_id": conv_id,
                "sender_type": "assistant",
                "sender_id": None,  # assistants have no profile
                "content": state.last_reply,
                "created_at": datetime.utcnow().isoformat(),
            }
        )

    supabase.table("messages").insert(rows).execute()

    return state
