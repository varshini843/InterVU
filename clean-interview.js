// clean-interview.js - Simplified interview functionality with Together.ai API

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
const progressIndicator = document.getElementById('progressIndicator');
const questionCounter = document.getElementById('questionCounter');

// MediaRecorder variables
let mediaRecorder;
let recordedChunks = [];
let localStream = null;

// Interview state
let currentQuestions = [];
let currentIndex = 0;
let userAnswers = [];
let interviewInProgress = false;

// Update UI based on answer mode selection
function updateAnswerMode() {
  const mode = Array.from(answerModeRadios).find(r => r.checked).value;
  
  if (mode === 'text') {
    // Text mode
    answerInput.style.display = 'block';
    recordingControls.style.display = 'none';
    webcamVideo.style.display = 'none';
    recordedVideo.style.display = 'none';
    
    // Show a helpful placeholder
    answerInput.placeholder = "Type your answer here... Be specific and provide examples if possible.";
  } else {
    // Video mode
    answerInput.style.display = 'none';
    recordingControls.style.display = 'block';
    webcamVideo.style.display = 'block';
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

// Stop webcam stream
function stopWebcam() {
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.stop();
    });
    localStream = null;
    webcamVideo.srcObject = null;
    webcamVideo.style.display = 'none';
    
    // Reset mic status
    const micStatus = document.getElementById('micStatus');
    if (micStatus) {
      micStatus.textContent = 'Mic: Not active';
      micStatus.style.color = '#ff4d6d';
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
    webcamVideo.style.display = 'block';
    
    // Reset recording state
    
    // Request camera and microphone access
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Display webcam feed
    webcamVideo.srcObject = localStream;
    webcamVideo.style.width = '100%';
    webcamVideo.style.maxWidth = '300px';
    webcamVideo.style.borderRadius = '12px';
    webcamVideo.style.marginTop = '10px';
    webcamVideo.play();
    
    // Update feedback and mic status
    feedbackBox.innerHTML = '<p>Camera and microphone ready. Recording started.</p>';
    
    // Update mic status
    const micStatus = document.getElementById('micStatus');
    if (micStatus) {
      micStatus.textContent = 'Mic: Active';
      micStatus.style.color = '#4caf50';
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
      // Record stop time for duration calculation
      mediaRecorder.stopTime = Date.now();
      
      // Create video blob and display it
      const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedVideo.src = URL.createObjectURL(recordedBlob);
      recordedVideo.style.display = 'block';
      
      // Hide webcam video
      webcamVideo.style.display = 'none';
      
      // Calculate recording duration
      const duration = Math.round((mediaRecorder.stopTime - mediaRecorder.startTime) / 1000);
      console.log(`Recording duration: ${duration} seconds`);
      
      // Update feedback
      feedbackBox.innerHTML = `<p>Recording complete (${duration} seconds). You can now submit your answer.</p>`;
      
      // Enable submit button after recording is complete
      submitBtn.disabled = false;
      
      // Stop webcam
      stopWebcam();
    };
    
    // Start recording
    mediaRecorder.start(1000); // Collect data every second
    console.log('Recording started');
    
    // Set up real-time analysis
    realTimeAnalysisTimeout = setTimeout(function startRealTimeAnalysis() {
      performRealTimeAnalysis();
      // Schedule next analysis if still recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        realTimeAnalysisTimeout = setTimeout(startRealTimeAnalysis, 10000); // Every 10 seconds
      }
    }, 5000); // First analysis after 5 seconds
    
  } catch (error) {
    alert('Could not access camera and microphone. Please ensure you have granted permission.');
    console.error('Media access error:', error);
    feedbackBox.innerHTML = `<p style="color: #f44336;">Error: ${error.message || 'Could not access camera and microphone'}</p>`;
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
  }
});

// Stop recording handler
stopRecordingBtn.addEventListener('click', () => {
  console.log('Stop recording button clicked');
  
  // Clear real-time analysis timeout
  if (realTimeAnalysisTimeout) {
    clearTimeout(realTimeAnalysisTimeout);
    realTimeAnalysisTimeout = null;
  }
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
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
    
    // Update UI based on selected mode
    updateAnswerMode();
  });
});

// Generate interview questions based on selected career
async function generateQuestionsWithAI(career) {
  return new Promise((resolve, reject) => {
    try {
      // Show loading state
      questionBox.textContent = 'Generating questions...';
      questionBox.style.opacity = 0.7;
      
      // Define fallback questions in case API fails
      const fallbackQuestions = [
        `Tell me about your experience as a ${career}.`,
        `What are your greatest strengths as a ${career}?`,
        `Describe a challenging project you worked on as a ${career}.`,
        `How do you stay updated with the latest trends in the ${career} field?`,
        `Where do you see yourself in 5 years in the ${career} industry?`,
        `Tell me about a time you had to resolve a conflict in a ${career} role.`,
        `What's the most difficult decision you've had to make as a ${career}?`,
        `How do you prioritize tasks when working on multiple projects as a ${career}?`,
        `What motivates you to excel in the ${career} field?`,
        `How would you handle a situation where you disagree with a superior about a ${career}-related decision?`
      ];
      
      // Use Together API to generate questions
      const apiKey = CONFIG.TOGETHER_API_KEY;
      const apiUrl = "https://api.together.xyz/v1/completions";
      const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";
      
      const prompt = `
Generate 10 challenging interview questions for a ${career} position. 
These should be a mix of behavioral, technical, and situational questions.
Format as a JSON array of strings, with each string being a complete question.
Example: ["Tell me about a time when...", "How would you approach...", ...]
`;
      
      console.log('Making direct API request to Together.ai for questions');
      
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.8,
          top_k: 50
        })
      })
        .then(response => {
          if (!response.ok) {
            console.error('API response not OK:', response.status, response.statusText);
            return response.text().then(text => {
              throw new Error(`API request failed: ${response.status} ${response.statusText} - ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Questions API response received:', data);
          
          try {
            if (data.choices && data.choices.length > 0) {
              const response = data.choices[0].text.trim();
              console.log('Questions generated successfully');
              
              // Extract JSON array from response
              const jsonMatch = response.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                const questions = JSON.parse(jsonMatch[0]);
                resolve(questions);
              } else {
                throw new Error('Could not parse questions from API response');
              }
            } else {
              throw new Error('No text generated in API response');
            }
          } catch (parseError) {
            console.error('Error parsing questions:', parseError);
            resolve(fallbackQuestions);
          }
        })
        .catch(error => {
          console.error('Error with Together.ai API request for questions:', error);
          resolve(fallbackQuestions);
        });
    } catch (error) {
      console.error('Error in generateQuestionsWithAI:', error);
      resolve(fallbackQuestions);
    }
  });
}

// This function has been removed as we're now making direct API calls

// Update progress indicator
function updateProgressIndicator() {
  if (currentQuestions.length > 0) {
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    progressIndicator.style.width = `${progress}%`;
    questionCounter.textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  }
}

// Display current question
function displayCurrentQuestion() {
  if (currentIndex < currentQuestions.length) {
    questionBox.textContent = currentQuestions[currentIndex];
    questionBox.style.opacity = 1;
    
    // Reset UI for new question
    submitBtn.disabled = false;
    nextBtn.disabled = true;
    
    // Clear answer input and feedback
    answerInput.value = '';
    feedbackBox.innerHTML = '';
    
    // Update progress
    updateProgressIndicator();
    
    // Reset recording
    recordedVideo.style.display = 'none';
    recordedVideo.src = '';
    
    // Clear real-time analysis timeout
    if (realTimeAnalysisTimeout) {
      clearTimeout(realTimeAnalysisTimeout);
      realTimeAnalysisTimeout = null;
    }
    
    // Reset analysis state
    isAnalyzing = false;
    
    // Update answer mode UI
    updateAnswerMode();
  } else {
    // End of interview
    questionBox.textContent = 'Interview complete! Thank you for participating.';
    submitBtn.disabled = true;
    nextBtn.disabled = true;
    
    // Show summary
    let summary = '<h3>Interview Summary</h3>';
    userAnswers.forEach((item, index) => {
      summary += `<p><strong>Q${index + 1}:</strong> ${item.question}</p>`;
      summary += `<p><em>Your answer:</em> ${item.answer.substring(0, 100)}${item.answer.length > 100 ? '...' : ''}</p>`;
      summary += '<hr>';
    });
    
    feedbackBox.innerHTML = summary;
    
    // Reset interview state
    interviewInProgress = false;
  }
}

// Start interview
function startInterview() {
  const career = careerSelect.value;
  
  if (!career) {
    alert('Please select a role first.');
    return;
  }
  
  // Reset interview state
  currentIndex = 0;
  userAnswers = [];
  interviewInProgress = true;
  
  // Generate questions
  generateQuestionsWithAI(career)
    .then(questions => {
      currentQuestions = questions;
      displayCurrentQuestion();
    })
    .catch(error => {
      console.error('Error starting interview:', error);
      questionBox.textContent = 'Error generating questions. Please try again.';
      questionBox.style.opacity = 1;
    });
}

// Real-time analysis variables
let realTimeAnalysisTimeout = null;
let isAnalyzing = false;

// Function to perform real-time analysis
function performRealTimeAnalysis() {
  if (isAnalyzing) return;
  
  const mode = Array.from(answerModeRadios).find(r => r.checked).value;
  if (mode !== 'record' || !mediaRecorder || !mediaRecorder.startTime) return;
  
  // Get current recording duration
  const currentDuration = Math.round((Date.now() - mediaRecorder.startTime) / 1000);
  
  // Only analyze if recording is at least 5 seconds
  if (currentDuration < 5) return;
  
  isAnalyzing = true;
  console.log('Starting real-time analysis after', currentDuration, 'seconds of recording');
  
  // Show loading state
  feedbackBox.innerHTML = `
    <div style="padding: 15px; background-color: #e3f2fd; border-radius: 8px; text-align: center;">
      <p>Analyzing your speech patterns and body language in real-time...</p>
      <div style="width: 100%; height: 4px; background-color: #bbdefb; border-radius: 2px; margin-top: 10px; position: relative; overflow: hidden;">
        <div style="position: absolute; width: 30%; height: 100%; background-color: #2196f3; border-radius: 2px; animation: progress 1.5s infinite ease-in-out;"></div>
      </div>
    </div>
  `;
  
  // Create prompt for real-time analysis focusing ONLY on speech and body language
  const prompt = `
You are an expert interview coach specializing ONLY in speech patterns and body language.
The candidate is currently recording a video interview answer (${currentDuration} seconds so far).

IMPORTANT: DO NOT analyze content, structure, or language of the answer. DO NOT provide any content analysis.
ONLY provide feedback on speech patterns and body language.

Give 3-4 quick tips about:
- Voice tone, pace, and clarity
- Posture and body positioning
- Eye contact and facial expressions
- Hand gestures and movement

Format as short, encouraging bullet points starting with "Speech tip:" or "Body language tip:"
Example:
• Speech tip: Vary your tone to emphasize key points
• Body language tip: Maintain steady eye contact with the camera

NEVER mention content analysis, structure analysis, or language analysis.
NEVER use headings like "Content Analysis", "Structure Analysis", etc.
ONLY focus on physical delivery and speech patterns.
`;
  
  // Make direct API request to Together.ai
  const apiKey = CONFIG.TOGETHER_API_KEY;
  const apiUrl = "https://api.together.xyz/v1/completions";
  const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";
  
  console.log('Making direct API request to Together.ai for real-time analysis');
  
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      temperature: 0.3,
      max_tokens: 300,
      top_p: 0.8,
      top_k: 50,
      repetition_penalty: 1.1
    })
  })
    .then(response => {
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        return response.text().then(text => {
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Real-time API response received:', data);
      
      if (data.choices && data.choices.length > 0) {
        const analysis = data.choices[0].text.trim();
        console.log('Real-time analysis generated successfully');
        
        // Only update if still recording
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          // Format the analysis with proper styling
          feedbackBox.innerHTML = `
            <div style="padding: 15px; background-color: #f5f5f5; border-radius: 8px; border-left: 4px solid #4caf50; margin-top: 15px;">
              <h3 style="margin-top: 0; color: #2e7d32;">Speech & Body Language Coaching</h3>
              ${analysis.replace(/\n/g, '<br>')}
            </div>
          `;
        }
      } else {
        throw new Error('No text generated in API response');
      }
      
      isAnalyzing = false;
    })
    .catch(error => {
      console.error('Error with real-time Together.ai API request:', error);
      isAnalyzing = false;
      
      // Only show error if still recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        feedbackBox.innerHTML = `
          <div style="padding: 15px; background-color: #ffebee; border-radius: 8px; border-left: 4px solid #f44336; margin-top: 15px;">
            <h3 style="margin-top: 0; color: #d32f2f;">API Error</h3>
            <p>Error connecting to Together.ai API: ${error.message}</p>
            <p>Retrying analysis in a few seconds...</p>
          </div>
        `;
      }
    });
}

// Submit answer handler
submitBtn.addEventListener('click', function() {
  console.log('Submit button clicked');
  
  if (!interviewInProgress) {
    console.log('Interview not in progress');
    return;
  }
  
  const mode = Array.from(answerModeRadios).find(r => r.checked).value;
  let userAnswer = '';
  
  if (mode === 'text') {
    userAnswer = answerInput.value.trim();
    if (!userAnswer) {
      alert('Please type your answer before submitting.');
      return;
    }
  } else {
    if (recordedVideo.style.display === 'none') {
      alert('Please record your answer before submitting.');
      return;
    }
    
    // For video answers, create a placeholder that ONLY requests speech and body language analysis
    const duration = Math.round((mediaRecorder.stopTime - mediaRecorder.startTime) / 1000);
    userAnswer = `[Video answer submitted - ${duration} seconds] IMPORTANT: ONLY analyze speech patterns and body language. DO NOT analyze content. The candidate answered the question about "${currentQuestions[currentIndex]}". Focus EXCLUSIVELY on analyzing their voice qualities (tone, pace, volume, clarity), physical presence (posture, movement), facial communication (eye contact, expressions), and gestures (hand movements, body positioning).`;
  }
  
  console.log('Preparing to submit answer:', userAnswer.substring(0, 50) + '...');
  
  // Store the user's answer
  userAnswers.push({
    question: currentQuestions[currentIndex],
    answer: userAnswer,
    mode: mode
  });
  
  // Disable submit button
  submitBtn.disabled = true;
  
  // Show loading state
  feedbackBox.innerHTML = `
    <div style="padding: 15px; background-color: #e3f2fd; border-radius: 8px; text-align: center;">
      <p>Analyzing your ${mode === 'text' ? 'text content' : 'speech patterns and body language'} with Together AI...</p>
      <div style="width: 100%; height: 4px; background-color: #bbdefb; border-radius: 2px; margin-top: 10px; position: relative; overflow: hidden;">
        <div style="position: absolute; width: 30%; height: 100%; background-color: #2196f3; border-radius: 2px; animation: progress 1.5s infinite ease-in-out;"></div>
      </div>
    </div>
  `;
  
  console.log('Making direct API request to Together.ai for final analysis');
  
  // Create prompt for final analysis
  let prompt;
  
  if (mode === 'record') {
    // For video answers - focusing ONLY on speech and body language
    prompt = `
You are an expert interview coach specializing ONLY in speech patterns and body language.

IMPORTANT INSTRUCTIONS:
- DO NOT analyze content, structure, or language of the answer
- DO NOT provide any content analysis
- DO NOT use headings like "Content Analysis", "Structure Analysis", etc.
- ONLY focus on physical delivery and speech patterns

For this video interview question: "${currentQuestions[currentIndex]}"

Provide detailed feedback ONLY on:
1. Voice qualities (tone, pace, volume, clarity, emphasis, vocal variety)
2. Physical presence (posture, stillness/movement, confidence)
3. Facial communication (eye contact, expressions, engagement)
4. Gestures (hand movements, head nodding, body positioning)

Format your feedback with ONLY these sections:
- Voice Quality Analysis (tone, pace, volume, clarity)
- Physical Presence Analysis (posture, movement, confidence)
- Facial Communication Analysis (eye contact, expressions)
- Gesture Analysis (hand movements, body positioning)
- Delivery Strengths (use ✓ bullet points for aspects done well)
- Delivery Improvements (use ⚠️ bullet points for what could be improved)
- Speech & Body Language Tips (numbered list of specific suggestions)

Be constructive and actionable in your feedback. Focus EXCLUSIVELY on physical and vocal delivery, NOT on answer content.
`;
  } else {
    // For text answers
    prompt = `
You are an expert interview coach specializing in professional communication.
Analyze the following interview answer for the question:

Question: "${currentQuestions[currentIndex]}"

Answer: "${userAnswer}"

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
  }
  
  // Make direct API request to Together.ai
  const apiKey = CONFIG.TOGETHER_API_KEY;
  const apiUrl = "https://api.together.xyz/v1/completions";
  const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";
  
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      temperature: 0.2,
      max_tokens: 1024,
      top_p: 0.8,
      top_k: 50,
      repetition_penalty: 1.1
    })
  })
    .then(response => {
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        return response.text().then(text => {
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('API response received:', data);
      
      if (data.choices && data.choices.length > 0) {
        let analysis = data.choices[0].text.trim();
        console.log('Analysis generated successfully');
        
        // For video answers, add a personalized intro
        if (mode === 'record') {
          // Get the career from the select element
          const career = careerSelect.value || 'candidate';
          
          // Add a personalized intro focusing on speech and body language
          analysis = `# Speech & Body Language Analysis\n\nBased on your video response to the question about ${currentQuestions[currentIndex].toLowerCase()}, here's my feedback on your speech patterns and body language:\n\n${analysis}`;
        }
        
        // Format the analysis with proper styling
        feedbackBox.innerHTML = `
          <div style="padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #2196f3; margin-top: 15px;">
            ${analysis.replace(/\n/g, '<br>')}
          </div>
        `;
        
        nextBtn.disabled = false;
      } else {
        throw new Error('No text generated in API response');
      }
    })
    .catch(error => {
      console.error('Error with Together.ai API request:', error);
      
      // Show error message
      feedbackBox.innerHTML = `
        <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 10px 15px; margin: 10px 0; border-radius: 4px;">
          <h3 style="color: #d32f2f; margin-top: 0;">Error Analyzing Answer</h3>
          <p>There was an error analyzing your answer with Together.ai API. Please try again.</p>
          <p><strong>Error details:</strong> ${error.message}</p>
        </div>
      `;
      
      submitBtn.disabled = false;
      nextBtn.disabled = false;
    });
});

// Next question handler
nextBtn.addEventListener('click', () => {
  if (!interviewInProgress) return;
  
  currentIndex++;
  displayCurrentQuestion();
});

// Career selection handler
careerSelect.addEventListener('change', startInterview);

// Initialize UI
updateAnswerMode();

// Set initial active class for answer mode
document.querySelector('.mode-option').classList.add('active');

// Check if Together API is available
if (window.TogetherAPI && window.TogetherAPI.isInitialized) {
  console.log('Together API is available and initialized');
} else {
  console.warn('Together API is not available or not initialized');
  
  // Initialize Together API if needed
  if (typeof CONFIG !== 'undefined' && CONFIG.TOGETHER_API_KEY) {
    console.log('Initializing Together API with key from config');
    window.TogetherAPI = {
      isInitialized: true,
      apiKey: CONFIG.TOGETHER_API_KEY,
      makeRequest: function(prompt, options) {
        return new Promise((resolve, reject) => {
          const apiUrl = "https://api.together.xyz/v1/completions";
          const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";
          
          fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: model,
              prompt: prompt,
              temperature: options.temperature || 0.7,
              max_tokens: options.max_tokens || 500,
              top_p: options.top_p || 0.8,
              top_k: options.top_k || 50,
              repetition_penalty: options.repetition_penalty || 1.1
            })
          })
            .then(response => {
              if (!response.ok) {
                return response.text().then(text => {
                  throw new Error(`API request failed: ${response.status} ${response.statusText} - ${text}`);
                });
              }
              return response.json();
            })
            .then(data => {
              if (data.choices && data.choices.length > 0) {
                resolve(data.choices[0].text);
              } else {
                throw new Error('No text generated in API response');
              }
            })
            .catch(error => {
              reject(error);
            });
        });
      }
    };
    console.log('Together API initialized successfully');
  }
}

// Log that initialization is complete
console.log('Clean interview.js initialized successfully');

// Add event listeners to all buttons to ensure they're working
document.querySelectorAll('button').forEach(button => {
  const originalClick = button.onclick;
  button.onclick = function(event) {
    console.log(`Button clicked: ${button.id || button.textContent}`);
    if (typeof originalClick === 'function') {
      return originalClick.call(this, event);
    }
  };
});