
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

const SESSION_STORAGE_KEY = 'isAdminAuthenticated';
const REQUIRED_CLICKS = 10;
const TIME_LIMIT_MS = 5000;

export function useAdminActivation() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const clickCount = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check session storage on initial client-side load
    const sessionValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionValue === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const handleAdminActivationClick = useCallback(() => {
    // If already admin, do nothing
    if (isAdmin) return;

    // Reset if timer has expired
    if (timerRef.current === null) {
      clickCount.current = 0;
    }
    
    clickCount.current += 1;

    // If this is the first click in a sequence, start the timer
    if (clickCount.current === 1) {
      timerRef.current = setTimeout(() => {
        // Reset after time limit
        clickCount.current = 0;
        timerRef.current = null;
      }, TIME_LIMIT_MS);
    }

    // Check if the required number of clicks is reached
    if (clickCount.current >= REQUIRED_CLICKS) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      clickCount.current = 0;
      
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      setIsAdmin(true);
      toast({ title: "تم تفعيل وضع المدير!", description: "أهلاً بك. يمكنك الآن الوصول إلى لوحة التحكم." });
      
      // Redirect to the admin dashboard upon successful activation
      router.push('/admin');
    }
  }, [isAdmin, toast, router]);

  const deActivateAdmin = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAdmin(false);
  }

  return { isAdmin, isLoading, handleAdminActivationClick, deActivateAdmin };
}
