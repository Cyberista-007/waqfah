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
import { useState } from "react";
import { useFirestore, useStorage } from "@/firebase";
import { collection, doc, addDoc, updateDoc } from "firebase/firestore";
import type { DestructiveSin } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

interface SinFormProps {
    item?: DestructiveSin | null;
    onFormClose: () => void;
}

const ICONS = ['MessageSquareX', 'EyeOff', 'Angry', 'custom-backbiting', 'AlertTriangle'];

export function SinForm({ item, onFormClose }: SinFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const [title, setTitle] = useState(item?.title || "");
  const [dialogTitle, setDialogTitle] = useState(item?.dialogTitle || "");
  const [quranVerse, setQuranVerse] = useState(item?.quranVerse || "");
  const [hadith, setHadith] = useState(item?.hadith || "");
  const [hadith2, setHadith2] = useState(item?.hadith2 || "");

  const [selectedIcon, setSelectedIcon] = useState(item?.icon && ICONS.includes(item.icon) ? item.icon : "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(item?.icon?.startsWith('http') ? item.icon : null);

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
      setSelectedIcon(""); // Reset dropdown if a file is selected
    }
  };
  
  const handleIconSelectChange = (value: string) => {
      setSelectedIcon(value);
      setIconFile(null);
      setIconPreview(null);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !storage) return;
    setIsSubmitting(true);

    if (!title || !dialogTitle) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "عنوان البطاقة وعنوان النافذة حقول مطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
        let finalIconValue = selectedIcon;

        if (iconFile) {
            const imageRef = ref(storage, `sin_icons/${Date.now()}_${iconFile.name}`);
            const snapshot = await uploadBytes(imageRef, iconFile);
            finalIconValue = await getDownloadURL(snapshot.ref);
        } else if (iconPreview) { // If there's a preview from editing but no new file
            finalIconValue = iconPreview;
        }

        if (!finalIconValue) {
            toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار أيقونة أو رفع صورة." });
            setIsSubmitting(false);
            return;
        }

        const itemData = {
            title,
            dialogTitle,
            quranVerse,
            hadith,
            hadith2,
            icon: finalIconValue,
        };

        if (isEditMode && item) {
          const itemRef = doc(firestore, 'destructive_sins', item.id);
          await updateDoc(itemRef, itemData);
          toast({
              title: "تم التحديث بنجاح",
              description: `تم تحديث "${title}".`,
          });
        } else {
          const itemsCollection = collection(firestore, 'destructive_sins');
          await addDoc(itemsCollection, itemData);
          toast({
              title: "تم الإنشاء بنجاح",
              description: `تمت إضافة "${title}" الجديدة.`,
          });
        }
        onFormClose();
    } catch(e) {
        console.error("Error submitting sin:", e);
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
                <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} placeholder="عنوان البطاقة" />
                <Input id="dialogTitle" name="dialogTitle" value={dialogTitle} onChange={(e) => setDialogTitle(e.target.value)} required disabled={isSubmitting} placeholder="عنوان النافذة المنبثقة" />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <Label htmlFor="icon">الأيقونة</Label>
                    <Select value={selectedIcon} onValueChange={handleIconSelectChange}>
                        <SelectTrigger><SelectValue placeholder="اختر أيقونة..." /></SelectTrigger>
                        <SelectContent>
                            {ICONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                     <Label htmlFor="icon-file">أو ارفع أيقونة مخصصة (SVG, PNG)</Label>
                     <Input id="icon-file" type="file" accept="image/png, image/svg+xml, image/jpeg" onChange={handleIconFileChange} />
                 </div>
             </div>
             {iconPreview && <Image src={iconPreview} alt="Icon preview" width={64} height={64} className="rounded-md bg-muted p-1" />}

             <Textarea id="quranVerse" name="quranVerse" value={quranVerse} onChange={(e) => setQuranVerse(e.target.value)} disabled={isSubmitting} placeholder="الآية القرآنية (اختياري)" />
             <Textarea id="hadith" name="hadith" value={hadith} onChange={(e) => setHadith(e.target.value)} disabled={isSubmitting} placeholder="الحديث الأول (اختياري)" />
             <Textarea id="hadith2" name="hadith2" value={hadith2} onChange={(e) => setHadith2(e.target.value)} disabled={isSubmitting} placeholder="الحديث الثاني (اختياري)" />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء البطاقة'}
            </Button>
            <Button type="button" onClick={onFormClose} variant="outline">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
