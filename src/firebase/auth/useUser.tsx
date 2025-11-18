
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
    // This can happen on first render before context is available.
    // Return a loading state instead of throwing an error.
    return { user: null, isUserLoading: true, userError: null };
  }
  const { user, isUserLoading, userError } = context;
  return { user, isUserLoading, userError };
};
