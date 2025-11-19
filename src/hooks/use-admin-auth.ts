
"use client";

import { useState, useEffect, useCallback } from 'react';

// Admin access is now open. This hook always returns true for isAdmin.

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loginAdmin = useCallback(async (username, password) => {
    // Always returns true, no credential check.
    setIsAdmin(true);
    return true;
  }, []);

  const logoutAdmin = useCallback(() => {
    // This function no longer needs to do anything significant.
    setIsAdmin(false); // Can be set to false, but on next load will be true again.
  }, []);

  // isLoading is set to false as we no longer check session storage.
  return { isAdmin: true, isLoading: false, loginAdmin, logoutAdmin };
}
