
'use client';

import { useDoc, useCollection } from '@/firebase';
import type { PinnedItemSettings, PinnedItem, Lecture, Series, Program } from '@/lib/types';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { ProgramCard } from '@/components/program-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin } from 'lucide-react';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

function PinnedItemsSkeleton() {
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


export function PinnedItems() {
    const { data: settings, isLoading: settingsLoading } = useDoc<PinnedItemSettings>('settings/pinned_items');
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');
    
    const pinnedItemsData = useMemo(() => {
        if (!settings?.pinnedItems || !allLectures || !allSeries || !allPrograms) {
            return [];
        }
        
        return settings.pinnedItems.map(item => {
            let data: Lecture | Series | Program | undefined;
            if (item.type === 'lecture') {
                data = allLectures.find(d => d.id === item.id);
            } else if (item.type === 'series') {
                data = allSeries.find(d => d.id === item.id);
            } else if (item.type === 'program') {
                data = allPrograms.find(d => d.id === item.id);
            }
            
            if (data) return { ...item, data };
            return null;
        }).filter((i): i is { id: string; type: string; message?: string; data: Lecture | Series | Program } => !!i);

    }, [settings, allLectures, allSeries, allPrograms]);

    const isLoading = settingsLoading || lecturesLoading || seriesLoading || programsLoading;
    
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
    
    const isScheduled = useMemo(() => {
        if (!settings) return false;
        
        const now = new Date();
        const startDate = toDate(settings.startDate);
        const endDate = toDate(settings.endDate);

        if (startDate && now < startDate) {
            return false;
        }
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            if (now > endOfDay) {
                return false;
            }
        }
        return true;
    }, [settings]);

    if (isLoading) {
        return <PinnedItemsSkeleton />;
    }

    if (!settings || !settings.isActive || !isScheduled || pinnedItemsData.length === 0) {
        return null;
    }

    const layout = settings.layout || 'grid';

    const sectionContent = (
        <section className="space-y-6">
            <h2 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Pin className="h-8 w-8 text-primary animate-pulse" />
                محتوى مميز
            </h2>
            
            {layout === 'carousel' ? (
                 <Carousel opts={{ align: "start", loop: true, direction: "rtl" }} className="w-full">
                    <CarouselContent className="-ml-4">
                        {pinnedItemsData.map((item, index) => {
                            let card = null;
                            if (item.type === 'lecture' && item.data) {
                                card = <LectureCard lecture={item.data as Lecture} pinnedMessage={item.message} index={index} />;
                            } else if (item.type === 'series' && item.data) {
                                card = <SeriesCard series={item.data as Series} pinnedMessage={item.message} index={index} />;
                            } else if (item.type === 'program' && item.data) {
                                card = <ProgramCard program={item.data as Program} pinnedMessage={item.message} index={index} />;
                            }

                            return (
                                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                                    <div className="p-1 h-full flex">
                                        {card}
                                    </div>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="right-12" />
                    <CarouselNext />
                </Carousel>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {pinnedItemsData.map((item, index) => {
                        if (item.type === 'lecture' && item.data) {
                            return <LectureCard key={item.id} lecture={item.data as Lecture} pinnedMessage={item.message} index={index} />;
                        } else if (item.type === 'series' && item.data) {
                            return <SeriesCard key={item.id} series={item.data as Series} pinnedMessage={item.message} index={index} />;
                        } else if (item.type === 'program' && item.data) {
                            return <ProgramCard key={item.id} program={item.data as Program} pinnedMessage={item.message} index={index} />;
                        }
                        return null;
                    })}
                </div>
            )}
        </section>
    );

    return sectionContent;
}
