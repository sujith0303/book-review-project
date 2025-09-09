from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Book

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI()

# Pydantic schema
class BookSchema(BaseModel):
    title: str
    author: str
    description: str = None

    class Config:
        orm_mode = True

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create book
@app.post("/books")
def create_book(book: BookSchema, db: Session = Depends(get_db)):
    new_book = Book(**book.dict())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return {"message": "Book created", "id": new_book.id}

# List all books
@app.get("/books")
def list_books(db: Session = Depends(get_db)):
    return db.query(Book).all()

# Get a single book
@app.get("/books/{book_id}")
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
