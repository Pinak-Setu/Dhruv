# Single-Layer Tweet Ingestion Pipeline

## Overview

The single-layer ingestion pipeline provides a streamlined, production-ready solution for processing tweets using Gemini AI. This replaces the previous three-layer consensus system with a simplified, more reliable approach that focuses on safety, backups, and operational simplicity.

## Architecture

### Single-Layer Processing Flow

```
Raw Tweets → Gemini Parsing → API Ingestion → Vector Indexing → Analytics
     ↓            ↓              ↓              ↓            ↓
  Database    scripts/single-   /api/ingest-   FAISS/Milvus  Dashboard
              layer-ingest.js   parsed-tweet   Trigger       Updates
```

### Key Components

1. **Database**: PostgreSQL with `raw_tweets` table
2. **Gemini AI**: Google's Gemini 2.0 Flash for tweet parsing
3. **Ingestion API**: `/api/ingest-parsed-tweet` endpoint
4. **Vector Services**: FAISS and Milvus for semantic search
5. **Backup System**: Comprehensive per-tweet and per-batch backups

## Safety Contract

### Environment Variables Required
- `GEMINI_API_KEY`: Valid Gemini API key (must be current)
- `DATABASE_URL`: PostgreSQL connection string
- `API_BASE`: Dashboard API base URL (default: http://127.0.0.1:3000)

### Safety Guarantees
- **NO DELETES**: Script never deletes data from database
- **COMPREHENSIVE BACKUPS**: All operations backed up before processing
- **CIRCUIT BREAKER**: Stops processing after 5 consecutive Gemini failures
- **RATE LIMITING**: Configurable RPM with built-in delays
- **ERROR HANDLING**: Retry queues and detailed failure logging

### Review Flags (Always Use These)
- `--dry-run`: Test without database writes or API calls
- `--test-mode`: Use mock data instead of real database
- `--batch-size=N`: Control batch size (default: 10)
- `--max-batches=N`: Limit total batches processed
- `--rpm=N`: Control Gemini API rate (default: 60)

## Usage Instructions

### Step 1: Environment Setup
```bash
# Ensure environment variables are set
export GEMINI_API_KEY="your-valid-key"
export DATABASE_URL="postgresql://..."
export API_BASE="http://127.0.0.1:3000"
```

### Step 2: Dry Run Testing
```bash
# Test with mock data (no database or API calls)
node scripts/single-layer-ingest.js --dry-run --test-mode --batch-size=5 --max-batches=1

# Test against real database (no ingestion)
node scripts/single-layer-ingest.js --dry-run --batch-size=5 --max-batches=1
```

### Step 3: Production Ingestion
```bash
# Small production batch
node scripts/single-layer-ingest.js --batch-size=5 --max-batches=1 --rpm=30

# Larger production batch
node scripts/single-layer-ingest.js --batch-size=10 --max-batches=5 --rpm=60
```

### Step 4: Full Pipeline Run
```bash
# Process all pending tweets (unlimited batches)
node scripts/single-layer-ingest.js --batch-size=10 --rpm=60
```

## Command Line Options

| Flag | Default | Description |
|------|---------|-------------|
| `--batch-size <N>` | 10 | Tweets per batch |
| `--max-batches <N>` | 0 (unlimited) | Maximum batches to process |
| `--concurrency <N>` | 1 | Concurrent workers per batch |
| `--rpm <N>` | 60 | Gemini API requests per minute |
| `--api-base <URL>` | http://127.0.0.1:3000 | Dashboard API base URL |
| `--dry-run` | false | Test mode, no database writes |
| `--test-mode` | false | Use mock data instead of database |

## Monitoring & Verification

### Check Processing Status
```bash
# View tweet processing status
node scripts/check_tweets.py

# Check database counts
python3 scripts/check_parsed_count.py
```

### Backup Locations
- **Per-tweet backups**: `.taskmaster/backups/tweets/YYYY-MM-DD.jsonl`
- **Batch backups**: `.taskmaster/backups/single-layer/batch-XXXX-timestamp.jsonl`
- **Failed tweets**: `.taskmaster/backups/single-layer/failed_tweets.jsonl`
- **Retry queue**: `.taskmaster/backups/single-layer/retry_queue.jsonl`
- **Summary**: `.taskmaster/backups/single-layer/ingestion-summary.json`

### Health Checks
The script automatically performs health checks for:
- Dashboard API (`/api/health`)
- Vector services (FAISS/Milvus)
- Gemini API responsiveness

## Error Handling

### Circuit Breaker
- Stops after 5 consecutive Gemini parsing failures
- Prevents wasting API quota on persistent issues
- Requires manual intervention to resume

### Retry Logic
- Failed tweets logged to retry queue
- Status updated to `pending_retry`
- Can be reprocessed after fixing issues

### Rate Limiting
- Built-in delays between Gemini API calls
- Configurable RPM to respect API limits
- Automatic backoff on rate limit errors

## Database Schema

### Raw Tweets Table
```sql
CREATE TABLE raw_tweets (
  tweet_id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  author_handle TEXT,
  processing_status TEXT DEFAULT 'pending'
);
```

### Parsed Events Table
```sql
CREATE TABLE parsed_events (
  id SERIAL PRIMARY KEY,
  tweet_id TEXT REFERENCES raw_tweets(tweet_id),
  categories JSONB,
  gemini_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

1. **Gemini API Key Expired**
   ```
   ❌ Missing or invalid GEMINI_API_KEY
   ```
   - Renew API key in Google AI Studio
   - Update `.env.local` file

2. **Database Connection Failed**
   ```
   ❌ Database connection error
   ```
   - Verify `DATABASE_URL` format
   - Check PostgreSQL service status

3. **API Health Check Failed**
   ```
   ❌ API health check failed
   ```
   - Ensure dashboard is running on `API_BASE`
   - Check `/api/health` endpoint

4. **Rate Limit Exceeded**
   ```
   ❌ Gemini API rate limit exceeded
   ```
   - Reduce `--rpm` value
   - Wait for quota reset

### Recovery Procedures

1. **Resume After Circuit Breaker**
   ```bash
   # Check failed tweets
   cat .taskmaster/backups/single-layer/failed_tweets.jsonl | tail -10

   # Resume with smaller batch
   node scripts/single-layer-ingest.js --batch-size=2 --max-batches=1 --rpm=10
   ```

2. **Reprocess Failed Tweets**
   ```bash
   # Reset failed tweets to pending
   psql $DATABASE_URL -c "UPDATE raw_tweets SET processing_status = 'pending' WHERE processing_status = 'failed';"

   # Re-run ingestion
   node scripts/single-layer-ingest.js --batch-size=5 --rpm=30
   ```

## Performance Benchmarks

- **Batch Size**: 10 tweets
- **Processing Time**: ~2-3 minutes per batch
- **Gemini RPM**: 60 requests/minute
- **Memory Usage**: < 200MB
- **Success Rate**: >95% (with valid API key)

## Migration from Three-Layer System

This single-layer system replaces the previous consensus-based approach:

- **Simpler**: One LLM call instead of three
- **Faster**: Reduced API calls and processing time
- **Safer**: Comprehensive backups and error handling
- **More Reliable**: Less complex logic, fewer failure points

### Data Compatibility
- Existing parsed data remains valid
- New parsing uses updated Gemini prompts
- Analytics API handles both old and new formats

## Future Enhancements

- Real-time processing WebSocket updates
- Advanced error recovery automation
- Performance analytics dashboard
- Multi-language tweet support
- Automated API key rotation