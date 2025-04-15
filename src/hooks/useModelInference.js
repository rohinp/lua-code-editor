import { useState, useRef, useEffect } from 'react';
import { pipeline } from '@xenova/transformers';
import { MODEL_CONFIG } from '../utils/transformersConfig';

/**
 * Custom hook for handling model loading and inference
 * Encapsulates model loading, caching, and inference logic
 */
const useModelInference = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const pipelineRef = useRef(null);
  const workerRef = useRef(null);
  
  // Set up global callback for progress updates
  useEffect(() => {
    window.updateProgressCallback = (data) => {
      if (data && typeof data.progress === 'number') {
        setProgress(Math.min(0.99, data.progress));
      }
    };
    
    return () => {
      window.updateProgressCallback = null;
    };
  }, []);

  // Load model on component mount
  useEffect(() => {
    // Check if we already have a worker reference
    if (window.transformersWorker) {
      console.log('Using existing worker reference');
      workerRef.current = window.transformersWorker;
    }

    // Load the model
    loadModel();

    // Cleanup function
    return () => {
      // We don't terminate the worker on unmount to keep it cached
      console.log('Component unmounting, worker kept alive for caching');
    };
  }, []);

  // Function to load the model
  const loadModel = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Loading fine-tuned Lua code explanation model... This may take a moment but provides specialized Lua explanations');
      setError(null);

      // Use the model configuration from our config file
      const { task, modelPath, options } = MODEL_CONFIG;
      const modelOptions = options || {};

      // Create the pipeline with the model
      console.log(`Creating ${task} pipeline with model: ${modelPath}`);
      console.log('Model options:', JSON.stringify(modelOptions, null, 2));
      
      // Log custom file paths if present
      if (modelOptions.model_file_map) {
        console.log('Using custom model file paths:', modelOptions.model_file_map);
      }

      // If we have an existing worker, try to reuse it
      if (workerRef.current) {
        console.log('Attempting to reuse existing worker');
      }

      // Create the pipeline
      const pipe = await pipeline(
        task,
        modelPath,
        {
          ...modelOptions,
          progress_callback: (progress) => {
            // Simple logging only with validation
            if (progress.status === 'progress') {
              // Ensure progress is a valid number between 0 and 1
              let progressValue = progress.progress;
              if (typeof progressValue !== 'number' || isNaN(progressValue)) {
                progressValue = 0;
              } else if (progressValue > 1) {
                // If progress is reported as > 1, normalize it (assuming it's a fraction of a larger number)
                progressValue = (progressValue % 100) / 100;
                if (progressValue > 1) progressValue = 0.99; // Final safety check
              }

              const percentage = Math.round(progressValue * 100);
              console.log(`Loading ${progress.file}: ${percentage}%`);
            } else if (progress.status === 'ready') {
              console.log('Model ready!');
            }
          }
        }
      );

      pipelineRef.current = pipe;

      // Store worker reference for future use
      if (pipe.worker) {
        console.log('Worker detected, storing reference');
        workerRef.current = pipe.worker;
        window.transformersWorker = pipe.worker; // Store globally for persistence
      }

      // Save to localStorage
      try {
        localStorage.setItem('modelLoaded', 'true');
      } catch (e) {
        console.warn('Failed to save model status to localStorage:', e);
      }

      setLoading(false);
      setLoadingMessage('');
    } catch (e) {
      console.error('Error loading model:', e);
      setError(`Error loading model: ${e.message}`);
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Function to generate explanation
  const generateExplanation = async (luaCode) => {
    if (!pipelineRef.current) {
      setError('Model not loaded. Please wait or refresh the page.');
      return null;
    }

    setLoading(true);
    setLoadingMessage('Generating explanation...');
    setProgress(0.05); // Start with a small progress indication

    // Cache key for this code snippet
    const cacheKey = `explanation_${hashCode(luaCode)}`;

    // Check if we have a cached explanation
    const cachedExplanation = localStorage.getItem(cacheKey);
    if (cachedExplanation) {
      console.log('Using cached explanation');
      setLoading(false);
      setLoadingMessage('');
      return cachedExplanation;
    }

    try {
      // Format the prompt for our fine-tuned Lua code explanation model
      // Since the model is now fine-tuned specifically for Lua, we can use a simpler prompt
      const prompt = `# Lua Code Explanation

\`\`\`lua
${luaCode}
\`\`\`

Explain this Lua code:`;

      console.log('Sending prompt to model');

      // Set up a fake progress simulation since we don't get real-time progress from the model
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          // Slowly increase progress up to 90% (the last 10% will be set after completion)
          const newProgress = prev + (0.9 - prev) * 0.1;
          return Math.min(0.9, newProgress);
        });
      }, 300);
      
      // Generate the explanation using the text-generation pipeline with adjusted parameters
      // Use the formatPrompt function from MODEL_CONFIG if available
      const formattedPrompt = MODEL_CONFIG.formatPrompt ? MODEL_CONFIG.formatPrompt(luaCode) : prompt;
      
      // Use the default generation config from MODEL_CONFIG if available
      const generationConfig = MODEL_CONFIG.options?.default_generation_config || {
        max_new_tokens: 200,     // Increased token count for more complete explanations
        temperature: 0.7,        // Lower temperature for more focused responses
        top_p: 0.95,             // Slightly higher top_p for good token selection
        do_sample: true,         // Use sampling for varied responses
        num_beams: 1,            // Simple search for performance
        early_stopping: true     // Stop when complete
      };
      
      const result = await pipelineRef.current(formattedPrompt, generationConfig);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      // Set progress to 95% to indicate we're almost done
      setProgress(0.95);
      
      console.log('Model inference parameters:', {
        max_new_tokens: 200,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
        num_beams: 1
      });

      // Process the model's response
      let explanationText = result[0].generated_text.trim();
      console.log('Raw model response:', explanationText);

      // Extract only the explanation part, removing the prompt
      const explanationMarker = "Explanation of the Lua code (in 2-3 sentences):";
      const explanationIndex = explanationText.indexOf(explanationMarker);
      console.log('Explanation marker found at index:', explanationIndex);

      if (explanationIndex !== -1) {
        // Extract only the text after the marker
        explanationText = explanationText.substring(explanationIndex + explanationMarker.length).trim();
        console.log('After extraction by marker:', explanationText);

        // Remove any trailing code blocks or markdown artifacts
        if (explanationText.includes('```')) {
          explanationText = explanationText.split('```')[0].trim();
          console.log('After removing code blocks:', explanationText);
        }
      } else {
        // If we can't find the marker, try to extract just the generated part
        // by removing everything up to the end of the code block
        const codeBlockEnd = explanationText.indexOf('```\n') + 4;
        if (codeBlockEnd > 4) { // Make sure we found the end of the code block
          explanationText = explanationText.substring(codeBlockEnd).trim();
          console.log('Extracted using code block end:', explanationText);
        }
      }

      // Log the extracted explanation text and its length for debugging
      console.log('Extracted explanation text:', explanationText);
      console.log('Explanation length:', explanationText.length);
      
      // Since we're using a fine-tuned model for Lua, we should have fewer off-topic responses
      // But still check for common issues that might indicate the model went off-track
      const containsPythonLicense = explanationText.includes('#!/usr/bin/env python') || 
                                   explanationText.includes('Carnegie Mellon') ||
                                   explanationText.includes('Permission is hereby granted');
      
      // Check if the explanation is too short, contains error indicators, or went off-track
      if (explanationText.length < 30 || 
          explanationText.includes('I cannot explain') || 
          explanationText.includes("I'm unable to") ||
          containsPythonLicense) {
        
        let reason = 'Unknown';
        if (explanationText.length < 30) reason = 'Too short';
        else if (containsPythonLicense) reason = 'Model went off-track (generated license text)';
        else reason = 'Contains error indicators';
        
        console.log('Model response deemed inadequate. Reason:', reason);
        
        // If the explanation is just too brief but otherwise valid, use it anyway
        if (explanationText.length >= 10 && 
            !containsPythonLicense && 
            !explanationText.includes('I cannot explain') && 
            !explanationText.includes("I'm unable to")) {
          
          console.log('Using brief explanation anyway as it seems valid');
          // Cache the explanation for future use
          try {
            localStorage.setItem(cacheKey, explanationText);
          } catch (e) {
            console.warn('Failed to cache explanation:', e);
          }
          return explanationText;
        }
        
        // Provide a more helpful message about the model's limitations
        return `The current model (Xenova/codegen-350M-mono) is not generating a good explanation for this code.

This is likely because the model needs fine-tuning specifically for Lua code explanations.

For better results, a fine-tuned model or a larger model with more Lua knowledge would be needed.`;
        // Don't cache error messages
      } else {
        // Use the model's explanation
        // Cache the explanation for future use
        try {
          localStorage.setItem(cacheKey, explanationText);
        } catch (e) {
          console.warn('Failed to cache explanation:', e);
        }

        return explanationText;
      }
    } catch (e) {
      console.error('Error generating explanation:', e);
      setError(`Error generating explanation: ${e.message}`);
      return `Error generating explanation: ${e.message}`;
    } finally {
      // Clear loading state
      setLoading(false);
      setLoadingMessage('');
      // Reset progress
      setTimeout(() => setProgress(0), 500); // Small delay to show 100% briefly
    }
  };

  // Helper function to generate a hash code for caching
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

  // Function to clear the explanation cache
  const clearExplanationCache = () => {
    try {
      // Get all keys from localStorage
      const keys = Object.keys(localStorage);

      // Filter for explanation cache keys (they start with 'explanation_')
      const explanationKeys = keys.filter(key => key.startsWith('explanation_'));

      // Remove each explanation cache entry
      explanationKeys.forEach(key => localStorage.removeItem(key));

      console.log(`Cleared ${explanationKeys.length} cached explanations`);
      return `Cleared ${explanationKeys.length} cached explanations`;
    } catch (e) {
      console.error('Error clearing explanation cache:', e);
      return `Error clearing explanation cache: ${e.message}`;
    }
  };

  return {
    loading,
    loadingMessage,
    error,
    progress,
    isModelReady: !!pipelineRef.current,
    generateExplanation,
    clearExplanationCache
  };
};

export default useModelInference;
