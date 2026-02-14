
'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, writeBatch, Timestamp, increment } from 'firebase/firestore';
import type { UserProfile, GamificationBadge, UserBadge } from '@/lib/types';
import { useToast } from './use-toast';

export function useBadgeManager() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    // Memoize doc/collection paths to prevent re-renders
    const userDocPath = user ? `users/${user.uid}` : null;
    const userBadgesPath = user ? `users/${user.uid}/user_badges` : null;

    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocPath);
    const { data: allBadges, isLoading: badgesLoading } = useCollection<GamificationBadge>('gamification_badges');
    const { data: userBadges, isLoading: userBadgesLoading } = useCollection<UserBadge>(userBadgesPath);
    
    useEffect(() => {
        const isLoading = profileLoading || badgesLoading || userBadgesLoading;
        if (isLoading || !user || !userProfile || !allBadges || !firestore || userBadges === undefined) {
            return;
        }

        const checkAndAwardBadges = async () => {
            const earnedBadgeIds = new Set(userBadges?.map(b => b.id) || []);
            const badgesToAward: GamificationBadge[] = [];

            for (const badge of allBadges) {
                if (earnedBadgeIds.has(badge.id)) continue;

                // Safely access userProfile properties
                const userMetricValue = (userProfile as any)[badge.metric] as number | undefined || 0;
                
                if (userMetricValue >= badge.threshold) {
                    badgesToAward.push(badge);
                }
            }

            if (badgesToAward.length > 0) {
                const batch = writeBatch(firestore);
                let totalPointsAwarded = 0;

                for (const badge of badgesToAward) {
                    const userBadgeRef = doc(firestore, 'users', user.uid, 'user_badges', badge.id);
                    batch.set(userBadgeRef, { badgeId: badge.id, earnedAt: Timestamp.now() });
                    totalPointsAwarded += badge.points;

                    // Show a toast for each new badge
                    toast({
                        title: "وسام جديد!",
                        description: `لقد حصلت على وسام: ${badge.title} (+${badge.points} نقطة)`,
                    });
                }
                
                const userRef = doc(firestore, 'users', user.uid);
                batch.update(userRef, { points: increment(totalPointsAwarded) });
                
                try {
                    await batch.commit();
                } catch (error) {
                    console.error("Failed to award badges:", error);
                }
            }
        };

        // Debounce the check to avoid running it on every minor update
        const timeoutId = setTimeout(checkAndAwardBadges, 1000);
        return () => clearTimeout(timeoutId);

    }, [user, userProfile, allBadges, userBadges, firestore, toast, profileLoading, badgesLoading, userBadgesLoading]);
}
