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
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { DestructiveSin } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface SinFormProps {
    item?: DestructiveSin | null;
    onFormClose: () => void;
}

const AUTOSAVE_KEY = 'autosave_sin_form';

const iconOptions = [
    { value: 'MessageSquareX', label: 'الكذب (MessageSquareX)' },
    { value: 'custom-backbiting', label: 'الغيبة (أيقونة مخصصة)' },
    { value: 'EyeOff', label: 'إطلاق البصر (EyeOff)' },
    { value: 'Angry', label: 'السب واللعن (Angry)' },
];


export function SinForm({ item, onFormClose }: SinFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const [title, setTitle] = useState(item?.title || "");
  const [dialogTitle, setDialogTitle] = useState(item?.dialogTitle || "");
  const [quranVerse, setQuranVerse] = useState(item?.quranVerse || "");
  const [hadith, setHadith] = useState(item?.hadith || "");
  const [hadith2, setHadith2] = useState(item?.hadith2 || "");
  const [icon, setIcon] = useState(item?.icon || "MessageSquareX");

  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setTitle(savedData.title || "");
          setDialogTitle(savedData.dialogTitle || "");
          setQuranVerse(savedData.quranVerse || "");
          setHadith(savedData.hadith || "");
          setHadith2(savedData.hadith2 || "");
          setIcon(savedData.icon || "MessageSquareX");
        } catch (e) {
          console.error("Failed to parse autosaved sin data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { title, dialogTitle, quranVerse, hadith, hadith2, icon };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, title, dialogTitle, quranVerse, hadith, hadith2, icon]);
  
  const handleClose = () => {
      if (!isEditMode) {
          localStorage.removeItem(AUTOSAVE_KEY);
      }
      onFormClose();
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    if (!title || !dialogTitle || !icon) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء الحقول المطلوبة (عنوان البطاقة، عنوان النافذة، والأيقونة).",
        });
        setIsSubmitting(false);
        return;
    }

    const itemData = {
        title,
        dialogTitle,
        quranVerse,
        hadith,
        hadith2,
        icon,
    };
    
    try {
      if (isEditMode && item) {
        const itemRef = doc(firestore, 'destructive_sins', item.id);
        updateDocumentNonBlocking(itemRef, itemData);
        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث بطاقة "${title}".`,
        });
      } else {
        const itemsCollection = collection(firestore, 'destructive_sins');
        addDocumentNonBlocking(itemsCollection, itemData);
        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة بطاقة "${title}" الجديدة.`,
        });
      }
      handleClose();
    } catch(e) {
      console.error("Error submitting sin card:", e);
      toast({ variant: 'destructive', title: "حدث خطأ", description: "لم نتمكن من حفظ البطاقة." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل بطاقة` : 'إضافة بطاقة جديدة'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل بطاقة في قسم "احذر المهلكات".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">عنوان البطاقة</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting} placeholder="مثال: الكذب" />
            </div>
             <div>
              <Label htmlFor="dialogTitle">عنوان النافذة المنبثقة</Label>
              <Input id="dialogTitle" value={dialogTitle} onChange={e => setDialogTitle(e.target.value)} required disabled={isSubmitting} placeholder="مثال: خطر الكذب" />
            </div>
          </div>
           <div>
              <Label htmlFor="icon">الأيقونة</Label>
              <Select name="icon" onValueChange={setIcon} value={icon}>
                  <SelectTrigger>
                      <SelectValue placeholder="اختر أيقونة..." />
                  </SelectTrigger>
                  <SelectContent>
                      {iconOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
          <div>
            <Label htmlFor="quranVerse">الآية القرآنية (اختياري)</Label>
            <Textarea id="quranVerse" value={quranVerse} onChange={e => setQuranVerse(e.target.value)} disabled={isSubmitting} placeholder="أدخل الآية بدون أقواس..." />
          </div>
          <div>
            <Label htmlFor="hadith">الحديث الأول (اختياري)</Label>
            <Textarea id="hadith" value={hadith} onChange={e => setHadith(e.target.value)} disabled={isSubmitting} placeholder="أدخل الحديث بدون أقواس..." />
          </div>
           <div>
            <Label htmlFor="hadith2">الحديث الثاني (اختياري)</Label>
            <Textarea id="hadith2" value={hadith2} onChange={e => setHadith2(e.target.value)} disabled={isSubmitting} placeholder="أدخل الحديث الثاني إذا وجد..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء البطاقة'}
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
