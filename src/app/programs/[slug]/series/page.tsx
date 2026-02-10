'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Series } from '@/lib/types';
import { SeriesCard } from '@/components/series-card';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { normalizeArabic } from '@/lib/utils';
import Fuse from 'fuse.js';

function ProgramSeriesContent({ program }: { program: Program }) {
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const [searchTerm, setSearchTerm] = useState('');

    const series = useMemo(() => {
        if (!allSeries) return [];
        const programSeries = allSeries
            .filter(s => s.programId === program.id)
            .sort((a, b) => {
                const toDate = (ts: any): Date => ts?.toDate ? ts.toDate() : new Date(ts || 0);
                return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
            });
        
        if (!searchTerm) {
            return programSeries;
        }

        const fuse = new Fuse(programSeries, {
            keys: ['title', 'description'],
            threshold: 0.4,
            ignoreLocation: true,
            preprocessor: normalizeArabic,
        });

        return fuse.search(searchTerm).map(result => result.item);

    }, [allSeries, program.id, searchTerm]);

    return (
        <div>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder={`ابحث في سلاسل برنامج ${program.name}...`}
                    className="w-full ps-10 h-12 text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                        {searchTerm ? "لا توجد نتائج تطابق بحثك." : "لا توجد سلاسل في هذا البرنامج حالياً."}
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
