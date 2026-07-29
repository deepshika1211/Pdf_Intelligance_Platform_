"""
crud.py — Database CRUD Operations
All database read/write operations for Users and Documents.
"""
from database import SessionLocal
from models import Document, DocumentChunk, User


# ---------------------------------------------------------------------------
# User CRUD
# ---------------------------------------------------------------------------

def get_user_by_email(email: str):
    """Fetches a User record by email address."""
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def get_user_by_username(username: str):
    """Fetches a User record by username."""
    db = SessionLocal()
    try:
        return db.query(User).filter(User.username == username).first()
    finally:
        db.close()


def create_user(username: str, email: str, hashed_password: str):
    """Creates and persists a new User record with a bcrypt-hashed password."""
    db = SessionLocal()
    try:
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f" New user created: {email} (id={user.id})")
        return user
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Document CRUD
# ---------------------------------------------------------------------------

def create_document_record(filename: str, total_pages: int, title: str = None,
                            author: str = None, chunks: list[str] = None,
                            user_email: str = None):
    """Creates a Document record + linked DocumentChunks. Optionally links to a User."""
    db = SessionLocal()
    try:
        # Resolve user_id from email if provided
        user_id = None
        if user_email:
            user = db.query(User).filter(User.email == user_email).first()
            if user:
                user_id = user.id

        doc = Document(
            filename=filename,
            total_pages=total_pages,
            title=title,
            author=author,
            user_id=user_id,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Save text chunks linked to this document
        if chunks:
            for idx, chunk_text in enumerate(chunks):
                chunk_record = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=idx,
                    chunk_text=chunk_text,
                )
                db.add(chunk_record)
            db.commit()

        print(f" Document saved with ID: {doc.id} ({len(chunks or [])} chunks linked)")
        return doc
    finally:
        db.close()


def get_all_documents(user_email: str = None):
    """Returns all documents, optionally filtered by owner email."""
    db = SessionLocal()
    try:
        query = db.query(Document)
        if user_email:
            user = db.query(User).filter(User.email == user_email).first()
            if user:
                query = query.filter(Document.user_id == user.id)
        docs = query.order_by(Document.upload_time.desc()).all()
        return [
            {
                "id": d.id,
                "filename": d.filename,
                "total_pages": d.total_pages,
                "title": d.title,
                "author": d.author,
                "upload_time": d.upload_time.isoformat() if d.upload_time else None,
                "user_id": d.user_id,
            }
            for d in docs
        ]
    finally:
        db.close()


def get_document_by_id(doc_id: int):
    """Fetches a single Document by its primary key."""
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return None
        return {
            "id": doc.id,
            "filename": doc.filename,
            "total_pages": doc.total_pages,
            "title": doc.title,
            "author": doc.author,
            "upload_time": doc.upload_time.isoformat() if doc.upload_time else None,
            "chunks_count": len(doc.chunks),
        }
    finally:
        db.close()


def get_document_chunks(doc_id: int):
    """Returns all text chunks for a given document, ordered by index."""
    db = SessionLocal()
    try:
        chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == doc_id)
            .order_by(DocumentChunk.chunk_index)
            .all()
        )
        return [{"chunk_index": c.chunk_index, "chunk_text": c.chunk_text} for c in chunks]
    finally:
        db.close()


def delete_document_record(doc_id: int) -> bool:
    """Deletes a document and all its associated chunks (cascade)."""
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            db.delete(doc)
            db.commit()
            print(f" Document ID {doc_id} deleted successfully.")
            return True
        return False
    finally:
        db.close()