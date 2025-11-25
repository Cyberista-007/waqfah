
import { notFound } from 'next/navigation';
import { getDoc, doc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import type { Channel, Lecture } from '@/lib/types';
import { toSerializable } from '@/lib/data-helpers';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials } from '@/lib/utils';
import { LectureCard } from '@/components/lecture-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Youtube } from 'lucide-react';

async function getChannelData(slug: string) {
    const { serverFirestore } = initializeFirebaseOnServer();
    
    const channelsCol = collection(serverFirestore, 'channels');
    const channelQuery = query(channelsCol, where('slug', '==', slug), limit(1));
    const channelSnap = await getDocs(channelQuery);

    if (channelSnap.empty) {
        return null;
    }
    
    const channel = toSerializable({ ...channelSnap.docs[0].data(), id: channelSnap.docs[0].id }) as Channel;
    
    // This is a placeholder for fetching lectures related to a channel.
    // The current data model does not link lectures to channels.
    // This would need to be implemented if desired.
    const lectures: Lecture[] = [];

    return { channel, lectures };
}

export default async function ChannelPage({ params }: { params: { slug: string } }) {
    const data = await getChannelData(params.slug);

    if (!data) {
        notFound();
    }

    const { channel, lectures } = data;
    const placeholder = getPlaceholderImage(channel.imageId);

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
            <header className="flex flex-col md:flex-row items-center gap-8">
                <Avatar className="h-40 w-40 border-4 border-primary">
                    <AvatarImage src={placeholder?.imageUrl} alt={channel.name} />
                    <AvatarFallback className="text-6xl">{getInitials(channel.name)}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-right flex-grow">
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-2 font-headline">{channel.name}</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl">{channel.description}</p>
                     <Button asChild className="mt-4">
                        <a href={channel.youtubeUrl} target="_blank" rel="noopener noreferrer">
                            <Youtube className="me-2 h-5 w-5" />
                            زيارة القناة على يوتيوب
                        </a>
                    </Button>
                </div>
            </header>

            <section>
                <h2 className="text-3xl font-bold mb-6 font-headline">المحاضرات</h2>
                {lectures.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lectures.map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl">
                        <p className="text-lg text-muted-foreground">
                            سيتم عرض المحاضرات المرتبطة بهذه القناة هنا قريباً.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
