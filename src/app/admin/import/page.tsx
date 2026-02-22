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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Youtube, Upload, Clapperboard, Video, ListVideo } from 'lucide-react';
import { collection, runTransaction, doc, increment, Timestamp, writeBatch } from 'firebase/firestore';
import { formatDuration, getInitials, getVideoIdFromUrl } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';

interface FetchedVideo {
    videoId: string;
    title: string;
    description: string;
    durationInSeconds: number;
    publishedAt: string;
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

    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');

    const handleFetchContent = useCallback(async (fetchUrl?: string) => {
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

            if (data.channelInfo && allPrograms) {
                setChannelInfo(data.channelInfo);
                const existingProgram = allPrograms.find(p => p.youtubeUrl && p.youtubeUrl.includes(data.channelInfo.id));
                if (existingProgram) setProgramInfo(existingProgram);
                else setProgramInfo({ name: data.channelInfo.name, youtubeUrl: `https://youtube.com/channel/${data.channelInfo.id}` } as Program);
            }
            
            setFetchedVideos(data.videos || []);
            setFetchedShorts(data.shorts || []);
            setFetchedPlaylists(data.playlists || []);
            toast({ title: 'تم جلب المحتوى بنجاح!' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [url, toast, allPrograms]);

    useEffect(() => {
        const youtubeUrl = searchParams.get('youtubeUrl');
        if (youtubeUrl) {
            setUrl(youtubeUrl);
            handleFetchContent(youtubeUrl);
        }
    }, [searchParams, handleFetchContent]);

    const existingYoutubeVideoIds = useMemo(() => {
        if (!allLectures) return new Set();
        return new Set(
            allLectures
                .map(l => getVideoIdFromUrl(l.youtubeUrl))
                .filter((id): id is string => !!id)
        );
    }, [allLectures]);

    const newVideos = useMemo(() => fetchedVideos.filter(v => !existingYoutubeVideoIds.has(v.videoId)), [fetchedVideos, existingYoutubeVideoIds]);
    const newShorts = useMemo(() => fetchedShorts.filter(s => !existingYoutubeVideoIds.has(s.videoId)), [fetchedShorts, existingYoutubeVideoIds]);

    const handleImportSelected = async () => {
        if (!firestore) return;

        const videosToImport = [
            ...newVideos.filter(v => selectedVideos.includes(v.videoId)),
            ...newShorts.filter(s => selectedShorts.includes(s.videoId))
        ];

        const playlistsToImport = fetchedPlaylists.filter(p => selectedPlaylists.includes(p.id));

        if (videosToImport.length === 0 && playlistsToImport.length === 0) {
            toast({ title: 'لم يتم تحديد أي عناصر جديدة للاستيراد.' });
            return;
        }

        setIsImporting(true);
        let programToUse = programInfo;

        try {
            if (programInfo && !programInfo.id && channelInfo) {
                const slug = channelInfo.name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');
                const newProgramData = {
                    name: channelInfo.name, slug, youtubeUrl: `https://youtube.com/channel/${channelInfo.id}`, bio: channelInfo.description, imageUrl: channelInfo.imageUrl,
                    createdAt: Timestamp.now(), followerCount: 0, imageId: `program-${slug}`,
                };
                const newProgramRef = doc(collection(firestore, 'programs'));
                await runTransaction(firestore, async (t) => {
                    t.set(newProgramRef, newProgramData);
                    t.update(doc(firestore, 'stats', 'global'), { programs: increment(1) });
                });
                programToUse = { ...newProgramData, id: newProgramRef.id };
                toast({ title: 'تم إنشاء برنامج جديد', description: `"${programToUse.name}"` });
            }
            
            if (!programToUse) {
                throw new Error("لا يمكن تحديد البرنامج، يرجى التأكد من جلب معلومات القناة أولاً.");
            }

            const batch = writeBatch(firestore);
            let newLecturesCount = 0;
            let newSeriesCount = 0;

            // Import individual videos
            videosToImport.forEach(video => {
                const slug = video.title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');
                const lectureRef = doc(collection(firestore, 'lectures'));
                batch.set(lectureRef, {
                    title: video.title, slug, description: video.description, programId: programToUse!.id, programName: programToUse!.name,
                    programSlug: programToUse!.slug, audioSrc: `https://www.youtube.com/watch?v=${video.videoId}`,
                    youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`, duration: video.durationInSeconds,
                    imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`, rating: 0, ratingCount: 0,
                    viewCount: 0, youtubeViewCount: 0, transcript: [], createdAt: Timestamp.now(), publishedAt: Timestamp.fromDate(new Date(video.publishedAt)),
                    language: 'ar',
                });
                newLecturesCount++;
            });
            
            // Import playlists as series with their videos
            for (const playlist of playlistsToImport) {
                newSeriesCount++;
                const seriesSlug = playlist.title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');
                const seriesRef = doc(collection(firestore, 'series'));
                
                // Fetch videos for this specific playlist
                const playlistUrl = `https://www.youtube.com/playlist?list=${playlist.id}`;
                const response = await fetch('/api/youtube-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: playlistUrl }),
                });
                const playlistVideoData = await response.json();
                if (!response.ok) throw new Error(`فشل جلب فيديوهات قائمة التشغيل: ${playlist.title}`);
                
                const playlistVideos: FetchedVideo[] = [...(playlistVideoData.videos || []), ...(playlistVideoData.shorts || [])];
                const newPlaylistVideos = playlistVideos.filter(v => !existingYoutubeVideoIds.has(v.videoId));
                
                const seriesData = {
                    title: playlist.title, slug: seriesSlug, description: playlist.description || "", imageId: `series-${seriesSlug}`,
                    programId: programToUse!.id, programName: programToUse!.name, programSlug: programToUse!.slug,
                    lectureCount: newPlaylistVideos.length, createdAt: Timestamp.now(),
                };
                batch.set(seriesRef, seriesData);

                // Add lectures from this playlist
                newPlaylistVideos.forEach(video => {
                    const lectureSlug = video.title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');
                    const lectureRef = doc(collection(firestore, 'lectures'));
                    batch.set(lectureRef, {
                        title: video.title, slug: lectureSlug, description: video.description, 
                        programId: programToUse!.id, programName: programToUse!.name, programSlug: programToUse!.slug,
                        seriesId: seriesRef.id, seriesTitle: playlist.title, seriesSlug: seriesSlug,
                        audioSrc: `https://www.youtube.com/watch?v=${video.videoId}`,
                        youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                        duration: video.durationInSeconds,
                        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`, 
                        rating: 0, ratingCount: 0, viewCount: 0, youtubeViewCount: 0,
                        transcript: [], createdAt: Timestamp.now(), publishedAt: Timestamp.fromDate(new Date(video.publishedAt)),
                        language: 'ar',
                    });
                    newLecturesCount++;
                });
            }

            const statsRef = doc(firestore, 'stats', 'global');
            if (newLecturesCount > 0) batch.update(statsRef, { lectures: increment(newLecturesCount) });
            if (newSeriesCount > 0) batch.update(statsRef, { series: increment(newSeriesCount) });
            
            await batch.commit();
            
            toast({ title: 'اكتمل الاستيراد!', description: `تم استيراد ${videosToImport.length} محاضرة و ${playlistsToImport.length} سلسلة جديدة.`});
            router.push('/admin/lectures');
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'فشل الاستيراد', description: error.message });
        } finally {
            setIsImporting(false);
        }
    };
    
    const renderTable = (items: FetchedVideo[], selectedItems: string[], setSelectedItems: (ids: string[]) => void, type: string) => {
        const isAllSelected = items.length > 0 && selectedItems.length === items.length;
        const handleSelectAll = (checked: boolean) => setSelectedItems(checked ? items.map(v => v.videoId) : []);
        const handleSelectOne = (id: string, checked: boolean) => setSelectedItems(checked ? [...selectedItems, id] : selectedItems.filter(i => i !== id));

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"><Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                        <TableHead>العنوان</TableHead>
                        <TableHead>المدة</TableHead>
                        <TableHead>تاريخ النشر</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map(item => (
                        <TableRow key={item.videoId}>
                            <TableCell><Checkbox checked={selectedItems.includes(item.videoId)} onCheckedChange={(c) => handleSelectOne(item.videoId, !!c)} /></TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{formatDuration(item.durationInSeconds)}</TableCell>
                            <TableCell>{new Date(item.publishedAt).toLocaleDateString('ar-EG')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }
    
    const renderPlaylistsTable = (items: FetchedPlaylist[], selectedItems: string[], setSelectedItems: (ids: string[]) => void) => {
        const isAllSelected = items.length > 0 && selectedItems.length === items.length;
        const handleSelectAll = (checked: boolean) => setSelectedItems(checked ? items.map(p => p.id) : []);
        const handleSelectOne = (id: string, checked: boolean) => setSelectedItems(checked ? [...selectedItems, id] : selectedItems.filter(i => i !== id));

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"><Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                        <TableHead>عنوان قائمة التشغيل</TableHead>
                        <TableHead>عدد الفيديوهات</TableHead>
                        <TableHead>الوصف</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map(item => (
                        <TableRow key={item.id}>
                            <TableCell><Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={(c) => handleSelectOne(item.id, !!c)} /></TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.videoCount}</TableCell>
                            <TableCell className="line-clamp-2">{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }
    
    const itemsSelectedCount = selectedVideos.length + selectedShorts.length + selectedPlaylists.length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2"><Upload />استيراد محتوى من يوتيوب</CardTitle>
                    <CardDescription>الصق رابط قناة أو قائمة تشغيل يوتيوب لجلب محتوياتها.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/channel/..." />
                        <Button onClick={() => handleFetchContent()} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <><Youtube className="me-2 h-4 w-4" /> جلب المحتوى</>}
                        </Button>
                    </div>
                </CardContent>
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

            {(newVideos.length > 0 || newShorts.length > 0 || fetchedPlaylists.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>المحتوى المتاح للاستيراد</CardTitle>
                        <CardDescription>اختر العناصر التي تريد إضافتها إلى الموقع. سيتم تجاهل أي محتوى تم استيراده مسبقًا.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="videos">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="videos"><Clapperboard className="me-2 h-4 w-4"/>محاضرات ({newVideos.length})</TabsTrigger>
                                <TabsTrigger value="shorts"><Video className="me-2 h-4 w-4"/>مقاطع قصيرة ({newShorts.length})</TabsTrigger>
                                <TabsTrigger value="playlists"><ListVideo className="me-2 h-4 w-4"/>قوائم تشغيل ({fetchedPlaylists.length})</TabsTrigger>
                            </TabsList>
                            <ScrollArea className="h-96 mt-4">
                                <TabsContent value="videos">{renderTable(newVideos, selectedVideos, setSelectedVideos, 'video')}</TabsContent>
                                <TabsContent value="shorts">{renderTable(newShorts, selectedShorts, setSelectedShorts, 'short')}</TabsContent>
                                <TabsContent value="playlists">{renderPlaylistsTable(fetchedPlaylists, selectedPlaylists, setSelectedPlaylists)}</TabsContent>
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
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>}>
            <ImportPageComponent />
        </Suspense>
    );
}
