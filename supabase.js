// supabase.js - Supabase client configuration

// Note: We're using the globally loaded Supabase client from the CDN
// The createClient function is available globally

// Get the configuration
const SUPABASE_CONFIG = {
  URL: "https://mcvjvsprehdetbbcfjph.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdmp2c3ByZWhkZXRiYmNmanBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkyMjAsImV4cCI6MjA2NDcyNTIyMH0.ptvadATEgnl0D7HbNDWW3kQxzWS1LSfeCKeRGay1-Pg"
};

// Initialize the Supabase client
function initializeSupabase() {
  try {
    if (typeof supabase === 'undefined' || !supabase.createClient) {
      console.error('Supabase client not loaded. Make sure the CDN script is included before this file.');
      return null;
    }
    
    const { createClient } = supabase;
    const client = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
    
    console.log('Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
}

// Initialize the client
const supabaseClient = initializeSupabase();

// Make supabaseClient available globally
window.supabaseClient = supabaseClient;

// Log initialization status
if (supabaseClient) {
  console.log('Supabase client is ready to use');
} else {
  console.error('Failed to initialize Supabase client');
}