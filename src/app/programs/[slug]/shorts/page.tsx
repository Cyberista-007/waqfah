'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture } from '@/lib/types';
import { ShortCard } from '@/components/ShortCard';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import Fuse from 'fuse.js';
import { Skeleton } from '@/components/ui/skeleton';

function ProgramShortsContent({ program }: { program: Program }) {
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'trending' | 'oldest'>('newest');

    const shorts = useMemo(() => {
        if (!allLectures) return [];
        const toDate = (ts: any): Date => ts?.toDate ? ts.toDate() : new Date(ts || 0);

        let programShorts = allLectures
            .filter(l => (l.programId === program.id) && l.duration <= 180);

        if (sortOrder === 'newest') {
            programShorts = programShorts.sort((a, b) =>
                toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
            );
        } else if (sortOrder === 'oldest') {
            programShorts = programShorts.sort((a, b) =>
                toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime()
            );
        } else if (sortOrder === 'trending') {
            programShorts = programShorts.sort((a, b) =>
                ((b as any).viewCount ?? 0) - ((a as any).viewCount ?? 0)
            );
        }

        if (!searchTerm) {
            return programShorts;
        }

        const fuse = new Fuse(programShorts, {
            keys: ['title', 'description'],
            threshold: 0.4,
            ignoreLocation: true,
        });

        return fuse.search(searchTerm).map(result => result.item);

    }, [allLectures, program.id, searchTerm, sortOrder]);

    const sortButtons: { key: typeof sortOrder; label: string }[] = [
        { key: 'newest',   label: 'الأحدث' },
        { key: 'trending', label: 'الرائجة' },
        { key: 'oldest',   label: 'الأقدم' },
    ];

    return (
        <div>
            {/* Sort + Search row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                {/* Sort Buttons */}
                <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-full p-1 shrink-0">
                    {sortButtons.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setSortOrder(btn.key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                                sortOrder === btn.key
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder={`ابحث في المقاطع القصيرة لبرنامج ${program.name}...`}
                        className="w-full ps-10 h-12 text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {lecturesLoading ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="space-y-2">
                           <Skeleton className="aspect-[9/16] w-full rounded-xl" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : shorts && shorts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {shorts.map((s, i) => <ShortCard key={s.id} lecture={s} index={i} />)}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-lg text-muted-foreground">
                        {searchTerm ? "لا توجد نتائج تطابق بحثك." : "لا توجد مقاطع قصيرة في هذا البرنامج حالياً."}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function ProgramShortsPage() {
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

    return <ProgramShortsContent program={program} />;
}
