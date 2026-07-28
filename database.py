from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

# 1. Database Connection URL
# For testing locally right away, we use SQLite. 
# (When connecting to actual MySQL, replace with: "mysql+pymysql://username:password@localhost/dbname")
DATABASE_URL = "sqlite:///./pdf_intel.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Define PDF Metadata Table Schema
class PDFMetadata(Base):
    __tablename__ = "pdf_metadata"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable
                      =False)
    total_pages = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    author = Column(String(255), nullable=True)
    upload_time = Column(DateTime, default=datetime.utcnow)

# 3. Create Tables in Database
def init_db():
    Base.metadata.create_all(bind=engine)
    print(" Database tables created successfully!")

if __name__ == "__main__":
    init_db()