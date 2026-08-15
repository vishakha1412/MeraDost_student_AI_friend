# MeraDost 🎓 - Your AI Study Buddy

One place for a student's everything:
- 💬 General chat with an LLM
- 📄 RAG: upload PDF/DOCX/TXT and chat with your documents
- 🌐 Research Agent (Tavily web search)
- 🧑‍💼 Mock interview practice
- 📝 Exam prep (question generation + evaluation)
- ✍️ Assignment helper

**Stack**
- Frontend: React + Vite + TailwindCSS + Framer Motion
- Backend: Python + FastAPI + LangGraph + LangChain
- Memory: LangGraph's built-in `MemorySaver` (in-process, no external DB)
- RAG vector store: FAISS, held in memory per chat session (no Postgres/SQL needed)
- Embeddings: Google Gemini (`models/embedding-001`) via API - no torch/transformers, no local model download
- Chat LLM: Groq (`llama-3.3-70b-versatile`) - fast and has a generous free tier

No PyTorch, no `sentence-transformers`, no `transformers` anywhere in this
project - those pull in multi-GB CUDA packages and are a common source of
version conflicts. Everything here is a lightweight API call.

---

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# open .env and paste your GROQ_API_KEY, GOOGLE_API_KEY, and TAVILY_API_KEY

uvicorn main:app --reload --port 8000
```

The API will run at `http://localhost:8000`. Check `http://localhost:8000/api/health`.

**Getting API keys (all have free tiers)**
- Groq (chat LLM): https://console.groq.com/keys
- Google AI Studio (Gemini embeddings, for RAG): https://aistudio.google.com/apikey
- Tavily (web search, needed only for Research Agent mode): https://tavily.com

> No GROQ_API_KEY? Every mode will error since the chat LLM needs it.
> No GOOGLE_API_KEY? Chat/interview/exam/assignment/research still work; only RAG (document upload) mode will fail.
> No TAVILY_API_KEY? Everything still works EXCEPT Research Agent mode, which will tell the user to add a key.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

If your backend runs somewhere other than `localhost:8000`, create `frontend/.env`:

```
VITE_API_URL=http://your-backend-host:8000
```

---

## How it works (quick tour)

- `backend/graph.py` builds a single LangGraph `StateGraph` with one node per
  mode (chat / rag / research / interview / exam / assignment). A conditional
  edge from `START` routes each turn to the right node based on the `mode`
  field sent from the frontend.
- Conversation history is kept by LangGraph's `MemorySaver` checkpointer,
  keyed by `thread_id = session_id` (a UUID generated in the browser on load
  and kept in memory - no login, no database). Restarting the backend clears
  memory, which is fine for a project like this.
- `backend/rag_utils.py` handles document upload: it chunks the file, embeds
  chunks via the Gemini embeddings API, and stores them in an in-memory FAISS
  index per `session_id`. The `rag` mode retrieves the top-k relevant chunks
  for each question and feeds them to the LLM as context (not saved
  permanently, just used for that turn).
- `research` mode calls the Tavily search tool (`langchain-tavily`), feeds
  the results to the LLM, and asks it to answer with citations.
- The frontend (`frontend/src`) is a single-page app: a landing page, then a
  chat app with a sidebar for switching modes, uploading documents, and
  setting topic/role/difficulty for interview & exam modes.

## Notes / things to extend later
- Right now each browser tab gets a fresh `session_id` (lost on refresh) -
  add `localStorage` persistence if you want sessions to survive reloads.
- No user accounts / auth - add one later if you want multiple students to
  have separate, persistent histories.
- FAISS + MemorySaver are all in-process memory. For a real deployment with
  many users, you'd eventually want a persistent vector store and a
  LangGraph checkpointer backed by a database - but for a course project,
  this is intentionally kept simple.
