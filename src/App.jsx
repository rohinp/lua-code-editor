import React, { useState } from 'react';
import LuaEditor from './components/LuaEditor';
import ExplanationDisplay from './components/ExplanationDisplay';
import ActionButtons from './components/ActionButtons';
import LoadingMessage from './components/LoadingMessage';
import LoadingIndicator from './components/LoadingIndicator';
import ModelCacheManager from './components/ModelCacheManager';
import useModelInference from './hooks/useModelInference';

function App() {
  const [luaCode, setLuaCode] = useState('-- Enter your Lua code here\nfunction hello(name)\n  print("Hello, " .. name)\nend\n\nhello("World")');
  const [explanation, setExplanation] = useState('');

  const {
    loading,
    loadingMessage,
    error,
    progress,
    isModelReady,
    generateExplanation,
    clearExplanationCache
  } = useModelInference();

  const handleCodeChange = (value) => {
    setLuaCode(value);
  };

  const handleExplainClick = async () => {
    if (!luaCode.trim()) {
      setExplanation('Please enter some Lua code to explain.');
      return;
    }

    const result = await generateExplanation(luaCode);
    setExplanation(result);
  };

  const handleClearCache = () => {
    const message = clearExplanationCache();
    setExplanation(message);
  };

  return (
    <div>
      <h1>Lua Code Editor</h1>

      {/* Model Cache Manager */}
      <ModelCacheManager />

      {/* Loading message */}
      {loadingMessage && !loading && (
        <LoadingMessage message={loadingMessage} />
      )}
      
      {/* Loading indicator with progress bar */}
      <LoadingIndicator 
        isLoading={loading} 
        message={loadingMessage || 'Processing...'} 
        progress={progress} 
      />

      <LuaEditor value={luaCode} onChange={handleCodeChange} />

      <ActionButtons
        onExplain={handleExplainClick}
        onClearCache={handleClearCache}
        isLoading={loading}
        isModelReady={isModelReady}
      />

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}

      <ExplanationDisplay explanation={explanation} />
    </div>
  );
}

export default App;