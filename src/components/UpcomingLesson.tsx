'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock } from 'lucide-react';
import type { ScheduleItem } from '@/lib/types';
import { Button } from './ui/button';
import Link from 'next/link';

interface Countdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const calculateTimeLeft = (targetDate: Date): Countdown | null => {
    const difference = +targetDate - +new Date();
    if (difference > 0) {
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }
    return null;
};

const toDate = (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
    try {
      const d = new Date(timestamp);
      return isNaN(d.getTime()) ? undefined : d;
    } catch {
      return undefined;
    }
}

export function UpcomingLesson({ lesson }: { lesson: ScheduleItem | null }) {
    const targetDate = lesson?.dateTime ? toDate(lesson.dateTime) : null;
    const [timeLeft, setTimeLeft] = useState<Countdown | null>(targetDate ? calculateTimeLeft(targetDate) : null);

    useEffect(() => {
        if (!targetDate) return;
        
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearTimeout(timer);
    });

    if (!lesson || !targetDate) {
        return null; // Don't render if no upcoming lesson
    }

    return (
        <section>
             <h2 className="text-3xl font-bold font-headline mb-6">الدرس القادم</h2>
            <Card className="bg-primary/5 border-primary/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{lesson.title}</CardTitle>
                    <CardDescription>
                         {targetDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - الساعة {targetDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {lesson.isLive ? (
                         <div className="flex items-center gap-2 mb-4">
                             <span className="relative flex h-3 w-3">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                             </span>
                             <span className="text-destructive font-bold">مباشر الآن</span>
                         </div>
                    ) : timeLeft ? (
                        <div className="flex items-center justify-center gap-4 text-center">
                            <div><p className="text-4xl font-bold">{timeLeft.days}</p><p className="text-sm text-muted-foreground">يوم</p></div>
                            <div><p className="text-4xl font-bold">{timeLeft.hours}</p><p className="text-sm text-muted-foreground">ساعة</p></div>
                            <div><p className="text-4xl font-bold">{timeLeft.minutes}</p><p className="text-sm text-muted-foreground">دقيقة</p></div>
                            <div><p className="text-4xl font-bold">{timeLeft.seconds}</p><p className="text-sm text-muted-foreground">ثانية</p></div>
                        </div>
                    ) : (
                        <p className="text-lg font-semibold text-center">حان وقت الدرس!</p>
                    )}
                     <div className="mt-6 text-center">
                        <Button asChild><Link href="/schedule">عرض الجدول الكامل</Link></Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
