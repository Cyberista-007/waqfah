'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture } from '@/lib/types';
import { LectureListItem } from '@/components/lecture-list-item';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { normalizeArabic } from '@/lib/utils';
import Fuse from 'fuse.js';

function ProgramLecturesContent({ program }: { program: Program }) {
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'trending' | 'oldest'>('newest');

    const lectures = useMemo(() => {
        if (!allLectures) return [];
        const toDate = (ts: any): Date => ts?.toDate ? ts.toDate() : new Date(ts || 0);

        let programLectures = allLectures
            .filter(l => (l.programId === program.id) && l.duration > 180);

        // Apply sort
        if (sortOrder === 'newest') {
            programLectures = programLectures.sort((a, b) =>
                toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
            );
        } else if (sortOrder === 'oldest') {
            programLectures = programLectures.sort((a, b) =>
                toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime()
            );
        } else if (sortOrder === 'trending') {
            programLectures = programLectures.sort((a, b) =>
                ((b as any).viewCount ?? 0) - ((a as any).viewCount ?? 0)
            );
        }

        if (!searchTerm) {
            return programLectures;
        }

        const fuse = new Fuse(programLectures, {
            keys: ['title', 'description', 'seriesTitle'],
            threshold: 0.4,
            ignoreLocation: true,
            preprocessor: normalizeArabic,
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
                        placeholder={`ابحث في محاضرات برنامج ${program.name}...`}
                        className="w-full ps-10 h-12 text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {lecturesLoading ? (
                <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            ) : lectures && lectures.length > 0 ? (
                <div className="space-y-4">
                    {lectures.map((l, i) => <LectureListItem key={l.id} lecture={l} index={i + 1} />)}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-lg text-muted-foreground">
                        {searchTerm ? "لا توجد نتائج تطابق بحثك." : "لا توجد محاضرات في هذا البرنامج حالياً."}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function ProgramLecturesPage() {
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

    return <ProgramLecturesContent program={program} />;
}
