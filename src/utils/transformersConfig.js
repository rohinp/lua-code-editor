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

// Model configuration for code tasks - using a model specifically designed for code
export const MODEL_CONFIG = {
  task: 'text-generation',  // Text generation for code explanation
  // Use CodeGen which is specifically designed for code generation and understanding
  modelPath: 'Xenova/codegen-350M-mono',  // Better code understanding (~350M parameters, ~150-200MB in browser)
  options: {
    cache_dir: 'browser-cache',  // Explicitly set cache directory
    quantized: true,            // Enable quantization for better performance
    max_length: 512,            // Keep adequate context size for code understanding
    revision: 'main',           // Use the main branch version
    max_new_tokens: 150,        // Slightly increased for better explanations with this model
    local_files_only: false,    // Allow downloading from HF if needed
    
    // Performance optimization settings
    quantization_config: {
      bits: 8                    // Use 8-bit quantization for faster inference
    },
    
    // Default inference parameters (can be overridden in the pipeline call)
    default_generation_config: {
      temperature: 0.9,          // Higher temperature for more creative and relevant responses
      top_p: 0.9,                // Higher top_p for more diverse token selection
      do_sample: true,           // Use sampling for more varied responses
      num_beams: 1,              // Keep simple search for performance
      early_stopping: true       // Stop generation when all beams reach an EOS token
    }
  }
};

// Export the configured environment
export default transformersEnv;

// Removed the configureTransformersEnvironment() call as it's not defined in the provided code snippet
