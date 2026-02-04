// simple-speech.js - Simple speech recognition for interview answers

/**
 * This file provides basic speech recognition using the Web Speech API.
 * It transcribes speech during recording and provides the transcription
 * for analysis by the Together.ai API.
 */

(function() {
  // Global variables
  let recognition = null;
  let isRecognizing = false;
  let finalTranscript = '';
  let interimTranscript = '';
  let transcriptionDisplay = null;
  
  // Initialize speech recognition
  function initSpeechRecognition() {
    console.log('Initializing simple speech recognition');
    
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return false;
    }
    
    // Create recognition object
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
    
    console.log('Speech recognition initialized successfully');
    return true;
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
    
    console.log('Transcription updated:', finalTranscript);
  }
  
  // Handle recognition errors
  function handleRecognitionError(event) {
    console.error('Speech recognition error:', event.error);
    
    // Restart recognition if it was interrupted
    if (isRecognizing) {
      try {
        recognition.start();
        console.log('Restarted speech recognition after error');
      } catch (e) {
        console.error('Failed to restart speech recognition:', e);
      }
    }
  }
  
  // Handle recognition end
  function handleRecognitionEnd() {
    console.log('Speech recognition ended');
    
    // Restart if we're still supposed to be recognizing
    if (isRecognizing) {
      try {
        recognition.start();
        console.log('Restarted speech recognition');
      } catch (e) {
        console.error('Failed to restart speech recognition:', e);
        isRecognizing = false;
      }
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
    if (!recognition && !initSpeechRecognition()) {
      console.error('Could not initialize speech recognition');
      return false;
    }
    
    if (isRecognizing) {
      console.log('Speech recognition already running');
      return true;
    }
    
    try {
      recognition.start();
      isRecognizing = true;
      console.log('Speech recognition started');
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      return false;
    }
  }
  
  // Stop speech recognition
  function stopRecognition() {
    if (!recognition || !isRecognizing) {
      console.log('Speech recognition not running');
      return;
    }
    
    try {
      recognition.stop();
      isRecognizing = false;
      console.log('Speech recognition stopped');
    } catch (e) {
      console.error('Failed to stop speech recognition:', e);
    }
  }
  
  // Reset transcription
  function resetTranscription() {
    finalTranscript = '';
    interimTranscript = '';
    window.recordingTranscription = '';
    updateTranscriptionDisplay();
    console.log('Transcription reset');
  }
  
  // Get current transcription
  function getTranscription() {
    return {
      final: finalTranscript,
      interim: interimTranscript
    };
  }
  
  // Expose public methods
  window.SimpleSpeech = {
    start: startRecognition,
    stop: stopRecognition,
    reset: resetTranscription,
    getTranscription: getTranscription
  };
  
  // Initialize on page load
  window.addEventListener('load', initSpeechRecognition);
})();