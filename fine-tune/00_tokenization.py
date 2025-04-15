from transformers import GPT2Tokenizer
from datasets import Dataset
import pandas as pd
import json

# Load GPT2 tokenizer
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
tokenizer.pad_token = tokenizer.eos_token

# Load the dataset
data_path = "lua_data.jsonl"
examples = []

with open(data_path, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        line = line.strip()
        if not line:
            continue  # skip empty lines
        try:
            item = json.loads(line)
            examples.append({
                "input_text": item["code"],
                "target_text": item["explanation"]
            })
        except json.JSONDecodeError:
            print(f"[Warning] Skipping invalid JSON on line {line_num}")

# Convert to Hugging Face Dataset
df = pd.DataFrame(examples)
dataset = Dataset.from_pandas(df)

# Tokenize function
def tokenize(example):
    input_enc = tokenizer(example["input_text"], truncation=True, padding="max_length", max_length=128)
    target_enc = tokenizer(example["target_text"], truncation=True, padding="max_length", max_length=128)
    return {
        "input_ids": input_enc["input_ids"],
        "attention_mask": input_enc["attention_mask"],
        "labels": target_enc["input_ids"]
    }

# Apply tokenization
tokenized_dataset = dataset.map(tokenize)

# Save tokenized dataset (optional)
tokenized_dataset.save_to_disk("tokenized_lua_dataset")
