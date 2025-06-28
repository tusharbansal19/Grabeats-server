# GrabEats Server - Authentication System

This is a comprehensive authentication system for the GrabEats application with secure user management, JWT authentication, and role-based access control.

## Features

- **User Registration & Login**: Secure user authentication with password hashing
- **JWT Token Management**: Stateless authentication using JSON Web Tokens
- **Role-Based Access Control**: Support for user and admin roles
- **Input Validation**: Comprehensive validation using express-validator
- **Security Middleware**: Helmet for security headers and rate limiting
- **Profile Management**: Update profile and change password functionality
- **Account Status**: Active/inactive user account management

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT_NO=8000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/grabeats

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRE=30d
```

## API Endpoints

### Authentication Routes (`/grabeats`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| GET | `/health` | Health check | No |

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required environment variables

3. Start the server:
```bash
npm start
```

## Usage in Other Routes

To use the authentication middleware in other routes:

```javascript
const { protect, authorize } = require('./routes/grabeats');

// Protected route
router.get('/protected', protect, (req, res) => {
  // Access user info via req.user
});

// Admin only route
router.get('/admin', protect, authorize('admin'), (req, res) => {
  // Only admins can access
});
``` 