'use client';

import { useParams, notFound, useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayRemove, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Playlist, Lecture, UserProfile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { LectureListItem } from '@/components/lecture-list-item';
import { ListMusic, Clock, Trash2, GripVertical, Play, Share2, Shuffle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { getInitials, formatTotalDuration, getVideoIdFromUrl } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/images';
import Image from 'next/image';
import { useMemo, useState, useEffect, useCallback, Suspense } from 'react';
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
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined };
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
                <div className="flex-grow min-w-0"><LectureListItem lecture={lecture} index={index + 1} /></div>
                {isOwner && (
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => onRemove(lecture)} className="hover:bg-destructive/10 text-destructive h-10 w-10 rounded-xl">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function PlaylistPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user: currentUser } = useUser();
    const playlistId = params.id as string;
    const urlUserId = searchParams.get('u');
    const prefixUserId = playlistId?.includes('_') ? playlistId.split('_')[0] : null;
    const userId = urlUserId || prefixUserId || currentUser?.uid;
    const isOwner = currentUser?.uid === userId;

    const playlistDocRef = useMemoFirebase(() => (firestore && userId && playlistId ? doc(firestore, 'users', userId, 'playlists', playlistId) : null), [firestore, userId, playlistId]);
    const { data: playlist, isLoading: playlistLoading } = useDoc<Playlist>(playlistDocRef);
    const userDocRef = useMemoFirebase(() => (firestore && userId ? doc(firestore, 'users', userId) : null), [firestore, userId]);
    const { data: userProfile, isLoading: userLoading } = useDoc<UserProfile>(userDocRef);
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const [orderedLectures, setOrderedLectures] = useState<Lecture[]>([]);
    const [lectureToRemove, setLectureToRemove] = useState<Lecture | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (playlist && allLectures) {
            const lectureMap = new Map(allLectures.map(l => [l.id, l]));
            const lecturesFromIds = (playlist.lectureIds || []).map(id => lectureMap.get(id)).filter((l): l is Lecture => !!l);
            setOrderedLectures(lecturesFromIds);
        }
    }, [playlist, allLectures]);

    const isLoading = playlistLoading || userLoading || lecturesLoading;
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }));

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setOrderedLectures((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                if (playlistDocRef) updateDocumentNonBlocking(playlistDocRef, { lectureIds: newOrder.map(item => item.id) });
                return newOrder;
            });
        }
    }, [playlistDocRef]);

    const { totalDuration } = useMemo(() => ({ totalDuration: orderedLectures.reduce((acc, l) => acc + (l.duration || 0), 0) }), [orderedLectures]);
    
    const handlePublicToggle = (isPublic: boolean) => {
        if (!firestore || !playlistDocRef || !isOwner) return;
        updateDocumentNonBlocking(playlistDocRef, { isPublic, ...(playlist?.createdAt ? {} : { createdAt: serverTimestamp() }) });
        toast({ title: "تم تحديث حالة القائمة", description: `أصبحت القائمة الآن ${isPublic ? 'عامة' : 'خاصة'}.` });
    };
    
    const handleConfirmRemoveLecture = async () => {
        if (!lectureToRemove || !playlistDocRef || !isOwner) return;
        setIsSubmitting(true);
        try {
            await updateDoc(playlistDocRef, { lectureIds: arrayRemove(lectureToRemove.id) });
            toast({ title: "تم حذف المحاضرة من القائمة" });
            setLectureToRemove(null);
        } catch (error) { toast({ variant: 'destructive', title: "حدث خطأ أثناء الحذف" }); } finally { setIsSubmitting(false); }
    };

    const handleShare = useCallback(async () => {
        const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
        const shareText = `شاهد قائمة تشغيل "${playlist?.name}" على منصة وقفة`;
        if (typeof navigator !== 'undefined' && navigator.share) {
            try { await navigator.share({ title: shareText, text: shareText, url: shareUrl }); } catch (error) {}
        } else {
            try { await navigator.clipboard.writeText(shareUrl); toast({ title: 'تم نسخ الرابط!' }); } catch (err) { toast({ variant: 'destructive', title: 'فشل نسخ الرابط' }); }
        }
    }, [playlist?.name, toast]);

    if (isLoading) return <HomePageSkeleton />;
    if (!playlist) { notFound(); return null; }
    
    const firstLecture = orderedLectures[0];
    const videoId = firstLecture ? getVideoIdFromUrl(firstLecture.youtubeUrl) : null;
    const coverImageUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : (firstLecture ? getPlaceholderImage(firstLecture.imageId)?.imageUrl : null);

    return (
        <>
            <div className="space-y-8">
                <div className="relative overflow-hidden bg-black/40 border border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-3xl group">
                    <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center md:items-start gap-12">
                        <div className="shrink-0 relative w-64 h-64 md:w-80 md:h-80 group/cover">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505] border border-white/10 rounded-[3rem] overflow-hidden flex items-center justify-center">
                                {coverImageUrl ? <Image src={coverImageUrl} alt="Playlist Cover" fill className="object-cover opacity-80" /> : <ListMusic className="w-24 h-24 text-primary/50" />}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-8 w-full items-center md:items-start text-center md:text-right">
                            <div className="space-y-4 w-full">
                                <Badge variant="outline" className="mb-2 rounded-full px-4 py-1.5 bg-primary/10 border-primary/20 text-primary font-black uppercase tracking-widest text-xs">قائمة تشغيل</Badge>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-headline text-white tracking-tight leading-tight">{playlist.name}</h1>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap w-full">
                                {orderedLectures.length > 0 && (
                                    <Button asChild className="h-16 px-10 rounded-[2rem] bg-primary text-primary-foreground font-black text-xl gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 group/play">
                                        <Link href={`/lectures/${orderedLectures[0].slug}?playlist=${playlist.id}&u=${userId}`}><Play className="w-6 h-6 fill-current" /> بدء المشاهدة</Link>
                                    </Button>
                                )}
                                <Button variant="outline" onClick={handleShare} className="h-16 w-16 rounded-[2rem] bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"><Share2 className="w-6 h-6" /></Button>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="space-y-4">
                    {orderedLectures.length > 0 ? (
                        isOwner ? (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={orderedLectures.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-6">
                                        {orderedLectures.map((lecture, index) => <SortableLectureItem key={lecture.id} lecture={lecture} index={index} isOwner={isOwner} onRemove={() => setLectureToRemove(lecture)} />)}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (orderedLectures.map((lecture, index) => <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />))
                    ) : ( <Card className="text-center py-12"><CardContent><p className="text-muted-foreground">قائمة التشغيل هذه فارغة حاليًا.</p></CardContent></Card> )}
                </section>
            </div>
            {lectureToRemove && <DeleteConfirmationDialog isOpen={!!lectureToRemove} onClose={() => setLectureToRemove(null)} onConfirm={handleConfirmRemoveLecture} title={`حذف "${lectureToRemove.title}"؟`} description="هل أنت متأكد من رغبتك في حذف هذه المحاضرة من قائمة التشغيل؟" />}
        </>
    );
}

export default function PlaylistPageClient() {
    return <Suspense fallback={<HomePageSkeleton />}><PlaylistPageContent /></Suspense>;
}
