from fastapi import FastAPI, UploadFile, File, HTTPException
import os
import shutil
# Import our custom modules
from database import init_db
from pdf_processor import extract_pdf_data
from crud import create_pdf_record, get_all_pdf_records, delete_pdf_record

app = FastAPI(title="PDF Intelligence Platform - API")

# Initialize DB on startup
init_db()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    # 1. Save uploaded PDF file to disk
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Extract Data using PyMuPDF (Metadata, Tables, Images)
    extracted_data = extract_pdf_data(file_path)
    meta = extracted_data["metadata"]

    # 3. Save Metadata to Database
    db_record = create_pdf_record(
        filename=meta["filename"],
        total_pages=meta["total_pages"],
        title=meta["title"],
        author=meta["author"]
    )

    return {
        "status": "success",
        "db_record_id": db_record.id,
        "filename": meta["filename"],
        "total_pages": meta["total_pages"],
        "images_extracted": len(extracted_data["images"]),
        "tables_found": len(extracted_data["tables"]),
        "tables_data": extracted_data["tables"]
    }

@app.get("/pdfs/")
def list_pdfs():
    # Retrieve all records from DB
    return get_all_pdf_records()

@app.delete("/pdfs/{record_id}")
def delete_pdf(record_id: int):
    # Delete record by ID
    success = delete_pdf_record(record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"status": "deleted", "id": record_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)