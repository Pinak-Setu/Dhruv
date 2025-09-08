from transformers import AutoTokenizer, AutoModel
import torch
import json
import os

def load_model():
    model_name = 'ai4bharat/indic-bert'  # IndicBERT model for Hindi
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name)
    return tokenizer, model

def generate_embedding(text, tokenizer, model):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        # Use CLS token embedding
        embedding = outputs.last_hidden_state[:, 0, :].squeeze().tolist()
    return embedding

def get_embeddings_for_posts(posts_file='../../../opc_tweets.json'):
    tokenizer, model = load_model()
    with open(posts_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)
    embeddings = {}
    for post in posts:
        id = post['id']
        content = post['content']
        embedding = generate_embedding(content, tokenizer, model)
        embeddings[id] = embedding
    return embeddings

# Usage
if __name__ == '__main__':
    emb = get_embeddings_for_posts()
    print(f"Generated embeddings for {len(emb)} posts.")
