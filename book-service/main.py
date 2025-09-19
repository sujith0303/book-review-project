from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Book Service API",
    description="A microservice for managing books",
    version="1.0.0"
)

# Database connection configuration
DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("DB_NAME", "booksdb")
DB_USER = os.getenv("DB_USER", "user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_PORT = os.getenv("DB_PORT", "5432")

# Log connection info for debugging
logger.info(f"Database connection: host={DB_HOST}, db={DB_NAME}, user={DB_USER}, port={DB_PORT}")

# Pydantic models
class BookBase(BaseModel):
    title: str
    author: str
    published_year: Optional[int] = None

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: int

    class Config:
        from_attributes = True

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

@app.get("/books", response_model=List[Book], tags=["books"])
def get_books():
    """Get all books."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, title, author, published_year FROM books ORDER BY id;")
        books = cur.fetchall()
        return books
    except Exception as e:
        logger.error(f"Error fetching books: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()

@app.get("/books/{book_id}", response_model=Book, tags=["books"])
def get_book(book_id: int):
    """Get a single book by its ID."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, title, author, published_year FROM books WHERE id = %s;",
            (book_id,)
        )
        book = cur.fetchone()
        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )
        return book
    except Exception as e:
        logger.error(f"Error fetching book {book_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()

@app.post("/books", response_model=Book, status_code=status.HTTP_201_CREATED, tags=["books"])
def create_book(book: BookCreate):
    """Create a new book."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO books (title, author, published_year) VALUES (%s, %s, %s) RETURNING id, title, author, published_year;",
            (book.title, book.author, book.published_year)
        )
        new_book = cur.fetchone()
        conn.commit()
        logger.info(f"Created new book: {new_book}")
        return new_book
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating book: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()

@app.put("/books/{book_id}", response_model=Book, tags=["books"])
def update_book(book_id: int, book: BookCreate):
    """Update a book."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE books SET title = %s, author = %s, published_year = %s WHERE id = %s RETURNING id, title, author, published_year;",
            (book.title, book.author, book.published_year, book_id)
        )
        updated_book = cur.fetchone()
        if updated_book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )
        conn.commit()
        logger.info(f"Updated book {book_id}: {updated_book}")
        return updated_book
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating book {book_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()

@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["books"])
def delete_book(book_id: int):
    """Delete a book."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM books WHERE id = %s;", (book_id,))
        if cur.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )
        conn.commit()
        logger.info(f"Deleted book {book_id}")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting book {book_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()

@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return {"status": "healthy", "service": "book-service"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )

@app.get("/")
def root():
    return {
        "message": "Book Service is running!", 
        "docs": "/docs",
        "endpoints": {
            "get_books": "GET /books",
            "get_book": "GET /books/{id}",
            "create_book": "POST /books",
            "update_book": "PUT /books/{id}",
            "delete_book": "DELETE /books/{id}",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)