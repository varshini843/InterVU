// video-fix.js - Fix for video recording and analysis

/**
 * This file provides fixes for video recording and analysis issues
 * and integrates real-time analysis for body language and speech
 */

(function() {
  // Wait for the page to fully load
  window.addEventListener('load', function() {
    console.log('Video fix script loaded');
    
    // Check if direct Together.ai analysis is initialized
    if (!window.DirectTogetherAnalysis) {
      console.log('Direct Together.ai analysis not initialized, will try to initialize');
      loadDirectAnalysisScript();
    } else {
      console.log('Direct Together.ai analysis already initialized');
    }
    
    // Fix for video recording
    const fixVideoRecording = function() {
      // Get DOM elements
      const startRecordingBtn = document.getElementById('startRecordingBtn');
      const stopRecordingBtn = document.getElementById('stopRecordingBtn');
      const recordedVideo = document.getElementById('recordedVideo');
      const submitBtn = document.getElementById('submitBtn');
      
      if (!startRecordingBtn || !stopRecordingBtn || !recordedVideo || !submitBtn) {
        console.warn('Video recording elements not found');
        return;
      }
      
      console.log('Applying video recording fixes');
      
      // Ensure video recording works properly
      const originalStartRecording = startRecordingBtn.onclick;
      startRecordingBtn.onclick = function(event) {
        console.log('Start recording button clicked (fixed handler)');
        
        // Reset the recorded video
        recordedVideo.src = '';
        recordedVideo.style.display = 'none';
        
        // Reset the transcription
        window.recordingTranscription = '';
        
        // Reset any previous analysis data
        window.finalAnalysisData = null;
        
        // Save start time for duration calculation
        if (!window.mediaRecorder) {
          window.mediaRecorder = {};
        }
        window.mediaRecorder.startTime = Date.now();
        console.log('Recording start time saved:', window.mediaRecorder.startTime);
        
        // Hide any feedback that might be showing
        const feedbackBox = document.getElementById('feedbackBox');
        if (feedbackBox) {
          feedbackBox.innerHTML = '';
        }
        
        // Hide real-time feedback container if it exists
        const realtimeFeedbackContainer = document.getElementById('realtimeFeedbackContainer');
        if (realtimeFeedbackContainer) {
          realtimeFeedbackContainer.style.display = 'none';
        }
        
        // Call the original handler if it exists
        if (typeof originalStartRecording === 'function') {
          originalStartRecording.call(this, event);
        }
      };
      
      // Add a handler for stop recording button
      const originalStopRecording = stopRecordingBtn.onclick;
      stopRecordingBtn.onclick = function(event) {
        console.log('Stop recording button clicked (fixed handler)');
        
        // Save the stop time for duration calculation
        if (!window.mediaRecorder) {
          window.mediaRecorder = {};
        }
        window.mediaRecorder.stopTime = Date.now();
        
        // Call the original handler if it exists
        if (typeof originalStopRecording === 'function') {
          originalStopRecording.call(this, event);
        }
        
        // Ensure we save any analysis data that was collected
        if (window.RealtimeTogetherAnalysis && window.RealtimeTogetherAnalysis.isAnalyzing) {
          console.log('Saving final analysis data from real-time analysis');
          window.RealtimeTogetherAnalysis.stopAnalysis();
        }
      };
      
      // Ensure video submission works properly
      const originalSubmit = submitBtn.onclick;
      submitBtn.onclick = function(event) {
        console.log('Submit button clicked (fixed handler)');
        
        // Get the current answer mode
        const answerModeRadios = document.getElementsByName('answerMode');
        const mode = Array.from(answerModeRadios).find(r => r.checked)?.value;
        
        // If in video mode, ensure we have a recording
        if (mode === 'record') {
          console.log('Video mode detected');
          
          if (recordedVideo.style.display === 'none' || !recordedVideo.src) {
            console.warn('No recorded video found');
            alert('Please record your answer before submitting.');
            return;
          }
          
          console.log('Video recording found:', recordedVideo.src);
          console.log('Transcription:', window.recordingTranscription);
          console.log('Analysis data available:', !!window.finalAnalysisData);
          
          // Show loading state in feedback box
          const feedbackBox = document.getElementById('feedbackBox');
          if (feedbackBox) {
            feedbackBox.innerHTML = `
              <div class="loading-analysis">
                <div class="loading-spinner"></div>
                <p>Analyzing your video answer...</p>
                <p class="loading-subtext">This may take a few moments</p>
              </div>
            `;
          }
        }
        
        // Call the original handler if it exists
        if (typeof originalSubmit === 'function') {
          originalSubmit.call(this, event);
        }
      };
    };
    
    // Fix for video analysis
    const fixVideoAnalysis = function() {
      // Ensure the analyzeAnswerWithAI function can handle video answers
      if (typeof window.analyzeAnswerWithAI === 'function') {
        console.log('Applying video analysis fixes');
        
        // Store the original function
        const originalAnalyzeAnswerWithAI = window.analyzeAnswerWithAI;
        
        // Replace with our fixed version
        window.analyzeAnswerWithAI = function(question, answer, mode) {
          console.log('Fixed analyzeAnswerWithAI called with mode:', mode);
          
          // If this is a video answer, ensure we have the transcription
          if (mode === 'record') {
            console.log('Video analysis requested');
            
            // Use the global transcription variable
            const transcription = window.recordingTranscription || '';
            console.log('Using transcription:', transcription);
            
            // If we have the Together API, use it directly
            if (window.TogetherAPI && window.TogetherAPI.isInitialized) {
              console.log('Using Together API directly for video analysis');
              
              return new Promise((resolve, reject) => {
                const feedbackBox = document.getElementById('feedbackBox');
                
                if (feedbackBox) {
                  feedbackBox.innerHTML = `
                    <div class="loading-message">
                      <p>Analyzing your video answer with Together AI...</p>
                      <div class="progress-indicator"></div>
                    </div>
                  `;
                }
                
                // Create an enhanced prompt for video analysis
                const prompt = `
You are an expert interview coach specializing in both verbal and non-verbal communication.
Analyze the following transcribed interview answer for the question:

Question: "${question}"

Transcribed Answer: "${transcription || 'Video answer submitted without transcription.'}"

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
                
                // Use the Together API directly
                window.TogetherAPI.makeRequest(prompt, {
                  temperature: 0.2,
                  max_tokens: 1024
                })
                  .then(analysis => {
                    if (feedbackBox) {
                      feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
                    }
                    resolve(analysis);
                  })
                  .catch(error => {
                    console.error('Error in direct video analysis:', error);
                    
                    // Fall back to the original function
                    originalAnalyzeAnswerWithAI(question, answer, mode)
                      .then(resolve)
                      .catch(reject);
                  });
              });
            }
          }
          
          // For text answers or if Together API is not available, use the original function
          return originalAnalyzeAnswerWithAI(question, answer, mode);
        };
      }
    };
    
    // Function to load the direct analysis script
    function loadDirectAnalysisScript() {
      // Check if script is already loaded
      if (document.querySelector('script[src*="direct-together-analysis.js"]')) {
        console.log('Direct Together.ai analysis script already loaded');
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'direct-together-analysis.js';
      script.async = true;
      script.onload = function() {
        console.log('Direct Together.ai analysis script loaded successfully');
      };
      script.onerror = function() {
        console.error('Failed to load direct Together.ai analysis script');
      };
      
      // Append to document
      document.head.appendChild(script);
    }
    
    // Apply the fixes
    setTimeout(function() {
      fixVideoRecording();
      fixVideoAnalysis();
    }, 1000);
  });
})();