import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import Navigation from './src/navigation';
import { PaperProvider } from 'react-native-paper';

// Use React.FC for the component
const App: React.FC = () => {
  return (
    // Wrap the entire app with the Paper Provider, passing your custom theme
    <PaperProvider>
      {/* Wrap the part of the app that needs auth state with AuthProvider */}
      <AuthProvider>
        {/* The AppNavigator lives inside AuthProvider and uses the auth state */}
        <Navigation />
      </AuthProvider>
    </PaperProvider>
  );
}

export default App;