
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, Timestamp, doc, runTransaction, increment } from "firebase/firestore";
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
}

export function SeriesForm({ series }: SeriesFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!series;
  
  const { data: allSheikhs, isLoading: sheikhsLoading } = useCollection<Sheikh>('sheikhs', { orderBy: ['name', 'asc'] });
  const [selectedSheikhId, setSelectedSheikhId] = useState<string>(series?.sheikhId || "none");


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const language = formData.get("language") as string;
    
    const sheikhData = selectedSheikhId !== 'none' ? allSheikhs?.find(s => s.id === selectedSheikhId) : null;


    if (!title) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "عنوان السلسلة حقل مطلوب.",
        });
        setIsSubmitting(false);
        return;
    }

    const slug = title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

    const seriesData: Omit<Series, 'id' | 'lectureCount' | 'createdAt'> = {
        title,
        slug,
        description: description || "",
        imageId: series?.imageId || `series-${slug}`,
        sheikhId: sheikhData?.id || "",
        sheikhName: sheikhData?.name || "",
        sheikhSlug: sheikhData?.slug || "",
        language: language || 'ar',
    };
    
    try {
        if(isEditMode && series) {
            const seriesRef = doc(firestore, 'series', series.id);
            // We don't update createdAt on edit
            const updateData = {
                ...seriesData,
            };
            updateDocumentNonBlocking(seriesRef, updateData);
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
            const newSeriesRef = doc(collection(firestore, 'series'));
            const statsRef = doc(firestore, 'stats', 'global');

            await runTransaction(firestore, async (transaction) => {
                transaction.set(newSeriesRef, fullSeriesData);
                 // Use set with merge to avoid error if doc doesn't exist
                transaction.set(statsRef, { series: increment(1) }, { merge: true });
            });

            toast({
                title: "تم الإنشاء بنجاح",
                description: `تمت إضافة سلسلة "${title}" الجديدة.`,
            });
        }

        router.push("/admin/series");
        router.refresh();
    } catch(error: any) {
        console.error("Error submitting series:", error);
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: error.message || "لم نتمكن من حفظ السلسلة.",
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
              <Label htmlFor="sheikh">الشيخ (اختياري)</Label>
              <Select name="sheikh" onValueChange={setSelectedSheikhId} value={selectedSheikhId} disabled={sheikhsLoading}>
                  <SelectTrigger>
                      <SelectValue placeholder={"اختر شيخًا..."} />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="none">بدون شيخ</SelectItem>
                      {allSheikhs?.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          <div>
            <Label htmlFor="description">وصف السلسلة (اختياري)</Label>
            <Textarea id="description" name="description" defaultValue={series?.description} disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">اللغة</Label>
              <Select name="language" defaultValue={series?.language || 'ar'}>
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
              <Label htmlFor="image">صورة الغلاف (اختياري)</Label>
              <Input id="image" name="image" type="file" disabled={isSubmitting}/>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !firestore || sheikhsLoading}>
                {(isSubmitting || sheikhsLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
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
