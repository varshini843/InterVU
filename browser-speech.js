// browser-speech.js - Cross-browser speech recognition for interview answers

/**
 * This file provides a cross-browser compatible speech recognition solution
 * that works in all modern browsers by using a combination of:
 * 1. Native Web Speech API when available
 * 2. A fallback mechanism for browsers without native support
 */

(function() {
  // Debug mode
  const DEBUG = true;
  
  // Log function that respects debug mode
  function log(...args) {
    if (DEBUG) {
      console.log('[BrowserSpeech]', ...args);
    }
  }
  
  // Error log function
  function errorLog(...args) {
    console.error('[BrowserSpeech]', ...args);
  }
  
  // Global variables
  let recognition = null;
  let isRecognizing = false;
  let finalTranscript = '';
  let interimTranscript = '';
  let transcriptionDisplay = null;
  let recognitionTimeout = null;
  let restartCount = 0;
  const MAX_RESTARTS = 5;
  
  // Check if browser supports the Web Speech API
  function checkBrowserSupport() {
    log('Checking browser support for speech recognition');
    
    // Check for native Web Speech API support
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      log('Native Web Speech API supported');
      return true;
    }
    
    // No native support
    log('Native Web Speech API not supported');
    return false;
  }
  
  // Initialize speech recognition
  function initSpeechRecognition() {
    log('Initializing speech recognition');
    
    try {
      // Try to use native Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        // Set up event handlers
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;
        recognition.onend = handleRecognitionEnd;
        
        // Create global variable for transcription
        window.recordingTranscription = '';
        
        log('Speech recognition initialized successfully');
        return true;
      } else {
        // Use fallback mechanism
        setupFallbackRecognition();
        return true;
      }
    } catch (error) {
      errorLog('Error initializing speech recognition:', error);
      
      // Try fallback
      setupFallbackRecognition();
      return false;
    }
  }
  
  // Set up fallback recognition using manual transcription
  function setupFallbackRecognition() {
    log('Setting up fallback recognition');
    
    // Create a simulated recognition object
    recognition = {
      start: function() {
        log('Fallback recognition started');
        isRecognizing = true;
        
        // Create a manual transcription input
        createManualTranscriptionInput();
        
        // Simulate recognition events
        simulateRecognitionEvents();
        
        return true;
      },
      stop: function() {
        log('Fallback recognition stopped');
        isRecognizing = false;
        
        // Update the final transcript
        finalizeManualTranscription();
        
        return true;
      }
    };
    
    log('Fallback recognition set up successfully');
    return true;
  }
  
  // Create a manual transcription input for browsers without speech recognition
  function createManualTranscriptionInput() {
    log('Creating manual transcription input');
    
    // Find or create the transcription container
    let transcriptionContainer = document.getElementById('transcriptionContainer');
    if (!transcriptionContainer) {
      const recordingControls = document.getElementById('recordingControls');
      if (recordingControls) {
        transcriptionContainer = document.createElement('div');
        transcriptionContainer.id = 'transcriptionContainer';
        transcriptionContainer.style.marginTop = '15px';
        transcriptionContainer.style.padding = '10px';
        transcriptionContainer.style.backgroundColor = '#f5f5f5';
        transcriptionContainer.style.borderRadius = '5px';
        recordingControls.appendChild(transcriptionContainer);
      } else {
        errorLog('Recording controls not found');
        return;
      }
    }
    
    // Clear the container
    transcriptionContainer.innerHTML = `
      <h3 style="margin-top:0;">Manual Transcription</h3>
      <p>Speech recognition is not available in this browser. Please type your answer as you speak:</p>
      <textarea id="manualTranscription" 
                style="width: 100%; min-height: 100px; margin-top: 10px; padding: 8px; border-radius: 5px; border: 1px solid #ddd;"
                placeholder="Type your answer here as you speak..."></textarea>
    `;
    
    // Add event listener to update the transcription as the user types
    const manualTranscription = document.getElementById('manualTranscription');
    if (manualTranscription) {
      manualTranscription.addEventListener('input', function() {
        finalTranscript = this.value;
        window.recordingTranscription = finalTranscript;
        log('Manual transcription updated:', finalTranscript);
      });
    }
  }
  
  // Simulate recognition events for the fallback mechanism
  function simulateRecognitionEvents() {
    // Nothing to do here, as the user is manually typing
  }
  
  // Finalize the manual transcription
  function finalizeManualTranscription() {
    const manualTranscription = document.getElementById('manualTranscription');
    if (manualTranscription) {
      finalTranscript = manualTranscription.value;
      window.recordingTranscription = finalTranscript;
      log('Final manual transcription:', finalTranscript);
    }
  }
  
  // Handle recognition results
  function handleRecognitionResult(event) {
    interimTranscript = '';
    
    // Process results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Update global transcription
    window.recordingTranscription = finalTranscript;
    
    // Update display if available
    updateTranscriptionDisplay();
    
    log('Transcription updated:', finalTranscript);
  }
  
  // Handle recognition errors
  function handleRecognitionError(event) {
    errorLog('Speech recognition error:', event.error);
    
    // Restart recognition if it was interrupted and we haven't exceeded the max restarts
    if (isRecognizing && restartCount < MAX_RESTARTS) {
      restartCount++;
      log(`Attempting to restart speech recognition (${restartCount}/${MAX_RESTARTS})`);
      
      try {
        // Wait a moment before restarting
        recognitionTimeout = setTimeout(function() {
          if (isRecognizing) {
            recognition.start();
            log('Restarted speech recognition after error');
          }
        }, 1000);
      } catch (e) {
        errorLog('Failed to restart speech recognition:', e);
      }
    } else if (restartCount >= MAX_RESTARTS) {
      errorLog('Exceeded maximum restart attempts, switching to fallback');
      setupFallbackRecognition();
      recognition.start();
    }
  }
  
  // Handle recognition end
  function handleRecognitionEnd() {
    log('Speech recognition ended');
    
    // Restart if we're still supposed to be recognizing and haven't exceeded the max restarts
    if (isRecognizing && restartCount < MAX_RESTARTS) {
      restartCount++;
      log(`Attempting to restart speech recognition (${restartCount}/${MAX_RESTARTS})`);
      
      try {
        // Wait a moment before restarting
        recognitionTimeout = setTimeout(function() {
          if (isRecognizing) {
            recognition.start();
            log('Restarted speech recognition');
          }
        }, 1000);
      } catch (e) {
        errorLog('Failed to restart speech recognition:', e);
        isRecognizing = false;
      }
    } else if (restartCount >= MAX_RESTARTS) {
      errorLog('Exceeded maximum restart attempts, switching to fallback');
      setupFallbackRecognition();
      recognition.start();
    }
  }
  
  // Update transcription display
  function updateTranscriptionDisplay() {
    if (!transcriptionDisplay) {
      transcriptionDisplay = document.getElementById('transcriptionText');
    }
    
    if (transcriptionDisplay) {
      transcriptionDisplay.innerHTML = finalTranscript + 
        '<span style="color: #999;">' + interimTranscript + '</span>';
    }
  }
  
  // Start speech recognition
  function startRecognition() {
    log('Starting speech recognition');
    
    if (!recognition && !initSpeechRecognition()) {
      errorLog('Could not initialize speech recognition');
      return false;
    }
    
    if (isRecognizing) {
      log('Speech recognition already running');
      return true;
    }
    
    try {
      // Reset counters
      restartCount = 0;
      
      // Clear any existing timeout
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;
      }
      
      // Start recognition
      recognition.start();
      isRecognizing = true;
      log('Speech recognition started');
      return true;
    } catch (e) {
      errorLog('Failed to start speech recognition:', e);
      
      // Try fallback
      setupFallbackRecognition();
      recognition.start();
      return true;
    }
  }
  
  // Stop speech recognition
  function stopRecognition() {
    log('Stopping speech recognition');
    
    // Clear any existing timeout
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout);
      recognitionTimeout = null;
    }
    
    if (!recognition || !isRecognizing) {
      log('Speech recognition not running');
      return;
    }
    
    try {
      recognition.stop();
      isRecognizing = false;
      log('Speech recognition stopped');
    } catch (e) {
      errorLog('Failed to stop speech recognition:', e);
      
      // Force it to stop
      isRecognizing = false;
    }
  }
  
  // Reset transcription
  function resetTranscription() {
    log('Resetting transcription');
    
    finalTranscript = '';
    interimTranscript = '';
    window.recordingTranscription = '';
    updateTranscriptionDisplay();
    
    // Also reset the manual transcription if it exists
    const manualTranscription = document.getElementById('manualTranscription');
    if (manualTranscription) {
      manualTranscription.value = '';
    }
  }
  
  // Get current transcription
  function getTranscription() {
    return {
      final: finalTranscript,
      interim: interimTranscript
    };
  }
  
  // Expose public methods
  window.BrowserSpeech = {
    start: startRecognition,
    stop: stopRecognition,
    reset: resetTranscription,
    getTranscription: getTranscription,
    isSupported: checkBrowserSupport
  };
  
  // Initialize on page load
  window.addEventListener('load', function() {
    log('Browser speech module loaded');
    initSpeechRecognition();
  });
})();