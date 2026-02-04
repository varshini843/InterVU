# InterVU - Email Validation System

This project implements a real-time email validation system for the InterVU application.

## Features

- Real-time email validation using Abstract API
- Detects fake, disposable, and invalid email addresses
- Password strength checking with visual feedback
- User-friendly interface with detailed validation messages

## How to Use

Simply open `register-new.html` or `login-new.html` in your browser to use the application.

## How It Works

1. User fills out the registration form
2. Email is validated in real-time using Abstract API
   - Checks if the email format is valid
   - Verifies that the domain has valid MX records
   - Detects disposable/temporary email addresses
   - Identifies role-based emails (admin@, info@, etc.)
3. Password strength is checked in real-time with visual feedback
4. After successful validation, the user account is created
5. User can then log in with their credentials

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Email Validation: Abstract API (Key: ac9c597b644a44ddbfd0eb1692e05851)
- Local Storage: For storing user data

## Notes

- This is a client-side only implementation
- User data is stored in the browser's localStorage
- In a production environment, you would want to add server-side validation and a proper database