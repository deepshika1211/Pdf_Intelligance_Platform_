import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

class VectorStore:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        print(f"Loading Embedding Model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        # Vector dimension for all-MiniLM-L6-v2 is 384
        self.dimension = 384
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks = []

    def add_chunks(self, chunks: list[str]):
        """
        Generates vector embeddings for text chunks and adds them to the FAISS index.
        """
        if not chunks:
            print("No chunks provided to index.")
            return

        print(f"Generating embeddings for {len(chunks)} text chunks...")
        embeddings = self.model.encode(chunks, convert_to_numpy=True)
        
        # FAISS requires float32 data format
        embeddings = embeddings.astype(np.float32)

        self.index.add(embeddings)
        self.chunks.extend(chunks)
        print(f" Successfully added {len(chunks)} chunks to FAISS index! Total vectors: {self.index.ntotal}")

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        """
        Searches the FAISS index for the top_k most similar text chunks for a given query.
        """
        if self.index.ntotal == 0:
            print("FAISS index is empty!")
            return []

        query_vector = self.model.encode([query], convert_to_numpy=True).astype(np.float32)
        distances, indices = self.index.search(query_vector, top_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx < len(self.chunks):
                results.append({
                    "chunk_id": int(idx),
                    "score": float(dist),  # Lower L2 distance means higher similarity
                    "text": self.chunks[idx]
                })

        return results

    def save_index(self, index_path="faiss_index.bin", chunks_path="chunks.npy"):
        """Saves FAISS index and chunk text mappings to disk."""
        faiss.write_index(self.index, index_path)
        np.save(chunks_path, np.array(self.chunks))
        print(" FAISS index saved to disk successfully.")

# Quick standalone test for Vector Store
if __name__ == "__main__":
    from pdf_processor import extract_pdf_data

    sample_pdf = "sample.pdf"
    if os.path.exists(sample_pdf):
        # 1. Extract PDF chunks
        pdf_data = extract_pdf_data(sample_pdf)
        chunks = pdf_data["text_chunks"]

        # 2. Initialize Vector Store
        vstore = VectorStore()
        vstore.add_chunks(chunks)

        # 3. Test Semantic Search
        test_query = "What are the questions or tasks in the document?"
        print(f"\n--- TESTING SEMANTIC SEARCH ---")
        print(f"Query: '{test_query}'")
        
        search_results = vstore.search(test_query, top_k=2)
        for i, res in enumerate(search_results, 1):
            print(f"\nMatch {i} (Distance Score: {res['score']:.4f}):")
            print(f"{res['text']}")
    else:
        print(f"\nPlease place 'sample.pdf' in the folder to test.")