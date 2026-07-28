import fitz  
import os

def extract_pdf_data(pdf_path, output_dir="extracted_outputs"):
    # Create output directory for extracted images if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # 1. Open the PDF
    doc = fitz.open(pdf_path)

    # 2. Get Metadata
    metadata = {
        "filename": os.path.basename(pdf_path),
        "total_pages": len(doc),
        "title": doc.metadata.get("title", "Unknown"),
        "author": doc.metadata.get("author", "Unknown"),
    }

    print("\n--- METADATA EXTRACTED ---")
    print(metadata)

    extracted_images = []
    extracted_tables = []

    # 3. Process Page by Page
    for page_num in range(len(doc)):
        page = doc[page_num]

        # Render full PDF page as a single image (snapshot)
        pix = page.get_pixmap()
        image_name = f"page_{page_num + 1}.png"
        image_path = os.path.join(output_dir, image_name)

        # Save the rendered page image
        pix.save(image_path)
        extracted_images.append(image_path)

        # Extract Tables
        tabs = page.find_tables()
        if tabs.tables:
            for table_idx, tab in enumerate(tabs):
                table_data = tab.extract()  # Returns table as a list of lists (rows/columns)
                extracted_tables.append({
                    "page": page_num + 1,
                    "table_index": table_idx + 1,
                    "data": table_data
                })

    doc.close()

    print(f"\n--- EXTRACTION SUMMARY ---")
    print(f"Page Screenshots Saved: {len(extracted_images)}")
    print(f"Tables Found: {len(extracted_tables)}")

    return {
        "metadata": metadata,
        "images": extracted_images,
        "tables": extracted_tables
    }

# Quick Test Run (Run if executed directly)
if __name__ == "__main__":
    # Place any sample PDF in your project folder and replace 'sample.pdf' below
    sample_pdf = "sample.pdf"
    
    if os.path.exists(sample_pdf):
        results = extract_pdf_data(sample_pdf)
    else:
        print(f"\n Please place a sample PDF named '{sample_pdf}' in your folder to test!")