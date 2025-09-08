import json
import os
from .parser import extract_with_chunking
from .prompts import prompts

def auto_label_posts(posts_file='../../../opc_tweets.json', output_file='labeled_training_data.json'):
    """
    Auto-label 271 posts using LangExtract for themes, sentiment, purpose, etc.
    Outputs JSON with labels for fine-tuning IndicBERT.
    """
    with open(posts_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    labeled_data = []
    for post in posts:
        text = post['content']
        extraction = extract_with_chunking(text)

        # Map to labels for ML
        labels = {
            'id': post['id'],
            'content': text,
            'timestamp': post['timestamp'],
            'themes': extraction.get('themes', []),  # From LangExtract
            'sentiment': extraction.get('sentiment', 'neutral'),
            'purpose': extraction.get('purpose', ''),
            'locations': [e['text'] for e in extraction.get('entities', []) if e.get('type') == 'LOCATION'],
            'events': [e['text'] for e in extraction.get('entities', []) if e.get('type') == 'EVENT'],
            'mentions': [e['text'] for e in extraction.get('entities', []) if e.get('type') == 'MENTION'],
            'hashtags': [e['text'] for e in extraction.get('entities', []) if e.get('type') == 'TAG'],
            'grounding_offsets': extraction.get('entities', [])  # For verification
        }
        labeled_data.append(labels)

    # Save to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(labeled_data, f, ensure_ascii=False, indent=2)

    print(f"Auto-labeled {len(labeled_data)} posts for training.")

if __name__ == '__main__':
    auto_label_posts()
