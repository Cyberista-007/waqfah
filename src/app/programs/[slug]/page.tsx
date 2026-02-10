'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture, Series } from '@/lib/types';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShortsCarousel } from '@/components/ShortsCarousel';

function ProgramPageContent({ program }: { program: Program }) {
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');

    const isLoading = lecturesLoading || seriesLoading;

    const { programSeries, programLectures } = useMemo(() => {
        if (!allSeries || !allLectures) return { programSeries: [], programLectures: [] };

        const seriesForProgram = allSeries.filter(s => s.programId === program.id || s.programSlug === program.slug);
        const seriesIds = new Set(seriesForProgram.map(s => s.id));

        const lecturesForProgram = allLectures.filter(l => {
            const belongsToProgram = (l.programId === program.id || l.programSlug === program.slug) || (l.seriesId && seriesIds.has(l.seriesId));
            return belongsToProgram;
        });
        
        return { programSeries: seriesForProgram, programLectures: lecturesForProgram };
    }, [allSeries, allLectures, program.id, program.slug]);

    const { shorts, regularLectures } = useMemo(() => {
        if (!programLectures) return { shorts: [], regularLectures: [] };
        
        const sortedLectures = [...programLectures].sort((a, b) => {
            const toDate = (ts: any): Date => ts?.toDate ? ts.toDate() : new Date(ts || 0);
            return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
        });

        const shortsArr: Lecture[] = [];
        const regularLecturesArr: Lecture[] = [];
        sortedLectures.forEach(lecture => {
            if (lecture.duration <= 180) {
                shortsArr.push(lecture);
            } else {
                regularLecturesArr.push(lecture);
            }
        });
        return { shorts: shortsArr, regularLectures: regularLecturesArr };
    }, [programLectures]);

    if (isLoading) {
         return (
             <div className="text-center py-16">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
             </div>
        );
    }
    
    const hasContent = shorts.length > 0 || regularLectures.length > 0 || programSeries.length > 0;

    return (
        <div className="space-y-12">
            {!hasContent && (
                 <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20 px-4 sm:px-6 lg:px-8">
                    <p className="text-lg text-muted-foreground">
                        لا يوجد محتوى في هذا البرنامج حالياً.
                    </p>
                </div>
            )}

            {shorts.length > 0 && <ShortsCarousel shorts={shorts.slice(0, 12)} />}
            
            {regularLectures.length > 0 && (
                 <section>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold font-headline">أحدث المحاضرات</h2>
                        {regularLectures.length > 4 && (
                            <Button asChild variant="outline">
                                <Link href={`/programs/${program.slug}/lectures`}>
                                    <span>عرض الكل</span>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                </Link>
                            </Button>
                        )}
                     </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {regularLectures.slice(0, 4).map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                    </div>
                </section>
            )}

            {programSeries.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold font-headline">السلاسل</h2>
                        {programSeries.length > 3 && (
                            <Button asChild variant="outline">
                                <Link href={`/programs/${program.slug}/series`}>
                                    <span>عرض الكل</span>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                </Link>
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programSeries.slice(0, 3).map((s, i) => <SeriesCard key={s.id} series={s} index={i} />)}
                    </div>
                </section>
            )}
        </div>
    );
}

export default function ProgramHomePage() {
    const params = useParams();
    const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const slug = decodeURIComponent(slugParam as string);

    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');

    const program = useMemo(() => {
        if (!allPrograms) return null;
        return allPrograms.find(p => p.slug === slug);
    }, [allPrograms, slug]);

    if (programsLoading) {
        return <HomePageSkeleton />;
    }

    if (!program) {
        notFound();
        return null;
    }

    return <ProgramPageContent program={program} />;
}
