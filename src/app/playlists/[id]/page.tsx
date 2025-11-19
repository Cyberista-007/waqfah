
import { notFound } from 'next/navigation';
import { getDoc, doc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import type { Playlist, Lecture, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LectureListItem from '@/components/lecture-list-item';
import { ListMusic, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

async function getPlaylistData(playlistId: string) {
    const { serverFirestore } = initializeFirebaseOnServer();
    const playlistDocRef = doc(serverFirestore, 'users', playlistId.split('_')[0], 'playlists', playlistId);
    
    const playlistSnap = await getDoc(playlistDocRef);

    if (!playlistSnap.exists()) {
        return null;
    }

    const playlist = { ...playlistSnap.data(), id: playlistSnap.id } as Playlist;

    const userDocRef = doc(serverFirestore, 'users', playlist.userId);
    const userSnap = await getDoc(userDocRef);
    const userProfile = userSnap.exists() ? { ...userSnap.data(), id: userSnap.id } as UserProfile : null;
    
    let lecturesInPlaylist: Lecture[] = [];
    if (playlist.lectureIds && playlist.lectureIds.length > 0) {
        const lecturesCol = collection(serverFirestore, 'lectures');
        // Firestore 'in' query is limited to 30 items per query
        for (let i = 0; i < playlist.lectureIds.length; i += 30) {
            const chunk = playlist.lectureIds.slice(i, i + 30);
            const lecturesQuery = query(lecturesCol, where('__name__', 'in', chunk));
            const lecturesSnapshot = await getDocs(lecturesQuery);
            lecturesInPlaylist.push(...lecturesSnapshot.docs.map(doc => {
                 const data = doc.data();
                 return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now()
                 } as Lecture
            }));
        }
    }

    return { playlist, lecturesInPlaylist, userProfile };
}

export default async function PlaylistPage({ params }: { params: { id: string } }) {
    const data = await getPlaylistData(params.id);

    if (!data) {
        notFound();
    }

    const { playlist, lecturesInPlaylist, userProfile } = data;
    
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
                                قائمة تشغيل بواسطة <Link href={`/profile/${userProfile.id}`} className="font-semibold text-foreground hover:underline">{userProfile.name}</Link>
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
