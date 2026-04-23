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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc, Timestamp } from "firebase/firestore";
import type { Shubha } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface ShubhaFormProps {
    item?: Shubha | null;
    onFormClose: () => void;
}

const CATEGORIES = [
  { id: 'quran', name: 'القرآن الكريم' },
  { id: 'sunnah', name: 'السنة النبوية' },
  { id: 'atheism', name: 'الإلحاد' },
  { id: 'science', name: 'العلم الحديث' },
  { id: 'women', name: 'المرأة والأسرة' },
];

const AUTOSAVE_KEY = 'autosave_shubha_form';

export function ShubhaForm({ item, onFormClose }: ShubhaFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const [categoryId, setCategoryId] = useState(item?.categoryId || "quran");
  const [question, setQuestion] = useState(item?.question || "");
  const [summary, setSummary] = useState(item?.summary || "");
  const [answer, setAnswer] = useState(item?.answer || "");
  const [sources, setSources] = useState(item?.sources?.join('، ') || "");
  const [tags, setTags] = useState(item?.tags?.join('، ') || "");
  const [isVerified, setIsVerified] = useState(item?.isVerified ?? true);

  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setCategoryId(savedData.categoryId || "quran");
          setQuestion(savedData.question || "");
          setSummary(savedData.summary || "");
          setAnswer(savedData.answer || "");
          setSources(savedData.sources || "");
          setTags(savedData.tags || "");
          setIsVerified(savedData.isVerified ?? true);
        } catch (e) {
          console.error("Failed to parse autosaved shubha data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { categoryId, question, summary, answer, sources, tags, isVerified };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, categoryId, question, summary, answer, sources, tags, isVerified]);
  
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

    if (!question || !summary || !answer) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة (السؤال، الملخص، الرد).",
        });
        setIsSubmitting(false);
        return;
    }

    const itemData = {
        categoryId,
        question,
        summary,
        answer,
        sources: sources.split('،').map(s => s.trim()).filter(Boolean),
        tags: tags.split('،').map(t => t.trim()).filter(Boolean),
        isVerified,
        views: item?.views || 0
    };
    
    try {
      if (isEditMode && item) {
        const itemRef = doc(firestore, 'shubuhat', item.id);
        updateDocumentNonBlocking(itemRef, itemData);
        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث بيانات الشبهة.`,
        });
      } else {
        const itemsCollection = collection(firestore, 'shubuhat');
        addDocumentNonBlocking(itemsCollection, { ...itemData, createdAt: Timestamp.now() });
        toast({
            title: "تمت الإضافة بنجاح",
            description: `تم إدراج الشبهة وتفنيدها في قاعدة البيانات.`,
        });
      }
      handleClose();
    } catch(e) {
      console.error("Error submitting Shubha:", e);
      toast({ variant: 'destructive', title: "حدث خطأ", description: "لم نتمكن من حفظ البيانات." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-indigo-500/20 shadow-xl shadow-indigo-500/5">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{isEditMode ? `تعديل تفنيد الشبهة` : 'إضافة تفنيد لشبهة جديدة'}</CardTitle>
        <CardDescription>
          أدخل تفاصيل الشبهة، التصنيف العلمي، والرد الأكاديمي المفصل. استخدم الفاصلة (،) للفصل بين المصادر والكلمات المفتاحية.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoryId">التصنيف العلمي</Label>
              <select
                id="categoryId"
                className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                disabled={isSubmitting}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-center space-y-2 pt-6">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch 
                  id="isVerified" 
                  checked={isVerified} 
                  onCheckedChange={setIsVerified} 
                  disabled={isSubmitting} 
                />
                <Label htmlFor="isVerified" className="cursor-pointer">موثق علمياً وأكاديمياً ✅</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">السؤال / نص الشبهة (Question)</Label>
            <Input id="question" placeholder="مثال: هل يتعارض التطور مع قصة آدم؟" value={question} onChange={e => setQuestion(e.target.value)} required disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">الملخص القصير (Summary)</Label>
            <Input id="summary" placeholder="مثال: تفصيل العلاقة بين التطور والنصوص الشرعية..." value={summary} onChange={e => setSummary(e.target.value)} required disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">التفنيد والرد التفصيلي (Answer)</Label>
            <Textarea 
                id="answer" 
                placeholder="أدخل الرد التفصيلي هنا. اترك سطراً فارغاً (Enter مرتين) لبدء فقرة جديدة." 
                value={answer} 
                onChange={e => setAnswer(e.target.value)} 
                required 
                disabled={isSubmitting} 
                rows={8} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sources">المصادر والمراجع (Sources)</Label>
            <Input id="sources" placeholder="مثال: كتاب النبأ العظيم، درء تعارض العقل والنقل (افصل بينهم بفاصلة ،)" value={sources} onChange={e => setSources(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">الكلمات المفتاحية (Tags)</Label>
            <Input id="tags" placeholder="مثال: الإلحاد، التطور، نظرية داروين (افصل بينهم بفاصلة ،)" value={tags} onChange={e => setTags(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التعديلات' : 'نشر التفنيد للمنصة'}
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
