Project_Dhruv/api/src/parsing/insert_data.py
import json
import os
from .milvus_setup import connect_milvus, create_collection
from .parser import extract_with_chunking
from .embeddings import generate_embedding, load_model

def insert_posts_into_milvus(posts_file='../../../opc_tweets.json', collection_name='opc_posts'):
    # Load data
    with open(posts_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    # Connect and create collection
    connect_milvus()
    collection = create_collection(collection_name)

    # Load model for embeddings
    tokenizer, model = load_model()

    # Prepare data for insertion
    ids = []
    timestamps = []
    contents = []
    embeddings = []
    parsed_metadatas = []

    for post in posts:
        id = post['id']
        timestamp = post['timestamp']
        content = post['content']

        # Extract parsed data
        extraction = extract_with_chunking(content)
        embedding = generate_embedding(content, tokenizer, model)

        ids.append(id)
        timestamps.append(timestamp)
        contents.append(content)
        embeddings.append(embedding)
        parsed_metadatas.append(extraction)

    # Insert into Milvus
    collection.insert([ids, timestamps, contents, embeddings, parsed_metadatas])
    collection.flush()
    print(f"Inserted {len(posts)} posts into Milvus.")

if __name__ == '__main__':
    insert_posts_into_milvus()
