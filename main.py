"""
main.py — PDF Intelligence Platform FastAPI Backend
Complete backend with:
  - CORS for React frontend (localhost:5173)
  - JWT Authentication (/auth/register, /auth/login, /auth/me)
  - PDF Upload + PyMuPDF processing + FAISS vector indexing
  - Mini RAG Pipeline with Gemini AI (/chat/)
  - Document management endpoints
"""
import os
import shutil
from uuid import uuid4
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Depends, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

# Custom modules
from database import init_db, get_db
from pdf_processor import extract_pdf_data
from vector_store import VectorStore
from crud import (
    create_document_record, get_all_documents, get_document_by_id,
    delete_document_record, get_document_chunks,
    get_user_by_email, get_user_by_username, create_user,
)
from auth import (
    verify_password, get_password_hash,
    create_access_token, get_current_user_required, get_current_user_optional,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

# Groq AI (via requests — no extra package needed)
import requests as http_requests

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PDF Intelligence Platform API",
    description="FastAPI backend with RAG pipeline, JWT auth, FAISS semantic search, and Gemini AI.",
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# CORS — Allow React dev server and production build
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternative dev port
        "http://localhost:3001",   # Current Vite dev server port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Groq AI Setup
# ---------------------------------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if GROQ_API_KEY:
    print("[INFO] Groq AI enabled with llama-3.3-70b-versatile model.")
else:
    print("[WARNING] GROQ_API_KEY not set. Chat will use fallback mode.")

# ---------------------------------------------------------------------------
# Initialize DB + Vector Store
# ---------------------------------------------------------------------------
init_db()
vstore = VectorStore()
vstore.load_index()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ===========================================================================
# Pydantic Request/Response Models
# ===========================================================================

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    question: str
    document_id: int | None = None


# ===========================================================================
# AUTH ROUTES
# ===========================================================================

@app.post("/auth/register", summary="Register a new user account")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Creates a new user account with a bcrypt-hashed password.
    Returns a JWT access token on success.
    """
    if get_user_by_email(req.email, db=db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    if get_user_by_username(req.username, db=db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken.",
        )

    hashed = get_password_hash(req.password)
    user = create_user(
        username=req.username,
        email=req.email,
        hashed_password=hashed,
        db=db,
    )

    token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.username,
            "email": user.email,
        },
    }


@app.post("/auth/login", summary="Login and receive JWT token")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Validates credentials and returns a JWT access token.
    """
    user = get_user_by_email(req.email, db=db)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.username,
            "email": user.email,
        },
    }


@app.get("/auth/me", summary="Get current authenticated user info")
def get_me(current_user_email: str = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Returns the profile of the currently authenticated user."""
    user = get_user_by_email(current_user_email, db=db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "id": user.id,
        "username": user.username,
        "name": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ===========================================================================
# PDF UPLOAD & PROCESSING
# ===========================================================================

@app.post("/upload-pdf/", summary="Upload, process, and index a PDF document")
def upload_pdf(
    file: UploadFile = File(...),
    current_user_email: str = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Full pipeline (runs in worker threadpool):
    1. Sanitize filename to prevent Path Traversal
    2. Save uploaded PDF to disk
    3. Extract text, images, and tables via PyMuPDF
    4. Chunk text with exact page numbers and generate FAISS vector embeddings
    5. Persist metadata and chunks to database
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # A. Sanitize filename using basename + UUID to prevent Path Traversal
    raw_basename = os.path.basename(file.filename)
    safe_filename = f"{uuid4().hex[:8]}_{raw_basename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # B. Extract data
    extracted = extract_pdf_data(file_path)
    meta = extracted["metadata"]
    meta["filename"] = raw_basename  # Preserve human readable name in metadata
    chunks_with_pages = extracted.get("chunks_with_pages") or extracted["text_chunks"]

    # C. Persist to database (link to authenticated user if logged in)
    db_record = create_document_record(
        filename=raw_basename,
        total_pages=meta["total_pages"],
        title=meta["title"],
        author=meta["author"],
        chunks=chunks_with_pages,
        user_email=current_user_email,
        db=db,
    )

    # D. Add chunks to FAISS index
    if chunks_with_pages:
        vstore.add_chunks(chunks_with_pages, doc_id=db_record.id)
        vstore.save_index()

    return {
        "status": "success",
        "document_id": db_record.id,
        "filename": raw_basename,
        "total_pages": meta["total_pages"],
        "text_chunks_count": len(chunks_with_pages),
        "embedded_images_count": len(extracted["embedded_images"]),
        "tables_found_count": len(extracted["tables"]),
        "tables_data": extracted["tables"],
    }


# ===========================================================================
# MINI RAG CHAT PIPELINE
# ===========================================================================

@app.post("/chat/", summary="Ask AI a question about a PDF document (RAG Pipeline)")
def chat_with_pdf(
    req: ChatRequest,
    current_user_email: str = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Mini RAG Pipeline (runs in worker threadpool):
    1. Receive user question + optional document_id
    2. Resolve allowed document IDs for multi-tenant isolation
    3. Retrieve top-5 relevant text chunks from FAISS index
    4. Send context to Gemini AI and return structured answer with page citations
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Multi-tenant isolation: resolve allowed doc IDs for the user
    allowed_doc_ids = None
    if current_user_email:
        user_docs = get_all_documents(user_email=current_user_email, db=db)
        allowed_doc_ids = {d["id"] for d in user_docs}

    # Step 1: Semantic search in FAISS with multi-tenant filtering
    search_results = vstore.search(
        query=req.question,
        top_k=5,
        doc_id=req.document_id,
        allowed_doc_ids=allowed_doc_ids,
    )

    # Step 2: Build context from retrieved chunks
    context_parts = []
    citations = []
    for i, result in enumerate(search_results):
        context_parts.append(f"[Source {i+1}, Page {result.get('page_hint', '?')}]:\n{result['text']}")
        if result.get("page_hint"):
            citations.append({
                "page": result["page_hint"],
                "snippet": result["text"][:120] + "..." if len(result["text"]) > 120 else result["text"],
                "score": round(result["score"], 4),
            })

    context = "\n\n".join(context_parts) if context_parts else "No relevant document context found."

    # Step 3: Generate answer with Groq AI
    if GROQ_API_KEY:
        prompt = f"""You are an expert PDF document analyst assistant. Answer the user's question using ONLY the provided document context below. Be precise, cite page numbers when available, and format your response clearly.

=== DOCUMENT CONTEXT ===
{context}

=== USER QUESTION ===
{req.question}

=== INSTRUCTIONS ===
- Answer based strictly on the document context provided
- If the context doesn't contain enough information, say so clearly
- Reference page numbers in your answer when citing information
- Format key data as bullet points or tables when appropriate
- Be concise but comprehensive

=== ANSWER ==="""

        try:
            groq_response = http_requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 1024,
                    "temperature": 0.3,
                },
                timeout=30,
            )
            groq_response.raise_for_status()
            answer_text = groq_response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            answer_text = f"AI generation error: {str(e)}. Context retrieved: {context[:500]}..."
    else:
        # Fallback when no Gemini API key — return context directly
        if context_parts:
            answer_text = (
                f"**Note:** AI model not configured (no GEMINI_API_KEY set).\n\n"
                f"**Retrieved Document Context for:** \"{req.question}\"\n\n"
                + "\n\n".join(context_parts[:2])
            )
        else:
            answer_text = (
                "No relevant content found in the indexed documents. "
                "Please upload a PDF first, then ask your question."
            )

    return {
        "question": req.question,
        "answer": answer_text,
        "citations": citations,
        "chunks_retrieved": len(search_results),
        "document_id": req.document_id,
    }


# ===========================================================================
# SEMANTIC SEARCH
# ===========================================================================

@app.get("/search/", summary="Semantic search across indexed documents")
def semantic_search(
    query: str = Query(..., description="Natural language search query"),
    top_k: int = 5,
    current_user_email: str = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Searches FAISS index with multi-tenant filtering."""
    if not query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    allowed_doc_ids = None
    if current_user_email:
        user_docs = get_all_documents(user_email=current_user_email, db=db)
        allowed_doc_ids = {d["id"] for d in user_docs}

    results = vstore.search(query=query, top_k=top_k, allowed_doc_ids=allowed_doc_ids)
    return {
        "query": query,
        "results_count": len(results),
        "matches": results,
    }


# ===========================================================================
# DOCUMENT MANAGEMENT
# ===========================================================================

@app.get("/documents/", summary="List all documents for the authenticated user")
def list_documents(
    current_user_email: str = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Returns all uploaded documents. Filters by user if authenticated."""
    return get_all_documents(user_email=current_user_email, db=db)


@app.get("/documents/{doc_id}", summary="Get details for a specific document")
def get_document(doc_id: int, db: Session = Depends(get_db)):
    """Fetches document metadata and chunk count by ID."""
    doc = get_document_by_id(doc_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc


@app.delete("/documents/{doc_id}", summary="Permanently delete a document")
def delete_document(
    doc_id: int,
    current_user_email: str = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Deletes document record, purges vectors from FAISS, and removes disk files."""
    doc = get_document_by_id(doc_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if current_user_email and doc.get("user_id"):
        user = get_user_by_email(current_user_email, db=db)
        if user and doc["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this document.")

    deleted_doc = delete_document_record(doc_id, db=db)
    if deleted_doc:
        # Purge vector embeddings from FAISS
        vstore.delete_document_vectors(doc_id)

    return {"status": "deleted", "document_id": doc_id}


# ===========================================================================
# Health Check
# ===========================================================================

@app.get("/", summary="API root")
def root():
    return {
        "name": "PDF Intelligence Platform API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": [
            "POST /auth/register",
            "POST /auth/login",
            "GET  /auth/me",
            "POST /upload-pdf/",
            "POST /chat/",
            "GET  /search/",
            "GET  /documents/",
            "GET  /documents/{doc_id}",
            "DELETE /documents/{doc_id}",
            "GET  /health",
        ],
    }


@app.get("/health", summary="API health check")
def health_check():
    return {
        "status": "ok",
        "groq_configured": bool(GROQ_API_KEY),
        "faiss_vectors": vstore.index.ntotal,
    }

# ===========================================================================
# AI GENERATION ENDPOINTS (Flashcards, Quiz, Notes, Glossary, Insights, Summary)
# ===========================================================================

class AIGenerationRequest(BaseModel):
    document_id: int
    num_items: int = 10  # for flashcards/quiz


def _get_doc_context(doc_id: int, db: Session, max_chunks: int = 8) -> str:
    """Helper: fetch top chunks from a document to build AI context."""
    chunks = get_document_chunks(doc_id, db=db)
    if not chunks:
        return ""
    selected = chunks[:max_chunks]
    return "\n\n".join([
        f"[Chunk {c.get('chunk_index', '?')}]: {c.get('chunk_text', '')[:1000]}"
        for c in selected
    ])


def _call_groq(prompt: str) -> str:
    """Helper: call Groq API and return text."""
    if not GROQ_API_KEY:
        return "AI not configured. Please set GROQ_API_KEY."
    try:
        resp = http_requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 2048,
                "temperature": 0.4,
            },
            timeout=45,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"AI generation error: {str(e)}"


@app.post("/ai/summary", summary="Generate real AI summary for a document")
def generate_summary(req: AIGenerationRequest, db: Session = Depends(get_db)):
    doc = get_document_by_id(req.document_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    context = _get_doc_context(req.document_id, db=db)
    if not context:
        raise HTTPException(status_code=400, detail="Document has no indexed content.")
    prompt = f"""You are an expert document analyst. Provide a comprehensive summary of this document.

DOCUMENT CONTENT:
{context}

Provide:
1. Executive Summary (2-3 sentences)
2. Key Topics (bullet list)
3. Main Conclusions
4. Target Audience

Format with clear headings."""
    summary = _call_groq(prompt)
    return {"document_id": req.document_id, "summary": summary, "document_name": doc.get("filename", "")}


@app.post("/ai/flashcards", summary="Generate flashcards from a document")
def generate_flashcards(req: AIGenerationRequest, db: Session = Depends(get_db)):
    doc = get_document_by_id(req.document_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    context = _get_doc_context(req.document_id, db=db)
    if not context:
        raise HTTPException(status_code=400, detail="Document has no indexed content.")
    num = min(req.num_items, 20)
    prompt = f"""Generate exactly {num} flashcards from this document for studying.

DOCUMENT:
{context}

Return a JSON array ONLY (no markdown, no explanation) in this exact format:
[
  {{"front": "Question or term here", "back": "Answer or definition here"}},
  ...
]"""
    raw = _call_groq(prompt)
    import json, re
    try:
        # Extract JSON array from response
        match = re.search(r'\[.*\]', raw, re.DOTALL)
        cards = json.loads(match.group(0)) if match else []
    except Exception:
        cards = [{"front": "Error parsing flashcards", "back": raw[:200]}]
    return {"document_id": req.document_id, "flashcards": cards, "count": len(cards)}


@app.post("/ai/quiz", summary="Generate a quiz from a document")
def generate_quiz(req: AIGenerationRequest, db: Session = Depends(get_db)):
    doc = get_document_by_id(req.document_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    context = _get_doc_context(req.document_id, db=db)
    if not context:
        raise HTTPException(status_code=400, detail="Document has no indexed content.")
    num = min(req.num_items, 15)
    prompt = f"""Generate exactly {num} multiple-choice quiz questions from this document.

DOCUMENT:
{context}

Return a JSON array ONLY (no markdown, no explanation):
[
  {{
    "question": "Question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct": "A",
    "explanation": "Brief explanation why"
  }},
  ...
]"""
    raw = _call_groq(prompt)
    import json, re
    try:
        match = re.search(r'\[.*\]', raw, re.DOTALL)
        questions = json.loads(match.group(0)) if match else []
    except Exception:
        questions = []
    return {"document_id": req.document_id, "questions": questions, "count": len(questions)}


@app.post("/ai/revision-notes", summary="Generate revision notes from a document")
def generate_revision_notes(req: AIGenerationRequest, db: Session = Depends(get_db)):
    doc = get_document_by_id(req.document_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    context = _get_doc_context(req.document_id, db=db)
    if not context:
        raise HTTPException(status_code=400, detail="Document has no indexed content.")
    prompt = f"""Create comprehensive revision notes for this document. Format as structured notes a student would use.

DOCUMENT:
{context}

Include:
- Key concepts with definitions
- Important facts and figures
- Relationships between concepts
- Memorable mnemonics where applicable

Use clear headings (##), bullet points, and bold for key terms."""
    notes = _call_groq(prompt)
    return {"document_id": req.document_id, "notes": notes}


@app.post("/ai/glossary", summary="Generate a glossary of terms from a document")
def generate_glossary(req: AIGenerationRequest, db: Session = Depends(get_db)):
    doc = get_document_by_id(req.document_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    context = _get_doc_context(req.document_id, db=db)
    if not context:
        raise HTTPException(status_code=400, detail="Document has no indexed content.")
    prompt = f"""Extract all important terms, concepts, and acronyms from this document and provide clear definitions.

DOCUMENT:
{context}

Return a JSON array ONLY (no markdown, no explanation):
[
  {{"term": "Term name", "definition": "Clear definition", "category": "technical|general|acronym"}},
  ...
]
Sort alphabetically by term."""
    raw = _call_groq(prompt)
    import json, re
    try:
        match = re.search(r'\[.*\]', raw, re.DOTALL)
        terms = json.loads(match.group(0)) if match else []
    except Exception:
        terms = []
    return {"document_id": req.document_id, "glossary": terms, "count": len(terms)}


@app.post("/ai/insights", summary="Generate AI insights and analysis for a document")
def generate_insights(req: AIGenerationRequest, db: Session = Depends(get_db)):
    doc = get_document_by_id(req.document_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    context = _get_doc_context(req.document_id, db=db)
    if not context:
        raise HTTPException(status_code=400, detail="Document has no indexed content.")
    prompt = f"""Provide deep AI insights and analysis for this document.

DOCUMENT:
{context}

Return a JSON object ONLY (no markdown):
{{
  "key_themes": ["theme1", "theme2", "theme3"],
  "sentiment": "positive|neutral|negative|mixed",
  "complexity": "beginner|intermediate|advanced|expert",
  "document_type": "research|report|manual|legal|financial|educational|other",
  "key_statistics": ["stat1", "stat2"],
  "action_items": ["action1", "action2"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "overall_summary": "2-3 sentence overall assessment"
}}"""
    raw = _call_groq(prompt)
    import json, re
    try:
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        insights = json.loads(match.group(0)) if match else {}
    except Exception:
        insights = {"overall_summary": raw[:500]}
    return {"document_id": req.document_id, "insights": insights}


@app.post("/ai/compare", summary="Compare two PDF documents using AI")
def compare_documents(document_id_1: int, document_id_2: int, db: Session = Depends(get_db)):
    doc1 = get_document_by_id(document_id_1, db=db)
    doc2 = get_document_by_id(document_id_2, db=db)
    if not doc1 or not doc2:
        raise HTTPException(status_code=404, detail="One or both documents not found.")
    ctx1 = _get_doc_context(document_id_1, db=db, max_chunks=5)
    ctx2 = _get_doc_context(document_id_2, db=db, max_chunks=5)
    prompt = f"""Compare these two documents thoroughly.

DOCUMENT 1 ({doc1.get('filename','Doc 1')}):
{ctx1}

DOCUMENT 2 ({doc2.get('filename','Doc 2')}):
{ctx2}

Provide:
## Similarities
- Key common themes and content

## Differences
- How they differ in content, scope, depth

## Document 1 Strengths
- What Doc 1 covers better

## Document 2 Strengths
- What Doc 2 covers better

## Recommendation
- Which to read first, or which is more comprehensive for what purpose"""
    comparison = _call_groq(prompt)
    return {
        "document_1": {"id": document_id_1, "name": doc1.get("filename", "")},
        "document_2": {"id": document_id_2, "name": doc2.get("filename", "")},
        "comparison": comparison,
    }


@app.get("/documents/{doc_id}/download", summary="Download original PDF file")
def download_pdf(doc_id: int, db: Session = Depends(get_db)):
    """Serves the original uploaded PDF file for download."""
    from fastapi.responses import FileResponse
    doc = get_document_by_id(doc_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    filename = doc.get("filename", "document.pdf")
    # Search uploads folder for this file
    for fname in os.listdir(UPLOAD_DIR):
        if filename in fname:  # UUID prefix + original name
            fpath = os.path.join(UPLOAD_DIR, fname)
            return FileResponse(fpath, media_type="application/pdf", filename=filename)
    raise HTTPException(status_code=404, detail="PDF file not found on disk.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)