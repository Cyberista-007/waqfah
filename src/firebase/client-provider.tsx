
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
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <HomePageSkeleton />;
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
