"""
rag_utils.py
------------
Everything related to Retrieval Augmented Generation (RAG) lives here.
"""

import os
import tempfile
from typing import Dict, List

from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
load_dotenv()  
 
_embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)

 
SESSION_STORES: Dict[str, FAISS] = {}

 
SESSION_FILES: Dict[str, List[str]] = {}

SPLITTER = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)


def _load_file(path: str, filename: str):
    """Pick the right LangChain loader based on file extension."""
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        return PyPDFLoader(path).load()
    if ext in ("docx",):
        return Docx2txtLoader(path).load()
    # default: treat as plain text (.txt, .md, etc.)
    return TextLoader(path, encoding="utf-8").load()


def add_document_to_session(session_id: str, filename: str, file_bytes: bytes) -> int:
    """
    Saves the uploaded file to a temp path, loads + chunks it, embeds the
    chunks, and adds them to (or creates) the session's FAISS index.

    Returns the number of chunks added.
    """
    suffix = "." + filename.split(".")[-1] if "." in filename else ".txt"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        docs = _load_file(tmp_path, filename)
    finally:
        os.remove(tmp_path)

    for d in docs:
        d.metadata["source"] = filename

    chunks = SPLITTER.split_documents(docs)
    if not chunks:
        return 0

    if session_id in SESSION_STORES:
        SESSION_STORES[session_id].add_documents(chunks)
    else:
        SESSION_STORES[session_id] = FAISS.from_documents(chunks, _embeddings)

    SESSION_FILES.setdefault(session_id, []).append(filename)
    return len(chunks)


def retrieve_context(session_id: str, query: str, k: int = 4) -> str:
    """Returns a formatted string of the top-k most relevant chunks, or '' if none."""
    store = SESSION_STORES.get(session_id)
    if store is None:
        return ""
    results = store.similarity_search(query, k=k)
    if not results:
        return ""
    parts = []
    for i, doc in enumerate(results, start=1):
        src = doc.metadata.get("source", "document")
        parts.append(f"[Chunk {i} - {src}]\n{doc.page_content}")
    return "\n\n".join(parts)


def has_documents(session_id: str) -> bool:
    return session_id in SESSION_STORES


def list_files(session_id: str) -> List[str]:
    return SESSION_FILES.get(session_id, [])
