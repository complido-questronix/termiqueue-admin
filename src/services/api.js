import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://44.202.107.196:8080';

// --- AUTH FUNCTIONS ---
export const loginAPI = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
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