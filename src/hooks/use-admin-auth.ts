
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
    
    if (password === 'abdoR3d@') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      setIsAdmin(true);
      toast({ title: "تم تفعيل وضع المدير بنجاح!" });
    } else {
      if (password !== null) { 
        toast({ variant: 'destructive', title: "كلمة المرور غير صحيحة." });
      }
      router.replace('/');
    }
    setIsLoading(false);
  }, [isAdmin, router, toast]);

  const deActivateAdmin = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, isLoading, checkAdminPassword, deActivateAdmin };
}
