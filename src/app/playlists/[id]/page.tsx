
'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayRemove, updateDoc } from 'firebase/firestore';
import type { Playlist, Lecture, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureListItem } from '@/components/lecture-list-item';
import { ListMusic, Loader2, Clock, Trash2, GripVertical } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { getInitials, formatTotalDuration } from '@/lib/utils';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableLectureItem({ lecture, index }: { lecture: Lecture, index: number, isOwner: boolean, onRemove: (lecture: Lecture) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lecture.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="flex items-center gap-2 group">
                <div className="flex-grow">
                    <LectureListItem lecture={lecture} index={index + 1} />
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="cursor-grab" {...listeners}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </div>
    );
}


export default function PlaylistPage() {
    const params = useParams();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user: currentUser } = useUser();

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
    
    const [orderedLectures, setOrderedLectures] = useState<Lecture[]>([]);
    const [lectureToRemove, setLectureToRemove] = useState<Lecture | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (playlist && allLectures) {
            const lectureMap = new Map(allLectures.map(l => [l.id, l]));
            const lecturesFromIds = (playlist.lectureIds || [])
                .map(id => lectureMap.get(id))
                .filter((l): l is Lecture => !!l);
            setOrderedLectures(lecturesFromIds);
        }
    }, [playlist, allLectures]);

    const isLoading = playlistLoading || userLoading || lecturesLoading;
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 250, // Require a 250ms press delay
                tolerance: 5, // Allow 5px of movement before canceling
            },
        })
    );

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setOrderedLectures((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                
                // Update Firestore without blocking UI
                if (playlistDocRef) {
                    const newLectureIds = newOrder.map(item => item.id);
                    updateDocumentNonBlocking(playlistDocRef, { lectureIds: newLectureIds });
                }

                return newOrder;
            });
        }
    }, [playlistDocRef]);


    const { totalDuration } = useMemo(() => {
        if (!orderedLectures) return { totalDuration: 0 };
        const duration = orderedLectures.reduce((acc, lecture) => acc + (lecture.duration || 0), 0);
        return { totalDuration: duration };
    }, [orderedLectures]);
    
    const handlePublicToggle = (isPublic: boolean) => {
        if (!firestore || !playlistDocRef || !isOwner) return;
        
        updateDocumentNonBlocking(playlistDocRef, { isPublic });

        toast({
            title: "تم تحديث حالة القائمة",
            description: `أصبحت القائمة الآن ${isPublic ? 'عامة' : 'خاصة'}.`,
        });
    };
    
    const handleConfirmRemoveLecture = async () => {
        if (!lectureToRemove || !firestore || !playlistDocRef || !isOwner) return;
        setIsSubmitting(true);

        try {
            await updateDoc(playlistDocRef, {
                lectureIds: arrayRemove(lectureToRemove.id)
            });
            toast({
                title: "تم حذف المحاضرة من القائمة"
            });
            setLectureToRemove(null);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "حدث خطأ أثناء الحذف" });
        } finally {
            setIsSubmitting(false);
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
        <>
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
                    <h2 className="text-2xl font-bold mb-4 font-headline">محاضرات القائمة ({orderedLectures.length})</h2>
                    <div className="space-y-4">
                        {orderedLectures.length > 0 ? (
                            isOwner ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={orderedLectures.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-4">
                                            {orderedLectures.map((lecture, index) => (
                                                 <div key={lecture.id} className="flex items-center gap-2 group">
                                                    <SortableLectureItem lecture={lecture} index={index} isOwner={isOwner} onRemove={() => setLectureToRemove(lecture)} />
                                                    <Button variant="ghost" size="icon" onClick={() => setLectureToRemove(lecture)} aria-label="حذف المحاضرة من القائمة">
                                                        <Trash2 className="h-5 w-5 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                orderedLectures.map((lecture, index) => (
                                    <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />
                                ))
                            )
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
            {lectureToRemove && (
                 <DeleteConfirmationDialog 
                    isOpen={!!lectureToRemove}
                    onClose={() => setLectureToRemove(null)}
                    onConfirm={handleConfirmRemoveLecture}
                    title={`حذف "${lectureToRemove.title}"؟`}
                    description="هل أنت متأكد من رغبتك في حذف هذه المحاضرة من قائمة التشغيل؟"
                />
            )}
        </>
    );
}
