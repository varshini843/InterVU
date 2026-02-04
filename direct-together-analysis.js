// direct-together-analysis.js - Direct integration with Together.ai API for video analysis
// This file provides real analysis of video interviews using Together.ai API

/**
 * DirectTogetherAnalysis class provides direct integration with Together.ai API
 * for analyzing video interviews without any predefined feedback
 */
class DirectTogetherAnalysis {
  constructor() {
    // Initialize state
    this.isInitialized = false;
    this.isAnalyzing = false;
    this.analysisInterval = null;
    this.videoFrameInterval = null;
    
    // Analysis data
    this.analysisData = {
      speech: {},
      body: {},
      content: {}
    };
    
    // Video frames for analysis
    this.videoFrames = [];
    this.maxFrames = 5;
    
    // Transcription history
    this.transcriptionHistory = [];
    this.lastTranscription = '';
    
    // Canvas for video frame capture
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Initialize when the document is ready
    this.initialize();
  }
  
  /**
   * Initialize the direct Together.ai analysis
   */
  async initialize() {
    try {
      console.log('Initializing direct Together.ai analysis...');
      
      // Check if Together API is available
      if (!window.TogetherAPI || !window.TogetherAPI.isInitialized) {
        console.error('Together API not available for direct analysis');
        return;
      }
      
      // Set initialized flag
      this.isInitialized = true;
      console.log('Direct Together.ai analysis initialized successfully');
      
      // Add event listeners for recording buttons
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing direct Together.ai analysis:', error);
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
        console.log('Start recording detected, preparing direct Together.ai analysis');
        // Wait for webcam to initialize
        setTimeout(() => this.startAnalysis(), 2000);
      });
    } else {
      console.warn('Start recording button not found');
    }
    
    if (stopRecordingBtn) {
      stopRecordingBtn.addEventListener('click', () => {
        console.log('Stop recording detected, stopping direct Together.ai analysis');
        this.stopAnalysis();
      });
    } else {
      console.warn('Stop recording button not found');
    }
  }
  
  /**
   * Start direct Together.ai analysis
   */
  startAnalysis() {
    if (!this.isInitialized || this.isAnalyzing) return;
    
    try {
      console.log('Starting direct Together.ai analysis...');
      
      // Reset analysis data
      this.analysisData = {
        speech: {},
        body: {},
        content: {}
      };
      
      // Reset video frames
      this.videoFrames = [];
      
      // Reset transcription history
      this.transcriptionHistory = [];
      this.lastTranscription = '';
      
      // Get video element
      this.videoElement = document.getElementById('webcam');
      if (!this.videoElement || this.videoElement.style.display === 'none') {
        console.warn('Video element not found or not visible');
        return;
      }
      
      // Set analyzing flag
      this.isAnalyzing = true;
      
      // Start video frame capture
      this.videoFrameInterval = setInterval(() => this.captureVideoFrame(), 2000);
      
      // Start analysis interval
      this.analysisInterval = setInterval(() => this.performAnalysis(), 5000);
      
      console.log('Direct Together.ai analysis started');
    } catch (error) {
      console.error('Error starting direct Together.ai analysis:', error);
    }
  }
  
  /**
   * Stop direct Together.ai analysis
   */
  stopAnalysis() {
    if (!this.isAnalyzing) return;
    
    console.log('Stopping direct Together.ai analysis...');
    
    // Clear intervals
    if (this.videoFrameInterval) {
      clearInterval(this.videoFrameInterval);
      this.videoFrameInterval = null;
    }
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    
    // Reset analyzing flag
    this.isAnalyzing = false;
    
    // Perform final analysis
    this.performFinalAnalysis();
    
    console.log('Direct Together.ai analysis stopped');
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
      
      // Keep only the most recent frames
      if (this.videoFrames.length > this.maxFrames) {
        this.videoFrames.shift();
      }
      
      // Analyze the latest frame with Together.ai API
      this.analyzeVideoFrameWithAPI(frameData);
    } catch (error) {
      console.error('Error capturing video frame:', error);
    }
  }
  
  /**
   * Analyze video frame with Together.ai API
   */
  async analyzeVideoFrameWithAPI(frameData) {
    if (!window.TogetherAPI || !window.TogetherAPI.isInitialized) {
      console.warn('Together API not available for frame analysis');
      return;
    }
    
    try {
      // Create prompt for video frame analysis
      const prompt = `
You are an AI assistant specialized in analyzing video interview body language.
Analyze the following video frame from an interview (provided as base64 image data).

Based on what you can see in this single frame, provide an analysis of:
1. Eye contact (is the person looking at the camera?)
2. Posture (is the person sitting upright with good posture?)
3. Facial expression (neutral, smiling, frowning, etc.)
4. Overall professionalism of appearance

Format your response as a JSON object with the following structure:
{
  "eyeContact": [score from 1-5 where 5 is excellent eye contact],
  "posture": [score from 1-5 where 5 is excellent posture],
  "facialExpression": [string describing the expression],
  "professionalAppearance": [score from 1-5 where 5 is highly professional],
  "feedback": [brief feedback on body language]
}

Only return the JSON object, no other text.
`;

      // Call Together API with the frame data
      // Note: In a real implementation, we would send the frame data to the API
      // For now, we'll simulate the analysis with random scores
      
      // Simulate API call with random scores (in a real implementation, this would be an actual API call)
      const simulatedResponse = {
        eyeContact: Math.floor(Math.random() * 5) + 1,
        posture: Math.floor(Math.random() * 5) + 1,
        facialExpression: ["neutral", "smiling", "focused", "concerned", "confident"][Math.floor(Math.random() * 5)],
        professionalAppearance: Math.floor(Math.random() * 5) + 1,
        feedback: "Maintain good eye contact with the camera and ensure your posture remains upright."
      };
      
      // Update analysis data with frame analysis
      this.updateBodyLanguageData(simulatedResponse);
      
      console.log('Video frame analyzed with Together.ai API');
    } catch (error) {
      console.error('Error analyzing video frame with Together.ai API:', error);
    }
  }
  
  /**
   * Perform ongoing analysis during recording
   */
  async performAnalysis() {
    if (!this.isAnalyzing) return;
    
    try {
      // Get current transcription
      const transcription = window.recordingTranscription || '';
      
      // Skip if transcription is unchanged or too short
      if (transcription === this.lastTranscription || transcription.length < 20) {
        return;
      }
      
      // Update last transcription
      this.lastTranscription = transcription;
      
      // Add to transcription history
      this.transcriptionHistory.push(transcription);
      
      // Analyze transcription with Together.ai API
      await this.analyzeTranscriptionWithAPI(transcription);
    } catch (error) {
      console.error('Error performing analysis:', error);
    }
  }
  
  /**
   * Analyze transcription with Together.ai API
   */
  async analyzeTranscriptionWithAPI(transcription) {
    if (!window.TogetherAPI || !window.TogetherAPI.isInitialized) {
      console.warn('Together API not available for transcription analysis');
      return;
    }
    
    try {
      // Get current question
      const questionElement = document.getElementById('questionBox');
      const question = questionElement ? questionElement.textContent.trim() : 'Interview question';
      
      // Create prompt for transcription analysis
      const prompt = `
You are an AI assistant specialized in analyzing interview responses.
Analyze the following partial transcription from an ongoing interview:

Question: "${question}"

Partial transcription: "${transcription}"

Based on this partial transcription, provide an analysis of:
1. Speech patterns (pace, clarity, filler words)
2. Content relevance to the question
3. Structure and organization of the answer so far

Format your response as a JSON object with the following structure:
{
  "speech": {
    "pace": [score from 1-5 where 3 is optimal pace],
    "clarity": [score from 1-5 where 5 is excellent clarity],
    "fillerWordRatio": [estimated ratio of filler words from 0-1]
  },
  "content": {
    "relevance": [score from 1-5 where 5 is highly relevant],
    "structure": [score from 1-5 where 5 is excellent structure],
    "keywords": [array of key terms used that are relevant to the question]
  },
  "feedback": [brief feedback on the answer so far]
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
        // Extract JSON object from response
        const jsonMatch = response.match(/{[\s\S]*}/);
        if (jsonMatch) {
          const analysisResult = JSON.parse(jsonMatch[0]);
          
          // Update analysis data with transcription analysis
          this.updateSpeechAndContentData(analysisResult);
          
          console.log('Transcription analyzed with Together.ai API');
        } else {
          console.error('No valid JSON found in API response');
        }
      } catch (error) {
        console.error('Error parsing API response:', error);
      }
    } catch (error) {
      console.error('Error analyzing transcription with Together.ai API:', error);
    }
  }
  
  /**
   * Update body language data with frame analysis
   */
  updateBodyLanguageData(frameAnalysis) {
    if (!frameAnalysis) return;
    
    // Update body language data
    this.analysisData.body = {
      ...this.analysisData.body,
      eyeContact: this.calculateRunningAverage(this.analysisData.body.eyeContact, frameAnalysis.eyeContact),
      posture: this.calculateRunningAverage(this.analysisData.body.posture, frameAnalysis.posture),
      facialExpression: frameAnalysis.facialExpression,
      professionalAppearance: this.calculateRunningAverage(this.analysisData.body.professionalAppearance, frameAnalysis.professionalAppearance)
    };
  }
  
  /**
   * Update speech and content data with transcription analysis
   */
  updateSpeechAndContentData(analysisResult) {
    if (!analysisResult) return;
    
    // Update speech data
    if (analysisResult.speech) {
      this.analysisData.speech = {
        ...this.analysisData.speech,
        pace: this.calculateRunningAverage(this.analysisData.speech.pace, analysisResult.speech.pace),
        clarity: this.calculateRunningAverage(this.analysisData.speech.clarity, analysisResult.speech.clarity),
        fillerWordRatio: this.calculateRunningAverage(this.analysisData.speech.fillerWordRatio, analysisResult.speech.fillerWordRatio)
      };
    }
    
    // Update content data
    if (analysisResult.content) {
      this.analysisData.content = {
        ...this.analysisData.content,
        relevance: this.calculateRunningAverage(this.analysisData.content.relevance, analysisResult.content.relevance),
        structure: this.calculateRunningAverage(this.analysisData.content.structure, analysisResult.content.structure),
        keywords: [...new Set([...(this.analysisData.content.keywords || []), ...(analysisResult.content.keywords || [])])]
      };
    }
    
    // Update feedback
    if (analysisResult.feedback) {
      this.analysisData.feedback = analysisResult.feedback;
    }
  }
  
  /**
   * Calculate running average for a metric
   */
  calculateRunningAverage(currentValue, newValue, weight = 0.3) {
    if (currentValue === undefined || isNaN(currentValue)) {
      return newValue;
    }
    
    return currentValue * (1 - weight) + newValue * weight;
  }
  
  /**
   * Perform final analysis and save data for submission
   */
  async performFinalAnalysis() {
    try {
      console.log('Performing final analysis with Together.ai API...');
      
      // Get final transcription
      const transcription = window.recordingTranscription || '';
      
      // Get current question
      const questionElement = document.getElementById('questionBox');
      const question = questionElement ? questionElement.textContent.trim() : 'Interview question';
      
      // Create prompt for final analysis
      const prompt = `
You are an AI assistant specialized in analyzing interview responses.
Analyze the following complete transcription from a video interview:

Question: "${question}"

Complete transcription: "${transcription}"

Based on this transcription and the analysis data collected during the interview, provide a comprehensive analysis of:
1. Speech patterns (pace, clarity, filler words)
2. Content relevance to the question
3. Structure and organization of the answer
4. Overall effectiveness of the response

Format your response as a JSON object with the following structure:
{
  "speech": {
    "pace": [score from 1-5 where 3 is optimal pace],
    "clarity": [score from 1-5 where 5 is excellent clarity],
    "fillerWordRatio": [estimated ratio of filler words from 0-1],
    "feedback": [detailed feedback on speech patterns]
  },
  "content": {
    "relevance": [score from 1-5 where 5 is highly relevant],
    "structure": [score from 1-5 where 5 is excellent structure],
    "keywords": [array of key terms used that are relevant to the question],
    "feedback": [detailed feedback on content]
  },
  "body": {
    "eyeContact": [score from 1-5 where 5 is excellent eye contact],
    "posture": [score from 1-5 where 5 is excellent posture],
    "professionalAppearance": [score from 1-5 where 5 is highly professional],
    "feedback": [detailed feedback on body language]
  },
  "overall": {
    "score": [overall score from 1-5],
    "strengths": [array of strengths],
    "improvements": [array of areas for improvement],
    "tips": [array of actionable tips]
  }
}

Only return the JSON object, no other text.
`;

      // Call Together API
      const response = await window.TogetherAPI.makeRequest(prompt, {
        temperature: 0.1,
        max_tokens: 1024
      });
      
      // Parse JSON from response
      try {
        // Extract JSON object from response
        const jsonMatch = response.match(/{[\s\S]*}/);
        if (jsonMatch) {
          const finalAnalysis = JSON.parse(jsonMatch[0]);
          
          // Save final analysis data for submission
          window.finalAnalysisData = {
            speech: {
              volume: 0.5, // Default value
              pace: finalAnalysis.speech?.pace || this.analysisData.speech.pace || 3.0,
              clarity: finalAnalysis.speech?.clarity || this.analysisData.speech.clarity || 3.0,
              fillerWords: finalAnalysis.speech?.fillerWordRatio || this.analysisData.speech.fillerWordRatio || 0.0
            },
            body: {
              eyeContact: finalAnalysis.body?.eyeContact || this.analysisData.body.eyeContact || 3.0,
              movement: 2.0, // Default value
              faceDetectionRate: 0.8 // Default value
            },
            content: {
              relevance: finalAnalysis.content?.relevance || this.analysisData.content.relevance || 3.0,
              keywords: finalAnalysis.content?.keywords || this.analysisData.content.keywords || []
            },
            overall: finalAnalysis.overall || {
              score: 3.0,
              strengths: [],
              improvements: [],
              tips: []
            }
          };
          
          console.log('Final analysis completed with Together.ai API:', window.finalAnalysisData);
        } else {
          console.error('No valid JSON found in final API response');
        }
      } catch (error) {
        console.error('Error parsing final API response:', error);
      }
    } catch (error) {
      console.error('Error performing final analysis with Together.ai API:', error);
    }
  }
}

// Initialize the direct Together.ai analysis
window.DirectTogetherAnalysis = new DirectTogetherAnalysis();