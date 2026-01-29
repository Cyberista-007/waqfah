'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Playlist, Lecture, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureListItem } from '@/components/lecture-list-item';
import { ListMusic, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';
import { useMemo } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';

export default function PlaylistPage() {
    const params = useParams();
    const firestore = useFirestore();
    const playlistId = params.id as string;
    const userId = playlistId.split('_')[0];

    const playlistDocRef = useMemoFirebase(
      () => (firestore && userId && playlistId ? doc(firestore, 'users', userId, 'playlists', playlistId) : null),
      [firestore, userId, playlistId]
    );
    const { data: playlist, isLoading: playlistLoading } = useDoc<Playlist>(playlistDocRef);

    const userDocRef = useMemoFirebase(
      () => (firestore && userId ? doc(firestore, 'users', userId) : null),
      [firestore, userId]
    );
    const { data: userProfile, isLoading: userLoading } = useDoc<UserProfile>(userDocRef);

    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    
    const isLoading = playlistLoading || userLoading || lecturesLoading;

    const lecturesInPlaylist = useMemo(() => {
        if (!playlist || !allLectures) return [];

        const lectureMap = new Map(allLectures.map(l => [l.id, l]));
        return (playlist.lectureIds || [])
            .map(id => lectureMap.get(id))
            .filter((l): l is Lecture => !!l);
    }, [playlist, allLectures]);

    if (isLoading) {
        return <HomePageSkeleton />;
    }

    if (!playlist) {
        notFound();
        return null;
    }
    
    return (
        <div className="space-y-8">
            <Card className="bg-muted/30">
                <CardHeader>
                    <ListMusic className="w-10 h-10 text-primary mb-2" />
                    <CardTitle className="text-4xl font-headline">{playlist.name}</CardTitle>
                    {playlist.description && <CardDescription className="text-lg">{playlist.description}</CardDescription>}
                    {userProfile && (
                        <div className="flex items-center gap-2 pt-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                                <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                                قائمة تشغيل بواسطة <span className="font-semibold text-foreground">{userProfile.name}</span>
                            </span>
                        </div>
                    )}
                </CardHeader>
            </Card>

            <section>
                <h2 className="text-2xl font-bold mb-4 font-headline">محاضرات القائمة ({lecturesInPlaylist.length})</h2>
                <div className="space-y-4">
                    {lecturesInPlaylist.length > 0 ? (
                        lecturesInPlaylist.map((lecture, index) => (
                            <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />
                        ))
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <p className="text-muted-foreground">قائمة التشغيل هذه فارغة حاليًا.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    );
}
