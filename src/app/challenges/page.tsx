
'use client';

import { Flame, Loader2 } from 'lucide-react';
import type { Challenge } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection } from '@/firebase';
import { ChallengeCard } from '@/components/challenge-card';

function ChallengesListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="flex flex-col p-6">
                     <Skeleton className="h-8 w-3/4 mb-4" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-full mt-2" />
                     <Skeleton className="h-4 w-2/3 mt-2" />
                     <div className="flex justify-between items-center mt-6">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-10 w-32 rounded-full" />
                     </div>
                </Card>
            ))}
        </div>
    );
}

function ChallengesList() {
    const { data: challenges, isLoading } = useCollection<Challenge>('challenges', { 
        where: ['isActive', '==', true],
        orderBy: ['endDate', 'asc'] 
    });

    if (isLoading) {
        return <ChallengesListSkeleton />;
    }

    return (
        <>
            {challenges && challenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {challenges.map((challenge, index) => (
                        <ChallengeCard challenge={challenge} key={challenge.id} index={index} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <p className="text-lg text-muted-foreground">لا توجد تحديات نشطة حالياً. يرجى العودة لاحقاً!</p>
                </div>
            )}
        </>
    );
}

export default function ChallengesPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
                <Flame className="h-10 w-10 animate-icon-draw" />
                تحديات الاستماع
            </h1>
            <ChallengesList />
        </div>
    );
}
