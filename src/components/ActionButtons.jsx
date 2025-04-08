import React from 'react';

/**
 * ActionButtons component for the Explain and Clear Cache buttons
 */
const ActionButtons = ({ 
  onExplain, 
  onClearCache, 
  isLoading, 
  isModelReady 
}) => {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
      <button
        onClick={onExplain}
        style={{ 
          padding: '8px 16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || !isModelReady ? 'not-allowed' : 'pointer',
          opacity: isLoading || !isModelReady ? 0.7 : 1
        }}
        disabled={isLoading || !isModelReady}
      >
        {isLoading ? 'Processing...' : 'Explain'}
      </button>
      
      <button
        onClick={onClearCache}
        style={{ 
          padding: '8px 16px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Clear Explanation Cache
      </button>
    </div>
  );
};

export default ActionButtons;
