
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, initializeAuth, indexedDBLocalPersistence, getAuth } from 'firebase/auth';
import { Functions, getFunctions } from 'firebase/functions';
import { FirebaseStorage, getStorage } from 'firebase/storage';

import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { HomePageSkeleton } from '@/components/skeletons';
import type { UserProfile } from '@/lib/types';
import { firebaseConfig } from './config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';


interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    functions: Functions;
    storage: FirebaseStorage;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  services: FirebaseServices; // Now non-nullable
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// Props for the provider component
interface FirebaseProviderProps {
  children: ReactNode;
}

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 * It now assumes Firebase has been initialized by FirebaseClientProvider.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const services = useMemo(() => {
      const app = getApp();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      const functions = getFunctions(app);
      const storage = getStorage(app);
      return { app, auth, firestore, functions, storage };
  }, []);

  const [authState, setAuthState] = useState<{
    user: User | null;
    isUserLoading: boolean;
    userError: Error | null;
  }>({
    user: null,
    isUserLoading: true, // Start as loading
    userError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      services.auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userRef = doc(services.firestore, "users", firebaseUser.uid);
          try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              const newUserProfile: Omit<UserProfile, 'id' | 'role'> = {
                name: firebaseUser.displayName || "مستخدم جديد",
                email: firebaseUser.email!,
                photoURL: firebaseUser.photoURL || '',
                createdAt: Timestamp.now(),
              };
              await setDoc(userRef, {
                ...newUserProfile,
                role: 'user', // Set default role
              });
            }
          } catch (e) {
            console.error("Error checking or creating user profile:", e);
          }
        }
        setAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [services]);

  const contextValue = useMemo(() => ({
      services,
      ...authState,
  }), [services, authState]);

  // Render a loading state until user auth is resolved.
  if (contextValue.isUserLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.services.auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.services.firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.services.app;
};

/** Hook to access Firebase Functions instance. */
export const useFunctions = (): Functions => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFunctions must be used within a FirebaseProvider');
  }
  return context.services.functions;
};

/** Hook to access Firebase Storage instance. */
export const useStorage = (): FirebaseStorage => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a FirebaseProvider');
    }
    return context.services.storage;
};

/**
 * A memoization hook that is stable across renders for Firebase objects.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
