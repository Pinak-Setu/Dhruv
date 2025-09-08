import os
from pymilvus import (
    connections, FieldSchema, CollectionSchema, DataType,
    Collection, utility
)

# Milvus collection schema for hybrid search
def create_collection_schema():
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
        FieldSchema(name="timestamp", dtype=DataType.VARCHAR, max_length=50),
        FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=1024),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768),  # For IndicBERT
        FieldSchema(name="parsed_metadata", dtype=DataType.JSON),  # Stores LangExtract outputs like themes, sentiment
    ]
    schema = CollectionSchema(fields, description="Collection for OP Choudhary posts with hybrid search")
    return schema

def connect_milvus(uri="http://localhost:19530"):
    connections.connect("default", uri=uri)
    print("Connected to Milvus")

def create_collection(collection_name="opc_posts"):
    schema = create_collection_schema()
    if utility.has_collection(collection_name):
        collection = Collection(collection_name)
        print(f"Collection {collection_name} already exists")
    else:
        collection = Collection(collection_name, schema)
        print(f"Created collection {collection_name}")

    # Create index for cosine similarity on embedding field
    if not collection.has_index():
        index_params = {
            "index_type": "IVF_FLAT",
            "metric_type": "COSINE",
            "params": {"nlist": 128}
        }
        collection.create_index("embedding", index_params)
        print(f"Index created on embedding for cosine similarity")

    # Load collection for search
    collection.load()
    return collection

# Test
if __name__ == '__main__':
    connect_milvus()
    collection = create_collection()
