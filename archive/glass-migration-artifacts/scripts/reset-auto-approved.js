import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: './.env.local' });

async function resetTweet(tweetId) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('Resetting tweet', tweetId);
    await client.query(
      `UPDATE parsed_events SET review_status = 'pending', needs_review = true WHERE tweet_id = $1`,
      [tweetId]
    );
    const r = await client.query('SELECT tweet_id, review_status, needs_review FROM parsed_events WHERE tweet_id = $1', [tweetId]);
    console.log('Result:', r.rows[0]);
  } finally {
    await client.end();
  }
}

(async () => {
  const ids = ['1985908786767573481'];
  for (const id of ids) {
    await resetTweet(id);
  }
})();
