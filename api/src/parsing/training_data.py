
<file_path>
Project_Dhruv/api/src/parsing/training_data.py
</file_path>

<edit_description>
Recreate training_data.py for auto-labeling posts using LangExtract and existing data.
</edit_description>

import json
import os
from .parser import extract_with_chunking
from .prompts import prompts

def auto_label_posts(posts_file='../../../data/opc_tweets.json', output_file='../../../data/labeled_training_data.json'):
    """
    Auto-label 271 posts using LangExtract for themes, sentiment, purpose, etc.
    Outputs JSON with labels for fine-tuning IndicBERT.
    """
    if not os.path.exists(posts_file):
        print(f"Posts file {posts_file} not found.")
        return

    with open(posts_file, 'r', encoding='utf-8') as f:
        all_posts = json.load(f)

    labeled_data = []
    for post in all_posts[:271]:  # Limit to 271 posts
        text = post.get('content', '')
        if not text:
            continue

        # Extract using LangExtract
        extraction = extract_with_chunking(text)

        # Map to labels for ML
        labels = {
            'id': post['id'],
            'content': text,
            'timestamp': post.get('timestamp', ''),
            'themes': extraction.get('themes', []),
            'sentiment': extraction.get('sentiment', 'neutral'),
            'purpose': extraction.get('purpose', ''),
            'locations': [e['text'] for e in extraction.get('entities', []) if e.get('type') == 'LOCATION'],
            'events': [e['text'] for e in extraction.get('entities', []) if e.get('type') == 'EVENT'],
            'mentions': [e['text'] for e in extraction.get('entities', []) if e.get('type') == 'MENTION'],
            'hashtags': [e['text'] for e in extraction.get('entities', []) if e.get('type') == 'TAG'],
        }
        labeled_data.append(labels)

    # Save to output file
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(labeled_data, f, ensure_ascii=False, indent=2)

    print(f"Auto-labeled {len(labeled_data)} posts for training.")

if __name__ == '__main__':
    auto_label_posts()

```
<file_path>
Project_Dhruv/api/src/parsing/fine_tune.py
</file_path>

<edit_description>
Recreate fine_tune.py for IndicBERT fine-tuning on labeled data.
</edit_description>

from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import json
import os
from torch.utils.data import DataLoader

def load_labeled_data(file_path='../../../data/labeled_training_data.json'):
    if not os.path.exists(file_path):
        print(f"Labeled data file {file_path} not found.")
        return None
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return Dataset.from_list(data)

def fine_tune_indicbert(train_dataset, val_dataset, output_dir='../../../models/indicbert_finetuned'):
    if not train_dataset:
        print("No training data available.")
        return

    model_name = 'ai4bharat/indic-bert'
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # Multi-label classification for themes
    num_labels = 5  # Assuming 5 theme classes, adjust as needed
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=num_labels,
        problem_type="multi_label_classification"
    )

    def tokenize_function(examples):
        return tokenizer(examples['content'], truncation=True, padding=True, max_length=512)

    train_tokenized = train_dataset.map(tokenize_function, batched=True)
    val_tokenized = val_dataset.map(tokenize_function, batched=True)

    # Convert themes to one-hot
    theme_classes = ['विकास', 'स्वास्थ्य', 'कृषि', 'संस्कृति', 'युवा']  # Example classes
    def map_labels(examples):
        labels = []
        for theme_list in examples['themes']:
            label = [1 if t in theme_list else 0 for t in theme_classes]
            labels.append(label)
        examples['labels'] = labels
        return examples

    train_tokenized = train_tokenized.map(map_labels, batched=True)
    val_tokenized = val_tokenized.map(map_labels, batched=True)

    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        num_train_epochs=3,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        logging_dir='../../../logs',
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tokenized,
        eval_dataset=val_tokenized,
        tokenizer=tokenizer,
    )

    trainer.train()
    os.makedirs(output_dir, exist_ok=True)
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Model saved to {output_dir}")

# For sentiment (binary or multi-class)
def fine_tune_sentiment(train_dataset, val_dataset, output_dir='../../../models/sentiment_finetuned'):
    if not train_dataset:
        print("No training data available.")
        return

    model_name = 'ai4bharat/indic-bert'
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=3)  # neutral, positive, negative

    def tokenize_function(examples):
        return tokenizer(examples['content'], truncation=True, padding=True, max_length=512)

    train_tokenized = train_dataset.map(tokenize_function, batched=True)
    val_tokenized = val_dataset.map(tokenize_function, batched=True)

    sentiment_map = {'neutral': 0, 'positive': 1, 'negative': 2}
    def map_sentiment(examples):
        examples['labels'] = [sentiment_map.get(s, 0) for s in examples['sentiment']]
        return examples

    train_tokenized = train_tokenized.map(map_sentiment, batched=True)
    val_tokenized = val_tokenized.map(map_sentiment, batched=True)

    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        num_train_epochs=3,
        per_device_train_batch_size=8,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tokenized,
        eval_dataset=val_tokenized,
        tokenizer=tokenizer,
    )

    trainer.train()
    os.makedirs(output_dir, exist_ok=True)
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Sentiment model saved to {output_dir}")

if __name__ == '__main__':
    dataset = load_labeled_data()
    if dataset:
        train_dataset = dataset.select(range(0, int(0.8 * len(dataset))))
        val_dataset = dataset.select(range(int(0.8 * len(dataset)), len(dataset)))

        fine_tune_indicbert(train_dataset, val_dataset)
        fine_tune_sentiment(train_dataset, val_dataset)

```
<file_path>
Project_Dhruv/api/data/reviewed_posts.json
</file_path>

<edit_description>
Create reviewed_posts.json for storing approved corrections.
</edit_description>

[]

```
<file_path>
Project_Dhruv/api/data/labeled_training_data.json
</file_path>

<edit_description>
Create placeholder for labeled training data output.
</edit_description>

[]
