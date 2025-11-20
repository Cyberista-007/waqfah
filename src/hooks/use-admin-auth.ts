
"use client";

import { useState, useEffect, useCallback } from 'react';

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

// Check if admin credentials are provided via environment variables.
const credentialsProvided = ADMIN_USERNAME && ADMIN_PASSWORD;

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If no credentials are set in the environment, admin access is disabled by default.
    if (!credentialsProvided) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }
    // Check session storage for an existing admin session.
    try {
        const adminSession = sessionStorage.getItem('admin-session');
        if (adminSession === 'true') {
            setIsAdmin(true);
        }
    } catch (e) {
        console.error("Session storage is not available.");
    }
    setIsLoading(false);
  }, []);

  const loginAdmin = useCallback(async (username, password) => {
    if (!credentialsProvided) {
      console.error("Admin credentials are not configured on the server.");
      return false;
    }
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        try {
            sessionStorage.setItem('admin-session', 'true');
            setIsAdmin(true);
            return true;
        } catch(e) {
            console.error("Session storage is not available.");
            // Still allow login if session storage fails, but it won't persist.
            setIsAdmin(true);
            return true;
        }
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    try {
        sessionStorage.removeItem('admin-session');
    } catch(e) {
        console.error("Session storage is not available.");
    }
    setIsAdmin(false);
  }, []);

  return { isAdmin, isLoading, loginAdmin, logoutAdmin };
}
