
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc, runTransaction, increment } from "firebase/firestore";
import type { Book } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface BookFormProps {
    book?: Book | null;
    onFormClose: () => void;
}

export function BookForm({ book, onFormClose }: BookFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!book;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const pdfUrl = formData.get("pdfUrl") as string;

    if (!title || !pdfUrl) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }
    
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const bookData: Omit<Book, 'id'> = {
        slug,
        title,
        pdfUrl,
        imageId: book?.imageId || `book-cover-${Math.floor(Math.random() * 3) + 1}`,
    };

    try {
      if (isEditMode && book) {
        const bookRef = doc(firestore, 'books', book.id);
        updateDocumentNonBlocking(bookRef, bookData);
        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث كتاب "${title}".`,
        });
      } else {
        const newBookRef = doc(collection(firestore, 'books'));
        const statsRef = doc(firestore, 'stats', 'global');

        await runTransaction(firestore, async (transaction) => {
            transaction.set(newBookRef, bookData);
            // Use set with merge to avoid error if doc doesn't exist
            transaction.set(statsRef, { books: increment(1) }, { merge: true });
        });

        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة كتاب "${title}" الجديد.`,
        });
      }
      onFormClose();
    } catch (error) {
      console.error("Error submitting book:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ الكتاب. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل الكتاب: ${book?.title}` : 'إضافة كتاب جديد'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل كتاب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">عنوان الكتاب</Label>
            <Input id="title" name="title" defaultValue={book?.title} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="pdfUrl">رابط الكتاب (PDF)</Label>
            <Input id="pdfUrl" name="pdfUrl" type="url" defaultValue={book?.pdfUrl} required disabled={isSubmitting} />
          </div>
           <div>
            <Label htmlFor="image">صورة الغلاف (اختياري)</Label>
            <Input id="image" name="image" type="file" disabled={isSubmitting}/>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء الكتاب'}
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
