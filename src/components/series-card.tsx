
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import type { Series } from '@/lib/types';
import { Play } from 'lucide-react';

interface SeriesCardProps {
    series: Series;
}

export function SeriesCard({ series }: SeriesCardProps) {
    const placeholder = getPlaceholderImage(series.imageId);
    return (
        <Card
            key={series.id}
            className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20"
        >
            <Link href={`/series/${series.id}`} className="block relative">
                <Image
                    src={placeholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/600/400`}
                    alt={series.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={placeholder?.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute top-2 left-2 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span>{series.lectureCount || 0}</span>
                    <Play className="h-3 w-3"/>
                </div>
            </Link>
            <div className="p-4 bg-card">
                <h3 className="font-headline text-lg font-bold">
                    <Link href={`/series/${series.id}`} className="hover:text-primary transition-colors">{series.title}</Link>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{series.sheikhName}</p>
            </div>
        </Card>
    );
}
