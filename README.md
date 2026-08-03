# 📄 PDF Intelligence Platform

An AI-powered web application that enables users to upload PDF documents, extract their content, and interact with them through natural language questions. The platform combines modern web technologies, semantic search, and large language models to provide fast and accurate answers from uploaded documents.

---

## 🚀 Features

* 📤 Upload PDF documents
* 📖 Extract text from PDFs
* 📊 Extract tables from PDF documents
* 🔍 Semantic search using vector embeddings
* 🤖 AI-powered question answering with Gemini API
* 🔐 Secure user authentication using JWT
* 👤 User registration and login
* 💾 Store user and document information in MySQL
* ⚡ Fast REST APIs built with FastAPI
* 🎨 Responsive and modern interface using React and Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* JavaScript
* Axios

### Backend

* FastAPI
* Python
* Uvicorn
* SQLAlchemy
* Pydantic

### Database

* MySQL
* FAISS (Vector Database)

### AI & Document Processing

* Google Gemini API
* Sentence Transformers
* PyMuPDF
* Camelot
* Tabula-py

---

## 🏗️ System Architecture

```text
                React + Vite Frontend
                        │
                HTTP (REST APIs)
                        │
                  FastAPI Backend
        ┌───────────────┼────────────────┐
        │               │                │
     MySQL         PDF Processing      AI Layer
        │         (PyMuPDF/Camelot)       │
        │               │                │
        └──────────────►Embeddings◄──────┘
                        │
                     FAISS
                        │
                 Gemini API
                        │
                 AI Generated Answer
```

---

## 🔄 Workflow

1. User logs in to the application.
2. User uploads a PDF document.
3. The backend extracts text and tables from the PDF.
4. The extracted content is divided into smaller chunks.
5. Sentence Transformers generate vector embeddings.
6. Embeddings are stored in FAISS for semantic search.
7. When a user asks a question, the query is converted into an embedding.
8. FAISS retrieves the most relevant document chunks.
9. The retrieved context is sent to the Gemini API.
10. The AI generates a contextual answer and returns it to the user.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/deepshika1211/Pdf_Intelligance_Platform_.git
cd Pdf_Intelligance_Platform_
```

### 2. Backend Setup

```bash
python -m venv venv
```

Activate the virtual environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for secure authentication.

* User Registration
* User Login
* Password Hashing
* Protected API Routes

---

## 📚 REST APIs

Example API endpoints:

| Method | Endpoint     | Description               |
| ------ | ------------ | ------------------------- |
| POST   | `/register`  | Register a new user       |
| POST   | `/login`     | User login                |
| POST   | `/upload`    | Upload PDF                |
| POST   | `/ask`       | Ask questions about a PDF |
| GET    | `/documents` | Fetch uploaded documents  |

> Endpoint names may vary depending on your implementation.


---

## 👩‍💻 Author

**Deepshika Yerrangi**

* GitHub: https://github.com/deepshika1211
* LinkedIn: https://www.linkedin.com/in/deepshika-yerrangi/

---

## 📄 License

This project is intended for educational and learning purposes. Feel free to explore and extend it for personal or academic use.
