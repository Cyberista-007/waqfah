'use client';

import { useDoc, useCollection } from '@/firebase';
import type { PinnedLectureSettings, Lecture } from '@/lib/types';
import { LectureCard } from './lecture-card';
import { Skeleton } from './ui/skeleton';
import { Pin } from 'lucide-react';
import { useMemo } from 'react';
import { Card } from './ui/card';

function PinnedLectureSkeleton() {
    return (
        <section className="space-y-6">
             <Skeleton className="h-10 w-64 mb-6" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div className="space-y-2" key={i}>
                        <Skeleton className="aspect-video w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
             </div>
        </section>
    );
}


export function PinnedLecture() {
    const { data: settings, isLoading: settingsLoading } = useDoc<PinnedLectureSettings>('settings/pinned_lecture');
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    
    const pinnedLectures = useMemo(() => {
        if (!settings || !settings.lectureIds || !allLectures) {
            return [];
        }
        // Preserve the order of IDs from settings
        return settings.lectureIds
            .map(id => allLectures.find(l => l.id === id))
            .filter((l): l is Lecture => !!l);
    }, [settings, allLectures]);

    const isLoading = settingsLoading || (settings?.lectureIds && settings.lectureIds.length > 0 && lecturesLoading);

    if (isLoading) {
        return <PinnedLectureSkeleton />;
    }

    if (!settings || !settings.isActive || pinnedLectures.length === 0) {
        return null;
    }

    return (
        <section className="space-y-6">
            <h2 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Pin className="h-8 w-8 text-primary animate-pulse" />
                محاضرات مميزة
            </h2>
            {settings.message && (
                <Card className="bg-muted/50 p-6">
                    <p className="text-lg leading-relaxed">{settings.message}</p>
                </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {pinnedLectures.map((lecture, index) => (
                    <LectureCard key={lecture.id} lecture={lecture} index={index} />
                ))}
            </div>
        </section>
    );
}
