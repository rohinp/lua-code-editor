#!/usr/bin/env python
"""
convert_to_onnx.py

This script loads the fine-tuned model and tokenizer from the "./finetuned_codegen" directory,
creates a dummy input, and exports the model to ONNX format using opset version 14.
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def main():
    # Directory where your fine-tuned model and tokenizer have been saved.
    model_dir = "./finetuned_codegen"
    onnx_output_path = "finetuned_codegen.onnx"

    print("Loading fine-tuned model and tokenizer from", model_dir)
    # Load the fine-tuned model and tokenizer from the specified directory
    model = AutoModelForCausalLM.from_pretrained(model_dir)
    tokenizer = AutoTokenizer.from_pretrained(model_dir)

    # Ensure that the tokenizer has a pad token; if not, set it to EOS token.
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model.eval()  # Set model to evaluation mode

    # Create a dummy prompt for export. Adjust this prompt and max_length as needed.
    prompt = "function add(a, b) return a + b end"
    dummy_inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=128)
    dummy_input_ids = dummy_inputs.input_ids.to("cpu")  # Using CPU for export

    print("Exporting the model to ONNX format with opset_version=14...")
    # Export the model using torch.onnx.export. Note that we set opset_version=14.
    torch.onnx.export(
        model,                                # the model being exported
        dummy_input_ids,                      # dummy input for the model
        onnx_output_path,                     # output file path
        export_params=True,                   # store the trained parameter weights in the model file
        opset_version=14,                     # use opset 14 to support aten::triu operator
        do_constant_folding=True,             # perform constant folding for optimization
        input_names=["input_ids"],            # name of the model's input
        output_names=["logits"],              # name of the model's output
        dynamic_axes={                        # variable axes for dynamic input size
            "input_ids": {0: "batch_size", 1: "sequence_length"},
            "logits": {0: "batch_size", 1: "sequence_length"},
        }
    )

    print(f"ONNX model exported successfully to {onnx_output_path}")

if __name__ == "__main__":
    main()
