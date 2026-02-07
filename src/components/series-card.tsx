
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Series } from '@/lib/types';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { memo } from 'react';

interface SeriesCardProps {
    series: Series;
    index?: number;
}

const SeriesCardComponent = ({ series, index = 0 }: SeriesCardProps) => {
    return (
        <Card
            key={series.id}
            className={cn(
                "transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20 flex flex-col justify-between rounded-xl transform-gpu hover:-translate-y-2 hover:scale-105 hover:rotate-[-2deg]",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <CardHeader>
                <CardTitle className="font-headline text-xl">
                    <Link href={`/series/${series.slug}`} className="hover:text-primary transition-colors">{series.title}</Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    {series.description}
                </CardDescription>
            </CardHeader>
            <CardContent className='flex justify-between items-center'>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Play className="h-4 w-4"/>
                    <span>{series.lectureCount || 0} محاضرة</span>
                </div>
                 <Button asChild size="sm" variant="outline">
                    <Link href={`/series/${series.slug}`}>عرض السلسلة</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export const SeriesCard = memo(SeriesCardComponent);
