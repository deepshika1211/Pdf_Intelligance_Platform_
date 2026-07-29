from fastapi import FastAPI, UploadFile, File, HTTPException, Query
import os
import shutil

# Import custom modules
from database import init_db
from pdf_processor import extract_pdf_data
from vector_store import VectorStore
from crud import create_document_record, get_all_documents, get_document_by_id, delete_document_record

app = FastAPI(
    title="PDF Intelligence Platform - API",
    description="Backend API for PDF text/image/table processing, database persistence, and FAISS semantic search.",
    version="1.0.0"
)

# 1. Initialize Database Tables
init_db()

# 2. Initialize Vector Store
vstore = VectorStore()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-pdf/", summary="Upload & Process PDF (FR-04, FR-16, FR-17)")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # A. Save uploaded PDF file to disk
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # B. Extract Data (Metadata, Text, Chunks, Tables, Images)
    extracted = extract_pdf_data(file_path)
    meta = extracted["metadata"]
    chunks = extracted["text_chunks"]

    # C. Save Metadata & Text Chunks to Database
    db_record = create_document_record(
        filename=meta["filename"],
        total_pages=meta["total_pages"],
        title=meta["title"],
        author=meta["author"],
        chunks=chunks
    )

    # D. Add Chunks to FAISS Vector Store for Semantic Search
    if chunks:
        vstore.add_chunks(chunks)
        vstore.save_index()

    return {
        "status": "success",
        "document_id": db_record.id,
        "filename": meta["filename"],
        "total_pages": meta["total_pages"],
        "text_chunks_count": len(chunks),
        "embedded_images_count": len(extracted["embedded_images"]),
        "tables_found_count": len(extracted["tables"]),
        "tables_data": extracted["tables"]
    }

@app.get("/search/", summary="Semantic Search in FAISS Index (FR-07)")
def semantic_search(query: str = Query(..., description="Natural language query to search"), top_k: int = 3):
    """
    FR-07: Generates query embedding and returns top matching text chunks from FAISS.
    """
    if not query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    results = vstore.search(query=query, top_k=top_k)
    return {
        "query": query,
        "results_count": len(results),
        "matches": results
    }

@app.get("/documents/", summary="List All Processed Documents")
def list_documents():
    return get_all_documents()

@app.get("/documents/{doc_id}", summary="Get Document Details")
def get_document(doc_id: int):
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@app.delete("/documents/{doc_id}", summary="Delete Document")
def delete_document(doc_id: int):
    success = delete_document_record(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"status": "deleted", "document_id": doc_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)