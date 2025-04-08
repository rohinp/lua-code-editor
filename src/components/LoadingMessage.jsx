import React from 'react';

/**
 * LoadingMessage component for displaying loading status
 */
const LoadingMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div 
      className="loading-message"
      style={{ 
        margin: '10px 0', 
        padding: '8px 12px', 
        backgroundColor: '#e6f7ff', 
        border: '1px solid #91d5ff',
        borderRadius: '4px',
        color: '#0050b3'
      }}
    >
      {message}
    </div>
  );
};

export default LoadingMessage;
