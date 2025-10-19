import React from 'react';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Navigation() {
  const { user, isLoading } = useAuth();

  if (isLoading) return < LoadingSpinner/>; // Or a loading spinner

  return user ? <MainNavigator /> : <AuthNavigator />;
}
