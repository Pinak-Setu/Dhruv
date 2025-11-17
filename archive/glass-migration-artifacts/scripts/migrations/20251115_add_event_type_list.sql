-- Migration: Add event_type_list to parsed_events (JSONB)
-- Purpose: Persist merged event-type labels from ingestion (Gemini + heuristics)

BEGIN;

ALTER TABLE parsed_events
  ADD COLUMN IF NOT EXISTS event_type_list JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill existing rows: if an event_type exists, set event_type_list to [event_type]
UPDATE parsed_events
  SET event_type_list = to_jsonb(ARRAY[event_type]::text[])
  WHERE event_type IS NOT NULL;

COMMIT;

-- Notes:
-- Run this with: psql "$DATABASE_URL" -f scripts/migrations/20251115_add_event_type_list.sql