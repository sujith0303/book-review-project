"use client";

import { useState } from "react";
import { addBook } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AddBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleAddBook = async () => {
    await addBook({ title, author, description });
    router.push("/"); // go back to book list
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add Book</h1>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-1 mr-2"/>
      <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} className="border p-1 mr-2"/>
      <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-1 mr-2"/>
      <button onClick={handleAddBook} className="bg-blue-500 text-white px-4 py-1">Add</button>
    </div>
  );
}
