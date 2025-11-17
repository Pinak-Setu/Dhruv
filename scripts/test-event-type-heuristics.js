#!/usr/bin/env node

/**
 * Test Event Type Heuristics
 * - Finds real tweets containing congratulation/jayanti keywords
 * - Invokes /api/ingest-parsed-tweet with a gemini_event_types payload
 * - Verifies that `event_type` stored in DB reflects heuristic merge
 */

import pg from 'pg';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('..', import.meta.url).pathname + '/.env.local' });

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3000';

async function main() {
  const client = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await client.connect();

  const tests = [
    { name: 'congratulation', keywords: ['बधाई', 'शुभकामन'], expect: 'congratulation' },
    { name: 'jayanti', keywords: ['जयंती', 'जन्म जयंती', 'jayanti'], expect: 'jayanti' },
  ];

  for (const t of tests) {
    // Find a tweet with the keyword
    // Use ILIKE to match keywords anywhere in the text (case-insensitive)
    const ilikePattern = `%(${t.keywords.join('|')})%`;
    const res = await client.query(`SELECT tweet_id as id, text, created_at, author_handle as author_id FROM raw_tweets WHERE text ILIKE $1 LIMIT 1`, [ilikePattern]);

    if (res.rows.length === 0) {
      console.log(`❌ No tweet found matching ${t.name} keywords - pattern=${pattern}`);
      continue;
    }

    const tweet = res.rows[0];

    console.log(`⚙️ Testing tweet ${tweet.id} for ${t.name}: ${tweet.text.slice(0,140)}`);

    // Build parsed payload with a Gemini event type that would otherwise override heuristics
    const payload = {
      tweet,
      categories: {
        locations: [],
        people: [],
        event: ['election_campaign'],
        organisation: [],
        schemes: [],
        communities: []
      },
      gemini_metadata: { model: 'gemini-2.0-flash', confidence: 0.85 }
    };

    const resp = await fetch(`${API_BASE}/api/ingest-parsed-tweet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await resp.json().catch(() => ({}));
    console.log('Ingest response:', resp.status, body);

    // Query parsed_events for the stored event_type
    const q = await client.query('SELECT event_type FROM parsed_events WHERE tweet_id = $1', [tweet.id]);
    if (q.rows.length === 0) {
      console.log(`❌ Tweet ${tweet.id} not found in parsed_events (maybe duplicate) - check DB`);
      continue;
    }
    const stored = q.rows[0].event_type;
    console.log(`✅ Stored event_type for ${tweet.id}:`, stored);

    // Pass/fail logic
    if (stored === t.expect || (Array.isArray(stored) && stored.includes(t.expect))) {
      console.log(`✅ Heuristic ${t.expect} preserved for ${tweet.id}`);
    } else {
      console.log(`❌ Heuristic not preserved. Expected '${t.expect}' in primary label for ${tweet.id}`);
    }
  }

  // Mixed case test: search for a tweet with both campaign context and a congratulation
  const mixedRes = await client.query("SELECT tweet_id as id, text, created_at, author_handle as author_id FROM raw_tweets WHERE text ILIKE '%चुनाव%' AND text ILIKE '%बधाई%' LIMIT 1");
  if (mixedRes.rows.length > 0) {
    const tweet = mixedRes.rows[0];
    console.log(`⚙️ Testing mixed-case tweet ${tweet.id}: ${tweet.text.slice(0,140)}`);
    const payload = {
      tweet,
      categories: { locations: [], people: [], event: ['election_campaign'], organisation: [], schemes: [], communities: [] },
      gemini_metadata: { model: 'gemini-2.0-flash', confidence: 0.85 }
    };

    const resp = await fetch(`${API_BASE}/api/ingest-parsed-tweet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await resp.json().catch(() => ({}));
    console.log('Ingest response:', resp.status, body);
    const q = await client.query('SELECT event_type FROM parsed_events WHERE tweet_id = $1', [tweet.id]);
    if (q.rows.length === 0) console.log('❌ Not stored in parsed_events');
    else console.log('✅ Stored event_type for mixed-case:', q.rows[0].event_type);
  } else {
    console.log('⚠️ No mixed-case tweet found to test (campaign + congratulation)');
  }

  await client.end();
}

main().catch(err => {
  console.error('Test failure', err);
  process.exit(1);
});
