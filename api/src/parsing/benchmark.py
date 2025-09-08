
<file_path>

Project_Dhruv/api/src/parsing/benchmark.py

</file_path>

import time
import json
from .hybrid_search import connect_and_load_collection, hybrid_search
from .embeddings import generate_embedding, load_model

def benchmark_milvus_search(collection_name="opc_posts", posts_file='../../../opc_tweets.json', num_queries=10):
    """
    Benchmark Milvus search performance on the 271 posts.
    Measures average query time for semantic search.
    """
    # Load posts for queries
    with open(posts_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    collection = connect_and_load_collection(collection_name)

    # Generate sample queries from posts
    tokenizer, model = load_model()
    query_times = []

    for i in range(num_queries):
        # Use a post content as query
        query_text = posts[i % len(posts)]['content'][:50]  # Short query

        start_time = time.time()
        results = hybrid_search(collection, query_text, top_k=10)
        end_time = time.time()

        query_time = end_time - start_time
        query_times.append(query_time)
        print(f"Query {i+1}: {query_time:.4f}s, Results: {len(results)}")

    avg_time = sum(query_times) / len(query_times)
    print(f"Average query time: {avg_time:.4f}s")

    # Check against threshold (<0.5s per query)
    if avg_time < 0.5:
        print("Benchmark passed: Performance is good.")
    else:
        print("Benchmark failed: Query too slow.")

    return avg_time

if __name__ == "__main__":
    benchmark_milvus_search()
