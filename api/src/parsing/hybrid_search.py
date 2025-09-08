Project_Dhruv/api/src/parsing/hybrid_search.py
import numpy as np
from pymilvus import Collection, connections
from .embeddings import generate_embedding, load_model

def connect_and_load_collection(collection_name="opc_posts", uri="http://localhost:19530"):
    connections.connect("default", uri=uri)
    collection = Collection(collection_name)
    collection.load()
    return collection

def hybrid_search(collection, query_text, filter_expr="", top_k=10):
    """
    Perform hybrid search: semantic (vector) + metadata filter.
    Example filter: 'parsed_metadata["themes"] like "महिला%"' for theme match.
    """
    # Load model for query embedding
    tokenizer, model = load_model()
    query_embedding = generate_embedding(query_text, tokenizer, model)

    # Perform vector search with filter
    search_params = {
        "metric_type": "COSINE",
        "params": {"nprobe": 16}
    }
    results = collection.search(
        [query_embedding],
        "embedding",
        search_params,
        limit=top_k,
        expr=filter_expr,  # e.g., 'parsed_metadata["sentiment"] == "positive"'
        output_fields=["id", "timestamp", "content", "parsed_metadata"]
    )

    # Format results
    formatted_results = []
    for hit in results[0]:
        entity = hit.entity
        formatted_results.append({
            "id": entity.get("id"),
            "timestamp": entity.get("timestamp"),
            "content": entity.get("content"),
            "parsed_metadata": entity.get("parsed_metadata"),
            "distance": hit.distance
        })
    return formatted_results

# Example usage
if __name__ == "__main__":
    collection = connect_and_load_collection()
    # Search for "महिला सशक्तिकरण" with filter on sentiment
    results = hybrid_search(collection, "महिला सशक्तिकरण", filter_expr='parsed_metadata["sentiment"] == "positive"')
    print(f"Hybrid search results: {len(results)}")
    for res in results[:3]:
        print(res)
