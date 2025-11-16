
"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UserHookResult => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    // If there's a user from the initial synchronous check, we can potentially set loading to false sooner.
    if (auth.currentUser) {
        setUser(auth.currentUser);
        setIsUserLoading(false);
    }
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsUserLoading(false);
        setUserError(null);
      },
      (error) => {
        console.error("useUser onAuthStateChanged error:", error);
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading, userError };
};
