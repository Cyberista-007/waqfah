

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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, Timestamp, doc, runTransaction, increment } from "firebase/firestore";
import type { Series, Lecture, Program } from "@/lib/types";
import { Loader2, Wand2 } from "lucide-react";

interface LectureFormProps {
    seriesList: Series[];
    lecture?: Lecture | any; // 'any' to handle serialized date from server
}

const AUTOSAVE_KEY = 'autosave_lecture_form';

export function LectureForm({ seriesList, lecture }: LectureFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const isEditMode = !!lecture;

  const { data: programsList, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });

  const [title, setTitle] = useState(lecture?.title || "");
  const [description, setDescription] = useState(lecture?.description || "");
  const [audioSrc, setAudioSrc] = useState(lecture?.audioSrc || "");
  const [duration, setDuration] = useState(lecture?.duration?.toString() || "");
  const [pdfUrl, setPdfUrl] = useState(lecture?.pdfUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(lecture?.youtubeUrl || "");
  const [soundcloudUrl, setSoundcloudUrl] = useState(lecture?.soundcloudUrl || "");
  const [telegramUrl, setTelegramUrl] = useState(lecture?.telegramUrl || "");
  const [language, setLanguage] = useState(lecture?.language || "ar");
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(lecture?.seriesId || "none");
  const [selectedProgramId, setSelectedProgramId] = useState<string>(lecture?.programId || "none");
  const [youtubeViewCount, setYoutubeViewCount] = useState<number | undefined>(lecture?.youtubeViewCount);
  const [publishedAt, setPublishedAt] = useState<string | null>(lecture?.publishedAt ? new Date(lecture.publishedAt).toISOString() : null);

  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setTitle(savedData.title || "");
          setDescription(savedData.description || "");
          setAudioSrc(savedData.audioSrc || "");
          setDuration(savedData.duration || "");
          setPdfUrl(savedData.pdfUrl || "");
          setYoutubeUrl(savedData.youtubeUrl || "");
          setSoundcloudUrl(savedData.soundcloudUrl || "");
          setTelegramUrl(savedData.telegramUrl || "");
          setLanguage(savedData.language || "ar");
          setSelectedSeriesId(savedData.selectedSeriesId || "none");
          setSelectedProgramId(savedData.selectedProgramId || "none");
          setYoutubeViewCount(savedData.youtubeViewCount);
          setPublishedAt(savedData.publishedAt || null);
        } catch (e) {
          console.error("Failed to parse autosaved lecture data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = {
        title, description, audioSrc, duration, pdfUrl, youtubeUrl, soundcloudUrl, telegramUrl, language, selectedSeriesId, selectedProgramId, youtubeViewCount, publishedAt
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, title, description, audioSrc, duration, pdfUrl, youtubeUrl, soundcloudUrl, telegramUrl, language, selectedSeriesId, selectedProgramId, youtubeViewCount, publishedAt]);

  const handleClose = () => {
    if (!isEditMode) {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
    router.push('/admin/lectures');
    router.refresh();
  }

  // Update selected program when series changes
  useEffect(() => {
      if (selectedSeriesId !== 'none') {
          const series = seriesList.find(s => s.id === selectedSeriesId);
          if (series?.programId) {
              setSelectedProgramId(series.programId);
          } else {
              setSelectedProgramId("none");
          }
      }
  }, [selectedSeriesId, seriesList]);


  const handleFetchMetadata = async () => {
    const url = youtubeUrl || audioSrc;

    if (!url || !(url.includes('youtube.com') || url.includes('youtu.be'))) {
      toast({ variant: 'destructive', title: 'الرجاء إدخال رابط يوتيوب صالح في حقل رابط يوتيوب.' });
      return;
    }
    
    setIsFetching(true);
     try {
        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
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
            setTitle(data.videoInfo.title);
            setDescription(data.videoInfo.description);
            setDuration(data.videoInfo.durationInSeconds.toString());
            setYoutubeViewCount(data.videoInfo.viewCount);
            setPublishedAt(data.videoInfo.publishedAt);
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
    
    const seriesData = selectedSeriesId !== 'none' ? seriesList?.find(s => s.id === selectedSeriesId) : null;
    const programData = selectedProgramId !== 'none' ? programsList?.find(p => p.id === selectedProgramId) : null;
    
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
        audioSrc,
        duration: parseInt(duration, 10), 
        imageId: lecture?.imageId || `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
        youtubeUrl: youtubeUrl,
        pdfUrl: pdfUrl,
        telegramUrl: telegramUrl,
        soundcloudUrl: soundcloudUrl,
        youtubeViewCount: youtubeViewCount || 0,
        language: language,
        publishedAt: publishedAt ? Timestamp.fromDate(new Date(publishedAt)) : undefined,
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
      
      handleClose();

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
  
  const isLoading = programsLoading;

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
            <Label htmlFor="audioSrc">رابط ملف الصوت المباشر (MP3)</Label>
            <div className="flex items-center gap-2">
              <Input id="audioSrc" name="audioSrc" type="text" value={audioSrc} onChange={(e) => setAudioSrc(e.target.value)} required />
              <Button type="button" variant="outline" size="icon" onClick={handleFetchMetadata} disabled={isFetching}>
                {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                <span className="sr-only">استخلاص البيانات</span>
              </Button>
            </div>
             <p className="text-sm text-muted-foreground mt-1">
                هذا الرابط لمشغل الصوت في الموقع. استخدم حقل "رابط يوتيوب بديل" أدناه لوضع روابط يوتيوب.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المحاضرة</Label>
              <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">البرنامج (اختياري)</Label>
              <Select name="program" onValueChange={setSelectedProgramId} value={selectedProgramId} disabled={isLoading || selectedSeriesId !== 'none'}>
                  <SelectTrigger>
                      <SelectValue placeholder={"اختر برنامجًا..."} />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="none">محاضرة مستقلة</SelectItem>
                      {programsList?.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </div>
          
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
          
          <div>
            <Label htmlFor="description">وصف المحاضرة</Label>
            <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}/>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="duration">المدة (بالثواني)</Label>
              <Input id="duration" name="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required/>
            </div>
             <div>
              <Label htmlFor="pdfUrl">رابط التفريغ (PDF) (اختياري)</Label>
              <Input id="pdfUrl" name="pdfUrl" type="text" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
            </div>
             <div>
                <Label htmlFor="language">اللغة</Label>
                <Select name="language" value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">الإنجليزية</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Label htmlFor="publishedAt">تاريخ النشر الأصلي</Label>
                <Input id="publishedAt" type="text" value={publishedAt ? new Date(publishedAt).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر'} readOnly disabled />
            </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="youtubeUrl">رابط يوتيوب بديل (اختياري)</Label>
              <Input id="youtubeUrl" name="youtubeUrl" type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="soundcloudUrl">رابط ساوندكلاود (اختياري)</Label>
              <Input id="soundcloudUrl" name="soundcloudUrl" type="text" value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="telegramUrl">رابط تيليجرام (اختياري)</Label>
              <Input id="telegramUrl" name="telegramUrl" type="text" value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={isLoading || isSubmitting}>
                {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إضافة المحاضرة'}
            </Button>
            <Button type="button" onClick={handleClose} variant="outline">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
