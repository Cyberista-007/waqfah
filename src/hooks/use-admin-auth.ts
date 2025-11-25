
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


export function useAdminAuth() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const [isAdmin, setIsAdmin] = useState(false);
  
  const isLoading = isAuthLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading && userProfile) {
      setIsAdmin(userProfile.role === 'admin');
    } else if (!isLoading && !user) {
      // If user is not logged in, they are not an admin
      setIsAdmin(false);
    }
  }, [isLoading, userProfile, user]);

  return { isAdmin, isLoading };
}
