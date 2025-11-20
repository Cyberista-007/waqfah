
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { useCollection } from '@/firebase';
import type { Book } from '@/lib/types';
import { HomePageSkeleton } from '@/components/skeletons';
import { Book as BookIcon } from 'lucide-react';

export default function BooksPage() {
  const { data: books, isLoading } = useCollection<Book>('books', { orderBy: ['title', 'asc'] });

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3"><BookIcon className="h-9 w-9" />الكتب والمؤلفات</h1>
      {books && books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {books.map((book) => {
            const placeholder = getPlaceholderImage(book.imageId);
            return (
              <Card key={book.id} className="text-center p-4 transition-transform transform hover:-translate-y-1 flex flex-col rounded-xl">
                <div className="flex-grow">
                  <Image
                    src={placeholder?.imageUrl || `https://picsum.photos/seed/${book.slug}/300/400`}
                    alt={`غلاف كتاب ${book.title}`}
                    width={300}
                    height={400}
                    className="w-full h-auto rounded-md shadow-md mb-4 mx-auto max-w-[200px]"
                    data-ai-hint={placeholder?.imageHint || 'book cover'}
                  />
                  <h3 className="text-lg font-semibold mb-2 font-headline">{book.title}</h3>
                </div>
                <Button asChild size="sm" className="mt-auto bg-primary/80 text-primary-foreground hover:bg-primary/90">
                  <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                    تحميل PDF
                  </a>
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">لم يتم إضافة أي كتب بعد.</p>
        </div>
      )}
    </div>
  );
}
