
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef, useMemo, useEffect } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, Timestamp, doc, runTransaction, increment } from "firebase/firestore";
import type { Series, Lecture, Channel, Program } from "@/lib/types";
import { Loader2, Wand2 } from "lucide-react";

interface LectureFormProps {
    seriesList: Series[];
    lecture?: Lecture | any; // 'any' to handle serialized date from server
}

export function LectureForm({ seriesList, lecture }: LectureFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const isEditMode = !!lecture;

  const { data: channelsList, isLoading: channelsLoading } = useCollection<Channel>('channels', { orderBy: ['name', 'asc'] });
  const { data: programsList, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(lecture?.seriesId || "none");
  const [selectedChannelId, setSelectedChannelId] = useState<string>(lecture?.channelId || "");
  const [selectedProgramId, setSelectedProgramId] = useState<string>(lecture?.programId || "");

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const audioSrcRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);

  // Update selected program when series changes
  useEffect(() => {
      if (selectedSeriesId !== 'none') {
          const series = seriesList.find(s => s.id === selectedSeriesId);
          if (series?.programId) {
              setSelectedProgramId(series.programId);
          } else {
              setSelectedProgramId("");
          }
      }
  }, [selectedSeriesId, seriesList]);


  const handleFetchMetadata = async () => {
    const url = audioSrcRef.current?.value;
    if (!url) {
      toast({ variant: 'destructive', title: 'الرجاء إدخال رابط أولاً.' });
      return;
    }
    
    setIsFetching(true);
     try {
        const response = await fetch('/api/youtube-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url, fetchVideoInfo: true }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "فشل في جلب بيانات يوتيوب.");
        }

        const data = await response.json();
        
        if (data.videoInfo) {
            if (titleRef.current) titleRef.current.value = data.videoInfo.title;
            if (descriptionRef.current) descriptionRef.current.value = data.videoInfo.description;
            if (durationRef.current) durationRef.current.value = data.videoInfo.durationInSeconds.toString();
            toast({ title: "تم جلب بيانات الفيديو بنجاح." });
        } else {
             toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على معلومات الفيديو. يرجى التحقق من أن الرابط هو رابط فيديو صالح." });
        }

    } catch (error: any) {
        toast({ variant: "destructive", title: "خطأ", description: error.message });
    } finally {
        setIsFetching(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const audioSrc = formData.get("audioSrc") as string;
    const duration = formData.get("duration") as string;
    const language = formData.get("language") as string;
    
    const seriesData = selectedSeriesId !== 'none' ? seriesList?.find(s => s.id === selectedSeriesId) : null;
    const channelData = channelsList?.find(c => c.id === selectedChannelId);
    const programData = programsList?.find(p => p.id === selectedProgramId);
    
    if (!title || !description || !audioSrc || !duration) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }
    
    const slug = title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

    const lectureData: Omit<Lecture, 'id' | 'createdAt' | 'rating' | 'ratingCount' | 'viewCount' | 'transcript'> = {
        title,
        slug,
        description,
        programId: programData?.id || "",
        programName: programData?.name || "",
        programSlug: programData?.slug || "",
        seriesId: seriesData?.id || "",
        seriesSlug: seriesData?.slug || "",
        seriesTitle: seriesData?.title || "",
        channelId: channelData?.id || "",
        channelName: channelData?.name || "",
        channelSlug: channelData?.slug || "",
        audioSrc,
        duration: parseInt(duration, 10), 
        imageId: lecture?.imageId || `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
        youtubeUrl: formData.get("youtubeUrl") as string || "",
        pdfUrl: formData.get("pdfUrl") as string || "",
        telegramUrl: formData.get("telegramUrl") as string || "",
        soundcloudUrl: formData.get("soundcloudUrl") as string || "",
        language: language || 'ar',
    };

    try {
      if (isEditMode) {
        // ---- EDIT MODE ----
        const lectureRef = doc(firestore, 'lectures', lecture.id);
        const previousSeriesId = lecture.seriesId;
        
        await runTransaction(firestore, async (transaction) => {
          transaction.update(lectureRef, lectureData);

          // If series was changed, decrement old count and increment new count
          if (previousSeriesId !== seriesData?.id) {
            if (previousSeriesId) {
                const oldSeriesRef = doc(firestore, 'series', previousSeriesId);
                transaction.update(oldSeriesRef, { lectureCount: increment(-1) });
            }
            if (seriesData) {
                const newSeriesRef = doc(firestore, 'series', seriesData.id);
                transaction.update(newSeriesRef, { lectureCount: increment(1) });
            }
          }
        });

        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث محاضرة "${title}".`,
        });

      } else {
        // ---- CREATE MODE ----
        const newLectureData = {
            ...lectureData,
            rating: 0,
            ratingCount: 0,
            viewCount: 0, 
            transcript: [],
            createdAt: Timestamp.now(),
        };
        
        const newLectureRef = doc(collection(firestore, 'lectures')); // Create a new doc ref with a generated ID
        const statsRef = doc(firestore, 'stats', 'global');
        
        await runTransaction(firestore, async (transaction) => {
          transaction.set(newLectureRef, newLectureData);
          transaction.set(statsRef, { lectures: increment(1) }, { merge: true });
          
          if(seriesData) {
              const seriesRef = doc(firestore, 'series', seriesData.id);
              transaction.update(seriesRef, { lectureCount: increment(1) });
          }
        });

        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة محاضرة "${title}" الجديدة.`,
        });
      }
      
      router.push("/admin/lectures");
      router.refresh();

    } catch (error) {
      console.error("Error submitting lecture:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ المحاضرة. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isLoading = channelsLoading || programsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل المحاضرة: ${lecture.title}` : 'إضافة محاضرة جديدة'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'قم بتحديث تفاصيل المحاضرة أدناه.' : 'أدخل رابط المحاضرة ثم املأ باقي الحقول لإضافة محاضرة جديدة.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="audioSrc">رابط المحاضرة الأساسي (يوتيوب, MP3, إلخ)</Label>
            <div className="flex items-center gap-2">
              <Input id="audioSrc" name="audioSrc" type="url" defaultValue={lecture?.audioSrc} required ref={audioSrcRef} />
              <Button type="button" variant="outline" size="icon" onClick={handleFetchMetadata} disabled={isFetching}>
                {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                <span className="sr-only">استخلاص البيانات</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المحاضرة</Label>
              <Input id="title" name="title" defaultValue={lecture?.title} required ref={titleRef} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="channel">القناة (اختياري)</Label>
                <Select onValueChange={setSelectedChannelId} defaultValue={lecture?.channelId} disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر قناة..." />
                    </SelectTrigger>
                    <SelectContent>
                        {channelsList?.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <Label htmlFor="series">السلسلة (اختياري)</Label>
              <Select name="series" onValueChange={setSelectedSeriesId} value={selectedSeriesId}>
                  <SelectTrigger>
                      <SelectValue placeholder={"اختر سلسلة..."} />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="none">بدون سلسلة</SelectItem>
                      {seriesList.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="program">البرنامج (اختياري)</Label>
              <Select name="program" onValueChange={setSelectedProgramId} value={selectedProgramId} disabled={isLoading || selectedSeriesId !== 'none'}>
                  <SelectTrigger>
                      <SelectValue placeholder={"اختر برنامجًا..."} />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="">محاضرة مستقلة</SelectItem>
                      {programsList?.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">وصف المحاضرة</Label>
            <Textarea id="description" name="description" defaultValue={lecture?.description} required rows={4} ref={descriptionRef}/>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration">المدة (بالثواني)</Label>
              <Input id="duration" name="duration" type="number" defaultValue={lecture?.duration} required ref={durationRef}/>
            </div>
             <div>
              <Label htmlFor="pdfUrl">رابط التفريغ (PDF) (اختياري)</Label>
              <Input id="pdfUrl" name="pdfUrl" type="url" defaultValue={lecture?.pdfUrl} />
            </div>
             <div>
                <Label htmlFor="language">اللغة</Label>
                <Select name="language" defaultValue={lecture?.language || 'ar'}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">الإنجليزية</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="youtubeUrl">رابط يوتيوب بديل (اختياري)</Label>
              <Input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={lecture?.youtubeUrl} />
            </div>
            <div>
              <Label htmlFor="soundcloudUrl">رابط ساوندكلاود (اختياري)</Label>
              <Input id="soundcloudUrl" name="soundcloudUrl" type="url" defaultValue={lecture?.soundcloudUrl} />
            </div>
            <div>
              <Label htmlFor="telegramUrl">رابط تيليجرام (اختياري)</Label>
              <Input id="telegramUrl" name="telegramUrl" type="url" defaultValue={lecture?.telegramUrl} />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إضافة المحاضرة'}
            </Button>
            <Button asChild variant="outline" type="button">
              <Link href="/admin/lectures">إلغاء</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
