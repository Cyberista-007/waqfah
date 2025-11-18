
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

const SESSION_STORAGE_KEY = 'isAdminAuthenticated';

export function useAdminActivation() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on component mount to check session storage.
    try {
        const sessionValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionValue === 'true') {
          setIsAdmin(true);
        }
    } catch (e) {
        // sessionStorage is not available on the server
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
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        setIsAdmin(true);
        toast({ title: "تم تفعيل وضع المدير بنجاح!" });
      } catch (e) {
        toast({ variant: 'destructive', title: "خطأ في المتصفح", description: "لم نتمكن من حفظ جلسة المدير." });
      }
    } else {
      if (password !== null) { 
        toast({ variant: 'destructive', title: "كلمة المرور غير صحيحة." });
      }
      router.replace('/');
    }
  }, [isAdmin, router, toast]);

  const deActivateAdmin = useCallback(() => {
    try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
        // sessionStorage is not available on the server
    }
    setIsAdmin(false);
  }, []);

  return { isAdmin, isLoading, checkAdminPassword, deActivateAdmin };
}
