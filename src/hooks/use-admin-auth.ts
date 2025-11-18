
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

const SESSION_STORAGE_KEY = 'isAdminAuthenticated';

export function useAdminActivation() {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check session storage on component mount
    const sessionValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionValue === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const checkAdminPassword = useCallback(() => {
    // If user is not logged in, do nothing. Let the guard handle redirection.
    if (!user) {
        return;
    }
    // If already admin, no need to ask again.
    if (isAdmin) {
      setIsLoading(false);
      return;
    }

    const password = prompt("يرجى إدخال كلمة مرور المدير للوصول:");
    
    if (password === 'abdoR3d@') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      setIsAdmin(true);
      toast({ title: "تم تفعيل وضع المدير بنجاح!" });
    } else {
      if (password !== null) { // User entered something but it was wrong
        toast({ variant: 'destructive', title: "كلمة المرور غير صحيحة." });
      }
      // If user cancelled or entered wrong password, redirect them away.
      router.replace('/');
    }
    setIsLoading(false);
  }, [user, isAdmin, router, toast]);

  const deActivateAdmin = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, isLoading, checkAdminPassword, deActivateAdmin };
}
