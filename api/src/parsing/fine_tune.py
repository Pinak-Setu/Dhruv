from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import json
import torch
import os

# Load labeled data from training_data.py output
def load_labeled_data(file_path='labeled_training_data.json'):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return Dataset.from_list(data)

# Fine-tune for multi-label (themes) and sentiment
def fine_tune_indicbert(train_dataset, val_dataset, output_dir='./indicbert_finetuned'):
    model_name = 'ai4bharat/indic-bert'
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # For multi-label, use classification with sigmoid
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=10,  # Adjust based on theme/purpose classes
        problem_type="multi_label_classification"
    )

    # Tokenize datasets
    def tokenize_function(examples):
        return tokenizer(examples['content'], truncation=True, padding=True, max_length=512)

    train_tokenized = train_dataset.map(tokenize_function, batched=True)
    val_tokenized = val_dataset.map(tokenize_function, batched=True)

    # Prepare labels (one-hot for multi-label)
    # Assuming themes are list of strings, map to indices
    theme_classes = ['विकास', 'स्वास्थ्य', 'कृषि', 'संस्कृति', 'युवा']  # Example; extend
    def map_labels(examples):
        labels = []
        for theme_list in examples['themes']:
            label = [1 if t in theme_list else 0 for t in theme_classes]
            labels.append(label)
        examples['labels'] = labels
        return examples

    train_tokenized = train_tokenized.map(map_labels, batched=True)
    val_tokenized = val_tokenized.map(map_labels, batched=True)

    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        num_train_epochs=3,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        logging_dir='./logs',
        logging_steps=10,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tokenized,
        eval_dataset=val_tokenized,
        tokenizer=tokenizer,
    )

    trainer.train()
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Model saved to {output_dir}")

# For sentiment (3-class)
def fine_tune_sentiment(train_dataset, val_dataset, output_dir='./sentiment_finetuned'):
    model_name = 'ai4bharat/indic-bert'
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=3)  # neutral, positive, negative

    def tokenize_function(examples):
        return tokenizer(examples['content'], truncation=True, padding=True, max_length=512)

    train_tokenized = train_dataset.map(tokenize_function, batched=True)
    val_tokenized = val_dataset.map(tokenize_function, batched=True)

    # Map sentiment to labels
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
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Sentiment model saved to {output_dir}")

if __name__ == '__main__':
    dataset = load_labeled_data()
    train_dataset = dataset.select(range(0, int(0.8 * len(dataset))))
    val_dataset = dataset.select(range(int(0.8 * len(dataset)), len(dataset)))

    fine_tune_indicbert(train_dataset, val_dataset)
    fine_tune_sentiment(train_dataset, val_dataset)
