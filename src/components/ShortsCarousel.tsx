'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ShortCard } from './ShortCard';
import type { Lecture } from '@/lib/types';
import { Sparkles, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { normalizeArabic } from '@/lib/utils';


interface ShortsCarouselProps {
    shorts: Lecture[];
}

export function ShortsCarousel({ shorts }: ShortsCarouselProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredShorts = useMemo(() => {
        if (!searchTerm) {
            return shorts;
        }
        const normalizedSearchTerm = normalizeArabic(searchTerm);
        return shorts.filter(short =>
            normalizeArabic(short.title).includes(normalizedSearchTerm)
        );
    }, [shorts, searchTerm]);

    if (!shorts || shorts.length === 0) {
        return null;
    }

    return (
        <section>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2 shrink-0">
                    <Sparkles className="text-primary h-7 w-7" />
                    <span>مقاطع قصيرة</span>
                </h2>
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث في المقاطع القصيرة..."
                        className="ps-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <Carousel opts={{ align: "start", direction: "rtl", dragFree: true }} className="w-full relative">
                <CarouselContent className="-ml-4">
                    {filteredShorts.map((short, index) => (
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
