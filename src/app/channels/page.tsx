
"use client";

import { Youtube, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase';
import type { Channel } from '@/lib/types';
import { ChannelCard } from '@/components/channel-card';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChannelsPage() {
    const { data: channels, isLoading } = useCollection<Channel>('channels', { orderBy: ['name', 'asc'] });

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
                <Youtube className="h-10 w-10" />
                القنوات
            </h1>

            {isLoading ? (
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
            ) : channels && channels.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {channels.map((channel, index) => (
                        <ChannelCard channel={channel} key={channel.id} index={index} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <p className="text-lg text-muted-foreground">لم تتم إضافة أي قنوات بعد.</p>
                </div>
            )}
        </div>
    )
}
