'use client';

import { HomeSearch } from '@/components/home-search';
import { RecommendedLectures } from '@/components/recommended-lectures';
import { ContinueListening } from '@/components/continue-listening';
import { SeriesCard } from '@/components/series-card';
import { LectureCard } from '@/components/lecture-card';
import { ProgramCard } from '@/components/program-card';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { Suspense, useState, useCallback, useEffect } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';
import { useCollection } from '@/firebase';
import type { Lecture, Series, Program } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function SectionCarousel({
  title,
  children,
  items,
}: {
  title: string;
  children: React.ReactNode;
  items: any[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    api.on('select', onSelect);
    api.on('reInit', onSelect);
    onSelect(); // Call on mount

    return () => {
        api.off('select', onSelect);
        api.off('reInit', onSelect);
    }
  }, [api]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-headline">{title}</h2>
        <div className="flex gap-2">
          <Button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            variant="outline"
            size="icon"
            aria-label="السابق"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={scrollNext}
            disabled={!canScrollNext}
            variant="outline"
            size="icon"
            aria-label="التالي"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', direction: 'rtl', slidesToScroll: 'auto' }}
        className="w-full"
      >
        <CarouselContent>{children}</CarouselContent>
      </Carousel>
    </section>
  );
}

export default function Home() {
  const heroImage = getPlaceholderImage('hero-background');

  const { data: latestSeries, isLoading: seriesLoading } =
    useCollection<Series>('series', {
      orderBy: ['createdAt', 'desc'],
      limit: 8,
    });
  const { data: latestLectures, isLoading: lecturesLoading } =
    useCollection<Lecture>('lectures', {
      orderBy: ['createdAt', 'desc'],
      limit: 8,
    });
  const { data: topPrograms, isLoading: programsLoading } =
    useCollection<Program>('programs', {
      orderBy: ['followerCount', 'desc'],
      limit: 8,
    });

  const isLoading = seriesLoading || lecturesLoading || programsLoading;

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="space-y-12">
      <section className="relative -mt-[calc(4rem+1px)] flex h-[60vh] min-h-[500px] flex-col items-center justify-center text-center text-white rounded-b-3xl overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-headline tracking-tight">
            العلم الشرعي بين يديك
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.
          </p>
          <HomeSearch />
        </div>
      </section>

      <div className="container py-8 space-y-16">
        <Suspense>
          <ContinueListening />
        </Suspense>
        <Suspense>
          <RecommendedLectures />
        </Suspense>

        <SectionCarousel title="أبرز البرامج" items={topPrograms || []}>
          {topPrograms?.map((program, index) => (
            <CarouselItem
              key={program.id}
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProgramCard program={program} index={index} />
            </CarouselItem>
          ))}
        </SectionCarousel>

        <SectionCarousel title="أحدث المحاضرات" items={latestLectures || []}>
          {latestLectures?.map((lecture, index) => {
            return (
              <CarouselItem
                key={lecture.id}
                className="basis-full md:basis-1/2 lg:basis-1/3"
              >
                <LectureCard lecture={lecture} index={index} />
              </CarouselItem>
            );
          })}
        </SectionCarousel>

        <SectionCarousel title="أحدث السلاسل" items={latestSeries || []}>
          {latestSeries?.map((series, index) => (
            <CarouselItem
              key={series.id}
              className="basis-full md:basis-1/2 lg:basis-1/3"
            >
              <SeriesCard series={series} index={index} />
            </CarouselItem>
          ))}
        </SectionCarousel>
      </div>
    </div>
  );
}
