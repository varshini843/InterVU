// api-mock.js - Mock API for simulating AI service integration

/**
 * This file provides mock implementations of AI API calls.
 * In a production environment, these would be replaced with actual API calls
 * to Google Gemini or other AI services.
 * 
 * For real-time analysis, we would use:
 * 1. WebSockets for continuous communication with the AI service
 * 2. Streaming APIs for speech-to-text and sentiment analysis
 * 3. Computer vision APIs for body language and facial expression analysis
 */

// Mock API for generating interview questions
async function generateInterviewQuestions(career, count = 10) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Career-specific question banks
  const questionBanks = {
    'Software Developer': [
      'Can you explain your experience with object-oriented programming concepts?',
      'Describe a challenging programming problem you solved recently.',
      'How do you approach debugging a complex issue in your code?',
      'What version control systems have you worked with and how do you use them?',
      'Explain the difference between synchronous and asynchronous programming.',
      'How do you ensure your code is maintainable and readable?',
      'Describe your experience with test-driven development.',
      'How do you stay updated with the latest programming trends and technologies?',
      'Explain how you would optimize a slow-performing application.',
      'Describe a time when you had to refactor code. What was your approach?',
      'What databases have you worked with and in what contexts?',
      'How do you handle error and exception handling in your code?',
      'Explain your understanding of RESTful APIs and how you have implemented them.',
      'What CI/CD tools have you used and how did they improve your workflow?',
      'How do you approach learning a new programming language or framework?'
    ],
    'Data Analyst': [
      'How do you approach cleaning and preprocessing a messy dataset?',
      'Explain the difference between supervised and unsupervised learning.',
      'What tools and programming languages do you use for data analysis?',
      'How do you handle missing data in a dataset?',
      'Describe a complex data analysis project you worked on recently.',
      'How do you validate the accuracy of your data analysis?',
      'Explain how you would communicate technical findings to non-technical stakeholders.',
      'What statistical methods do you commonly use in your analysis?',
      'How do you approach feature selection for a machine learning model?',
      'Describe how you would detect outliers in a dataset.',
      'What visualization tools do you prefer and why?',
      'How do you ensure data quality in your analysis?',
      'Explain the concept of data normalization and when you would use it.',
      'How do you approach A/B testing and measure statistical significance?',
      'Describe your experience with SQL and database querying.'
    ],
    'UX/UI Designer': [
      'Walk me through your design process from concept to implementation.',
      'How do you incorporate user feedback into your designs?',
      'Describe a challenging UX problem you solved and your approach.',
      'How do you balance aesthetic design with usability?',
      'What methods do you use for user research and testing?',
      'How do you design for accessibility?',
      'Describe how you collaborate with developers to implement your designs.',
      'What design tools do you use and why?',
      'How do you approach designing for different screen sizes and devices?',
      'Describe a time when you had to compromise on a design decision.',
      'How do you stay updated with the latest design trends and best practices?',
      'Explain your approach to information architecture.',
      'How do you use design systems in your work?',
      'Describe how you would design for users with specific constraints or needs.',
      'How do you measure the success of your designs?'
    ],
    'Product Manager': [
      'How do you prioritize product features?',
      'Describe a time you dealt with conflicting stakeholder requests.',
      'What metrics do you track for product success?',
      'How do you gather and incorporate user feedback?',
      'Describe your approach to product roadmapping.',
      'How do you work with engineering teams to deliver features?',
      'Describe a product launch you managed and what you learned.',
      'How do you balance business needs with user experience?',
      'What methodologies do you use for product development?',
      'How do you handle a feature that is not performing as expected?',
      'Describe how you communicate product vision to different audiences.',
      'How do you approach competitive analysis?',
      'Describe a time when you had to make a difficult product decision.',
      'How do you incorporate data into your product decisions?',
      'What tools do you use to manage your product development process?'
    ]
  };
  
  // If we have specific questions for this career, return them
  if (questionBanks[career]) {
    // Ensure we return the requested number of questions
    const availableQuestions = questionBanks[career];
    if (availableQuestions.length <= count) {
      return availableQuestions;
    }
    
    // Randomly select questions to reach the desired count
    const selectedQuestions = [];
    const indices = new Set();
    
    while (selectedQuestions.length < count) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        selectedQuestions.push(availableQuestions[randomIndex]);
      }
    }
    
    return selectedQuestions;
  }
  
  // For careers not in our predefined list, generate generic questions
  return [
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
  ];
}

// Mock API for analyzing text answers
async function analyzeTextAnswer(question, answer) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simple analysis based on answer length and content
  const wordCount = answer.split(/\s+/).filter(word => word.length > 0).length;
  
  if (wordCount < 20) {
    return `
Content Analysis:
Your answer is quite brief at only ${wordCount} words. Consider expanding your response significantly.

Strengths:
✓ You've provided a direct response to the question

Areas for Improvement:
⚠️ Your answer lacks detail and specific examples
⚠️ The brevity may suggest limited experience or knowledge on the topic

Improvement Tips:
1. Aim for at least 100-150 words in your response
2. Include at least one specific example from your experience
3. Structure your answer with an introduction, main points, and conclusion
4. Address all aspects of the question`;
  }
  
  if (wordCount < 50) {
    return `
Content Analysis:
Your answer is somewhat brief at ${wordCount} words, but provides some information.

Strengths:
✓ You've addressed the basic elements of the question
✓ Your response is clear and concise

Areas for Improvement:
⚠️ Your answer would benefit from more specific examples
⚠️ Consider elaborating on your points with more detail

Improvement Tips:
1. Add 1-2 specific examples from your experience
2. Explain the reasoning behind your approach or methodology
3. Consider addressing potential challenges or limitations
4. Conclude with a summary of your key points`;
  }
  
  // For longer, more detailed answers
  return `
Content Analysis:
Your answer is well-developed at ${wordCount} words and shows good depth of knowledge.

Strengths:
✓ Comprehensive response that addresses the question thoroughly
✓ Good use of specific details and examples
✓ Well-structured answer with clear organization
✓ Professional tone and appropriate terminology

Areas for Improvement:
⚠️ Consider quantifying your achievements or results where applicable
⚠️ You could strengthen your answer by addressing potential counterarguments

Improvement Tips:
1. Use the STAR method (Situation, Task, Action, Result) for any examples
2. Highlight how your approach aligns with industry best practices
3. Briefly mention how you continue to develop in this area
4. Connect your answer back to the specific role you're applying for

Overall, this is a strong response that demonstrates your expertise and experience.`;
}

// Mock API for analyzing video/audio answers
async function analyzeVideoAnswer(question, videoBlob) {
  // Simulate network delay for a more complex analysis
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // In a real implementation, we would:
  // 1. Upload the video to a server
  // 2. Process the video for speech-to-text
  // 3. Analyze the speech content
  // 4. Analyze facial expressions and body language
  // 5. Return comprehensive feedback
  
  // For now, return a mock analysis
  return `
Speech Analysis:
✓ Good clarity and pronunciation
✓ Appropriate speaking pace
⚠️ Consider reducing filler words like "um" and "uh"
⚠️ Volume was occasionally too low - try to maintain consistent volume

Body Language Analysis:
✓ Good eye contact with the camera
✓ Natural hand gestures that emphasize key points
⚠️ Try to reduce fidgeting or nervous movements
✓ Confident posture throughout most of the answer

Content Analysis:
Your answer addressed the key points of the question. The explanation was clear and logical, with good structure. You provided some examples, but could include more specific details from your experience.

Improvement Tips:
1. Start with a brief overview before diving into details
2. Include 1-2 more specific examples from your experience
3. End with a concise summary of your main points
4. Practice reducing filler words for more polished delivery

Overall, this was a good response that demonstrates your knowledge and communication skills.`;
}

// Real-time speech analysis (simulated)
async function analyzeRealtimeSpeech(audioChunk) {
  // In a real implementation, this would:
  // 1. Send audio chunks to a speech-to-text API
  // 2. Analyze the transcribed text for content, filler words, etc.
  // 3. Analyze audio characteristics for pace, volume, clarity
  
  // For now, we'll return a simulated analysis
  return {
    transcription: "", // Would contain the transcribed text
    fillerWords: Math.random() > 0.7 ? 1 : 0, // Random detection of filler words
    pace: 3 + (Math.random() - 0.5) * 2, // Score from 1-5 where 3 is optimal
    volume: 50 + Math.random() * 50, // Volume level
    clarity: Math.random() > 0.3 ? "good" : "needs improvement"
  };
}

// Real-time body language analysis (simulated)
async function analyzeRealtimeBodyLanguage(videoFrame) {
  // In a real implementation, this would:
  // 1. Send video frames to a computer vision API
  // 2. Analyze facial expressions, eye contact, posture, etc.
  
  // For now, we'll return a simulated analysis
  return {
    eyeContact: 3 + (Math.random() - 0.5) * 2, // Score from 1-5
    posture: 3 + (Math.random() - 0.5) * 2, // Score from 1-5
    fidgeting: 2 + (Math.random() - 0.5) * 2, // Score from 1-5
    expression: Math.random() > 0.7 ? "neutral" : (Math.random() > 0.5 ? "engaged" : "distracted")
  };
}

// Real-time content analysis based on partial transcription
async function analyzePartialContent(question, partialTranscript) {
  // In a real implementation, this would analyze the partial transcript
  // against the question to provide real-time content feedback
  
  // For now, we'll return a simulated analysis
  const relevanceScore = Math.random() * 5; // 0-5 score
  
  return {
    relevance: relevanceScore,
    feedback: relevanceScore < 2 ? 
      "Your answer seems to be off-topic. Try to address the question more directly." :
      "Your answer is on the right track. Continue developing your points.",
    missingKeywords: ["example", "experience", "specific"], // Keywords that should be included
    suggestions: "Consider including a specific example from your experience."
  };
}

// Export the mock API functions
window.InterVUAPI = {
  generateInterviewQuestions,
  analyzeTextAnswer,
  analyzeVideoAnswer,
  analyzeRealtimeSpeech,
  analyzeRealtimeBodyLanguage,
  analyzePartialContent
};