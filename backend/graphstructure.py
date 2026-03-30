from langgraph.graph import StateGraph, END
from .state import GraphState

# Intent classifier
from .intent import classify_intent_node

# Tool nodes
from .tools.faq import faq_node
from .tools.bookings import booking_node
from .tools.notes import notes_node
from .tools.follow_up_advice import feedback_node
from .tools.events import event_info_node
from .tools.kb_search import kb_search_node
from .tools.profile import profile_node
from .tools.coach_availability import coach_availability_node
from .tools.fallback import fallback_node
from .tools.conversationlog import conversation_log_node
from .tools.conversation_title import conversation_title_node

# Career guidance tools
from .tools.career_tools import (
    skill_gap_node,
    career_roadmap_node,
    resume_analyzer_node,
    project_generator_node,
    profile_management_node,
    mentor_mode_node,
    progress_tracking_node,
)

# LLM Response pipeline
from .tools.respond import response_node
from .tools.rewrite import rewrite_node


def build_graph():
    workflow = StateGraph(GraphState)

    # -----------------------------------------
    # 1) Register ALL nodes
    # -----------------------------------------
    workflow.add_node("classify_intent", classify_intent_node)

    workflow.add_node("faq_node", faq_node)
    workflow.add_node("booking_node", booking_node)
    workflow.add_node("notes_node", notes_node)
    workflow.add_node("feedback_node", feedback_node)
    workflow.add_node("event_info_node", event_info_node)
    workflow.add_node("kb_search_node", kb_search_node)
    workflow.add_node("profile_node", profile_node)
    workflow.add_node("coach_availability_node", coach_availability_node)
    workflow.add_node("fallback_node", fallback_node)

    # Career guidance nodes
    workflow.add_node("skill_gap_node", skill_gap_node)
    workflow.add_node("career_roadmap_node", career_roadmap_node)
    workflow.add_node("resume_analyzer_node", resume_analyzer_node)
    workflow.add_node("project_generator_node", project_generator_node)
    workflow.add_node("profile_management_node", profile_management_node)
    workflow.add_node("mentor_mode_node", mentor_mode_node)
    workflow.add_node("progress_tracking_node", progress_tracking_node)

    workflow.add_node("response_node", response_node)
    workflow.add_node("rewrite_node", rewrite_node)

    workflow.add_node("conversation_log_node", conversation_log_node)
    workflow.add_node("conversation_title_node", conversation_title_node)

    # -----------------------------------------
    # 2) Entry point
    # -----------------------------------------
    workflow.set_entry_point("classify_intent")

    # -----------------------------------------
    # 3) Intent routing
    # -----------------------------------------
    def router(state: GraphState) -> str:
        if state.intent is None:
            return "fallback_node"

        return {
            "faq": "faq_node",
            "booking": "booking_node",
            "notes": "notes_node",
            "feedback": "feedback_node",
            "events": "event_info_node",
            "kb_search": "kb_search_node",
            "profile": "profile_node",
            "availability": "coach_availability_node",
            # Career copilot intents
            "skill_gap": "skill_gap_node",
            "roadmap": "career_roadmap_node",
            "resume": "resume_analyzer_node",
            "projects": "project_generator_node",
            "mentor_mode": "mentor_mode_node",
            "progress": "progress_tracking_node",
        }.get(state.intent, "fallback_node")

    workflow.add_conditional_edges(
        "classify_intent",
        router,
        {
            "faq_node": "faq_node",
            "booking_node": "booking_node",
            "notes_node": "notes_node",
            "feedback_node": "feedback_node",
            "event_info_node": "event_info_node",
            "kb_search_node": "kb_search_node",
            "profile_node": "profile_node",
            "coach_availability_node": "coach_availability_node",
            "skill_gap_node": "skill_gap_node",
            "career_roadmap_node": "career_roadmap_node",
            "resume_analyzer_node": "resume_analyzer_node",
            "project_generator_node": "project_generator_node",
            "profile_management_node": "profile_management_node",
            "mentor_mode_node": "mentor_mode_node",
            "progress_tracking_node": "progress_tracking_node",
            "fallback_node": "fallback_node",
        }
    )

    # -----------------------------------------
    # 4) All tool nodes → response
    # -----------------------------------------
    main_tool_nodes = [
        "faq_node",
        "booking_node",
        "notes_node",
        "feedback_node",
        "event_info_node",
        "kb_search_node",
        "profile_node",
        "coach_availability_node",
        "skill_gap_node",
        "career_roadmap_node",
        "resume_analyzer_node",
        "project_generator_node",
        "profile_management_node",
        "mentor_mode_node",
        "progress_tracking_node",
        "fallback_node",
    ]

    for node in main_tool_nodes:
        workflow.add_edge(node, "response_node")

    # -----------------------------------------
    # 5) Rewrite → Log → Title → END
    # -----------------------------------------
    workflow.add_edge("response_node", "rewrite_node")
    workflow.add_edge("rewrite_node", "conversation_log_node")

    workflow.add_edge("conversation_log_node", "conversation_title_node")
    workflow.add_edge("conversation_title_node", END)

    return workflow.compile()

