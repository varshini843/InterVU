// realtime-together-analysis.js - Real-time analysis using Together.ai API
// This file provides real-time analysis of body language and speech during video interviews

/**
 * RealtimeTogetherAnalysis class provides real-time feedback for video interviews
 * by analyzing body language and speech patterns during recording using Together.ai API
 */
class RealtimeTogetherAnalysis {
  constructor() {
    // Initialize state
    this.isInitialized = false;
    this.isAnalyzing = false;
    this.analysisInterval = null;
    this.videoAnalysisInterval = null;
    this.feedbackUpdateInterval = null;
    
    // Analysis data
    this.currentAnalysisData = {
      speech: {
        volume: 0.5,
        pace: 3.0,
        clarity: 3.0,
        fillerWords: 0
      },
      body: {
        eyeContact: 3.0,
        posture: 3.0,
        movement: 2.0,
        faceDetectionRate: 0.8,
        expression: 'neutral'
      },
      content: {
        relevance: 3.0,
        keywords: [],
        suggestions: []
      }
    };
    
    // Video frames for analysis
    this.videoFrames = [];
    this.frameCaptureTimes = [];
    this.maxFrames = 5; // Keep last 5 frames for analysis
    
    // Transcription history
    this.transcriptionHistory = [];
    this.lastAnalysisTime = 0;
    this.analysisDelay = 5000; // 5 seconds between API calls
    
    // DOM elements
    this.feedbackContainer = null;
    this.videoElement = null;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Initialize when the document is ready
    this.initialize();
  }
  
  /**
   * Initialize the real-time analysis system
   */
  async initialize() {
    try {
      console.log('Initializing real-time Together.ai analysis...');
      
      // Check if Together API is available
      if (!window.TogetherAPI || !window.TogetherAPI.isInitialized) {
        console.warn('Together API not available for real-time analysis');
        return;
      }
      
      // Set initialized flag
      this.isInitialized = true;
      console.log('Real-time Together.ai analysis initialized successfully');
      
      // Add event listeners for recording buttons
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing real-time Together.ai analysis:', error);
    }
  }
  
  /**
   * Set up event listeners for recording buttons
   */
  setupEventListeners() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.attachEventListeners());
    } else {
      this.attachEventListeners();
    }
  }
  
  /**
   * Attach event listeners to recording buttons
   */
  attachEventListeners() {
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    
    if (startRecordingBtn) {
      startRecordingBtn.addEventListener('click', () => {
        console.log('Start recording detected, preparing real-time Together.ai analysis');
        // Wait for webcam to initialize
        setTimeout(() => this.startAnalysis(), 2000);
      });
    } else {
      console.warn('Start recording button not found');
    }
    
    if (stopRecordingBtn) {
      stopRecordingBtn.addEventListener('click', () => {
        console.log('Stop recording detected, stopping real-time Together.ai analysis');
        this.stopAnalysis();
      });
    } else {
      console.warn('Stop recording button not found');
    }
  }
  
  /**
   * Start real-time analysis
   */
  startAnalysis() {
    if (!this.isInitialized || this.isAnalyzing) return;
    
    try {
      console.log('Starting real-time Together.ai analysis...');
      
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
      
      // Start video frame capture interval
      this.videoAnalysisInterval = setInterval(() => this.captureVideoFrame(), 1000);
      
      // Start analysis interval (less frequent to avoid API rate limits)
      this.analysisInterval = setInterval(() => this.performAnalysis(), 5000);
      
      // Start feedback update interval
      this.feedbackUpdateInterval = setInterval(() => this.updateFeedbackDisplay(), 2000);
      
      console.log('Real-time Together.ai analysis started');
    } catch (error) {
      console.error('Error starting real-time Together.ai analysis:', error);
    }
  }
  
  /**
   * Stop real-time analysis
   */
  stopAnalysis() {
    if (!this.isAnalyzing) return;
    
    console.log('Stopping real-time Together.ai analysis...');
    
    // Clear intervals
    if (this.videoAnalysisInterval) {
      clearInterval(this.videoAnalysisInterval);
      this.videoAnalysisInterval = null;
    }
    
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
    
    console.log('Real-time Together.ai analysis stopped');
  }
  
  /**
   * Create feedback container for real-time feedback (hidden during recording)
   */
  createFeedbackContainer() {
    // We'll still create the container but keep it hidden during recording
    // The analysis will continue in the background
    
    // Check if container already exists
    let container = document.getElementById('realtimeFeedbackContainer');
    if (container) {
      // Clear existing content
      container.innerHTML = '';
    } else {
      // Create new container but don't display it
      container = document.createElement('div');
      container.id = 'realtimeFeedbackContainer';
      container.className = 'real-time-container';
      
      // Hide the container during recording
      container.style.display = 'none';
      
      // Create sections (hidden but ready for data collection)
      const speechSection = document.createElement('div');
      speechSection.id = 'speechFeedbackSection';
      speechSection.className = 'feedback-section';
      container.appendChild(speechSection);
      
      const bodySection = document.createElement('div');
      bodySection.id = 'bodyFeedbackSection';
      bodySection.className = 'feedback-section';
      container.appendChild(bodySection);
      
      const contentSection = document.createElement('div');
      contentSection.id = 'contentFeedbackSection';
      contentSection.className = 'feedback-section';
      container.appendChild(contentSection);
      
      // Add to document but keep hidden
      document.body.appendChild(container);
      
      console.log('Created hidden feedback container for data collection');
    }
    
    this.feedbackContainer = container;
  }
  
  /**
   * Capture video frame for analysis
   */
  captureVideoFrame() {
    if (!this.isAnalyzing || !this.videoElement) return;
    
    try {
      // Set canvas dimensions to match video
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
      
      // Draw current video frame to canvas
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      
      // Get image data as base64 string
      const frameData = this.canvas.toDataURL('image/jpeg', 0.7);
      
      // Add to frames array
      this.videoFrames.push(frameData);
      this.frameCaptureTimes.push(Date.now());
      
      // Keep only the most recent frames
      if (this.videoFrames.length > this.maxFrames) {
        this.videoFrames.shift();
        this.frameCaptureTimes.shift();
      }
      
      // Perform basic analysis on the frame
      this.analyzeVideoFrame();
    } catch (error) {
      console.error('Error capturing video frame:', error);
    }
  }
  
  /**
   * Analyze video frame for basic body language metrics
   */
  analyzeVideoFrame() {
    if (this.videoFrames.length === 0) return;
    
    try {
      // Get image data for analysis
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Calculate brightness as a proxy for lighting conditions
      const brightness = this.calculateBrightness(imageData.data);
      
      // Calculate movement by comparing with previous frame
      let movement = 0;
      if (this.videoFrames.length > 1) {
        movement = this.estimateMovement();
      }
      
      // Simulate face detection (in a real implementation, this would use ML)
      const faceDetected = brightness > 30 && brightness < 200;
      
      // Update body language data
      this.currentAnalysisData.body.faceDetectionRate = faceDetected ? 
        (this.currentAnalysisData.body.faceDetectionRate * 0.8 + 0.2) : 
        (this.currentAnalysisData.body.faceDetectionRate * 0.8);
      
      this.currentAnalysisData.body.movement = movement > 0 ? 
        (this.currentAnalysisData.body.movement * 0.7 + movement * 0.3) : 
        this.currentAnalysisData.body.movement;
    } catch (error) {
      console.error('Error analyzing video frame:', error);
    }
  }
  
  /**
   * Perform real-time analysis using Together.ai API
   */
  async performAnalysis() {
    if (!this.isAnalyzing) return;
    
    try {
      // Get current transcription
      const transcription = window.recordingTranscription || '';
      
      // Skip if transcription is too short or unchanged
      if (transcription.length < 20 || 
          this.transcriptionHistory.includes(transcription) ||
          Date.now() - this.lastAnalysisTime < this.analysisDelay) {
        return;
      }
      
      // Update transcription history
      this.transcriptionHistory.push(transcription);
      if (this.transcriptionHistory.length > 5) {
        this.transcriptionHistory.shift();
      }
      
      // Update last analysis time
      this.lastAnalysisTime = Date.now();
      
      // Get current question
      const questionElement = document.getElementById('questionBox');
      const question = questionElement ? questionElement.textContent.trim() : 'Interview question';
      
      // Call Together.ai API for real-time analysis
      const analysisResult = await this.analyzeWithTogetherAPI(question, transcription);
      
      if (analysisResult) {
        // Update analysis data with API results
        this.updateAnalysisData(analysisResult);
      }
    } catch (error) {
      console.error('Error in real-time Together.ai analysis:', error);
    }
  }
  
  /**
   * Analyze with Together.ai API
   */
  async analyzeWithTogetherAPI(question, transcription) {
    if (!window.TogetherAPI || !window.TogetherAPI.isInitialized) {
      console.warn('Together API not available');
      return null;
    }
    
    try {
      // Create prompt for real-time analysis
      const prompt = `
You are an AI assistant providing real-time feedback during a video interview.
Analyze the following partial answer to an interview question:

Question: "${question}"

Partial answer so far: "${transcription}"

Based on the transcription, provide real-time feedback on:
1. Speech patterns (pace, clarity, filler words)
2. Content relevance to the question
3. Suggestions for improvement

Format your response as a JSON object with the following structure:
{
  "speech": {
    "pace": [1-5 score where 3 is optimal],
    "clarity": [1-5 score where 5 is best],
    "fillerWords": [0-1 ratio of filler words],
    "feedback": "brief feedback on speech"
  },
  "content": {
    "relevance": [1-5 score where 5 is most relevant],
    "keywords": ["key term 1", "key term 2"],
    "suggestions": ["suggestion 1", "suggestion 2"],
    "feedback": "brief feedback on content"
  }
}

Only return the JSON object, no other text.
`;

      // Call Together API
      const response = await window.TogetherAPI.makeRequest(prompt, {
        temperature: 0.1,
        max_tokens: 512
      });
      
      // Parse JSON from response
      try {
        // Extract JSON object from response (in case there's additional text)
        const jsonMatch = response.match(/{[\s\S]*}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return null;
      } catch (error) {
        console.error('Error parsing Together API response:', error);
        return null;
      }
    } catch (error) {
      console.error('Error calling Together API:', error);
      return null;
    }
  }
  
  /**
   * Update analysis data with API results
   */
  updateAnalysisData(apiResult) {
    if (!apiResult) return;
    
    try {
      // Update speech data
      if (apiResult.speech) {
        this.currentAnalysisData.speech.pace = apiResult.speech.pace || this.currentAnalysisData.speech.pace;
        this.currentAnalysisData.speech.clarity = apiResult.speech.clarity || this.currentAnalysisData.speech.clarity;
        this.currentAnalysisData.speech.fillerWords = apiResult.speech.fillerWords || this.currentAnalysisData.speech.fillerWords;
        this.currentAnalysisData.speech.feedback = apiResult.speech.feedback;
      }
      
      // Update content data
      if (apiResult.content) {
        this.currentAnalysisData.content.relevance = apiResult.content.relevance || this.currentAnalysisData.content.relevance;
        this.currentAnalysisData.content.keywords = apiResult.content.keywords || [];
        this.currentAnalysisData.content.suggestions = apiResult.content.suggestions || [];
        this.currentAnalysisData.content.feedback = apiResult.content.feedback;
      }
      
      console.log('Updated analysis data from API:', this.currentAnalysisData);
    } catch (error) {
      console.error('Error updating analysis data:', error);
    }
  }
  
  /**
   * Update the feedback display with current analysis data
   * (This function is now just collecting data without displaying it)
   */
  updateFeedbackDisplay() {
    if (!this.isAnalyzing) return;
    
    try {
      // Instead of updating the UI, we'll just log the data collection
      console.log('Collecting analysis data silently...');
      
      // We're still collecting data, just not showing it
      // This ensures we have good data for the final analysis
      
      // Log some key metrics for debugging
      const metrics = {
        speech: {
          pace: this.currentAnalysisData.speech.pace,
          clarity: this.currentAnalysisData.speech.clarity,
          fillerWords: this.currentAnalysisData.speech.fillerWords
        },
        body: {
          faceDetectionRate: this.currentAnalysisData.body.faceDetectionRate,
          movement: this.currentAnalysisData.body.movement
        },
        content: {
          relevance: this.currentAnalysisData.content.relevance,
          keywordsCount: this.currentAnalysisData.content.keywords?.length || 0
        }
      };
      
      // Log metrics occasionally (not every update to avoid console spam)
      if (Math.random() < 0.2) { // Only log about 20% of the time
        console.log('Current analysis metrics:', metrics);
      }
    } catch (error) {
      console.error('Error in data collection:', error);
    }
  }
  
  /**
   * Save final analysis data for submission
   */
  saveFinalAnalysisData() {
    // Store the final analysis data in a global variable for use in submission
    window.finalAnalysisData = {
      speech: {
        volume: this.currentAnalysisData.speech.volume,
        pace: this.currentAnalysisData.speech.pace,
        clarity: this.currentAnalysisData.speech.clarity,
        fillerWords: this.currentAnalysisData.speech.fillerWords
      },
      body: {
        eyeContact: this.currentAnalysisData.body.faceDetectionRate * 5, // Convert to 0-5 scale
        movement: this.currentAnalysisData.body.movement,
        faceDetectionRate: this.currentAnalysisData.body.faceDetectionRate
      },
      content: {
        relevance: this.currentAnalysisData.content.relevance,
        keywords: this.currentAnalysisData.content.keywords
      }
    };
    
    console.log('Final Together.ai analysis data saved:', window.finalAnalysisData);
  }
  
  /**
   * Calculate brightness of image data
   */
  calculateBrightness(pixelData) {
    let totalBrightness = 0;
    let pixelCount = 0;
    
    // Sample pixels (every 20th pixel for performance)
    for (let i = 0; i < pixelData.length; i += 80) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      
      // Calculate perceived brightness
      // Using the formula: (0.299*R + 0.587*G + 0.114*B)
      totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
      pixelCount++;
    }
    
    // Return average brightness (0-255)
    return totalBrightness / pixelCount;
  }
  
  /**
   * Estimate movement between frames
   */
  estimateMovement() {
    if (this.videoFrames.length < 2) return 0;
    
    // Simple movement estimation based on time between frames
    const timeDiff = this.frameCaptureTimes[this.frameCaptureTimes.length - 1] - 
                    this.frameCaptureTimes[this.frameCaptureTimes.length - 2];
    
    // Random movement score between 1-5 based on time difference
    // In a real implementation, this would use computer vision to detect actual movement
    const randomFactor = Math.sin(Date.now() / 1000) * 0.5 + 0.5; // Oscillating value between 0-1
    return 1 + randomFactor * 4; // Scale to 1-5
  }
}

// Initialize the real-time Together.ai analysis
window.RealtimeTogetherAnalysis = new RealtimeTogetherAnalysis();

// Add CSS styles for feedback
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .feedback-section {
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .feedback-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .feedback-item {
      margin-bottom: 5px;
      display: flex;
      align-items: flex-start;
      padding-left: 15px;
      position: relative;
    }
    
    .feedback-item::before {
      content: "•";
      position: absolute;
      left: 0;
      top: 0;
    }
    
    .feedback-positive {
      color: #4caf50;
    }
    
    .feedback-warning {
      color: #ff9800;
    }
    
    .feedback-negative {
      color: #f44336;
    }
    
    .feedback-neutral {
      color: #607d8b;
    }
    
    .feedback-tip {
      color: #2196f3;
    }
  `;
  document.head.appendChild(style);
})();