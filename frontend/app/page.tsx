"use client";

import { useState, useEffect, FormEvent } from "react";

// Define the types for our data
type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
};

type Review = {
  id: string;
  book_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
};

// Main Single Page Component with Tailwind CSS
export default function SinglePageApp() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeView, setActiveView] = useState("list"); // 'list', 'add', 'details'
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Form states for adding a new book
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookDescription, setNewBookDescription] = useState("");

  // Form states for adding a new review
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");

  // Function to fetch all books
  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books");
      if (!res.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch reviews for a specific book
  const fetchReviews = async (bookId: string) => {
    try {
      // Fetch all reviews
      const res = await fetch("/api/reviews");
      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const allReviews = await res.json();
      
      // Filter the reviews on the frontend
      const bookReviews = allReviews.filter((review: Review) => review.book_id === bookId);
      setReviews(bookReviews);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Handler for viewing book details
  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    fetchReviews(book.id);
    setActiveView("details");
  };

  // Handler for adding a new book
  const handleAddBook = async (e: FormEvent) => {
    e.preventDefault();
    if (!newBookTitle || !newBookAuthor) {
      alert("Title and Author are required.");
      return;
    }

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBookTitle,
          author: newBookAuthor,
          description: newBookDescription,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add book");
      }

      // Clear form and refresh book list
      setNewBookTitle("");
      setNewBookAuthor("");
      setNewBookDescription("");
      setActiveView("list");
      fetchBooks();
    } catch (error) {
      console.error(error);
    }
  };

  // Handler for adding a new review
  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !newReviewerName || !newReviewRating) {
      alert("Reviewer name and rating are required.");
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: selectedBook.id,
          reviewer_name: newReviewerName,
          rating: Number(newReviewRating),
          comment: newReviewComment,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add review");
      }

      // Clear form and refresh review list
      setNewReviewerName("");
      setNewReviewRating(5);
      setNewReviewComment("");
      fetchReviews(selectedBook.id);
    } catch (error) {
      console.error(error);
    }
  };

  // Render content based on the active view
  const renderContent = () => {
    switch (activeView) {
      case "list":
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">BookShelf</h1>
              <button
                onClick={() => setActiveView("add")}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                + Add New Book
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleViewDetails(book)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-bold mb-1 text-gray-900">{book.title}</h2>
                  <p className="text-gray-600">by {book.author}</p>
                </div>
              ))}
            </div>
          </>
        );

      case "add":
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Add a New Book</h1>
              <button
                onClick={() => setActiveView("list")}
                className="text-blue-500 hover:text-blue-600 font-semibold"
              >
                Back to Home
              </button>
            </div>
            <form onSubmit={handleAddBook} className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title</label>
                <input
                  id="title"
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="author" className="block text-gray-700 font-bold mb-2">Author</label>
                <input
                  id="author"
                  type="text"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
                <textarea
                  id="description"
                  value={newBookDescription}
                  onChange={(e) => setNewBookDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                Add Book
              </button>
            </form>
          </>
        );

      case "details":
        if (!selectedBook) {
          return null;
        }
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{selectedBook.title}</h1>
              <button
                onClick={() => setActiveView("list")}
                className="text-blue-500 hover:text-blue-600 font-semibold"
              >
                Back to Home
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-700">by {selectedBook.author}</h2>
              <p className="mt-2 text-gray-600">{selectedBook.description}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h3>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 py-4 last:border-b-0">
                    <p className="text-lg font-semibold text-gray-900">
                      <span className="font-bold">{review.reviewer_name}</span> rated it{" "}
                      <span className="text-yellow-500">{review.rating}</span>/5
                    </p>
                    {review.comment && <p className="mt-2 text-gray-600">"{review.comment}"</p>}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to add one! ✍️</p>
              )}
              <form onSubmit={handleAddReview} className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Add Your Review</h3>
                <div className="mb-4">
                  <label htmlFor="reviewerName" className="block text-gray-700 font-bold mb-2">Your Name</label>
                  <input
                    id="reviewerName"
                    type="text"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="rating" className="block text-gray-700 font-bold mb-2">Rating (1-5)</label>
                  <input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-gray-700 font-bold mb-2">Comment</label>
                  <textarea
                    id="comment"
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                  Submit Review
                </button>
              </form>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return <main className="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen text-gray-900">{renderContent()}</main>;
}