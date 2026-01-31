'use client';

import { Podcast, Loader2 } from 'lucide-react';
import type { Program } from '@/lib/types';
import { ProgramCard } from '@/components/program-card';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection } from '@/firebase';

function ProgramsListSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex flex-col items-center p-6">
                     <Skeleton className="h-32 w-32 rounded-full mb-4" />
                     <Skeleton className="h-6 w-3/4 mb-2" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-full mt-1" />
                </Card>
            ))}
        </div>
    );
}

function ProgramsList() {
    const { data: programs, isLoading } = useCollection<Program>('programs', { orderBy: ['followerCount', 'desc'] });

    if (isLoading) {
        return <ProgramsListSkeleton />;
    }

    return (
        <>
            {programs && programs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {programs.map((program, index) => (
                        <ProgramCard program={program} key={program.id} index={index} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <p className="text-lg text-muted-foreground">لم تتم إضافة أي برامج بعد.</p>
                </div>
            )}
        </>
    );
}

export default function ProgramsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
                <Podcast className="h-10 w-10" />
                البرامج
            </h1>
            <ProgramsList />
        </div>
    );
}
