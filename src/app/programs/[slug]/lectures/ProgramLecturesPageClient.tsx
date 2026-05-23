'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture } from '@/lib/types';
import { LectureListItem } from '@/components/lecture-list-item';
import { useCollection } from '@/firebase';
import { useMemo, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HomePageSkeleton } from '@/components/skeletons';

function ProgramLecturesContent({ program }: { program: Program }) {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: lectures, isLoading } = useCollection<Lecture>('lectures', {
        where: ['programId', '==', program.id],
        limit: 500
    });

    const filteredLectures = useMemo(() => {
        if (!lectures) return [];
        return lectures.filter(l =>
            l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [lectures, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">جاري تحميل المحاضرات...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 space-y-12">
            <header className="space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tight">محاضرات {program.name}</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">تصفح جميع الحلقات والمحاضرات الخاصة بهذا البرنامج</p>
                </div>

                <div className="relative max-w-xl mx-auto group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        className="h-14 pr-12 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all text-lg"
                        placeholder="ابحث في عناوين المحاضرات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="space-y-4">
                {filteredLectures.map((lecture, index) => (
                    <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />
                ))}
            </div>

            {filteredLectures.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                    <p className="text-xl text-muted-foreground">
                        {searchTerm ? "لا توجد نتائج تطابق بحثك حالياً." : "لا توجد محاضرات متاحة في هذا البرنامج حالياً."}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function ProgramLecturesPageClient() {
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

    return <ProgramLecturesContent program={program} />;
}
