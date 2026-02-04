// real-time-analysis.js - Real-time analysis for interview video answers
// This file provides real-time analysis of body language and speech during video interviews

/**
 * RealTimeAnalysis class provides real-time feedback for video interviews
 * by analyzing body language and speech patterns during recording
 */
class RealTimeAnalysis {
  constructor() {
    // Initialize state
    this.isInitialized = false;
    this.isAnalyzing = false;
    this.analysisInterval = null;
    this.feedbackUpdateInterval = null;
    
    // Analysis data
    this.currentAnalysisData = {
      speech: {
        volume: 0,
        pace: 3,
        clarity: 3,
        fillerWords: 0
      },
      body: {
        eyeContact: 0,
        posture: 0,
        movement: 0,
        expression: 'neutral'
      },
      content: {
        relevance: 0,
        keywords: []
      }
    };
    
    // Analysis history (for tracking changes)
    this.analysisHistory = {
      speech: [],
      body: []
    };
    
    // DOM elements
    this.feedbackContainer = null;
    this.videoElement = null;
    
    // Initialize when the document is ready
    this.initialize();
  }
  
  /**
   * Initialize the real-time analysis system
   */
  async initialize() {
    try {
      console.log('Initializing real-time analysis...');
      
      // Check if required components are available
      if (!window.MLAnalysis || !window.MLAnalysis.isInitialized) {
        console.warn('ML Analysis not available for real-time analysis');
        return;
      }
      
      // Set initialized flag
      this.isInitialized = true;
      console.log('Real-time analysis initialized successfully');
      
      // Add event listeners for recording buttons
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing real-time analysis:', error);
    }
  }
  
  /**
   * Set up event listeners for recording buttons
   */
  setupEventListeners() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', () => {
      const startRecordingBtn = document.getElementById('startRecordingBtn');
      const stopRecordingBtn = document.getElementById('stopRecordingBtn');
      
      if (startRecordingBtn) {
        startRecordingBtn.addEventListener('click', () => {
          console.log('Start recording detected, preparing real-time analysis');
          // Wait for webcam to initialize
          setTimeout(() => this.startAnalysis(), 2000);
        });
      }
      
      if (stopRecordingBtn) {
        stopRecordingBtn.addEventListener('click', () => {
          console.log('Stop recording detected, stopping real-time analysis');
          this.stopAnalysis();
        });
      }
    });
  }
  
  /**
   * Start real-time analysis
   */
  startAnalysis() {
    if (!this.isInitialized || this.isAnalyzing) return;
    
    try {
      console.log('Starting real-time analysis...');
      
      // Get video element
      this.videoElement = document.getElementById('webcam');
      if (!this.videoElement || this.videoElement.style.display === 'none') {
        console.warn('Video element not found or not visible');
        return;
      }
      
      // Create feedback container if it doesn't exist
      this.createFeedbackContainer();
      
      // Set analyzing flag
      this.isAnalyzing = true;
      
      // Start analysis interval
      this.analysisInterval = setInterval(() => this.performAnalysis(), 1000);
      
      // Start feedback update interval (update UI less frequently than analysis)
      this.feedbackUpdateInterval = setInterval(() => this.updateFeedbackDisplay(), 2000);
      
      console.log('Real-time analysis started');
    } catch (error) {
      console.error('Error starting real-time analysis:', error);
    }
  }
  
  /**
   * Stop real-time analysis
   */
  stopAnalysis() {
    if (!this.isAnalyzing) return;
    
    console.log('Stopping real-time analysis...');
    
    // Clear intervals
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    
    if (this.feedbackUpdateInterval) {
      clearInterval(this.feedbackUpdateInterval);
      this.feedbackUpdateInterval = null;
    }
    
    // Reset analyzing flag
    this.isAnalyzing = false;
    
    // Save final analysis data for submission
    this.saveFinalAnalysisData();
    
    console.log('Real-time analysis stopped');
  }
  
  /**
   * Create feedback container for real-time feedback
   */
  createFeedbackContainer() {
    // Check if container already exists
    let container = document.getElementById('realTimeFeedbackContainer');
    if (container) {
      // Clear existing content
      container.innerHTML = '';
    } else {
      // Create new container
      container = document.createElement('div');
      container.id = 'realTimeFeedbackContainer';
      container.className = 'real-time-container';
      
      // Style the container
      container.style.marginTop = '15px';
      container.style.padding = '15px';
      container.style.backgroundColor = '#f0f8ff';
      container.style.borderRadius = '8px';
      container.style.border = '1px solid #cce5ff';
      container.style.fontSize = '0.9rem';
      
      // Add title
      const title = document.createElement('h3');
      title.textContent = 'Real-Time Feedback';
      title.style.marginTop = '0';
      title.style.marginBottom = '10px';
      title.style.color = '#0066cc';
      container.appendChild(title);
      
      // Create sections
      const speechSection = document.createElement('div');
      speechSection.id = 'speechFeedbackSection';
      speechSection.className = 'feedback-section';
      speechSection.innerHTML = '<strong>Speech:</strong> Analyzing...';
      container.appendChild(speechSection);
      
      const bodySection = document.createElement('div');
      bodySection.id = 'bodyFeedbackSection';
      bodySection.className = 'feedback-section';
      bodySection.innerHTML = '<strong>Body Language:</strong> Analyzing...';
      container.appendChild(bodySection);
      
      // Insert after the recording controls
      const recordingControls = document.getElementById('recordingControls');
      if (recordingControls) {
        recordingControls.appendChild(container);
      }
    }
    
    this.feedbackContainer = container;
  }
  
  /**
   * Perform real-time analysis of video and audio
   */
  performAnalysis() {
    if (!this.isAnalyzing || !this.videoElement) return;
    
    try {
      // Analyze video frame
      const videoAnalysis = window.MLAnalysis.analyzeVideoFrame(this.videoElement);
      
      if (videoAnalysis) {
        // Update body language data
        this.currentAnalysisData.body.eyeContact = videoAnalysis.eyeContactScore;
        this.currentAnalysisData.body.movement = videoAnalysis.movement;
        this.currentAnalysisData.body.posture = 3 + (videoAnalysis.eyeContactScore - 2.5) / 2; // Estimate posture based on eye contact
        
        // Add to history
        this.analysisHistory.body.push({
          timestamp: Date.now(),
          eyeContact: videoAnalysis.eyeContactScore,
          movement: videoAnalysis.movement,
          faceDetected: videoAnalysis.faceDetected
        });
        
        // Keep history at a reasonable size
        if (this.analysisHistory.body.length > 10) {
          this.analysisHistory.body.shift();
        }
      }
      
      // Analyze speech from transcription
      const transcription = window.recordingTranscription || '';
      if (transcription && transcription.length > 0) {
        const textAnalysis = window.MLAnalysis.analyzeText(transcription);
        
        if (textAnalysis) {
          // Update speech data
          this.currentAnalysisData.speech.fillerWords = textAnalysis.fillerWordRatio;
          
          // Add to history
          this.analysisHistory.speech.push({
            timestamp: Date.now(),
            fillerWordRatio: textAnalysis.fillerWordRatio,
            wordCount: textAnalysis.wordCount
          });
          
          // Keep history at a reasonable size
          if (this.analysisHistory.speech.length > 10) {
            this.analysisHistory.speech.shift();
          }
        }
      }
      
      // Get audio analysis from MLAnalysis if available
      if (window.audioAnalyser) {
        const audioData = new Uint8Array(window.audioAnalyser.frequencyBinCount);
        window.audioAnalyser.getByteTimeDomainData(audioData);
        
        const audioAnalysis = window.MLAnalysis.analyzeAudio(audioData);
        if (audioAnalysis) {
          this.currentAnalysisData.speech.volume = audioAnalysis.volume;
          this.currentAnalysisData.speech.pace = audioAnalysis.pace;
        }
      }
    } catch (error) {
      console.error('Error in real-time analysis:', error);
    }
  }
  
  /**
   * Update the feedback display with current analysis data
   */
  updateFeedbackDisplay() {
    if (!this.isAnalyzing || !this.feedbackContainer) return;
    
    try {
      // Update speech feedback
      const speechSection = document.getElementById('speechFeedbackSection');
      if (speechSection) {
        let speechFeedback = '<strong>Speech:</strong><br>';
        
        // Volume feedback
        const volume = this.currentAnalysisData.speech.volume;
        if (volume < 0.1) {
          speechFeedback += '<div class="feedback-item feedback-warning">Speaking too quietly</div>';
        } else if (volume > 0.8) {
          speechFeedback += '<div class="feedback-item feedback-warning">Speaking too loudly</div>';
        } else {
          speechFeedback += '<div class="feedback-item feedback-positive">Good volume level</div>';
        }
        
        // Pace feedback
        const pace = this.currentAnalysisData.speech.pace;
        if (pace < 2) {
          speechFeedback += '<div class="feedback-item feedback-warning">Speaking too slowly</div>';
        } else if (pace > 4) {
          speechFeedback += '<div class="feedback-item feedback-warning">Speaking too quickly</div>';
        } else {
          speechFeedback += '<div class="feedback-item feedback-positive">Good speaking pace</div>';
        }
        
        // Filler words feedback
        const fillerRatio = this.currentAnalysisData.speech.fillerWords;
        if (fillerRatio > 0.1) {
          speechFeedback += '<div class="feedback-item feedback-warning">Using too many filler words</div>';
        } else if (fillerRatio > 0) {
          speechFeedback += '<div class="feedback-item feedback-neutral">Occasional filler words detected</div>';
        }
        
        speechSection.innerHTML = speechFeedback;
      }
      
      // Update body language feedback
      const bodySection = document.getElementById('bodyFeedbackSection');
      if (bodySection) {
        let bodyFeedback = '<strong>Body Language:</strong><br>';
        
        // Eye contact feedback
        const eyeContact = this.currentAnalysisData.body.eyeContact;
        if (eyeContact < 2) {
          bodyFeedback += '<div class="feedback-item feedback-warning">Improve eye contact with the camera</div>';
        } else if (eyeContact >= 4) {
          bodyFeedback += '<div class="feedback-item feedback-positive">Excellent eye contact</div>';
        } else {
          bodyFeedback += '<div class="feedback-item feedback-neutral">Maintaining adequate eye contact</div>';
        }
        
        // Movement feedback
        const movement = this.currentAnalysisData.body.movement;
        if (movement < 0.5) {
          bodyFeedback += '<div class="feedback-item feedback-warning">Try to be more animated</div>';
        } else if (movement > 3) {
          bodyFeedback += '<div class="feedback-item feedback-warning">Too much movement detected</div>';
        } else {
          bodyFeedback += '<div class="feedback-item feedback-positive">Good body language</div>';
        }
        
        // Face detection feedback
        const recentFaceDetections = this.analysisHistory.body.slice(-5);
        const faceDetectionRate = recentFaceDetections.filter(d => d.faceDetected).length / 
                                 Math.max(1, recentFaceDetections.length);
        
        if (faceDetectionRate < 0.7) {
          bodyFeedback += '<div class="feedback-item feedback-warning">Face not clearly visible</div>';
        }
        
        bodySection.innerHTML = bodyFeedback;
      }
    } catch (error) {
      console.error('Error updating feedback display:', error);
    }
  }
  
  /**
   * Save final analysis data for submission
   */
  saveFinalAnalysisData() {
    // Store the final analysis data in a global variable for use in submission
    window.finalAnalysisData = {
      speech: {
        volume: this.calculateAverage(this.analysisHistory.speech.map(d => d.volume)),
        pace: this.calculateAverage(this.analysisHistory.speech.map(d => d.pace)),
        fillerWords: this.calculateAverage(this.analysisHistory.speech.map(d => d.fillerWordRatio || 0))
      },
      body: {
        eyeContact: this.calculateAverage(this.analysisHistory.body.map(d => d.eyeContact)),
        movement: this.calculateAverage(this.analysisHistory.body.map(d => d.movement)),
        faceDetectionRate: this.analysisHistory.body.filter(d => d.faceDetected).length / 
                          Math.max(1, this.analysisHistory.body.length)
      }
    };
    
    console.log('Final analysis data saved:', window.finalAnalysisData);
  }
  
  /**
   * Calculate average of an array of numbers
   */
  calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }
}

// Initialize the real-time analysis
window.RealTimeAnalysis = new RealTimeAnalysis();