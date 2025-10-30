import { useAuth } from '../contexts/AuthContext';

export const useCurrentUser = () => {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error('useCurrentUser must be used within an authenticated context');
  }
  
  return user;
};