'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getAuth } from 'firebase/auth';
import { Functions, getFunctions } from 'firebase/functions';
import { FirebaseStorage, getStorage } from 'firebase/storage';

import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { HomePageSkeleton } from '@/components/skeletons';
import type { UserProfile } from '@/lib/types';
import { firebaseConfig } from './config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { CinematicAppLoader } from '@/components/skeletons';


interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    functions: Functions;
    storage: FirebaseStorage;
}

export interface FirebaseContextState {
  services: FirebaseServices | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
    const [services, setServices] = useState<FirebaseServices | null>(null);
    const [authState, setAuthState] = useState<{
        user: User | null;
        isUserLoading: boolean;
        userError: Error | null;
    }>({
        user: null,
        isUserLoading: true,
        userError: null,
    });

    useEffect(() => {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        const functions = getFunctions(app);
        const storage = getStorage(app);

        const loadedServices = { app, auth, firestore, functions, storage };
        setServices(loadedServices);

        const unsubscribe = onAuthStateChanged(
            auth,
            async (firebaseUser) => {
                if (firebaseUser) {
                    const userRef = doc(firestore, "users", firebaseUser.uid);
                    try {
                        const userSnap = await getDoc(userRef);
                        if (!userSnap.exists()) {
                            const newUserProfile: Omit<UserProfile, 'id' | 'role'> = {
                                name: firebaseUser.displayName || "مستخدم جديد",
                                email: firebaseUser.email!,
                                photoURL: firebaseUser.photoURL || '',
                                createdAt: Timestamp.now().toDate().toISOString() as any,
                                minutesListened: 0,
                                lecturesCompleted: 0,
                            };
                            await setDoc(userRef, {
                                ...newUserProfile,
                                role: 'user',
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
    }, []);

    const contextValue = useMemo(() => ({
        services,
        ...authState,
    }), [services, authState]);

    if (!services || authState.isUserLoading) {
        return <CinematicAppLoader />;
    }

    return (
        <FirebaseContext.Provider value={contextValue}>
            <FirebaseErrorListener />
            {children}
        </FirebaseContext.Provider>
    );
};

export const useAuth = (): Auth => {
  const context = useContext(FirebaseContext);
  if (context === undefined || !context.services) {
    throw new Error('useAuth must be used within a FirebaseProvider and after initialization');
  }
  return context.services.auth;
};

export const useFirestore = (): Firestore => {
  const context = useContext(FirebaseContext);
  if (context === undefined || !context.services) {
    throw new Error('useFirestore must be used within a FirebaseProvider and after initialization');
  }
  return context.services.firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const context = useContext(FirebaseContext);
  if (context === undefined || !context.services) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider and after initialization');
  }
  return context.services.app;
};

export const useFunctions = (): Functions => {
  const context = useContext(FirebaseContext);
  if (context === undefined || !context.services) {
    throw new Error('useFunctions must be used within a FirebaseProvider and after initialization');
  }
  return context.services.functions;
};

export const useStorage = (): FirebaseStorage => {
    const context = useContext(FirebaseContext);
    if (context === undefined || !context.services) {
        throw new Error('useStorage must be used within a FirebaseProvider and after initialization');
    }
    return context.services.storage;
};

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
