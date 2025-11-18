
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

const SESSION_STORAGE_KEY = 'isAdminAuthenticated';

export function useAdminActivation() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on component mount to check session storage.
    const sessionValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionValue === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const checkAdminPassword = useCallback(() => {
    if (isAdmin) {
      setIsLoading(false);
      return;
    }

    const password = prompt("للوصول إلى لوحة التحكم، يرجى إدخال كلمة مرور المدير:");
    
    // Check if a password was entered and if it's correct
    if (password === 'abdoR3d@') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      setIsAdmin(true);
      toast({ title: "تم تفعيل وضع المدير بنجاح!" });
       // No redirect here, the guard component will handle rendering.
    } else {
      // Only show error if a password was entered but was incorrect.
      // If the user cancels (password === null), do nothing and redirect.
      if (password !== null) { 
        toast({ variant: 'destructive', title: "كلمة المرور غير صحيحة." });
      }
      // Redirect to home if the check fails for any reason.
      router.replace('/');
    }
    // We don't set loading to false here because the guard's state will change
    // and cause a re-render anyway.
  }, [isAdmin, router, toast]);

  const deActivateAdmin = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, isLoading, checkAdminPassword, deActivateAdmin };
}
