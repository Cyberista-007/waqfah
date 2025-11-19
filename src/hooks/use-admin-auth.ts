
"use client";

import { useState, useEffect, useCallback } from 'react';

const SESSION_STORAGE_KEY = "is_admin_logged_in";

// Read credentials from environment variables
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check sessionStorage on initial component load
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

  const loginAdmin = useCallback(async (username, password) => {
    // Ensure credentials are set in environment variables
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        console.error("Admin credentials are not set in environment variables.");
        return false;
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        setIsAdmin(true);
        return true;
      } catch (e) {
        console.error("Session storage is not available.");
        alert("لا يمكن تسجيل الدخول كمدير لأن التخزين المؤقت للمتصفح غير متاح.");
        return false;
      }
    }
    return false;
  }, []);
  
  const logoutAdmin = useCallback(() => {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setIsAdmin(false);
      } catch (e) {
         console.error("Session storage is not available.");
      }
  }, []);

  return { isAdmin, isLoading, loginAdmin, logoutAdmin };
}
