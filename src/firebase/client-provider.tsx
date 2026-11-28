'use client';

import React, { useEffect, ReactNode } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Ensures Firebase is initialized once on the client without blocking
 * Server-Side Rendering or initial HTML paint.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error(
        `Global Error: ${event.message}\nFile: ${event.filename}\nLine: ${event.lineno}:${event.colno}\nStack: ${event.error?.stack}`
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error(
        `Unhandled Promise Rejection: ${event.reason?.message || event.reason}\nStack: ${event.reason?.stack}`
      );
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    try {
      if (!getApps().length) {
        initializeApp(firebaseConfig);
      }
    } catch (e: any) {
      console.error('FirebaseClientProvider: Failed to initialize Firebase:', e?.message);
    }

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
