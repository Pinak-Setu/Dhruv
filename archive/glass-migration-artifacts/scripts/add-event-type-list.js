import { Client } from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: './.env.local' });

async function run() {
  const sql = readFileSync(join(process.cwd(), 'scripts/migrations/20251115_add_event_type_list.sql')).toString();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('Running migration: Add event_type_list to parsed_events');
    await client.query(sql);
    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run().catch((err) => { console.error(err); process.exit(1); });
