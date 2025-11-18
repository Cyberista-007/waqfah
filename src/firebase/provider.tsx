
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import type { UserProfile } from '@/lib/types';
import { Functions } from 'firebase/functions';
import { HomePageSkeleton } from '@/components/skeletons';


// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  functions: Functions | null;
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// Props for the provider component
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  functions: Functions;
}

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  functions
}) => {
  const [userAuthState, setUserAuthState] = useState<{user: User | null, isUserLoading: boolean, userError: Error | null}>({
    user: auth.currentUser, // Initialize with current user if available
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  const areServicesReady = !!(firebaseApp && firestore && auth);

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!areServicesReady) {
        // If services aren't ready, don't set up the listener.
        setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Firebase services not available.") });
        return;
    }
    
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userRef = doc(firestore, "users", firebaseUser.uid);
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
        }
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth, firestore, areServicesReady]);

  const contextValue = useMemo((): FirebaseContextState => ({
    areServicesAvailable: areServicesReady,
    firebaseApp,
    firestore,
    auth,
    functions,
    ...userAuthState,
  }), [firebaseApp, firestore, auth, functions, userAuthState, areServicesReady]);
  
  // Render a loading state until both services are ready AND the initial user check is complete.
  // This prevents child components from trying to use Firebase before it's fully initialized.
  if (!areServicesReady || userAuthState.isUserLoading) {
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
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
