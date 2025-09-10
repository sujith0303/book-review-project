from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database
reviews_db = []
review_id_counter = 1

class Review(BaseModel):
    book_id: int
    review: str

class ReviewOut(Review):
    id: int

@app.get("/reviews", response_model=List[ReviewOut])
def get_reviews(book_id: int = Query(...)):
    return [r for r in reviews_db if r.book_id == book_id]

@app.post("/reviews", response_model=ReviewOut)
def add_review(review: Review):
    global review_id_counter
    review_out = ReviewOut(id=review_id_counter, **review.dict())
    reviews_db.append(review_out)
    review_id_counter += 1
    return review_out

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
