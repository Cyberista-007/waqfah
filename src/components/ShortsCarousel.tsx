
'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ShortCard } from './ShortCard';
import type { Lecture } from '@/lib/types';

interface ShortsCarouselProps {
    shorts: Lecture[];
}

export function ShortsCarousel({ shorts }: ShortsCarouselProps) {
    if (!shorts || shorts.length === 0) {
        return null;
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary h-7 w-7">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M19.334 8.00156C19.8615 9.38799 19.4932 10.974 18.3992 11.8383L12.001 16.9429L5.60282 11.8383C4.50883 10.974 4.14051 9.38799 4.66801 8.00156C5.19551 6.61513 6.64391 5.66935 8.13328 5.82433C9.62265 5.9793 10.8499 7.15065 11.3323 8.50201L12.001 10.5002L12.6697 8.50201C13.1521 7.15065 14.3793 5.9793 15.8687 5.82433C17.3581 5.66935 18.8065 6.61513 19.334 8.00156Z" fill="currentColor"/>
                    </svg>
                    <span>مقاطع قصيرة</span>
                </h2>
            </div>
            <Carousel opts={{ align: "start", direction: "rtl", dragFree: true }} className="w-full relative">
                <CarouselContent className="-ml-4">
                    {shorts.map((short, index) => (
                        <CarouselItem key={short.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                            <ShortCard lecture={short} index={index} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -right-4 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute -left-4 top-1/2 -translate-y-1/2" />
            </Carousel>
        </section>
    )
}
