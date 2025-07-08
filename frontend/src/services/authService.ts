// --- API Functions for Authentication Endpoints ---

import api from ".";
import { AuthSuccessResponse } from "../types/apiResponse";

export const registerUser = async (email: string, password: string, username: string): Promise<AuthSuccessResponse> => {
    // Send a POST request to the /api/auth/register endpoint
    const response = await api.post('/auth/register', { email, password, username });
    return response.data; // Return the response data (which includes the token and user info)
};

export const loginUser = async (email: string, password: string): Promise<AuthSuccessResponse> => {
    // Send a POST request to the /api/auth/login endpoint
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Return the response data (which includes the token and user info)
};

// Add API functions for Task endpoints here later
// export const getTasks = async () => { ... }
// export const createTask = async (taskData) => { ... }
// etc.

// Export the api instance itself if needed, though exporting specific functions is often cleaner
export default api;