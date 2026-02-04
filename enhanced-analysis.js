// enhanced-analysis.js - Enhanced analysis for interview answers using Together.ai API and ML

/**
 * This file provides enhanced analysis capabilities for interview answers
 * by combining Together.ai API with ML-based analysis
 */

class EnhancedAnalysis {
  constructor() {
    // Check if required components are available
    this.hasTogetherAPI = window.TogetherAPI && window.TogetherAPI.isInitialized;
    this.hasMLAnalysis = window.MLAnalysis && window.MLAnalysis.isInitialized;
    
    // Log initialization status
    console.log(`Enhanced Analysis initialized: Together API: ${this.hasTogetherAPI ? 'Yes' : 'No'}, ML Analysis: ${this.hasMLAnalysis ? 'Yes' : 'No'}`);
    
    // Directly replace the global analyzeAnswerWithAI function
    window.analyzeAnswerWithAI = this.enhancedAnalyzeAnswerWithAI.bind(this);
    console.log('Enhanced analyzeAnswerWithAI function installed');
  }
  
  /**
   * Format feedback from direct Together.ai analysis data
   */
  formatDirectAnalysisFeedback(analysisData, question, transcription) {
    try {
      // Create a well-formatted HTML feedback using the direct analysis data
      let feedback = `
        <h2>Interview Answer Analysis</h2>
        <p><strong>Question:</strong> ${question}</p>
        
        <div class="analysis-section">
          <h3>CONTENT ANALYSIS</h3>
          <p>${analysisData.content.feedback || 'Your answer was analyzed for relevance, structure, and key points.'}</p>
          <div class="metrics-container">
            <div class="metric ${analysisData.content.relevance >= 4 ? 'metric-good' : analysisData.content.relevance >= 3 ? 'metric-neutral' : 'metric-warning'}">
              Relevance: ${analysisData.content.relevance}/5
            </div>
          </div>
        </div>
        
        <div class="analysis-section">
          <h3>VERBAL COMMUNICATION ANALYSIS</h3>
          <p>${analysisData.speech.feedback || 'Your speech patterns were analyzed for pace, clarity, and filler words.'}</p>
          <div class="metrics-container">
            <div class="metric ${analysisData.speech.pace >= 2.5 && analysisData.speech.pace <= 3.5 ? 'metric-good' : 'metric-warning'}">
              Pace: ${analysisData.speech.pace}/5
            </div>
            <div class="metric ${analysisData.speech.clarity >= 4 ? 'metric-good' : analysisData.speech.clarity >= 3 ? 'metric-neutral' : 'metric-warning'}">
              Clarity: ${analysisData.speech.clarity}/5
            </div>
            <div class="metric ${analysisData.speech.fillerWordRatio <= 0.05 ? 'metric-good' : 'metric-warning'}">
              Filler Words: ${(analysisData.speech.fillerWordRatio * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div class="analysis-section">
          <h3>NON-VERBAL COMMUNICATION ANALYSIS</h3>
          <p>${analysisData.video.feedback || 'Your body language was analyzed for eye contact, posture, and overall presentation.'}</p>
          <div class="metrics-container">
            <div class="metric ${analysisData.video.eyeContact >= 4 ? 'metric-good' : analysisData.video.eyeContact >= 3 ? 'metric-neutral' : 'metric-warning'}">
              Eye Contact: ${analysisData.video.eyeContact}/5
            </div>
            <div class="metric ${analysisData.video.posture >= 4 ? 'metric-good' : analysisData.video.posture >= 3 ? 'metric-neutral' : 'metric-warning'}">
              Posture: ${analysisData.video.posture}/5
            </div>
          </div>
        </div>
        
        <div class="analysis-section">
          <h3>KEY STRENGTHS</h3>
          <ul class="strengths-list">
            ${analysisData.overall.strengths.map(strength => `<li>✓ ${strength}</li>`).join('')}
          </ul>
        </div>
        
        <div class="analysis-section">
          <h3>PRIORITY IMPROVEMENT AREAS</h3>
          <ul class="improvements-list">
            ${analysisData.overall.improvements.map(improvement => `<li>⚠️ ${improvement}</li>`).join('')}
          </ul>
        </div>
        
        <div class="analysis-section">
          <h3>ACTIONABLE RECOMMENDATIONS</h3>
          <ol class="tips-list">
            ${analysisData.overall.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ol>
        </div>
        
        <style>
          .analysis-section {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
          }
          .analysis-section h3 {
            color: #0066cc;
            margin-bottom: 10px;
          }
          .metrics-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
          }
          .metric {
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.9em;
          }
          .metric-good {
            background-color: #e8f5e9;
            color: #2e7d32;
          }
          .metric-neutral {
            background-color: #e3f2fd;
            color: #1565c0;
          }
          .metric-warning {
            background-color: #fff3e0;
            color: #ef6c00;
          }
          .strengths-list li, .improvements-list li {
            margin-bottom: 5px;
          }
          .tips-list li {
            margin-bottom: 8px;
          }
        </style>
      `;
      
      return feedback;
    } catch (error) {
      console.error('Error formatting direct analysis feedback:', error);
      return `<p>Error formatting feedback: ${error.message}</p>`;
    }
  }
  
  /**
   * Enhanced version of analyzeAnswerWithAI that uses Together.ai API and ML analysis
   */
  async enhancedAnalyzeAnswerWithAI(question, answer, mode) {
    // Call the original function if Together API is not available
    if (!this.hasTogetherAPI) {
      console.log('Together API not available, using original analysis function');
      return window.originalAnalyzeAnswerWithAI(question, answer, mode);
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Show loading state with improved UI
        const feedbackBox = document.getElementById('feedbackBox');
        if (feedbackBox) {
          feedbackBox.innerHTML = `
            <div class="loading-analysis">
              <div class="loading-spinner"></div>
              <p>Analyzing your answer with AI...</p>
              <p class="loading-subtext">This may take a few moments</p>
            </div>
          `;
          
          // Add loading spinner styles if not already present
          if (!document.getElementById('loading-analysis-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-analysis-styles';
            style.textContent = `
              .loading-analysis {
                text-align: center;
                padding: 20px;
              }
              .loading-spinner {
                border: 4px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                border-top: 4px solid #3498db;
                width: 40px;
                height: 40px;
                margin: 0 auto 15px auto;
                animation: spin 1s linear infinite;
              }
              .loading-subtext {
                font-size: 0.9em;
                color: #666;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `;
            document.head.appendChild(style);
          }
        }
        
        // Validate input
        if (mode === 'text' && (!answer || answer.trim().length === 0)) {
          if (feedbackBox) {
            feedbackBox.innerHTML = `
              <div class="error-message">
                <h3>⚠️ Empty Answer</h3>
                <p>You didn't provide any answer to analyze. Please type your answer and try again.</p>
              </div>
            `;
          }
          reject(new Error("Empty answer"));
          return;
        }
        
        if (mode === 'record') {
          // For video answers, use the transcription if available
          console.log('Enhanced analysis for video answer');
          
          // Access the global recordingTranscription variable
          const recordingTranscription = window.recordingTranscription || '';
          console.log('Transcription available:', !!recordingTranscription, 'Length:', recordingTranscription.length);
          
          // Even if transcription is empty, we'll still analyze the video answer
          // but we'll provide a warning
          if (!recordingTranscription || recordingTranscription.trim().length === 0) {
            console.warn('No transcription available for video analysis');
            if (feedbackBox) {
              feedbackBox.innerHTML += `
                <div class="warning-message">
                  <h3>⚠️ Limited Analysis</h3>
                  <p>No speech transcription was detected. Analysis will be limited. For better results, please ensure your microphone is working properly.</p>   
                </div>
              `;
            }
          }
          
          // Use whatever transcription we have, even if it's empty
          const transcription = recordingTranscription || "Video answer submitted without transcription.";
          
          // Calculate duration from mediaRecorder if available
          let duration = 60; // Default duration if we can't calculate it
          
          if (window.mediaRecorder) {
            if (window.mediaRecorder.stopTime && window.mediaRecorder.startTime) {
              duration = Math.round((window.mediaRecorder.stopTime - window.mediaRecorder.startTime) / 1000);
              console.log(`Calculated video duration: ${duration} seconds`);
            } else {
              console.warn('MediaRecorder missing start/stop time, using default duration');
            }
          } else {
            console.warn('MediaRecorder not available, using default duration');
          }
          
          if (feedbackBox) {
            feedbackBox.innerHTML = `
              <div class="loading-message">
                <p>Analyzing your answer with Together AI...</p>
                <div class="progress-indicator"></div>
              </div>
            `;
          }
          
          // Get ML analysis data if available
          let mlAnalysisData = {};
          
          // First check if we have direct Together.ai analysis data
          if (window.finalAnalysisData) {
            console.log('Using direct Together.ai analysis data for feedback');
            mlAnalysisData = {
              speech: {
                volume: window.finalAnalysisData.speech.volume || 0.5,
                pace: window.finalAnalysisData.speech.pace || 3.0,
                clarity: window.finalAnalysisData.speech.clarity || 3.0,
                fillerWordRatio: window.finalAnalysisData.speech.fillerWords || 0,
                feedback: window.finalAnalysisData.speech.feedback || ''
              },
              video: {
                eyeContact: window.finalAnalysisData.body.eyeContact || 3.0,
                posture: window.finalAnalysisData.body.posture || window.finalAnalysisData.body.eyeContact * 0.8 || 3.0,
                movement: window.finalAnalysisData.body.movement || 2.0,
                faceDetectionRate: window.finalAnalysisData.body.faceDetectionRate || 0.8,
                feedback: window.finalAnalysisData.body.feedback || ''
              },
              content: {
                relevance: window.finalAnalysisData.content.relevance || 3.0,
                keywords: window.finalAnalysisData.content.keywords || [],
                feedback: window.finalAnalysisData.content.feedback || ''
              },
              overall: window.finalAnalysisData.overall || {
                score: 3.0,
                strengths: [],
                improvements: [],
                tips: []
              }
            };
            
            // Add content keywords to the transcription for better analysis
            if (mlAnalysisData.content && mlAnalysisData.content.keywords && mlAnalysisData.content.keywords.length > 0) {
              const keywordsInfo = "\\n\\nKey terms detected: " + mlAnalysisData.content.keywords.join(", ");
              transcription += keywordsInfo;
            }
            
            // Add overall analysis data to the transcription
            if (mlAnalysisData.overall) {
              if (mlAnalysisData.overall.strengths && mlAnalysisData.overall.strengths.length > 0) {
                transcription += "\\n\\nStrengths identified: " + mlAnalysisData.overall.strengths.join(", ");
              }
              
              if (mlAnalysisData.overall.improvements && mlAnalysisData.overall.improvements.length > 0) {
                transcription += "\\n\\nAreas for improvement: " + mlAnalysisData.overall.improvements.join(", ");
              }
            }
          } 
          // Fall back to ML analysis if real-time data is not available
          else if (this.hasMLAnalysis) {
            console.log('Using ML analysis data for feedback');
            const comprehensiveAnalysis = window.MLAnalysis.getComprehensiveAnalysis();
            if (comprehensiveAnalysis) {
              mlAnalysisData = {
                speech: {
                  volume: comprehensiveAnalysis.speech.volume.average,
                  pace: comprehensiveAnalysis.speech.pace.score,
                  clarity: comprehensiveAnalysis.speech.clarity,
                  fillerWordRatio: window.MLAnalysis.analyzeText(transcription)?.fillerWordRatio || 0
                },
                video: {
                  eyeContact: comprehensiveAnalysis.video.eyeContact,
                  posture: comprehensiveAnalysis.video.posture,
                  movement: comprehensiveAnalysis.video.movement,
                  faceDetectionRate: 0.8 // Default value
                }
              };
            }
          }
          
          // Create an enhanced prompt with ML analysis data
          const enhancedPrompt = `
You are an expert interview coach with years of experience helping candidates improve their interview performance.
Analyze the following video interview answer for the question:

Question: "${question}"

Transcribed Answer: "${transcription}"

Answer Duration: ${duration} seconds

${Object.keys(mlAnalysisData).length > 0 ? `
Video Analysis Data (collected during the interview):
Speech Metrics:
- Volume: ${mlAnalysisData.speech?.volume.toFixed(2)}/1.0 (0.4-0.7 is optimal)
- Speaking Pace: ${mlAnalysisData.speech?.pace.toFixed(1)}/5.0 (3.0 is optimal)
- Speech Clarity: ${mlAnalysisData.speech?.clarity}/5.0
- Filler Word Ratio: ${(mlAnalysisData.speech?.fillerWordRatio * 100).toFixed(1)}%

Body Language Metrics:
- Eye Contact: ${mlAnalysisData.video?.eyeContact.toFixed(1)}/5.0
- Posture: ${mlAnalysisData.video?.posture.toFixed(1)}/5.0
- Movement Level: ${mlAnalysisData.video?.movement.toFixed(1)}/5.0
- Face Detection Rate: ${(mlAnalysisData.video?.faceDetectionRate * 100).toFixed(1)}%

${mlAnalysisData.content && mlAnalysisData.content.relevance ? `Content Metrics:
- Relevance to Question: ${mlAnalysisData.content.relevance.toFixed(1)}/5.0
${mlAnalysisData.content.keywords && mlAnalysisData.content.keywords.length > 0 ? `- Key Terms Used: ${mlAnalysisData.content.keywords.join(', ')}` : ''}` : ''}
` : ''}

Provide comprehensive feedback on this video interview answer, focusing on:

1. CONTENT QUALITY (30% of evaluation)
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

3. NON-VERBAL COMMUNICATION (30% of evaluation)
   - Eye contact with camera
   - Facial expressions and engagement
   - Posture and body positioning
   - Hand gestures and movement
   - Overall professional appearance

${Object.keys(mlAnalysisData).length > 0 ? `
Based on the metrics:
- Eye contact is ${mlAnalysisData.video?.eyeContact < 2.5 ? 'poor' : mlAnalysisData.video?.eyeContact < 3.5 ? 'average' : 'good'}
- Body movement is ${mlAnalysisData.video?.movement < 1.0 ? 'too limited' : mlAnalysisData.video?.movement > 3.0 ? 'excessive' : 'appropriate'}
- Posture appears ${mlAnalysisData.video?.posture < 2.5 ? 'poor' : mlAnalysisData.video?.posture < 3.5 ? 'average' : 'good'}
- Face visibility is ${mlAnalysisData.video?.faceDetectionRate < 0.7 ? 'inconsistent' : 'consistent'}
- Speaking volume is ${mlAnalysisData.speech?.volume < 0.3 ? 'too quiet' : mlAnalysisData.speech?.volume > 0.7 ? 'too loud' : 'appropriate'}
- Speaking pace is ${mlAnalysisData.speech?.pace < 2.5 ? 'too slow' : mlAnalysisData.speech?.pace > 3.5 ? 'too fast' : 'well-paced'}
- Speech clarity is ${mlAnalysisData.speech?.clarity < 3.0 ? 'needs improvement' : 'good'}
- Filler word usage is ${mlAnalysisData.speech?.fillerWordRatio > 0.05 ? 'high' : 'low'}
` : ''}

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

          // Check if we have overall analysis data from direct Together.ai analysis
          if (mlAnalysisData.overall && mlAnalysisData.overall.strengths && mlAnalysisData.overall.strengths.length > 0) {
            console.log('Using direct Together.ai overall analysis data for feedback');
            
            // Format the feedback using the direct analysis data
            const formattedFeedback = this.formatDirectAnalysisFeedback(mlAnalysisData, question, transcription);
            
            if (feedbackBox) {
              feedbackBox.innerHTML = `<div class="analysis-content">${formattedFeedback}</div>`;
            }
            
            resolve(formattedFeedback);
          } else {
            // Use the enhanced prompt with Together API
            console.log('Using enhanced prompt with Together API for feedback');
            
            window.TogetherAPI.makeRequest(enhancedPrompt, {
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
                console.error('Error analyzing video answer with enhanced prompt:', error);
                
                // Fall back to standard analysis if enhanced fails
                window.TogetherAPI.analyzeVideoAnswer(question, transcription, duration)
                  .then(analysis => {
                    if (feedbackBox) {
                      feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
                    }
                    resolve(analysis);
                  })
                  .catch(fallbackError => {
                    console.error('Error with fallback analysis:', fallbackError);
                    if (feedbackBox) {
                      feedbackBox.innerHTML = `
                        <div class="error-message">
                          <h3>⚠️ Analysis Error</h3>
                          <p>There was an error analyzing your answer: ${error.message}</p>
                        </div>
                      `;
                    }
                    reject(error);
                  });
              });
          }
        } else {
          // For text answers
          if (feedbackBox) {
            feedbackBox.innerHTML = `
              <div class="loading-message">
                <p>Analyzing your answer with Together AI...</p>
                <div class="progress-indicator"></div>
              </div>
            `;
          }
          
          // Create an enhanced prompt for text analysis
          const enhancedPrompt = `
You are an expert interview coach with years of experience helping candidates improve their interview performance.
Analyze the following written interview answer for the question:

Question: "${question}"

Answer: "${answer}"

Provide comprehensive feedback on this written interview answer, focusing on:

1. CONTENT QUALITY (50% of evaluation)
   - Relevance to the question asked
   - Depth and specificity of examples
   - Structure and organization
   - Completeness of the answer
   - Use of relevant industry terminology and concepts

2. WRITTEN COMMUNICATION (50% of evaluation)
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

          // Use the enhanced prompt with Together API
          window.TogetherAPI.makeRequest(enhancedPrompt, {
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
              console.error('Error analyzing text answer with enhanced prompt:', error);
              
              // Fall back to standard analysis if enhanced fails
              window.TogetherAPI.analyzeTextAnswer(question, answer)
                .then(analysis => {
                  if (feedbackBox) {
                    feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
                  }
                  resolve(analysis);
                })
                .catch(fallbackError => {
                  console.error('Error with fallback analysis:', fallbackError);
                  if (feedbackBox) {
                    feedbackBox.innerHTML = `
                      <div class="error-message">
                        <h3>⚠️ Analysis Error</h3>
                        <p>There was an error analyzing your answer: ${error.message}</p>
                      </div>
                    `;
                  }
                  reject(error);
                });
            });
        }
      } catch (error) {
        console.error('Error in enhancedAnalyzeAnswerWithAI:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Analyze real-time speech with Together.ai API
   */
  async analyzeRealTimeSpeech(question, transcription) {
    if (!this.hasTogetherAPI || !transcription || transcription.length < 20) {
      return null;
    }
    
    try {
      const prompt = `
You are an interview coach providing real-time feedback.

Question: "${question}"

Partial answer so far: "${transcription}"

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

      const generatedText = await window.TogetherAPI.makeRequest(prompt, {
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
    } catch (error) {
      console.error('Error in real-time speech analysis:', error);
      return null;
    }
  }
}

// Initialize the enhanced analysis
window.EnhancedAnalysis = new EnhancedAnalysis();