from typing import List
from backend.supabase_client import supabase
from backend.state import GraphState

SYSTEM_FAQ_PROMPT = (
    "You are Mentra, answering PRP FAQs from the database. "
    "Only answer using the FAQ entries I give you. "
    "If nothing is relevant, say you couldn't find an exact match "
    "and suggest they contact their PRP coach."
)

def _search_faq(query: str) -> List[dict]:
    """
    Simple search using ILIKE on question then answer.
    """
    if not query:
        return []

    resp = (
        supabase.table("faq")
        .select("id, question, answer, tags")
        .ilike("question", f"%{query}%")
        .eq("is_published", True)
        .limit(5)
        .execute()
    )

    rows = resp.data or []

    if not rows:
        resp = (
            supabase.table("faq")
            .select("id, question, answer, tags")
            .ilike("answer", f"%{query}%")
            .eq("is_published", True)
            .limit(5)
            .execute()
        )
        rows = resp.data or []

    return rows


def faq_node(state: GraphState) -> GraphState:
    user_msg = state.messages[-1].content if state.messages else ""
    faqs = _search_faq(user_msg)

    if not faqs:
        state.last_reply = (
            "I couldn’t find a matching FAQ for that.\n\n"
            "Try rephrasing your question, or reach out to your PRP coach."
        )
        return state

    parts = []
    for row in faqs:
        q = (row.get("question") or "").strip()
        a = (row.get("answer") or "").strip()
        if q and a:
            parts.append(f"Q: {q}\nA: {a}")

    state.last_reply = "\n\n---\n\n".join(parts)
    return state
