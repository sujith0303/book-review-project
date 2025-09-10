from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI()

# Enable CORS for frontend at localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database
books_db = []
book_id_counter = 1

class Book(BaseModel):
    title: str
    author: str
    description: str

class BookOut(Book):
    id: int

@app.get("/books", response_model=List[BookOut])
def get_books():
    return books_db

@app.post("/books", response_model=BookOut)
def add_book(book: Book):
    global book_id_counter
    book_out = BookOut(id=book_id_counter, **book.dict())
    books_db.append(book_out)
    book_id_counter += 1
    return book_out

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
