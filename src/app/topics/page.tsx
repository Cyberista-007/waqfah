'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import Image from 'next/image';
import Link from 'next/link';
import { Hash, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase';
import type { Topic } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function TopicsPageSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-full overflow-hidden">
                    <Skeleton className="w-full h-40" />
                    <CardContent className="p-4 space-y-2">
                       <Skeleton className="h-6 w-3/4" />
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function TopicsPage() {
  const { data: topics, isLoading } = useCollection<Topic>('topics', { orderBy: ['name', 'asc'] });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
        <Hash className="h-10 w-10" />
        تصفح حسب الموضوع
      </h1>
      
      {isLoading ? (
          <TopicsPageSkeleton />
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {topics?.map((topic) => {
                const placeholder = getPlaceholderImage(topic.imageId);
                return (
                    <Link href={`/topics/${topic.slug}`} key={topic.id} className="block group">
                    <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-primary/50">
                        <div className="relative">
                        <Image
                            src={placeholder?.imageUrl || `https://picsum.photos/seed/${topic.slug}/400/200`}
                            alt={topic.name}
                            width={400}
                            height={200}
                            className="w-full h-40 object-cover"
                            data-ai-hint={placeholder?.imageHint || 'abstract'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 right-4">
                            <h2 className="text-2xl font-bold text-white font-headline">{topic.name}</h2>
                        </div>
                        </div>
                        <CardContent className="p-4">
                        <p className="text-muted-foreground line-clamp-3">{topic.description}</p>
                        </CardContent>
                    </Card>
                    </Link>
                );
                })}
            </div>
            {!topics || topics.length === 0 && (
                <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">لم تتم إضافة أي مواضيع بعد.</p>
                </div>
            )}
        </>
      )}
    </div>
  );
}
