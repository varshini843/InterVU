// together-api.js - Together.ai API integration

/**
 * This file provides integration with Together.ai API for:
 * 1. Question generation
 * 2. Answer analysis
 * 3. Real-time feedback
 */

class TogetherAPI {
  constructor() {
    // Initialize with default values
    this.apiKey = null;
    this.model = "mistralai/Mixtral-8x7B-Instruct-v0.1"; // Using Mixtral model
    this.apiBaseUrl = "https://api.together.xyz/v1/completions";
    this.debug = false;
    this.isInitialized = false;
    
    // Try to initialize immediately if CONFIG is already available
    this.initialize();
    
    // Also set up a listener for when the window loads (as a fallback)
    window.addEventListener('load', () => this.initialize());
  }
  
  // Initialize the API with configuration
  initialize() {
    // Get API key from config if available
    if (window.CONFIG && window.CONFIG.TOGETHER_API_KEY) {
      this.apiKey = window.CONFIG.TOGETHER_API_KEY;
      this.debug = window.CONFIG.DEBUG === true;
      
      // Check if the API key is valid
      this.isInitialized = this.apiKey && this.apiKey.length > 0;
      
      if (this.isInitialized) {
        console.log("✅ Together API initialized successfully");
      } else {
        console.warn("⚠️ Together API not initialized with valid API key. Using mock responses.");
      }
      
      // Log initialization status to the page for visibility
      this.logToPage(`Together API Status: ${this.isInitialized ? 'Connected ✅' : 'Not Connected ❌'}`);
    } else {
      console.warn("⚠️ CONFIG not found or missing TOGETHER_API_KEY. Will try again later.");
      setTimeout(() => this.initialize(), 1000); // Try again in 1 second
    }
  }
  
  // Helper method to log to the page
  logToPage(message) {
    if (!this.debug) return;
    
    let logContainer = document.getElementById('api-debug-log');
    if (!logContainer) {
      logContainer = document.createElement('div');
      logContainer.id = 'api-debug-log';
      logContainer.style.position = 'fixed';
      logContainer.style.bottom = '10px';
      logContainer.style.right = '10px';
      logContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
      logContainer.style.color = 'white';
      logContainer.style.padding = '10px';
      logContainer.style.borderRadius = '5px';
      logContainer.style.maxWidth = '400px';
      logContainer.style.maxHeight = '200px';
      logContainer.style.overflow = 'auto';
      logContainer.style.zIndex = '9999';
      logContainer.style.fontSize = '12px';
      logContainer.style.fontFamily = 'monospace';
      document.body.appendChild(logContainer);
    }
    
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.appendChild(logEntry);
    
    // Scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
  }
  
  /**
   * Make a request to the Together API (using Supabase proxy)
   */
  async makeRequest(prompt, options = {}) {
    // Try Supabase proxy first
    if (window.SupabaseTogetherProxy && window.SupabaseTogetherProxy.supabase) {
      try {
        this.logToPage(`🔄 Making API request through Supabase...`);
        
        const defaultOptions = {
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.95,
          top_k: 40
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        const result = await window.SupabaseTogetherProxy.callTogetherAPI(prompt, requestOptions);
        this.logToPage(`✅ API request successful`);
        return result;
      } catch (error) {
        this.logToPage(`⚠️ Supabase proxy error: ${error.message}`);
        console.error("Supabase proxy error:", error);
        // Fall back to mock implementation
        return window.InterVUAPI.generateInterviewQuestions("Software Engineer", 5);
      }
    }
    
    // Fallback if Supabase not available
    if (!this.isInitialized) {
      const error = new Error("Together API not initialized with valid API key");
      this.logToPage(`❌ API Error: ${error.message}`);
      throw error;
    }
    
    try {
      this.logToPage(`🔄 Making direct API request to Together.ai...`);
      
      const defaultOptions = {
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
        top_k: 40
      };
      
      const requestOptions = { ...defaultOptions, ...options };
      
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          temperature: requestOptions.temperature,
          max_tokens: requestOptions.max_tokens,
          top_p: requestOptions.top_p,
          top_k: requestOptions.top_k
        })
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = `Together API error: ${errorData.error?.message || response.statusText}`;
        } catch (e) {
          errorMessage = `Together API error: ${response.status} ${response.statusText}`;
        }
        this.logToPage(`❌ API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      this.logToPage(`✅ API request successful`);
      return data.choices[0].text;
    } catch (error) {
      this.logToPage(`❌ API Error: ${error.message}`);
      console.error("Error calling Together API:", error);
      throw error;
    }
  }
  
  /**
   * Generate interview questions for a specific career
   */
  async generateInterviewQuestions(career, count = 5) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.generateInterviewQuestions(career, count);
    }
    
    this.logToPage(`🔄 Generating ${count} questions for ${career} role...`);
    
    const prompt = `
You are an expert interviewer for ${career} positions.
Generate ${count} professional interview questions for a ${career} role.
The questions should:
1. Cover a range of skills and competencies relevant to the role
2. Include both technical and behavioral questions
3. Be challenging but fair
4. Be specific to the ${career} field

Format your response as a JSON array of strings, with each string being a question.
Example: ["Question 1", "Question 2", ...]

Only return the JSON array, no other text.
`;
    
    try {
      const generatedText = await this.makeRequest(prompt, {
        temperature: 0.7,
        max_tokens: 1024
      });
      
      // Extract the JSON array from the text
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const questions = JSON.parse(jsonMatch[0]);
          this.logToPage(`✅ Successfully parsed ${questions.length} questions`);
          
          // Log the first few questions for debugging
          questions.slice(0, 3).forEach((q, i) => {
            this.logToPage(`📋 Q${i+1}: ${q.substring(0, 30)}...`);
          });
          
          return questions.slice(0, count);
        } catch (e) {
          this.logToPage(`❌ JSON Parsing Error: ${e.message}`);
          console.error("Error parsing questions JSON:", e);
          throw new Error("Failed to parse generated questions");
        }
      } else {
        const error = new Error("No valid JSON array found in the response");
        this.logToPage(`❌ Parsing Error: ${error.message}`);
        this.logToPage(`📋 Raw response: ${generatedText.substring(0, 100)}...`);
        throw error;
      }
    } catch (error) {
      this.logToPage(`❌ Question Generation Error: ${error.message}`);
      // Fall back to mock implementation
      return window.InterVUAPI.generateInterviewQuestions(career, count);
    }
  }
  
  /**
   * Analyze a text answer
   */
  async analyzeTextAnswer(question, answer) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeTextAnswer(question, answer);
    }
    
    // Don't analyze empty answers
    if (!answer || answer.trim().length === 0) {
      const error = new Error("Cannot analyze empty answer");
      this.logToPage(`❌ Text Analysis Error: ${error.message}`);
      throw error;
    }
    
    this.logToPage(`🔄 Analyzing text answer (${answer.length} chars) for question: "${question.substring(0, 30)}..."`);
    
    const prompt = `
You are an expert interview coach. Analyze the following interview answer for the question:

Question: "${question}"

Answer: "${answer}"

Provide detailed feedback on:
1. Content relevance to the question
2. Structure and clarity
3. Specific examples and evidence provided
4. Professional language and communication

Format your feedback with these sections:
- Content Analysis
- Strengths (use ✓ bullet points)
- Areas for Improvement (use ⚠️ bullet points)
- Improvement Tips (numbered list)

Be constructive, specific, and actionable in your feedback.
Be honest in your assessment - if the answer is poor, say so directly.
If the answer is nonsensical or completely off-topic, point this out clearly.
`;
    
    try {
      const analysis = await this.makeRequest(prompt, {
        temperature: 0.2,
        max_tokens: 1024
      });
      
      this.logToPage(`✅ Text analysis complete (${analysis.length} chars)`);
      return analysis;
    } catch (error) {
      this.logToPage(`❌ Text Analysis Error: ${error.message}`);
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeTextAnswer(question, answer);
    }
  }
  
  /**
   * Analyze a video/audio answer
   */
  async analyzeVideoAnswer(question, transcription, duration) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeVideoAnswer(question, null);
    }
    
    // Don't analyze empty transcriptions
    if (!transcription || transcription.trim().length === 0) {
      const error = new Error("Cannot analyze empty transcription");
      this.logToPage(`❌ Video Analysis Error: ${error.message}`);
      throw error;
    }
    
    this.logToPage(`🔄 Analyzing video answer (${duration}s, ${transcription.length} chars) for question: "${question.substring(0, 30)}..."`);
    
    const prompt = `
You are an expert interview coach specializing in both verbal and non-verbal communication.
Analyze the following transcribed interview answer for the question:

Question: "${question}"

Transcribed Answer: "${transcription}"

Answer Duration: ${duration} seconds

Provide detailed feedback on:
1. Content relevance to the question
2. Speech patterns (pace, clarity, filler words)
3. Structure and organization of the answer
4. Professional language and communication

Format your feedback with these sections:
- Speech Analysis
- Content Analysis
- Strengths (use ✓ bullet points)
- Areas for Improvement (use ⚠️ bullet points)
- Improvement Tips (numbered list)

Be constructive, specific, and actionable in your feedback.
`;
    
    try {
      const analysis = await this.makeRequest(prompt, {
        temperature: 0.2,
        max_tokens: 1024
      });
      
      this.logToPage(`✅ Video analysis complete (${analysis.length} chars)`);
      return analysis;
    } catch (error) {
      this.logToPage(`❌ Video Analysis Error: ${error.message}`);
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeVideoAnswer(question, null);
    }
  }
  
  /**
   * Analyze partial content in real-time
   */
  async analyzePartialContent(question, partialAnswer) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.analyzePartialContent(question, partialAnswer);
    }
    
    // Don't analyze very short answers
    if (!partialAnswer || partialAnswer.trim().length < 5) {
      const error = new Error("Answer too short for analysis");
      this.logToPage(`ℹ️ Skipping analysis: ${error.message}`);
      throw error;
    }
    
    this.logToPage(`🔄 Analyzing partial answer (${partialAnswer.length} chars) for question: "${question.substring(0, 30)}..."`);
    
    const prompt = `
You are an interview coach providing real-time feedback.

Question: "${question}"

Partial answer so far: "${partialAnswer}"

Provide brief real-time feedback on:
1. Relevance to the question (score 1-5, where 1 is completely irrelevant and 5 is highly relevant)
2. One specific suggestion to improve the answer
3. Key terms or concepts that should be included

Be honest in your assessment. If the answer is nonsensical, irrelevant, or poor quality, give it a low relevance score (1-2) and provide direct feedback.

Format as JSON:
{
  "relevance": [score 1-5],
  "feedback": "[brief feedback]",
  "missingKeywords": ["term1", "term2"],
  "suggestions": "[one specific suggestion]"
}

Only return the JSON object, no other text.
`;
    
    try {
      const generatedText = await this.makeRequest(prompt, {
        temperature: 0.1,
        max_tokens: 512
      });
      
      // Parse the JSON from the text
      const jsonMatch = generatedText.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          const analysis = JSON.parse(jsonMatch[0]);
          this.logToPage(`✅ Parsed analysis: relevance=${analysis.relevance}, keywords=${analysis.missingKeywords?.length || 0}`);
          return analysis;
        } catch (e) {
          this.logToPage(`❌ JSON Parsing Error: ${e.message}`);
          console.error("Error parsing real-time analysis JSON:", e);
          throw new Error("Failed to parse real-time analysis");
        }
      } else {
        const error = new Error("No valid JSON found in the response");
        this.logToPage(`❌ Parsing Error: ${error.message}`);
        this.logToPage(`📋 Raw response: ${generatedText.substring(0, 100)}...`);
        throw error;
      }
    } catch (error) {
      this.logToPage(`❌ Partial Content Analysis Error: ${error.message}`);
      // Fall back to mock implementation
      return window.InterVUAPI.analyzePartialContent(question, partialAnswer);
    }
  }
}

// Create and export the Together API client
window.TogetherAPI = new TogetherAPI();

// For backward compatibility, also expose through the InterVUAPI
if (window.InterVUAPI) {
  const originalAPI = { ...window.InterVUAPI };
  
  // Override with Together implementations, falling back to mock if needed
  window.InterVUAPI = {
    generateInterviewQuestions: async (career, count) => {
      try {
        return await window.TogetherAPI.generateInterviewQuestions(career, count);
      } catch (error) {
        return originalAPI.generateInterviewQuestions(career, count);
      }
    },
    
    analyzeTextAnswer: async (question, answer) => {
      try {
        return await window.TogetherAPI.analyzeTextAnswer(question, answer);
      } catch (error) {
        return originalAPI.analyzeTextAnswer(question, answer);
      }
    },
    
    analyzeVideoAnswer: async (question, videoBlob) => {
      // In a real implementation, we would:
      // 1. Convert the video to audio
      // 2. Transcribe the audio using a speech-to-text service
      // 3. Pass the transcription to the Together API
      
      // For now, we'll use a mock transcription
      const mockTranscription = "This is a mock transcription of the video answer.";
      const mockDuration = 60; // seconds
      
      try {
        return await window.TogetherAPI.analyzeVideoAnswer(question, mockTranscription, mockDuration);
      } catch (error) {
        return originalAPI.analyzeVideoAnswer(question, videoBlob);
      }
    },
    
    analyzePartialContent: async (question, partialTranscript) => {
      try {
        return await window.TogetherAPI.analyzePartialContent(question, partialTranscript);
      } catch (error) {
        return originalAPI.analyzePartialContent(question, partialTranscript);
      }
    }
  };
}