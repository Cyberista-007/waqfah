

"use client";

import { useState } from "react";
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Book as BookIcon } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { BookForm } from "@/components/admin/book-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export default function AdminBooksPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const booksQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'books'), orderBy('title')) : null,
        [firestore]
    );
    const { data: allBooks, isLoading } = useCollection<Book>(booksQuery);

    const handleDelete = async () => {
        if (!bookToDelete || !firestore) return;
        
        const bookRef = doc(firestore, 'books', bookToDelete.id);
        
        try {
            await deleteDocumentNonBlocking(bookRef);
            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف كتاب "${bookToDelete.title}".`,
            });
        } catch (error) {
            console.error("Error deleting book:", error);
            toast({
                variant: "destructive",
                title: "حدث خطأ",
                description: "لم نتمكن من حذف الكتاب.",
            });
        } finally {
            setBookToDelete(null); // Close the dialog
        }
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
    }

    if (isFormOpen) {
      return <BookForm book={bookToEdit} onFormClose={handleFormClose} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><BookIcon/>إدارة الكتب</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف الكتب في الموقع.
            </CardDescription>
            </div>
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة كتاب جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>عنوان الكتاب</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : allBooks?.map((book) => (
                <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell className="text-left">
                    <div className="flex gap-2 justify-end">
                        <Button onClick={() => handleEdit(book)} variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setBookToDelete(book)} variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            {!isLoading && !allBooks?.length && (
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي كتب بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!bookToDelete}
          onClose={() => setBookToDelete(null)}
          onConfirm={handleDelete}
          title="حذف الكتاب"
          description={`هل أنت متأكد من رغبتك في حذف كتاب "${bookToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
