
'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * This component ensures that FirebaseProvider, which handles its own initialization,
 * is only rendered on the client side.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
