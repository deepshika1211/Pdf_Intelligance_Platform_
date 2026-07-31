import fitz  # PyMuPDF
import os

def chunk_text_with_pages(pages_data: list[dict], chunk_size: int = 500, chunk_overlap: int = 50) -> list[dict]:
    """Splits text into overlapping chunks, preserving exact page numbers."""
    chunks = []
    for item in pages_data:
        page_num = item["page"]
        text = item["text"]
        if not text.strip():
            continue
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end].strip()
            if chunk:
                chunks.append({"text": chunk, "page": page_num})
            start += chunk_size - chunk_overlap
    return chunks


def extract_embedded_images(doc, output_dir: str = "extracted_images") -> list[str]:
    """
    Extracts actual embedded images from PDF pages.
    """
    os.makedirs(output_dir, exist_ok=True)
    saved_image_paths = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)

        for img_idx, img in enumerate(image_list, 1):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]  # png, jpeg, etc.

            image_filename = f"page_{page_num + 1}_img_{img_idx}.{image_ext}"
            image_path = os.path.join(output_dir, image_filename)

            with open(image_path, "wb") as f:
                f.write(image_bytes)

            saved_image_paths.append(image_path)

    return saved_image_paths


def extract_pdf_data(pdf_path: str, output_dir: str = "extracted_outputs"):
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)

    # 1. Metadata
    metadata = {
        "filename": os.path.basename(pdf_path),
        "total_pages": len(doc),
        "title": doc.metadata.get("title", "Unknown"),
        "author": doc.metadata.get("author", "Unknown"),
    }

    page_screenshots = []
    extracted_tables = []
    pages_data = []
    full_text = ""

    # 2. Page-by-Page Extraction
    for page_num in range(len(doc)):
        page = doc[page_num]

        # Extract Text
        page_text = page.get_text("text")
        if page_text.strip():
            full_text += f"\n--- Page {page_num + 1} ---\n" + page_text
            pages_data.append({"page": page_num + 1, "text": page_text})

        # Page Snapshot Screenshot
        pix = page.get_pixmap()
        screenshot_path = os.path.join(output_dir, f"page_{page_num + 1}.png")
        pix.save(screenshot_path)
        page_screenshots.append(screenshot_path)

        # Table Extraction
        tabs = page.find_tables()
        if tabs.tables:
            for table_idx, tab in enumerate(tabs):
                table_data = tab.extract()
                extracted_tables.append({
                    "page": page_num + 1,
                    "table_index": table_idx + 1,
                    "rows_count": len(table_data),
                    "data": table_data
                })

    # 3. Embedded Images Extraction
    images_dir = os.path.join(output_dir, "images")
    embedded_images = extract_embedded_images(doc, output_dir=images_dir)

    doc.close()

    # 4. Page-Aware Text Chunking
    chunks_with_pages = chunk_text_with_pages(pages_data)
    text_chunks = [c["text"] for c in chunks_with_pages]

    print(f"\n--- EXTRACTION SUMMARY ---")
    print(f"Total Text Characters: {len(full_text)}")
    print(f"Text Chunks Created: {len(chunks_with_pages)}")
    print(f"Page Screenshots Saved: {len(page_screenshots)}")
    print(f"Embedded Images Extracted: {len(embedded_images)}")
    print(f"Tables Found: {len(extracted_tables)}")

    return {
        "metadata": metadata,
        "full_text": full_text,
        "text_chunks": text_chunks,
        "chunks_with_pages": chunks_with_pages,
        "page_screenshots": page_screenshots,
        "embedded_images": embedded_images,
        "tables": extracted_tables
    }

if __name__ == "__main__":
    sample_pdf = "sample.pdf"
    if os.path.exists(sample_pdf):
        extract_pdf_data(sample_pdf)