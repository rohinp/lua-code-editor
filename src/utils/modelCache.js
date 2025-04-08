/**
 * Utility functions for model caching and management
 */
import { env } from '@xenova/transformers';

// Configure transformers.js to use local storage
env.cacheDir = 'transformers-cache';

// Enable debug mode for transformers.js
env.debug = true;

// Set the local base path for models
env.localModelPath = window.location.origin;

// Cache keys
const MODEL_INFO_KEY = 'luaExplainerModelInfo';
const MODEL_CACHE_VERSION = '1.0.0';

/**
 * Get cached model information if available
 * @returns {Object|null} The cached model info or null if not found
 */
export const getCachedModelInfo = () => {
  try {
    const cachedModelInfo = localStorage.getItem(MODEL_INFO_KEY);
    return cachedModelInfo ? JSON.parse(cachedModelInfo) : null;
  } catch (error) {
    console.error('Error reading cached model info:', error);
    return null;
  }
};

/**
 * Save model information to cache
 * @param {Object} modelInfo Information about the model to cache
 */
export const saveModelInfoToCache = (modelInfo) => {
  try {
    const infoToSave = {
      ...modelInfo,
      version: MODEL_CACHE_VERSION,
      lastLoaded: new Date().toISOString()
    };
    localStorage.setItem(MODEL_INFO_KEY, JSON.stringify(infoToSave));
    console.log(`Cached model info for ${modelInfo.file || 'model'}`);
  } catch (error) {
    console.error('Error saving model info to cache:', error);
  }
};

/**
 * Clear the model cache
 */
export const clearModelCache = () => {
  try {
    localStorage.removeItem(MODEL_INFO_KEY);
    console.log('Model cache cleared');
    // Note: This doesn't clear the actual model files cached by transformers.js
    // For that, we would need to use the transformers.js API
  } catch (error) {
    console.error('Error clearing model cache:', error);
  }
};

/**
 * Create a progress handler that updates UI and manages cache
 * @param {Function} setLoadingProgress Function to update loading progress in UI
 * @returns {Function} Progress handler function
 */
export const createProgressHandler = (setLoadingProgress) => {
  return (progress) => {
    console.log(`Loading ${progress.file}: ${progress.progress}%`);
    setLoadingProgress(progress);
    
    // Save model info to localStorage when download completes
    if (progress.progress === 100) {
      saveModelInfoToCache({
        file: progress.file,
        size: progress.file_size || 'unknown',
        loaded: true
      });
    }
  };
};

/**
 * Log detailed error information for model loading issues
 * @param {Error} error The error object
 * @returns {string} Formatted error message
 */
export const logModelError = (error) => {
  console.error('Error loading model/tokenizer:', error);
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  
  // Check if the error is related to file loading
  if (error.message.includes('JSON')) {
    console.error('JSON parsing error - likely incorrect file path or format');
  }
  
  return `Error: ${error.message}. Check console for details.`;
};
