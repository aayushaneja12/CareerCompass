import re
from typing import Dict, List
from .state import GraphState

# -------------------------------------------------------------------
# Intent patterns
# -------------------------------------------------------------------
INTENT_PATTERNS: Dict[str, List[str]] = {
    # Resume/CV Analysis (specific intent before FAQ)
    "resume": [
        r"review.*resume",
        r"improve.*resume",
        r"resume.*feedback",
        r"review.*cv",
        r"improve.*cv",
        r"linkedin.*review",
    ],

    # Skill gap analysis
    "skill_gap": [
        r"skill gap",
        r"skills gap",
        r"missing skills",
        r"what skills do i need",
        r"what skills .* need",
        r"skills for.*role",
        r"compare my skills",
        r"ready for.*role",
        r"gap analysis",
        r"analy[sz]e.*gap",
        r"gap between",
        r"what am i missing",
        r"improve for.*role",
    ],

    # Career roadmap
    "roadmap": [
        r"\broadmap\b",
        r"career path",
        r"career paths",
        r"career.*plan",
        r"learning plan",
        r"study plan",
        r"path to.*role",
        r"how do i become",
        r"steps should i take",
        r"transition from",
        r"progression.*plan",
    ],

    # Project Ideas
    "projects": [
        r"project.*ideas",
        r"portfolio.*projects",
        r"build.*project",
    ],

    # Mentor mode
    "mentor_mode": [
        r"mentor mode",
        r"mentor.*on",
    ],

    # Progress tracking
    "progress": [
        r"my.*progress",
        r"weekly.*goal",
        r"track.*progress",
    ],

    # FAQs about PRP, CV, LinkedIn, interviews, etc.
    "faq": [
        r"\blinkedin\b",
        r"mock interview",
        r"\bprp points?\b",
        r"how do i .*prp",
        r"help with (cv|resume|linkedin|interview)",
        r"how to (write|improve|format).*(cv|resume)",
        r"what is prp",
    ],

    # Bookings / scheduling coaching sessions
    "booking": [
        r"\bbook\b",
        r"\bschedule\b",
        r"one[- ]on[- ]one",
        r"\bcoaching\b",
        r"\bcoaching session\b",
        r"\bmock interview\b.*(book|schedule)",
    ],

    # Session notes / summaries
    "notes": [
        r"session notes",
        r"notes for",
        r"summarise my session",
        r"summarize my session",
        r"write my notes",
        r"action items",
        r"session summary",
    ],

    # Follow-up advice / generic feedback after a session
    "feedback": [
        r"follow[- ]up advice",
        r"advice for next steps",
        r"what should i do next",
        r"how can i improve after this session",
        r"session feedback",
        r"rate this session",
    ],

    # Events: past, upcoming, attendance
    "events": [
        r"\bevents?\b",
        r"\bworkshops?\b",
        r"\bclinic\b",
        r"mock interview day",
        r"past events",
        r"upcoming events",
        r"event attendance",
    ],

    # Knowledge base: search over kb_chunks
    "kb_search": [
        r"\bresources?\b",
        r"\bmaterials?\b",
        r"\bslides?\b",
        r"\bnotes\b",
        r"workshop recording",
        r"tips for",
        r"guide for",
        r"where can i read more",
    ],

    # Profile / “who am I?”
    "profile": [
        r"who am i",
        r"my profile",
        r"my details",
        r"what is my email",
        r"what is my role",
        r"what do you know about me",
    ],

    # Coach availability (separate from booking)
    "availability": [
        r"available slots",
        r"availability",
        r"free times",
        r"what times are free",
        r"show me slots",
        r"when can i book",
    ],

}


def classify_intent_node(state: GraphState) -> GraphState:
    """
    Simple rule-based intent classifier.

    Looks at the latest user message and sets:
        state.intent = one of the INTENT_PATTERNS keys, or None

    If nothing matches, downstream routing will send to fallback.
    """
    if not state.messages:
        state.intent = None
        state.last_reply = "Say something to get started."
        return state

    # Prefer the latest user message in case assistant messages are present.
    text = ""
    for msg in reversed(state.messages):
        if getattr(msg, "type", "") == "human":
            text = str(getattr(msg, "content", "") or "")
            break
    if not text:
        text = str(getattr(state.messages[-1], "content", "") or "")

    text = text.lower().strip()
    normalized_text = re.sub(r"\s+", " ", text)

    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, normalized_text):
                state.intent = intent
                return state

    # Fallback keyword scoring for natural language prompts that do not fit regexes.
    keyword_hints: Dict[str, List[str]] = {
        "skill_gap": ["missing skill", "skill requirement", "skill requirements", "gap"],
        "roadmap": ["career path", "plan", "timeline", "transition", "become", "steps"],
        "projects": ["project", "portfolio"],
        "resume": ["resume", "cv", "ats"],
        "progress": ["progress", "weekly", "goal", "accomplishment"],
        "mentor_mode": ["mentor", "coaching advice", "guide me"],
        "profile": ["my profile", "my details", "who am i"],
        "booking": ["book", "schedule", "coaching session"],
        "availability": ["available slots", "availability", "free times"],
        "events": ["event", "workshop"],
        "kb_search": ["resources", "materials", "guide", "where can i read more"],
        "faq": ["how do i", "what is", "interview", "linkedin", "prp"],
    }

    best_intent = None
    best_score = 0
    for intent, hints in keyword_hints.items():
        score = sum(1 for hint in hints if hint in normalized_text)
        if score > best_score:
            best_score = score
            best_intent = intent

    if best_intent and best_score > 0:
        state.intent = best_intent
        return state

    # No pattern matched
    state.intent = None
    return state
