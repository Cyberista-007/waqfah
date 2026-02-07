'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import type { Book } from '@/lib/types';
import { Book as BookIcon, Loader2, Trash2, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore } from '@/firebase';
import { Input } from '@/components/ui/input';

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { useToast } from '@/hooks/use-toast';
import { doc, runTransaction, increment } from 'firebase/firestore';


function BooksListSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="text-center p-4 flex flex-col rounded-xl">
                 <Skeleton className="w-full max-w-[200px] h-[266px] rounded-md shadow-md mb-4 mx-auto" />
                 <Skeleton className="h-6 w-3/4 mx-auto mb-1" />
                 <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
                 <Skeleton className="h-9 w-24 mx-auto mt-auto rounded-full" />
              </Card>
            ))}
        </div>
    )
}

function BooksList() {
    const { data: allBooks, isLoading } = useCollection<Book>('books', { orderBy: ['title', 'asc']});
    const { isAdmin } = useAdminAuth();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBooks = useMemo(() => {
        if (!allBooks) return [];
        if (!searchTerm) return allBooks;

        return allBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (book.programName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allBooks, searchTerm]);

    const handleDelete = async () => {
        if (!bookToDelete || !firestore) return;

        const bookRef = doc(firestore, 'books', bookToDelete.id);
        const statsRef = doc(firestore, 'stats', 'global');

        try {
            await runTransaction(firestore, async (transaction) => {
                transaction.delete(bookRef);
                transaction.set(statsRef, { books: increment(-1) }, { merge: true });
            });

            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف كتاب "${bookToDelete.title}".`,
            });
        } catch (error) {
            console.error("Error deleting book:", error);
            toast({
                variant: "destructive",
                title: "فشل الحذف",
                description: "لم نتمكن من حذف الكتاب.",
            });
        } finally {
            setBookToDelete(null);
        }
    };


    if (isLoading) {
        return <BooksListSkeleton />;
    }

    return (
        <>
        <div className="mb-8 relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                type="search"
                placeholder="ابحث بالاسم عن كتاب أو برنامج..."
                className="w-full ps-10 h-12 text-lg rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {filteredBooks && filteredBooks.length > 0 ? (
                filteredBooks.map((book) => {
                    const placeholder = getPlaceholderImage(book.imageId);
                    return (
                      <Card key={book.id} className="relative group text-center p-4 transition-transform transform hover:-translate-y-1 flex flex-col rounded-xl">
                        {isAdmin && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setBookToDelete(book)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <div className="flex-grow">
                          <Image
                            src={placeholder?.imageUrl || `https://picsum.photos/seed/${book.slug}/300/400`}
                            alt={`غلاف كتاب ${book.title}`}
                            width={300}
                            height={400}
                            className="w-full h-auto rounded-md shadow-md mb-4 mx-auto max-w-[200px]"
                            data-ai-hint={placeholder?.imageHint || 'book cover'}
                          />
                          <h3 className="text-lg font-semibold mb-1 font-headline">{book.title}</h3>
                          {book.programName && <p className="text-sm text-muted-foreground mb-2">{book.programName}</p>}
                        </div>
                        <Button asChild size="sm" className="mt-auto bg-primary/80 text-primary-foreground hover:bg-primary/90">
                          <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                            تحميل PDF
                          </a>
                        </Button>
                      </Card>
                    );
                })
            ) : (
                <div className="col-span-full text-center py-16">
                    <p className="text-lg text-muted-foreground">
                        {searchTerm ? `لا توجد نتائج بحث عن "${searchTerm}"` : "لم يتم إضافة أي كتب بعد."}
                    </p>
                </div>
            )}
        </div>
        <DeleteConfirmationDialog 
          isOpen={!!bookToDelete}
          onClose={() => setBookToDelete(null)}
          onConfirm={handleDelete}
          title="حذف الكتاب"
          description={`هل أنت متأكد من رغبتك في حذف كتاب "${bookToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    )
}


export default function BooksPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3 justify-center"><BookIcon className="h-9 w-9 animate-icon-draw" />الكتب والمؤلفات</h1>
      <BooksList />
    </div>
  );
}
