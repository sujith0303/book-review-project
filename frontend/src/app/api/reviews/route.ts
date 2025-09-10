import { NextResponse } from "next/server";

const REVIEW_SERVICE_URL = "http://localhost:8001/reviews";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const book_id = url.searchParams.get("book_id");
  const res = await fetch(`${REVIEW_SERVICE_URL}?book_id=${book_id}`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(REVIEW_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
