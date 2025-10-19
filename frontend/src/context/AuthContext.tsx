import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser } from '../services/authService';
import { useTaskStore } from '../store/taskStore';
import { authEvents } from '../services';

interface UserData {
  id: string;
  email: string;
  username?: string;
  points?: number;
}

interface AuthContextValue {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { syncOfflineTasks } = useTaskStore.getState();

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserJson = await AsyncStorage.getItem('user');
        if (storedToken && storedUserJson) {
          const storedUser: UserData = JSON.parse(storedUserJson);
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        await AsyncStorage.multiRemove(['token', 'user']);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      // ✅ Trigger offline sync for this user
      await syncOffline();

    } catch (error: any) {
      await AsyncStorage.multiRemove(['token', 'user']);
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, username: string): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await registerUser(email, password, username);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      // ✅ Trigger offline sync for this user
      await syncOffline();

    } catch (error: any) {
      await AsyncStorage.multiRemove(['token', 'user']);
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // --- EFFECT TO LISTEN FOR GLOBAL LOGOUT EVENT ---
  useEffect(() => {
    // Define the listener function
    const onLogout = () => {
      console.log("AuthContext received logout event from API service.");
      handleLogout();
    };

    // Add the listener
    authEvents.addListener('logout', onLogout);

    // IMPORTANT: Return a cleanup function to remove the listener when the component unmounts
    return () => {
      authEvents.removeListener('logout', onLogout);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
