// interview.js - AI-powered interview practice functionality

// DOM elements
const webcamVideo = document.getElementById('webcam');
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');
const recordingControls = document.getElementById('recordingControls');
const recordedVideo = document.getElementById('recordedVideo');
const answerModeRadios = document.getElementsByName('answerMode');
const answerInput = document.getElementById('answerInput');
const careerSelect = document.getElementById('careerSelect');
const questionBox = document.getElementById('questionBox');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const feedbackBox = document.getElementById('feedbackBox');
const micStatus = document.getElementById('micStatus');
const progressIndicator = document.getElementById('progressIndicator');
const questionCounter = document.getElementById('questionCounter');

// Real-time text analysis has been removed

// MediaRecorder variables
let mediaRecorder;
let recordedChunks = [];
let localStream = null;
let audioContext;
let audioAnalyser;
let microphoneStream;

// Interview state
let currentQuestions = [];
let currentIndex = 0;
const QUESTIONS_PER_INTERVIEW = 10;
let userAnswers = [];
let interviewInProgress = false;

// Update UI based on answer mode selection
function updateAnswerMode() {
  const selectedMode = Array.from(answerModeRadios).find(r => r.checked).value;
  
  // Clear any previous answers when switching modes
  answerInput.value = '';
  
  // Hide any previous recorded video
  recordedVideo.style.display = 'none';
  
  // Reset submit button state
  submitBtn.disabled = false;
  
  if (selectedMode === 'text') {
    // Text mode
    answerInput.style.display = 'block';
    recordingControls.style.display = 'none';
    webcamVideo.style.display = 'none';
    recordedVideo.style.display = 'none';
    
    // Focus on the text input
    setTimeout(() => answerInput.focus(), 100);
    
    // Stop webcam if it's running
    stopWebcam();
    
    // Show a helpful placeholder
    answerInput.placeholder = "Type your answer here... Be specific and provide examples if possible.";
  } else {
    // Video mode
    answerInput.style.display = 'none';
    recordingControls.style.display = 'block';
    recordedVideo.style.display = 'none';
    
    // Reset recording buttons
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
    
    // Show a helpful message
    feedbackBox.innerHTML = '<p>Click "Start Recording" when you\'re ready to answer the question.</p>';
  }
  
  // Clear any previous feedback
  if (feedbackBox.innerHTML.includes('Analysis')) {
    feedbackBox.innerHTML = '';
  }
}

// Stop webcam stream if active
function stopWebcam() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
    webcamVideo.srcObject = null;
    webcamVideo.style.display = 'none';
    
    // Also stop audio analysis if it's running
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      audioContext = null;
      audioAnalyser = null;
      micStatus.textContent = 'Mic: Off';
    }
  }
}

// Start recording handler
startRecordingBtn.addEventListener('click', async () => {
  try {
    // Update UI state
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
    recordedVideo.style.display = 'none';
    
    // Clear any previous transcription display
    const existingTranscription = document.getElementById('transcriptionContainer');
    if (existingTranscription) {
      existingTranscription.innerHTML = '<h3 style="margin-top:0;">Speech Transcription</h3><div id="transcriptionText">Initializing speech recognition...</div>';
    }
    
    // Reset recording transcription
    recordingTranscription = '';
    
    // Show loading message
    feedbackBox.innerHTML = '<p>Initializing camera and microphone...</p>';

    // Request camera and microphone access with constraints for better quality
    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
    
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Set up webcam video
    webcamVideo.srcObject = localStream;
    webcamVideo.style.display = 'block';
    
    // Wait for video to be ready
    await new Promise(resolve => {
      webcamVideo.onloadedmetadata = () => {
        webcamVideo.play().then(resolve).catch(e => {
          console.error('Error playing video:', e);
          resolve();
        });
      };
      
      // Fallback if onloadedmetadata doesn't fire
      setTimeout(resolve, 1000);
    });
    
    console.log('Video initialized successfully');
    feedbackBox.innerHTML = '<p>Camera and microphone ready. Recording started.</p>';
    
    // Set up audio analysis
    setupAudioAnalysis(localStream);
    
    // Start speech recognition if available
    if (window.SpeechRecognitionService && window.SpeechRecognitionService.isSupported) {
      console.log('Initializing speech recognition');
      
      // Reset any previous transcription
      window.SpeechRecognitionService.resetTranscription();
      
      // Set up callback for transcription updates
      window.SpeechRecognitionService.onTranscriptionUpdate((finalText, interimText) => {
        // Create or update transcription display
        updateTranscriptionDisplay(finalText, interimText);
        
        // Store the current transcription
        recordingTranscription = finalText;
      });
      
      // Start listening
      const started = window.SpeechRecognitionService.startListening();
      if (started) {
        console.log('Speech recognition started successfully');
      } else {
        console.warn('Could not start speech recognition');
        updateTranscriptionDisplay('Speech recognition failed to start. Your answer will still be recorded.', '');
      }
    } else {
      console.warn('Speech recognition not supported');
      // Create a message for the user
      const transcriptionContainer = document.createElement('div');
      transcriptionContainer.id = 'transcriptionContainer';
      transcriptionContainer.className = 'real-time-container';
      transcriptionContainer.style.marginTop = '15px';
      transcriptionContainer.style.padding = '15px';
      transcriptionContainer.style.backgroundColor = '#f9f9f9';
      transcriptionContainer.style.borderRadius = '8px';
      transcriptionContainer.style.border = '1px solid #ddd';
      transcriptionContainer.innerHTML = `
        <h3 style="margin-top:0;">Speech Transcription</h3>
        <div id="transcriptionText">
          <p style="color: #f44336;">Speech recognition is not available in this browser.</p>
          <p>Please use Chrome or Edge for speech recognition, or continue with video only.</p>
        </div>
      `;
      
      // Insert after the recording controls
      recordingControls.appendChild(transcriptionContainer);
    }

    // Initialize MediaRecorder
    mediaRecorder = new MediaRecorder(localStream, {
      mimeType: 'video/webm;codecs=vp9,opus' // Specify codecs for better compatibility
    });
    mediaRecorder.startTime = Date.now(); // Track when recording started for pace calculation
    recordedChunks = [];

    // Handle data available event
    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    // Handle recording stop event
    mediaRecorder.onstop = () => {
      console.log('MediaRecorder stopped');
      
      // Record stop time for duration calculation
      mediaRecorder.stopTime = Date.now();
      
      try {
        // Create video blob and display it
        console.log('Creating video blob from', recordedChunks.length, 'chunks');
        const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log('Blob created, size:', recordedBlob.size);
        
        if (recordedBlob.size > 0) {
          const videoURL = URL.createObjectURL(recordedBlob);
          recordedVideo.src = videoURL;
          recordedVideo.style.display = 'block';
          console.log('Video displayed, URL:', videoURL);
        } else {
          console.error('Recorded blob is empty');
          feedbackBox.innerHTML = `<p style="color: #f44336;">Error: Recording failed to capture any data. Please try again.</p>`;
          return;
        }
        
        // Stop speech recognition if it's running
        if (window.SpeechRecognitionService && window.SpeechRecognitionService.isSupported) {
          window.SpeechRecognitionService.stopListening();
          
          // Get the final transcription for submission
          const transcription = window.SpeechRecognitionService.getTranscription().final;
          if (transcription) {
            // Store the transcription for submission
            recordingTranscription = transcription;
            console.log('Final transcription:', transcription);
            
            // Update the transcription display one last time
            updateTranscriptionDisplay(transcription, '');
          } else {
            console.warn('No transcription available from speech recognition');
            // Create a fallback transcription
            recordingTranscription = "Video answer submitted. (Transcription unavailable)";
          }
        } else {
          console.warn('Speech recognition service not available');
          recordingTranscription = "Video answer submitted. (Transcription unavailable)";
        }
        
        // Calculate recording duration
        const duration = Math.round((mediaRecorder.stopTime - mediaRecorder.startTime) / 1000);
        console.log(`Recording duration: ${duration} seconds`);
        
        // Update feedback
        feedbackBox.innerHTML = `<p>Recording complete (${duration} seconds). You can now submit your answer.</p>`;
        
        // Enable submit button after recording is complete
        submitBtn.disabled = false;
      } catch (error) {
        console.error('Error in mediaRecorder.onstop handler:', error);
        feedbackBox.innerHTML = `<p style="color: #f44336;">Error: ${error.message || 'An error occurred while processing the recording'}</p>`;
        submitBtn.disabled = false;
      } finally {
        // Stop webcam
        stopWebcam();
      }
    };

    // Start recording
    mediaRecorder.start(1000); // Collect data every second
    console.log('Recording started');
    
  } catch (error) {
    alert('Could not access camera and microphone. Please ensure you have granted permission.');
    console.error('Media access error:', error);
    feedbackBox.innerHTML = `<p style="color: #f44336;">Error: ${error.message || 'Could not access camera and microphone'}</p>`;
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
  }
});

// Create or update transcription display
function updateTranscriptionDisplay(finalText, interimText) {
  // Create the transcription container if it doesn't exist
  let transcriptionContainer = document.getElementById('transcriptionContainer');
  if (!transcriptionContainer) {
    transcriptionContainer = document.createElement('div');
    transcriptionContainer.id = 'transcriptionContainer';
    transcriptionContainer.className = 'real-time-container';
    transcriptionContainer.style.marginTop = '15px';
    transcriptionContainer.style.padding = '15px';
    transcriptionContainer.style.backgroundColor = '#f9f9f9';
    transcriptionContainer.style.borderRadius = '8px';
    transcriptionContainer.style.border = '1px solid #ddd';
    transcriptionContainer.style.maxHeight = '200px';
    transcriptionContainer.style.overflowY = 'auto';
    transcriptionContainer.innerHTML = '<h3 style="margin-top:0;">Speech Transcription</h3><div id="transcriptionText"></div>';
    
    // Insert after the recording controls for better visibility
    recordingControls.appendChild(transcriptionContainer);
  }
  
  // Update the transcription text
  const transcriptionText = document.getElementById('transcriptionText');
  if (transcriptionText) {
    // Format the text for better readability
    const formattedFinalText = finalText ? finalText : 'Waiting for speech...';
    
    transcriptionText.innerHTML = `
      <p style="margin-bottom: 8px; font-size: 16px;">${formattedFinalText}</p>
      ${interimText ? `<p><em style="color:#777; font-size: 14px;">${interimText}</em></p>` : ''}
    `;
    
    // Auto-scroll to the bottom
    transcriptionContainer.scrollTop = transcriptionContainer.scrollHeight;
  }
  
  // Make sure the container is visible
  transcriptionContainer.style.display = 'block';
}

// Variable to store the transcription for submission
let recordingTranscription = '';

// Real-time speech and body language analysis is now handled by real-time-analysis.js

// Set up audio analysis for microphone feedback
function setupAudioAnalysis(stream) {
  try {
    // Create audio context with fallback
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create analyzer node
    audioAnalyser = audioContext.createAnalyser();
    audioAnalyser.minDecibels = -90;
    audioAnalyser.maxDecibels = -10;
    audioAnalyser.smoothingTimeConstant = 0.85;
    
    // Connect microphone stream to analyzer
    microphoneStream = audioContext.createMediaStreamSource(stream);
    microphoneStream.connect(audioAnalyser);
    
    // Configure analyser for better performance
    audioAnalyser.fftSize = 1024; // Increased for better resolution
    const bufferLength = audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Update microphone status with success message
    micStatus.textContent = 'Mic: Active and working';
    micStatus.style.color = '#4caf50';
    
    // Create audio level meter
    createAudioMeter();
    
    // Create speech feedback container if it doesn't exist
    const feedbackContainer = document.querySelector('.tips-container');
    let speechFeedback = document.getElementById('speechFeedback');
    if (!speechFeedback && feedbackContainer) {
      speechFeedback = document.createElement('div');
      speechFeedback.id = 'speechFeedback';
      speechFeedback.className = 'feedback-container';
      speechFeedback.innerHTML = '<h3>Speech Analysis</h3><div class="feedback-content"></div>';
      feedbackContainer.appendChild(speechFeedback);
    }
    
    // Variables for real-time analysis
    let lastSpeechUpdate = Date.now();
    let lastAPIUpdate = Date.now();
    let currentTranscription = '';
    let silenceCounter = 0;
    let isSpeaking = false;
    
    // Periodically check audio levels and update real-time feedback
    function checkAudioLevel() {
      if (!audioAnalyser) return;
      
      // Get frequency data
      audioAnalyser.getByteFrequencyData(dataArray);
      
      // Use ML analysis if available
      let analysisResult = null;
      if (window.MLAnalysis && window.MLAnalysis.isInitialized) {
        analysisResult = window.MLAnalysis.analyzeAudio(dataArray, audioContext.sampleRate);
      }
      
      // Calculate average volume if ML analysis is not available
      let average = 0;
      if (!analysisResult) {
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        average = sum / bufferLength;
      } else {
        // Use ML analysis result
        average = analysisResult.volume * 255; // Convert 0-1 to 0-255 scale
        isSpeaking = !analysisResult.isSilent;
      }
      
      // Detect speech vs silence if not using ML
      if (!analysisResult) {
        if (average > 15) {
          isSpeaking = true;
          silenceCounter = 0;
        } else {
          silenceCounter++;
          if (silenceCounter > 20) { // About 1/3 second of silence
            isSpeaking = false;
          }
        }
      }
      
      // Update audio meter
      updateAudioMeter(average);
      
      // Update mic status based on volume
      if (average < 10) {
        micStatus.textContent = 'Mic: Low volume - speak up!';
        micStatus.style.color = '#ff9800';
      } else if (average > 200) {
        micStatus.textContent = 'Mic: Too loud!';
        micStatus.style.color = '#f44336';
      } else {
        micStatus.textContent = 'Mic: Good volume';
        micStatus.style.color = '#4caf50';
      }
      
      // Update real-time speech feedback (every 1.5 seconds)
      if (Date.now() - lastSpeechUpdate > 1500) {
        lastSpeechUpdate = Date.now();
        
        // Get pace score
        let paceScore = 3; // Default neutral score
        if (analysisResult) {
          paceScore = analysisResult.pace;
        } else {
          // Calculate from volume history if ML not available
          paceScore = calculateSpeakingPace();
        }
        
        // Update speech feedback if container exists
        if (speechFeedback) {
          const feedbackContent = speechFeedback.querySelector('.feedback-content');
          if (feedbackContent) {
            feedbackContent.innerHTML = `
              <div class="feedback-item">Volume: ${getVolumeRating(average)}</div>
              <div class="feedback-item">Pace: ${getPaceRating(paceScore)}</div>
              <div class="feedback-item">Speech: ${getSpeechActivityRating(isSpeaking, silenceCounter)}</div>
            `;
          }
        }
        
        // Get current transcription if available
        if (window.SpeechRecognitionService && window.SpeechRecognitionService.isSupported) {
          const transcription = window.SpeechRecognitionService.getTranscription().final;
          
          // If transcription has changed and is long enough, analyze it
          if (transcription && 
              transcription !== currentTranscription && 
              transcription.length > 20 &&
              CONFIG.ENABLE_REAL_TIME_ANALYSIS &&
              Date.now() - lastAPIUpdate > 5000) { // Limit to once every 5 seconds
            
            currentTranscription = transcription;
            lastAPIUpdate = Date.now();
            
            // Analyze text with ML
            if (window.MLAnalysis && window.MLAnalysis.isInitialized) {
              const textAnalysis = window.MLAnalysis.analyzeText(transcription);
              
              if (textAnalysis) {
                // Update speech feedback with text analysis
                updateTextAnalysisFeedback(textAnalysis);
              }
            }
            
            // Get current question
            const currentQuestion = currentQuestions[currentIndex];
            
            // Use Together API for real-time feedback if enabled
            if (!CONFIG.USE_MOCK_FOR_PARTIAL_ANALYSIS && window.TogetherAPI && window.TogetherAPI.isInitialized) {
              window.TogetherAPI.analyzePartialContent(currentQuestion, transcription)
                .then(analysis => {
                  if (analysis && analysis.feedback) {
                    // Update real-time feedback
                    updateAPIFeedback(analysis);
                  }
                })
                .catch(error => {
                  console.error('Error in real-time analysis:', error);
                });
            }
          }
        }
      }
      
      // Continue checking if analyser exists
      if (audioAnalyser) {
        requestAnimationFrame(checkAudioLevel);
      }
    }
    
    // Create audio level meter
    function createAudioMeter() {
      const meterContainer = document.createElement('div');
      meterContainer.id = 'audioMeterContainer';
      meterContainer.style.width = '100%';
      meterContainer.style.height = '20px';
      meterContainer.style.backgroundColor = '#eee';
      meterContainer.style.borderRadius = '10px';
      meterContainer.style.overflow = 'hidden';
      meterContainer.style.marginTop = '10px';
      meterContainer.style.marginBottom = '15px';
      
      const meterLevel = document.createElement('div');
      meterLevel.id = 'audioMeterLevel';
      meterLevel.style.height = '100%';
      meterLevel.style.width = '0%';
      meterLevel.style.backgroundColor = '#4caf50';
      meterLevel.style.transition = 'width 0.1s ease-in-out';
      
      meterContainer.appendChild(meterLevel);
      
      // Add after mic status
      if (micStatus && micStatus.parentNode) {
        micStatus.parentNode.insertBefore(meterContainer, micStatus.nextSibling);
      }
    }
    
    // Update audio meter
    function updateAudioMeter(level) {
      const meterLevel = document.getElementById('audioMeterLevel');
      if (meterLevel) {
        // Convert level to percentage (0-100)
        const percentage = Math.min(100, Math.max(0, level / 2));
        meterLevel.style.width = percentage + '%';
        
        // Change color based on level
        if (level < 10) {
          meterLevel.style.backgroundColor = '#ff9800'; // Low - orange
        } else if (level > 200) {
          meterLevel.style.backgroundColor = '#f44336'; // High - red
        } else {
          meterLevel.style.backgroundColor = '#4caf50'; // Good - green
        }
      }
    }
    
    // Update feedback with text analysis results
    function updateTextAnalysisFeedback(textAnalysis) {
      // Create or get the text analysis container
      let textFeedback = document.getElementById('textAnalysisFeedback');
      if (!textFeedback && feedbackContainer) {
        textFeedback = document.createElement('div');
        textFeedback.id = 'textAnalysisFeedback';
        textFeedback.className = 'feedback-container';
        textFeedback.innerHTML = '<h3>Content Analysis</h3><div class="feedback-content"></div>';
        feedbackContainer.appendChild(textFeedback);
      }
      
      if (!textFeedback) return;
      
      // Update the content
      const feedbackContent = textFeedback.querySelector('.feedback-content');
      if (feedbackContent) {
        // Format filler words
        let fillerWordText = '';
        if (textAnalysis.fillerWordRatio > 0.05) {
          fillerWordText = `<span class="feedback-warning">⚠️ High usage of filler words (${Math.round(textAnalysis.fillerWordRatio * 100)}%)</span>`;
        } else {
          fillerWordText = `<span class="feedback-positive">✓ Good control of filler words</span>`;
        }
        
        // Format sentence structure
        let sentenceText = '';
        if (textAnalysis.avgWordsPerSentence > 25) {
          sentenceText = `<span class="feedback-warning">⚠️ Sentences are too long (avg ${Math.round(textAnalysis.avgWordsPerSentence)} words)</span>`;
        } else if (textAnalysis.avgWordsPerSentence < 5) {
          sentenceText = `<span class="feedback-warning">⚠️ Sentences are very short</span>`;
        } else {
          sentenceText = `<span class="feedback-positive">✓ Good sentence structure</span>`;
        }
        
        feedbackContent.innerHTML = `
          <div class="feedback-item">Words: ${textAnalysis.wordCount}</div>
          <div class="feedback-item">Sentences: ${textAnalysis.sentenceCount}</div>
          <div class="feedback-item">Filler words: ${fillerWordText}</div>
          <div class="feedback-item">Structure: ${sentenceText}</div>
        `;
      }
    }
    
    // Update feedback with API analysis results
    function updateAPIFeedback(analysis) {
      // Create or get the API feedback container
      let apiFeedback = document.getElementById('apiFeedback');
      if (!apiFeedback && feedbackContainer) {
        apiFeedback = document.createElement('div');
        apiFeedback.id = 'apiFeedback';
        apiFeedback.className = 'feedback-container';
        apiFeedback.innerHTML = '<h3>AI Feedback</h3><div class="feedback-content"></div>';
        feedbackContainer.appendChild(apiFeedback);
      }
      
      if (!apiFeedback) return;
      
      // Update the content
      const feedbackContent = apiFeedback.querySelector('.feedback-content');
      if (feedbackContent) {
        // Format relevance score
        let relevanceText = '';
        if (analysis.relevance <= 2) {
          relevanceText = `<span class="feedback-warning">⚠️ Low relevance to question (${analysis.relevance}/5)</span>`;
        } else if (analysis.relevance >= 4) {
          relevanceText = `<span class="feedback-positive">✓ Highly relevant to question (${analysis.relevance}/5)</span>`;
        } else {
          relevanceText = `<span class="feedback-neutral">Somewhat relevant (${analysis.relevance}/5)</span>`;
        }
        
        // Format missing keywords
        let keywordsText = '';
        if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
          keywordsText = `<span class="feedback-warning">⚠️ Consider including: ${analysis.missingKeywords.join(', ')}</span>`;
        } else {
          keywordsText = `<span class="feedback-positive">✓ Good keyword coverage</span>`;
        }
        
        feedbackContent.innerHTML = `
          <div class="feedback-item">Relevance: ${relevanceText}</div>
          <div class="feedback-item">Keywords: ${keywordsText}</div>
          <div class="feedback-item">Suggestion: ${analysis.suggestions || 'None'}</div>
        `;
      }
    }
    
    // Helper function to calculate speaking pace
    function calculateSpeakingPace() {
      // Get volume history from ML analysis if available
      if (window.MLAnalysis && window.MLAnalysis.speechData.volumeHistory.length > 0) {
        const volumeHistory = window.MLAnalysis.speechData.volumeHistory;
        
        let variations = 0;
        for (let i = 1; i < volumeHistory.length; i++) {
          variations += Math.abs(volumeHistory[i] - volumeHistory[i-1]);
        }
        
        const avgVariation = variations / (volumeHistory.length - 1);
        // Convert to a 1-5 scale where 3 is optimal
        return Math.min(5, Math.max(1, 3 + (avgVariation * 10)));
      }
      
      // Default neutral score if no data available
      return 3;
    }
    
    // Helper functions for ratings
    function getVolumeRating(volume) {
      if (volume < 10) return '<span class="feedback-warning">⚠️ Too quiet - speak up</span>';
      if (volume > 200) return '<span class="feedback-warning">⚠️ Too loud - lower your voice</span>';
      return '<span class="feedback-positive">✓ Good level</span>';
    }
    
    function getPaceRating(score) {
      if (score < 2) return '<span class="feedback-warning">⚠️ Too slow</span>';
      if (score > 4) return '<span class="feedback-warning">⚠️ Too fast - slow down</span>';
      return '<span class="feedback-positive">✓ Good pace</span>';
    }
    
    function getSpeechActivityRating(isSpeaking, silenceCounter) {
      if (!isSpeaking && silenceCounter > 60) { // No speech for 1 second
        return '<span class="feedback-warning">⚠️ Long pause detected</span>';
      } else if (isSpeaking) {
        return '<span class="feedback-positive">✓ Speaking clearly</span>';
      } else {
        return '<span class="feedback-neutral">Brief pause</span>';
      }
    }
    
    // Start the audio analysis
    checkAudioLevel();
    
    // Set up video analysis for body language
    setupVideoAnalysis(stream);
    
    console.log('Enhanced audio analysis setup complete');
    
  } catch (error) {
    console.error('Audio analysis setup failed:', error);
    micStatus.textContent = 'Mic: Analysis unavailable - ' + error.message;
    micStatus.style.color = '#f44336';
  }
}

// Set up video analysis for body language feedback
function setupVideoAnalysis(stream) {
  // Create body feedback container if it doesn't exist
  const feedbackContainer = document.querySelector('.tips-container');
  let bodyFeedback = document.getElementById('bodyFeedback');
  
  if (!bodyFeedback && feedbackContainer) {
    bodyFeedback = document.createElement('div');
    bodyFeedback.id = 'bodyFeedback';
    bodyFeedback.className = 'feedback-container';
    bodyFeedback.innerHTML = '<h3>Body Language Analysis</h3><div class="feedback-content"></div>';
    feedbackContainer.appendChild(bodyFeedback);
  }
  
  if (!bodyFeedback) return;
  
  // Check if ML analysis is available
  const useMLAnalysis = window.MLAnalysis && window.MLAnalysis.isInitialized;
  console.log(`Using ML Analysis for video: ${useMLAnalysis ? 'Yes' : 'No'}`);
  
  // Set up video processing
  const videoProcessor = {
    lastUpdate: Date.now(),
    frameCount: 0,
    faceDetected: false,
    eyeContactScore: 3,
    postureScore: 3,
    fidgetingLevel: 2,
    movementHistory: [],
    brightnessHistory: [],
    
    // Process video frames
    processFrame: function(video) {
      this.frameCount++;
      
      // Only analyze every 5th frame for performance
      if (this.frameCount % 5 !== 0) {
        return;
      }
      
      try {
        // Check if video is playing
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          return;
        }
        
        // Use ML analysis if available
        if (useMLAnalysis) {
          const mlResult = window.MLAnalysis.analyzeVideoFrame(video);
          
          if (mlResult) {
            // Update state with ML analysis results
            this.faceDetected = mlResult.faceDetected;
            this.eyeContactScore = mlResult.eyeContactScore;
            this.fidgetingLevel = mlResult.movementLevel;
            
            // Store brightness for lighting analysis
            if (this.brightnessHistory.length >= 20) {
              this.brightnessHistory.shift();
            }
            this.brightnessHistory.push(mlResult.brightness);
            
            return;
          }
        }
        
        // Fall back to basic analysis if ML is not available or failed
        // Create canvas for analysis if needed
        if (!this.canvas) {
          this.canvas = document.createElement('canvas');
          this.ctx = this.canvas.getContext('2d');
        }
        
        // Set canvas size to match video
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Get image data for analysis
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Calculate brightness
        let brightness = 0;
        let pixelCount = 0;
        
        // Sample pixels (every 40th pixel for performance)
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate perceived brightness
          // Using the formula: (0.299*R + 0.587*G + 0.114*B)
          brightness += (0.299 * r + 0.587 * g + 0.114 * b);
          pixelCount++;
        }
        
        // Average brightness (0-255)
        brightness = brightness / pixelCount;
        
        // Store brightness history
        this.brightnessHistory.push(brightness);
        if (this.brightnessHistory.length > 20) {
          this.brightnessHistory.shift();
        }
        
        // Detect significant changes in brightness (movement)
        if (this.brightnessHistory.length > 1) {
          const lastBrightness = this.brightnessHistory[this.brightnessHistory.length - 2];
          const brightnessDiff = Math.abs(brightness - lastBrightness);
          
          // Store movement data
          this.movementHistory.push(brightnessDiff);
          if (this.movementHistory.length > 30) {
            this.movementHistory.shift();
          }
          
          // Calculate average movement
          const avgMovement = this.movementHistory.reduce((sum, val) => sum + val, 0) / this.movementHistory.length;
          
          // Update fidgeting level based on movement
          this.fidgetingLevel = this.calculateFidgetingLevel(avgMovement);
        }
        
        // Simulate face detection based on brightness patterns
        this.faceDetected = brightness > 30; // Basic check for a reasonably lit face
        
        // Update scores based on analysis
        if (this.faceDetected) {
          // Gradually improve eye contact score when face is detected
          this.eyeContactScore = Math.min(5, this.eyeContactScore + 0.1);
        } else {
          // Gradually decrease eye contact score when face is not detected
          this.eyeContactScore = Math.max(1, this.eyeContactScore - 0.2);
        }
        
        // Simulate posture analysis
        this.postureScore = Math.max(1, Math.min(5, this.postureScore + (Math.random() * 0.2 - 0.1)));
        
      } catch (error) {
        console.error('Error in video frame processing:', error);
      }
    },
    
    // Calculate fidgeting level from movement data
    calculateFidgetingLevel: function(avgMovement) {
      // Convert movement to a 1-5 scale
      if (avgMovement < 1) return 1; // Very still
      if (avgMovement < 3) return 2; // Minimal movement
      if (avgMovement < 6) return 3; // Natural movement
      if (avgMovement < 10) return 4; // Some fidgeting
      return 5; // Excessive movement
    },
    
    // Update the feedback display
    updateFeedback: function() {
      // Only update every 2 seconds to avoid too much flickering
      if (Date.now() - this.lastUpdate < 2000) {
        return;
      }
      
      this.lastUpdate = Date.now();
      
      // Get the feedback content container
      const feedbackContent = bodyFeedback.querySelector('.feedback-content');
      if (!feedbackContent) return;
      
      // Get comprehensive analysis if ML is available
      let comprehensiveAnalysis = null;
      if (useMLAnalysis) {
        comprehensiveAnalysis = window.MLAnalysis.getComprehensiveAnalysis();
      }
      
      // Use ML data if available, otherwise use our basic analysis
      const faceDetected = comprehensiveAnalysis ? 
        (comprehensiveAnalysis.video.eyeContact > 2) : this.faceDetected;
      
      const eyeContactScore = comprehensiveAnalysis ? 
        comprehensiveAnalysis.video.eyeContact : this.eyeContactScore;
      
      const postureScore = comprehensiveAnalysis ? 
        comprehensiveAnalysis.video.posture : this.postureScore;
      
      const movementLevel = comprehensiveAnalysis ? 
        comprehensiveAnalysis.video.movement : this.fidgetingLevel;
      
      // Update the feedback
      feedbackContent.innerHTML = `
        <div class="feedback-item">Face detection: ${faceDetected ? 
          '<span class="feedback-positive">✓ Face detected</span>' : 
          '<span class="feedback-warning">⚠️ Face not clearly visible</span>'}</div>
        <div class="feedback-item">Eye contact: ${this.getEyeContactRating(eyeContactScore)}</div>
        <div class="feedback-item">Posture: ${this.getPostureRating(postureScore)}</div>
        <div class="feedback-item">Movement: ${this.getFidgetingRating(movementLevel)}</div>
        <div class="feedback-item">Lighting: ${this.getLightingRating()}</div>
      `;
      
      // Add Together.ai API integration for real-time feedback if enabled
      if (CONFIG.ENABLE_REAL_TIME_ANALYSIS && 
          !CONFIG.USE_MOCK_FOR_PARTIAL_ANALYSIS && 
          window.TogetherAPI && 
          window.TogetherAPI.isInitialized) {
        
        // Add a body language feedback section that updates periodically
        if (this.frameCount % 150 === 0) { // Every ~5 seconds at 30fps
          this.updateBodyLanguageAPIFeedback();
        }
      }
    },
    
    // Get API feedback on body language
    updateBodyLanguageAPIFeedback: function() {
      // Only proceed if we have a transcription
      if (!recordingTranscription || recordingTranscription.length < 10) return;
      
      // Create or get the API body language feedback container
      let apiBodyFeedback = document.getElementById('apiBodyFeedback');
      if (!apiBodyFeedback && feedbackContainer) {
        apiBodyFeedback = document.createElement('div');
        apiBodyFeedback.id = 'apiBodyFeedback';
        apiBodyFeedback.className = 'feedback-container';
        apiBodyFeedback.innerHTML = '<h3>AI Body Language Tips</h3><div class="feedback-content"></div>';
        feedbackContainer.appendChild(apiBodyFeedback);
      }
      
      if (!apiBodyFeedback) return;
      
      // Get current question
      const currentQuestion = currentQuestions[currentIndex];
      
      // Create a prompt for body language feedback
      const prompt = `
You are an expert interview coach specializing in non-verbal communication.
Based on the following metrics from a video interview, provide brief, specific feedback on body language:

Question: "${currentQuestion}"
Eye contact score: ${this.eyeContactScore}/5
Posture score: ${this.postureScore}/5
Movement level: ${this.fidgetingLevel}/5
Face visibility: ${this.faceDetected ? 'Good' : 'Poor'}

Provide ONE specific, actionable tip to improve body language for this interview question.
Keep your response under 100 characters. Be specific and practical.
`;
      
      // Call the Together API
      window.TogetherAPI.makeRequest(prompt, {
        temperature: 0.3,
        max_tokens: 100
      })
      .then(feedback => {
        // Update the feedback container
        const feedbackContent = apiBodyFeedback.querySelector('.feedback-content');
        if (feedbackContent) {
          feedbackContent.innerHTML = `
            <div class="feedback-item"><span class="feedback-tip">💡 ${feedback.trim()}</span></div>
          `;
        }
      })
      .catch(error => {
        console.error('Error getting body language API feedback:', error);
      });
    },
    
    // Helper functions for body language ratings
    getEyeContactRating: function(score) {
      if (score < 2) return '<span class="feedback-warning">⚠️ Look at the camera more</span>';
      if (score > 4) return '<span class="feedback-positive">✓ Excellent eye contact</span>';
      return '<span class="feedback-positive">✓ Good eye contact</span>';
    },
    
    getPostureRating: function(score) {
      if (score < 2) return '<span class="feedback-warning">⚠️ Improve posture - sit up straight</span>';
      if (score > 4) return '<span class="feedback-positive">✓ Excellent posture</span>';
      return '<span class="feedback-positive">✓ Good posture</span>';
    },
    
    getFidgetingRating: function(level) {
      if (level > 3) return '<span class="feedback-warning">⚠️ Reduce fidgeting</span>';
      if (level < 2) return '<span class="feedback-warning">⚠️ Try to appear more natural</span>';
      return '<span class="feedback-positive">✓ Natural movement</span>';
    },
    
    getLightingRating: function() {
      if (this.brightnessHistory.length === 0) return '<span class="feedback-neutral">Analyzing...</span>';
      
      const avgBrightness = this.brightnessHistory.reduce((sum, val) => sum + val, 0) / this.brightnessHistory.length;
      
      if (avgBrightness < 40) return '<span class="feedback-warning">⚠️ Too dark - improve lighting</span>';
      if (avgBrightness > 200) return '<span class="feedback-warning">⚠️ Too bright - reduce lighting</span>';
      return '<span class="feedback-positive">✓ Good lighting</span>';
    }
  };
  
  // Process video frames and update feedback
  function analyzeVideo() {
    if (!webcamVideo || !localStream) return;
    
    // Process the current frame
    videoProcessor.processFrame(webcamVideo);
    
    // Update the feedback display
    videoProcessor.updateFeedback();
    
    // Continue analyzing if stream is active
    if (localStream) {
      requestAnimationFrame(analyzeVideo);
    }
  }
  
  // Start video analysis
  console.log('Starting enhanced video analysis');
  analyzeVideo();
}

// Stop recording handler
stopRecordingBtn.addEventListener('click', () => {
  console.log('Stop recording button clicked');
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    console.log('Stopping media recorder, current state:', mediaRecorder.state);
    mediaRecorder.stop();
  } else {
    console.warn('MediaRecorder not available or already inactive');
    if (mediaRecorder) {
      console.log('MediaRecorder state:', mediaRecorder.state);
    }
  }
  
  // Stop speech recognition if it's running
  if (window.SpeechRecognitionService && window.SpeechRecognitionService.isSupported) {
    console.log('Stopping speech recognition service');
    window.SpeechRecognitionService.stopListening();
  }
  
  startRecordingBtn.disabled = false;
  stopRecordingBtn.disabled = true;
});

// Update UI when answer mode changes
answerModeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    // Update active class for styling
    document.querySelectorAll('.mode-option').forEach(option => {
      option.classList.remove('active');
    });
    e.target.closest('.mode-option').classList.add('active');
    
    // Update the UI based on the selected mode
    updateAnswerMode();
  });
});

// Initialize the UI mode on load
document.addEventListener('DOMContentLoaded', () => {
  updateAnswerMode();
});

// Handle career selection change
careerSelect.addEventListener('change', () => {
  const career = careerSelect.value;
  if (!career) return;
  
  // Reset the interview state
  feedbackBox.textContent = '';
  answerInput.value = '';
  recordedVideo.style.display = 'none';
  nextBtn.disabled = true;
  submitBtn.disabled = false;
  currentIndex = 0;
  userAnswers = [];
  
  // Show loading state
  questionBox.textContent = 'Generating questions...';
  
  // Generate questions using AI
  generateQuestionsWithAI(career)
    .then(questions => {
      if (questions && questions.length > 0) {
        currentQuestions = questions;
        questionBox.textContent = currentQuestions[currentIndex];
        updateProgressIndicator();
        interviewInProgress = true;
      } else {
        questionBox.textContent = 'Failed to generate questions. Please try again.';
        submitBtn.disabled = true;
      }
    })
    .catch(error => {
      console.error('Error generating questions:', error);
      questionBox.textContent = 'Error generating questions. Please try again.';
      submitBtn.disabled = true;
    });
});

// Generate interview questions using AI
async function generateQuestionsWithAI(career) {
  return new Promise((resolve, reject) => {
    try {
      // Show loading state
      questionBox.textContent = 'Generating questions for your interview...';
      
      // Check which API provider to use
      const apiProvider = typeof CONFIG !== 'undefined' && CONFIG.API_PROVIDER 
        ? CONFIG.API_PROVIDER 
        : 'gemini';
      
      // Use Together API if specified
      if (apiProvider === 'together' && window.TogetherAPI && window.TogetherAPI.isInitialized) {
        console.log('Using Together API for question generation');
        window.TogetherAPI.generateInterviewQuestions(career, QUESTIONS_PER_INTERVIEW)
          .then(resolve)
          .catch(error => {
            console.error('Error generating questions with Together API:', error);
            fallbackToMockAPI();
          });
      }
      // Check if direct Gemini API is available
      else if (window.GeminiDirectAPI && window.GeminiDirectAPI.isInitialized) {
        // Use the streaming API for real-time updates
        window.GeminiDirectAPI.generateInterviewQuestions(
          career,
          QUESTIONS_PER_INTERVIEW,
          (progressText) => {
            // Update the question box with progress
            questionBox.textContent = 'Generating questions: ' + 
              (progressText.length > 100 ? progressText.substring(0, 100) + '...' : progressText);
          },
          (questions) => {
            // Success callback
            resolve(questions);
          },
          (error) => {
            // Error callback
            console.error('Error generating questions with Gemini API:', error);
            fallbackToMockAPI();
          }
        );
      } else if (window.InterVUAPI && window.InterVUAPI.generateInterviewQuestions) {
        // Fall back to mock implementation
        window.InterVUAPI.generateInterviewQuestions(career, QUESTIONS_PER_INTERVIEW)
          .then(resolve)
          .catch(error => {
            console.error('Error generating questions with mock API:', error);
            fallbackToGenericQuestions();
          });
      } else {
        // No API available, use generic questions
        fallbackToGenericQuestions();
      }
      
      // Fallback to mock API
      function fallbackToMockAPI() {
        if (window.InterVUAPI && window.InterVUAPI.generateInterviewQuestions) {
          window.InterVUAPI.generateInterviewQuestions(career, QUESTIONS_PER_INTERVIEW)
            .then(resolve)
            .catch(error => {
              console.error('Error generating questions with mock API:', error);
              fallbackToGenericQuestions();
            });
        } else {
          fallbackToGenericQuestions();
        }
      }
      
      // Fallback to generic questions
      function fallbackToGenericQuestions() {
        console.warn('No API available, using generic questions');
        setTimeout(() => {
          resolve([
            `What skills and qualifications do you have that make you suitable for a ${career} role?`,
            `Describe your most relevant experience for a ${career} position.`,
            `What challenges do you anticipate in a ${career} role?`,
            `How do you stay updated with the latest trends in the ${career} field?`,
            `Describe a situation where you demonstrated key skills needed for a ${career}.`,
            `What tools or technologies are you proficient in that relate to ${career}?`,
            `How would you handle a difficult client or stakeholder as a ${career}?`,
            `What's your approach to problem-solving in a ${career} context?`,
            `Where do you see the ${career} field evolving in the next 5 years?`,
            `What makes you passionate about pursuing a career as a ${career}?`
          ]);
        }, 1500);
      }
    } catch (error) {
      console.error('Error in generateQuestionsWithAI:', error);
      reject(error);
    }
  });
}

// Submit answer handler
submitBtn.addEventListener('click', () => {
  if (!interviewInProgress) return;
  
  const mode = Array.from(answerModeRadios).find(r => r.checked).value;
  let userAnswer = '';

  if (mode === 'text') {
    userAnswer = answerInput.value.trim();
    if (!userAnswer) {
      alert('Please type your answer before submitting.');
      return;
    }
  } else {
    // Video mode
    console.log('Submitting video answer');
    console.log('Recorded video display:', recordedVideo.style.display);
    console.log('Transcription available:', !!recordingTranscription);
    
    if (recordedVideo.style.display === 'none') {
      alert('Please record your answer before submitting.');
      return;
    }
    
    // Use the transcription if available, otherwise use a placeholder
    userAnswer = recordingTranscription || 'Video answer submitted.';
    console.log('Using answer text:', userAnswer);
  }

  // Store the user's answer
  userAnswers.push({
    question: currentQuestions[currentIndex],
    answer: userAnswer,
    mode: mode,
    transcription: mode === 'record' ? recordingTranscription : null
  });

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  feedbackBox.textContent = 'Analyzing your answer...';

  // Generate feedback using AI
  console.log('Calling analyzeAnswerWithAI with mode:', mode);
  
  // Add debug info to the feedback box
  feedbackBox.innerHTML = `
    <div class="loading-message">
      <p>Analyzing your ${mode === 'text' ? 'text' : 'video'} answer...</p>
      <div class="progress-indicator"></div>
    </div>
  `;
  
  analyzeAnswerWithAI(currentQuestions[currentIndex], userAnswer, mode)
    .then(feedback => {
      console.log('Analysis complete, feedback length:', feedback.length);
      feedbackBox.innerHTML = `<div class="analysis-content">${feedback}</div>`;
      nextBtn.disabled = false;
      
      // Reset the transcription for the next question
      recordingTranscription = '';
    })
    .catch(error => {
      console.error('Error analyzing answer:', error);
      feedbackBox.innerHTML = `
        <div class="error-message">
          <h3>⚠️ Analysis Error</h3>
          <p>There was an error analyzing your answer: ${error.message || 'Unknown error'}</p>
        </div>
      `;
      nextBtn.disabled = false;
    });
});

// Analyze answer using AI
async function analyzeAnswerWithAI(question, answer, mode) {
  return new Promise((resolve, reject) => {
    try {
      // Show loading state
      feedbackBox.textContent = 'Analyzing your answer...';
      
      // Validate input
      if (mode === 'text' && (!answer || answer.trim().length === 0)) {
        feedbackBox.innerHTML = `
          <div class="error-message">
            <h3>⚠️ Empty Answer</h3>
            <p>You didn't provide any answer to analyze. Please type your answer and try again.</p>
          </div>
        `;
        reject(new Error("Empty answer"));
        return;
      }
      
      if (mode === 'record' && (!recordingTranscription || recordingTranscription.trim().length === 0)) {
        feedbackBox.innerHTML = `
          <div class="error-message">
            <h3>⚠️ No Speech Detected</h3>
            <p>No speech was detected in your recording. Please record your answer again, speaking clearly into your microphone.</p>
          </div>
        `;
        reject(new Error("No speech detected"));
        return;
      }
      
      // Check which API provider to use
      const apiProvider = typeof CONFIG !== 'undefined' && CONFIG.API_PROVIDER 
        ? CONFIG.API_PROVIDER 
        : 'gemini';
      
      // Use Together API if specified
      if (apiProvider === 'together' && window.TogetherAPI && window.TogetherAPI.isInitialized) {
        console.log('Using Together API for answer analysis');
        
        if (mode === 'record') {
          // For video answers, use the transcription if available
          const transcription = recordingTranscription || "Video answer submitted without transcription.";
          const duration = mediaRecorder && mediaRecorder.startTime ? 
            Math.round((Date.now() - mediaRecorder.startTime) / 1000) : 60;
          
          feedbackBox.innerHTML = `
            <div class="loading-message">
              <p>Analyzing your answer with Together AI...</p>
              <div class="progress-indicator"></div>
            </div>
          `;
          
          window.TogetherAPI.analyzeVideoAnswer(question, transcription, duration)
            .then(analysis => {
              feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
              resolve(analysis);
            })
            .catch(error => {
              console.error('Error analyzing video answer with Together API:', error);
              feedbackBox.innerHTML = `
                <div class="error-message">
                  <h3>⚠️ Analysis Error</h3>
                  <p>There was an error analyzing your answer: ${error.message}</p>
                  <p>Falling back to alternative analysis...</p>
                </div>
              `;
              fallbackToMockAPI();
            });
        } else {
          // For text answers
          feedbackBox.innerHTML = `
            <div class="loading-message">
              <p>Analyzing your answer with Together AI...</p>
              <div class="progress-indicator"></div>
            </div>
          `;
          
          window.TogetherAPI.analyzeTextAnswer(question, answer)
            .then(analysis => {
              feedbackBox.innerHTML = `<div class="analysis-content">${analysis}</div>`;
              resolve(analysis);
            })
            .catch(error => {
              console.error('Error analyzing text answer with Together API:', error);
              feedbackBox.innerHTML = `
                <div class="error-message">
                  <h3>⚠️ Analysis Error</h3>
                  <p>There was an error analyzing your answer: ${error.message}</p>
                  <p>Falling back to alternative analysis...</p>
                </div>
              `;
              fallbackToMockAPI();
            });
        }
      }
      // Check if direct Gemini API is available
      else if (window.GeminiDirectAPI && window.GeminiDirectAPI.isInitialized) {
        if (mode === 'record') {
          // For video answers, use the transcription if available
          const transcription = recordingTranscription || "Video answer submitted without transcription.";
          const duration = mediaRecorder && mediaRecorder.startTime ? 
            Math.round((Date.now() - mediaRecorder.startTime) / 1000) : 60;
          
          // Use the streaming API for real-time updates
          window.GeminiDirectAPI.analyzeVideoAnswer(
            question,
            transcription,
            duration,
            (chunk, fullText) => {
              // Update the feedback box with progress
              feedbackBox.innerHTML = `
                <div class="loading-message">
                  <p>Analyzing your answer...</p>
                  <div class="progress-indicator"></div>
                </div>
                <div class="analysis-content">${fullText}</div>
              `;
            },
            (fullAnalysis) => {
              // Success callback
              resolve(fullAnalysis);
            },
            (error) => {
              // Error callback
              console.error('Error analyzing video answer with Gemini API:', error);
              feedbackBox.innerHTML = `
                <div class="error-message">
                  <h3>⚠️ Analysis Error</h3>
                  <p>There was an error analyzing your answer: ${error.message}</p>
                  <p>Falling back to alternative analysis...</p>
                </div>
              `;
              fallbackToMockAPI();
            }
          );
        } else {
          // For text answers
          window.GeminiDirectAPI.analyzeTextAnswer(
            question,
            answer,
            (chunk, fullText) => {
              // Update the feedback box with progress
              feedbackBox.innerHTML = `
                <div class="loading-message">
                  <p>Analyzing your answer...</p>
                  <div class="progress-indicator"></div>
                </div>
                <div class="analysis-content">${fullText}</div>
              `;
            },
            (fullAnalysis) => {
              // Success callback
              resolve(fullAnalysis);
            },
            (error) => {
              // Error callback
              console.error('Error analyzing text answer with Gemini API:', error);
              feedbackBox.innerHTML = `
                <div class="error-message">
                  <h3>⚠️ Analysis Error</h3>
                  <p>There was an error analyzing your answer: ${error.message}</p>
                  <p>Falling back to alternative analysis...</p>
                </div>
              `;
              fallbackToMockAPI();
            }
          );
        }
      } else if (window.InterVUAPI) {
        // Fall back to mock implementation
        feedbackBox.innerHTML += `
          <div class="warning-message">
            <p>⚠️ Gemini API not available. Using mock analysis instead.</p>
          </div>
        `;
        fallbackToMockAPI();
      } else {
        // No API available, use generic feedback
        feedbackBox.innerHTML += `
          <div class="warning-message">
            <p>⚠️ No API available. Using generic feedback instead.</p>
          </div>
        `;
        fallbackToGenericFeedback();
      }
      
      // Fallback to error message
      function fallbackToMockAPI() {
        // Instead of using mock feedback, just show an error message and let the user try again
        feedbackBox.innerHTML = `
          <div class="error-message">
            <h3>⚠️ Analysis Error</h3>
            <p>There was an error analyzing your answer. Please try again or try a different answer.</p>
            <p>If the problem persists, please check your internet connection or try again later.</p>
          </div>
        `;
        
        // Enable the next button so the user can continue
        nextBtn.disabled = false;
        
        // Reject the promise to indicate an error
        reject(new Error("API analysis failed"));
      }
      
      // Fallback to error message (same as above)
      function fallbackToGenericFeedback() {
        // Instead of using generic feedback, just show an error message
        feedbackBox.innerHTML = `
          <div class="error-message">
            <h3>⚠️ Analysis Error</h3>
            <p>There was an error analyzing your answer. Please try again or try a different answer.</p>
            <p>If the problem persists, please check your internet connection or try again later.</p>
          </div>
        `;
        
        // Enable the next button so the user can continue
        nextBtn.disabled = false;
        
        // Reject the promise to indicate an error
        reject(new Error("API analysis failed"));
      }
    } catch (error) {
      console.error('Error in analyzeAnswerWithAI:', error);
      feedbackBox.innerHTML = `
        <div class="error-message">
          <h3>⚠️ Analysis Error</h3>
          <p>There was an unexpected error: ${error.message}</p>
        </div>
      `;
      reject(error);
    }
  });
}

// Next question handler
nextBtn.addEventListener('click', () => {
  if (!interviewInProgress) return;
  
  // Add a smooth transition effect
  questionBox.style.opacity = '0';
  feedbackBox.style.opacity = '0';
  
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
      // Update question
      questionBox.textContent = currentQuestions[currentIndex];
      
      // Clear feedback and answers
      feedbackBox.innerHTML = '<p>Please provide your answer to this question.</p>';
      answerInput.value = '';
      recordedVideo.style.display = 'none';
      
      // Reset transcription
      recordingTranscription = '';
      
      // Remove transcription display if it exists
      const transcriptionContainer = document.getElementById('transcriptionContainer');
      if (transcriptionContainer) {
        transcriptionContainer.remove();
      }
      
      // Real-time analysis has been removed
      
      // Reset buttons
      submitBtn.disabled = false;
      nextBtn.disabled = true;
      
      // Reset recording buttons
      startRecordingBtn.disabled = false;
      stopRecordingBtn.disabled = true;
      
      // Update progress
      updateProgressIndicator();
      
      // Focus on the answer input if in text mode
      if (Array.from(answerModeRadios).find(r => r.checked).value === 'text') {
        setTimeout(() => answerInput.focus(), 100);
      }
    } else {
      // End of interview
      questionBox.textContent = 'Interview complete! Thank you for participating.';
      feedbackBox.innerHTML = '<h3>Interview Complete</h3><p>Thank you for completing the interview. You can now review your answers and feedback.</p>';
      submitBtn.disabled = true;
      nextBtn.disabled = true;
      interviewInProgress = false;
    }
    
    // Fade back in
    questionBox.style.opacity = '1';
    feedbackBox.style.opacity = '1';
  }, 300); // Short delay for transition effect
});

// Update progress indicator
function updateProgressIndicator() {
  if (progressIndicator) {
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    progressIndicator.style.width = `${progress}%`;
  }
  
  if (questionCounter) {
    questionCounter.textContent = `Question ${currentIndex + 1}/${currentQuestions.length}`;
  }
}

// Generate overall feedback at the end of the interview
function generateOverallFeedback() {
  // In a real implementation, this would analyze all answers together
  // For now, we'll provide a generic summary
  
  const textAnswers = userAnswers.filter(a => a.mode === 'text').length;
  const videoAnswers = userAnswers.filter(a => a.mode === 'record').length;
  
  return `
Interview Summary:
You completed ${userAnswers.length} questions (${textAnswers} text, ${videoAnswers} video).

Overall Strengths:
✓ You provided complete answers to most questions
✓ Your responses were generally well-structured
✓ You demonstrated good knowledge in your field

Areas for Improvement:
⚠️ Consider providing more specific examples in your answers
⚠️ Some technical questions could benefit from more depth

Next Steps:
1. Review the feedback for each question
2. Practice answering similar questions with more specific examples
3. Consider recording yourself to further improve your delivery

Thank you for using InterVU for your interview practice!`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Set initial state
  questionBox.textContent = 'Please select a career to begin the interview.';
  updateAnswerMode();
});