"use client";

import { useEffect, useState } from "react";
import { getBooks, addBook } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async () => {
    if (!title || !author) return;
    try {
      await addBook({ title, author, description });
      setTitle("");
      setAuthor("");
      setDescription("");
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Books</h1>

      <ul className="mb-6">
        {books.map((book) => (
          <li key={book.id} className="mb-2">
            <Link href={`/books/${book.id}`} className="text-blue-600 hover:underline">
              {book.title} by {book.author}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-bold mb-2">Add New Book</h2>
      <div className="flex flex-col max-w-md gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 rounded"
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="border p-2 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-2 rounded"
        />
        <button
          onClick={handleAddBook}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Book
        </button>
      </div>
    </div>
  );
}
