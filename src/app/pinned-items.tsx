'use client';

import { useMemo } from 'react';
import { Pin } from 'lucide-react';

import { LectureCard } from '@/components/lecture-card';
import { ProgramCard } from '@/components/program-card';
import { SeriesCard } from '@/components/series-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCollection, useDoc } from '@/firebase';
import type { Lecture, PinnedItemSettings, Program, Series } from '@/lib/types';

function toDate(timestamp: any): Date | undefined {
  if (!timestamp) return undefined;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  try {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}

export function PinnedItems() {
  const { data: settings } = useDoc<PinnedItemSettings>('settings/pinned_items');

  const isScheduled = useMemo(() => {
    if (!settings || !settings.isActive || !settings.pinnedItems?.length) return false;

    const now = new Date();
    const startDate = toDate(settings.startDate);
    const endDate = toDate(settings.endDate);

    if (startDate && now < startDate) return false;
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (now > endOfDay) return false;
    }
    return true;
  }, [settings]);

  const lectureIds = useMemo(
    () =>
      isScheduled
        ? (settings?.pinnedItems || [])
            .filter((i) => i.type === 'lecture')
            .map((i) => i.id)
            .slice(0, 10)
        : [],
    [isScheduled, settings]
  );

  const seriesIds = useMemo(
    () =>
      isScheduled
        ? (settings?.pinnedItems || [])
            .filter((i) => i.type === 'series')
            .map((i) => i.id)
            .slice(0, 10)
        : [],
    [isScheduled, settings]
  );

  const programIds = useMemo(
    () =>
      isScheduled
        ? (settings?.pinnedItems || [])
            .filter((i) => i.type === 'program')
            .map((i) => i.id)
            .slice(0, 10)
        : [],
    [isScheduled, settings]
  );

  // Only query the exact pinned documents when active & scheduled
  const { data: pinnedLectures } = useCollection<Lecture>(
    lectureIds.length > 0 ? 'lectures' : null,
    lectureIds.length > 0 ? { where: ['__name__', 'in', lectureIds], once: true } : undefined
  );
  const { data: pinnedSeries } = useCollection<Series>(
    seriesIds.length > 0 ? 'series' : null,
    seriesIds.length > 0 ? { where: ['__name__', 'in', seriesIds], once: true } : undefined
  );
  const { data: pinnedPrograms } = useCollection<Program>(
    programIds.length > 0 ? 'programs' : null,
    programIds.length > 0 ? { where: ['__name__', 'in', programIds], once: true } : undefined
  );

  const pinnedItemsData = useMemo(() => {
    if (!isScheduled || !settings?.pinnedItems) return [];

    return settings.pinnedItems
      .map((item) => {
        let data: Lecture | Series | Program | undefined;
        if (item.type === 'lecture') {
          data = pinnedLectures?.find((d) => d.id === item.id);
        } else if (item.type === 'series') {
          data = pinnedSeries?.find((d) => d.id === item.id);
        } else if (item.type === 'program') {
          data = pinnedPrograms?.find((d) => d.id === item.id);
        }
        return data ? { ...item, data } : null;
      })
      .filter(
        (
          i
        ): i is {
          id: string;
          type: 'lecture' | 'series' | 'program';
          message?: string;
          data: Lecture | Series | Program;
        } => i !== null
      );
  }, [isScheduled, settings, pinnedLectures, pinnedSeries, pinnedPrograms]);

  if (!isScheduled || pinnedItemsData.length === 0) {
    return null;
  }

  const layout = settings?.layout || 'grid';

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold font-headline flex items-center gap-3">
        <Pin className="h-8 w-8 text-primary" />
        <span>محتوى مميز</span>
      </h2>

      {layout === 'carousel' ? (
        <Carousel opts={{ align: 'start', loop: true, direction: 'rtl' }} className="w-full">
          <CarouselContent className="-ml-4">
            {pinnedItemsData.map((item, index) => {
              let card = null;
              if (item.type === 'lecture') {
                card = (
                  <LectureCard
                    lecture={item.data as Lecture}
                    pinnedMessage={item.message}
                    index={index}
                  />
                );
              } else if (item.type === 'series') {
                card = (
                  <SeriesCard
                    series={item.data as Series}
                    pinnedMessage={item.message}
                    index={index}
                  />
                );
              } else if (item.type === 'program') {
                card = (
                  <ProgramCard
                    program={item.data as Program}
                    pinnedMessage={item.message}
                    index={index}
                  />
                );
              }

              return (
                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <div className="p-1 h-full flex">{card}</div>
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
            if (item.type === 'lecture') {
              return (
                <LectureCard
                  key={item.id}
                  lecture={item.data as Lecture}
                  pinnedMessage={item.message}
                  index={index}
                />
              );
            }
            if (item.type === 'series') {
              return (
                <SeriesCard
                  key={item.id}
                  series={item.data as Series}
                  pinnedMessage={item.message}
                  index={index}
                />
              );
            }
            if (item.type === 'program') {
              return (
                <ProgramCard
                  key={item.id}
                  program={item.data as Program}
                  pinnedMessage={item.message}
                  index={index}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </section>
  );
}
