

'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { Functions, getFunctions } from 'firebase/functions';

import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { HomePageSkeleton } from '@/components/skeletons';
import type { UserProfile } from '@/lib/types';
import { firebaseConfig } from './config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  functions: Functions | null;
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

// This function ensures Firebase is initialized only once.
const getFirebaseServices = () => {
  if (getApps().length) {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const functions = getFunctions(app);
    return { app, auth, firestore, functions };
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
  return { app, auth, firestore, functions };
};


/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 * It now handles its own initialization to prevent race conditions.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  // Initialize services immediately and synchronously.
  // This is safe because getFirebaseServices handles the singleton pattern.
  const services = useMemo(() => getFirebaseServices(), []);

  const [userAuthState, setUserAuthState] = useState<{
    user: User | null;
    isUserLoading: boolean;
    userError: Error | null;
  }>({
    user: null,
    isUserLoading: true,
    userError: null,
  });


  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!services) return;

    const { auth, firestore } = services;
    
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userRef = doc(firestore, "users", firebaseUser.uid);
          try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              const newUserProfile: Omit<UserProfile, 'id'> = {
                name: firebaseUser.displayName || "مستخدم جديد",
                email: firebaseUser.email!,
                photoURL: firebaseUser.photoURL || '',
                createdAt: Timestamp.now(),
              };
              await setDoc(userRef, newUserProfile);
            }
          } catch (e) {
            console.error("Error checking or creating user profile:", e);
          }
        }
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [services]);

  const contextValue = useMemo(() => {
    return {
      firebaseApp: services.app,
      firestore: services.firestore,
      auth: services.auth,
      functions: services.functions,
      ...userAuthState,
    }
  }, [services, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {contextValue.isUserLoading ? <HomePageSkeleton /> : children}
    </FirebaseContext.Provider>
  );
};

// Generic hook to access the raw context
const useFirebaseContext = (): FirebaseContextState => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebaseContext must be used within a FirebaseProvider.');
    }
    return context;
}

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => {
  const context = useContext(FirebaseContext);
  return context?.auth ?? null;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
  return context?.firestore ?? null;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useContext(FirebaseContext);
  return context?.firebaseApp ?? null;
};

/** Hook to access Firebase Functions instance. */
export const useFunctions = (): Functions | null => {
  const context = useContext(FirebaseContext);
  return context?.functions ?? null;
};

/**
 * A memoization hook that is stable across renders for Firebase objects.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
