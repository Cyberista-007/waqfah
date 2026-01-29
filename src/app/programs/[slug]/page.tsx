'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture, Series } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials } from '@/lib/utils';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import Image from 'next/image';
import { FollowButton } from '@/components/follow-button';
import { Users, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase';
import { useMemo } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';

export default function ProgramPage() {
    const params = useParams();
    const slug = params.slug as string;

    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');

    const isLoading = programsLoading || lecturesLoading || seriesLoading;

    const { program, lectures, series } = useMemo(() => {
        if (isLoading || !allPrograms || !allLectures || !allSeries) {
            return { program: null, lectures: [], series: [] };
        }
        
        const currentProgram = allPrograms.find(p => p.slug === slug);

        if (!currentProgram) {
            return { program: null, lectures: [], series: [] };
        }

        const programLectures = allLectures.filter(l => l.programId === currentProgram.id);
        const programSeries = allSeries.filter(s => s.programId === currentProgram.id);

        return { program: currentProgram, lectures: programLectures, series: programSeries };

    }, [isLoading, allPrograms, allLectures, allSeries, slug]);

    if (isLoading) {
        return <HomePageSkeleton />;
    }

    if (!program) {
        notFound();
        return null;
    }

    const placeholder = getPlaceholderImage(program.imageId);
    const imageUrl = program.imageUrl || placeholder?.imageUrl;
    
    const bannerUrl = "https://picsum.photos/seed/program-banner/1600/400";


    return (
        <div className="container mx-auto px-0 py-0 -mt-8 space-y-12">
            {/* Banner Image */}
            <div className="relative h-40 md:h-56 w-full bg-muted">
                <Image
                    src={bannerUrl}
                    alt={`${program.name} banner`}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract texture"
                    priority
                />
            </div>

            {/* Program Header */}
            <div className="px-4 sm:px-6 lg:px-8">
                 <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Avatar className="h-24 w-24 sm:h-36 sm:w-36 border-4 border-background -mt-12 sm:-mt-20 shrink-0">
                        {imageUrl && <AvatarImage src={imageUrl} alt={program.name} />}
                        <AvatarFallback className="text-4xl">{getInitials(program.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow pt-2">
                        <h1 className="text-3xl lg:text-4xl font-extrabold font-headline">{program.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
                             <span>@{program.slug}</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{series.length} سلسلة</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{lectures.length} محاضرة</span>
                             {program.followerCount && program.followerCount > 0 && (
                                <>
                                  <span className="hidden sm:inline">·</span>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{program.followerCount} متابع</span>
                                  </div>
                                </>
                             )}
                        </div>
                        <p className="text-base text-muted-foreground mt-3 max-w-xl line-clamp-3">{program.bio}</p>
                         <div className="mt-6 flex flex-wrap gap-2">
                             <FollowButton programId={program.id} />
                         </div>
                    </div>
                </div>
            </div>

            {series.length > 0 && (
                <section className="px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-6 font-headline">السلاسل</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {series.map((s, i) => <SeriesCard key={s.id} series={s} index={i} />)}
                    </div>
                </section>
            )}

            {lectures.length > 0 && (
                 <section className="px-4 sm:px-6 lg:px-8">
                     <h2 className="text-2xl font-bold mb-6 font-headline">المحاضرات</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lectures.map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                    </div>
                </section>
            )}

            {lectures.length === 0 && series.length === 0 && (
                 <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-lg text-muted-foreground">
                        لا يوجد محتوى في هذا البرنامج حالياً.
                    </p>
                </div>
            )}
        </div>
    );
}
