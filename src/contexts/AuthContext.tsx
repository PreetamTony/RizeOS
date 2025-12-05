// src/contexts/AuthContext.tsx
import { auth } from '@/lib/firebase';
import api from '@/services/api';
import type { User } from '@/types';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await api.exchangeFirebaseToken(idToken);
          if (response.data) {
            localStorage.setItem('auth_token', response.data.token);
            setUser(response.data.user);
          } else {
            console.error('Backend authentication failed:', response.error);
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        } catch (err) {
          console.error('Failed to authenticate with backend:', err);
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await api.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Failed to refresh user:', err);
        setUser(null);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const response = await api.exchangeFirebaseToken(idToken);
      if (response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Backend authentication failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      const response = await api.exchangeFirebaseToken(idToken);
      if (response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Backend authentication failed');
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase profile with name
      if (auth.currentUser) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(auth.currentUser, { displayName: name });
      }

      const idToken = await userCredential.user.getIdToken(true); // Force refresh to get updated token with name
      const response = await api.exchangeFirebaseToken(idToken);
      if (response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Backend authentication failed');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'Signup failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMessage = err.message.replace('Firebase: ', '').replace(' (auth/email-already-in-use).', '');
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
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