'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture } from '@/lib/types';
import { LectureCard } from '@/components/lecture-card';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function ProgramLecturesContent({ program }: { program: Program }) {
    const { data: lectures, isLoading: lecturesLoading } = useCollection<Lecture>(
        'lectures',
        { where: ['programId', '==', program.id], orderBy: ['createdAt', 'desc'] }
    );

    return (
        <div>
            <div className="mb-8">
                <Button asChild variant="ghost" className="mb-4 text-muted-foreground">
                    <Link href={`/programs/${program.slug}`}>
                        <ArrowRight className="w-4 h-4 me-2" />
                        <span>العودة إلى البرنامج</span>
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline">كل محاضرات برنامج: {program.name}</h1>
            </div>

            {lecturesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i}>
                            <Skeleton className="h-40 w-full" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : lectures && lectures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lectures.map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-lg text-muted-foreground">
                        لا توجد محاضرات في هذا البرنامج حالياً.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function ProgramLecturesPage() {
    const params = useParams();
    const slug = decodeURIComponent(params.slug as string);

    const { data: programs, isLoading: programsLoading } = useCollection<Program>('programs', {
        where: ['slug', '==', slug],
        limit: 1
    });

    if (programsLoading) {
        return <HomePageSkeleton />;
    }

    const program = programs?.[0];

    if (!program) {
        notFound();
        return null;
    }

    return <ProgramLecturesContent program={program} />;
}
