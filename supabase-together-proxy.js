// supabase-together-proxy.js
// This module uses Supabase Edge Functions to proxy Together.ai API calls
// This bypasses CORS issues by routing requests through your own server

import { createClient } from '@supabase/supabase-js';

class SupabaseTogetherProxy {
  constructor() {
    this.supabase = null;
    this.initialize();
  }

  initialize() {
    if (!window.CONFIG || !window.CONFIG.SUPABASE.URL || !window.CONFIG.SUPABASE.ANON_KEY) {
      console.warn('⚠️ Supabase credentials not configured');
      return;
    }

    try {
      this.supabase = createClient(
        window.CONFIG.SUPABASE.URL,
        window.CONFIG.SUPABASE.ANON_KEY
      );
      console.log('✅ Supabase proxy initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
    }
  }

  /**
   * Call Together API through Supabase Edge Function
   * Make sure you have set up the edge function: supabase/functions/together-proxy/index.ts
   */
  async callTogetherAPI(prompt, options = {}) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    try {
      const { data, error } = await this.supabase.functions.invoke('together-proxy', {
        body: {
          prompt,
          options
        }
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error calling Supabase proxy:', error);
      throw error;
    }
  }

  /**
   * Generate interview questions through Supabase
   */
  async generateInterviewQuestions(career, count = 5) {
    const prompt = `
You are an expert interviewer for ${career} positions.
Generate ${count} professional interview questions for a ${career} role.
The questions should:
1. Cover a range of skills and competencies relevant to the role
2. Include both technical and behavioral questions
3. Be challenging but fair
4. Be specific to the ${career} field

Format your response as a JSON array of strings, with each string being a question.
Example: ["Question 1", "Question 2", ...]

Only return the JSON array, no other text.
`;

    try {
      const response = await this.callTogetherAPI(prompt, { max_tokens: 1024 });
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]).slice(0, count);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  /**
   * Analyze text answer through Supabase
   */
  async analyzeTextAnswer(question, answer) {
    const prompt = `
You are an expert interview coach. Analyze the following interview answer for the question:

Question: "${question}"

Answer: "${answer}"

Provide detailed feedback on:
1. Content relevance to the question
2. Structure and clarity
3. Specific examples and evidence provided
4. Professional language and communication

Format your feedback with these sections:
- Content Analysis
- Strengths (use ✓ bullet points)
- Areas for Improvement (use ⚠️ bullet points)
- Improvement Tips (numbered list)

Be constructive, specific, and actionable in your feedback.
`;

    try {
      return await this.callTogetherAPI(prompt, { 
        temperature: 0.2,
        max_tokens: 1024 
      });
    } catch (error) {
      console.error('Error analyzing answer:', error);
      throw error;
    }
  }
}

// Create global instance
window.SupabaseTogetherProxy = new SupabaseTogetherProxy();
