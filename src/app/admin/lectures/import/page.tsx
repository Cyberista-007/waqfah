

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Youtube, ListChecks, Clapperboard, Video, ListVideo, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import type { Series, Sheikh, Lecture, Channel } from "@/lib/types";
import { writeBatch, doc, collection, Timestamp, increment } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDuration } from "@/lib/utils";
import { useRouter } from "next/navigation";

// A simple CSV parser
const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const header = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        return header.reduce((obj, nextKey, index) => {
            obj[nextKey] = values[index]?.trim() || '';
            return obj;
        }, {} as Record<string, string>);
    });
    return rows;
};

interface FetchedVideo {
    videoId: string;
    title: string;
    description: string;
    durationInSeconds: number;
}

interface FetchedPlaylist {
    id: string;
    title: string;
    videoCount: number;
}

export default function AdminImportLecturesPage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // CSV State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // YouTube State
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [fetchedVideos, setFetchedVideos] = useState<FetchedVideo[]>([]);
    const [fetchedShorts, setFetchedShorts] = useState<FetchedVideo[]>([]);
    const [fetchedPlaylists, setFetchedPlaylists] = useState<FetchedPlaylist[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [selectedShorts, setSelectedShorts] = useState<string[]>([]);
    const [targetSeriesId, setTargetSeriesId] = useState<string>("");
    const [targetChannelId, setTargetChannelId] = useState<string>("");
    const [activeTab, setActiveTab] = useState("youtube-videos");

    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const { data: allSheikhs, isLoading: sheikhsLoading } = useCollection<Sheikh>('sheikhs');
    const { data: allChannels, isLoading: channelsLoading } = useCollection<Channel>('channels');


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };
    
    const handleSelectAll = (type: 'videos' | 'shorts') => (checked: boolean) => {
        if (type === 'videos') {
            setSelectedVideos(checked ? fetchedVideos.map(v => v.videoId) : []);
        } else {
            setSelectedShorts(checked ? fetchedShorts.map(v => v.videoId) : []);
        }
    }
    
    const handleSelectItem = (type: 'videos' | 'shorts', videoId: string) => (checked: boolean) => {
        const updater = type === 'videos' ? setSelectedVideos : setSelectedShorts;
        updater(prev => checked ? [...prev, videoId] : prev.filter(id => id !== videoId));
    }


    const handleFetchFromYoutube = async (urlToFetch?: string) => {
        const finalUrl = urlToFetch || youtubeUrl;
        if (!finalUrl) {
            toast({ variant: "destructive", title: "الرجاء إدخال رابط القناة أو قائمة التشغيل." });
            return;
        }

        const channelExists = allChannels?.some(c => c.youtubeUrl === finalUrl);
        if (!channelExists && !urlToFetch) { // Don't show this if fetching from a playlist link inside the component
            router.push(`/admin/channels?youtubeUrl=${encodeURIComponent(finalUrl)}`);
            return;
        }


        setIsFetching(true);
        // Clear previous results
        setFetchedVideos([]);
        setFetchedShorts([]);
        setFetchedPlaylists([]);
        setSelectedVideos([]);
        setSelectedShorts([]);

        try {
            const response = await fetch('/api/youtube-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: finalUrl }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "فشل في جلب بيانات يوتيوب.");
            }

            const data = await response.json();
            
            setFetchedVideos(data.videos || []);
            setFetchedShorts(data.shorts || []);
            setFetchedPlaylists(data.playlists || []);
            
            let message = "تم جلب البيانات بنجاح.";
            if (data.videos?.length) message += ` ${data.videos.length} فيديو.`;
            if (data.shorts?.length) message += ` ${data.shorts.length} فيديو قصير.`;
            if (data.playlists?.length) message += ` ${data.playlists.length} قائمة تشغيل.`;
            
            toast({ title: message });

        } catch (error: any) {
            toast({ variant: "destructive", title: "خطأ", description: error.message });
        } finally {
            setIsFetching(false);
        }
    }
    
    const handleImportSelected = async () => {
        const itemsToImport = activeTab === 'youtube-videos' ? selectedVideos : selectedShorts;
        const sourceItems = activeTab === 'youtube-videos' ? fetchedVideos : fetchedShorts;

        if (itemsToImport.length === 0) {
            toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار بعض الفيديوهات للاستيراد."});
            return;
        }
        if (!firestore || !allSeries || !allSheikhs || !allChannels) return;
        
        setIsSubmitting(true);
        
        try {
            const batch = writeBatch(firestore);
            const videosToImport = sourceItems.filter(v => itemsToImport.includes(v.videoId));

            const series = targetSeriesId ? allSeries.find(s => s.id === targetSeriesId) : null;
            const sheikh = series?.sheikhId ? allSheikhs.find(sh => sh.id === series.sheikhId) : null;
            const channel = targetChannelId ? allChannels.find(c => c.id === targetChannelId) : null;

            for (const video of videosToImport) {
                const slug = video.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const newLectureRef = doc(collection(firestore, 'lectures'));

                const newLecturePayload: Omit<Lecture, 'id'> = {
                    title: video.title,
                    slug,
                    description: video.description || "",
                    sheikhId: sheikh?.id || "",
                    sheikhName: sheikh?.name || "",
                    sheikhSlug: sheikh?.slug || "",
                    seriesId: series?.id || "",
                    seriesSlug: series?.slug || "",
                    seriesTitle: series?.title || "",
                    channelId: channel?.id || "",
                    channelName: channel?.name || "",
                    channelSlug: channel?.slug || "",
                    audioSrc: `https://www.youtube.com/watch?v=${video.videoId}`, // Placeholder
                    duration: video.durationInSeconds,
                    imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                    youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                    pdfUrl: "",
                    createdAt: Timestamp.now(),
                    rating: 0,
                    ratingCount: 0,
                    viewCount: 0,
                    transcript: [],
                    language: series?.language || 'ar',
                };
                
                batch.set(newLectureRef, newLecturePayload);
            }
            
            if (series) {
                const seriesRef = doc(firestore, 'series', series.id);
                batch.update(seriesRef, { lectureCount: increment(videosToImport.length) });
            }

            const statsRef = doc(firestore, 'stats', 'global');
            batch.set(statsRef, { lectures: increment(videosToImport.length) }, { merge: true });

            await batch.commit();
            toast({
                title: "تم الاستيراد بنجاح",
                description: `تمت إضافة ${videosToImport.length} محاضرة بنجاح.`,
            });
            
            // Clear selections after import
            if(activeTab === 'youtube-videos') {
              setSelectedVideos([]);
            } else {
              setSelectedShorts([]);
            }


        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "فشل الاستيراد",
                description: error.message || "حدث خطأ أثناء معالجة الفيديوهات.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleCSVSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile || !firestore || !allSeries || !allSheikhs) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "يرجى اختيار ملف والتأكد من تحميل جميع البيانات الأولية.",
            });
            return;
        }

        setIsSubmitting(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const lecturesToImport = parseCSV(text);

                if (lecturesToImport.length === 0) {
                    throw new Error("الملف فارغ أو غير صالح.");
                }

                const batch = writeBatch(firestore);
                const seriesLectureCount: Record<string, number> = {};

                for (const lectureData of lecturesToImport) {
                    const { title, description, seriesId, audioSrc, duration, youtubeUrl, pdfUrl } = lectureData;

                    if (!title || !seriesId || !audioSrc || !duration) {
                        console.warn("Skipping row due to missing data:", lectureData);
                        continue;
                    }
                    
                    const series = allSeries.find(s => s.id === seriesId);
                    if (!series) {
                         console.warn(`Skipping row: Series with ID "${seriesId}" not found for lecture "${title}".`);
                        continue;
                    }
                    const sheikh = allSheikhs.find(sh => sh.id === series.sheikhId);
                     if (series.sheikhId && !sheikh) {
                         console.warn(`Skipping row: Sheikh for series "${series.title}" not found.`);
                        continue;
                    }

                    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                    const newLectureRef = doc(collection(firestore, 'lectures'));

                    const newLecturePayload: Omit<Lecture, 'id'> = {
                        title,
                        slug,
                        description: description || "",
                        sheikhId: sheikh?.id || "",
                        sheikhName: sheikh?.name || "",
                        sheikhSlug: sheikh?.slug || "",
                        seriesId: series.id,
                        seriesSlug: series.slug,
                        seriesTitle: series.title,
                        audioSrc,
                        duration: parseInt(duration, 10),
                        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                        youtubeUrl: youtubeUrl || "",
                        pdfUrl: pdfUrl || "",
                        rating: 0,
                        ratingCount: 0,
                        viewCount: 0,
                        transcript: [],
                        createdAt: Timestamp.now(),
                    };
                    
                    batch.set(newLectureRef, newLecturePayload);
                    
                    if (!seriesLectureCount[series.id]) {
                        seriesLectureCount[series.id] = 0;
                    }
                    seriesLectureCount[series.id]++;
                }

                for (const seriesId in seriesLectureCount) {
                    const seriesRef = doc(firestore, 'series', seriesId);
                    batch.update(seriesRef, { lectureCount: increment(seriesLectureCount[seriesId]) });
                }
                
                const statsRef = doc(firestore, 'stats', 'global');
                batch.set(statsRef, { lectures: increment(lecturesToImport.length) }, { merge: true });

                await batch.commit();

                toast({
                    title: "تم الاستيراد بنجاح",
                    description: `تمت إضافة ${lecturesToImport.length} محاضرة بنجاح.`,
                });

            } catch (error: any) {
                 toast({
                    variant: "destructive",
                    title: "فشل الاستيراد",
                    description: error.message || "حدث خطأ أثناء معالجة الملف.",
                });
            } finally {
                setIsSubmitting(false);
            }
        };

        reader.readAsText(selectedFile);
    };

    const isLoading = seriesLoading || sheikhsLoading || channelsLoading;
    
    const hasFetchedYoutubeData = fetchedVideos.length > 0 || fetchedShorts.length > 0 || fetchedPlaylists.length > 0;
    
    const itemsToImportCount = activeTab === 'youtube-videos' ? selectedVideos.length : selectedShorts.length;


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <Upload />
                    استيراد المحاضرات دفعة واحدة
                </CardTitle>
                <CardDescription>
                    استخدم إحدى الطرق أدناه لإضافة مجموعة من المحاضرات إلى الموقع.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="youtube">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="youtube"><Youtube className="me-2"/>يوتيوب</TabsTrigger>
                        <TabsTrigger value="csv"><FileText className="me-2"/>ملف CSV</TabsTrigger>
                    </TabsList>
                    <TabsContent value="youtube" className="mt-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="youtube-url">رابط قناة أو قائمة تشغيل يوتيوب</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="youtube-url"
                                        type="url"
                                        placeholder="https://www.youtube.com/..."
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        disabled={isFetching}
                                    />
                                    <Button onClick={() => handleFetchFromYoutube()} disabled={isFetching || !youtubeUrl}>
                                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : "جلب البيانات"}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">إذا كانت القناة غير مضافة، سيتم توجيهك لإضافتها أولاً.</p>
                            </div>
                            {hasFetchedYoutubeData && (
                                 <Tabs defaultValue="youtube-videos" className="w-full mt-4" onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="youtube-videos" disabled={fetchedVideos.length === 0}>
                                            <Clapperboard className="me-2"/>الفيديوهات ({fetchedVideos.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="youtube-shorts" disabled={fetchedShorts.length === 0}>
                                            <Video className="me-2"/>الفيديوهات القصيرة ({fetchedShorts.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="youtube-playlists" disabled={fetchedPlaylists.length === 0}>
                                            <ListVideo className="me-2"/>قوائم التشغيل ({fetchedPlaylists.length})
                                        </TabsTrigger>
                                    </TabsList>
                                     <div className="space-y-4 border p-4 rounded-lg mt-4">
                                        <h3 className="font-bold flex items-center gap-2"><ListChecks /> المحتوى الذي تم جلبه</h3>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="target-series">اختر السلسلة (اختياري)</Label>
                                                <Select value={targetSeriesId} onValueChange={setTargetSeriesId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر سلسلة..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allSeries?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                             <div>
                                                <Label htmlFor="target-channel">اختر القناة</Label>
                                                <Select value={targetChannelId} onValueChange={setTargetChannelId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر قناة..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allChannels?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                         </div>
                                        <TabsContent value="youtube-videos">
                                           <div className="max-h-80 overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[50px]">
                                                                <Checkbox onCheckedChange={handleSelectAll('videos')} checked={selectedVideos.length === fetchedVideos.length && fetchedVideos.length > 0}/>
                                                            </TableHead>
                                                            <TableHead>عنوان الفيديو</TableHead>
                                                            <TableHead>المدة</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {fetchedVideos.map(video => (
                                                            <TableRow key={video.videoId}>
                                                                <TableCell>
                                                                    <Checkbox checked={selectedVideos.includes(video.videoId)} onCheckedChange={handleSelectItem('videos', video.videoId)}/>
                                                                </TableCell>
                                                                <TableCell className="font-medium">{video.title}</TableCell>
                                                                <TableCell>{formatDuration(video.durationInSeconds)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="youtube-shorts">
                                           <div className="max-h-80 overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[50px]">
                                                                 <Checkbox onCheckedChange={handleSelectAll('shorts')} checked={selectedShorts.length === fetchedShorts.length && fetchedShorts.length > 0}/>
                                                            </TableHead>
                                                            <TableHead>عنوان الفيديو</TableHead>
                                                            <TableHead>المدة</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {fetchedShorts.map(video => (
                                                            <TableRow key={video.videoId}>
                                                                <TableCell>
                                                                    <Checkbox checked={selectedShorts.includes(video.videoId)} onCheckedChange={handleSelectItem('shorts', video.videoId)}/>
                                                                </TableCell>
                                                                <TableCell className="font-medium">{video.title}</TableCell>
                                                                <TableCell>{formatDuration(video.durationInSeconds)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </TabsContent>
                                         <TabsContent value="youtube-playlists">
                                           <div className="max-h-80 overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>عنوان قائمة التشغيل</TableHead>
                                                            <TableHead>عدد الفيديوهات</TableHead>
                                                            <TableHead></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {fetchedPlaylists.map(playlist => (
                                                            <TableRow key={playlist.id}>
                                                                <TableCell className="font-medium">{playlist.title}</TableCell>
                                                                <TableCell>{playlist.videoCount}</TableCell>
                                                                <TableCell className="text-left">
                                                                    <Button onClick={() => handleFetchFromYoutube(`https://www.youtube.com/playlist?list=${playlist.id}`)} size="sm" disabled={isFetching}>
                                                                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : "جلب فيديوهات القائمة"}
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </TabsContent>
                                        
                                        {activeTab !== 'youtube-playlists' && (
                                            <Button onClick={handleImportSelected} disabled={isSubmitting || itemsToImportCount === 0}>
                                                {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin"/>}
                                                استيراد {itemsToImportCount} محاضرة
                                            </Button>
                                        )}
                                    </div>
                                </Tabs>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="csv" className="mt-6">
                        <div className="mb-6 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                            <h4 className="font-bold mb-2">تعليمات هامة:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>يجب أن يكون الملف بصيغة CSV.</li>
                                <li>
                                    الأعمدة الإلزامية: `title`, `seriesId`, `audioSrc`, `duration` (بالثواني).
                                </li>
                                <li>الأعمدة الاختيارية: `description`, `youtubeUrl`, `pdfUrl`.</li>
                                <li>تأكد من أن `seriesId` الموجود في الملف يطابق معرف سلسلة موجود بالفعل في قاعدة البيانات.</li>
                            </ul>
                        </div>
                        <form onSubmit={handleCSVSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="csv-file">ملف المحاضرات (CSV)</Label>
                                <Input
                                    id="csv-file"
                                    name="csv-file"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    required
                                    disabled={isSubmitting || isLoading}
                                />
                                {selectedFile && (
                                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        الملف المختار: {selectedFile.name}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSubmitting || isLoading || !selectedFile}>
                                    {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? 'جاري تحميل البيانات...' : 'بدء الاستيراد من CSV'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/admin/lectures">إلغاء</Link>
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
