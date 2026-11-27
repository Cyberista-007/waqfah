'use client';

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import type { Lecture, Series, Program } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Youtube, Upload, Clapperboard, Video, ListVideo, RefreshCw, CheckCircle2 } from 'lucide-react';
import { collection, doc, increment, Timestamp, writeBatch, setDoc, getDocs } from 'firebase/firestore';
import { formatDuration, getInitials, getVideoIdFromUrl, normalizeArabic } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FetchedVideo {
    videoId: string;
    title: string;
    description: string;
    durationInSeconds: number;
    publishedAt: string;
    viewCount?: number;
}

interface FetchedPlaylist {
    id: string;
    title: string;
    description: string;
    videoCount: number;
}

interface FetchedChannelInfo {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    bannerUrl: string;
}

function makeCleanSlug(text: string, fallback: string): string {
    const cleaned = text
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return cleaned || fallback;
}

function ImportPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const [fetchedVideos, setFetchedVideos] = useState<FetchedVideo[]>([]);
    const [fetchedShorts, setFetchedShorts] = useState<FetchedVideo[]>([]);
    const [fetchedPlaylists, setFetchedPlaylists] = useState<FetchedPlaylist[]>([]);
    const [channelInfo, setChannelInfo] = useState<FetchedChannelInfo | null>(null);
    const [programInfo, setProgramInfo] = useState<Program | null>(null);

    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [selectedShorts, setSelectedShorts] = useState<string[]>([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
    const [isSyncingNow, setIsSyncingNow] = useState(false);

    const { data: allLectures } = useCollection<Lecture>('lectures');
    const { data: allPrograms } = useCollection<Program>('programs');
    const { data: allSeries } = useCollection<Series>('series');

    // Sync matched program once allPrograms loads or channelInfo changes
    useEffect(() => {
        if (!channelInfo) return;
        const existingProgram = allPrograms?.find(
            (p) =>
                p.channelId === channelInfo.id ||
                normalizeArabic(p.name).trim() === normalizeArabic(channelInfo.name).trim()
        );
        if (existingProgram) {
            setProgramInfo(existingProgram);
        } else {
            setProgramInfo({
                name: channelInfo.name,
                slug: makeCleanSlug(channelInfo.name, `program-${channelInfo.id}`),
                youtubeUrl: `https://youtube.com/channel/${channelInfo.id}`,
            } as Program);
        }
    }, [channelInfo, allPrograms]);

    const handleFetchContent = useCallback(
        async (fetchUrl?: string) => {
            const urlToFetch = fetchUrl || url;
            if (!urlToFetch) {
                toast({ variant: 'destructive', title: 'الرجاء إدخال رابط القناة أو قائمة التشغيل.' });
                return;
            }

            setIsLoading(true);
            setSelectedVideos([]);
            setSelectedShorts([]);
            setSelectedPlaylists([]);

            try {
                const response = await fetch('/api/youtube-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: urlToFetch }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'فشل في جلب البيانات.');

                if (data.channelInfo) {
                    setChannelInfo(data.channelInfo);
                }

                // Ensure fetched lists themselves contain no duplicate videoIds
                const uniqueVideos = Array.from(
                    new Map<string, FetchedVideo>((data.videos || []).map((v: FetchedVideo) => [v.videoId, v])).values()
                );
                const uniqueShorts = Array.from(
                    new Map<string, FetchedVideo>((data.shorts || []).map((s: FetchedVideo) => [s.videoId, s])).values()
                );

                setFetchedVideos(uniqueVideos);
                setFetchedShorts(uniqueShorts);
                setFetchedPlaylists(data.playlists || []);
                toast({ title: 'تم جلب المحتوى بنجاح!' });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'خطأ', description: error.message });
            } finally {
                setIsLoading(false);
            }
        },
        [url, toast]
    );

    useEffect(() => {
        const youtubeUrl = searchParams.get('youtubeUrl');
        if (youtubeUrl) {
            setUrl(youtubeUrl);
            handleFetchContent(youtubeUrl);
        }
    }, [searchParams, handleFetchContent]);

    const existingYoutubeVideoIds = useMemo(() => {
        const ids = new Set<string>();
        if (!allLectures) return ids;
        allLectures.forEach((l) => {
            const vid = getVideoIdFromUrl(l.youtubeUrl) || getVideoIdFromUrl(l.audioSrc);
            if (vid) ids.add(vid);
        });
        return ids;
    }, [allLectures]);

    const existingSeriesByPlaylistOrTitle = useMemo(() => {
        const byPlaylistId = new Map<string, Series>();
        const byTitle = new Map<string, Series>();
        (allSeries || []).forEach((s) => {
            if (s.youtubePlaylistId) byPlaylistId.set(s.youtubePlaylistId, s);
            const normTitle = normalizeArabic(s.title).trim();
            if (normTitle) byTitle.set(`${s.programId || ''}:${normTitle}`, s);
        });
        return { byPlaylistId, byTitle };
    }, [allSeries]);

    const newVideos = useMemo(
        () => fetchedVideos.filter((v) => !existingYoutubeVideoIds.has(v.videoId)),
        [fetchedVideos, existingYoutubeVideoIds]
    );
    const newShorts = useMemo(
        () => fetchedShorts.filter((s) => !existingYoutubeVideoIds.has(s.videoId)),
        [fetchedShorts, existingYoutubeVideoIds]
    );

    const skippedDuplicatesCount =
        fetchedVideos.length - newVideos.length + (fetchedShorts.length - newShorts.length);

    const handleImportSelected = async () => {
        if (!firestore) return;

        const videosToImport = [
            ...newVideos.filter((v) => selectedVideos.includes(v.videoId)),
            ...newShorts.filter((s) => selectedShorts.includes(s.videoId)),
        ];
        const playlistsToImport = fetchedPlaylists.filter((p) => selectedPlaylists.includes(p.id));

        if (videosToImport.length === 0 && playlistsToImport.length === 0) {
            toast({ title: 'لم يتم تحديد أي عناصر جديدة للاستيراد.' });
            return;
        }

        setIsImporting(true);

        try {
            // Query live Firestore snapshots so duplicates are never written even across tabs/concurrent imports
            const [liveProgramsSnap, liveLecturesSnap, liveSeriesSnap] = await Promise.all([
                getDocs(collection(firestore, 'programs')),
                getDocs(collection(firestore, 'lectures')),
                getDocs(collection(firestore, 'series')),
            ]);

            const livePrograms = liveProgramsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Program));
            const seenVideoIds = new Set<string>();
            const seenSlugs = new Set<string>();
            const existingLectureByVideoId = new Map<string, { id: string; seriesId?: string }>();

            liveLecturesSnap.docs.forEach((d) => {
                const data = d.data() as Lecture;
                const vid = getVideoIdFromUrl(data.youtubeUrl) || getVideoIdFromUrl(data.audioSrc);
                if (vid) {
                    seenVideoIds.add(vid);
                    existingLectureByVideoId.set(vid, { id: d.id, seriesId: data.seriesId });
                }
                if (data.slug) seenSlugs.add(data.slug);
            });

            const liveSeriesList = liveSeriesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Series));

            // Resolve or safely create the parent Program
            let programToUse: Program | null = null;
            if (programInfo?.id) {
                programToUse = livePrograms.find((p) => p.id === programInfo.id) || programInfo;
            } else if (channelInfo) {
                programToUse =
                    livePrograms.find(
                        (p) =>
                            p.channelId === channelInfo.id ||
                            normalizeArabic(p.name).trim() === normalizeArabic(channelInfo.name).trim()
                    ) || null;
            }

            if (!programToUse && channelInfo) {
                const progSlug = makeCleanSlug(channelInfo.name, `program-${channelInfo.id}`);
                const newProgramData = {
                    name: channelInfo.name || 'برنامج جديد',
                    slug: progSlug,
                    youtubeUrl: `https://youtube.com/channel/${channelInfo.id}`,
                    bio: channelInfo.description || '',
                    imageUrl: channelInfo.imageUrl || '',
                    channelId: channelInfo.id,
                    createdAt: Timestamp.now(),
                    followerCount: 0,
                    imageId: `program-${progSlug}`,
                };
                const newProgramRef = doc(collection(firestore, 'programs'));
                await setDoc(newProgramRef, newProgramData);
                await setDoc(doc(firestore, 'stats', 'global'), { programs: increment(1) }, { merge: true });
                programToUse = { ...newProgramData, id: newProgramRef.id } as unknown as Program;
                toast({ title: 'تم إنشاء برنامج جديد', description: `"${programToUse.name}"` });
            }

            if (!programToUse || !programToUse.id) {
                throw new Error('لا يمكن تحديد البرنامج، يرجى التأكد من جلب معلومات القناة أولاً.');
            }

            const programSlugSafe = programToUse.slug || makeCleanSlug(programToUse.name || '', programToUse.id);
            const programNameSafe = programToUse.name || '';

            const writes: Array<{
                type: 'set' | 'update';
                ref: ReturnType<typeof doc>;
                data: Record<string, any>;
            }> = [];

            let newLecturesCount = 0;
            let linkedLecturesCount = 0;
            let newSeriesCount = 0;
            let skippedDuplicatesInRun = 0;

            // Helper to make unique lecture slug
            const buildUniqueLectureSlug = (title: string, videoId: string) => {
                let slug = makeCleanSlug(title, `video-${videoId}`);
                if (seenSlugs.has(slug)) {
                    slug = `${slug}-${videoId.slice(0, 6)}`;
                }
                seenSlugs.add(slug);
                return slug;
            };

            // 1. Import playlists FIRST as Series + import new / link existing lectures
            for (const playlist of playlistsToImport) {
                const playlistUrl = `https://www.youtube.com/playlist?list=${playlist.id}`;
                const response = await fetch('/api/youtube-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: playlistUrl,
                        playlistId: playlist.id,
                        playlistVideosOnly: true,
                    }),
                });

                const playlistVideoData = await response.json();
                if (!response.ok) {
                    throw new Error(playlistVideoData?.message || `فشل جلب فيديوهات قائمة التشغيل: ${playlist.title}`);
                }

                const rawPlaylistVideos: FetchedVideo[] = [
                    ...(playlistVideoData.videos || []),
                    ...(playlistVideoData.shorts || []),
                ];

                // Deduplicate playlist items internally
                const playlistVideos = Array.from(
                    new Map(rawPlaylistVideos.map((v) => [v.videoId, v])).values()
                );

                // Reuse existing series if already imported for this playlist/title
                const normTitle = normalizeArabic(playlist.title).trim();
                const existingSeries = liveSeriesList.find(
                    (s) =>
                        s.youtubePlaylistId === playlist.id ||
                        (s.programId === programToUse!.id && normalizeArabic(s.title).trim() === normTitle)
                );

                const seriesSlug = existingSeries?.slug || makeCleanSlug(playlist.title, `series-${playlist.id}`);
                const seriesRef = existingSeries
                    ? doc(firestore, 'series', existingSeries.id)
                    : doc(collection(firestore, 'series'));

                let seriesTotalForThisImport = 0;

                for (const video of playlistVideos) {
                    const existingLec = existingLectureByVideoId.get(video.videoId);

                    if (!seenVideoIds.has(video.videoId)) {
                        // Brand-new lecture
                        seenVideoIds.add(video.videoId);
                        const lectureSlug = buildUniqueLectureSlug(video.title, video.videoId);
                        const lectureRef = doc(collection(firestore, 'lectures'));
                        existingLectureByVideoId.set(video.videoId, { id: lectureRef.id, seriesId: seriesRef.id });
                        const pubDate = video.publishedAt ? new Date(video.publishedAt) : new Date();

                        writes.push({
                            type: 'set',
                            ref: lectureRef,
                            data: {
                                title: video.title,
                                slug: lectureSlug,
                                description: video.description || '',
                                programId: programToUse.id,
                                programName: programNameSafe,
                                programSlug: programSlugSafe,
                                seriesId: seriesRef.id,
                                seriesTitle: playlist.title,
                                seriesSlug,
                                audioSrc: `https://www.youtube.com/watch?v=${video.videoId}`,
                                youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                                duration: video.durationInSeconds || 0,
                                imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                                rating: 0,
                                ratingCount: 0,
                                viewCount: 0,
                                youtubeViewCount: video.viewCount || 0,
                                transcript: [],
                                createdAt: Timestamp.now(),
                                publishedAt: Timestamp.fromDate(isNaN(pubDate.getTime()) ? new Date() : pubDate),
                                language: 'ar',
                            },
                        });
                        newLecturesCount++;
                        seriesTotalForThisImport++;
                    } else if (existingLec) {
                        // Video already exists in Firestore: never duplicate; link to this series if unlinked
                        if (existingLec.seriesId !== seriesRef.id) {
                            writes.push({
                                type: 'update',
                                ref: doc(firestore, 'lectures', existingLec.id),
                                data: {
                                    seriesId: seriesRef.id,
                                    seriesTitle: playlist.title,
                                    seriesSlug,
                                },
                            });
                            existingLec.seriesId = seriesRef.id;
                            linkedLecturesCount++;
                        }
                        seriesTotalForThisImport++;
                    }
                }

                if (existingSeries) {
                    writes.push({
                        type: 'update',
                        ref: seriesRef,
                        data: {
                            youtubePlaylistId: playlist.id,
                            lectureCount: Math.max(existingSeries.lectureCount || 0, seriesTotalForThisImport),
                        },
                    });
                } else {
                    newSeriesCount++;
                    writes.push({
                        type: 'set',
                        ref: seriesRef,
                        data: {
                            title: playlist.title,
                            slug: seriesSlug,
                            description: playlist.description || '',
                            imageId: `series-${seriesSlug}`,
                            programId: programToUse.id,
                            programName: programNameSafe,
                            programSlug: programSlugSafe,
                            youtubePlaylistId: playlist.id,
                            lectureCount: seriesTotalForThisImport,
                            createdAt: Timestamp.now(),
                        },
                    });
                }
            }

            // 2. Import standalone selected videos (skip any already imported or added by selected playlists!)
            videosToImport.forEach((video) => {
                if (seenVideoIds.has(video.videoId)) {
                    skippedDuplicatesInRun++;
                    return;
                }
                seenVideoIds.add(video.videoId);
                const slug = buildUniqueLectureSlug(video.title, video.videoId);
                const lectureRef = doc(collection(firestore, 'lectures'));
                const pubDate = video.publishedAt ? new Date(video.publishedAt) : new Date();

                writes.push({
                    type: 'set',
                    ref: lectureRef,
                    data: {
                        title: video.title,
                        slug,
                        description: video.description || '',
                        programId: programToUse!.id,
                        programName: programNameSafe,
                        programSlug: programSlugSafe,
                        audioSrc: `https://www.youtube.com/watch?v=${video.videoId}`,
                        youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                        duration: video.durationInSeconds || 0,
                        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                        rating: 0,
                        ratingCount: 0,
                        viewCount: 0,
                        youtubeViewCount: video.viewCount || 0,
                        transcript: [],
                        createdAt: Timestamp.now(),
                        publishedAt: Timestamp.fromDate(isNaN(pubDate.getTime()) ? new Date() : pubDate),
                        language: 'ar',
                    },
                });
                newLecturesCount++;
            });

            if (writes.length === 0) {
                toast({
                    title: 'لا توجد عناصر جديدة',
                    description: 'جميع الفيديوهات والقوائم المحددة موجودة مسبقاً دون أي تكرار.',
                });
                return;
            }

            // Commit in chunks of 400 to stay safely under Firestore's 500-operation limit
            for (let i = 0; i < writes.length; i += 400) {
                const batch = writeBatch(firestore);
                const chunk = writes.slice(i, i + 400);
                chunk.forEach((w) => {
                    if (w.type === 'update') {
                        batch.update(w.ref, w.data);
                    } else {
                        batch.set(w.ref, w.data);
                    }
                });
                await batch.commit();
            }

            const statsRef = doc(firestore, 'stats', 'global');
            const statsUpdate: Record<string, any> = {};
            if (newLecturesCount > 0) statsUpdate.lectures = increment(newLecturesCount);
            if (newSeriesCount > 0) statsUpdate.series = increment(newSeriesCount);
            if (Object.keys(statsUpdate).length > 0) {
                await setDoc(statsRef, statsUpdate, { merge: true });
            }

            // Auto-register channel in YouTube WebSub for instant future uploads
            fetch('/api/cron/youtube-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ programId: programToUse.id, renewWebSub: true }),
            }).catch(() => {});

            toast({
                title: 'اكتمل الاستيراد بنجاح!',
                description: `تم استيراد ${newLecturesCount} محاضرة جديدة${linkedLecturesCount > 0 ? ` وربط ${linkedLecturesCount} محاضرة موجودة` : ''}${newSeriesCount > 0 ? ` وإنشاء ${newSeriesCount} سلسلة` : ''}${skippedDuplicatesInRun > 0 ? ` (تم تجاهل ${skippedDuplicatesInRun} مكرر)` : ''}.`,
            });
            router.push('/admin/lectures');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'فشل الاستيراد', description: error.message });
        } finally {
            setIsImporting(false);
        }
    };

    const renderTable = (items: FetchedVideo[], selectedItems: string[], setSelectedItems: (ids: string[]) => void) => {
        const isAllSelected = items.length > 0 && selectedItems.length === items.length;
        const handleSelectAll = (checked: boolean) => setSelectedItems(checked ? items.map((v) => v.videoId) : []);
        const handleSelectOne = (id: string, checked: boolean) =>
            setSelectedItems(checked ? [...selectedItems, id] : selectedItems.filter((i) => i !== id));

        if (items.length === 0) {
            return (
                <div className="py-12 text-center text-sm text-muted-foreground">
                    جميع المقاطع في هذا القسم تم استيرادها مسبقاً أو لا توجد مقاطع جديدة.
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                        </TableHead>
                        <TableHead>العنوان</TableHead>
                        <TableHead>المدة</TableHead>
                        <TableHead>تاريخ النشر</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.videoId}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedItems.includes(item.videoId)}
                                    onCheckedChange={(c) => handleSelectOne(item.videoId, !!c)}
                                />
                            </TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{formatDuration(item.durationInSeconds)}</TableCell>
                            <TableCell>{new Date(item.publishedAt).toLocaleDateString('ar-EG')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    const renderPlaylistsTable = (
        items: FetchedPlaylist[],
        selectedItems: string[],
        setSelectedItems: (ids: string[]) => void
    ) => {
        const isAllSelected = items.length > 0 && selectedItems.length === items.length;
        const handleSelectAll = (checked: boolean) => setSelectedItems(checked ? items.map((p) => p.id) : []);
        const handleSelectOne = (id: string, checked: boolean) =>
            setSelectedItems(checked ? [...selectedItems, id] : selectedItems.filter((i) => i !== id));

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                        </TableHead>
                        <TableHead>عنوان قائمة التشغيل</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>عدد الفيديوهات</TableHead>
                        <TableHead>الوصف</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => {
                        const normTitle = normalizeArabic(item.title).trim();
                        const alreadyExists =
                            existingSeriesByPlaylistOrTitle.byPlaylistId.has(item.id) ||
                            existingSeriesByPlaylistOrTitle.byTitle.has(`${programInfo?.id || ''}:${normTitle}`);

                        return (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedItems.includes(item.id)}
                                        onCheckedChange={(c) => handleSelectOne(item.id, !!c)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell>
                                    {alreadyExists ? (
                                        <Badge variant="secondary" className="gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                            <span>موجودة (تحديث/ربط)</span>
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">جديدة</Badge>
                                    )}
                                </TableCell>
                                <TableCell>{item.videoCount}</TableCell>
                                <TableCell className="line-clamp-2">{item.description}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        );
    };

    const itemsSelectedCount = selectedVideos.length + selectedShorts.length + selectedPlaylists.length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <Upload />
                        استيراد محتوى من يوتيوب
                    </CardTitle>
                    <CardDescription>الصق رابط قناة أو قائمة تشغيل يوتيوب لجلب محتوياتها.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/channel/... أو https://www.youtube.com/playlist?list=..."
                        />
                        <Button onClick={() => handleFetchContent()} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Youtube className="me-2 h-4 w-4" /> جلب المحتوى
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-headline flex items-center gap-2">
                                <RefreshCw className={isSyncingNow ? 'animate-spin text-primary' : 'text-primary'} />
                                المزامنة التلقائية لجميع البرامج (كل 24 ساعة)
                            </CardTitle>
                            <CardDescription>
                                تعمل المزامنة تلقائياً في الخلفية يومياً لفحص أحدث محاضرات جميع القنوات والبرامج واستيرادها دون تكرار.
                            </CardDescription>
                        </div>
                        <Button
                            variant="default"
                            onClick={async () => {
                                setIsSyncingNow(true);
                                try {
                                    const res = await fetch('/api/cron/youtube-sync', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ renewWebSub: true }),
                                    });
                                    const result = await res.json();
                                    if (res.ok && result.success) {
                                        const diag = result.diagnostics;
                                        const websubNote =
                                            result.websubRenewedCount > 0
                                                ? ` وتفعيل الإشعار الفوري لـ ${result.websubRenewedCount} قناة.`
                                                : '';
                                        toast({
                                            title: 'اكتملت المزامنة بنجاح!',
                                            description: `تم فحص ${result.syncedProgramsCount || 0} برنامج واستيراد ${result.totalImported || 0} محاضرة جديدة.${websubNote}`,
                                        });
                                        if (diag && !diag.hasAdminSdk) {
                                            toast({
                                                variant: 'destructive',
                                                title: 'تنبيه: FIREBASE_SERVICE_ACCOUNT غير مضاف في Vercel',
                                                description: 'لتعمل الإضافة الفورية من يوتيوب في الخلفية أضف FIREBASE_SERVICE_ACCOUNT في إعدادات Vercel.',
                                            });
                                        }
                                    } else {
                                        toast({
                                            variant: 'destructive',
                                            title: 'حدث خطأ أثناء المزامنة',
                                            description: result.error || 'فشلت المزامنة.',
                                        });
                                    }
                                } catch (e: any) {
                                    toast({
                                        variant: 'destructive',
                                        title: 'خطأ في الاتصال',
                                        description: e.message,
                                    });
                                } finally {
                                    setIsSyncingNow(false);
                                }
                            }}
                            disabled={isSyncingNow}
                        >
                            {isSyncingNow ? (
                                <Loader2 className="animate-spin me-2 h-4 w-4" />
                            ) : (
                                <RefreshCw className="me-2 h-4 w-4" />
                            )}
                            تشغيل المزامنة الآن لجميع البرامج
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {channelInfo && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={channelInfo.imageUrl} />
                            <AvatarFallback>{getInitials(channelInfo.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{channelInfo.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{channelInfo.description}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}

            {(fetchedVideos.length > 0 || fetchedShorts.length > 0 || fetchedPlaylists.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>المحتوى المتاح للاستيراد</CardTitle>
                        <CardDescription>
                            اختر العناصر التي تريد إضافتها إلى الموقع. يتم منع التكرار تلقائياً
                            {skippedDuplicatesCount > 0 ? ` (تم استبعاد ${skippedDuplicatesCount} فيديو موجود مسبقاً).` : '.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={newVideos.length === 0 && fetchedPlaylists.length > 0 ? 'playlists' : 'videos'}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="videos">
                                    <Clapperboard className="me-2 h-4 w-4" />
                                    محاضرات ({newVideos.length})
                                </TabsTrigger>
                                <TabsTrigger value="shorts">
                                    <Video className="me-2 h-4 w-4" />
                                    مقاطع قصيرة ({newShorts.length})
                                </TabsTrigger>
                                <TabsTrigger value="playlists">
                                    <ListVideo className="me-2 h-4 w-4" />
                                    قوائم تشغيل ({fetchedPlaylists.length})
                                </TabsTrigger>
                            </TabsList>
                            <ScrollArea className="h-96 mt-4">
                                <TabsContent value="videos">
                                    {renderTable(newVideos, selectedVideos, setSelectedVideos)}
                                </TabsContent>
                                <TabsContent value="shorts">
                                    {renderTable(newShorts, selectedShorts, setSelectedShorts)}
                                </TabsContent>
                                <TabsContent value="playlists">
                                    {renderPlaylistsTable(fetchedPlaylists, selectedPlaylists, setSelectedPlaylists)}
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button onClick={handleImportSelected} disabled={isImporting || itemsSelectedCount === 0}>
                            {isImporting ? <Loader2 className="animate-spin" /> : `استيراد العناصر المحددة (${itemsSelectedCount})`}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}

export default function ImportPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-16 w-16 animate-spin" />
                </div>
            }
        >
            <ImportPageComponent />
        </Suspense>
    );
}
