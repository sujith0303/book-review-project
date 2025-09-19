from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime
import logging
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Review Service API",
    description="A microservice for managing book reviews",
    version="1.0.0"
)

# Database configuration
DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("DB_NAME", "booksdb")
DB_USER = os.getenv("DB_USER", "user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_PORT = os.getenv("DB_PORT", "5432")

# Log connection info for debugging
logger.info(f"Database connection: host={DB_HOST}, db={DB_NAME}, user={DB_USER}, port={DB_PORT}")

# Pydantic models
class ReviewBase(BaseModel):
    book_id: int
    reviewer_name: str
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    created_at: datetime

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

# Add health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint to verify service is running"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return {"status": "healthy", "service": "review-service"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )

@app.get("/reviews", response_model=List[Review], tags=["reviews"])
def get_reviews(book_id: Optional[int] = None):
    """Get all reviews, optionally filtered by book_id."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        if book_id:
            cur.execute(
                "SELECT id, book_id, reviewer_name, rating, comment, created_at FROM reviews WHERE book_id = %s ORDER BY created_at DESC;",
                (book_id,)
            )
        else:
            cur.execute("SELECT id, book_id, reviewer_name, rating, comment, created_at FROM reviews ORDER BY created_at DESC;")
        reviews = cur.fetchall()
        return reviews
    except Exception as e:
        logger.error(f"Error fetching reviews: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/reviews/{review_id}", response_model=Review, tags=["reviews"])
def get_review(review_id: int):
    """Get a single review by its ID."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, book_id, reviewer_name, rating, comment, created_at FROM reviews WHERE id = %s;",
            (review_id,)
        )
        review = cur.fetchone()
        if review is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        return review
    except Exception as e:
        logger.error(f"Error fetching review {review_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/reviews", response_model=Review, status_code=status.HTTP_201_CREATED, tags=["reviews"])
def create_review(review: ReviewCreate):
    """Create a new review."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # First, verify the book exists
        cur.execute("SELECT id FROM books WHERE id = %s;", (review.book_id,))
        if cur.fetchone() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {review.book_id} not found"
            )

        cur.execute(
            "INSERT INTO reviews (book_id, reviewer_name, rating, comment) VALUES (%s, %s, %s, %s) RETURNING id, book_id, reviewer_name, rating, comment, created_at;",
            (review.book_id, review.reviewer_name, review.rating, review.comment)
        )
        new_review = cur.fetchone()
        conn.commit()
        return new_review
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error creating review: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["reviews"])
def delete_review(review_id: int):
    """Delete a review."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM reviews WHERE id = %s;", (review_id,))
        if cur.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error deleting review {review_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.get("/")
def root():
    return {"message": "Review Service is running!", "docs": "/docs", "health": "/health"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)