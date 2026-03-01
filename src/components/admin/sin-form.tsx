
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
import { Loader2, MessageSquareX, EyeOff, Angry, AlertTriangle } from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SinFormProps {
    item?: DestructiveSin | null;
    onFormClose: () => void;
}

const ICONS = ['MessageSquareX', 'EyeOff', 'Angry', 'custom-backbiting', 'AlertTriangle'];

const getIcon = (iconName: string, className?: string) => {
    const props = { className: cn("h-8 w-8", className) };
    if (iconName?.startsWith('http')) {
        return <Image src={iconName} alt="icon" width={32} height={32} className={props.className} />;
    }
    switch (iconName) {
        case 'MessageSquareX': return <MessageSquareX {...props} />;
        case 'EyeOff': return <EyeOff {...props} />;
        case 'Angry': return <Angry {...props} />;
        case 'custom-backbiting':
            return (
                <svg {...props} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    <line x1="2" y1="22" x2="22" y2="2" />
                </svg>
            );
        default:
            return <AlertTriangle {...props} />;
    }
};


export function SinForm({ item, onFormClose }: SinFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const [title, setTitle] = useState(item?.title || "");
  const [dialogTitle, setDialogTitle] = useState(item?.dialogTitle || "");
  const [concept, setConcept] = useState(item?.concept || "");
  const [dailyLifeExample, setDailyLifeExample] = useState(item?.daily_life_example || "");
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
      setSelectedIcon(""); // Reset selection if a file is uploaded
    }
  };
  
  const handleIconSelect = (iconName: string) => {
      setSelectedIcon(iconName);
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
            concept,
            daily_life_example: dailyLifeExample,
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

            <div>
                <Label>الأيقونة</Label>
                <Card className="p-4 mt-2">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                        {ICONS.map(iconName => (
                            <Button
                                key={iconName}
                                type="button"
                                variant={selectedIcon === iconName ? "default" : "outline"}
                                size="icon"
                                className="h-16 w-16"
                                onClick={() => handleIconSelect(iconName)}
                            >
                                {getIcon(iconName)}
                            </Button>
                        ))}
                    </div>
                    <div className="relative border-t pt-4">
                        <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-2 text-sm text-muted-foreground">أو</p>
                        <Label htmlFor="icon-file" className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted",
                            iconPreview && "border-primary"
                        )}>
                            {iconPreview ? (
                                <Image src={iconPreview} alt="Icon preview" width={80} height={80} className="object-contain p-2" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">ارفع أيقونة مخصصة</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">(SVG, PNG, JPG)</p>
                                </div>
                            )}
                        </Label>
                        <Input id="icon-file" type="file" className="hidden" accept="image/png, image/svg+xml, image/jpeg" onChange={handleIconFileChange} />
                    </div>
                </Card>
            </div>
             <Textarea id="concept" name="concept" value={concept} onChange={e => setConcept(e.target.value)} disabled={isSubmitting} placeholder="المفهوم (اختياري)" rows={3} />
             <Textarea id="daily_life_example" name="daily_life_example" value={dailyLifeExample} onChange={e => setDailyLifeExample(e.target.value)} disabled={isSubmitting} placeholder="مثال من واقعنا اليومي (اختياري)" rows={3} />
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
