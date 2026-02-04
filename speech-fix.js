// speech-fix.js - Fix for speech recognition in interview.js

/**
 * This file patches the interview.js file to use our simplified speech recognition
 * and Together.ai API for real-time analysis.
 */

(function() {
  // Wait for the page to fully load
  window.addEventListener('load', function() {
    console.log('Speech fix script loaded');
    
    // Fix for speech recognition
    const fixSpeechRecognition = function() {
      // Get DOM elements
      const startRecordingBtn = document.getElementById('startRecordingBtn');
      const stopRecordingBtn = document.getElementById('stopRecordingBtn');
      
      if (!startRecordingBtn || !stopRecordingBtn) {
        console.warn('Recording buttons not found');
        return;
      }
      
      console.log('Applying speech recognition fixes');
      
      // Override the start recording button click handler
      const originalStartRecording = startRecordingBtn.onclick;
      startRecordingBtn.onclick = function(event) {
        console.log('Start recording button clicked (fixed handler)');
        
        // Call the original handler first
        if (typeof originalStartRecording === 'function') {
          originalStartRecording.call(this, event);
        }
        
        // Start our browser-compatible speech recognition
        setTimeout(function() {
          if (window.BrowserSpeech) {
            console.log('Starting browser-compatible speech recognition');
            window.BrowserSpeech.reset();
            window.BrowserSpeech.start();
            
            // Create or update transcription container if not already created by BrowserSpeech
            let transcriptionContainer = document.getElementById('transcriptionContainer');
            if (!transcriptionContainer) {
              const recordingControls = document.getElementById('recordingControls');
              if (recordingControls) {
                transcriptionContainer = document.createElement('div');
                transcriptionContainer.id = 'transcriptionContainer';
                transcriptionContainer.style.marginTop = '15px';
                transcriptionContainer.style.padding = '10px';
                transcriptionContainer.style.backgroundColor = '#f5f5f5';
                transcriptionContainer.style.borderRadius = '5px';
                transcriptionContainer.innerHTML = '<h3 style="margin-top:0;">Speech Transcription</h3><div id="transcriptionText">Initializing speech recognition...</div>';
                recordingControls.appendChild(transcriptionContainer);
              }
            }
          } else if (window.SimpleSpeech) {
            console.log('Falling back to simple speech recognition');
            window.SimpleSpeech.reset();
            window.SimpleSpeech.start();
          }
        }, 500);
      };
      
      // Override the stop recording button click handler
      const originalStopRecording = stopRecordingBtn.onclick;
      stopRecordingBtn.onclick = function(event) {
        console.log('Stop recording button clicked (fixed handler)');
        
        // Stop our speech recognition
        if (window.BrowserSpeech) {
          console.log('Stopping browser-compatible speech recognition');
          
          // Get the final transcription
          const transcription = window.BrowserSpeech.getTranscription();
          if (transcription && transcription.final) {
            window.recordingTranscription = transcription.final;
            console.log('Final transcription:', transcription.final);
          }
          
          window.BrowserSpeech.stop();
        } else if (window.SimpleSpeech) {
          console.log('Stopping simple speech recognition');
          
          // Get the final transcription
          const transcription = window.SimpleSpeech.getTranscription();
          if (transcription && transcription.final) {
            window.recordingTranscription = transcription.final;
            console.log('Final transcription:', transcription.final);
          }
          
          window.SimpleSpeech.stop();
        }
        
        // Call the original handler
        if (typeof originalStopRecording === 'function') {
          originalStopRecording.call(this, event);
        }
      };
    };
    
    // Fix for answer analysis
    const fixAnswerAnalysis = function() {
      // Override the analyzeAnswerWithAI function
      if (typeof window.analyzeAnswerWithAI === 'function') {
        console.log('Applying answer analysis fixes');
        
        // Store the original function
        const originalAnalyzeAnswerWithAI = window.analyzeAnswerWithAI;
        
        // Replace with our fixed version
        window.analyzeAnswerWithAI = function(question, answer, mode) {
          console.log('Fixed analyzeAnswerWithAI called with mode:', mode);
          
          return new Promise((resolve, reject) => {
            const feedbackBox = document.getElementById('feedbackBox');
            
            if (feedbackBox) {
              feedbackBox.innerHTML = `
                <div class="loading-message">
                  <p>Analyzing your ${mode === 'text' ? 'text' : 'video'} answer with Together AI...</p>
                  <div class="progress-indicator"></div>
                </div>
              `;
            }
            
            // Try using SimpleTogether first
            if (window.SimpleTogether && window.SimpleTogether.isInitialized) {
              console.log('Using SimpleTogether for analysis');
              
              if (mode === 'record') {
                // For video answers
                const transcription = window.recordingTranscription || '';
                console.log('Using transcription:', transcription);
                
                window.SimpleTogether.analyzeVideoAnswer(question, transcription)
                  .then(analysis => {
                    if (feedbackBox) {
                      feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
                    }
                    resolve(analysis);
                  })
                  .catch(error => {
                    console.error('Error in video analysis with SimpleTogether:', error);
                    
                    // Try using TogetherAPI directly
                    if (window.TogetherAPI && window.TogetherAPI.isInitialized) {
                      console.log('Falling back to TogetherAPI for video analysis');
                      window.TogetherAPI.analyzeVideoAnswer(question, transcription)
                        .then(analysis => {
                          if (feedbackBox) {
                            feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
                          }
                          resolve(analysis);
                        })
                        .catch(fallbackError => {
                          console.error('Error in video analysis with TogetherAPI:', fallbackError);
                          // Fall back to original function as last resort
                          originalAnalyzeAnswerWithAI(question, answer, mode)
                            .then(resolve)
                            .catch(reject);
                        });
                    } else {
                      // Fall back to original function
                      originalAnalyzeAnswerWithAI(question, answer, mode)
                        .then(resolve)
                        .catch(reject);
                    }
                  });
              } else {
                // For text answers
                window.SimpleTogether.analyzeTextAnswer(question, answer)
                  .then(analysis => {
                    if (feedbackBox) {
                      feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
                    }
                    resolve(analysis);
                  })
                  .catch(error => {
                    console.error('Error in text analysis with SimpleTogether:', error);
                    
                    // Try using TogetherAPI directly
                    if (window.TogetherAPI && window.TogetherAPI.isInitialized) {
                      console.log('Falling back to TogetherAPI for text analysis');
                      window.TogetherAPI.analyzeTextAnswer(question, answer)
                        .then(analysis => {
                          if (feedbackBox) {
                            feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
                          }
                          resolve(analysis);
                        })
                        .catch(fallbackError => {
                          console.error('Error in text analysis with TogetherAPI:', fallbackError);
                          // Fall back to original function as last resort
                          originalAnalyzeAnswerWithAI(question, answer, mode)
                            .then(resolve)
                            .catch(reject);
                        });
                    } else {
                      // Fall back to original function
                      originalAnalyzeAnswerWithAI(question, answer, mode)
                        .then(resolve)
                        .catch(reject);
                    }
                  });
              }
            } else {
              // Fall back to original function
              console.log('SimpleTogether not available, using original analysis function');
              originalAnalyzeAnswerWithAI(question, answer, mode)
                .then(resolve)
                .catch(reject);
            }
          });
        };
      }
    };
    
    // Apply the fixes
    setTimeout(function() {
      fixSpeechRecognition();
      fixAnswerAnalysis();
    }, 1000);
  });
})();