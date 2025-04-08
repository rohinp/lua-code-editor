import React, { useState, useEffect } from 'react';

/**
 * Component for displaying and managing model cache information
 */
const ModelCacheManager = () => {
  const [cacheInfo, setCacheInfo] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Load cache info on mount and when cache changes
  useEffect(() => {
    const loadCacheInfo = () => {
      try {
        const cachedInfo = localStorage.getItem('luaModelCache');
        if (cachedInfo) {
          setCacheInfo(JSON.parse(cachedInfo));
        }
      } catch (error) {
        console.error('Error loading cache info:', error);
      }
    };

    loadCacheInfo();

    // Set up event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'luaModelCache') {
        loadCacheInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle clearing the cache
  const handleClearCache = () => {
    try {
      // Clear from localStorage
      localStorage.removeItem('luaModelCache');
      
      // Try to clear IndexedDB cache
      if (window.indexedDB) {
        // Open and clear the transformers cache database
        const request = window.indexedDB.deleteDatabase('browser-cache');
        
        request.onsuccess = () => {
          console.log('IndexedDB cache cleared successfully');
        };
        
        request.onerror = (event) => {
          console.error('Error clearing IndexedDB cache:', event);
        };
      }
      
      setCacheInfo(null);
      
      // Reload the page to ensure the model is reloaded
      if (confirm('Cache cleared. Reload page to download fresh model?')) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache: ' + error.message);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  if (!expanded) {
    return (
      <div 
        className="cache-manager-collapsed"
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#666',
          marginBottom: '10px'
        }}
      >
        <span style={{ marginRight: '8px' }}>
          {cacheInfo ? '📦 Model Cached' : '⚠️ No Cache'}
        </span>
        <button 
          onClick={() => setExpanded(true)}
          style={{
            background: 'none',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            color: '#0066cc',
            fontSize: '0.8rem',
            padding: '0'
          }}
        >
          Details
        </button>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '10px',
      marginBottom: '15px',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Model Cache Information</h3>
        <button 
          onClick={() => setExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          title="Hide cache info"
        >
          ▲
        </button>
      </div>

      {cacheInfo ? (
        <div>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
            <strong>Last Loaded:</strong> {formatDate(cacheInfo.lastLoaded)}
          </p>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
            <strong>Model:</strong> {cacheInfo.model || 'Unknown'}
          </p>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
            <strong>File:</strong> {cacheInfo.file || 'Unknown'}
          </p>
          <button 
            onClick={handleClearCache}
            style={{
              backgroundColor: '#ff4d4d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 10px',
              marginTop: '5px',
              cursor: 'pointer'
            }}
          >
            Clear Cache
          </button>
        </div>
      ) : (
        <div>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>No model cache information available.</p>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>The model will be downloaded when you first use it.</p>
        </div>
      )}
    </div>
  );
};

export default ModelCacheManager;
