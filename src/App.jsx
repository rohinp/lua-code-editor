import React, { useState, useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { pipeline } from '@xenova/transformers';

function App() {
  const [luaCode, setLuaCode] = useState(
    'function greet(name)\n  print("Hello, " .. name)\nend\n\ngreet("World")'
  );
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const sessionRef = useRef(null); // Ref to hold the ONNX session

  const onChange = useCallback((value, viewUpdate) => {
    setLuaCode(value);
    setExplanation('');
  }, []);

  // Effect to load the ONNX model on component mount
  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);  
      console.log("Loading model started..."); // Added log
      try {
        console.log("Pipeline function called with paths:", { model: 'model', tokenizer: 'tokenizer' }); // Added log
        sessionRef.current = await pipeline( 
          'text2text-generation',
          'model',
          {
            tokenizer: 'tokenizer/tokenizer_config.json',
            onProgress: (progress) => { console.log(`Loading ${progress.file}: ${progress.progress}%`); },
          }
        );
        console.log('Model and tokenizer loaded successfully.');
      } catch (error) { 
        console.error('Error loading model/tokenizer:', error);
        setExplanation(
          `Failed to load model/tokenizer: ${error.message}. Check console for details.`
        );
      } finally { 
        setLoading(false);
        console.log("Loading model completed."); // Added log
      }
    }

    loadModel(); // Call the async function immediately
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle the explain button click
  const handleExplainClick = async () => {
    if (!sessionRef.current) {
      console.error('Session not ready');
      setExplanation('Model pipeline is not loaded yet.');
      return;
    }
    if (!luaCode.trim()) {
      setExplanation('Please enter some Lua code first.');
      return;
    }

    setExplanation('Processing...'); // Show immediate feedback

    try {
      // Run inference using the pipeline (Corrected placement of try block)
      const result = await sessionRef.current(`explain Lua: ${luaCode}`); // Corrected try block

      // Extract the generated explanation
      const explanationText = result[0].generated_text;

      // Update the explanation state
      setExplanation(explanationText);

    } catch (error) {
      console.error('Error during inference:', error);
      setExplanation(`An error occurred: ${error.message}`);
    }

  };

  return (
    <div>
      <h1>Lua Code Editor</h1>
      <CodeMirror
        value={luaCode}
        height="200px"
        extensions={[StreamLanguage.define(lua)]}
        onChange={onChange}
      />
      {/* Disable button while loading or if session failed to load */}
      <button
        onClick={handleExplainClick}
        style={{ marginTop: '10px' }}
        disabled={loading || !sessionRef.current}
      >
        {loading ? 'Loading Model...' : 'Explain'}
      </button>
      {explanation && (
        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', background: '#f9f9f9' }}>
          {explanation}
        </div>
      )}
    </div>
  );
}

export default App;
