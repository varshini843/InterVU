// config.js - Configuration for InterVU application

// This file contains configuration settings for the InterVU application
// Replace the API key with your actual Gemini API key

const CONFIG = {
  // API keys
  GEMINI_API_KEY: "AIzaSyAn1j3XIY9p_k33_7NyTPEv28INAoS2hGQ", // Keeping for backward compatibility
  TOGETHER_API_KEY: "074cf358e9cf42a2dca649dd980440b6a310d8249d0b9c6f47c97a39f06a9279",
  
  // API provider to use (gemini or together)
  API_PROVIDER: "together",
  
  // Supabase configuration
  SUPABASE: {
    URL: "https://mcvjvsprehdetbbcfjph.supabase.co",
    ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdmp2c3ByZWhkZXRiYmNmanBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkyMjAsImV4cCI6MjA2NDcyNTIyMH0.ptvadATEgnl0D7HbNDWW3kQxzWS1LSfeCKeRGay1-Pg",
    ENABLE: true // Set to true to enable Supabase backend
  },
  
  // Speech recognition language
  SPEECH_RECOGNITION_LANGUAGE: "en-US",
  
  // Interview settings
  QUESTIONS_PER_INTERVIEW: 10, // Set to 10 questions per interview
  
  // Real-time analysis settings
  ANALYSIS_DEBOUNCE_TIME: 3000, // Increased from 1000ms to reduce API calls
  
  // Debug mode
  DEBUG: true,
  
  // API rate limiting to avoid quota issues
  USE_MOCK_FOR_PARTIAL_ANALYSIS: false, // Use real API responses for partial analysis
  ENABLE_REAL_TIME_ANALYSIS: true, // Enable real-time analysis
  
  // Real-time analysis settings
  REAL_TIME_ANALYSIS_INITIAL_DELAY: 5000, // 5 seconds
  REAL_TIME_ANALYSIS_INTERVAL: 10000, // 10 seconds
  
  // Video analysis settings
  VIDEO_ANALYSIS_FOCUS: "speech_and_body_language", // Focus on speech and body language
  QUESTIONS_COUNT: 10 // Generate 10 questions per interview
};

// Make CONFIG available globally
window.CONFIG = CONFIG;