// database-service.js - Service for handling database operations with Supabase

// Note: We're using the globally available supabase client
// that is initialized in supabase.js

/**
 * Database service for handling operations with Supabase
 */
class DatabaseService {
  /**
   * Create a new user in the database
   * @param {Object} userData - User data to be stored
   * @returns {Promise} - Promise with the result of the operation
   */
  async createUser(userData) {
    try {
      // Only include fields that exist in the database schema
      const userProfile = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        created_at: userData.created_at,
        last_login: userData.last_login
      };
      
      const { data, error } = await supabaseClient
        .from('users')
        .insert([userProfile])
        .select();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise} - Promise with the user data
   */
  async getUserByEmail(email) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user's last login time
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with the result of the operation
   */
  async updateUserLastLogin(userId) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating last login:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save interview data
   * @param {Object} interviewData - Interview data to be stored
   * @returns {Promise} - Promise with the result of the operation
   */
  async saveInterview(interviewData) {
    try {
      const { data, error } = await supabaseClient
        .from('interviews')
        .insert([interviewData])
        .select();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving interview:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get interviews by user ID
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with the interviews data
   */
  async getInterviewsByUserId(userId) {
    try {
      const { data, error } = await supabaseClient
        .from('interviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting interviews:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save resume data
   * @param {Object} resumeData - Resume data to be stored
   * @returns {Promise} - Promise with the result of the operation
   */
  async saveResume(resumeData) {
    try {
      const { data, error } = await supabaseClient
        .from('resumes')
        .insert([resumeData])
        .select();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving resume:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get resumes by user ID
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with the resumes data
   */
  async getResumesByUserId(userId) {
    try {
      const { data, error } = await supabaseClient
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting resumes:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export the database service instance
const databaseService = new DatabaseService();

// Make databaseService available globally
window.databaseService = databaseService;