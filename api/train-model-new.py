import os
import json
import sys
import time
from sentence_transformers import SentenceTransformer
from src.parsing.parser import create_parser, GeminiParser

# --- Configuration ---
EMBEDDING_MODEL = 'paraphrase-MiniLM-L6-v2'
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'posts_new.json')
CHECKPOINT_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'posts_new_checkpoint.json')
PROCESSED_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'posts_new_processed.json')

def load_checkpoint():
    """Load processing checkpoint"""
    if os.path.exists(CHECKPOINT_PATH):
        with open(CHECKPOINT_PATH, 'r') as f:
            return json.load(f)
    return {"last_processed_index": -1, "total_processed": 0}

def save_checkpoint(checkpoint):
    """Save processing checkpoint"""
    with open(CHECKPOINT_PATH, 'w') as f:
        json.dump(checkpoint, f, indent=2)

def save_processed_posts(processed_posts):
    """Save processed posts to file"""
    with open(PROCESSED_PATH, 'w', encoding='utf-8') as f:
        json.dump(processed_posts, f, ensure_ascii=False, indent=2)

def main():
    """Main function to run the data processing pipeline with rate limiting"""

    print("🚀 Starting LangExtract-Milvus-Gemini Pipeline with Rate Limiting")
    print("=" * 60)

    # 1. Load checkpoint and data
    print("\n1. 📂 Loading checkpoint and data...")
    checkpoint = load_checkpoint()
    last_processed = checkpoint.get("last_processed_index", -1)

    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        all_documents = json.load(f)

    print(f"   Total documents: {len(all_documents)}")
    print(f"   Last processed index: {last_processed}")
    print(f"   Remaining to process: {len(all_documents) - last_processed - 1}")

    # 2. Initialize Parser and Embedding Model
    print("\n2. 🤖 Initializing models...")
    try:
        parser = create_parser("gemini")  # Use Gemini with rate limiting
        print("   ✅ Using Gemini parser with rate limiting")
        print("   📊 Rate limits: 60 requests/minute, burst size: 10")
    except ValueError as e:
        print(f"   ⚠️  Gemini not available ({e}), falling back to LangExtract")
        parser = create_parser("langextract")

    embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    print("   ✅ Embedding model loaded")

    # 3. Process documents with checkpointing
    print("\n3. 🔄 Processing documents with rate limiting...")
    processed_posts = []
    batch_size = 5  # Smaller batches for rate limiting
    start_time = time.time()

    for i in range(last_processed + 1, len(all_documents), batch_size):
        batch_end = min(i + batch_size, len(all_documents))
        batch = all_documents[i:batch_end]

        print(f"\n   📦 Processing batch {i//batch_size + 1}: documents {i} to {batch_end-1}")

        for j, doc in enumerate(batch):
            doc_index = i + j
            content = doc.get("content", "")
            if not content:
                continue

            # Rate limiting status
            if isinstance(parser, GeminiParser):
                status = parser.get_rate_limit_status()
                print(f"   📈 Rate limit: {status['tokens_available']:.1f} tokens available, queue: {status['queue_size']}")

            # Extract structured data with error handling
            try:
                sentiment = parser.parse(content, "sentiment")
                theme = parser.parse(content, "theme")
                location = parser.parse(content, "location")
                print(f"   ✅ Parsed doc id: {doc.get('id', 'N/A')} (sentiment: {sentiment}, theme: {theme})")
            except Exception as e:
                print(f"   ❌ Error parsing document {doc.get('id')}: {e}")
                # Save checkpoint on error
                checkpoint["last_processed_index"] = doc_index - 1
                checkpoint["total_processed"] = len(processed_posts)
                save_checkpoint(checkpoint)
                continue

            # Generate embedding
            try:
                embedding = embedding_model.encode(content, convert_to_tensor=False).tolist()
            except Exception as e:
                print(f"   ❌ Error generating embedding for document {doc.get('id')}: {e}")
                continue

            # Create processed post entry
            processed_post = {
                "id": doc.get("id"),
                "timestamp": doc.get("timestamp"),
                "content": content,
                "embedding": embedding,
                "sentiment": sentiment,
                "purpose": theme,
                "parsed_metadata": json.dumps({
                    "theme": theme,
                    "location": location,
                    "sentiment": sentiment
                })
            }
            processed_posts.append(processed_post)

            # Update checkpoint
            checkpoint["last_processed_index"] = doc_index
            checkpoint["total_processed"] = len(processed_posts)

        # Save checkpoint after each batch
        save_checkpoint(checkpoint)
        save_processed_posts(processed_posts)

        # Progress reporting
        elapsed = time.time() - start_time
        docs_per_sec = len(processed_posts) / elapsed if elapsed > 0 else 0
        progress_pct = (len(processed_posts) / len(all_documents)) * 100
        print(f"   📊 Progress: {len(processed_posts)}/{len(all_documents)} processed ({docs_per_sec:.2f} docs/sec, {progress_pct:.1f}%)")

        # Rate limiting: delay between batches
        if isinstance(parser, GeminiParser):
            print("   ⏱️  Rate limiting: waiting 3 seconds...")
            time.sleep(3)  # 3 second delay for Gemini rate limiting
        else:
            time.sleep(1)  # 1 second delay for LangExtract

    # Final save
    save_processed_posts(processed_posts)
    save_checkpoint(checkpoint)

    print("\n" + "=" * 60)
    print("🎉 Pipeline Complete!")
    print(f"   📊 Total processed: {len(processed_posts)}/{len(all_documents)}")
    print(f"   💾 Processed posts saved to: {PROCESSED_PATH}")
    print(f"   📋 Checkpoint saved to: {CHECKPOINT_PATH}")

    # Rate limiting summary
    if isinstance(parser, GeminiParser):
        final_status = parser.get_rate_limit_status()
        print(f"   📈 Final rate limit status: {final_status}")

        print("\n✅ Ready for next steps: Dashboard integration and human review!")

if __name__ == "__main__":
    # Set up environment
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    # Check for Gemini API key
    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️  Warning: GEMINI_API_KEY not set. Using LangExtract fallback.")
        print("   To use Gemini with rate limiting, set: export GEMINI_API_KEY='your-api-key'")
    else:
        print("🔑 Gemini API key detected - using Gemini with rate limiting!")

    main()

if __name__ == "__main__":
    # Set up environment
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    # Check for Gemini API key
    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️  Warning: GEMINI_API_KEY not set. Using LangExtract fallback.")
        print("   To use Gemini with rate limiting, set: export GEMINI_API_KEY='your-api-key'")
    else:
        print("🔑 Gemini API key detected - using Gemini with rate limiting!")

    main()