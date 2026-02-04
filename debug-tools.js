// debug-tools.js - Debugging tools for InterVU

/**
 * This file provides debugging tools to help diagnose issues with
 * speech recognition and API integration.
 */

(function() {
  // Create debug panel
  function createDebugPanel() {
    // Check if debug panel already exists
    if (document.getElementById('debug-panel')) {
      return;
    }
    
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.width = '300px';
    debugPanel.style.maxHeight = '200px';
    debugPanel.style.overflow = 'auto';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    debugPanel.style.color = '#fff';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.zIndex = '9999';
    
    // Add header
    const header = document.createElement('div');
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '5px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.innerHTML = '<span>InterVU Debug</span><span id="debug-close" style="cursor:pointer;">×</span>';
    debugPanel.appendChild(header);
    
    // Add content
    const content = document.createElement('div');
    content.id = 'debug-content';
    debugPanel.appendChild(content);
    
    // Add to body
    document.body.appendChild(debugPanel);
    
    // Add close handler
    document.getElementById('debug-close').addEventListener('click', function() {
      debugPanel.style.display = 'none';
    });
    
    // Update debug content
    updateDebugContent();
    
    // Update every 2 seconds
    setInterval(updateDebugContent, 2000);
  }
  
  // Update debug content
  function updateDebugContent() {
    const content = document.getElementById('debug-content');
    if (!content) return;
    
    // Gather debug info
    const debugInfo = {
      'Browser': navigator.userAgent,
      'Speech API': window.SpeechRecognition || window.webkitSpeechRecognition ? 'Supported' : 'Not supported',
      'BrowserSpeech': window.BrowserSpeech ? 'Loaded' : 'Not loaded',
      'SimpleSpeech': window.SimpleSpeech ? 'Loaded' : 'Not loaded',
      'TogetherAPI': window.TogetherAPI ? (window.TogetherAPI.isInitialized ? 'Initialized' : 'Loaded but not initialized') : 'Not loaded',
      'SimpleTogether': window.SimpleTogether ? (window.SimpleTogether.isInitialized ? 'Initialized' : 'Loaded but not initialized') : 'Not loaded',
      'Transcription': window.recordingTranscription ? `Available (${window.recordingTranscription.length} chars)` : 'Not available'
    };
    
    // Format debug info
    let html = '';
    for (const [key, value] of Object.entries(debugInfo)) {
      html += `<div><strong>${key}:</strong> ${value}</div>`;
    }
    
    // Add transcription preview if available
    if (window.recordingTranscription) {
      const preview = window.recordingTranscription.length > 50 
        ? window.recordingTranscription.substring(0, 50) + '...' 
        : window.recordingTranscription;
      html += `<div style="margin-top:5px;"><strong>Preview:</strong> "${preview}"</div>`;
    }
    
    // Update content
    content.innerHTML = html;
  }
  
  // Add debug button
  function addDebugButton() {
    // Check if debug button already exists
    if (document.getElementById('debug-button')) {
      return;
    }
    
    // Create debug button
    const debugButton = document.createElement('button');
    debugButton.id = 'debug-button';
    debugButton.textContent = 'Debug';
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '10px';
    debugButton.style.right = '10px';
    debugButton.style.padding = '5px 10px';
    debugButton.style.backgroundColor = '#ff4d6d';
    debugButton.style.color = '#fff';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '5px';
    debugButton.style.cursor = 'pointer';
    debugButton.style.zIndex = '9998';
    
    // Add click handler
    debugButton.addEventListener('click', function() {
      const debugPanel = document.getElementById('debug-panel');
      if (debugPanel) {
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
      } else {
        createDebugPanel();
      }
    });
    
    // Add to body
    document.body.appendChild(debugButton);
  }
  
  // Initialize on page load
  window.addEventListener('load', function() {
    // Only add debug tools if debug mode is enabled
    if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG) {
      console.log('Debug tools loaded');
      addDebugButton();
    }
  });
})();