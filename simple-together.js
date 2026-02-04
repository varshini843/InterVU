// simple-together.js - Simplified Together.ai API integration for interview analysis

/**
 * This file provides a simplified integration with the Together.ai API
 * for analyzing interview answers in real-time.
 */

(function() {
  // Configuration
  let API_KEY = ''; // Will be set from config.js
  const API_URL = 'https://api.together.xyz/v1/completions';
  const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
  
  // State
  let isInitialized = false;
  
  // Initialize the API
  function initialize() {
    if (window.CONFIG && window.CONFIG.TOGETHER_API_KEY) {
      console.log('Initializing Together.ai API integration');
      API_KEY = window.CONFIG.TOGETHER_API_KEY;
      isInitialized = true;
      console.log('Together.ai API integration initialized with key:', API_KEY.substring(0, 3) + '...');
      return true;
    } else {
      console.warn('Together.ai API key not found in config, will try again in 1 second');
      setTimeout(initialize, 1000); // Try again in 1 second
      return false;
    }
  }
  
  // Make a request to the Together.ai API
  async function makeRequest(prompt, options = {}) {
    if (!isInitialized) {
      if (!initialize()) {
        throw new Error('Together.ai API not initialized');
      }
    }
    
    const requestOptions = {
      model: options.model || MODEL,
      prompt: prompt,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 800,
      top_p: options.top_p || 0.8,
      top_k: options.top_k || 50,
      repetition_penalty: options.repetition_penalty || 1.1
    };
    
    console.log('Making request to Together.ai API');
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestOptions)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Together.ai API response received');
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].text.trim();
      } else {
        throw new Error('No text generated in API response');
      }
    } catch (error) {
      console.error('Together.ai API request failed:', error);
      throw error;
    }
  }
  
  // Analyze a video answer
  async function analyzeVideoAnswer(question, transcription, duration = 60) {
    const prompt = `
You are an expert interview coach specializing in both verbal and non-verbal communication.
Analyze the following transcribed interview answer for the question:

Question: "${question}"

Transcribed Answer: "${transcription || 'Video answer submitted without transcription.'}"

Answer Duration: ${duration} seconds

Provide detailed feedback on:
1. Content relevance to the question
2. Structure and organization of the answer
3. Professional language and communication
4. Overall impression and impact

Format your feedback with these sections:
- Content Analysis
- Structure Analysis
- Language Analysis
- Strengths (use ✓ bullet points)
- Areas for Improvement (use ⚠️ bullet points)
- Improvement Tips (numbered list)

Be constructive, specific, and actionable in your feedback.
`;
    
    return makeRequest(prompt, {
      temperature: 0.2,
      max_tokens: 1024
    });
  }
  
  // Analyze a text answer
  async function analyzeTextAnswer(question, answer) {
    const prompt = `
You are an expert interview coach specializing in professional communication.
Analyze the following interview answer for the question:

Question: "${question}"

Answer: "${answer}"

Provide detailed feedback on:
1. Content relevance to the question
2. Structure and clarity
3. Specific examples and evidence provided
4. Professional language and communication
5. Overall impression and impact

Format your feedback with these sections:
- Content Analysis
- Structure Analysis
- Language Analysis
- Strengths (use ✓ bullet points)
- Areas for Improvement (use ⚠️ bullet points)
- Improvement Tips (numbered list)

Be constructive, specific, and actionable in your feedback.
`;
    
    return makeRequest(prompt, {
      temperature: 0.2,
      max_tokens: 1024
    });
  }
  
  // Analyze partial content for real-time feedback
  async function analyzePartialContent(question, partialAnswer) {
    const prompt = `
You are an interview coach providing real-time feedback.

Question: "${question}"

Partial answer so far: "${partialAnswer}"

Provide brief real-time feedback on:
1. Relevance to the question (score 1-5, where 1 is completely irrelevant and 5 is highly relevant)
2. One specific suggestion to improve the answer
3. Key terms or concepts that should be included

Format as JSON:
{
  "relevance": [score 1-5],
  "feedback": "[brief feedback]",
  "missingKeywords": ["term1", "term2"],
  "suggestions": "[one specific suggestion]"
}

Only return the JSON object, no other text.
`;
    
    const generatedText = await makeRequest(prompt, {
      temperature: 0.1,
      max_tokens: 512
    });
    
    // Parse the JSON from the text
    const jsonMatch = generatedText.match(/{[\s\S]*}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing real-time analysis JSON:", e);
        return null;
      }
    }
    
    return null;
  }
  
  // Expose public methods
  window.SimpleTogether = {
    initialize: initialize,
    makeRequest: makeRequest,
    analyzeVideoAnswer: analyzeVideoAnswer,
    analyzeTextAnswer: analyzeTextAnswer,
    analyzePartialContent: analyzePartialContent,
    get isInitialized() { return isInitialized; }
  };
  
  // Initialize on page load
  window.addEventListener('load', initialize);
})();