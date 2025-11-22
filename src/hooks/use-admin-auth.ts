
"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';

const ADMIN_EMAIL = 'abdoreda6249@gmail.com';

export function useAdminAuth() {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs whenever the user loading state or the user object itself changes.
    if (!isUserLoading) {
      // Once we know the auth state is resolved
      setIsAdmin(user?.email === ADMIN_EMAIL);
      setIsLoading(false); // We are no longer loading
    }
  }, [isUserLoading, user]);

  return { isAdmin, isLoading };
}
