// ml-analysis.js - Machine Learning based analysis for interview performance

/**
 * This file provides ML-based analysis for:
 * 1. Speech patterns and quality
 * 2. Video-based body language analysis
 * 3. Real-time feedback on interview performance
 */

class MLAnalysis {
  constructor() {
    // Initialize state
    this.isInitialized = false;
    this.models = {
      speech: null,
      video: null
    };
    
    // Analysis data
    this.speechData = {
      volumeHistory: [],
      pitchHistory: [],
      paceSamples: [],
      fillerWords: {
        'um': 0,
        'uh': 0,
        'like': 0,
        'you know': 0,
        'so': 0,
        'basically': 0
      },
      silenceDurations: [],
      wordCount: 0,
      sentenceCount: 0
    };
    
    this.videoData = {
      faceDetections: [],
      eyeContactScore: 0,
      postureScore: 0,
      expressionScores: {
        neutral: 0,
        positive: 0,
        negative: 0
      },
      movementLevel: 0
    };
    
    // Initialize if browser supports required APIs
    this.initialize();
  }
  
  async initialize() {
    try {
      // Check for required browser features
      const hasRequiredFeatures = this.checkBrowserSupport();
      
      if (!hasRequiredFeatures) {
        console.warn("Browser doesn't support all required features for ML analysis");
        return;
      }
      
      // Initialize speech analysis
      await this.initSpeechAnalysis();
      
      // Initialize video analysis
      await this.initVideoAnalysis();
      
      this.isInitialized = true;
      console.log("ML Analysis initialized successfully");
    } catch (error) {
      console.error("Error initializing ML Analysis:", error);
    }
  }
  
  checkBrowserSupport() {
    // Check for Web Audio API
    const hasAudioAPI = typeof window.AudioContext !== 'undefined' || 
                        typeof window.webkitAudioContext !== 'undefined';
    
    // Check for getUserMedia
    const hasGetUserMedia = navigator.mediaDevices && 
                           typeof navigator.mediaDevices.getUserMedia === 'function';
    
    // Check for Canvas API (for video processing)
    const hasCanvas = typeof document.createElement('canvas').getContext === 'function';
    
    return hasAudioAPI && hasGetUserMedia && hasCanvas;
  }
  
  async initSpeechAnalysis() {
    // In a real implementation, this would load ML models for speech analysis
    // For now, we'll use the Web Audio API for basic analysis
    this.models.speech = {
      loaded: true,
      version: "1.0.0"
    };
    
    return true;
  }
  
  async initVideoAnalysis() {
    // In a real implementation, this would load ML models for video analysis
    // For now, we'll use basic canvas-based analysis
    this.models.video = {
      loaded: true,
      version: "1.0.0"
    };
    
    return true;
  }
  
  /**
   * Analyze audio data from a stream
   */
  analyzeAudio(audioData, sampleRate) {
    if (!this.isInitialized || !this.models.speech.loaded) return null;
    
    try {
      // Calculate volume (amplitude)
      const volume = this.calculateVolume(audioData);
      this.speechData.volumeHistory.push(volume);
      
      // Keep history at a reasonable size
      if (this.speechData.volumeHistory.length > 100) {
        this.speechData.volumeHistory.shift();
      }
      
      // Calculate speaking pace
      const pace = this.calculateSpeakingPace(this.speechData.volumeHistory);
      
      // Detect silence
      const isSilent = volume < 0.05;
      
      // Return analysis results
      return {
        volume: volume,
        pace: pace,
        isSilent: isSilent,
        volumeVariation: this.calculateVariation(this.speechData.volumeHistory)
      };
    } catch (error) {
      console.error("Error in audio analysis:", error);
      return null;
    }
  }
  
  /**
   * Analyze video frame for body language
   */
  analyzeVideoFrame(videoElement) {
    if (!this.isInitialized || !this.models.video.loaded) return null;
    
    try {
      // Create canvas for analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Analyze brightness (proxy for lighting conditions)
      const brightness = this.calculateBrightness(imageData.data);
      
      // Analyze movement (by comparing with previous frame)
      const movement = this.calculateMovement(imageData);
      
      // Simulate face detection
      // In a real implementation, this would use a face detection model
      const faceDetected = brightness > 30 && brightness < 200;
      
      // Update video data
      this.videoData.faceDetections.push(faceDetected ? 1 : 0);
      if (this.videoData.faceDetections.length > 30) {
        this.videoData.faceDetections.shift();
      }
      
      // Calculate eye contact score based on face detection consistency
      const faceDetectionRate = this.videoData.faceDetections.reduce((sum, val) => sum + val, 0) / 
                               this.videoData.faceDetections.length;
      
      this.videoData.eyeContactScore = faceDetectionRate * 5; // Scale to 0-5
      this.videoData.movementLevel = movement;
      
      // Return analysis results
      return {
        brightness: brightness,
        movement: movement,
        faceDetected: faceDetected,
        eyeContactScore: this.videoData.eyeContactScore,
        movementLevel: this.videoData.movementLevel
      };
    } catch (error) {
      console.error("Error in video analysis:", error);
      return null;
    }
  }
  
  /**
   * Analyze text for speech patterns
   */
  analyzeText(text) {
    if (!text) return null;
    
    try {
      // Count words
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      
      // Count sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentenceCount = sentences.length;
      
      // Calculate average words per sentence
      const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
      
      // Count filler words
      const fillerWordCounts = {};
      const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'basically'];
      
      fillerWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        fillerWordCounts[word] = matches ? matches.length : 0;
      });
      
      const totalFillerWords = Object.values(fillerWordCounts).reduce((sum, count) => sum + count, 0);
      
      // Calculate filler word ratio
      const fillerWordRatio = wordCount > 0 ? totalFillerWords / wordCount : 0;
      
      // Return analysis results
      return {
        wordCount: wordCount,
        sentenceCount: sentenceCount,
        avgWordsPerSentence: avgWordsPerSentence,
        fillerWordCounts: fillerWordCounts,
        fillerWordRatio: fillerWordRatio
      };
    } catch (error) {
      console.error("Error in text analysis:", error);
      return null;
    }
  }
  
  /**
   * Get comprehensive analysis of interview performance
   */
  getComprehensiveAnalysis() {
    if (!this.isInitialized) return null;
    
    // Combine all analysis data
    return {
      speech: {
        volume: {
          average: this.calculateAverage(this.speechData.volumeHistory),
          variation: this.calculateVariation(this.speechData.volumeHistory)
        },
        pace: {
          score: this.calculateSpeakingPace(this.speechData.volumeHistory),
          consistency: this.calculateConsistency(this.speechData.paceSamples)
        },
        fillerWords: this.speechData.fillerWords,
        clarity: this.estimateClarity()
      },
      video: {
        eyeContact: this.videoData.eyeContactScore,
        posture: this.videoData.postureScore,
        movement: this.videoData.movementLevel,
        expressions: this.videoData.expressionScores
      }
    };
  }
  
  // Helper methods for calculations
  
  calculateVolume(audioData) {
    // Calculate RMS (root mean square) of audio samples
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    
    // Normalize to 0-1 range
    return Math.min(1, rms);
  }
  
  calculateSpeakingPace(volumeHistory) {
    if (volumeHistory.length < 10) return 3; // Default neutral score
    
    // Calculate zero-crossings as a proxy for speaking pace
    let crossings = 0;
    const threshold = 0.1;
    
    for (let i = 1; i < volumeHistory.length; i++) {
      if ((volumeHistory[i] > threshold && volumeHistory[i-1] <= threshold) ||
          (volumeHistory[i] <= threshold && volumeHistory[i-1] > threshold)) {
        crossings++;
      }
    }
    
    // Normalize to a 1-5 scale
    const normalizedCrossings = crossings / (volumeHistory.length - 1);
    const paceScore = 1 + normalizedCrossings * 20;
    
    // Store for historical analysis
    this.speechData.paceSamples.push(paceScore);
    if (this.speechData.paceSamples.length > 10) {
      this.speechData.paceSamples.shift();
    }
    
    return Math.min(5, Math.max(1, paceScore));
  }
  
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
  
  calculateMovement(currentImageData) {
    // Store current image data for next comparison
    if (!this.previousImageData) {
      this.previousImageData = currentImageData;
      return 0;
    }
    
    // Compare with previous frame
    const currentData = currentImageData.data;
    const previousData = this.previousImageData.data;
    
    let diffSum = 0;
    let pixelCount = 0;
    
    // Sample pixels (every 40th pixel for performance)
    for (let i = 0; i < currentData.length; i += 160) {
      const diff = Math.abs(currentData[i] - previousData[i]) +
                  Math.abs(currentData[i+1] - previousData[i+1]) +
                  Math.abs(currentData[i+2] - previousData[i+2]);
      
      diffSum += diff;
      pixelCount++;
    }
    
    // Update previous image data
    this.previousImageData = currentImageData;
    
    // Return average difference (0-765, normalized to 0-5)
    return Math.min(5, (diffSum / pixelCount) / 50);
  }
  
  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  calculateVariation(values) {
    if (values.length < 2) return 0;
    
    const avg = this.calculateAverage(values);
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const variance = this.calculateAverage(squaredDiffs);
    
    return Math.sqrt(variance); // Standard deviation
  }
  
  calculateConsistency(values) {
    if (values.length < 2) return 5; // Default high consistency
    
    // Calculate coefficient of variation (lower is more consistent)
    const stdDev = this.calculateVariation(values);
    const mean = this.calculateAverage(values);
    
    if (mean === 0) return 5;
    
    const cv = stdDev / mean;
    
    // Convert to a 1-5 scale (5 is most consistent)
    return Math.max(1, Math.min(5, 5 - (cv * 10)));
  }
  
  estimateClarity() {
    // In a real implementation, this would use ML to analyze speech clarity
    // For now, we'll use a simple proxy based on volume variation
    const volumeVariation = this.calculateVariation(this.speechData.volumeHistory);
    
    // Moderate variation is good for clarity (not monotone, not erratic)
    if (volumeVariation < 0.05) return 2; // Too monotone
    if (volumeVariation > 0.3) return 3; // Too variable
    
    return 4; // Good clarity
  }
}

// Create and export the ML Analysis service
window.MLAnalysis = new MLAnalysis();