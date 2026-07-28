from database import SessionLocal, PDFMetadata

# 1. CREATE: Add new PDF metadata record to DB
def create_pdf_record(filename, total_pages, title=None, author=None):
    db = SessionLocal()
    db_record = PDFMetadata(
        filename=filename,
        total_pages=total_pages,
        title=title,
        author=author
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    db.close()
    print(f" Record saved to database with ID: {db_record.id}")
    return db_record

# 2. READ: Get all PDF records from DB
def get_all_pdf_records():
    db = SessionLocal()
    records = db.query(PDFMetadata).all()
    db.close()
    return records

# 3. DELETE: Remove a PDF record by ID
def delete_pdf_record(record_id):
    db = SessionLocal()
    record = db.query(PDFMetadata).filter(PDFMetadata.id == record_id).first()
    if record:
        db.delete(record)
        db.commit()
        db.close()
        print(f" Record ID {record_id} deleted.")
        return True
    db.close()
    print(f" Record ID {record_id} not found.")
    return False

# Quick Test Run
if __name__ == "__main__":
    print("\n--- Testing CRUD Operations ---")
    
    # Test Create
    new_rec = create_pdf_record(filename="sample.pdf", total_pages=4, title="file.pdf", author="Abdul")
    
    # Test Read
    all_recs = get_all_pdf_records()
    print(f"\nTotal Records in Database: {len(all_recs)}")
    for r in all_recs:
        print(f"ID: {r.id} | File: {r.filename} | Pages: {r.total_pages} | Title: {r.title}")