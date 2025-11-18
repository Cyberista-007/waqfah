
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { Functions, getFunctions } from 'firebase/functions';

import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { HomePageSkeleton } from '@/components/skeletons';
import type { UserProfile } from '@/lib/types';
import { firebaseConfig } from './config';

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

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 * It now handles its own initialization to prevent race conditions.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [services, setServices] = useState<{
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
    functions: Functions;
  } | null>(null);

  const [userAuthState, setUserAuthState] = useState<{
    user: User | null;
    isUserLoading: boolean;
    userError: Error | null;
  }>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  // Effect to initialize Firebase services ONCE.
  useEffect(() => {
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
    
    setServices(getFirebaseServices());
  }, []); // Empty dependency array ensures this runs only once.

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!services) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Firebase services not initialized.") });
      return;
    }

    const { auth, firestore } = services;
    
    // Set initial user state synchronously if available
    if (auth.currentUser) {
        setUserAuthState(prev => ({ ...prev, user: auth.currentUser, isUserLoading: true }));
    }

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
  }, [services]); // This effect depends on the services being initialized.

  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp: services?.app || null,
    firestore: services?.firestore || null,
    auth: services?.auth || null,
    functions: services?.functions || null,
    ...userAuthState,
  }), [services, userAuthState]);

  // Render a loading state until services are ready AND the initial user check is complete.
  if (!services || userAuthState.isUserLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
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
export const useAuth = (): Auth => {
  const { auth } = useFirebaseContext();
  if (!auth) throw new Error("Auth service not available.");
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebaseContext();
  if (!firestore) throw new Error("Firestore service not available.");
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebaseContext();
  if (!firebaseApp) throw new Error("Firebase App not available.");
  return firebaseApp;
};

/** Hook to access Firebase Functions instance. */
export const useFunctions = (): Functions => {
  const { functions } = useFirebaseContext();
  if (!functions) throw new Error("Functions service not available.");
  return functions;
};

/**
 * A memoization hook that is stable across renders for Firebase objects.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
