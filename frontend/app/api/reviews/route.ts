// Path: app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';

const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:8002';

// Handle GET request for all reviews
export async function GET() {
  try {
    const res = await fetch(`${REVIEW_SERVICE_URL}/reviews`);
    if (!res.ok) {
      throw new Error("Failed to fetch reviews from backend");
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle POST request to add a new review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${REVIEW_SERVICE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error("Failed to add review to backend");
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}