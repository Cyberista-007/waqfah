'use client';

import { useParams, notFound } from 'next/navigation';
import type { Channel, Lecture } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials } from '@/lib/utils';
import { LectureCard } from '@/components/lecture-card';
import { Users, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { FollowButton } from '@/components/follow-button';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';

function ChannelPageContent({ channel }: { channel: Channel }) {
    const { data: lectures, isLoading: lecturesLoading } = useCollection<Lecture>(
        'lectures',
        { where: ['channelId', '==', channel.id] }
    );

    const placeholder = getPlaceholderImage(channel.imageId);
    const imageUrl = channel.imageUrl || placeholder?.imageUrl;
    
    const bannerUrl = "https://picsum.photos/seed/channel-banner/1600/400";


    return (
        <div className="container mx-auto px-0 py-0 -mt-8 space-y-12">
            {/* Banner Image */}
            <div className="relative h-40 md:h-56 w-full bg-muted">
                <Image
                    src={bannerUrl}
                    alt={`${channel.name} banner`}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract texture"
                    priority
                />
            </div>

            {/* Channel Header */}
            <div className="px-4 sm:px-6 lg:px-8">
                 <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Avatar className="h-24 w-24 sm:h-36 sm:w-36 border-4 border-background -mt-12 sm:-mt-20 shrink-0">
                        {imageUrl && <AvatarImage src={imageUrl} alt={channel.name} />}
                        <AvatarFallback className="text-4xl">{getInitials(channel.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow pt-2">
                        <h1 className="text-3xl lg:text-4xl font-extrabold font-headline">{channel.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
                             <span>@{channel.slug}</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{lectures?.length || 0} محاضرة</span>
                             {channel.followerCount && channel.followerCount > 0 && (
                                <>
                                  <span className="hidden sm:inline">·</span>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{channel.followerCount} متابع</span>
                                  </div>
                                </>
                             )}
                        </div>
                        <p className="text-base text-muted-foreground mt-3 max-w-xl line-clamp-3">{channel.description}</p>
                         <div className="mt-6 flex flex-wrap gap-2">
                             {/* The FollowButton for channels is not implemented yet, so we'll use the program one as a placeholder */}
                             {/* <FollowButton channelId={channel.id} /> */}
                         </div>
                    </div>
                </div>
            </div>

            {/* Lectures Section */}
            <section className="px-4 sm:px-6 lg:px-8">
                 <h2 className="text-2xl font-bold mb-6 font-headline">المحاضرات</h2>
                {lecturesLoading ? (
                     <div className="text-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                     </div>
                ) : lectures && lectures.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lectures.map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
                        <p className="text-lg text-muted-foreground">
                            لا توجد محاضرات في هذه القناة حالياً.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}


export default function ChannelPage() {
    const params = useParams();
    const slug = params.slug as string;

    const { data: channels, isLoading: channelsLoading } = useCollection<Channel>('channels', {
        where: ['slug', '==', slug],
        limit: 1
    });

    if (channelsLoading) {
        return <HomePageSkeleton />;
    }

    const channel = channels?.[0];

    if (!channel) {
        notFound();
        return null;
    }

    return <ChannelPageContent channel={channel} />;
}
