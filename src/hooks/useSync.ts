'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useDoc } from '@/firebase';
import type { UserState } from '@/lib/types';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { GamificationBadge, UserBadge } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'waqfah_user_state';

const INITIAL_STATE: Omit<UserState, 'id' | 'lastSync'> = {
  favorites: [],
  bookProgress: {},
  essentialsProgress: {},
  muhlikatProgress: {},
  points: 0,
  completedChallenges: []
};

export function useSync() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { data: cloudState, isLoading: isCloudLoading } = useDoc<UserState>(
    user ? `users/${user.uid}/state/current` : null
  );
  const { data: allBadges } = useCollection<GamificationBadge>('gamification_badges');
  const { data: userBadges } = useCollection<UserBadge>(user ? `users/${user.uid}/user_badges` : null);

  const [localState, setLocalState] = useState<Omit<UserState, 'id' | 'lastSync'>>(INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setLocalState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local state", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // 2. Sync Cloud to Local when Cloud data arrives
  useEffect(() => {
    if (cloudState && isInitialized) {
      // Merge logic: Cloud takes priority for now, or we could do smarter merging
      const merged = {
        ...localState,
        ...cloudState,
      };
      // Remove id and lastSync from the object we store locally
      const { id, lastSync, ...cleanState } = merged as any;
      setLocalState(cleanState);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanState));
    }
  }, [cloudState, isInitialized]);

  const checkAndAwardBadges = useCallback(async (currentState: any) => {
    if (!user || !firestore || !allBadges || !userBadges) return;

    const earnedBadgeIds = userBadges.map(b => b.badgeId);
    
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let meetsCriteria = false;
      if (badge.metric === 'points' && currentState.points >= badge.threshold) {
        meetsCriteria = true;
      }
      // Add other metrics as they become available in state
      // For now we focus on points as it's the primary driver

      if (meetsCriteria) {
        try {
          const badgeRef = collection(firestore, `users/${user.uid}/user_badges`);
          await setDoc(doc(badgeRef, badge.id), {
            badgeId: badge.id,
            earnedAt: serverTimestamp()
          });
          
          toast({
            title: "وسام جديد!",
            description: `لقد حصلت على وسام: ${badge.title}`,
          });
          
          // Optionally add bonus points
          if (badge.points) {
            updateState({ points: currentState.points + badge.points });
          }
        } catch (e) {
          console.error("Failed to award badge", e);
        }
      }
    }
  }, [user, firestore, allBadges, userBadges, toast]);

  // 3. Helper to update state and sync to Cloud
  const updateState = useCallback(async (updates: Partial<Omit<UserState, 'id' | 'lastSync'>>) => {
    setLocalState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      
      // If user is logged in, sync to Firestore
      if (user && firestore) {
        const stateRef = doc(firestore, `users/${user.uid}/state/current`);
        setDoc(stateRef, {
          ...newState,
          lastSync: serverTimestamp()
        }, { merge: true }).catch(err => console.error("Cloud sync failed", err));
        
        // Check for badges
        checkAndAwardBadges(newState);
      }
      
      return newState;
    });
  }, [user, firestore, checkAndAwardBadges]);

  return {
    state: localState,
    updateState,
    isLoading: isCloudLoading && !isInitialized,
    isUserLoggedIn: !!user
  };
}
