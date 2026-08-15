"""
graph.py
--------
The "brain" of MeraDost, built with LangGraph.

Design (kept simple on purpose, no external DB):
- One StateGraph with a single conditional entry point that routes to a
  node based on `mode` (chat / rag / research / interview / exam / assignment).
- Conversation memory is handled ENTIRELY by LangGraph's built-in
  MemorySaver checkpointer, keyed by `thread_id` = session_id.
  No Postgres / SQLite / external DB needed.
- RAG context and web-search context are fetched fresh each turn and
  injected only into the prompt sent to the LLM for that turn -- they are
  NOT saved into permanent chat history, to keep the memory light.
"""

import os
from typing import Annotated, TypedDict

from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver

from rag_utils import retrieve_context, has_documents

load_dotenv()


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.4,
    api_key=os.getenv("GROQ_API_KEY"),
)

tavily_search = None
if os.getenv("TAVILY_API_KEY"):
    tavily_search = TavilySearch(max_results=5)

 
class ChatState(TypedDict):
    messages: Annotated[list, add_messages]
    mode: str
    session_id: str
    extra: dict  


 
BASE_PERSONA = (
    "You are MeraDost ('My Friend' in Hindi), a warm, encouraging AI study "
    "companion for Indian college students. Be clear, concise, and use "
    "simple language. Use markdown (headings, bullet points, code blocks) "
    "where it helps readability."
)

PROMPTS = {
    "chat": BASE_PERSONA + "\nHelp the student with whatever they ask.",
    "interview": BASE_PERSONA + (
        "\nYou are conducting a MOCK INTERVIEW for the role: {role}. "
        "Ask ONE question at a time, wait for the student's answer, then give "
        "short constructive feedback (what was good, what to improve) before "
        "asking the next question. Mix technical and HR-style questions. "
        "Keep the tone supportive but realistic."
    ),
    "exam": BASE_PERSONA + (
        "\nYou are an EXAM PREP COACH for the subject/topic: {topic}. "
        "If the student asks for questions, generate exam-style questions "
        "(mix of short answer and long answer) with difficulty: {difficulty}. "
        "If the student answers a question, evaluate it, give a score out of "
        "10, and explain what's missing. If asked, provide model answers."
    ),
    "assignment": BASE_PERSONA + (
        "\nYou are an ASSIGNMENT HELPER for the topic: {topic}. "
        "Help the student complete their assignment: explain concepts, write "
        "code/solutions with comments, and structure long answers clearly. "
        "Encourage the student to understand the material, not just copy."
    ),
}


def _system_for(mode: str, extra: dict) -> str:
    extra = extra or {}
    template = PROMPTS.get(mode, PROMPTS["chat"])
    try:
        return template.format(
            role=extra.get("role", "Software Engineer"),
            topic=extra.get("topic", "General"),
            difficulty=extra.get("difficulty", "medium"),
        )
    except KeyError:
        return template


def _last_human_text(messages) -> str:
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            return m.content
    return ""
 
def chat_node(state: ChatState):
    system = SystemMessage(content=_system_for("chat", state.get("extra")))
    response = llm.invoke([system, *state["messages"]])
    return {"messages": [response]}


def rag_node(state: ChatState):
    session_id = state["session_id"]
    query = _last_human_text(state["messages"])

    if not has_documents(session_id):
        response = AIMessage(
            content=(
                "You haven't uploaded any documents yet in this session. "
                "Please upload a PDF/DOCX/TXT file first, then ask me "
                "questions about it! 📄"
            )
        )
        return {"messages": [response]}

    context = retrieve_context(session_id, query, k=4)
    system = SystemMessage(
        content=(
            BASE_PERSONA
            + "\nAnswer the student's question using ONLY the context below "
            "from their uploaded document(s). If the answer isn't in the "
            "context, say so honestly instead of guessing.\n\n"
            f"--- CONTEXT ---\n{context}\n--- END CONTEXT ---"
        )
    )
    response = llm.invoke([system, *state["messages"]])
    return {"messages": [response]}


def research_node(state: ChatState):
    query = _last_human_text(state["messages"])

    if tavily_search is None:
        response = AIMessage(
            content=(
                "Research mode needs a TAVILY_API_KEY set in the backend "
                "`.env` file. Get a free key at https://tavily.com and add "
                "it, then restart the server."
            )
        )
        return {"messages": [response]}

    try:
        raw = tavily_search.invoke({"query": query})
        results = raw.get("results", []) if isinstance(raw, dict) else []
    except Exception as e:  # noqa: BLE001
        results = []
        error_note = f"(web search failed: {e})"
    else:
        error_note = ""

    formatted = []
    for r in results:
        url = r.get("url", "")
        content = r.get("content", "")
        formatted.append(f"Source: {url}\n{content}")
    web_context = "\n\n".join(formatted) if formatted else "No search results found."

    system = SystemMessage(
        content=(
            BASE_PERSONA
            + "\nYou are a RESEARCH AGENT. Use the web search results below to "
            "give the student an accurate, well-organized answer. Cite sources "
            "using the URLs given, and mention if information seems uncertain. "
            f"{error_note}\n\n--- WEB SEARCH RESULTS ---\n{web_context}\n--- END RESULTS ---"
        )
    )
    response = llm.invoke([system, *state["messages"]])
    return {"messages": [response]}


def interview_node(state: ChatState):
    system = SystemMessage(content=_system_for("interview", state.get("extra")))
    response = llm.invoke([system, *state["messages"]])
    return {"messages": [response]}


def exam_node(state: ChatState):
    system = SystemMessage(content=_system_for("exam", state.get("extra")))
    response = llm.invoke([system, *state["messages"]])
    return {"messages": [response]}


def assignment_node(state: ChatState):
    system = SystemMessage(content=_system_for("assignment", state.get("extra")))
    response = llm.invoke([system, *state["messages"]])
    return {"messages": [response]}


def route_mode(state: ChatState) -> str:
    mode = state.get("mode", "chat")
    if mode not in {"chat", "rag", "research", "interview", "exam", "assignment"}:
        return "chat"
    return mode
 
builder = StateGraph(ChatState)
builder.add_node("chat", chat_node)
builder.add_node("rag", rag_node)
builder.add_node("research", research_node)
builder.add_node("interview", interview_node)
builder.add_node("exam", exam_node)
builder.add_node("assignment", assignment_node)

builder.add_conditional_edges(
    START,
    route_mode,
    {
        "chat": "chat",
        "rag": "rag",
        "research": "research",
        "interview": "interview",
        "exam": "exam",
        "assignment": "assignment",
    },
)

for node in ["chat", "rag", "research", "interview", "exam", "assignment"]:
    builder.add_edge(node, END)

 
memory = MemorySaver()
graph = builder.compile(checkpointer=memory)


def run_turn(session_id: str, mode: str, user_text: str, extra: dict | None = None) -> str:
    """Convenience wrapper used by the FastAPI endpoint."""
    config = {"configurable": {"thread_id": session_id}}
    result = graph.invoke(
        {
            "messages": [HumanMessage(content=user_text)],
            "mode": mode,
            "session_id": session_id,
            "extra": extra or {},
        },
        config=config,
    )
    return result["messages"][-1].content
