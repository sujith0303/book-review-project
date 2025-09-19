// app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Update the URL to use localhost and the exposed port
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:8000';


// Handle GET request for all books
export async function GET() {
  try {
    const res = await fetch(`${BOOK_SERVICE_URL}/books`);
    if (!res.ok) {
      throw new Error("Failed to fetch books from backend");
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle POST request to add a new book
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BOOK_SERVICE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error("Failed to add book to backend");
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}