"""
vector_store.py — FAISS Semantic Vector Store
Manages dense vector embeddings using Sentence Transformers and FAISS.
Supports per-document indexing and filtered search.
"""
import os
import ssl
import faiss
import numpy as np

# Bypass SSL certificate verification issues for model downloads on local/corporate networks
try:
    ssl._create_default_https_context = ssl._create_unverified_context
    os.environ["CURL_CA_BUNDLE"] = ""
    os.environ["PYTHONHTTPSVERIFY"] = "0"
except Exception:
    pass

from sentence_transformers import SentenceTransformer


class VectorStore:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        print(f"Loading Embedding Model: {model_name}...")
        self.dimension = 384
        try:
            self.model = SentenceTransformer(model_name)
        except Exception as e:
            print(f"[WARNING] Failed to load SentenceTransformer: {e}. Using fallback embedding generator.")
            self.model = None

        self.index = faiss.IndexFlatL2(self.dimension)
        # Parallel lists — index i maps chunk text, page hint, and doc_id
        self.chunks: list[str] = []
        self.doc_ids: list[int] = []
        self.page_hints: list[int] = []

    def _get_embeddings(self, texts: list[str]) -> np.ndarray:
        if self.model:
            return self.model.encode(texts, convert_to_numpy=True).astype(np.float32)
        # Simple deterministic hashing fallback if SentenceTransformer model is unavailable
        embeddings = []
        for text in texts:
            np.random.seed(abs(hash(text)) % (2**32))
            embeddings.append(np.random.randn(self.dimension).astype(np.float32))
        return np.array(embeddings, dtype=np.float32)

    def add_chunks(self, chunks: list[str], doc_id: int = 0):
        """
        Generates vector embeddings for text chunks and adds them to FAISS index.
        Tracks which document and approximate page each chunk belongs to.
        """
        if not chunks:
            print("No chunks provided to index.")
            return

        print(f"Generating embeddings for {len(chunks)} text chunks (doc_id={doc_id})...")
        embeddings = self._get_embeddings(chunks)

        self.index.add(embeddings)
        self.chunks.extend(chunks)

        # Estimate page number from chunk index (approx 3-4 chunks per page)
        for i in range(len(chunks)):
            self.doc_ids.append(doc_id)
            self.page_hints.append(max(1, (i // 3) + 1))

        print(f" Added {len(chunks)} chunks to FAISS. Total vectors: {self.index.ntotal}")

    def search(self, query: str, top_k: int = 5, doc_id: int = None) -> list[dict]:
        """
        Searches FAISS for top_k most semantically similar chunks.
        Optionally filters results to a specific document.
        """
        if self.index.ntotal == 0:
            print("FAISS index is empty — no documents indexed yet.")
            return []

        query_vector = self._get_embeddings([query])

        # Search more than top_k so we can filter by doc_id if needed
        search_k = min(top_k * 3, self.index.ntotal) if doc_id is not None else top_k
        distances, indices = self.index.search(query_vector, search_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1 or idx >= len(self.chunks):
                continue

            # Filter by document if doc_id specified
            if doc_id is not None and self.doc_ids[idx] != doc_id:
                continue

            results.append({
                "chunk_id": int(idx),
                "score": float(dist),
                "text": self.chunks[idx],
                "doc_id": self.doc_ids[idx] if idx < len(self.doc_ids) else 0,
                "page_hint": self.page_hints[idx] if idx < len(self.page_hints) else 1,
            })

            if len(results) >= top_k:
                break

        return results

    def save_index(self, index_path: str = "faiss_index.bin", meta_path: str = "chunks.npy"):
        """Saves FAISS index and chunk metadata to disk."""
        faiss.write_index(self.index, index_path)
        np.save(meta_path, np.array({
            "chunks": self.chunks,
            "doc_ids": self.doc_ids,
            "page_hints": self.page_hints,
        }, dtype=object))
        print(f" FAISS index saved. Total vectors: {self.index.ntotal}")

    def load_index(self, index_path: str = "faiss_index.bin", meta_path: str = "chunks.npy"):
        """Loads a previously saved FAISS index from disk."""
        if os.path.exists(index_path) and os.path.exists(meta_path):
            self.index = faiss.read_index(index_path)
            meta = np.load(meta_path, allow_pickle=True).item()
            self.chunks = list(meta.get("chunks", []))
            self.doc_ids = list(meta.get("doc_ids", []))
            self.page_hints = list(meta.get("page_hints", []))
            print(f" FAISS index loaded. Vectors: {self.index.ntotal}")
        else:
            print("No saved FAISS index found — starting fresh.")


# ---------------------------------------------------------------------------
# Standalone test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    from pdf_processor import extract_pdf_data

    sample_pdf = "sample.pdf"
    if os.path.exists(sample_pdf):
        pdf_data = extract_pdf_data(sample_pdf)
        chunks = pdf_data["text_chunks"]

        vstore = VectorStore()
        vstore.add_chunks(chunks, doc_id=1)

        test_query = "What are the questions or tasks in the document?"
        print(f"\n--- TESTING SEMANTIC SEARCH ---")
        print(f"Query: '{test_query}'")
        search_results = vstore.search(test_query, top_k=2)
        for i, res in enumerate(search_results, 1):
            print(f"\nMatch {i} (Score: {res['score']:.4f}, Page ~{res['page_hint']}):")
            print(f"{res['text'][:200]}")
    else:
        print("Place 'sample.pdf' in the folder to test.")