import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'; // Import ReactNode type
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser } from '../apiService/authService';
import { View, Text } from 'react-native'; // Import View and Text for loading view
import { colors } from '../themes/colors'; // Import colors for loading view background/text

// --- Define Types ---

// Type for the user data stored in state and storage
interface UserData {
  id: string;
  email: string;
  username?: string;
}

// Type for the value provided by the AuthContext
interface AuthContextValue {
  user: UserData | null; // User is either UserData object or null
  token: string | null; // Token is string or null
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>; // Login function returns a Promise that resolves to void
  register: (email: string, password: string, username: string) => Promise<void>; // Register function returns a Promise that resolves to void
  logout: () => Promise<void>; // Logout function returns a Promise that resolves to void
}

// Create the Auth Context with an initial undefined value (will be set by provider)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Define props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode; // children prop type
}

// Create a provider component to wrap your app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null); // Specify state type
  const [token, setToken] = useState<string | null>(null); // Specify state type
  const [isLoading, setIsLoading] = useState<boolean>(true); // Specify state type

  // --- Function to check for token/user on app start ---
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserJson = await AsyncStorage.getItem('user'); // Get as string

        if (storedToken && storedUserJson) {
          // Parse the stored JSON string back to object and cast it to UserData type
          const storedUser: UserData = JSON.parse(storedUserJson);
          setToken(storedToken);
          setUser(storedUser);
          // In a real app, you might want to verify the token with the backend here
        }
      } catch (error) {
        console.error('Error loading auth data from storage:', error);
        // Optional: Clear storage if load fails to prevent loop
        await AsyncStorage.multiRemove(['token', 'user']);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // --- Login Function ---
  // Mark function as async and specify return type Promise<void>
  const handleLogin = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Call your backend login API, response is typed by api/index.ts
      const data = await loginUser(email, password);

      // Store token and user info (using specific types)
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user)); // Store user object as JSON string

      // Update state
      setToken(data.token);
      setUser(data.user);

    } catch (error: any) { // Catch error (typed as any for now, refine later)
      console.error('Login failed in context:', error.message);
      // Clear any partial storage if login failed after attempting API call
      await AsyncStorage.multiRemove(['token', 'user']);
      setToken(null);
      setUser(null);
      // Re-throw the error to be caught and displayed in the component
      throw error; // Throw the error caught from the API call
    } finally {
      setIsLoading(false);
    }
  };

  // --- Register Function ---
  // Mark function as async and specify return type Promise<void>
  const handleRegister = async (email: string, password: string, username: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Call your backend register API
      const data = await registerUser(email, password, username);

      // Store token and user info (optional - decide if auto-login after register)
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // Update state
      setToken(data.token);
      setUser(data.user);


    } catch (error: any) {
      console.error('Registration failed in context:', error.message);
      await AsyncStorage.multiRemove(['token', 'user']);
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logout Function ---
  // Mark function as async and specify return type Promise<void>
  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      // Clear state
      setToken(null);
      setUser(null);

    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Context Value ---
  // Explicitly define the type of the value object being provided
  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    // Provide the typed value
    <AuthContext.Provider value={value}>
      {/* Show a loading indicator while isLoading is true */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      ) : (
        // Render the children (your app navigator) when loading is complete
        children
      )}
    </AuthContext.Provider>
  );
};

// Hook to easily access the Auth Context value
// Add return type annotation
export const useAuth = (): AuthContextValue => {
  // Use useContext with the explicit context type
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Ensure the hook is used within the provider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};