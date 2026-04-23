"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc, runTransaction } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Book as BookIcon, Globe, Lock } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { BookForm } from "@/components/admin/book-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminBooksPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("local");

    // Local Firestore Books
    const { data: firestoreBooks, isLoading: booksLoading } = useCollection<Book>('books', { orderBy: ['title', 'asc'] });

    // Public Library Books (JSON)
    const [publicBooks, setPublicBooks] = useState<Book[]>([]);
    const [publicLoading, setPublicLoading] = useState(true);

    const fetchPublicBooks = async () => {
        try {
            const res = await fetch('/data/library.json');
            const data = await res.json();
            if (data.books) {
                setPublicBooks(data.books.map((b: any) => ({ ...b, isPublic: true })));
            }
        } catch (error) {
            console.error("Failed to fetch public books", error);
        } finally {
            setPublicLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicBooks();
    }, []);

    const handleDelete = async () => {
        if (!bookToDelete) return;

        if (bookToDelete.isPublic) {
            // Delete from Public JSON
            const updatedBooks = publicBooks.filter(b => b.id !== bookToDelete.id);
            try {
                const res = await fetch('/api/admin/library', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ books: updatedBooks })
                });
                if (res.ok) {
                    setPublicBooks(updatedBooks);
                    toast({ title: "تم حذف الكتاب من المكتبة العامة" });
                }
            } catch (error) {
                toast({ variant: "destructive", title: "فشل حذف الكتاب العام" });
            }
        } else {
            // Delete from Firestore
            if (!firestore) return;
            const bookRef = doc(firestore, 'books', bookToDelete.id);
            const statsRef = doc(firestore, 'stats', 'global');

            try {
                await runTransaction(firestore, async (transaction) => {
                    const statsDoc = await transaction.get(statsRef);
                    const currentBooks = statsDoc.data()?.books || 0;
                    transaction.set(statsRef, { books: Math.max(0, currentBooks - 1) }, { merge: true });
                    transaction.delete(bookRef);
                });
                toast({ title: "تم حذف الكتاب من الموقع" });
            } catch (error) {
                toast({ variant: "destructive", title: "فشل الحذف" });
            }
        }
        setBookToDelete(null);
    };
    
    const handleNew = () => {
      setBookToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (book: Book) => {
        setBookToEdit(book);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setBookToEdit(null);
      fetchPublicBooks(); // Refresh public books
    }

    if (isFormOpen) {
      return <BookForm book={bookToEdit} onFormClose={handleFormClose} forcePublic={activeTab === "public"} />
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black font-headline flex items-center gap-3">
                        <BookIcon className="w-8 h-8 text-primary" />
                        مركز إدارة الكتب
                    </h1>
                    <p className="text-muted-foreground mt-1">تحكم كامل في مكتبتك الخاصة والمكتبة العامة المشتركة.</p>
                </div>
                <Button onClick={handleNew} className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                    <PlusCircle className="ml-2 h-5 w-5" />
                    إضافة كتاب جديد
                </Button>
            </div>

            <Tabs defaultValue="local" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 mb-6">
                    <TabsTrigger value="local" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                        <Lock className="w-4 h-4 ml-2" />
                        كتب الموقع (خاص)
                    </TabsTrigger>
                    <TabsTrigger value="public" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary">
                        <Globe className="w-4 h-4 ml-2" />
                        المكتبة العامة (Public API)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="local">
                    <BooksTable books={firestoreBooks || []} isLoading={booksLoading} onEdit={handleEdit} onDelete={setBookToDelete} />
                </TabsContent>

                <TabsContent value="public">
                    <BooksTable books={publicBooks} isLoading={publicLoading} onEdit={handleEdit} onDelete={setBookToDelete} isPublic />
                </TabsContent>
            </Tabs>

            <DeleteConfirmationDialog 
                isOpen={!!bookToDelete}
                onClose={() => setBookToDelete(null)}
                onConfirm={handleDelete}
                title="حذف الكتاب"
                description={`هل أنت متأكد من رغبتك في حذف كتاب "${bookToDelete?.title}"؟`}
            />
        </div>
    );
}

function BooksTable({ books, isLoading, onEdit, onDelete, isPublic = false }: { books: Book[], isLoading: boolean, onEdit: (b: Book) => void, onDelete: (b: Book) => void, isPublic?: boolean }) {
    return (
        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="py-6 pr-8 font-bold text-white/40">عنوان الكتاب</TableHead>
                            <TableHead className="font-bold text-white/40">{isPublic ? 'القسم' : 'البرنامج'}</TableHead>
                            <TableHead className="text-left pl-8 font-bold text-white/40">التحكم</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-20">
                                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : books.map((book) => (
                            <TableRow key={book.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                                <TableCell className="py-6 pr-8 font-bold text-lg">{book.title}</TableCell>
                                <TableCell className="text-white/60">
                                    {isPublic ? (book as any).category : (book.programName || 'عام')}
                                </TableCell>
                                <TableCell className="text-left pl-8">
                                    <div className="flex gap-2 justify-end">
                                        <Button onClick={() => onEdit(book)} variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 hover:bg-primary hover:border-primary transition-all">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => onDelete(book)} variant="destructive" size="icon" className="rounded-xl shadow-lg shadow-destructive/20">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && books.length === 0 && (
                    <div className="py-20 text-center text-white/20 font-medium">لا توجد كتب في هذا القسم حالياً.</div>
                )}
            </CardContent>
        </Card>
    );
}
