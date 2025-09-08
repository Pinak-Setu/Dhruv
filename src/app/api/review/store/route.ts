<file_path>
Project_Dhruv/src/app/api/review/store/route.ts
</file_path>

<edit_description>
Create api/review/store route for Vercel.
</edit_description>

import { NextResponse } from 'next/server';

let reviewedData: any[] = [];  // In-memory storage (use Vercel KV for persistence)

export async function POST(request: Request) {
  const data = await request.json();
  reviewedData.push(data);
  console.log('Stored:', data);  // Log for demo
  return NextResponse.json({ stored: true });
}
