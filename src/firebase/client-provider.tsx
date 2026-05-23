
'use client';

import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';
import { HomePageSkeleton } from '@/components/skeletons';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// This new provider ensures that Firebase is initialized only once on the client
// and prevents re-renders from causing re-initializations.
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      alert(`Global Error: ${event.message}\nFile: ${event.filename}\nLine: ${event.lineno}:${event.colno}\nStack: ${event.error?.stack}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      alert(`Unhandled Promise Rejection: ${event.reason?.message || event.reason}\nStack: ${event.reason?.stack}`);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    try {
      if (!getApps().length) {
        initializeApp(firebaseConfig);
      }
    } catch (e: any) {
      alert("FirebaseClientProvider: Failed to initialize Firebase: " + e.message + "\n" + e.stack);
    }
    
    setIsInitialized(true);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isInitialized) {
    return <HomePageSkeleton />;
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
