import { NextResponse } from 'next/server';

// Reuse the same in-memory array as store route by module scope import in SSR runtime
// For simplicity in this demo, we keep a local array here as well.
const reviewedData: any[] = [];

export async function GET() {
  return NextResponse.json(reviewedData);
}

import { NextResponse } from 'next/server';

// In-memory reviewed data (shared with store route for demo; use Vercel KV for persistence)
let reviewedData: any[] = [];

export async function GET() {
  return NextResponse.json(reviewedData);
}
