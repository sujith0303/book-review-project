const BOOK_SERVICE_URL = "http://localhost:8000/books";
const REVIEW_SERVICE_URL = "http://localhost:8001/reviews";

// ===== BOOK SERVICE =====
export async function getBooks() {
  const res = await fetch(BOOK_SERVICE_URL);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export async function addBook(book: { title: string; author: string; description: string }) {
  const res = await fetch(BOOK_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error("Failed to add book");
  return res.json();
}

// ===== REVIEW SERVICE =====
export async function getReviews(bookId: number) {
  const res = await fetch(`${REVIEW_SERVICE_URL}?book_id=${bookId}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function addReview(review: { book_id: number; review: string }) {
  const res = await fetch(REVIEW_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error("Failed to add review");
  return res.json();
}
