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
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Custom modules
from database import init_db
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

# Gemini AI
from google import genai

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
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Gemini AI Setup
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None
    print("[WARNING] GEMINI_API_KEY not set. Chat will use fallback mode.")

# ---------------------------------------------------------------------------
# Initialize DB + Vector Store
# ---------------------------------------------------------------------------
init_db()
vstore = VectorStore()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ===========================================================================
# Pydantic Request/Response Models
# ===========================================================================

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


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
def register(req: RegisterRequest):
    """
    Creates a new user account with a bcrypt-hashed password.
    Returns a JWT access token on success.
    """
    # Check if email already registered
    if get_user_by_email(req.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    # Check if username taken
    if get_user_by_username(req.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken.",
        )

    hashed = get_password_hash(req.password)
    user = create_user(
        username=req.username,
        email=req.email,
        hashed_password=hashed,
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
            "email": user.email,
        },
    }


@app.post("/auth/login", summary="Login and receive JWT token")
def login(req: LoginRequest):
    """
    Validates credentials and returns a JWT access token.
    """
    user = get_user_by_email(req.email)
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
            "email": user.email,
        },
    }


@app.get("/auth/me", summary="Get current authenticated user info")
def get_me(current_user_email: str = Depends(get_current_user_required)):
    """Returns the profile of the currently authenticated user."""
    user = get_user_by_email(current_user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ===========================================================================
# PDF UPLOAD & PROCESSING
# ===========================================================================

@app.post("/upload-pdf/", summary="Upload, process, and index a PDF document")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user_email: str = Depends(get_current_user_optional),
):
    """
    Full pipeline:
    1. Save uploaded PDF to disk
    2. Extract text, images, and tables via PyMuPDF
    3. Chunk text and generate FAISS vector embeddings (Sentence Transformers)
    4. Persist metadata and chunks to SQLite database
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # A. Save PDF to disk
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # B. Extract data
    extracted = extract_pdf_data(file_path)
    meta = extracted["metadata"]
    chunks = extracted["text_chunks"]

    # C. Persist to database (link to authenticated user if logged in)
    db_record = create_document_record(
        filename=meta["filename"],
        total_pages=meta["total_pages"],
        title=meta["title"],
        author=meta["author"],
        chunks=chunks,
        user_email=current_user_email,
    )

    # D. Add chunks to FAISS index
    if chunks:
        vstore.add_chunks(chunks, doc_id=db_record.id)
        vstore.save_index()

    return {
        "status": "success",
        "document_id": db_record.id,
        "filename": meta["filename"],
        "total_pages": meta["total_pages"],
        "text_chunks_count": len(chunks),
        "embedded_images_count": len(extracted["embedded_images"]),
        "tables_found_count": len(extracted["tables"]),
        "tables_data": extracted["tables"],
    }


# ===========================================================================
# MINI RAG CHAT PIPELINE
# ===========================================================================

@app.post("/chat/", summary="Ask AI a question about a PDF document (RAG Pipeline)")
async def chat_with_pdf(req: ChatRequest):
    """
    Mini RAG Pipeline:
    1. Receive user question + optional document_id
    2. Retrieve top-5 relevant text chunks from FAISS index
    3. Build context-aware prompt with retrieved chunks
    4. Send to Gemini AI and return structured answer with page citations
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Step 1: Semantic search in FAISS
    search_results = vstore.search(query=req.question, top_k=5, doc_id=req.document_id)

    # Step 2: Build context from retrieved chunks
    context_parts = []
    citations = []
    for i, result in enumerate(search_results):
        context_parts.append(f"[Source {i+1}, Page ~{result.get('page_hint', '?')}]:\n{result['text']}")
        if result.get("page_hint"):
            citations.append({
                "page": result["page_hint"],
                "snippet": result["text"][:120] + "..." if len(result["text"]) > 120 else result["text"],
                "score": round(result["score"], 4),
            })

    context = "\n\n".join(context_parts) if context_parts else "No relevant document context found."

    # Step 3: Generate answer with Gemini AI
    if gemini_client and GEMINI_API_KEY:
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
            response = gemini_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            answer_text = response.text
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

@app.get("/search/", summary="Semantic search across all indexed documents")
def semantic_search(
    query: str = Query(..., description="Natural language search query"),
    top_k: int = 5,
):
    """Searches FAISS index and returns top matching text chunks."""
    if not query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    results = vstore.search(query=query, top_k=top_k)
    return {
        "query": query,
        "results_count": len(results),
        "matches": results,
    }


# ===========================================================================
# DOCUMENT MANAGEMENT
# ===========================================================================

@app.get("/documents/", summary="List all documents for the authenticated user")
def list_documents(current_user_email: str = Depends(get_current_user_optional)):
    """Returns all uploaded documents. Filters by user if authenticated."""
    return get_all_documents(user_email=current_user_email)


@app.get("/documents/{doc_id}", summary="Get details for a specific document")
def get_document(doc_id: int):
    """Fetches document metadata and chunk count by ID."""
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc


@app.delete("/documents/{doc_id}", summary="Permanently delete a document")
def delete_document(doc_id: int):
    """Deletes document record, all associated chunks, and removes from FAISS."""
    success = delete_document_record(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found.")
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
        "gemini_configured": bool(GEMINI_API_KEY),
        "faiss_vectors": vstore.index.ntotal,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)