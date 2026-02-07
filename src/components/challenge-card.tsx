
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import type { Challenge } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Flame, Star, Users } from 'lucide-react';
import { memo } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ChallengeCardProps {
    challenge: Challenge;
    index?: number;
}

const ChallengeCardComponent = ({ challenge, index = 0 }: ChallengeCardProps) => {
    
    const toDate = (timestamp: any): Date => {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
      return new Date(timestamp);
    }
    const endDate = toDate(challenge.endDate);
    const timeRemaining = formatDistanceToNowStrict(endDate, { addSuffix: true, locale: ar });


    return (
        <Card 
            className={cn(
                "h-full flex flex-col justify-between text-center p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-amber-500/50 rounded-xl bg-gradient-to-br from-card to-muted/50 transform-gpu hover:-translate-y-2 hover:scale-105 hover:rotate-[-2deg]",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <CardHeader className="p-0">
                <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">{challenge.title}</CardTitle>
                 <CardDescription className="line-clamp-3 mt-2">{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 my-6 flex-grow flex flex-col items-center justify-center gap-4">
                 <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
                    <Star className="h-5 w-5 fill-current" />
                    <span>{challenge.rewardPoints} نقطة</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Users className="h-4 w-4" />
                    <span>{challenge.participantCount || 0} مشارك</span>
                 </div>
            </CardContent>
            <CardFooter className="p-0 pt-4 mt-auto w-full flex-col gap-2">
                 <Button asChild size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    <Link href={`/series/${challenge.seriesId}`}>
                        عرض التحدي
                    </Link>
                 </Button>
                 <p className="text-xs text-muted-foreground">ينتهي {timeRemaining}</p>
            </CardFooter>
        </Card>
    )
}

export const ChallengeCard = memo(ChallengeCardComponent);
