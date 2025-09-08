from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import json
import os
import torch

def load_labeled_data(file_path='../../../data/labeled_training_data.json'):
    """
    Load labeled data from JSON file.
    """
    if not os.path.exists(file_path):
        print(f"Labeled data file {file_path} not found.")
        return None
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return Dataset.from_list(data)

def fine_tune_indicbert(train_dataset, val_dataset, output_dir='../../../models/indicbert_finetuned'):
    """
    Fine-tune IndicBERT for multi-label classification of themes.
    """
    if not train_dataset:
        print("No training data available.")
        return

    model_name = 'ai4bharat/indic-bert'
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # Multi-label classification
    num_labels = 5  # Adjust based on number of theme classes
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=num_labels,
        problem_type="multi_label_classification"
    )

    def tokenize_function(examples):
        return tokenizer(examples['content'], truncation=True, padding=True, max_length=512)

    train_tokenized = train_dataset.map(tokenize_function, batched=True)
    val_tokenized = val_dataset.map(tokenize_function, batched=True)

    # Example theme classes; customize as needed
    theme_classes = ['विकास', 'स्वास्थ्य', 'कृषि', 'संस्कृति', 'युवा']
    def map_labels(examples):
        labels = []
        for theme_list in examples.get('themes', []):
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
    os.makedirs(output_dir, exist_ok=True)
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"IndicBERT model saved to {output_dir}")

def fine_tune_sentiment(train_dataset, val_dataset, output_dir='../../../models/sentiment_finetuned'):
    """
    Fine-tune IndicBERT for sentiment classification (neutral, positive, negative).
    """
    if not train_dataset:
        print("No training data available.")
        return

    model_name = 'ai4bharat/indic-bert'
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=3)

    def tokenize_function(examples):
        return tokenizer(examples['content'], truncation=True, padding=True, max_length=512)

    train_tokenized = train_dataset.map(tokenize_function, batched=True)
    val_tokenized = val_dataset.map(tokenize_function, batched=True)

    sentiment_map = {'neutral': 0, 'positive': 1, 'negative': 2}
    def map_sentiment(examples):
        examples['labels'] = [sentiment_map.get(s, 0) for s in examples.get('sentiment', [])]
        return examples

    train_tokenized = train_tokenized.map(map_sentiment, batched=True)
    val_tokenized = val_tokenized.map(map_sentiment, batched=True)

    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        num_train_epochs=3,
        per_device_train_batch_size=8,
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
    print(f"Sentiment model saved to {output_dir}")

if __name__ == '__main__':
    dataset = load_labeled_data()
    if dataset:
        train_dataset = dataset.select(range(0, int(0.8 * len(dataset))))
        val_dataset = dataset.select(range(int(0.8 * len(dataset)), len(dataset)))

        fine_tune_indicbert(train_dataset, val_dataset)
        fine_tune_sentiment(train_dataset, val_dataset)
