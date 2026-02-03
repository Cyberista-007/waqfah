
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { QAPair } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface QAFormProps {
    item?: QAPair | null;
    onFormClose: () => void;
}

const AUTOSAVE_KEY = 'autosave_qa_form';

export function QAForm({ item, onFormClose }: QAFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const [question, setQuestion] = useState(item?.question || "");
  const [answer, setAnswer] = useState(item?.answer || "");

  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setQuestion(savedData.question || "");
          setAnswer(savedData.answer || "");
        } catch (e) {
          console.error("Failed to parse autosaved qa data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { question, answer };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, question, answer]);
  
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
        updateDocumentNonBlocking(itemRef, itemData);
        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث السؤال.`,
        });
      } else {
        const itemsCollection = collection(firestore, 'question_answers');
        addDocumentNonBlocking(itemsCollection, itemData);
        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة السؤال الجديد.`,
        });
      }
      handleClose();
    } catch(e) {
      console.error("Error submitting QA:", e);
      toast({ variant: 'destructive', title: "حدث خطأ", description: "لم نتمكن من حفظ السؤال." });
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
            <Textarea id="question" name="question" value={question} onChange={e => setQuestion(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="answer">الإجابة</Label>
            <Textarea id="answer" name="answer" value={answer} onChange={e => setAnswer(e.target.value)} required disabled={isSubmitting} rows={5} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء السؤال'}
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
