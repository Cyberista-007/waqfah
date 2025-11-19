'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
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
  services: FirebaseServices | null;
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
 * It now handles its own initialization to prevent race conditions.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [services, setServices] = useState<FirebaseServices | null>(null);
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
    // This function ensures Firebase is initialized only once.
    const getFirebaseServices = () => {
        if (getApps().length) {
            const app = getApp();
            const auth = getAuth(app);
            const firestore = getFirestore(app);
            const functions = getFunctions(app);
            const storage = getStorage(app);
            return { app, auth, firestore, functions, storage };
        }

        const app = initializeApp(firebaseConfig);
        let auth: Auth;
        try {
            auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
        } catch (e) {
            auth = getAuth(app);
        }
        const firestore = getFirestore(app);
        const functions = getFunctions(app);
        const storage = getStorage(app);
        return { app, auth, firestore, functions, storage };
    };

    const s = getFirebaseServices();
    setServices(s);

    const unsubscribe = onAuthStateChanged(
      s.auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userRef = doc(s.firestore, "users", firebaseUser.uid);
          try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              const newUserProfile: Omit<UserProfile, 'id'> = {
                name: firebaseUser.displayName || "مستخدم جديد",
                email: firebaseUser.email!,
                photoURL: firebaseUser.photoURL || '',
                createdAt: Timestamp.now(),
                role: 'user', // Set default role
              };
              await setDoc(userRef, newUserProfile);
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
  }, []);

  const contextValue = useMemo(() => ({
      services,
      ...authState,
  }), [services, authState]);

  // Render a loading state until both Firebase services and user auth are resolved.
  if (!contextValue.services || contextValue.isUserLoading) {
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
export const useAuth = (): Auth | null => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.services?.auth ?? null;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.services?.firestore ?? null;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.services?.app ?? null;
};

/** Hook to access Firebase Functions instance. */
export const useFunctions = (): Functions | null => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFunctions must be used within a FirebaseProvider');
  }
  return context.services?.functions ?? null;
};

/** Hook to access Firebase Storage instance. */
export const useStorage = (): FirebaseStorage | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a FirebaseProvider');
    }
    return context.services?.storage ?? null;
};

/**
 * A memoization hook that is stable across renders for Firebase objects.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
