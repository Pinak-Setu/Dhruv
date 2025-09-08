import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from src.parsing.milvus_engine import MilvusEngine
from src.parsing.parser import LangExtractParser
from sentence_transformers import SentenceTransformer


def train_model(data_path: str):
    print(f"Loading data from {data_path}")
    with open(data_path, 'r') as f:
        posts = json.load(f)

    print("Initializing Milvus engine...")
    milvus_engine = MilvusEngine()

    print("Initializing LangExtract parser...")
    parser = LangExtractParser()

    print("Loading sentence transformer model...")
    model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

    print("Preparing data for Milvus...")
    data_to_insert = []
    for post in posts:
        content = post["content"]
        embedding = model.encode(content, convert_to_tensor=False).tolist()

        # Parse for new fields
        try:
            sentiment = parser.parse(content, "sentiment")
            theme = parser.parse(content, "theme")
            location = parser.parse(content, "location")
        except Exception as e:
            print(f"Error parsing post {post.get('id', 'N/A')}: {e}")
            sentiment = "unknown"
            theme = "unknown"
            location = "unknown"

        data_to_insert.append({
            "timestamp": post["timestamp"],
            "content": content,
            "embedding": embedding,
            "sentiment": sentiment,
            "purpose": theme,  # Using theme as purpose for now as per plan
            "parsed_metadata": json.dumps({"theme": theme, "location": location})
        })

    print(f"Inserting {len(data_to_insert)} records into Milvus...")
    milvus_engine.insert(data_to_insert)
    print("Data insertion complete.")


if __name__ == "__main__":
    print("Training model...")
    # Note: This assumes the script is run from the 'api' directory's parent.
    # A more robust path might be needed depending on execution context.
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'posts_new.json')
    train_model(data_path)
    print("Model training complete.")