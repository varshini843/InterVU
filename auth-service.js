// auth-service.js - Service for handling authentication with Supabase

// Note: We're using the globally available supabase client
// that is initialized in supabase.js

/**
 * Authentication service for handling user authentication with Supabase
 */
class AuthService {
  constructor() {
    // Check if Supabase client is available
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized. Authentication service will not work properly.');
    }
  }
  
  /**
   * Sign up a new user - simplified version that doesn't require email verification
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise} - Promise with the result of the operation
   */
  async signUp(email, password, userData) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }
      
      console.log('Signing up user with email:', email);
      
      // Create a mock user object for local storage
      const mockUser = {
        id: 'user_' + new Date().getTime(),
        email: email,
        user_metadata: {
          full_name: userData.full_name
        }
      };
      
      // Store user credentials in localStorage for easy login
      localStorage.setItem('intervuUserCredentials', JSON.stringify({
        email: email,
        password: password,
        name: userData.full_name,
        timestamp: new Date().getTime()
      }));
      
      // Return success with mock data
      return { 
        success: true, 
        data: { user: mockUser },
        autoSignedIn: true 
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { 
        success: false, 
        error: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Sign in a user - only allows login for registered emails
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise with the result of the operation
   */
  async signIn(email, password) {
    try {
      console.log('Signing in user with email:', email);
      
      // Check if we have stored credentials
      const storedCredentials = JSON.parse(localStorage.getItem('intervuUserCredentials') || 'null');
      
      // If we have stored credentials, use them to validate
      if (storedCredentials && storedCredentials.email === email) {
        // Validate password
        if (storedCredentials.password !== password) {
          console.log('Password does not match');
          return { 
            success: false, 
            error: 'Invalid password. Please try again.' 
          };
        }
        
        // Create a mock user object
        const mockUser = {
          id: 'user_' + new Date().getTime(),
          email: email,
          user_metadata: {
            full_name: storedCredentials.name || 'User'
          }
        };
        
        // Store current user in localStorage
        localStorage.setItem('intervuCurrentUser', JSON.stringify({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.user_metadata.full_name,
          lastLogin: new Date().toISOString()
        }));
        
        console.log('User signed in successfully with stored credentials');
        return { success: true, data: { user: mockUser } };
      }
      
      // If no stored credentials match, return error
      console.log('No user found with this email');
      return { 
        success: false, 
        error: 'No account found with this email. Please register first.' 
      };
      
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise} - Promise with the result of the operation
   */
  async signOut() {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await window.supabaseClient.auth.signOut();
      if (error) throw error;
      
      // Clear any stored user data
      localStorage.removeItem('intervuCurrentUser');
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the current user
   * @returns {Promise} - Promise with the current user data
   */
  async getCurrentUser() {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await window.supabaseClient.auth.getUser();
      if (error) throw error;
      
      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise} - Promise with the result of the operation
   */
  async resetPassword(email) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html',
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise with the result of the operation
   */
  async updatePassword(newPassword) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await window.supabaseClient.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export the auth service instance
const authService = new AuthService();

// Make authService available globally
window.authService = authService;