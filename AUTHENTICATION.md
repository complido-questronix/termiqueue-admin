# Authentication Implementation Guide

## Overview

This project uses JWT-based authentication with support for access and refresh tokens. The implementation is ready for API integration and includes mock functionality for development.

## File Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Authentication state management
├── services/
│   └── api.js                   # Axios instance with interceptors
├── utils/
│   └── auth.js                  # Token management utilities
├── components/
│   └── Login.jsx                # Login form component
└── styles/
    └── Login.scss               # Login page styles
```

## Key Features

✅ **JWT Token Management** - Access & refresh tokens  
✅ **Automatic Token Refresh** - Intercepts 401 errors and refreshes tokens  
✅ **Protected Routes** - Only authenticated users can access the app  
✅ **Persistent Sessions** - Uses localStorage to maintain login state  
✅ **Request Interceptors** - Automatically adds auth headers to API calls  
✅ **Mock Login** - Works without backend (for development)  

## How It Works

### 1. Authentication Flow

```
User enters credentials → Login API call → Receive tokens → 
Store tokens in localStorage → Update AuthContext → Redirect to Dashboard
```

### 2. API Request Flow

```
Make API request → Axios interceptor adds Bearer token → 
If 401 error → Try to refresh token → Retry original request → 
If refresh fails → Logout user
```

## Usage

### Login (Mock Mode)

Currently, the app uses mock authentication. Enter any email and password to login:

```jsx
// Example:
Email: admin@example.com
Password: anything
```

### Accessing Auth State

Use the `useAuth` hook in any component:

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
    </div>
  );
}
```

### Making Authenticated API Calls

Use the `api` instance from `services/api.js`:

```jsx
import api from '../services/api';

// GET request
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// POST request
const createItem = async (data) => {
  try {
    const response = await api.post('/items', data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

The `api` instance automatically:
- Adds `Authorization: Bearer <token>` header
- Refreshes tokens on 401 errors
- Handles token expiration

## Integrating with Your Backend

### Step 1: Update API URL

Create a `.env` file (copy from `.env.example`):

```env
VITE_API_URL=https://your-api-url.com/api
```

### Step 2: Update Login API Call

In `src/services/api.js`, replace the mock login:

```javascript
export const loginAPI = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
```

Expected response format:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### Step 3: Update Token Refresh Endpoint

In `src/services/api.js`, update the refresh endpoint path:

```javascript
const response = await axios.post(
  `${api.defaults.baseURL}/auth/refresh`,  // Update this path
  { refreshToken }
);
```

### Step 4: Update Get Current User

```javascript
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
```

### Step 5: Update Logout API

```javascript
export const logoutAPI = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
```

## Backend API Requirements

Your backend should provide these endpoints:

### POST /auth/login
```javascript
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { ... }
}
```

### POST /auth/refresh
```javascript
Request:
{
  "refreshToken": "..."
}

Response:
{
  "accessToken": "..."
}
```

### GET /auth/me
```javascript
Headers:
Authorization: Bearer <accessToken>

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

### POST /auth/logout (Optional)
```javascript
Headers:
Authorization: Bearer <accessToken>

Response:
{
  "success": true
}
```

## Token Management

### Stored Tokens

The app stores three items in localStorage:
- `accessToken` - Short-lived token for API requests
- `refreshToken` - Long-lived token for getting new access tokens
- `user` - User data object

### Using Token Utilities

```javascript
import { 
  getAccessToken, 
  isTokenExpired, 
  clearAuth 
} from '../utils/auth';

// Get current token
const token = getAccessToken();

// Check if expired
if (isTokenExpired(token)) {
  clearAuth();
}
```

## Security Best Practices

1. **Use HTTPS** in production
2. **Short-lived access tokens** (5-15 minutes)
3. **Longer refresh tokens** (7-30 days)
4. **Store tokens in httpOnly cookies** (more secure than localStorage)
5. **Implement CSRF protection**
6. **Rate limit** login attempts
7. **Use secure password** requirements

## Customization

### Adding Registration

Create a `Register.jsx` component similar to `Login.jsx`:

```jsx
export const registerAPI = async (name, email, password) => {
  const response = await api.post('/auth/register', { 
    name, 
    email, 
    password 
  });
  return response.data;
};
```

### Adding Password Reset

```jsx
export const forgotPasswordAPI = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordAPI = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { 
    token, 
    newPassword 
  });
  return response.data;
};
```

### Adding Role-Based Access

Update `AuthContext.jsx`:

```jsx
export const hasRole = (requiredRole) => {
  return user?.role === requiredRole;
};

export const hasPermission = (permission) => {
  return user?.permissions?.includes(permission);
};
```

## Troubleshooting

### Issue: "No user found" error on refresh
- Check that `getCurrentUser` API is working
- Verify token is being sent in headers
- Check token hasn't expired

### Issue: Infinite refresh loop
- Verify refresh token endpoint is correct
- Check refresh token is valid
- Ensure refresh token isn't expired

### Issue: 401 errors not triggering refresh
- Check axios interceptor is properly configured
- Verify API returns 401 status code
- Check `_retry` flag isn't preventing retry

## Next Steps

1. ✅ Set up your backend API
2. ✅ Update environment variables
3. ✅ Replace mock API calls with real endpoints
4. ✅ Test login/logout flow
5. ✅ Implement registration and password reset
6. ✅ Add role-based access control
7. ✅ Configure production deployment
