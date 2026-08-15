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
- RAG vector store: FAISS, held in memory per chat session (no external DB)
- Embeddings: Google Gemini (`gemini-embedding-001`) 
- Chat LLM: Groq (`llama-3.3-70b-versatile`)  
 

**Getting API keys (all have free tiers)**
- Groq (chat LLM): https://console.groq.com/keys
- Google AI Studio (Gemini embeddings, for RAG): https://aistudio.google.com/apikey
- Tavily (web search, needed only for Research Agent mode): https://tavily.com
 

##  FUTURE SCOPE 
- Right now each browser tab gets a fresh `session_id` (lost on refresh) -
  add `localStorage` persistence if you want sessions to survive reloads.
- AUTHENTICATION
- persistent vector store and a LangGraph checkpointer backed by a database 
- 
