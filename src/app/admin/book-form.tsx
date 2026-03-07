

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
import { useCollection, useFirestore, useStorage } from "@/firebase";
import { collection, doc, runTransaction, increment } from "firebase/firestore";
import type { Book, Program } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface BookFormProps {
    book?: Book | null;
    onFormClose: () => void;
}

const AUTOSAVE_KEY = 'autosave_book_form';

export function BookForm({ book, onFormClose }: BookFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!book;
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });
  
  const [title, setTitle] = useState(book?.title || "");
  const [pdfUrl, setPdfUrl] = useState(book?.pdfUrl || "");
  const [selectedProgramName, setSelectedProgramName] = useState<string>(book?.programName || "none");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(book?.imageUrl || null);


  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setTitle(savedData.title || "");
          setPdfUrl(savedData.pdfUrl || "");
          setSelectedProgramName(savedData.selectedProgramName || "none");
          setImagePreview(savedData.imagePreview || null);
        } catch (e) {
          console.error("Failed to parse autosaved book data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { title, pdfUrl, selectedProgramName, imagePreview };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, title, pdfUrl, selectedProgramName, imagePreview]);

  const handleClose = () => {
    if (!isEditMode) {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
    onFormClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !storage) return;
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

    try {
        let finalImageUrl = book?.imageUrl ?? '';
        if (imageFile) {
            const imageRef = ref(storage, `book-images/${slug}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            finalImageUrl = await getDownloadURL(snapshot.ref);
        } else if (imagePreview) {
            finalImageUrl = imagePreview;
        }

      const bookData = {
          slug,
          title,
          pdfUrl,
          imageUrl: finalImageUrl,
          programName: selectedProgramName === 'none' ? undefined : selectedProgramName,
          imageId: book?.imageId || `book-cover-${Math.floor(Math.random() * 3) + 1}`,
      };

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
          <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-40 w-32 rounded-md">
                  <AvatarImage src={imagePreview || undefined} className="object-cover" />
                  <AvatarFallback className="text-3xl rounded-md">{getInitials(title)}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="image">صورة الغلاف</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </div>
          </div>

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
            <Input id="pdfUrl" name="pdfUrl" type="url" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} required disabled={isSubmitting} />
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
