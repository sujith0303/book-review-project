from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Review
import requests
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

BOOK_SERVICE_URL = os.getenv("BOOK_SERVICE_URL", "http://localhost:8000/books")

# Pydantic schema
class ReviewSchema(BaseModel):
    book_id: int
    reviewer: str
    content: str
    rating: int

    class Config:
        orm_mode = True

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create review
@app.post("/reviews")
def create_review(review: ReviewSchema, db: Session = Depends(get_db)):
    # Check if book exists in Book Service
    try:
        response = requests.get(BOOK_SERVICE_URL)
        books = response.json()
        if not any(book["id"] == review.book_id for book in books):
            return {"error": "Book not found"}
    except Exception as e:
        return {"error": f"Cannot reach Book Service: {e}"}

    new_review = Review(**review.dict())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return {"message": "Review added", "id": new_review.id}

# List reviews
@app.get("/reviews")
def list_reviews(book_id: int = None, db: Session = Depends(get_db)):
    if book_id:
        return db.query(Review).filter(Review.book_id == book_id).all()
    return db.query(Review).all()
