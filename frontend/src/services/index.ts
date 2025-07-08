import axios, { AxiosResponse, AxiosError } from 'axios'; // Import Axios types
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiErrorResponse } from '../types/apiResponse';

// --- Configure your Backend API URL ---
// IMPORTANT: Replace 'YOUR_BACKEND_IP_OR_DOMAIN' with your backend's actual address
// If running locally on your computer:
// - Find your computer's local IP address (e.g., 192.168.1.x or 10.0.0.x)
// - Use that IP address here. 'localhost' works in the emulator, but not usually on physical devices.
// - If using ngrok or a deployed backend, use that URL.
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Example using IP and port


// Create an Axios instance configured for your backend
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// This function runs before every request sent by this api instance
api.interceptors.request.use(
  async (config) => {
    // Get the JWT token from AsyncStorage
    const token = await AsyncStorage.getItem('token');

    // If a token exists, add it to the Authorization header for protected routes
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Return the updated config
  },
  (error) => {
    // Handle request errors (e.g., network issues before sending)
    return Promise.reject(error);
  }
);

// --- Response Interceptor (Optional but Recommended) ---
// This function runs on every response received from the backend
api.interceptors.response.use(
  (response: AxiosResponse) => { // Add AxiosResponse type
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => { // Add AxiosError type with your error response body type
    console.error('API Response Error:', error.response?.data || error.message);

    if (error.response && error.response.status === 401) {
      console.warn('Received 401 Unauthorized. Token might be invalid or expired.');
      // In a real app, trigger logout here (needs access to AuthContext/navigation)
      // await AsyncStorage.removeItem('token');
      // await AsyncStorage.removeItem('user');
      // Navigate to login screen
    }

    // Re-throw a more specific error if possible
    // We can throw an Error object with the backend's message
    throw new Error(error.response?.data?.message || error.message || 'An unknown API error occurred');
  }
);

// --- Export the configured Axios instance ---
export default api;