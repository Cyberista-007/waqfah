
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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, Timestamp, query, orderBy } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { Series } from "@/lib/types";

export default function AdminNewLecturePage() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  
  const seriesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'series'), orderBy('title')) : null, [firestore]);
  const { data: series, isLoading } = useCollection<Series>(seriesQuery);

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const audioSrc = formData.get("audioSrc") as string;
    const duration = formData.get("duration") as string;
    
    const seriesData = series?.find(s => s.id === selectedSeriesId);
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


    if (!title || !description || !selectedSeriesId || !audioSrc || !duration) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        return;
    }

    if (!seriesData) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "السلسلة المحددة غير صالحة.",
        });
        return;
    }

    const lecturesCollection = collection(firestore, 'lectures');
    
    addDocumentNonBlocking(lecturesCollection, {
        slug: slug,
        title: title,
        description: description,
        seriesSlug: seriesData.slug,
        seriesTitle: seriesData.title,
        audioSrc: audioSrc,
        duration: parseInt(duration, 10), 
        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
        transcript: [], 
        rating: 0,
        ratingCount: 0,
        viewCount: 0, 
        createdAt: Timestamp.now(),
    });

    toast({
        title: "تم الإنشاء بنجاح",
        description: `تمت إضافة محاضرة "${title}" الجديدة.`,
    });

    router.push("/admin/lectures");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">إضافة محاضرة جديدة</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإضافة محاضرة جديدة إلى الموقع.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان المحاضرة</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="series">السلسلة</Label>
             <Select name="series" onValueChange={setSelectedSeriesId} required>
                <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "جاري تحميل السلاسل..." : "اختر سلسلة..."} />
                </SelectTrigger>
                <SelectContent>
                    {series?.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">وصف المحاضرة</Label>
            <Textarea id="description" name="description" required rows={4} />
          </div>
           <div>
            <Label htmlFor="audioSrc">رابط الملف الصوتي (MP3 URL)</Label>
            <Input id="audioSrc" name="audioSrc" type="url" required />
          </div>
          <div>
            <Label htmlFor="duration">مدة المحاضرة (بالدقائق)</Label>
            <Input id="duration" name="duration" type="number" required />
          </div>
          <div className="flex gap-2">
            <Button type="submit">إضافة المحاضرة</Button>
            <Button asChild variant="outline">
              <Link href="/admin/lectures">إلغاء</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
