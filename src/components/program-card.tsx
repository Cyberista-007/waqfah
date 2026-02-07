import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Program } from '@/lib/types';
import { cn, getInitials } from '@/lib/utils';
import { FollowButton } from './follow-button';
import { Podcast } from 'lucide-react';
import { memo } from 'react';

interface ProgramCardProps {
    program: Program;
    index?: number;
}

const ProgramCardComponent = ({ program, index = 0 }: ProgramCardProps) => {
    const placeholder = getPlaceholderImage(program.imageId);
    const imageUrl = program.imageUrl || placeholder?.imageUrl;

    return (
        <Card 
            className={cn(
                "h-full flex flex-col items-center text-center p-6 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-primary/50 rounded-xl",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Link href={`/programs/${program.slug}`} key={program.id} className="block group w-full">
                <Avatar className="h-32 w-32 mb-4 border-4 border-transparent group-hover:border-primary/50 transition-colors mx-auto">
                    {imageUrl && <AvatarImage src={imageUrl} alt={program.name} className="image-theme-filter" />}
                    <AvatarFallback className="text-4xl">{getInitials(program.name)}</AvatarFallback>
                </Avatar>
                <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2 flex-grow">
                    <CardDescription className="line-clamp-3">{program.bio}</CardDescription>
                </CardContent>
            </Link>
            <CardFooter className="p-0 pt-4 mt-auto w-full">
                 <FollowButton programId={program.id} />
            </CardFooter>
        </Card>
    )
}

export const ProgramCard = memo(ProgramCardComponent);
