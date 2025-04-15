import React from 'react';

/**
 * LoadingIndicator component with progress bar or spinner
 * Shows loading state with visual feedback
 */
const LoadingIndicator = ({ isLoading, message, progress }) => {
  if (!isLoading) return null;
  
  return (
    <div 
      className="loading-indicator"
      style={{ 
        margin: '15px 0', 
        padding: '15px', 
        backgroundColor: '#f0f8ff', 
        border: '1px solid #91d5ff',
        borderRadius: '4px',
        color: '#0050b3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
        <div 
          className="loading-spinner"
          style={{
            width: '20px',
            height: '20px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '10px'
          }}
        />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div>{message || 'Loading...'}</div>
      </div>
      
      {progress !== undefined && (
        <div style={{ width: '100%' }}>
          <div 
            style={{ 
              height: '8px', 
              backgroundColor: '#e6f7ff',
              borderRadius: '4px',
              overflow: 'hidden',
              width: '100%'
            }}
          >
            <div 
              style={{ 
                height: '100%', 
                width: `${Math.max(5, Math.min(100, progress * 100))}%`, 
                backgroundColor: '#1890ff',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingIndicator;
