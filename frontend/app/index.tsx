import React from 'react';
import { DefaultTheme as PaperDefaultTheme, Provider as PaperProvider } from 'react-native-paper'; // Import necessary types and configureFonts
import { AuthProvider } from '../src/context/AuthContext'; // Adjust the import path as needed
import AppNavigator from '../src/navigation/AppNavigator';

import { colors } from '../src/themes/colors'; // Import your custom colors

// --- Configure React Native Paper Theme ---
// Define a custom theme structure for PaperProvider if needed
const CustomPaperTheme = {
  ...PaperDefaultTheme, // Start with Paper's default theme
  colors: {
    ...PaperDefaultTheme.colors, // Keep Paper's default colors
    // Override Paper's colors with your theme colors
    primary: colors.primary, // Your primary color
    accent: colors.secondary, // Your accent color
    background: colors.background, // Your background color
    surface: colors.surface, // Your surface color
    text: colors.text, // Your primary text color
    onSurface: colors.text, // Text color on surface (e.g., text in inputs)
    onBackground: colors.text, // Text color on background
    error: colors.error, // Your error color
    // You might want to map other colors like 'placeholder', 'disabled', etc.
  },
  // Add other custom theme properties for Paper components if needed
};


// Use React.FC for the component
const App: React.FC = () => {
  return (
    // Wrap the entire app with the Paper Provider, passing your custom theme
    <PaperProvider theme={CustomPaperTheme}>
      {/* Wrap the part of the app that needs auth state with AuthProvider */}
      <AuthProvider>
        {/* The AppNavigator lives inside AuthProvider and uses the auth state */}
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}

export default App;