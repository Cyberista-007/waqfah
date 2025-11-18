
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const ADMIN_PASSWORD = "abdoR3d@";
const SESSION_STORAGE_KEY = 'isAdminAuthenticated';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only once on the client-side
    const sessionValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionValue === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const checkAdminPassword = useCallback(async (): Promise<boolean> => {
    // If already admin, no need to ask again
    if (isAdmin) {
      return true;
    }

    const password = prompt("يرجى إدخال كلمة مرور المدير للوصول:");
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      setIsAdmin(true);
      toast({ title: "أهلاً بك أيها المدير!", description: "تم منح صلاحيات الوصول." });
      return true;
    } else if (password !== null) { // User entered something but it was wrong
      toast({ variant: "destructive", title: "كلمة مرور خاطئة", description: "ليس لديك الصلاحيات اللازمة للوصول." });
      return false;
    } else { // User cancelled the prompt
      return false;
    }
  }, [isAdmin, toast]);

  return { isAdmin, isLoading, checkAdminPassword };
}
