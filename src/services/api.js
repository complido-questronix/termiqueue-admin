import axios from 'axios';
import mockAuthData from '../data/authMockData.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://44.202.107.196:8080';

// --- AUTH FUNCTIONS ---
export const loginAPI = async (email, password) => {
<<<<<<< HEAD
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
            ...mockAuthData.user,
            email: email,
          },
        });
      } else {
        reject({ response: { data: { message: mockAuthData.errors.invalidCredentials } } });
      }
    }, 1000);
  });
  
  // When you have a real API, uncomment this:
  // const response = await api.post('/auth/login', { email, password });
  // return response.data;
=======
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
>>>>>>> dev-api
};

export const logoutAPI = async () => {
  return await axios.post(`${API_URL}/auth/logout`);
};

export const getCurrentUser = async () => {
  try {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    return null;
  }
};

// --- BUS FUNCTIONS (Add these to fix the Buses page crash) ---
export const fetchBuses = async () => {
  const response = await axios.get(`${API_URL}/buses/`);
  return response.data;
};

export const createBus = async (busData) => {
  const response = await axios.post(`${API_URL}/buses/`, busData);
  return response.data;
};

export const updateBus = async (id, busData) => {
  const response = await axios.put(`${API_URL}/buses/${id}`, busData);
  return response.data;
};

export const deleteBus = async (id) => {
  const response = await axios.delete(`${API_URL}/buses/${id}`);
  return response.data;
};