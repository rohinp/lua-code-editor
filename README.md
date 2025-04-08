# Lua Code Editor with AI Explanation

## Project Overview

This project is a proof-of-concept for a browser-based Lua code editor with AI-powered code explanation capabilities. The application runs entirely within the web browser, making it suitable for secure environments including air-gapped systems. It leverages modern web technologies and machine learning to provide intelligent features without requiring external API calls.

## Current Features

* **Responsive UI**: Clean, modern interface built with React and Vite
* **Lua Code Editor**: Full-featured code editor with syntax highlighting via CodeMirror
* **AI-Powered Explanations**: Uses the Xenova/codegen-350M-mono model to generate explanations of Lua code
* **Performance Optimizations**:
  * Web Worker implementation to prevent UI freezing during inference
  * Model caching in IndexedDB for persistence between sessions
  * Explanation caching in localStorage to avoid redundant processing
  * 8-bit quantization for faster inference with minimal quality loss
* **Component Architecture**: Modular design with separated concerns for better maintainability

## Technical Implementation

### Model Integration

* **Model**: Xenova/codegen-350M-mono (350M parameter code-understanding model)
* **Framework**: transformers.js for in-browser ML inference
* **Runtime**: ONNX Runtime Web for efficient model execution
* **Optimizations**: 8-bit quantization, caching, and web workers

### Application Structure

* **Components**:
  * `LuaEditor`: CodeMirror-based editor for Lua code
  * `ExplanationDisplay`: Renders the generated explanation
  * `ActionButtons`: Controls for triggering explanation and clearing cache
  * `LoadingMessage`: Feedback during model loading and inference
  * `ModelCacheManager`: Interface for managing model cache
* **Hooks**:
  * `useModelInference`: Custom hook encapsulating model loading and inference logic
* **Utils**:
  * `transformersConfig.js`: Configuration for the transformers.js library
  * `modelCache.js`: Utilities for model caching

## Current Limitations

The base model (Xenova/codegen-350M-mono) has limitations when generating Lua code explanations:

* Often repeats the code instead of explaining it
* May go off-topic or generate irrelevant content
* Provides brief or inadequate explanations for complex code
* Lacks deep understanding of Lua-specific concepts

These limitations highlight the need for domain-specific fine-tuning.

## Roadmap for Fine-Tuning

### 1. Dataset Creation
* Collect 50-100 examples of domain-specific Lua code snippets
* Create high-quality explanations for each snippet
* Format as prompt-completion pairs

### 2. Fine-Tuning Process
* Use Hugging Face's fine-tuning capabilities on the codegen-350M-mono model
* Train with low learning rate (1e-5 to 3e-5) to avoid catastrophic forgetting
* Use 3-5 epochs for a small dataset

### 3. Model Quantization
* Convert to ONNX format for browser deployment
* Apply 8-bit quantization to reduce size while maintaining quality

### 4. Integration
* Update the model path in transformersConfig.js
* Keep the existing browser-based infrastructure

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Dependencies

* React
* Vite
* @xenova/transformers
* @uiw/react-codemirror
* onnxruntime-web

---

*This project demonstrates the feasibility of running AI-powered code analysis tools entirely in-browser for secure environments.*
