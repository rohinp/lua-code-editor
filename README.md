# Lua Intelligent IDE (Browser-Based PoC)

## Project Idea

This project aims to explore the feasibility of creating a lightweight, intelligent IDE for the Lua programming language that runs entirely within the web browser. The core idea is to leverage modern web technologies and small, efficient machine learning models (using ONNX Runtime Web and Transformers.js) to provide features like code explanation directly in the client-side environment.

The initial focus is on providing simple, one-to-two-line explanations for Lua code snippets (5-50 lines).

## Current Functionality (As of this commit)

*   **React Frontend:** The application is built using React and Vite.
*   **Lua Code Editor:** Integrated `CodeMirror` via `@uiw/react-codemirror` to provide a basic code editor with Lua syntax highlighting.
*   **UI Elements:** Includes an input area for Lua code and an "Explain" button.
*   **ONNX Runtime Setup:**
    *   `onnxruntime-web` dependency is installed.
    *   Helper WASM files for ONNX Runtime are copied to the `public/dist` directory.
    *   Basic structure to load an ONNX model (`InferenceSession`) is implemented in `App.jsx`.
*   **Model/Tokenizer Files (Placeholder):**
    *   Downloaded ONNX model files (non-quantized T5-small: `encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`) and placed them in `public/model/`.
    *   Downloaded associated tokenizer files (`tokenizer.json`, `spiece.model`, etc.) and placed them in `public/tokenizer/`.
*   **Explain Button (Dummy):** Clicking the "Explain" button currently displays a placeholder "Processing..." message followed by a "not implemented yet" notice.

## Pending Items / Next Steps

1.  **Integrate `transformers.js`:**
    *   Install `@xenova/transformers`. (Done)
    *   Use the `pipeline` function or `AutoTokenizer`/`AutoModelForSeq2SeqLM` classes from `transformers.js` to load the tokenizer files from `public/tokenizer/`.
    *   Configure `transformers.js` to use the ONNX models located in `public/model/` via ONNX Runtime.
2.  **Implement Inference Logic:**
    *   In the `handleExplainClick` function:
        *   Prepare the input code (potentially adding a task-specific prefix like "explain Lua: ").
        *   Use the loaded `transformers.js` pipeline/model to generate an explanation based on the Lua code in the editor.
        *   Handle the asynchronous nature of model inference.
        *   Decode the model's output tensor back into human-readable text.
3.  **Display Explanation:** Update the UI to show the actual explanation received from the model instead of the placeholder text.
4.  **Error Handling & UI Improvements:** Add more robust error handling for model loading and inference. Improve UI feedback (e.g., more specific loading states).
5.  **(Future) Explore Quantized Models:** If performance/size is an issue, revisit finding and using quantized versions of the model (e.g., `t5-small-quantized` or `phi-2-quantized`).
6.  **(Future) Fine-tuning:** Explore offline fine-tuning of a small model specifically on Lua code explanation tasks for better accuracy.

---

*This README was generated based on the project state during development.*
