from database import SessionLocal
from models import Document, DocumentChunk

def create_document_record(filename: str, total_pages: int, title: str = None, author: str = None, chunks: list[str] = None):
    db = SessionLocal()
    try:
        # Create Document record
        doc = Document(
            filename=filename,
            total_pages=total_pages,
            title=title,
            author=author
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Save Text Chunks associated with this Document
        if chunks:
            for idx, chunk_text in enumerate(chunks):
                chunk_record = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=idx,
                    chunk_text=chunk_text
                )
                db.add(chunk_record)
            db.commit()

        print(f" Document saved with ID: {doc.id} ({len(chunks or [])} chunks linked)")
        return doc
    finally:
        db.close()

def get_all_documents():
    db = SessionLocal()
    try:
        return db.query(Document).all()
    finally:
        db.close()

def get_document_by_id(doc_id: int):
    db = SessionLocal()
    try:
        return db.query(Document).filter(Document.id == doc_id).first()
    finally:
        db.close()

def delete_document_record(doc_id: int):
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