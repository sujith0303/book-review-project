from fastapi import FastAPI
from pydantic import BaseModel
import requests

app = FastAPI()

class Review(BaseModel):
    book_id: int
    reviewer: str
    content: str
    rating: int

reviews = []

BOOK_SERVICE_URL = "http://book-service:8000/books"

@app.post("/reviews")
def add_review(review: Review):
    # check if book exists
    response = requests.get(BOOK_SERVICE_URL)
    books = response.json()
    if not any(book["id"] == review.book_id for book in books):
        return {"error": "Book not found"}
    review_id = len(reviews) + 1
    reviews.append({"id": review_id, **review.dict()})
    return {"message": "Review added", "id": review_id}

@app.get("/reviews")
def get_reviews(book_id: int = None):
    if book_id:
        return [r for r in reviews if r["book_id"] == book_id]
    return reviews
