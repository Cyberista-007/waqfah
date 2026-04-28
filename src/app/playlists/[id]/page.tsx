
'use client';

import { useParams, notFound, useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayRemove, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Playlist, Lecture, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureListItem } from '@/components/lecture-list-item';
import { ListMusic, Loader2, Clock, Trash2, GripVertical, Play, Share2, Shuffle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { getInitials, formatTotalDuration, getVideoIdFromUrl } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/images';
import Image from 'next/image';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableLectureItem({ lecture, index, isOwner, onRemove }: { lecture: Lecture, index: number, isOwner: boolean, onRemove: (lecture: Lecture) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lecture.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="w-full">
            <div className="flex items-center gap-4 group w-full">
                {isOwner && (
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="cursor-grab hover:bg-white/5 rounded-xl h-10 w-10" {...listeners}>
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                )}
                <div className="flex-grow min-w-0">
                    <LectureListItem lecture={lecture} index={index + 1} />
                </div>
                {isOwner && (
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => onRemove(lecture)} aria-label="حذف المحاضرة من القائمة" className="hover:bg-destructive/10 text-destructive h-10 w-10 rounded-xl">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}


import { Suspense } from 'react';

function PlaylistPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user: currentUser } = useUser();

    const playlistId = params.id as string;
    const urlUserId = searchParams.get('u');
    const prefixUserId = playlistId.includes('_') ? playlistId.split('_')[0] : null;
    
    // Fallback order: URL param -> Prefix in ID -> Current logged-in user
    const userId = urlUserId || prefixUserId || currentUser?.uid;
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
        
        updateDocumentNonBlocking(playlistDocRef, { 
            isPublic,
            ...(playlist?.createdAt ? {} : { createdAt: serverTimestamp() })
        });

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
    
    const firstLecture = orderedLectures[0];
    let coverImageUrl = null;
    let coverImageHint = null;

    if (firstLecture) {
        const videoId = getVideoIdFromUrl(firstLecture.youtubeUrl);
        const placeholder = getPlaceholderImage(firstLecture.imageId);
        coverImageUrl = videoId 
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : placeholder?.imageUrl || `https://picsum.photos/seed/${firstLecture.slug}/600/600`;
        coverImageHint = placeholder?.imageHint || "playlist cover";
    }

    return (
        <>
            <div className="space-y-8">
                <div className="relative overflow-hidden bg-black/40 border border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-3xl group">
                    {/* 🎨 Cinematic Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center md:items-start gap-12">
                        {/* 💿 Abstract Cover Art (Record / Vinyl Vibe) */}
                        <div className="shrink-0 relative w-64 h-64 md:w-80 md:h-80 group/cover">
                            {/* Outer Glow */}
                            <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-[3rem] group-hover/cover:blur-[60px] group-hover/cover:bg-primary/30 transition-all duration-700" />
                            {/* Inner Card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex items-center justify-center">
                                {coverImageUrl ? (
                                    <Image 
                                        src={coverImageUrl} 
                                        alt={coverImageHint || "Playlist Cover"} 
                                        fill 
                                        className="object-cover opacity-80 group-hover/cover:opacity-100 group-hover/cover:scale-110 transition-all duration-1000"
                                    />
                                ) : (
                                    <ListMusic className="w-24 h-24 text-primary/50 drop-shadow-lg group-hover/cover:scale-110 transition-transform duration-700" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                            </div>
                        </div>

                        {/* 🎵 Text & Controls */}
                        <div className="flex-1 flex flex-col gap-8 w-full items-center md:items-start text-center md:text-right">
                            <div className="space-y-4 w-full">
                                <Badge variant="outline" className="mb-2 rounded-full px-4 py-1.5 bg-primary/10 border-primary/20 text-primary font-black uppercase tracking-widest text-xs">
                                    قائمة تشغيل
                                </Badge>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-headline text-white tracking-tight leading-tight">
                                    {playlist.name}
                                </h1>
                                {playlist.description && (
                                    <p className="text-xl md:text-2xl text-white/50 max-w-3xl leading-relaxed mx-auto md:mx-0">
                                        {playlist.description}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap w-full">
                                {orderedLectures.length > 0 && (
                                    <Button asChild className="h-16 px-10 rounded-[2rem] bg-primary text-primary-foreground font-black text-xl gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 group/play">
                                        <Link href={`/lectures/${orderedLectures[0].slug}?playlist=${playlist.id}`}>
                                            <Play className="w-6 h-6 fill-current transition-transform group-hover/play:scale-110" />
                                            بدء المشاهدة
                                        </Link>
                                    </Button>
                                )}
                                <Button variant="outline" className="h-16 w-16 rounded-[2rem] bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all group/share">
                                    <Share2 className="w-6 h-6 transition-transform group-hover/share:rotate-12" />
                                </Button>
                                <Button variant="outline" className="h-16 w-16 rounded-[2rem] bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all group/shuffle">
                                    <Shuffle className="w-6 h-6 transition-transform group-hover/shuffle:rotate-180 duration-500" />
                                </Button>
                            </div>

                            {/* 📊 Meta Information */}
                            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap w-full pt-4 border-t border-white/10">
                                {userProfile && (
                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                        <Avatar className="h-8 w-8 border border-white/10">
                                            <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                                            <AvatarFallback className="bg-black/50 text-xs font-bold">{getInitials(userProfile.name)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-white/60">
                                            بواسطة <span className="font-bold text-white/90">{userProfile.name}</span>
                                        </span>
                                    </div>
                                )}
                                {totalDuration > 0 && (
                                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-bold text-white/90">{formatTotalDuration(totalDuration)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                    <ListMusic className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-bold text-white/90">{orderedLectures.length} حلقة</span>
                                </div>
                            </div>
                        </div>

                        {/* ⚙️ Owner Controls Floating Top Right */}
                        {isOwner && (
                            <div className="absolute top-6 left-6 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 shadow-2xl">
                                <Label htmlFor="public-switch" className="cursor-pointer text-xs font-bold text-white/80 select-none hidden md:block">
                                    {playlist.isPublic ? 'عامة' : 'خاصة'}
                                </Label>
                                <Switch
                                    id="public-switch"
                                    checked={playlist.isPublic}
                                    onCheckedChange={handlePublicToggle}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <section className="space-y-8">
                    <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] backdrop-blur-xl">
                        <p className="text-xl md:text-2xl text-primary/90 font-medium italic text-center leading-relaxed">
                            "بصيرةٌ ترنو نحو العلم، لتُوقد في القلب شعلة اليقين، فترتقي الروح في معارج الإيمان نحو أسمى المنازل."
                        </p>
                    </div>
                    <div className="space-y-4">
                        {orderedLectures.length > 0 ? (
                            isOwner ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={orderedLectures.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-6">
                                            {orderedLectures.map((lecture, index) => (
                                                <SortableLectureItem 
                                                    key={lecture.id} 
                                                    lecture={lecture} 
                                                    index={index} 
                                                    isOwner={isOwner} 
                                                    onRemove={() => setLectureToRemove(lecture)} 
                                                />
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

export default function PlaylistPage() {
    return (
        <Suspense fallback={<HomePageSkeleton />}>
            <PlaylistPageContent />
        </Suspense>
    );
}
