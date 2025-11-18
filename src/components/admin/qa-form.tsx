
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
import { useFirestore } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { QAPair } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface QAFormProps {
    item?: QAPair | null;
    onFormClose: () => void;
}

export function QAForm({ item, onFormClose }: QAFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;

    if (!question || !answer) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }

    const itemData = {
        question,
        answer,
    };

    try {
      if (isEditMode && item) {
        const itemRef = doc(firestore, 'question_answers', item.id);
        await updateDocumentNonBlocking(itemRef, itemData);
        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث السؤال.`,
        });
      } else {
        const itemsCollection = collection(firestore, 'question_answers');
        await addDocumentNonBlocking(itemsCollection, itemData);
        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة السؤال الجديد.`,
        });
      }
      onFormClose();
    } catch (error) {
      console.error("Error submitting Q&A item:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ السؤال. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل السؤال` : 'إضافة سؤال جديد'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل سؤال وجواب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="question">السؤال</Label>
            <Textarea id="question" name="question" defaultValue={item?.question} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="answer">الإجابة</Label>
            <Textarea id="answer" name="answer" defaultValue={item?.answer} required disabled={isSubmitting} rows={5} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء السؤال'}
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
