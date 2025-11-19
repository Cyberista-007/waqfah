"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_PASSWORD = "admin"; // In a real app, this would come from a secure config
const SESSION_STORAGE_KEY = "is_admin_activated";

export function useAdminActivation() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check sessionStorage on initial load
  useEffect(() => {
    try {
      const storedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedState === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error("Session storage is not available.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateAdmin = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        setIsAdmin(true);
        return true;
      } catch (e) {
        console.error("Session storage is not available.");
        alert("لا يمكن تفعيل وضع المدير لأن التخزين المؤقت للمتصفح غير متاح.");
        return false;
      }
    }
    return false;
  }, []);
  
  const deActivateAdmin = useCallback(() => {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setIsAdmin(false);
      } catch (e) {
         console.error("Session storage is not available.");
      }
  }, []);

  return { isAdmin, isLoading, activateAdmin, deActivateAdmin };
}
