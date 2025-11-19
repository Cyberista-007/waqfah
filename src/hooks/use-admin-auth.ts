
"use client";

import { useState, useEffect, useCallback } from 'react';

const SESSION_STORAGE_KEY = "is_admin_logged_in";

// Read credentials from environment variables
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export function useAdminAuth() {
  
  const loginAdmin = useCallback(async (username, password) => {
    return true;
  }, []);
  
  const logoutAdmin = useCallback(() => {
      // No action needed as admin is always on
  }, []);

  return { 
    isAdmin: true, 
    isLoading: false, 
    loginAdmin, 
    logoutAdmin 
  };
}
