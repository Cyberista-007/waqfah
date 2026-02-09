'use client';

import { useDoc, useCollection } from '@/firebase';
import type { PinnedLectureSettings, Lecture } from '@/lib/types';
import { LectureCard } from './lecture-card';
import { Skeleton } from './ui/skeleton';
import { Pin } from 'lucide-react';
import { useMemo } from 'react';

function PinnedLectureSkeleton() {
    return (
        <section className="space-y-6">
             <Skeleton className="h-10 w-64 mb-6" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="space-y-2">
                        <Skeleton className="aspect-video w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="md:col-span-2">
                     <Skeleton className="h-full w-full rounded-xl" />
                </div>
             </div>
        </section>
    );
}


export function PinnedLecture() {
    const { data: settings, isLoading: settingsLoading } = useDoc<PinnedLectureSettings>('settings/pinned_lecture');
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    
    const pinnedLecture = useMemo(() => {
        if (!settings || !settings.lectureId || !allLectures) {
            return null;
        }
        return allLectures.find(l => l.id === settings.lectureId);
    }, [settings, allLectures]);

    const isLoading = settingsLoading || (settings?.lectureId && lecturesLoading);

    if (isLoading) {
        return <PinnedLectureSkeleton />;
    }

    if (!settings || !settings.isActive || !pinnedLecture) {
        return null;
    }

    return (
        <section className="space-y-6">
            <h2 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Pin className="h-8 w-8 text-primary animate-pulse" />
                محاضرة الأسبوع
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                <div className="md:col-span-1">
                    <LectureCard lecture={pinnedLecture} />
                </div>
                {settings.message && (
                    <div className="md:col-span-2 bg-muted/50 rounded-xl p-6 flex items-center">
                        <p className="text-lg leading-relaxed">{settings.message}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
