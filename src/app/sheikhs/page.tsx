
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MicVocal, Loader2 } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Sheikh } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function SheikhsPage() {
    const firestore = useFirestore();
    const sheikhsQuery = useMemo(
        () => (firestore ? query(collection(firestore, 'sheikhs'), orderBy('name')) : null),
        [firestore]
    );
    const { data: sheikhs, isLoading } = useCollection<Sheikh>(sheikhsQuery);

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
                ) : sheikhs?.map(sheikh => {
                    const placeholder = getPlaceholderImage(sheikh.imageId);
                    return (
                        <Link href={`/sheikhs/${sheikh.slug}`} key={sheikh.id} className="block group">
                            <Card className="h-full flex flex-col items-center text-center p-6 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-primary/50">
                                <Avatar className="h-32 w-32 mb-4 border-4 border-transparent group-hover:border-primary/50 transition-colors">
                                    <AvatarImage src={placeholder?.imageUrl} alt={sheikh.name} />
                                    <AvatarFallback className="text-4xl">{getInitials(sheikh.name)}</AvatarFallback>
                                </Avatar>
                                <CardHeader className="p-0">
                                    <CardTitle className="font-headline text-xl">{sheikh.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 mt-2">
                                    <CardDescription className="line-clamp-3">{sheikh.bio}</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
            {!isLoading && (!sheikhs || sheikhs.length === 0) && (
                <div className="text-center py-16">
                     <p className="text-lg text-muted-foreground">لم يتم إضافة أي مشايخ بعد.</p>
                </div>
            )}
        </div>
    )
}
