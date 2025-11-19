# tools/kb_search.py
import re
from backend.supabase_client import supabase
from backend.state import GraphState


def _pick_keyword(text: str) -> str:
    """
    Simple keyword extractor: pick the longest English word
    with length >= 4. Falls back to full text if no words found.
    """
    if not text:
        return ""

    words = re.findall(r"[a-zA-Z]{4,}", text.lower())
    if not words:
        return text.strip()

    # longest word first
    words.sort(key=len, reverse=True)
    return words[0]


def kb_search_node(state: GraphState) -> GraphState:
    """
    Searches kb_chunks for relevant content based on keyword.
    Only returns published chunks.
    """

    if not state.messages:
        state.last_reply = "Ask me what you're looking for in the PRP resources."
        return state

    query_text = state.messages[-1].content
    keyword = _pick_keyword(query_text)

    # query kb_chunks
    resp = (
        supabase.table("kb_chunks")
        .select("content, source_type, source_url")
        .eq("is_published", True)
        .ilike("content", f"%{keyword}%")
        .limit(5)
        .execute()
    )

    rows = resp.data or []

    if not rows:
        state.last_reply = f"I couldn't find any resources related to '{keyword}'."
        return state

    snippets = []
    for row in rows:
        content = (row.get("content") or "").strip()
        source = row.get("source_type") or "resource"
        url = row.get("source_url") or ""

        # short snippet without newlines
        snippet = content[:200].replace("\n", " ")

        if url:
            snippets.append(f"- ({source}) {snippet}...\n  Source: {url}")
        else:
            snippets.append(f"- ({source}) {snippet}...")

    state.last_reply = (
        "Here are some useful resources I found:\n\n"
        + "\n".join(snippets)
        + "\n\nIf you'd like, I can summarise one of them or show more."
    )

    return state
