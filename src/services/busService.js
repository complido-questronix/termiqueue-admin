import axios from 'axios';

const API_BASE_URL = "http://44.202.107.196:8080";

export const fetchAllBuses = async () => {
  try {
    // This hits the /buses/ endpoint you showed in your API screenshot
    const response = await axios.get(`${API_BASE_URL}/buses/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching buses:", error);
    return [];
  }
};