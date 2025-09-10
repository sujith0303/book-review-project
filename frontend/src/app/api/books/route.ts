import { NextResponse } from "next/server";

const BOOK_SERVICE_URL = "http://localhost:8000/books";

export async function GET() {
  const res = await fetch(BOOK_SERVICE_URL);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(BOOK_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
