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

    def add_chunks(self, chunks: list[str] | list[dict], doc_id: int = 0):
        """
        Generates vector embeddings for text chunks and adds them to FAISS index.
        Tracks which document and page each chunk belongs to.
        chunks can be a list of strings or list of dicts with {"text": ..., "page": ...}.
        """
        if not chunks:
            print("No chunks provided to index.")
            return

        text_list = []
        page_list = []

        for i, item in enumerate(chunks):
            if isinstance(item, dict):
                text_list.append(item.get("text", ""))
                page_list.append(item.get("page", 1))
            else:
                text_list.append(str(item))
                page_list.append(max(1, (i // 3) + 1))

        print(f"Generating embeddings for {len(text_list)} text chunks (doc_id={doc_id})...")
        embeddings = self._get_embeddings(text_list)

        self.index.add(embeddings)
        self.chunks.extend(text_list)

        for p in page_list:
            self.doc_ids.append(doc_id)
            self.page_hints.append(p)

        print(f" Added {len(text_list)} chunks to FAISS. Total vectors: {self.index.ntotal}")

    def search(self, query: str, top_k: int = 5, doc_id: int = None, allowed_doc_ids: set[int] | list[int] = None) -> list[dict]:
        """
        Searches FAISS for top_k most semantically similar chunks.
        Supports filtering by specific doc_id or set of allowed_doc_ids for multi-tenant isolation.
        """
        if self.index.ntotal == 0:
            print("FAISS index is empty — no documents indexed yet.")
            return []

        query_vector = self._get_embeddings([query])

        # Convert allowed_doc_ids to set for fast lookup
        allowed_set = set(allowed_doc_ids) if allowed_doc_ids is not None else None

        # Fetch more candidates to account for filtering.
        # If filtering is active, we search the entire index to ensure we don't miss chunks from smaller documents.
        is_filtering = (doc_id is not None or allowed_doc_ids is not None)
        search_k = self.index.ntotal if is_filtering else min(top_k * 10, self.index.ntotal)
        if search_k <= 0:
            return []
        distances, indices = self.index.search(query_vector, search_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1 or idx >= len(self.chunks):
                continue

            chunk_doc_id = self.doc_ids[idx] if idx < len(self.doc_ids) else 0

            # Filter by explicit document if doc_id specified
            if doc_id is not None and chunk_doc_id != doc_id:
                continue

            # Multi-tenant isolation: filter out chunks from documents not owned by the user
            if allowed_set is not None and chunk_doc_id not in allowed_set:
                continue

            results.append({
                "chunk_id": int(idx),
                "score": float(dist),
                "text": self.chunks[idx],
                "doc_id": chunk_doc_id,
                "page_hint": self.page_hints[idx] if idx < len(self.page_hints) else 1,
            })

            if len(results) >= top_k:
                break

        return results

    def delete_document_vectors(self, doc_id: int):
        """
        Removes all vectors belonging to doc_id and rebuilds the FAISS index cleanly.
        """
        if doc_id not in self.doc_ids:
            return

        print(f"Purging FAISS vectors for document ID: {doc_id}...")

        # Filter out chunks for this doc_id
        new_chunks = []
        new_doc_ids = []
        new_page_hints = []

        for text, d_id, p_hint in zip(self.chunks, self.doc_ids, self.page_hints):
            if d_id != doc_id:
                new_chunks.append(text)
                new_doc_ids.append(d_id)
                new_page_hints.append(p_hint)

        # Reset FAISS index
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks = []
        self.doc_ids = []
        self.page_hints = []

        # Re-add remaining vectors if any
        if new_chunks:
            embeddings = self._get_embeddings(new_chunks)
            self.index.add(embeddings)
            self.chunks = new_chunks
            self.doc_ids = new_doc_ids
            self.page_hints = new_page_hints

        self.save_index()
        print(f" Purged vectors for doc_id={doc_id}. Remaining vectors: {self.index.ntotal}")

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