// register.js - Handle registration functionality with Supabase

// Note: We're using the globally available authService
// that will be defined in auth-service.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const registerButton = document.getElementById('registerButton');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordToggle = document.getElementById('passwordToggle');
  const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
  
  // Abstract API key for email verification
  const ABSTRACT_API_KEY = 'ac9c597b644a44ddbfd0eb1692e05851';
  
  // Toggle password visibility
  passwordToggle.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    const icon = passwordToggle.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
  
  // Toggle confirm password visibility
  confirmPasswordToggle.addEventListener('click', function() {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    
    // Toggle eye icon
    const icon = confirmPasswordToggle.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form - this is now async
    const isFormValid = await validateForm();
    if (!isFormValid) {
      return;
    }
    
    // Show loading state
    registerButton.classList.add('loading');
    registerButton.disabled = true;
    
    try {
      // Get form values
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      console.log("Attempting to register with:", email);
      
      // Additional user data to store in the database
      const userData = {
        full_name: name
      };
      
      // Sign up with Supabase
      const { success, data, error, autoSignedIn } = await authService.signUp(email, password, userData);
      
      if (success) {
        if (autoSignedIn) {
          // User was automatically signed in after registration
          showToast('Registration successful! Redirecting to dashboard...', 'success');
          
          // Store user data in localStorage
          if (data && data.user) {
            localStorage.setItem('intervuCurrentUser', JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: userData.full_name || 'User',
              lastLogin: new Date().toISOString()
            }));
          }
          
          // Redirect directly to index.html
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          // Show success message
          showToast('Registration successful! Redirecting to login...', 'success');
          
          // Store temporary registration data to help with login
          localStorage.setItem('justRegistered', JSON.stringify({
            email: email,
            timestamp: new Date().getTime()
          }));
          
          // Redirect to login page
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        }
      } else {
        // Show error message
        showToast(error || 'Registration failed. Please try again.', 'error');
        registerButton.disabled = false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('An error occurred during registration. Please try again.', 'error');
      registerButton.disabled = false;
    } finally {
      // Hide loading state
      registerButton.classList.remove('loading');
    }
  });
  
  // Validate email with Abstract API
  async function validateEmail(email) {
    try {
      // Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { valid: false, message: 'Email format is invalid' };
      }
      
      // Show validation in progress
      showValidationError(emailInput, 'Verifying email...', 'info');
      showToast('Verifying email address...', 'info');
      
      // Call the Abstract API
      const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        console.error(`API request failed with status ${response.status}`);
        // If API fails, still allow registration with basic validation
        clearValidationError(emailInput);
        return { valid: true, message: 'Email format is valid' };
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Check if email is deliverable
      if (data.deliverability === 'UNDELIVERABLE') {
        return { valid: false, message: 'This email address appears to be invalid or non-existent' };
      }
      
      // Check for disposable emails
      if (data.is_disposable_email && data.is_disposable_email.value === true) {
        return { valid: false, message: 'Please use a permanent email address. Disposable emails are not allowed' };
      }
      
      // Check if email is valid according to API
      if (data.is_valid_format && data.is_valid_format.value === false) {
        return { valid: false, message: 'This email address has an invalid format' };
      }
      
      // Email passed checks
      showValidationSuccess(emailInput, 'Email verified successfully!');
      return { valid: true, message: 'Email verified successfully!' };
      
    } catch (error) {
      console.error('Email validation error:', error);
      // If validation fails, still allow registration with basic validation
      clearValidationError(emailInput);
      return { valid: true, message: 'Email format is valid' };
    }
  }
  
  // Validate form inputs
  async function validateForm() {
    let isValid = true;
    
    // Validate name
    const name = nameInput.value.trim();
    if (!name) {
      showValidationError(nameInput, 'Name is required');
      isValid = false;
    } else {
      clearValidationError(nameInput);
    }
    
    // Validate email
    const email = emailInput.value.trim();
    if (!email) {
      showValidationError(emailInput, 'Email is required');
      isValid = false;
    } else {
      // Validate email with Abstract API
      const emailValidation = await validateEmail(email);
      if (!emailValidation.valid) {
        showValidationError(emailInput, emailValidation.message);
        isValid = false;
      }
    }
    
    // Validate password
    const password = passwordInput.value;
    if (!password) {
      showValidationError(passwordInput, 'Password is required');
      isValid = false;
    } else if (password.length < 6) {
      showValidationError(passwordInput, 'Password must be at least 6 characters');
      isValid = false;
    } else {
      clearValidationError(passwordInput);
    }
    
    // Validate confirm password
    const confirmPassword = confirmPasswordInput.value;
    if (!confirmPassword) {
      showValidationError(confirmPasswordInput, 'Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== password) {
      showValidationError(confirmPasswordInput, 'Passwords do not match');
      isValid = false;
    } else {
      clearValidationError(confirmPasswordInput);
    }
    
    return isValid;
  }
  
  // Show validation error
  function showValidationError(input, message, type = 'error') {
    const formGroup = input.closest('.form-group');
    const validationMessage = formGroup.querySelector('.validation-message');
    
    if (validationMessage) {
      validationMessage.textContent = message;
      validationMessage.className = 'validation-message'; // Reset any success class
      
      if (type === 'info') {
        validationMessage.style.color = '#2196F3';
        input.classList.remove('error');
      } else {
        validationMessage.style.color = '#f44336';
        input.classList.add('error');
      }
    } else {
      input.classList.add('error');
    }
  }
  
  // Show validation success
  function showValidationSuccess(input, message) {
    const formGroup = input.closest('.form-group');
    const validationMessage = formGroup.querySelector('.validation-message');
    
    if (validationMessage) {
      validationMessage.textContent = message;
      validationMessage.className = 'validation-message success';
      validationMessage.style.color = '#4CAF50';
    }
    
    input.classList.remove('error');
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
  
  // No email validation - accept all inputs
  
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
});