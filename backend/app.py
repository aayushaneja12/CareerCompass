from backend.graphstructure import build_graph
from backend.state import GraphState
from langchain_core.messages import HumanMessage  


def main():
    print("Mentra: PRP AI Agent backend. Type 'exit' to quit.\n")

    # Build graph once
    app = build_graph()

    # Initial state
    state = GraphState(
        messages=[],
        last_reply=None,
        intent=None,
        conversation_id=None,
        user_id=None
    )

    while True:
        user_input = input("You: ")

        if user_input.strip().lower() == "exit":
            break

        # Append the user message in LangChain format
        state.messages.append(HumanMessage(content=user_input))

        # Run graph
        out = app.invoke(state)

        # Reconstruct new state
        state = GraphState(**out)

        # Print the assistant reply
        reply = state.last_reply or "(no reply)"
        print("\nMentra:", reply, "\n")


if __name__ == "__main__":
    main()
