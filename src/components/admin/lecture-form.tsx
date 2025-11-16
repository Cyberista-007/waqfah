
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
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, Timestamp, doc, runTransaction, increment } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { Series, Lecture } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface LectureFormProps {
    seriesList: Series[];
    lecture?: Lecture | any;
}

export function LectureForm({ seriesList, lecture }: LectureFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!lecture;

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(lecture?.seriesId || "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const audioSrc = formData.get("audioSrc") as string;
    const duration = formData.get("duration") as string;
    
    const seriesData = seriesList?.find(s => s.id === selectedSeriesId);
    
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    if (!title || !description || !selectedSeriesId || !audioSrc || !duration || !seriesData) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة واختيار سلسلة صالحة.",
        });
        setIsSubmitting(false);
        return;
    }
    
    const lectureData = {
        title: title,
        slug: slug,
        description: description,
        seriesId: seriesData.id,
        seriesSlug: seriesData.slug,
        seriesTitle: seriesData.title,
        audioSrc: audioSrc,
        duration: parseInt(duration, 10), 
    };

    try {
      if (isEditMode) {
        // ---- EDIT MODE ----
        const lectureRef = doc(firestore, 'lectures', lecture.id);
        
        await runTransaction(firestore, async (transaction) => {
          const oldSeriesRef = doc(firestore, 'series', lecture.seriesId);
          const newSeriesRef = doc(firestore, 'series', seriesData.id);

          transaction.update(lectureRef, lectureData);

          // If series was changed, decrement old and increment new
          if (lecture.seriesId !== seriesData.id) {
            transaction.update(oldSeriesRef, { lectureCount: increment(-1) });
            transaction.update(newSeriesRef, { lectureCount: increment(1) });
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
            imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
            transcript: [], 
            rating: 0,
            ratingCount: 0,
            viewCount: 0, 
            createdAt: Timestamp.now(),
        };
        const seriesRef = doc(firestore, 'series', seriesData.id);
        const lecturesCollection = collection(firestore, 'lectures');
        
        // Use a transaction to add lecture and increment series count atomically
        await runTransaction(firestore, async (transaction) => {
          const newLectureRef = doc(lecturesCollection); // Create a new doc ref
          transaction.set(newLectureRef, newLectureData);
          transaction.update(seriesRef, { lectureCount: increment(1) });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل المحاضرة: ${lecture.title}` : 'إضافة محاضرة جديدة'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'قم بتحديث تفاصيل المحاضرة أدناه.' : 'املأ الحقول أدناه لإضافة محاضرة جديدة إلى الموقع.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان المحاضرة</Label>
            <Input id="title" name="title" defaultValue={lecture?.title} required />
          </div>
          <div>
            <Label htmlFor="series">السلسلة</Label>
             <Select name="series" onValueChange={setSelectedSeriesId} defaultValue={lecture?.seriesId} required>
                <SelectTrigger>
                    <SelectValue placeholder={!seriesList ? "جاري تحميل السلاسل..." : "اختر سلسلة..."} />
                </SelectTrigger>
                <SelectContent>
                    {seriesList?.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">وصف المحاضرة</Label>
            <Textarea id="description" name="description" defaultValue={lecture?.description} required rows={4} />
          </div>
           <div>
            <Label htmlFor="audioSrc">رابط الملف الصوتي (MP3 URL)</Label>
            <Input id="audioSrc" name="audioSrc" type="url" defaultValue={lecture?.audioSrc} required />
          </div>
          <div>
            <Label htmlFor="duration">مدة المحاضرة (بالدقائق)</Label>
            <Input id="duration" name="duration" type="number" defaultValue={lecture?.duration} required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إضافة المحاضرة'}
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/lectures">إلغاء</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
