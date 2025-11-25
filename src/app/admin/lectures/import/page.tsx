
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
import { Loader2, Upload, FileText, Youtube, ListChecks } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import type { Series, Sheikh, Lecture } from "@/lib/types";
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
    duration: number; // in minutes
}

export default function AdminImportLecturesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // CSV State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // YouTube State
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [isFetchingPlaylist, setIsFetchingPlaylist] = useState(false);
    const [fetchedVideos, setFetchedVideos] = useState<FetchedVideo[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [targetSeriesId, setTargetSeriesId] = useState<string>("");

    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const { data: allSheikhs, isLoading: sheikhsLoading } = useCollection<Sheikh>('sheikhs');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };
    
    const handleSelectAllVideos = (checked: boolean) => {
        if(checked) {
            setSelectedVideos(fetchedVideos.map(v => v.videoId));
        } else {
            setSelectedVideos([]);
        }
    }

    const handleFetchPlaylist = async () => {
        if (!playlistUrl) {
            toast({ variant: "destructive", title: "الرجاء إدخال رابط قائمة التشغيل." });
            return;
        }
        setIsFetchingPlaylist(true);
        setFetchedVideos([]);
        setSelectedVideos([]);
        try {
            const response = await fetch('/api/youtube-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistUrl }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "فشل في جلب بيانات قائمة التشغيل.");
            }

            const data = await response.json();
            setFetchedVideos(data.videos);
            toast({ title: `تم جلب ${data.videos.length} فيديو بنجاح.` });

        } catch (error: any) {
            toast({ variant: "destructive", title: "خطأ", description: error.message });
        } finally {
            setIsFetchingPlaylist(false);
        }
    }
    
    const handleYoutubeImport = async () => {
        if (selectedVideos.length === 0 || !targetSeriesId) {
            toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار سلسلة وبعض الفيديوهات للاستيراد."});
            return;
        }
        if (!firestore || !allSeries || !allSheikhs) return;
        
        setIsSubmitting(true);
        
        try {
            const batch = writeBatch(firestore);
            const videosToImport = fetchedVideos.filter(v => selectedVideos.includes(v.videoId));

            const series = allSeries.find(s => s.id === targetSeriesId);
            if (!series) throw new Error("السلسلة المختارة غير موجودة.");

            const sheikh = allSheikhs.find(sh => sh.id === series.sheikhId);
            if (!sheikh) throw new Error("الشيخ المرتبط بالسلسلة غير موجود.");

            for (const video of videosToImport) {
                const slug = video.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const newLectureRef = doc(collection(firestore, 'lectures'));

                const newLecturePayload: Omit<Lecture, 'id'> = {
                    title: video.title,
                    slug,
                    description: video.description || "",
                    sheikhId: sheikh.id,
                    sheikhName: sheikh.name,
                    sheikhSlug: sheikh.slug,
                    seriesId: series.id,
                    seriesSlug: series.slug,
                    seriesTitle: series.title,
                    audioSrc: `https://www.youtube.com/watch?v=${video.videoId}`, // Placeholder, should be updated manually or via backend
                    duration: video.duration,
                    imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                    youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                    pdfUrl: "",
                    telegramUrl: "",
                    soundcloudUrl: "",
                    rating: 0,
                    ratingCount: 0,
                    viewCount: 0,
                    transcript: [],
                    createdAt: Timestamp.now(),
                };
                
                batch.set(newLectureRef, newLecturePayload);
            }
            
            const seriesRef = doc(firestore, 'series', targetSeriesId);
            batch.update(seriesRef, { lectureCount: increment(videosToImport.length) });

            await batch.commit();
            toast({
                title: "تم الاستيراد بنجاح",
                description: `تمت إضافة ${videosToImport.length} محاضرة بنجاح.`,
            });
            setFetchedVideos([]);
            setSelectedVideos([]);

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
                     if (!sheikh) {
                         console.warn(`Skipping row: Sheikh for series "${series.title}" not found.`);
                        continue;
                    }

                    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                    const newLectureRef = doc(collection(firestore, 'lectures'));

                    const newLecturePayload: Omit<Lecture, 'id'> = {
                        title,
                        slug,
                        description: description || "",
                        sheikhId: sheikh.id,
                        sheikhName: sheikh.name,
                        sheikhSlug: sheikh.slug,
                        seriesId: series.id,
                        seriesSlug: series.slug,
                        seriesTitle: series.title,
                        audioSrc,
                        duration: parseInt(duration, 10),
                        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                        youtubeUrl: youtubeUrl || "",
                        pdfUrl: pdfUrl || "",
                        telegramUrl: "",
                        soundcloudUrl: "",
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

    const isLoading = seriesLoading || sheikhsLoading;

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
                <Tabs defaultValue="youtube" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="youtube"><Youtube className="me-2"/>يوتيوب</TabsTrigger>
                        <TabsTrigger value="csv"><FileText className="me-2"/>ملف CSV</TabsTrigger>
                    </TabsList>
                    <TabsContent value="youtube" className="mt-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="playlist-url">رابط قائمة تشغيل يوتيوب</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="playlist-url"
                                        type="url"
                                        placeholder="https://www.youtube.com/playlist?list=..."
                                        value={playlistUrl}
                                        onChange={(e) => setPlaylistUrl(e.target.value)}
                                        disabled={isFetchingPlaylist}
                                    />
                                    <Button onClick={handleFetchPlaylist} disabled={isFetchingPlaylist || !playlistUrl}>
                                        {isFetchingPlaylist ? <Loader2 className="h-4 w-4 animate-spin"/> : "جلب البيانات"}
                                    </Button>
                                </div>
                            </div>
                            {fetchedVideos.length > 0 && (
                                <div className="space-y-4 border p-4 rounded-lg">
                                    <h3 className="font-bold flex items-center gap-2"><ListChecks /> الفيديوهات التي تم جلبها</h3>
                                     <div>
                                        <Label htmlFor="target-series">اختر السلسلة لإضافة المحاضرات إليها</Label>
                                        <Select value={targetSeriesId} onValueChange={setTargetSeriesId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر سلسلة..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allSeries?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                     </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">
                                                         <Checkbox
                                                            onCheckedChange={(checked) => handleSelectAllVideos(!!checked)}
                                                            checked={selectedVideos.length === fetchedVideos.length && fetchedVideos.length > 0}
                                                        />
                                                    </TableHead>
                                                    <TableHead>عنوان الفيديو</TableHead>
                                                    <TableHead>المدة (دقائق)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fetchedVideos.map(video => (
                                                    <TableRow key={video.videoId}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedVideos.includes(video.videoId)}
                                                                onCheckedChange={(checked) => {
                                                                    setSelectedVideos(prev => 
                                                                        checked ? [...prev, video.videoId] : prev.filter(id => id !== video.videoId)
                                                                    )
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{video.title}</TableCell>
                                                        <TableCell>{video.duration}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <Button onClick={handleYoutubeImport} disabled={isSubmitting || selectedVideos.length === 0 || !targetSeriesId}>
                                        {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin"/>}
                                        استيراد {selectedVideos.length} محاضرة
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="csv" className="mt-6">
                        <div className="mb-6 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                            <h4 className="font-bold mb-2">تعليمات هامة:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>يجب أن يكون الملف بصيغة CSV.</li>
                                <li>
                                    الأعمدة الإلزامية: `title`, `seriesId`, `audioSrc`, `duration`.
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
