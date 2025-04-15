from transformers import GPT2LMHeadModel, GPT2Tokenizer, Trainer, TrainingArguments, DataCollatorForLanguageModeling
from datasets import load_from_disk

# Load tokenized dataset
dataset = load_from_disk("tokenized_lua_dataset")
dataset = dataset.train_test_split(test_size=0.1)

# Load tokenizer and model
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
tokenizer.pad_token = tokenizer.eos_token  # Avoids warning
model = GPT2LMHeadModel.from_pretrained("gpt2")
model.resize_token_embeddings(len(tokenizer))

# Data collator: pads batches dynamically
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False  # We're using causal language modeling
)

# Training configuration
training_args = TrainingArguments(
    output_dir="./lua_gpt2_finetuned",
    overwrite_output_dir=True,
    num_train_epochs=10,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    warmup_steps=10,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_strategy="steps",
    logging_steps=10,
    save_total_limit=2,
    fp16=False  # Enable if your GPU supports it
)

# Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    tokenizer=tokenizer,
    data_collator=data_collator
)

# Fine-tune!
trainer.train()

# Save final model
trainer.save_model("./lua_gpt2_final")
tokenizer.save_pretrained("./lua_gpt2_final")
