// login.js - Handle login functionality with Supabase

// Note: We're using the globally available authService
// that will be defined in auth-service.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const loginButton = document.getElementById('loginButton');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  
  // Auto-fill email if user just registered
  const justRegistered = JSON.parse(localStorage.getItem('justRegistered') || 'null');
  if (justRegistered && justRegistered.email) {
    emailInput.value = justRegistered.email;
    passwordInput.focus();
    
    // Show a helpful message
    showToast('Please enter your password to log in', 'info');
    
    // Clear the registration data after 1 minute
    setTimeout(() => {
      localStorage.removeItem('justRegistered');
    }, 60000);
  }
  
  // Toggle password visibility
  passwordToggle.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    const icon = passwordToggle.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Show loading state
    loginButton.classList.add('loading');
    loginButton.disabled = true;
    
    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      console.log("Attempting to sign in with:", email);
      
      // Sign in with Supabase
      const { success, data, error } = await authService.signIn(email, password);
      
      if (success) {
        // Show success message
        showToast('Login successful! Redirecting...', 'success');
        
        // Store user data in localStorage for easy access
        localStorage.setItem('intervuCurrentUser', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || 'User',
          lastLogin: new Date().toISOString()
        }));
        
        // Redirect to index.html
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        // Show error message
        showToast(error || 'Invalid email or password. Please try again.', 'error');
        loginButton.disabled = false;
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('An error occurred during login. Please try again.', 'error');
      loginButton.disabled = false;
    } finally {
      // Hide loading state
      loginButton.classList.remove('loading');
    }
  });
  
  // Validate form inputs - simplified
  function validateForm() {
    let isValid = true;
    
    // Basic validation - just check if fields are not empty
    const email = emailInput.value.trim();
    if (!email) {
      showValidationError(emailInput, 'Email is required');
      isValid = false;
    } else {
      clearValidationError(emailInput);
    }
    
    // Validate password
    const password = passwordInput.value;
    if (!password) {
      showValidationError(passwordInput, 'Password is required');
      isValid = false;
    } else {
      clearValidationError(passwordInput);
    }
    
    return isValid;
  }
  
  // Show validation error
  function showValidationError(input, message) {
    const formGroup = input.closest('.form-group');
    const validationMessage = formGroup.querySelector('.validation-message');
    
    if (validationMessage) {
      validationMessage.textContent = message;
    }
    
    input.classList.add('error');
  }
  
  // Clear validation error
  function clearValidationError(input) {
    const formGroup = input.closest('.form-group');
    const validationMessage = formGroup.querySelector('.validation-message');
    
    if (validationMessage) {
      validationMessage.textContent = '';
    }
    
    input.classList.remove('error');
  }
  
  // Show toast notification
  function showToast(message, type = 'error', duration = 5000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = 'toast show ' + type;
    toastMessage.textContent = message;
    
    const icon = toast.querySelector('.toast-icon');
    icon.className = 'toast-icon fas';
    
    if (type === 'success') {
      icon.classList.add('fa-check-circle');
    } else if (type === 'error') {
      icon.classList.add('fa-exclamation-circle');
    } else if (type === 'warning') {
      icon.classList.add('fa-exclamation-triangle');
    } else if (type === 'info') {
      icon.classList.add('fa-info-circle');
      toast.style.borderLeftColor = '#2196F3';
    }
    
    // Clear any existing timeout
    if (window.toastTimeout) {
      clearTimeout(window.toastTimeout);
    }
    
    // Set new timeout
    window.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
    
    // Add click to dismiss
    toast.onclick = function() {
      toast.classList.remove('show');
      if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
      }
    };
  }
  
  // Simplified login process - removed forgot password functionality
});