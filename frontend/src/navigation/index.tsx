import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { user } = useAuth();  
  return (
      user ? <MainNavigator /> : <AuthNavigator />
  );
}
