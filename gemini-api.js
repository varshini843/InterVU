// gemini-api.js - Google Gemini API integration

/**
 * This file provides the integration with Google Gemini API for:
 * 1. Question generation
 * 2. Answer analysis
 * 3. Real-time feedback
 */

// Configuration
const GEMINI_API_KEY = "AIzaSyAn1j3XIY9p_k33_7NyTPEv28INAoS2hGQ"; // Replace with your actual API key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-1.5-pro"; // Using the most capable model

// API client for Google Gemini
class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isInitialized = !!apiKey && apiKey !== "YOUR_API_KEY";
    
    if (!this.isInitialized) {
      console.warn("Gemini API not initialized with valid API key. Using mock responses.");
    }
  }
  
  // Helper method for API requests
  async makeRequest(endpoint, payload) {
    if (!this.isInitialized) {
      throw new Error("Gemini API not initialized with valid API key");
    }
    
    try {
      const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}${endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error.message}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }
  
  // Generate interview questions for a specific career
  async generateInterviewQuestions(career, count = 10) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.generateInterviewQuestions(career, count);
    }
    
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
    `;
    
    try {
      const response = await this.makeRequest(":generateContent", {
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
      });
      
      // Extract the text from the response
      const generatedText = response.candidates[0].content.parts[0].text;
      
      // Parse the JSON array from the text
      // We need to find the JSON array in the text, as the model might include additional text
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const questions = JSON.parse(jsonMatch[0]);
          return questions.slice(0, count); // Ensure we only return the requested number
        } catch (e) {
          console.error("Error parsing questions JSON:", e);
          throw new Error("Failed to parse generated questions");
        }
      } else {
        throw new Error("No valid JSON array found in the response");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      // Fall back to mock implementation
      return window.InterVUAPI.generateInterviewQuestions(career, count);
    }
  }
  
  // Analyze a text answer
  async analyzeTextAnswer(question, answer) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeTextAnswer(question, answer);
    }
    
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
    `;
    
    try {
      const response = await this.makeRequest(":generateContent", {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more consistent feedback
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      // Extract the text from the response
      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error analyzing text answer:", error);
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeTextAnswer(question, answer);
    }
  }
  
  // Analyze a video/audio answer
  async analyzeVideoAnswer(question, transcription, duration) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeVideoAnswer(question, null);
    }
    
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
      const response = await this.makeRequest(":generateContent", {
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
      });
      
      // Extract the text from the response
      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error analyzing video answer:", error);
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeVideoAnswer(question, null);
    }
  }
  
  // Analyze partial content in real-time
  async analyzePartialContent(question, partialAnswer) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.analyzePartialContent(question, partialAnswer);
    }
    
    // For real-time analysis, we need a more concise prompt and response
    const prompt = `
      You are an interview coach providing real-time feedback.
      
      Question: "${question}"
      
      Partial answer so far: "${partialAnswer}"
      
      Provide brief real-time feedback on:
      1. Relevance to the question (score 1-5)
      2. One specific suggestion to improve the answer
      3. Key terms or concepts that should be included
      
      Format as JSON:
      {
        "relevance": [score 1-5],
        "feedback": "[brief feedback]",
        "missingKeywords": ["term1", "term2"],
        "suggestions": "[one specific suggestion]"
      }
    `;
    
    try {
      const response = await this.makeRequest(":generateContent", {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1, // Very low temperature for consistent, predictable responses
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512, // Shorter response for faster generation
        }
      });
      
      // Extract the text from the response
      const generatedText = response.candidates[0].content.parts[0].text;
      
      // Parse the JSON from the text
      const jsonMatch = generatedText.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Error parsing real-time analysis JSON:", e);
          throw new Error("Failed to parse real-time analysis");
        }
      } else {
        throw new Error("No valid JSON found in the response");
      }
    } catch (error) {
      console.error("Error in real-time analysis:", error);
      // Fall back to mock implementation
      return window.InterVUAPI.analyzePartialContent(question, partialAnswer);
    }
  }
  
  // Analyze speech in real-time (would require integration with a speech-to-text service)
  async analyzeRealtimeSpeech(transcription, audioFeatures) {
    if (!this.isInitialized) {
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeRealtimeSpeech(null);
    }
    
    const prompt = `
      You are a speech coach providing real-time feedback.
      
      Transcription: "${transcription}"
      
      Audio features:
      - Volume: ${audioFeatures.volume}
      - Pace: ${audioFeatures.pace} words per minute
      - Pauses: ${audioFeatures.pauses}
      
      Provide brief real-time feedback on:
      1. Speaking pace (too slow, good, too fast)
      2. Filler words detected
      3. Clarity and articulation
      
      Format as JSON:
      {
        "pace": "[assessment]",
        "fillerWords": [count],
        "clarity": "[assessment]",
        "feedback": "[brief overall feedback]"
      }
    `;
    
    try {
      const response = await this.makeRequest(":generateContent", {
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
      });
      
      // Extract the text from the response
      const generatedText = response.candidates[0].content.parts[0].text;
      
      // Parse the JSON from the text
      const jsonMatch = generatedText.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Error parsing speech analysis JSON:", e);
          throw new Error("Failed to parse speech analysis");
        }
      } else {
        throw new Error("No valid JSON found in the response");
      }
    } catch (error) {
      console.error("Error in real-time speech analysis:", error);
      // Fall back to mock implementation
      return window.InterVUAPI.analyzeRealtimeSpeech(null);
    }
  }
}

// Create and export the Gemini client
window.GeminiAPI = new GeminiClient(GEMINI_API_KEY);

// For backward compatibility, also expose through the InterVUAPI
if (window.InterVUAPI) {
  const originalAPI = { ...window.InterVUAPI };
  
  // Override with Gemini implementations, falling back to mock if needed
  window.InterVUAPI = {
    generateInterviewQuestions: async (career, count) => {
      try {
        return await window.GeminiAPI.generateInterviewQuestions(career, count);
      } catch (error) {
        return originalAPI.generateInterviewQuestions(career, count);
      }
    },
    
    analyzeTextAnswer: async (question, answer) => {
      try {
        return await window.GeminiAPI.analyzeTextAnswer(question, answer);
      } catch (error) {
        return originalAPI.analyzeTextAnswer(question, answer);
      }
    },
    
    analyzeVideoAnswer: async (question, videoBlob) => {
      // In a real implementation, we would:
      // 1. Convert the video to audio
      // 2. Transcribe the audio using a speech-to-text service
      // 3. Pass the transcription to the Gemini API
      
      // For now, we'll use a mock transcription
      const mockTranscription = "This is a mock transcription of the video answer.";
      const mockDuration = 60; // seconds
      
      try {
        return await window.GeminiAPI.analyzeVideoAnswer(question, mockTranscription, mockDuration);
      } catch (error) {
        return originalAPI.analyzeVideoAnswer(question, videoBlob);
      }
    },
    
    analyzePartialContent: async (question, partialTranscript) => {
      try {
        return await window.GeminiAPI.analyzePartialContent(question, partialTranscript);
      } catch (error) {
        return originalAPI.analyzePartialContent(question, partialTranscript);
      }
    },
    
    analyzeRealtimeSpeech: async (audioChunk) => {
      // In a real implementation, we would:
      // 1. Convert the audio chunk to text using a speech-to-text service
      // 2. Extract audio features (volume, pace, etc.)
      // 3. Pass these to the Gemini API
      
      // For now, we'll use mock data
      const mockTranscription = "This is a mock transcription of the audio.";
      const mockAudioFeatures = {
        volume: 75,
        pace: 150, // words per minute
        pauses: "moderate"
      };
      
      try {
        return await window.GeminiAPI.analyzeRealtimeSpeech(mockTranscription, mockAudioFeatures);
      } catch (error) {
        return originalAPI.analyzeRealtimeSpeech(audioChunk);
      }
    },
    
    // Keep the original implementation for body language analysis
    // as this would require a separate computer vision API
    analyzeRealtimeBodyLanguage: originalAPI.analyzeRealtimeBodyLanguage
  };
}