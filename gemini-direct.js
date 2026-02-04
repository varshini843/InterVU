// gemini-direct.js - Direct integration with Google Gemini API

/**
 * This file provides direct integration with Google Gemini API for:
 * 1. Real-time question generation
 * 2. Real-time answer analysis
 * 3. Real-time speech and body language feedback
 */

class GeminiDirectAPI {
  constructor() {
    // Get API key from config if available
    this.apiKey = typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY 
      ? CONFIG.GEMINI_API_KEY 
      : "YOUR_GEMINI_API_KEY";
    
    this.model = "gemini-1.5-pro";
    this.apiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    
    // Debug mode
    this.debug = typeof CONFIG !== 'undefined' && CONFIG.DEBUG === true;
    
    // Check if the API key is valid
    this.isInitialized = this.apiKey && this.apiKey !== "YOUR_GEMINI_API_KEY";
    
    if (this.isInitialized) {
      console.log("✅ Gemini API initialized successfully");
    } else {
      console.warn("⚠️ Gemini API not initialized with valid API key. Using mock responses.");
    }
    
    // Log initialization status to the page for visibility
    this.logToPage(`Gemini API Status: ${this.isInitialized ? 'Connected ✅' : 'Not Connected ❌'}`);
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
   * Make a request to the Gemini API
   */
  async makeRequest(endpoint, payload) {
    if (!this.isInitialized) {
      const error = new Error("Gemini API not initialized with valid API key");
      this.logToPage(`❌ API Error: ${error.message}`);
      throw error;
    }
    
    try {
      this.logToPage(`🔄 Making API request to ${endpoint}...`);
      
      const url = `${this.apiBaseUrl}/${this.model}${endpoint}?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = `Gemini API error: ${errorData.error?.message || response.statusText}`;
        this.logToPage(`❌ API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      this.logToPage(`✅ API request successful`);
      return await response.json();
    } catch (error) {
      this.logToPage(`❌ API Error: ${error.message}`);
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }
  
  /**
   * Stream a request to the Gemini API for real-time responses
   */
  async streamRequest(endpoint, payload, onChunk, onComplete, onError) {
    if (!this.isInitialized) {
      const error = new Error("Gemini API not initialized with valid API key");
      this.logToPage(`❌ API Error: ${error.message}`);
      onError(error);
      return;
    }
    
    try {
      this.logToPage(`🔄 Starting non-streaming request to ${endpoint}...`);
      
      // Use regular payload without streaming
      const url = `${this.apiBaseUrl}/${this.model}${endpoint}?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = `Gemini API error: ${errorData.error?.message || response.statusText}`;
        } catch (e) {
          errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
        }
        this.logToPage(`❌ API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      this.logToPage(`✅ API request successful, processing response...`);
      
      // Process the regular response
      const responseData = await response.json();
      const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Simulate progress with the full response
      if (onChunk) {
        onChunk(responseText, responseText);
      }
      
      this.logToPage(`✅ Response processed (${responseText.length} chars)`);
      onComplete(responseText);
    } catch (error) {
      this.logToPage(`❌ Stream Error: ${error.message}`);
      console.error("Error in streaming request:", error);
      onError(error);
    }
  }
  
  /**
   * Generate interview questions for a specific career in real-time
   */
  generateInterviewQuestions(career, count = 10, onProgress, onComplete, onError) {
    if (!this.isInitialized) {
      const error = new Error("Gemini API not initialized with valid API key");
      this.logToPage(`❌ Question Generation Error: ${error.message}`);
      onError(error);
      return;
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
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    let questionsJson = '';
    
    this.streamRequest(
      ":generateContent",
      payload,
      (chunk, fullText) => {
        questionsJson = fullText;
        this.logToPage(`📝 Received question data: ${chunk.substring(0, 30)}...`);
        if (onProgress) onProgress(fullText);
      },
      (fullResponse) => {
        try {
          this.logToPage(`✅ Question generation complete, parsing response...`);
          
          // Extract JSON array from the response
          const jsonMatch = fullResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            this.logToPage(`✅ Successfully parsed ${questions.length} questions`);
            
            // Log the first few questions for debugging
            questions.slice(0, 3).forEach((q, i) => {
              this.logToPage(`📋 Q${i+1}: ${q.substring(0, 30)}...`);
            });
            
            onComplete(questions.slice(0, count));
          } else {
            const error = new Error("No valid JSON array found in the response");
            this.logToPage(`❌ Parsing Error: ${error.message}`);
            this.logToPage(`📋 Raw response: ${fullResponse.substring(0, 100)}...`);
            onError(error);
          }
        } catch (e) {
          this.logToPage(`❌ JSON Parsing Error: ${e.message}`);
          console.error("Error parsing questions JSON:", e);
          onError(new Error("Failed to parse generated questions"));
        }
      },
      (error) => {
        this.logToPage(`❌ Question Generation Error: ${error.message}`);
        onError(error);
      }
    );
  }
  
  /**
   * Analyze text answer in real-time
   */
  analyzeTextAnswer(question, answer, onProgress, onComplete, onError) {
    if (!this.isInitialized) {
      const error = new Error("Gemini API not initialized with valid API key");
      this.logToPage(`❌ Text Analysis Error: ${error.message}`);
      onError(error);
      return;
    }
    
    // Don't analyze empty answers
    if (!answer || answer.trim().length === 0) {
      const error = new Error("Cannot analyze empty answer");
      this.logToPage(`❌ Text Analysis Error: ${error.message}`);
      onError(error);
      return;
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
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    this.streamRequest(
      ":generateContent",
      payload,
      (chunk, fullText) => {
        this.logToPage(`📝 Received analysis chunk: ${chunk.substring(0, 30)}...`);
        if (onProgress) onProgress(chunk, fullText);
      },
      (fullResponse) => {
        this.logToPage(`✅ Text analysis complete (${fullResponse.length} chars)`);
        onComplete(fullResponse);
      },
      (error) => {
        this.logToPage(`❌ Text Analysis Error: ${error.message}`);
        onError(error);
      }
    );
  }
  
  /**
   * Analyze video/audio answer in real-time
   */
  analyzeVideoAnswer(question, transcription, duration, onProgress, onComplete, onError) {
    if (!this.isInitialized) {
      const error = new Error("Gemini API not initialized with valid API key");
      this.logToPage(`❌ Video Analysis Error: ${error.message}`);
      onError(error);
      return;
    }
    
    // Don't analyze empty transcriptions
    if (!transcription || transcription.trim().length === 0) {
      const error = new Error("Cannot analyze empty transcription");
      this.logToPage(`❌ Video Analysis Error: ${error.message}`);
      onError(error);
      return;
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
      Be honest in your assessment - if the answer is poor, say so directly.
      If the answer is nonsensical or completely off-topic, point this out clearly.
      If the transcription indicates the person didn't actually answer, note this in your feedback.
    `;
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    this.streamRequest(
      ":generateContent",
      payload,
      (chunk, fullText) => {
        this.logToPage(`📝 Received video analysis chunk: ${chunk.substring(0, 30)}...`);
        if (onProgress) onProgress(chunk, fullText);
      },
      (fullResponse) => {
        this.logToPage(`✅ Video analysis complete (${fullResponse.length} chars)`);
        onComplete(fullResponse);
      },
      (error) => {
        this.logToPage(`❌ Video Analysis Error: ${error.message}`);
        onError(error);
      }
    );
  }
  
  /**
   * Analyze partial content in real-time
   */
  analyzePartialContent(question, partialAnswer, onComplete, onError) {
    if (!this.isInitialized) {
      const error = new Error("Gemini API not initialized with valid API key");
      this.logToPage(`❌ Partial Content Analysis Error: ${error.message}`);
      onError(error);
      return;
    }
    
    // Don't analyze very short answers
    if (!partialAnswer || partialAnswer.trim().length < 5) {
      const error = new Error("Answer too short for analysis");
      this.logToPage(`ℹ️ Skipping analysis: ${error.message}`);
      onError(error);
      return;
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
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      }
    };
    
    this.makeRequest(":generateContent", payload)
      .then(response => {
        try {
          const generatedText = response.candidates[0].content.parts[0].text;
          this.logToPage(`📝 Received partial content analysis: ${generatedText.substring(0, 30)}...`);
          
          // Parse the JSON from the text
          const jsonMatch = generatedText.match(/{[\s\S]*}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            this.logToPage(`✅ Parsed analysis: relevance=${analysis.relevance}, keywords=${analysis.missingKeywords?.length || 0}`);
            onComplete(analysis);
          } else {
            const error = new Error("No valid JSON found in the response");
            this.logToPage(`❌ Parsing Error: ${error.message}`);
            this.logToPage(`📋 Raw response: ${generatedText.substring(0, 100)}...`);
            throw error;
          }
        } catch (e) {
          this.logToPage(`❌ JSON Parsing Error: ${e.message}`);
          console.error("Error parsing real-time analysis JSON:", e);
          onError(new Error("Failed to parse real-time analysis"));
        }
      })
      .catch(error => {
        this.logToPage(`❌ Partial Content Analysis Error: ${error.message}`);
        onError(error);
      });
  }
  
  /**
   * Analyze speech in real-time
   */
  analyzeRealtimeSpeech(transcription, audioFeatures, onComplete, onError) {
    if (!this.isInitialized) {
      const error = new Error("Gemini API not initialized with valid API key");
      this.logToPage(`❌ Speech Analysis Error: ${error.message}`);
      onError(error);
      return;
    }
    
    // Don't analyze very short transcriptions
    if (!transcription || transcription.trim().length < 5) {
      const error = new Error("Transcription too short for analysis");
      this.logToPage(`ℹ️ Skipping speech analysis: ${error.message}`);
      onError(error);
      return;
    }
    
    this.logToPage(`🔄 Analyzing speech (${transcription.length} chars, ${audioFeatures.pace} WPM)`);
    
    // Count filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically'];
    let fillerWordCount = 0;
    
    fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = transcription.match(regex);
      if (matches) {
        fillerWordCount += matches.length;
      }
    });
    
    this.logToPage(`📊 Detected ${fillerWordCount} filler words`);
    
    const prompt = `
      You are a speech coach providing real-time feedback during an interview.
      
      Transcription: "${transcription}"
      
      Audio features:
      - Volume: ${audioFeatures.volume}
      - Pace: ${audioFeatures.pace} words per minute
      - Filler words detected: ${fillerWordCount}
      
      Provide brief real-time feedback on:
      1. Speaking pace (too slow, good, too fast)
      2. Filler words usage
      3. Clarity and articulation
      4. Brief content assessment
      
      Be honest in your assessment. If the speech is unclear, contains many filler words, or the content is poor, say so directly.
      
      Format as JSON:
      {
        "pace": "[assessment]",
        "fillerWords": ${fillerWordCount},
        "clarity": "[assessment]",
        "content": "[brief assessment]",
        "feedback": "[brief overall feedback]"
      }
      
      Only return the JSON object, no other text.
    `;
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 256,
      }
    };
    
    this.makeRequest(":generateContent", payload)
      .then(response => {
        try {
          const generatedText = response.candidates[0].content.parts[0].text;
          this.logToPage(`📝 Received speech analysis: ${generatedText.substring(0, 30)}...`);
          
          // Parse the JSON from the text
          const jsonMatch = generatedText.match(/{[\s\S]*}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            this.logToPage(`✅ Parsed speech analysis: pace="${analysis.pace}", clarity="${analysis.clarity}"`);
            onComplete(analysis);
          } else {
            const error = new Error("No valid JSON found in the response");
            this.logToPage(`❌ Parsing Error: ${error.message}`);
            this.logToPage(`📋 Raw response: ${generatedText.substring(0, 100)}...`);
            throw error;
          }
        } catch (e) {
          this.logToPage(`❌ JSON Parsing Error: ${e.message}`);
          console.error("Error parsing speech analysis JSON:", e);
          onError(new Error("Failed to parse speech analysis"));
        }
      })
      .catch(error => {
        this.logToPage(`❌ Speech Analysis Error: ${error.message}`);
        onError(error);
      });
  }
}

// Create and export the Gemini API instance
window.GeminiDirectAPI = new GeminiDirectAPI();