"use client";

import { useEffect, useState } from "react";
import { getReviews, addReview } from "@/lib/api";
import { useParams } from "next/navigation";

export default function BookPage() {
  const params = useParams();
  const bookId = Number(params.id);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState("");

  const fetchReviews = async () => {
    try {
      const data = await getReviews(bookId);
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAddReview = async () => {
    if (!reviewText.trim()) return;
    try {
      await addReview({ book_id: bookId, review: reviewText });
      setReviewText("");
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reviews for Book {bookId}</h1>

      {reviews.length === 0 && <p>No reviews yet.</p>}
      <ul className="mb-4">
        {reviews.map((r) => (
          <li key={r.id} className="border-b py-2">{r.review}</li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mb-2">Add Review</h2>
      <div className="flex gap-2">
        <input
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review"
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleAddReview}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
