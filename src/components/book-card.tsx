
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import type { Book } from '@/lib/types';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface BookCardProps {
    book: Book;
    index?: number;
}

const BookCardComponent = ({ book, index = 0 }: BookCardProps) => {
    const placeholder = getPlaceholderImage(book.imageId);
    return (
        <Card
            key={book.id}
            className={cn(
                "text-center p-4 transition-transform transform hover:-translate-y-1 flex flex-col rounded-xl",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
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
}

export const BookCard = memo(BookCardComponent);
