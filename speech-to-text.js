// speech-to-text.js - Simple real-time speech recognition for interview answers

/**
 * This file provides real-time speech recognition using the Web Speech API.
 * It transcribes speech during recording and provides the transcription
 * for analysis by the Together.ai API.
 */

class SpeechRecognitionService {
  constructor() {
    // Check if browser supports speech recognition
    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!this.SpeechRecognition;
    
    if (!this.isSupported) {
      console.warn("Speech Recognition is not supported in this browser.");
      return;
    }
    
    // Initialize speech recognition
    this.recognition = new this.SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
    
    // State variables
    this.isListening = false;
    this.transcription = '';
    this.interimTranscription = '';
    this.onTranscriptionUpdateCallback = null;
    this.onFinalTranscriptionCallback = null;
    this.restartCount = 0;
    this.maxRestarts = 5;
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Log initialization success
    console.log("Speech Recognition Service initialized successfully");
  }
  
  setupEventHandlers() {
    if (!this.isSupported) return;
    
    // Handle results
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update transcriptions
      if (finalTranscript) {
        this.transcription += finalTranscript;
        this.transcription = this.transcription.trim();
        
        // Call the final transcription callback if set
        if (this.onFinalTranscriptionCallback) {
          this.onFinalTranscriptionCallback(this.transcription);
        }
        
        // Log successful transcription
        console.log('Transcription updated:', finalTranscript);
      }
      
      this.interimTranscription = interimTranscript;
      
      // Call the update callback if set
      if (this.onTranscriptionUpdateCallback) {
        this.onTranscriptionUpdateCallback(this.transcription, this.interimTranscription);
      }
    };
    
    // Handle errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error, event);
      
      // Try to restart if it's not a fatal error and we haven't exceeded max restarts
      if (event.error !== 'aborted' && 
          event.error !== 'not-allowed' && 
          this.isListening && 
          this.restartCount < this.maxRestarts) {
        
        this.restartCount++;
        console.log(`Attempting to restart speech recognition (${this.restartCount}/${this.maxRestarts})`);
        
        setTimeout(() => {
          this.startListening();
        }, 1000);
      } else if (this.restartCount >= this.maxRestarts) {
        console.warn('Maximum restart attempts reached. Speech recognition disabled.');
        this.isListening = false;
        
        // Notify user of the issue
        if (this.onTranscriptionUpdateCallback) {
          this.onTranscriptionUpdateCallback(
            this.transcription, 
            "Speech recognition encountered too many errors. Please try again or use text input."
          );
        }
      }
    };
    
    // Restart when it ends unexpectedly
    this.recognition.onend = () => {
      console.log('Speech recognition ended', this.isListening ? '(restarting)' : '(stopped)');
      
      if (this.isListening && this.restartCount < this.maxRestarts) {
        this.startListening();
      }
    };
    
    // Log when recognition starts
    this.recognition.onstart = () => {
      console.log('Speech recognition started');
    };
    
    // Log when audio starts
    this.recognition.onaudiostart = () => {
      console.log('Speech recognition audio started');
    };
    
    // Log when sound is detected
    this.recognition.onsoundstart = () => {
      console.log('Speech recognition sound detected');
    };
    
    // Log when speech is detected
    this.recognition.onspeechstart = () => {
      console.log('Speech detected');
    };
  }
  
  startListening() {
    if (!this.isSupported) return false;
    
    try {
      // Reset restart count when manually starting
      this.restartCount = 0;
      
      // Start recognition
      this.recognition.start();
      this.isListening = true;
      console.log('Speech recognition started successfully');
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      
      // If already running error, try stopping first then starting again
      if (error.name === 'InvalidStateError') {
        console.log('Recognition was already running, stopping and restarting...');
        try {
          this.recognition.stop();
          setTimeout(() => {
            this.recognition.start();
            this.isListening = true;
          }, 500);
          return true;
        } catch (innerError) {
          console.error('Failed to restart recognition:', innerError);
          return false;
        }
      }
      
      return false;
    }
  }
  
  stopListening() {
    if (!this.isSupported) return;
    
    this.isListening = false;
    this.restartCount = 0;
    
    try {
      this.recognition.stop();
      console.log('Speech recognition stopped successfully');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
  
  resetTranscription() {
    this.transcription = '';
    this.interimTranscription = '';
    console.log('Transcription reset');
  }
  
  getTranscription() {
    return {
      final: this.transcription,
      interim: this.interimTranscription
    };
  }
  
  // Set callback for transcription updates
  onTranscriptionUpdate(callback) {
    this.onTranscriptionUpdateCallback = callback;
    console.log('Transcription update callback set');
  }
  
  // Set callback for final transcription segments
  onFinalTranscription(callback) {
    this.onFinalTranscriptionCallback = callback;
    console.log('Final transcription callback set');
  }
}

// Create and export the speech recognition service
window.SpeechRecognitionService = new SpeechRecognitionService();

// Add a browser compatibility check that runs on page load
document.addEventListener('DOMContentLoaded', function() {
  if (!window.SpeechRecognitionService.isSupported) {
    console.warn('Speech recognition is not supported in this browser');
    
    // Add a notice to the page
    const micStatus = document.getElementById('micStatus');
    if (micStatus) {
      micStatus.textContent = 'Speech recognition not supported in this browser. Please use Chrome or Edge.';
      micStatus.style.color = '#f44336';
    }
  } else {
    console.log('Speech recognition is supported in this browser');
  }
});