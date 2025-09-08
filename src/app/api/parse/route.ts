<file_path>
Project_Dhruv/src/app/api/parse/route.ts
</file_path>

<edit_description>
Create api/parse route for Vercel.
</edit_description>

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { text } = await request.json();

  // Mock parsing (simulate LangExtract for Vercel CMS)
  // In production, call external LangExtract API or use simple regex
  const mockParsed = {
    when: '2025-09-08',
    where: text.includes('रायगढ़') ? ['रायगढ़'] : ['दिल्ली'],
    themes: text.includes('विकास') ? ['विकास'] : ['स्वास्थ्य'],
    sentiment: 'neutral',
    entities: [
      { text: 'रायगढ़', type: 'LOC', start: 4, end: 11 },
    ],
  };

  return NextResponse.json({ extraction: mockParsed });
}
```
```
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
```
```
<file_path>
Project_Dhruv/src/app/api/review/export/route.ts
</file_path>

<edit_description>
Create api/review/export route for Vercel JSON export.
</edit_description>

import { NextResponse } from 'next/server';

// Import the in-memory data (in real setup, fetch from storage)
let reviewedData: any[] = [];

export async function GET() {
  return NextResponse.json(reviewedData);
}
```

Now, commit and push all enhancements.
