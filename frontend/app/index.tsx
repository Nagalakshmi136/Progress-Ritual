import React from 'react';
import { PaperProvider } from 'react-native-paper';
import Navigation from '@/src/navigation';
import { AuthProvider } from '@/src/context/AuthContext';
import SafeScreen from '@/src/components/SafeScreen';

// Use React.FC for the component
const App: React.FC = () => {
  return (
    // Wrap the entire app with the Paper Provider, passing your custom theme
    <PaperProvider>
      {/* Wrap the part of the app that needs auth state with AuthProvider */}
      <AuthProvider>
        <SafeScreen>
          {/* The AppNavigator lives inside AuthProvider and uses the auth state */}
          <Navigation />
        </SafeScreen>
      </AuthProvider>
    </PaperProvider>
  );
}

export default App;