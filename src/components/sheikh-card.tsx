
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Sheikh } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface SheikhCardProps {
    sheikh: Sheikh;
    index?: number;
}

export function SheikhCard({ sheikh, index = 0 }: SheikhCardProps) {
    const placeholder = getPlaceholderImage(sheikh.imageId);
    return (
        <Link href={`/sheikhs/${sheikh.slug}`} key={sheikh.id} className="block group">
            <Card 
                className={cn(
                    "h-full flex flex-col items-center text-center p-6 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-primary/50",
                    "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <Avatar className="h-32 w-32 mb-4 border-4 border-transparent group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={placeholder?.imageUrl} alt={sheikh.name} />
                    <AvatarFallback className="text-4xl">{getInitials(sheikh.name)}</AvatarFallback>
                </Avatar>
                <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl">{sheikh.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2">
                    <CardDescription className="line-clamp-3">{sheikh.bio}</CardDescription>
                </CardContent>
            </Card>
        </Link>
    )
}
