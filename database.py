from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# -------------------------------------------------------------
# Local Testing with SQLite:
DATABASE_URL = "sqlite:///./pdf_intel.db"

# MySQL Production Connection (Uncomment & replace when connecting to MySQL Server):
# DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/pdf_intel_db"
# -------------------------------------------------------------

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    import models  # Ensures models are registered before creating tables
    Base.metadata.create_all(bind=engine)
    print(" Database tables (Users, Documents, DocumentChunks) created successfully!")

if __name__ == "__main__":
    init_db()