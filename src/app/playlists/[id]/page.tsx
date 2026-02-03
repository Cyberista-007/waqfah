
'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayRemove, updateDoc } from 'firebase/firestore';
import type { Playlist, Lecture, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureListItem } from '@/components/lecture-list-item';
import { ListMusic, Loader2, Clock, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { getInitials, formatTotalDuration } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function PlaylistPage() {
    const params = useParams();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user: currentUser } = useUser();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const playlistId = params.id as string;
    const userId = playlistId.split('_')[0];
    const isOwner = currentUser?.uid === userId;

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

    const { lecturesInPlaylist, totalDuration } = useMemo(() => {
        if (!playlist || !allLectures) return { lecturesInPlaylist: [], totalDuration: 0 };

        const lectureMap = new Map(allLectures.map(l => [l.id, l]));
        const lectures = (playlist.lectureIds || [])
            .map(id => lectureMap.get(id))
            .filter((l): l is Lecture => !!l);
        
        const duration = lectures.reduce((acc, lecture) => acc + (lecture.duration || 0), 0);

        return { lecturesInPlaylist: lectures, totalDuration: duration };
    }, [playlist, allLectures]);
    
    const handlePublicToggle = (isPublic: boolean) => {
        if (!firestore || !playlistDocRef || !isOwner) return;
        
        updateDocumentNonBlocking(playlistDocRef, { isPublic });

        toast({
            title: "تم تحديث حالة القائمة",
            description: `أصبحت القائمة الآن ${isPublic ? 'عامة' : 'خاصة'}.`,
        });
    };

    const handleRemoveLecture = async (lectureIdToRemove: string) => {
        if (!firestore || !playlistDocRef || !isOwner) return;
        setIsDeleting(lectureIdToRemove);

        try {
            await updateDoc(playlistDocRef, {
                lectureIds: arrayRemove(lectureIdToRemove)
            });
            toast({
                title: "تم حذف المحاضرة من القائمة"
            });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "حدث خطأ أثناء الحذف" });
        } finally {
            setIsDeleting(null);
        }
    };


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
                    <div className="flex items-center gap-x-6 gap-y-2 pt-4 flex-wrap">
                        {userProfile && (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                                    <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                    قائمة تشغيل بواسطة <span className="font-semibold text-foreground">{userProfile.name}</span>
                                </span>
                            </div>
                        )}
                         {totalDuration > 0 && (
                             <div className="flex items-center gap-2">
                                 <Clock className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-sm font-semibold text-foreground">{formatTotalDuration(totalDuration)}</span>
                             </div>
                         )}
                    </div>
                     {isOwner && (
                        <div className="flex items-center space-x-2 space-x-reverse pt-4 border-t mt-4">
                            <Switch
                                id="public-switch"
                                checked={playlist.isPublic}
                                onCheckedChange={handlePublicToggle}
                            />
                            <Label htmlFor="public-switch" className="cursor-pointer">
                                {playlist.isPublic ? 'قائمة عامة (مرئية للجميع)' : 'قائمة خاصة (مرئية لك فقط)'}
                            </Label>
                        </div>
                    )}
                </CardHeader>
            </Card>

            <section>
                <h2 className="text-2xl font-bold mb-4 font-headline">محاضرات القائمة ({lecturesInPlaylist.length})</h2>
                <div className="space-y-4">
                    {lecturesInPlaylist.length > 0 ? (
                        lecturesInPlaylist.map((lecture, index) => (
                             <div key={lecture.id} className="flex items-center gap-2 group">
                                <div className="flex-grow">
                                    <LectureListItem lecture={lecture} index={index + 1} />
                                </div>
                                {isOwner && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveLecture(lecture.id)}
                                        disabled={!!isDeleting}
                                        aria-label="حذف المحاضرة من القائمة"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {isDeleting === lecture.id ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                        )}
                                    </Button>
                                )}
                            </div>
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
