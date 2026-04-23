"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc, Timestamp } from "firebase/firestore";
import type { DestructiveSin } from "@/lib/types";
import { Loader2, Zap, ShieldPlus, ActivitySquare, Video, HelpCircle } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface MuhlikatFormProps {
    item?: DestructiveSin | null;
    onFormClose: () => void;
}

const AUTOSAVE_KEY = 'autosave_muhlikat_form';

export function MuhlikatForm({ item, onFormClose }: MuhlikatFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const [title, setTitle] = useState(item?.title || "");
  const [dialogTitle, setDialogTitle] = useState(item?.dialogTitle || "");
  const [concept, setConcept] = useState(item?.concept || "");
  const [quranVerses, setQuranVerses] = useState(item?.quranVerses?.join('\n') || "");
  const [hadiths, setHadiths] = useState(item?.hadiths?.join('\n') || "");
  const [dailyLifeExamples, setDailyLifeExamples] = useState(item?.dailyLifeExamples?.join('\n') || "");
  const [icon, setIcon] = useState(item?.icon || "AlertTriangle");
  const [linkedVideoId, setLinkedVideoId] = useState(item?.linkedVideoId || "");
  const [curePlan, setCurePlan] = useState(item?.curePlan?.join('\n') || "");
  const [testQuestions, setTestQuestions] = useState(item?.testQuestions?.join('\n') || "");

  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setTitle(savedData.title || "");
          setDialogTitle(savedData.dialogTitle || "");
          setConcept(savedData.concept || "");
          setQuranVerses(savedData.quranVerses || "");
          setHadiths(savedData.hadiths || "");
          setDailyLifeExamples(savedData.dailyLifeExamples || "");
          setIcon(savedData.icon || "AlertTriangle");
          setLinkedVideoId(savedData.linkedVideoId || "");
          setCurePlan(savedData.curePlan || "");
          setTestQuestions(savedData.testQuestions || "");
        } catch (e) {
          console.error("Failed to parse autosaved muhlikat data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { title, dialogTitle, concept, quranVerses, hadiths, dailyLifeExamples, icon, linkedVideoId, curePlan, testQuestions };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, title, dialogTitle, concept, quranVerses, hadiths, dailyLifeExamples, icon, linkedVideoId, curePlan, testQuestions]);
  
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

    if (!title || !concept) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء الحقول الأساسية (العنوان والتشخيص).",
        });
        setIsSubmitting(false);
        return;
    }

    const itemData = {
        title,
        dialogTitle: dialogTitle || title,
        concept,
        quranVerses: quranVerses.split('\n').map(s => s.trim()).filter(Boolean),
        hadiths: hadiths.split('\n').map(h => h.trim()).filter(Boolean),
        dailyLifeExamples: dailyLifeExamples.split('\n').map(e => e.trim()).filter(Boolean),
        icon,
        linkedVideoId,
        curePlan: curePlan.split('\n').map(c => c.trim()).filter(Boolean),
        testQuestions: testQuestions.split('\n').map(q => q.trim()).filter(Boolean),
    };
    
    try {
      if (isEditMode && item) {
        const itemRef = doc(firestore, 'destructive_sins', item.id);
        updateDocumentNonBlocking(itemRef, itemData);
        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث بيانات المهلكة.`,
        });
      } else {
        const itemsCollection = collection(firestore, 'destructive_sins');
        addDocumentNonBlocking(itemsCollection, { ...itemData, createdAt: Timestamp.now() });
        toast({
            title: "تمت الإضافة بنجاح",
            description: `تم إدراج المهلكة في العيادة القلبية.`,
        });
      }
      handleClose();
    } catch(e) {
      console.error("Error submitting Muhlika:", e);
      toast({ variant: 'destructive', title: "حدث خطأ", description: "لم نتمكن من حفظ البيانات." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-red-500/20 shadow-xl shadow-red-500/5 overflow-hidden">
      <CardHeader className="bg-red-500/5 border-b border-red-500/10">
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-red-500" />
            {isEditMode ? `تعديل المهلكة` : 'إضافة مهلكة جديدة'}
        </CardTitle>
        <CardDescription>
          أدخل تفاصيل "الداء النفسي" لتظهر في العيادة القلبية مع خطة العلاج والتقييم الذاتي.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">اسم المهلكة (مثلاً: الكبر)</Label>
              <Input id="title" placeholder="اسم الداء" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">الأيقونة (Lucide Icon Name)</Label>
              <Input id="icon" placeholder="AlertTriangle, Angry, EyeOff..." value={icon} onChange={e => setIcon(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept">التشخيص والتعريف (Concept)</Label>
            <Textarea id="concept" placeholder="اشرح حقيقة هذا الداء وخطورته..." value={concept} onChange={e => setConcept(e.target.value)} required disabled={isSubmitting} rows={4} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                  <ShieldPlus className="w-4 h-4 text-emerald-500" /> خطة العلاج (سطر لكل خطوة)
              </Label>
              <Textarea placeholder="الخطوة الأولى...\nالخطوة الثانية..." value={curePlan} onChange={e => setCurePlan(e.target.value)} disabled={isSubmitting} rows={5} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                  <ActivitySquare className="w-4 h-4 text-amber-500" /> أسئلة التقييم الذاتي (سطر لكل سؤال)
              </Label>
              <Textarea placeholder="سؤال 1...\nسؤال 2..." value={testQuestions} onChange={e => setTestQuestions(e.target.value)} disabled={isSubmitting} rows={5} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>نصوص من الوحي (آيات/أحاديث - سطر لكل نص)</Label>
              <Textarea placeholder="الآية أو الحديث..." value={quranVerses} onChange={e => setQuranVerses(e.target.value)} disabled={isSubmitting} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>أمثلة من الواقع (سطر لكل مثال)</Label>
              <Textarea placeholder="مثال واقعي..." value={dailyLifeExamples} onChange={e => setDailyLifeExamples(e.target.value)} disabled={isSubmitting} rows={4} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoId" className="flex items-center gap-2"><Video className="w-4 h-4" /> معرف فيديو المحاضرة المرتبطة (ID)</Label>
            <Input id="videoId" placeholder="slug المحاضرة" value={linkedVideoId} onChange={e => setLinkedVideoId(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التعديلات' : 'نشر المهلكة للمنصة'}
            </Button>
            <Button type="button" onClick={handleClose} variant="outline" className="w-full sm:w-auto">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
