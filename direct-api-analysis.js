// direct-api-analysis.js - Direct API integration for interview analysis
// This file completely replaces the existing analysis with direct API calls

// Immediately replace the global analyzeAnswerWithAI function
(function() {
  console.log('Installing direct API analysis function');
  
  // Store the original function for fallback
  window.originalAnalyzeAnswerWithAI = window.analyzeAnswerWithAI;
  
  // Replace with our direct API implementation
  window.analyzeAnswerWithAI = directApiAnalyzeAnswer;
  
  // Also replace the submitAnswer function to ensure our analysis is used
  const originalSubmitAnswer = window.submitAnswer;
  if (typeof originalSubmitAnswer === 'function') {
    window.submitAnswer = function(event) {
      console.log('Submit answer function intercepted to use direct API analysis');
      
      // Get the current answer mode
      const answerModeRadios = document.getElementsByName('answerMode');
      const mode = Array.from(answerModeRadios).find(r => r.checked)?.value;
      
      // Get the current question and answer
      const questionBox = document.getElementById('questionBox');
      const question = questionBox ? questionBox.textContent.trim() : '';
      
      let answer = '';
      if (mode === 'record') {
        // For video mode, use the transcription
        answer = window.recordingTranscription || '';
      } else {
        // For text mode, use the text area
        const answerTextArea = document.getElementById('answerTextArea');
        answer = answerTextArea ? answerTextArea.value : '';
      }
      
      // Show loading state
      const feedbackBox = document.getElementById('feedbackBox');
      if (feedbackBox) {
        feedbackBox.innerHTML = `
          <div class="loading-analysis">
            <div class="loading-spinner"></div>
            <p>Analyzing your answer with Together.ai API...</p>
            <p class="loading-subtext">This may take a few moments</p>
          </div>
        `;
      }
      
      // Call our direct API analysis function
      directApiAnalyzeAnswer(question, answer, mode)
        .then(analysis => {
          console.log('Direct API analysis completed successfully');
        })
        .catch(error => {
          console.error('Error in direct API analysis:', error);
        });
      
      // Call the original submit function
      return originalSubmitAnswer.apply(this, arguments);
    };
  }
  
  console.log('Direct API analysis function installed');
  
  /**
   * Direct API analysis function that completely bypasses any predefined feedback
   */
  async function directApiAnalyzeAnswer(question, answer, mode) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Direct API analysis started for mode:', mode);
        
        // Show loading state
        const feedbackBox = document.getElementById('feedbackBox');
        if (feedbackBox) {
          feedbackBox.innerHTML = `
            <div class="loading-analysis">
              <div class="loading-spinner"></div>
              <p>Analyzing your answer with Together.ai API...</p>
              <p class="loading-subtext">This may take a few moments</p>
            </div>
          `;
        }
        
        // Get API key from config
        const apiKey = window.CONFIG?.TOGETHER_API_KEY;
        if (!apiKey) {
          console.error('Together API key not found in config');
          throw new Error('API key not found');
        }
        
        console.log('Using Together API key:', apiKey.substring(0, 5) + '...');
        
        // Different analysis based on mode
        let analysis;
        if (mode === 'record') {
          // Video analysis
          analysis = await analyzeVideoAnswer(question, answer);
        } else {
          // Text analysis
          analysis = await analyzeTextAnswer(question, answer);
        }
        
        // Display the analysis
        if (feedbackBox) {
          feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
        }
        
        resolve(analysis);
      } catch (error) {
        console.error('Error in direct API analysis:', error);
        
        // Show error message
        const feedbackBox = document.getElementById('feedbackBox');
        if (feedbackBox) {
          feedbackBox.innerHTML = `
            <div class="error-message">
              <h3>⚠️ Analysis Error</h3>
              <p>There was an error analyzing your answer: ${error.message}</p>
              <p>Please try again or contact support if the problem persists.</p>
            </div>
          `;
        }
        
        // Fall back to original function
        try {
          console.log('Falling back to original analysis function');
          const fallbackAnalysis = await window.originalAnalyzeAnswerWithAI(question, answer, mode);
          resolve(fallbackAnalysis);
        } catch (fallbackError) {
          console.error('Fallback analysis also failed:', fallbackError);
          reject(fallbackError);
        }
      }
    });
  }
  
  /**
   * Analyze video answer with direct API call
   */
  async function analyzeVideoAnswer(question, answer) {
    // Get transcription from global variable or use provided answer
    const transcription = window.recordingTranscription || answer || '';
    
    // Calculate duration
    const duration = calculateRecordingDuration();
    
    console.log('Analyzing video answer with direct API call');
    console.log('Question:', question);
    console.log('Transcription length:', transcription.length);
    console.log('Duration:', duration, 'seconds');
    
    // Create prompt for video analysis
    const prompt = `
You are an expert interview coach with years of experience helping candidates improve their interview performance.
Analyze the following video interview answer for the question:

Question: "${question}"

Transcribed Answer: "${transcription}"

Answer Duration: ${duration} seconds

Provide comprehensive feedback on this video interview answer, focusing on:

1. CONTENT QUALITY (40% of evaluation)
   - Relevance to the question asked
   - Depth and specificity of examples
   - Structure and organization
   - Completeness of the answer

2. VERBAL COMMUNICATION (40% of evaluation)
   - Speaking pace (too fast/slow?)
   - Voice clarity and projection
   - Filler words usage ("um", "uh", "like")
   - Professional language and vocabulary
   - Conciseness vs. rambling

3. NON-VERBAL COMMUNICATION (20% of evaluation)
   - Assumed eye contact with camera
   - Assumed facial expressions and engagement
   - Assumed posture and body positioning

Format your feedback with these clearly labeled sections:
1. CONTENT ANALYSIS
2. VERBAL COMMUNICATION ANALYSIS
3. NON-VERBAL COMMUNICATION ANALYSIS
4. KEY STRENGTHS (use ✓ bullet points)
5. PRIORITY IMPROVEMENT AREAS (use ⚠️ bullet points)
6. ACTIONABLE RECOMMENDATIONS (numbered list)

Your feedback should be:
- Specific and evidence-based (refer to actual examples from their answer)
- Balanced (highlight both strengths and areas for improvement)
- Actionable (provide clear, specific tips they can implement immediately)
- Professional but encouraging in tone

Focus on the 2-3 most impactful improvements that would make the biggest difference in their interview performance.
`;

    // Make direct API call
    try {
      // Call Together API directly
      const response = await callTogetherApi(prompt);
      return response;
    } catch (error) {
      console.error('Error in direct video analysis:', error);
      throw error;
    }
  }
  
  /**
   * Analyze text answer with direct API call
   */
  async function analyzeTextAnswer(question, answer) {
    console.log('Analyzing text answer with direct API call');
    console.log('Question:', question);
    console.log('Answer length:', answer.length);
    
    // Create prompt for text analysis
    const prompt = `
You are an expert interview coach with years of experience helping candidates improve their interview performance.
Analyze the following written interview answer for the question:

Question: "${question}"

Answer: "${answer}"

Provide comprehensive feedback on this written interview answer, focusing on:

1. CONTENT QUALITY (60% of evaluation)
   - Relevance to the question asked
   - Depth and specificity of examples
   - Structure and organization
   - Completeness of the answer
   - Use of relevant industry terminology and concepts

2. WRITTEN COMMUNICATION (40% of evaluation)
   - Clarity of expression
   - Professional language and vocabulary
   - Grammar and sentence structure
   - Conciseness vs. verbosity
   - Overall impact and persuasiveness

Format your feedback with these clearly labeled sections:
1. CONTENT ANALYSIS
2. COMMUNICATION ANALYSIS
3. KEY STRENGTHS (use ✓ bullet points)
4. PRIORITY IMPROVEMENT AREAS (use ⚠️ bullet points)
5. ACTIONABLE RECOMMENDATIONS (numbered list)

Your feedback should be:
- Specific and evidence-based (refer to actual examples from their answer)
- Balanced (highlight both strengths and areas for improvement)
- Actionable (provide clear, specific tips they can implement immediately)
- Professional but encouraging in tone

Be honest in your assessment - if the answer is poor, say so directly but constructively.
If the answer is nonsensical or completely off-topic, point this out clearly.
Focus on the 2-3 most impactful improvements that would make the biggest difference in their interview performance.
`;

    // Make direct API call
    try {
      // Call Together API directly
      const response = await callTogetherApi(prompt);
      return response;
    } catch (error) {
      console.error('Error in direct text analysis:', error);
      throw error;
    }
  }
  
  /**
   * Call Together API directly
   */
  async function callTogetherApi(prompt) {
    try {
      // Get API key from config (already validated in the parent function)
      const apiKey = window.CONFIG?.TOGETHER_API_KEY;
      
      // API endpoint
      const apiUrl = 'https://api.together.xyz/v1/completions';
      
      // Request body
      const requestBody = {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt: prompt,
        temperature: 0.2,
        max_tokens: 1500,
        top_p: 0.95,
        top_k: 40
      };
      
      console.log('Making direct API call to Together.ai');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out after 30 seconds')), 30000);
      });
      
      // Make API call with timeout
      const response = await Promise.race([
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        }),
        timeoutPromise
      ]);
      
      // Check if response is ok
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = `Together API error: ${errorData.error?.message || response.statusText}`;
        } catch (e) {
          errorMessage = `Together API error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Parse response
      const data = await response.json();
      console.log('API call successful');
      
      // Return the generated text
      return data.choices[0].text;
    } catch (error) {
      console.error('Error calling Together API directly:', error);
      throw error;
    }
  }
  
  /**
   * Calculate recording duration
   */
  function calculateRecordingDuration() {
    // Try to get duration from media recorder
    if (window.mediaRecorder && window.mediaRecorder.startTime && window.mediaRecorder.stopTime) {
      return Math.round((window.mediaRecorder.stopTime - window.mediaRecorder.startTime) / 1000);
    }
    
    // Default duration if not available
    return 60; // Assume 60 seconds
  }
})();