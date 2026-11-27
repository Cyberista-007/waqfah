'use client';

import { useParams, notFound, useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayRemove, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Playlist, Lecture, UserProfile } from '@/lib/types';
import { LectureListItem } from '@/components/lecture-list-item';
import { ListMusic, Clock, Trash2, GripVertical, Play, Share2, Globe, Lock } from 'lucide-react';
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
import { useTranslation } from '@/lib/i18n';

function SortableLectureItem({
  lecture,
  index,
  isOwner,
  onRemove,
}: {
  lecture: Lecture;
  index: number;
  isOwner: boolean;
  onRemove: (lecture: Lecture) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lecture.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="w-full">
      <div className="flex items-center gap-2.5 group w-full">
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab hover:bg-muted rounded-xl h-9 w-9 shrink-0"
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        <div className="flex-grow min-w-0">
          <LectureListItem lecture={lecture} index={index + 1} />
        </div>
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(lecture)}
            className="hover:bg-destructive/10 text-destructive h-9 w-9 rounded-xl shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function PlaylistPageContent() {
  const { t, isRtl } = useTranslation();
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

  useEffect(() => {
    if (playlist && allLectures) {
      const lectureMap = new Map(allLectures.map((l) => [l.id, l]));
      const lecturesFromIds = (playlist.lectureIds || [])
        .map((id) => lectureMap.get(id))
        .filter((l): l is Lecture => !!l);
      setOrderedLectures(lecturesFromIds);
    }
  }, [playlist, allLectures]);

  const isLoading = playlistLoading || userLoading || lecturesLoading;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        setOrderedLectures((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          const newOrder = arrayMove(items, oldIndex, newIndex);
          if (playlistDocRef) {
            updateDocumentNonBlocking(playlistDocRef, { lectureIds: newOrder.map((item) => item.id) });
          }
          return newOrder;
        });
      }
    },
    [playlistDocRef]
  );

  const totalDuration = useMemo(
    () => orderedLectures.reduce((acc, l) => acc + (l.duration || 0), 0),
    [orderedLectures]
  );

  const handlePublicToggle = (isPublic: boolean) => {
    if (!firestore || !playlistDocRef || !isOwner) return;
    updateDocumentNonBlocking(playlistDocRef, {
      isPublic,
      ...(playlist?.createdAt ? {} : { createdAt: serverTimestamp() }),
    });
    toast({
      title: t('تم تحديث حالة القائمة', 'Playlist updated'),
      description: isPublic
        ? t('أصبحت القائمة عامة الآن.', 'This playlist is now public.')
        : t('أصبحت القائمة خاصة الآن.', 'This playlist is now private.'),
    });
  };

  const handleConfirmRemoveLecture = async () => {
    if (!lectureToRemove || !playlistDocRef || !isOwner) return;
    try {
      await updateDoc(playlistDocRef, { lectureIds: arrayRemove(lectureToRemove.id) });
      toast({ title: t('تم حذف المحاضرة من القائمة', 'Lecture removed from playlist') });
      setLectureToRemove(null);
    } catch {
      toast({ variant: 'destructive', title: t('حدث خطأ أثناء الحذف', 'Failed to remove lecture') });
    }
  };

  const handleShare = useCallback(async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `${playlist?.name} — ${t('قائمة تشغيل على وقفة', 'Playlist on Waqfah')}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: t('تم نسخ الرابط!', 'Link copied!') });
    } catch {
      toast({ variant: 'destructive', title: t('فشل نسخ الرابط', 'Failed to copy link') });
    }
  }, [playlist?.name, toast, t]);

  if (isLoading) return <HomePageSkeleton />;
  if (!playlist) {
    notFound();
    return null;
  }

  const firstLecture = orderedLectures[0];
  const videoId = firstLecture ? getVideoIdFromUrl(firstLecture.youtubeUrl) : null;
  const coverImageUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : firstLecture
      ? getPlaceholderImage(firstLecture.imageId)?.imageUrl
      : null;

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-6xl">
        {/* Playlist Overview Card */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
          <div className="relative w-full max-w-xs md:w-72 shrink-0 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center">
            {coverImageUrl ? (
              <Image src={coverImageUrl} alt={playlist.name} fill className="object-cover" />
            ) : (
              <ListMusic className="w-16 h-16 text-primary/40" />
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between gap-5 text-center md:text-start min-w-0">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant="secondary" className="text-xs font-bold gap-1">
                  <ListMusic className="w-3.5 h-3.5 text-primary" />
                  <span>{t('قائمة تشغيل', 'Playlist')}</span>
                </Badge>

                <Badge variant="outline" className="text-xs font-semibold gap-1">
                  <span>{orderedLectures.length} {t('محاضرة', 'Lectures')}</span>
                </Badge>

                {totalDuration > 0 && (
                  <Badge variant="outline" className="text-xs font-semibold gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTotalDuration(totalDuration)}</span>
                  </Badge>
                )}

                {userProfile && (
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-muted border border-border">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                      <AvatarFallback className="text-[9px]">{getInitials(userProfile.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-foreground">{userProfile.name}</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline text-foreground tracking-tight">
                {playlist.name}
              </h1>

              {playlist.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {playlist.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {orderedLectures.length > 0 && (
                <Button asChild className="h-11 px-6 rounded-xl font-bold gap-2 shadow-sm">
                  <Link href={`/lectures/${orderedLectures[0].slug}?playlist=${playlist.id}&u=${userId}`}>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t('بدء التشغيل', 'Play All')}</span>
                  </Link>
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleShare}
                className="h-11 px-4 rounded-xl font-bold gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('مشاركة', 'Share')}</span>
              </Button>

              {isOwner && (
                <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl bg-muted/50 border border-border">
                  {playlist.isPublic ? (
                    <Globe className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="playlist-public-switch" className="text-xs font-bold cursor-pointer">
                    {playlist.isPublic ? t('قائمة عامة', 'Public') : t('قائمة خاصة', 'Private')}
                  </Label>
                  <Switch
                    id="playlist-public-switch"
                    checked={!!playlist.isPublic}
                    onCheckedChange={handlePublicToggle}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Lectures List */}
        <section className="space-y-4">
          {orderedLectures.length > 0 ? (
            isOwner ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedLectures.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
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
              <div className="space-y-3">
                {orderedLectures.map((lecture, index) => (
                  <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl">
              <ListMusic className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">
                {t('قائمة التشغيل هذه فارغة حاليًا.', 'This playlist is currently empty.')}
              </p>
            </div>
          )}
        </section>
      </div>

      {lectureToRemove && (
        <DeleteConfirmationDialog
          isOpen={!!lectureToRemove}
          onClose={() => setLectureToRemove(null)}
          onConfirm={handleConfirmRemoveLecture}
          title={t(`حذف "${lectureToRemove.title}"؟`, `Remove "${lectureToRemove.title}"?`)}
          description={t(
            'هل أنت متأكد من رغبتك في إزالة هذه المحاضرة من قائمة التشغيل؟',
            'Are you sure you want to remove this lecture from the playlist?'
          )}
        />
      )}
    </div>
  );
}

export default function PlaylistPageClient() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <PlaylistPageContent />
    </Suspense>
  );
}
