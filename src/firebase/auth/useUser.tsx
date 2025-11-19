
"use client";

import { useContext } from 'react';
import { User } from 'firebase/auth';
import { FirebaseContext } from '@/firebase/provider';

interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    // This is the critical change. Instead of returning a loading state,
    // we throw an error. This ensures that any component using this hook
    // MUST be a child of FirebaseProvider and will only render when the
    // context is actually available, preventing race conditions.
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  const { user, isUserLoading, userError } = context;
  return { user, isUserLoading, userError };
};
