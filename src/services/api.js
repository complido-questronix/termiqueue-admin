import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', // Change this to your API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;

        // Update stored token
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const loginAPI = async (email, password) => {
  // MOCK LOGIN - Replace this with your actual API call
  // Example: const response = await api.post('/auth/login', { email, password });
  
  // For now, simulate API call with setTimeout
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock successful login
      if (email && password) {
        resolve({
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          user: {
            id: 1,
            name: 'John Doe',
            email: email,
            role: 'admin',
          },
        });
      } else {
        reject({ response: { data: { message: 'Invalid credentials' } } });
      }
    }, 1000);
  });
  
  // When you have a real API, uncomment this:
  // const response = await api.post('/auth/login', { email, password });
  // return response.data;
};

export const logoutAPI = async () => {
  // MOCK LOGOUT - Replace with actual API call if needed
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 500);
  });
  
  // When you have a real API, uncomment this:
  // const response = await api.post('/auth/logout');
  // return response.data;
};

export const getCurrentUser = async () => {
  // MOCK - Replace with actual API call
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  throw new Error('No user found');
  
  // When you have a real API, uncomment this:
  // const response = await api.get('/auth/me');
  // return response.data;
};

// Example API calls for your app
export const fetchDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const fetchRequests = async (page = 1, limit = 10) => {
  const response = await api.get('/requests', {
    params: { page, limit },
  });
  return response.data;
};

export const createRequest = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data;
};

export const updateRequest = async (id, requestData) => {
  const response = await api.put(`/requests/${id}`, requestData);
  return response.data;
};

export const deleteRequest = async (id) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};

export default api;
