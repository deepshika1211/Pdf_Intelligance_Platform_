"""
crud.py — Database CRUD Operations
All database read/write operations for Users and Documents.
Supports both FastAPI dependency injection (passing db: Session) and standalone calls.
"""
from typing import Optional
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Document, DocumentChunk, User


def _get_session(db: Optional[Session]) -> tuple[Session, bool]:
    if db is not None:
        return db, False
    return SessionLocal(), True


# ---------------------------------------------------------------------------
# User CRUD
# ---------------------------------------------------------------------------

def get_user_by_email(email: str, db: Optional[Session] = None):
    """Fetches a User record by email address."""
    session, owns_session = _get_session(db)
    try:
        return session.query(User).filter(User.email == email).first()
    finally:
        if owns_session:
            session.close()


def get_user_by_username(username: str, db: Optional[Session] = None):
    """Fetches a User record by username."""
    session, owns_session = _get_session(db)
    try:
        return session.query(User).filter(User.username == username).first()
    finally:
        if owns_session:
            session.close()


def create_user(username: str, email: str, hashed_password: str, db: Optional[Session] = None):
    """Creates and persists a new User record with a bcrypt-hashed password."""
    session, owns_session = _get_session(db)
    try:
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f" New user created: {email} (id={user.id})")
        return user
    finally:
        if owns_session:
            session.close()


# ---------------------------------------------------------------------------
# Document CRUD
# ---------------------------------------------------------------------------

def create_document_record(filename: str, total_pages: int, title: str = None,
                            author: str = None, chunks: list[dict] | list[str] = None,
                            user_email: str = None, db: Optional[Session] = None):
    """Creates a Document record + linked DocumentChunks. Uses bulk insertion."""
    session, owns_session = _get_session(db)
    try:
        user_id = None
        if user_email:
            user = session.query(User).filter(User.email == user_email).first()
            if user:
                user_id = user.id

        doc = Document(
            filename=filename,
            total_pages=total_pages,
            title=title,
            author=author,
            user_id=user_id,
        )
        session.add(doc)
        session.commit()
        session.refresh(doc)

        # Save text chunks using bulk insert (add_all)
        if chunks:
            chunk_records = []
            for idx, chunk_item in enumerate(chunks):
                text_content = chunk_item.get("text", chunk_item) if isinstance(chunk_item, dict) else chunk_item
                chunk_records.append(
                    DocumentChunk(
                        document_id=doc.id,
                        chunk_index=idx,
                        chunk_text=text_content,
                    )
                )
            session.add_all(chunk_records)
            session.commit()

        print(f" Document saved with ID: {doc.id} ({len(chunks or [])} chunks linked)")
        return doc
    finally:
        if owns_session:
            session.close()


def get_all_documents(user_email: str = None, db: Optional[Session] = None):
    """Returns all documents, optionally filtered by owner email."""
    session, owns_session = _get_session(db)
    try:
        query = session.query(Document)
        if user_email:
            user = session.query(User).filter(User.email == user_email).first()
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
        if owns_session:
            session.close()


def get_document_by_id(doc_id: int, db: Optional[Session] = None):
    """Fetches a single Document by its primary key."""
    session, owns_session = _get_session(db)
    try:
        doc = session.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return None
        return {
            "id": doc.id,
            "filename": doc.filename,
            "total_pages": doc.total_pages,
            "title": doc.title,
            "author": doc.author,
            "upload_time": doc.upload_time.isoformat() if doc.upload_time else None,
            "user_id": doc.user_id,
            "chunks_count": len(doc.chunks),
        }
    finally:
        if owns_session:
            session.close()


def get_document_chunks(doc_id: int, db: Optional[Session] = None):
    """Returns all text chunks for a given document, ordered by index."""
    session, owns_session = _get_session(db)
    try:
        chunks = (
            session.query(DocumentChunk)
            .filter(DocumentChunk.document_id == doc_id)
            .order_by(DocumentChunk.chunk_index)
            .all()
        )
        return [{"chunk_index": c.chunk_index, "chunk_text": c.chunk_text} for c in chunks]
    finally:
        if owns_session:
            session.close()


def delete_document_record(doc_id: int, db: Optional[Session] = None) -> Optional[dict]:
    """Deletes a document and all associated chunks. Returns deleted record details for cleanup."""
    session, owns_session = _get_session(db)
    try:
        doc = session.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc_data = {
                "id": doc.id,
                "filename": doc.filename,
                "user_id": doc.user_id,
            }
            session.delete(doc)
            session.commit()
            print(f" Document ID {doc_id} deleted from DB successfully.")
            return doc_data
        return None
    finally:
        if owns_session:
            session.close()