
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
import { useFirestore } from "@/firebase";
import { collection, Timestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Series, Sheikh } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface SeriesFormProps {
    series?: Series | null;
    sheikhs: Sheikh[];
}

export function SeriesForm({ series, sheikhs }: SeriesFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!series;
  
  const [selectedSheikhId, setSelectedSheikhId] = useState<string>(series?.sheikhId || "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    const sheikhData = sheikhs.find(s => s.id === selectedSheikhId);

    if (!title || !description || !sheikhData) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة واختيار شيخ صالح.",
        });
        setIsSubmitting(false);
        return;
    }

    const seriesData: Partial<Series> & { imageId: string } = {
        title,
        slug,
        description,
        sheikhId: sheikhData.id,
        sheikhName: sheikhData.name,
        sheikhSlug: sheikhData.slug,
        imageId: `series-${slug}`,
    };
    
    try {
        if(isEditMode && series) {
            const seriesRef = doc(firestore, 'series', series.id);
            await updateDocumentNonBlocking(seriesRef, seriesData);
            toast({
                title: "تم التحديث بنجاح",
                description: `تم تحديث سلسلة "${title}".`,
            });
        } else {
             const fullSeriesData = {
                ...seriesData,
                lectureCount: 0,
                createdAt: Timestamp.now()
            };
            const seriesCollection = collection(firestore, 'series');
            await addDocumentNonBlocking(seriesCollection, fullSeriesData);
            toast({
                title: "تم الإنشاء بنجاح",
                description: `تمت إضافة سلسلة "${title}" الجديدة.`,
            });
        }

        router.push("/admin/series");
        router.refresh();
    } catch(e) {
        console.error("Error submitting series: ", e);
        toast({
            variant: "destructive",
            title: "خطأ في حفظ السلسلة",
            description: "حدث خطأ أثناء محاولة حفظ السلسلة في قاعدة البيانات.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? 'تعديل السلسلة' : 'إضافة سلسلة جديدة'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'قم بتحديث تفاصيل السلسلة هنا.' : 'املأ الحقول أدناه لإنشاء سلسلة جديدة.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان السلسلة</Label>
            <Input id="title" name="title" defaultValue={series?.title} required disabled={isSubmitting} />
          </div>
           <div>
            <Label htmlFor="sheikh">الشيخ</Label>
              <Select name="sheikh" onValueChange={setSelectedSheikhId} defaultValue={series?.sheikhId} required>
                  <SelectTrigger disabled={sheikhs.length === 0}>
                       <SelectValue placeholder={sheikhs.length === 0 ? "لا يوجد مشايخ، يرجى إضافة شيخ أولاً." : "اختر شيخًا..."} />
                  </SelectTrigger>
                  <SelectContent>
                      {sheikhs?.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <div>
            <Label htmlFor="description">وصف السلسلة</Label>
            <Textarea id="description" name="description" defaultValue={series?.description} required disabled={isSubmitting}/>
          </div>
           <div>
            <Label htmlFor="image">صورة الغلاف (اختياري)</Label>
            <Input id="image" name="image" type="file" disabled={isSubmitting}/>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !firestore}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء السلسلة'}
            </Button>
            <Button asChild variant="outline" type="button">
              <Link href="/admin/series">إلغاء</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
