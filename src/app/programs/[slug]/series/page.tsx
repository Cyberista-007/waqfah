'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Series } from '@/lib/types';
import { SeriesCard } from '@/components/series-card';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';


function ProgramSeriesContent({ program }: { program: Program }) {
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');

    const series = useMemo(() => {
        if (!allSeries) return [];
        return allSeries
            .filter(s => s.programId === program.id)
            .sort((a, b) => {
                const toDate = (ts: any): Date => ts?.toDate ? ts.toDate() : new Date(ts || 0);
                return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
            });
    }, [allSeries, program.id]);

    return (
        <div>
            <div className="mb-8">
                 <Button asChild variant="ghost" className="mb-4 text-muted-foreground">
                    <Link href={`/programs/${program.slug}`}>
                        <ArrowRight className="w-4 h-4 me-2" />
                        <span>العودة إلى البرنامج</span>
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline">كل سلاسل برنامج: {program.name}</h1>
            </div>

            {seriesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <Skeleton className="h-40 w-full" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : series && series.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {series.map((s, i) => <SeriesCard key={s.id} series={s} index={i} />)}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-lg text-muted-foreground">
                        لا توجد سلاسل في هذا البرنامج حالياً.
                    </p>
                </div>
            )}
        </div>
    );
}


export default function ProgramSeriesPage() {
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

    return <ProgramSeriesContent program={program} />;
}
