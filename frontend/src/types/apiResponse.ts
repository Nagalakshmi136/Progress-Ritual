
// --- Define Types for API Responses ---

// Type for the user data returned from auth endpoints (excluding password)
interface UserAuthData {
  id: string;
  email: string;
  username?: string; // Username might be optional
}

// Type for the success response body from login/register
interface AuthSuccessResponse {
  token: string;
  user: UserAuthData;
  message: string; // Backend sends a message
}

// Type for the error response body from backend
interface ApiErrorResponse {
  message: string; // Backend sends an error message
  status?: string; // Backend might send 'fail' or 'error'
  stack?: string; // Stack trace in development
}
export type { UserAuthData, AuthSuccessResponse, ApiErrorResponse };