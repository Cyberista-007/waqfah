'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture } from '@/lib/types';
import { ShortCard } from '@/components/ShortCard';
import { useCollection } from '@/firebase';
import { useMemo, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HomePageSkeleton } from '@/components/skeletons';

function ProgramShortsContent({ program }: { program: Program }) {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: shorts, isLoading } = useCollection<Lecture>('lectures', {
        where: ['programId', '==', program.id],
        limit: 500
    });

    const filteredShorts = useMemo(() => {
        if (!shorts) return [];
        // Assuming shorts are lectures with a specific flag or just filtering for now
        return shorts.filter(l =>
            (l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.description?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [shorts, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">جاري تحميل المقاطع...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 space-y-12">
            <header className="space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tight">مقاطع {program.name}</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">تصفح المقاطع القصيرة والمميزة لهذا البرنامج</p>
                </div>

                <div className="relative max-w-xl mx-auto group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        className="h-14 pr-12 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all text-lg"
                        placeholder="ابحث في المقاطع..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredShorts.map((short) => (
                    <ShortCard key={short.id} lecture={short} />
                ))}
            </div>

            {filteredShorts.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                    <p className="text-xl text-muted-foreground">
                        {searchTerm ? "لا توجد نتائج تطابق بحثك حالياً." : "لا توجد مقاطع متاحة في هذا البرنامج حالياً."}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function ProgramShortsPageClient() {
    const params = useParams();
    const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const slug = decodeURIComponent(slugParam as string);

    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');

    const program = useMemo(() => {
        if (!allPrograms) return null;
        return allPrograms.find(p => p.slug === slug);
    }, [allPrograms, slug]);

    if (programsLoading) return <HomePageSkeleton />;
    if (!program) { notFound(); return null; }

    return <ProgramShortsContent program={program} />;
}
