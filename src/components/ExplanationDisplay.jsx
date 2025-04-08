import React from 'react';

/**
 * ExplanationDisplay component for showing code explanations
 * Displays the explanation in a formatted container
 */
const ExplanationDisplay = ({ explanation }) => {
  if (!explanation) return null;
  
  return (
    <div 
      className="explanation-container"
      style={{ 
        marginTop: '15px', 
        padding: '15px', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        background: '#f9f9f9',
        whiteSpace: 'pre-wrap'
      }}
    >
      {explanation}
    </div>
  );
};

export default ExplanationDisplay;
