import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/App/HomeScreen';

// --- Define Types for Navigation ---
// You can define the types of parameters each screen expects if you pass params
// e.g., type AuthStackParamList = { Login: undefined; Register: undefined; };
// type AppStackParamList = { Home: undefined; TaskDetail: { taskId: string }; };

// For now, use 'any' for simplicity, but define specific types later
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  // Add other screen names here as you create them
  // TaskList: undefined;
  // TaskDetail: { taskId: string };
};


// Create stack navigators with defined types (or 'any' if not specific)
const AuthStack = createStackNavigator<RootStackParamList>();
const AppStack = createStackNavigator<RootStackParamList>(); // Using the same param list for simplicity here

// --- Stack Navigator for Authentication Screens ---
const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    {/* screen name must match key in RootStackParamList */}
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// --- Stack Navigator for Main Application Screens ---
const AppStackScreen = () => (
  <AppStack.Navigator>
    {/* screen name must match key in RootStackParamList */}
    <AppStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Progress Ritual' }} // Example title
    />
    {/* Add Task List, Task Detail, etc. screens here */}
  </AppStack.Navigator>
);

// --- Main App Navigator (Switches between Auth and App stacks) ---
// Use React.FC for the component
const AppNavigator: React.FC = () => {
  // Get authentication state from your AuthContext (typed by useAuth hook)
  const { user } = useAuth();

  return (
    user ? 
      <AppStackScreen />
     : 
      <AuthStackScreen />
    
  );
};  

export default AppNavigator;