/**
 * Configuration for transformers.js and model loading
 */
import { env } from '@xenova/transformers';

// Configure the transformers.js environment for browser usage
const configureTransformers = () => {
  // Set cache location
  env.cacheDir = 'browser-cache';

  // Model loading settings
  env.allowRemoteModels = true; // Allow loading models from Hugging Face Hub
  env.allowLocalModels = false; // Disable local models in browser context
  env.useFS = false; // Don't use Node.js file system in browser
  env.allowCustomModelPaths = true; // Enable custom model file paths

  // Performance settings
  env.backends.onnx.wasm.numThreads = 1; // Use a single thread for better browser compatibility

  // Cache settings
  env.useBrowserCache = true; // Use browser's cache mechanisms
  env.useIndexedDB = true; // Enable IndexedDB for model storage

  // Enable web worker support for better performance
  env.useWorker = true; // Run inference in a separate thread
  env.workerUrl = 'https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/worker.js';

  // Debug settings (set to false to reduce console output)
  env.debug = false;

  // Suppress ONNX runtime warnings and other verbose logs
  env.logger = {
    level: 'error',  // Only show errors, not warnings
    quiet: true,     // Suppress non-essential messages
    verbose: false   // Disable verbose logging
  };

  // Disable ONNX runtime warnings specifically
  env.wasm = {
    numThreads: 1,
    simd: true,
    proxy: false,
    debug: false,    // Disable debug messages from ONNX runtime
    wasmPaths: undefined
  };

  console.log('Transformers.js configured for browser environment', {
    cacheDir: env.cacheDir,
    debug: env.debug,
    useIndexedDB: env.useIndexedDB,
    allowRemoteModels: env.allowRemoteModels,
    useWorker: env.useWorker
  });

  return env;
};

// Initialize configuration
const transformersEnv = configureTransformers();

// Model configuration for code tasks - using codegen-350M-mono for Lua code explanation
export const MODEL_CONFIG = {
  task: 'text-generation',  // Text generation for code explanation
  // Using codegen-350M-mono model which is smaller and more suitable for browser environments
  modelPath: 'Xenova/codegen-350M-mono',  // 350M parameter model that works well in browsers
  options: {
    cache_dir: 'browser-cache',  // Explicitly set cache directory
    quantized: true,            // Enable quantization for better performance
    max_length: 512,            // Balanced context size for performance and understanding
    revision: 'main',           // Use the main branch version
    max_new_tokens: 200,        // Reasonable length for code explanations
    local_files_only: false,    // Allow downloading from HF if needed
    
    // Performance optimization settings
    quantization_config: {
      bits: 8                    // Use 8-bit quantization for faster inference
    },
    
    // Progressive rendering to show results as they're generated
    progress_callback: function(data) {
      if (window.updateProgressCallback && typeof window.updateProgressCallback === 'function') {
        window.updateProgressCallback(data);
      }
    },

    // Default inference parameters optimized for code explanation
    default_generation_config: {
      temperature: 0.7,          // Balanced temperature for creative but focused responses
      top_p: 0.95,               // Top-p nucleus sampling for diverse outputs
      do_sample: true,           // Use sampling for more varied responses
      num_beams: 1,              // Simple beam search for performance
      early_stopping: true,      // Stop generation when complete
      max_time: 20,              // Set a maximum time limit for generation
      repetition_penalty: 1.2    // Reduce repetition in explanations
    }
  },
  
  // Prompt formatting specifically for Lua code explanation with codegen-350M-mono
  formatPrompt: (code) => {
    // Codegen-350M-mono works better with a simpler prompt format
    return `
# Lua Code Explanation

Below is a Lua code snippet. Provide a clear, detailed explanation of what this code does, how it works, and any important Lua concepts it demonstrates.

## Code:

\`\`\`lua
${code}
\`\`\`

## Explanation:

`;
  }
};

// Export the configured environment
export default transformersEnv;

// Removed the configureTransformersEnvironment() call as it's not defined in the provided code snippet
