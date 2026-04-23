
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
    forcePublic?: boolean;
}

const AUTOSAVE_KEY = 'autosave_book_form_v2';

export function BookForm({ book, onFormClose, forcePublic = false }: BookFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!book;
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });
  
  const [title, setTitle] = useState(book?.title || "");
  const [pdfUrl, setPdfUrl] = useState(book?.pdfUrl || "");
  const [author, setAuthor] = useState((book as any)?.author || "");
  const [description, setDescription] = useState((book as any)?.description || "");
  const [category, setCategory] = useState((book as any)?.category || "العقيدة");
  const [selectedProgramName, setSelectedProgramName] = useState<string>(book?.programName || "none");
  const [isPublicType, setIsPublicType] = useState(forcePublic || book?.isPublic || false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    if (!title || !pdfUrl) {
        toast({ variant: "destructive", title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة." });
        setIsSubmitting(false);
        return;
    }
    
    const slug = title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

    const bookData = {
        id: book?.id || `book-${Date.now()}`,
        slug,
        title,
        pdfUrl,
        author,
        description,
        category: isPublicType ? category : undefined,
        programName: isPublicType ? undefined : (selectedProgramName === 'none' ? undefined : selectedProgramName),
        imageUrl: (book as any)?.imageUrl || `https://picsum.photos/seed/${slug}/400/600`,
        imageId: book?.imageId || `book-cover-${Math.floor(Math.random() * 3) + 1}`,
        isPublic: isPublicType
    };

    try {
      if (isPublicType) {
          // 🌐 SAVE TO PUBLIC LIBRARY (JSON)
          const res = await fetch('/data/library.json');
          const currentData = await res.json();
          let updatedBooks = currentData.books || [];

          if (isEditMode) {
              updatedBooks = updatedBooks.map((b: any) => b.id === book?.id ? bookData : b);
          } else {
              updatedBooks.push(bookData);
          }

          const saveRes = await fetch('/api/admin/library', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ books: updatedBooks })
          });

          if (saveRes.ok) {
              toast({ title: isEditMode ? "تم تحديث المكتبة العامة" : "تمت الإضافة للمكتبة العامة" });
          }
      } else {
          // 🔒 SAVE TO FIRESTORE (LOCAL)
          if (isEditMode && book) {
              const bookRef = doc(firestore, 'books', book.id);
              updateDocumentNonBlocking(bookRef, bookData);
              toast({ title: "تم التحديث بنجاح" });
          } else {
              const newBookRef = doc(collection(firestore, 'books'));
              const statsRef = doc(firestore, 'stats', 'global');
              await runTransaction(firestore, async (transaction) => {
                  transaction.set(newBookRef, { ...bookData, id: newBookRef.id });
                  transaction.set(statsRef, { books: increment(1) }, { merge: true });
              });
              toast({ title: "تمت الإضافة بنجاح" });
          }
      }
      onFormClose();
    } catch (error) {
      console.error("Error submitting book:", error);
      toast({ variant: "destructive", title: "حدث خطأ", description: "لم نتمكن من حفظ الكتاب." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl">
      <CardHeader className="bg-white/5 p-8 border-b border-white/5">
        <CardTitle className="text-3xl font-black font-headline text-white">{isEditMode ? `تعديل: ${book?.title}` : 'إضافة كتاب جديد'}</CardTitle>
        <CardDescription className="text-lg">أدخل بيانات الكتاب بدقة لضمان أفضل تجربة للقراء.</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-sm font-bold uppercase tracking-widest text-white/40">نوع الكتاب</Label>
              <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                <button type="button" onClick={() => setIsPublicType(false)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isPublicType ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>خاص بالموقع</button>
                <button type="button" onClick={() => setIsPublicType(true)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${isPublicType ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>المكتبة العامة</button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-bold uppercase tracking-widest text-white/40">عنوان الكتاب</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="author" className="text-sm font-bold uppercase tracking-widest text-white/40">المؤلف</Label>
              <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold" />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold uppercase tracking-widest text-white/40">{isPublicType ? 'القسم' : 'البرنامج'}</Label>
              {isPublicType ? (
                <Input value={category} onChange={(e) => setCategory(e.target.value)} className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold" placeholder="مثال: العقيدة، الحديث..." />
              ) : (
                <Select value={selectedProgramName} onValueChange={setSelectedProgramName}>
                  <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold">
                    <SelectValue placeholder="اختر برنامجاً..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="none">بدون برنامج</SelectItem>
                    {allPrograms?.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3">
              <Label htmlFor="pdfUrl" className="text-sm font-bold uppercase tracking-widest text-white/40">رابط الـ PDF</Label>
              <Input id="pdfUrl" type="url" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} required className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold font-mono" placeholder="https://..." />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3">
              <Label htmlFor="desc" className="text-sm font-bold uppercase tracking-widest text-white/40">وصف الكتاب</Label>
              <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full min-h-[120px] p-4 rounded-2xl bg-white/5 border border-white/10 text-lg font-medium focus:ring-2 ring-primary/20 transition-all outline-none" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="h-14 px-10 rounded-2xl text-lg font-black bg-primary hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                {isSubmitting && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                {isEditMode ? 'حفظ التعديلات' : 'إضافة الكتاب للمكتبة'}
            </Button>
            <Button type="button" onClick={onFormClose} variant="outline" className="h-14 px-10 rounded-2xl text-lg font-bold border-white/10 bg-white/5">إلغاء</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
