"""
main.py
-------
FastAPI server exposing MeraDost's backend:

  POST /api/chat     -> send a message in a given mode, get AI reply
  POST /api/upload    -> upload a document for RAG (per session_id)
  GET  /api/files/{session_id} -> list uploaded files for a session
  GET  /api/health    -> health check

"""

import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from graph import run_turn
from rag_utils import add_document_to_session, list_files

load_dotenv()

app = FastAPI(title="MeraDost API")

origins = os.getenv("FRONTEND_ORIGIN", "https://mera-dost-student-ai-friend.vercel.app/").split(",")   # after deployment, set FRONTEND_ORIGIN to your frontend's URL in .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    session_id: str
    mode: str = "chat"   
    message: str
    topic: Optional[str] = None
    role: Optional[str] = None
    difficulty: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    extra = {"topic": req.topic, "role": req.role, "difficulty": req.difficulty}
    try:
        reply = run_turn(req.session_id, req.mode, req.message, extra)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))
    return ChatResponse(reply=reply)


@app.post("/api/upload")
async def upload(session_id: str = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    try:
        chunks = add_document_to_session(session_id, file.filename, contents)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Could not process file: {e}")

    if chunks == 0:
        raise HTTPException(status_code=400, detail="No readable text found in file")

    return {
        "filename": file.filename,
        "chunks_added": chunks,
        "files": list_files(session_id),
    }


@app.get("/api/files/{session_id}")
def get_files(session_id: str):
    return {"files": list_files(session_id)}
