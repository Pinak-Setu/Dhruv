import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db/pool';

export const dynamic = 'force-dynamic';

const TEXT_EVENT_KEYWORD_MAP: Record<string, string[]> = {
  congratulation: ['बधाई', 'शुभकामन', 'congratulation', 'congrats'],
  jayanti: ['जयंती', 'jayanti'],
};

function deriveEventTypeFromText(text?: string | null): string | null {
  if (!text) return null;
  const normalized = text.toLowerCase();
  for (const [eventType, keywords] of Object.entries(TEXT_EVENT_KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return eventType;
      }
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.tweet || !data.categories) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tweet or categories' },
        { status: 400 }
      );
    }

    const { tweet, categories, gemini_metadata } = data;

    // Extract data for database insertion
    const tweetId = tweet.id;
    const locations = Array.isArray(categories.locations) ? categories.locations : [];
    const people = Array.isArray(categories.people) ? categories.people : [];
    const organizations = Array.isArray(categories.organisation) ? categories.organisation : [];
    const schemes = Array.isArray(categories.schemes) ? categories.schemes : [];
    const communities = Array.isArray(categories.communities) ? categories.communities : [];


    // Helper function to format arrays for PostgreSQL JSONB columns
    const formatJsonArray = (arr: any[]) => JSON.stringify(arr);

    // Determine event type by merging Gemini category signals with text heuristics
    const tweetText = typeof tweet.text === 'string' ? tweet.text : '';
    const textBasedEventType = deriveEventTypeFromText(tweetText);

    // Gemini may return an array of event types
    const geminiEventTypes = Array.isArray(categories.event) ? categories.event.map(String).filter(Boolean) : [];

    // Heuristic-derived types (keep as array to support multi-label union)
    const heuristicEventTypes = textBasedEventType ? [textBasedEventType] : [];

    // Unique union: never drop heuristic-derived event types
    const mergedEventTypes = Array.from(new Set([...geminiEventTypes, ...heuristicEventTypes]));

    // Choose primary label based on rule (jayanti > congratulation > gemini_first) for compatibility
    let primaryEventType = 'general';
    if (mergedEventTypes.includes('jayanti')) primaryEventType = 'jayanti';
    else if (mergedEventTypes.includes('congratulation')) primaryEventType = 'congratulation';
    else if (geminiEventTypes.length > 0) primaryEventType = geminiEventTypes[0];

    // Compute confidence heuristically
    let confidence = 0.5;
    if (heuristicEventTypes.length > 0) {
      confidence = 0.9;
    } else if (geminiEventTypes.length > 0) {
      confidence = 0.8;
    }

    // Check if tweet already exists
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      // Check for existing parsed event
      const existingCheck = await client.query(
        'SELECT id FROM parsed_events WHERE tweet_id = $1',
        [tweetId]
      );

      if (existingCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Tweet already processed', duplicate: true },
          { status: 409 }
        );
      }

      // Insert new parsed event
      const insertQuery = `
        INSERT INTO parsed_events (
          tweet_id,
          event_type,
          event_type_confidence,
          locations,
          people_mentioned,
          organizations,
          schemes_mentioned,
          overall_confidence,
          needs_review,
          review_status,
          parsed_at,
          parsed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `;

      const values = [
        tweetId,
        primaryEventType,
        confidence,
        formatJsonArray(locations), // locations is JSONB
        people,     // people_mentioned is TEXT[] - pass actual array
        organizations, // organizations is TEXT[] - pass actual array
        schemes,   // schemes_mentioned is TEXT[] - pass actual array
        confidence,
        true, // needs_review - mark for human review
        'pending', // review_status
        new Date().toISOString(),
        gemini_metadata?.model || 'unknown'
      ];

      const result = await client.query(insertQuery, values);

      // Debug/log for merged event types
      console.log(`[API] Successfully ingested parsed tweet ${tweetId} with ID ${result.rows[0].id}`);
      console.log(`[API:DEBUG] raw_text=${tweetText.slice(0,200)} gemini_event_types=${JSON.stringify(geminiEventTypes)} heuristic_event_types=${JSON.stringify(heuristicEventTypes)} merged_event_types=${JSON.stringify(mergedEventTypes)} primary=${primaryEventType}`);

      return NextResponse.json({
        success: true,
        message: 'Tweet processed successfully',
        parsed_event_id: result.rows[0].id
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error ingesting parsed tweet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to ingest parsed tweet',
      },
      { status: 500 }
    );
  }
}