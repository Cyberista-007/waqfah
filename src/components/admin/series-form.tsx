
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, Timestamp, doc, runTransaction, increment } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Series, Program } from "@/lib/types";
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

const AUTOSAVE_KEY = 'autosave_series_form';

export function SeriesForm({ series }: SeriesFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!series;
  
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });
  
  const [title, setTitle] = useState(series?.title || "");
  const [description, setDescription] = useState(series?.description || "");
  const [language, setLanguage] = useState(series?.language || 'ar');
  const [selectedProgramId, setSelectedProgramId] = useState<string>(series?.programId || "none");

  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setTitle(savedData.title || "");
          setDescription(savedData.description || "");
          setLanguage(savedData.language || "ar");
          setSelectedProgramId(savedData.selectedProgramId || "none");
        } catch (e) {
          console.error("Failed to parse autosaved series data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { title, description, language, selectedProgramId };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, title, description, language, selectedProgramId]);

  const handleClose = () => {
    if (!isEditMode) {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
    router.push("/admin/series");
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const programData = selectedProgramId !== 'none' ? allPrograms?.find(p => p.id === selectedProgramId) : null;


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
        programId: programData?.id || "",
        programName: programData?.name || "",
        programSlug: programData?.slug || "",
        language: language || 'ar',
    };
    
    try {
        if(isEditMode && series) {
            const seriesRef = doc(firestore, 'series', series.id);
            const updateData = { ...seriesData };
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
                transaction.set(statsRef, { series: increment(1) }, { merge: true });
            });

            toast({
                title: "تم الإنشاء بنجاح",
                description: `تمت إضافة سلسلة "${title}" الجديدة.`,
            });
        }

        handleClose();
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
            <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting} />
          </div>
           <div>
              <Label htmlFor="program">البرنامج (اختياري)</Label>
              <Select name="program" onValueChange={setSelectedProgramId} value={selectedProgramId} disabled={programsLoading}>
                  <SelectTrigger>
                      <SelectValue placeholder={"اختر برنامجًا..."} />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="none">بدون برنامج</SelectItem>
                      {allPrograms?.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          <div>
            <Label htmlFor="description">وصف السلسلة (اختياري)</Label>
            <Textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="image">صورة الغلاف (اختياري)</Label>
              <Input id="image" name="image" type="file" disabled={isSubmitting}/>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !firestore || programsLoading}>
                {(isSubmitting || programsLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء السلسلة'}
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
