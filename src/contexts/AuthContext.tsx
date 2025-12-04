import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import api from '@/services/api';

// Firebase configuration from environment
// TODO: Initialize Firebase with these config values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await api.getCurrentUser();
          if (response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('auth_token');
          }
        } catch (err) {
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await api.getCurrentUser();
    if (response.data) {
      setUser(response.data);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement Firebase email/password sign-in
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // const idToken = await userCredential.user.getIdToken();
      
      // For now, simulate the flow
      // In production, this would be:
      // const response = await api.exchangeFirebaseToken(idToken);
      
      console.log('TODO: Implement Firebase email/password login');
      console.log('Firebase config:', firebaseConfig);
      
      // Placeholder - remove in production
      setError('Firebase authentication not configured. Please set up Firebase credentials.');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement Firebase Google sign-in
      // const provider = new GoogleAuthProvider();
      // const userCredential = await signInWithPopup(auth, provider);
      // const idToken = await userCredential.user.getIdToken();
      // const response = await api.exchangeFirebaseToken(idToken);
      
      console.log('TODO: Implement Firebase Google login');
      console.log('Firebase config:', firebaseConfig);
      
      // Placeholder - remove in production
      setError('Firebase authentication not configured. Please set up Firebase credentials.');
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement Firebase email/password sign-up
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // const idToken = await userCredential.user.getIdToken();
      // const response = await api.exchangeFirebaseToken(idToken);
      
      console.log('TODO: Implement Firebase signup');
      
      // Placeholder - remove in production
      setError('Firebase authentication not configured. Please set up Firebase credentials.');
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // TODO: Sign out from Firebase
    // await signOut(auth);
    
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        loginWithGoogle,
        signup,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
