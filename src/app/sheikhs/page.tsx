
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MicVocal, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase';
import type { Sheikh } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SheikhCard } from '@/components/sheikh-card';
import { getInitials } from '@/lib/utils';

export default function SheikhsPage() {
    const { data: sheikhs, isLoading } = useCollection<Sheikh>('sheikhs', { orderBy: ['name', 'asc'] });

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
                <MicVocal className="h-10 w-10"/>
                المشايخ
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {isLoading ? (
                    [...Array(4)].map((_, i) => (
                        <Card key={i} className="flex flex-col items-center p-6">
                             <Skeleton className="h-32 w-32 rounded-full mb-4" />
                             <Skeleton className="h-6 w-3/4 mb-2" />
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-full mt-1" />
                        </Card>
                    ))
                ) : sheikhs?.map((sheikh, index) => (
                    <SheikhCard sheikh={sheikh} key={sheikh.id} index={index}/>
                ))}
            </div>
            {!isLoading && (!sheikhs || sheikhs.length === 0) && (
                <div className="text-center py-16">
                     <p className="text-lg text-muted-foreground">لم يتم إضافة أي مشايخ بعد.</p>
                </div>
            )}
        </div>
    )
}
