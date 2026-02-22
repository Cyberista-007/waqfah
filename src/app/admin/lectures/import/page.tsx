
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Youtube, FileText, Loader2, ListVideo, Check, Clapperboard, Video, Image as ImageIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Program, Lecture } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, runTransaction, increment, Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { formatDuration, getVideoIdFromUrl } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define fetched content types
interface FetchedVideo {
  videoId: string;
  title: string;
  description: string;
  durationInSeconds: number;
  viewCount: number;
  publishedAt: string;
}

interface FetchedContent {
  videos: FetchedVideo[];
  shorts: FetchedVideo[];
  playlists: any[]; // not used for import
  channelInfo?: {
    name: string;
    description: string;
    imageUrl: string;
  };
}

function YoutubeImport() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');


    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [fetchedContent, setFetchedContent] = useState<FetchedContent | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    
    useEffect(() => {
        const youtubeUrl = searchParams.get('youtubeUrl');
        if (youtubeUrl) {
            setUrl(youtubeUrl);
            handleFetch(youtubeUrl);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleFetch = async (fetchUrl?: string) => {
        const finalUrl = fetchUrl || url;
        if (!finalUrl) {
            toast({ variant: 'destructive', title: 'الرجاء إدخال رابط أولاً.' });
            return;
        }
        setIsLoading(true);
        setFetchedContent(null);
        setSelectedItems([]);

        try {
            const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: finalUrl }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "فشل في جلب البيانات.");
            }
            
            const data: FetchedContent = await response.json();
            
            const existingVideoIds = new Set(allLectures?.map(l => getVideoIdFromUrl(l.youtubeUrl)).filter(vId => vId !== null));
            data.videos = data.videos.filter(v => !existingVideoIds.has(v.videoId));
            data.shorts = data.shorts.filter(v => !existingVideoIds.has(v.videoId));

            setFetchedContent(data);
            if (data.videos.length + data.shorts.length > 0) {
              toast({ title: "تم جلب البيانات بنجاح", description: `تم العثور على ${data.videos.length + data.shorts.length} عنصر جديد.` });
            } else {
              toast({ title: "لا يوجد محتوى جديد", description: `جميع المحاضرات من هذا المصدر موجودة بالفعل.` });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'حدث خطأ أثناء جلب البيانات',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleSelect = (videoId: string) => {
        setSelectedItems(prev => prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]);
    };

    const handleSelectAll = (type: 'videos' | 'shorts') => {
        if (!fetchedContent) return;
        const itemsToSelect = (type === 'videos' ? fetchedContent.videos : fetchedContent.shorts).map(v => v.videoId);
        const allCurrentlySelected = itemsToSelect.every(id => selectedItems.includes(id));

        if (allCurrentlySelected) {
            setSelectedItems(prev => prev.filter(id => !itemsToSelect.includes(id)));
        } else {
            setSelectedItems(prev => [...new Set([...prev, ...itemsToSelect])]);
        }
    };

    const handleImportSelected = async () => {
        if (selectedItems.length === 0 || !firestore || !allPrograms || !fetchedContent) {
            toast({ variant: 'destructive', title: 'لم يتم تحديد أي عناصر للاستيراد.' });
            return;
        }

        setIsImporting(true);

        const program = allPrograms.find(p => p.youtubeUrl === url);
        if (!program) {
            toast({ variant: 'destructive', title: 'لم يتم العثور على البرنامج المرتبط بهذا الرابط.' });
            setIsImporting(false);
            return;
        }

        const itemsToImport = [...fetchedContent.videos, ...fetchedContent.shorts].filter(v => selectedItems.includes(v.videoId));

        try {
            await runTransaction(firestore, async (transaction) => {
                const statsRef = doc(firestore, 'stats', 'global');
                transaction.update(statsRef, { lectures: increment(itemsToImport.length) });

                for (const video of itemsToImport) {
                    const slug = video.title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');
                    const newLectureRef = doc(collection(firestore, 'lectures'));
                    const lectureData: Omit<Lecture, 'id'> = {
                        title: video.title,
                        slug,
                        description: video.description,
                        programId: program.id,
                        programName: program.name,
                        programSlug: program.slug,
                        audioSrc: `https://www.youtube.com/watch?v=${video.videoId}`,
                        youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                        duration: video.durationInSeconds,
                        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                        youtubeViewCount: video.viewCount,
                        publishedAt: Timestamp.fromDate(new Date(video.publishedAt)),
                        createdAt: Timestamp.now(),
                        rating: 0,
                        ratingCount: 0,
                        viewCount: 0,
                        transcript: [],
                        language: 'ar',
                    };
                    transaction.set(newLectureRef, lectureData);
                }
            });

            toast({
                title: 'اكتمل الاستيراد!',
                description: `تم استيراد ${itemsToImport.length} عنصر بنجاح إلى برنامج "${program.name}".`,
            });
            setFetchedContent(null);
            setSelectedItems([]);
            router.push('/admin/lectures');

        } catch (error: any) {
            console.error("Import transaction failed:", error);
            toast({ variant: 'destructive', title: 'فشل الاستيراد', description: error.message });
        } finally {
            setIsImporting(false);
        }
    };

    const renderItemList = (items: FetchedVideo[], type: 'videos' | 'shorts') => (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                   <CardTitle className="flex items-center gap-2">
                     {type === 'videos' ? <Clapperboard className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                     {type === 'videos' ? 'المحاضرات' : 'مقاطع قصيرة'} ({items.length})
                   </CardTitle>
                   <CardDescription>العناصر الجديدة التي سيتم استيرادها.</CardDescription>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox id={`select-all-${type}`} onCheckedChange={() => handleSelectAll(type)} checked={items.length > 0 && items.every(item => selectedItems.includes(item.videoId))} />
                    <Label htmlFor={`select-all-${type}`}>تحديد الكل</Label>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <div className="space-y-4">
                        {items.map(video => (
                            <div key={video.videoId} className="flex items-start gap-4 p-2 rounded-lg border bg-muted/50">
                                <Checkbox className="mt-1" checked={selectedItems.includes(video.videoId)} onCheckedChange={() => toggleSelect(video.videoId)} />
                                <Image src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} alt={video.title} width={120} height={90} className="rounded-md" />
                                <div className="flex-grow">
                                    <p className="font-semibold line-clamp-2">{video.title}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">المدة: {formatDuration(video.durationInSeconds)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="youtube-url">رابط برنامج أو قائمة تشغيل يوتيوب</Label>
                <div className="flex gap-2">
                    <Input 
                        id="youtube-url" 
                        placeholder="https://www.youtube.com/..." 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading || isImporting}
                    />
                    <Button onClick={() => handleFetch()} disabled={isLoading || isImporting || lecturesLoading}>
                        {(isLoading || lecturesLoading) ? <Loader2 className="animate-spin" /> : "جلب البيانات"}
                    </Button>
                </div>
            </div>

            {fetchedContent && (
                <div className="space-y-4">
                   {fetchedContent.videos.length > 0 && renderItemList(fetchedContent.videos, 'videos')}
                   {fetchedContent.shorts.length > 0 && renderItemList(fetchedContent.shorts, 'shorts')}
                    <Button size="lg" onClick={handleImportSelected} disabled={isImporting || selectedItems.length === 0}>
                        {isImporting ? <Loader2 className="animate-spin mr-2"/> : <Check className="mr-2"/>}
                        استيراد العناصر المحددة ({selectedItems.length})
                    </Button>
                </div>
            )}
        </div>
    );
}

function OpmlImport() {
    return <p className="text-center text-muted-foreground">قيد التطوير.</p>
}

export default function ImportLecturesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2"><Upload />استيراد المحتوى</CardTitle>
                <CardDescription>استورد المحاضرات والسلاسل من مصادر مختلفة مثل يوتيوب أو ملفات CSV و OPML.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="youtube">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="youtube"><Youtube className="me-2 h-4 w-4" />يوتيوب</TabsTrigger>
                        <TabsTrigger value="opml" disabled><ListVideo className="me-2 h-4 w-4" />ملف OPML</TabsTrigger>
                        <TabsTrigger value="csv" disabled><FileText className="me-2 h-4 w-4" />ملف CSV</TabsTrigger>
                    </TabsList>
                    <TabsContent value="youtube" className="pt-6">
                        <YoutubeImport />
                    </TabsContent>
                    <TabsContent value="opml" className="pt-6">
                        <OpmlImport />
                    </TabsContent>
                    <TabsContent value="csv" className="pt-6">
                        <p className="text-center text-muted-foreground">قيد التطوير.</p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
