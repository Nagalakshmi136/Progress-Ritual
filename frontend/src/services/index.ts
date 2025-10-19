import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Global Event Emitter for Auth Actions ---
// This is a simple event emitter to decouple the API layer from UI state.
// When a 401 happens, we'll emit a 'logout' event.
// Your AuthContext/Store will listen for this event and update its state.
import { EventEmitter } from 'events'; // Native Node.js module, available in React Native
export const authEvents = new EventEmitter();


// --- IMPORTANT: UPDATE THIS ---
// Replace with your deployed backend URL or your computer's local IP address
const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add a timeout for requests (e.g., 10 seconds)
});

// --- Request Interceptor (Refined) ---
// This interceptor will run before every request.
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // We get the token from AsyncStorage *every time*.
    // AsyncStorage is highly optimized and this is more reliable than in-memory caching for auth tokens.
    // This ensures that if the token is updated (e.g., on re-login), the next request gets the new one.
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error reading token from AsyncStorage", e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor (Refined) ---
api.interceptors.response.use(
  // For successful responses (2xx), just return the response
  (response: AxiosResponse) => response,

  // For error responses (4xx, 5xx), handle them globally
  async (error: AxiosError<any>) => {
    const { response, config } = error;

    // --- Global 401 Unauthorized Handling ---
    // If we get a 401, it means the token is invalid or expired.
    // We should log the user out globally.
    if (response && response.status === 401) {
      console.warn('⚠️ 401 Unauthorized detected. Token is invalid or expired. Logging out.');

      // Clear the token from storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      // --- EMIT LOGOUT EVENT ---
      // Instead of just clearing storage, we notify the rest of the app.
      authEvents.emit('logout');

      // It's often better to not reject the original promise here,
      // as it might cause unhandled promise rejection warnings in components
      // that weren't expecting a logout. The event emitter handles the state change.
      // However, for simplicity and to let the original caller know it failed, we'll still reject.
    }

    // Create a standardized error message
    const errorMessage = response?.data?.message || error.message || 'An unknown API error occurred';

    // It's good practice to re-throw a real Error object
    return Promise.reject(new Error(errorMessage));
  }
);


// We no longer need the imperative `setAuthToken` because the interceptor
// handles getting the token from AsyncStorage on every request. This is more declarative and reliable.

export default api;