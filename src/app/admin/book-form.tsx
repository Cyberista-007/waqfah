

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
import { useState, useEffect } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, runTransaction, increment } from "firebase/firestore";
import type { Book, Program } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface BookFormProps {
    book?: Book | null;
    onFormClose: () => void;
}

const AUTOSAVE_KEY = 'autosave_book_form';

export function BookForm({ book, onFormClose }: BookFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!book;
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });
  
  const [title, setTitle] = useState(book?.title || "");
  const [pdfUrl, setPdfUrl] = useState(book?.pdfUrl || "");
  const [selectedProgramName, setSelectedProgramName] = useState<string>(book?.programName || "none");

  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setTitle(savedData.title || "");
          setPdfUrl(savedData.pdfUrl || "");
          setSelectedProgramName(savedData.selectedProgramName || "none");
        } catch (e) {
          console.error("Failed to parse autosaved book data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { title, pdfUrl, selectedProgramName };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, title, pdfUrl, selectedProgramName]);

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

    if (!title || !pdfUrl) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }
    
    const slug = title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

    const bookData = {
        slug,
        title,
        pdfUrl,
        programName: selectedProgramName === 'none' ? undefined : selectedProgramName,
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
            transaction.set(newBookRef, { ...bookData });
            transaction.set(statsRef, { books: increment(1) }, { merge: true });
        });

        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة كتاب "${title}" الجديد.`,
        });
      }
      handleClose();
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
            <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} />
          </div>
           <div>
              <Label htmlFor="program">البرنامج (اختياري)</Label>
              <Select name="program" onValueChange={setSelectedProgramName} value={selectedProgramName} disabled={programsLoading}>
                  <SelectTrigger>
                      <SelectValue placeholder={"اختر برنامجًا..."} />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="none">بدون برنامج</SelectItem>
                      {allPrograms?.map(p => (
                          <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          <div>
            <Label htmlFor="pdfUrl">رابط الكتاب (PDF)</Label>
            <Input id="pdfUrl" name="pdfUrl" type="text" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} required disabled={isSubmitting} />
          </div>
           <div>
            <Label htmlFor="image">صورة الغلاف (اختياري)</Label>
            <Input id="image" name="image" type="file" disabled={isSubmitting}/>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || programsLoading}>
                {(isSubmitting || programsLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء الكتاب'}
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
