from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Book(BaseModel):
    title: str
    author: str
    description: str = None

books = []

@app.post("/books")
def add_book(book: Book):
    book_id = len(books) + 1
    books.append({"id": book_id, **book.dict()})
    return {"message": "Book added", "id": book_id}

@app.get("/books")
def get_books():
    return books
