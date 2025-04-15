#!/usr/bin/env python
"""
finetune_codegen.py

A script to fine-tune the Salesforce/codegen-350M-mono model using the Hugging Face Trainer API.
It assumes you have a dataset file "lua_data.jsonl" in the same directory.
Each line of the file should be a JSON object with the keys:
  - "code": a string containing a Lua code snippet
  - "explanation": a string explaining that code snippet

The script combines both fields into a single training sample.
"""

import os
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    DataCollatorForLanguageModeling,
    TrainingArguments,
    Trainer,
)
import torch


def tokenize_function(example, tokenizer):
    # Combine the code and explanation into a single prompt.
    # The prompt format is: "<code snippet>\nExplanation: <explanation> <eos_token>"
    prompt = example["code"] + "\nExplanation: " + example["explanation"] + " " + tokenizer.eos_token
    tokenized = tokenizer(prompt, truncation=True, max_length=512)
    return tokenized


def main():
    # Define model and output directories
    model_name = "Salesforce/codegen-350M-mono"
    output_dir = "./finetuned_codegen"

    # Load the tokenizer and model
    print("Loading tokenizer and model...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # Ensure a pad token is set; if not, set it to the EOS token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_name)

    # Check if dataset file exists
    data_file = "lua_data.jsonl"
    if not os.path.isfile(data_file):
        raise FileNotFoundError(f"Dataset file '{data_file}' not found. Please prepare your lua_data.jsonl file.")

    # Load dataset using the datasets library
    print("Loading dataset...")
    dataset = load_dataset("json", data_files={"train": data_file}, split="train")

    # Preprocess (tokenize) the dataset using the defined function
    print("Tokenizing dataset...")
    tokenized_dataset = dataset.map(lambda ex: tokenize_function(ex, tokenizer), batched=False)
    # Remove original columns as they are no longer needed
    tokenized_dataset = tokenized_dataset.remove_columns(["code", "explanation"])
    tokenized_dataset.set_format("torch")

    # (Optional) For quicker testing, you can use a subset:
    # tokenized_dataset = tokenized_dataset.shuffle(seed=42).select(range(1000))

    # Define a data collator for causal language modeling (MLM disabled)
    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    # Define training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        overwrite_output_dir=True,
        num_train_epochs=3,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=16,
        save_steps=500,
        logging_steps=50,
        fp16=True,
        report_to="none",
    )

    # Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer,
    )

    # Start training
    print("Starting training...")
    trainer.train()

    # Save the fine-tuned model and tokenizer
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Model and tokenizer saved to '{output_dir}'.")


if __name__ == "__main__":
    main()
