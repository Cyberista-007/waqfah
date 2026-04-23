
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import Image from 'next/image';
import Link from 'next/link';
import { Layers, Loader2, Route, GraduationCap } from 'lucide-react';
import { useCollection } from '@/firebase';
import type { Topic } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
    <div className="py-8">
      <h1 className="text-4xl font-black mb-8 font-headline flex items-center gap-4 tracking-tighter">
        <Layers className="h-10 w-10 text-primary animate-icon-draw" />
        مسارات التعلم المقترحة
      </h1>
      
      {isLoading ? (
          <TopicsPageSkeleton />
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {topics?.map((topic, index) => {
                const placeholder = getPlaceholderImage(topic.imageId);
                return (
                    <Link href={`/topics/${topic.slug}`} key={topic.id} className="block group">
                    <Card 
                        className={cn(
                            "group h-full overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-border/50 hover:border-primary/50 relative bg-card/60 backdrop-blur-sm",
                            "animate-fade-in-up"
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="relative h-48 overflow-hidden">
                        <Image
                            src={placeholder?.imageUrl || `https://picsum.photos/seed/${topic.slug}/400/200`}
                            alt={topic.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 image-theme-filter"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        
                        {/* Track Badge */}
                        <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1 rounded-full flex items-center gap-2">
                             <Route className="w-3 h-3 text-primary animate-pulse" />
                             <span className="text-[10px] font-black text-white tracking-widest uppercase">مسار معتمد</span>
                        </div>

                        <div className="absolute bottom-4 right-4 left-4">
                            <h2 className="text-2xl font-black text-white font-headline drop-shadow-lg leading-tight">{topic.name}</h2>
                        </div>
                        </div>
                        
                        <CardContent className="p-5 space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{topic.description}</p>
                            
                            <div className="pt-4 border-t border-border/40 flex justify-between items-center text-xs font-bold uppercase tracking-tighter">
                                <span className="text-primary flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4" />
                                    محتوى منهجي
                                </span>
                                <span className="text-muted-foreground">تصفح المحطات ←</span>
                            </div>
                        </CardContent>
                    </Card>
                    </Link>
                );
                })}
            </div>
            {(!topics || topics.length === 0) && (
                <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground italic">لم يتم إنشاء أي مسارات تعلم حتى الآن.</p>
                </div>
            )}
        </>
      )}
    </div>
  );
}
