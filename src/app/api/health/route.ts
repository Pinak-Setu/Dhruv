import { NextResponse } from 'next/server';

export async function GET() {
  const traceId = Math.random().toString(36).slice(2, 10);
  return NextResponse.json({ status: 'ok', traceId });
}

