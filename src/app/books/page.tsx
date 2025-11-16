import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAllBooks } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/images';

export const metadata = {
  title: 'الكتب والمؤلفات',
};

export default async function BooksPage() {
  const books = await getAllBooks();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline">الكتب والمؤلفات</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {books.map((book) => {
          const placeholder = getPlaceholderImage(book.imageId);
          return (
            <Card key={book.slug} className="text-center p-4 transition-transform transform hover:-translate-y-1">
              <Image
                src={placeholder?.imageUrl || `https://picsum.photos/seed/${book.slug}/300/400`}
                alt={`غلاف كتاب ${book.title}`}
                width={300}
                height={400}
                className="w-full h-auto rounded-md shadow-md mb-4 mx-auto max-w-[200px]"
                data-ai-hint={placeholder?.imageHint}
              />
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold mb-2 font-headline">{book.title}</h3>
                <Button asChild size="sm" className="bg-primary/80 text-primary-foreground hover:bg-primary/90">
                  <a href={book.pdfUrl} download>
                    تحميل PDF
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
