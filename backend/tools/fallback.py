from backend.state import GraphState
from backend.supabase_client import supabase

def fallback_node(state: GraphState) -> GraphState:
    """
    Catch-all node when no intent pattern matches.

    Responsibilities:
    - Handle generic "help / what can you do" style queries.
    - Provide a clear description of the agent's capabilities.
    - Gently nudge the user toward concrete, supported actions.
    """
    if not state.messages:
        state.last_reply = (
            "I’m here to help with PRP-related support like bookings, events, and resources. "
            "Try asking something like: 'Help me book a coaching session.'"
        )
        return state

    text = state.messages[-1].content.strip().lower()

    # Handle explicit help-style queries
    if any(
        phrase in text
        for phrase in [
            "help",
            "what can you do",
            "what do you do",
            "how can you help",
            "menu",
            "options",
        ]
    ):
        state.last_reply = (
            "Here’s what I can help you with right now:\n\n"
            "• **Coaching sessions** – book or check availability for one-on-one coaching.\n"
            "• **PRP FAQs** – questions about CVs, LinkedIn, interviews, and PRP requirements.\n"
            "• **Events** – see past or upcoming PRP events and attendance details.\n"
            "• **Resources** – find relevant PRP materials, notes, and guides.\n"
            "• **Session notes & follow-ups** – save summaries and action items after a session.\n"
            "• **Your profile** – see how you’re registered in the system.\n\n"
            "Try something like:\n"
            "- 'Book a coaching session on 2025-12-01 at 14:00 about my CV'\n"
            "- 'Show me available coaching slots on Friday'\n"
            "- 'What events are coming up?'\n"
            "- 'Find resources on STAR interview answers'\n"
        )
        return state

    # Default fallback response
    state.last_reply = (
        "I’m not completely sure what you meant.\n\n"
        "Here are some examples of what you can ask me to do:\n"
        "- Book a one-on-one coaching session\n"
        "- Check available coaching slots for a specific day\n"
        "- Ask PRP questions about CVs, LinkedIn, or interviews\n"
        "- See upcoming or past PRP events\n"
        "- Save session notes and action items\n"
        "- Find resources or workshop materials\n\n"
        "Try rephrasing your request, or say 'help' to see all options."
    )
    return state
