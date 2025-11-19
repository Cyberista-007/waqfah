
"use client";

import { useState, useEffect, useCallback } from 'react';

const SESSION_STORAGE_KEY = "is_admin_logged_in";

// Read credentials from environment variables
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
        const adminStatus = sessionStorage.getItem(SESSION_STORAGE_KEY);
        setIsAdmin(adminStatus === 'true');
    } catch(e) {
        console.error("Could not access session storage. Admin auth might not work correctly in SSR or restricted environments.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const loginAdmin = useCallback(async (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        setIsAdmin(true);
        return true;
      } catch (e) {
          console.error("Failed to set admin status in session storage.");
          // Still set state for current session even if storage fails
          setIsAdmin(true);
          return true;
      }
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
        console.error("Failed to remove admin status from session storage.");
    } finally {
        setIsAdmin(false);
    }
  }, []);

  return { isAdmin, isLoading, loginAdmin, logoutAdmin };
}
