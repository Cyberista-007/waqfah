"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/session';


export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const session = await getSession();
      setIsAdmin(!!session);
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const loginAdmin = useCallback(async (username, password) => {
    const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        setIsAdmin(true);
        return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(async () => {
     await fetch('/api/admin/logout', { method: 'POST' });
     setIsAdmin(false);
     clearSession(); // Immediately clear client-side state
     router.push('/');
  }, [router]);

  return { isAdmin, isLoading, loginAdmin, logoutAdmin };
}
