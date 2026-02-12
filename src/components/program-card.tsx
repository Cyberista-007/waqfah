
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Program } from '@/lib/types';
import { cn, getInitials } from '@/lib/utils';
import { FollowButton } from './follow-button';
import { MessageSquare } from 'lucide-react';
import { memo } from 'react';
import Image from 'next/image';

interface ProgramCardProps {
    program: Program;
    index?: number;
    pinnedMessage?: string;
}

const ProgramCardComponent = ({ program, index = 0, pinnedMessage }: ProgramCardProps) => {
    const placeholder = getPlaceholderImage(program.imageId);
    const bannerPlaceholder = getPlaceholderImage(`topic-${program.slug.substring(0,4)}`) || getPlaceholderImage('series-aqidah');
    const imageUrl = program.imageUrl || placeholder?.imageUrl;

    return (
        <Card 
            className={cn(
                "h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-primary/50 rounded-xl group overflow-hidden transform-gpu hover:-translate-y-2",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="relative">
                <div className="h-24 bg-muted relative">
                     <Image
                        src={bannerPlaceholder?.imageUrl || `https://picsum.photos/seed/${program.slug}/400/100`}
                        alt={`${program.name} banner`}
                        fill
                        className="object-cover image-theme-filter"
                        data-ai-hint={bannerPlaceholder?.imageHint || 'abstract pattern'}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                <div className="absolute top-24 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href={`/programs/${program.slug}`} className="block">
                        <Avatar className="h-24 w-24 border-4 border-background bg-background group-hover:border-primary/50 transition-colors">
                            {imageUrl && <AvatarImage src={imageUrl} alt={program.name} className="image-theme-filter" />}
                            <AvatarFallback className="text-4xl">{getInitials(program.name)}</AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>

            <div className="flex-grow flex flex-col text-center px-4 pb-4 pt-14">
                 <Link href={`/programs/${program.slug}`} className="group/link flex-grow">
                    <CardHeader className="p-0">
                        <CardTitle className="font-headline text-xl group-hover/link:text-primary transition-colors">{program.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-2">
                        <CardDescription className="line-clamp-3">{program.bio}</CardDescription>
                    </CardContent>
                </Link>
                <CardFooter className="flex flex-col items-center gap-3 p-0 pt-4 mt-auto w-full">
                    {pinnedMessage && (
                        <p className="text-xs text-muted-foreground italic border-r-2 border-primary/50 pr-2 w-full text-right mb-2 flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3 shrink-0"/> 
                            <span className="line-clamp-2">{pinnedMessage}</span>
                        </p>
                    )}
                    <FollowButton programId={program.id} />
                </CardFooter>
            </div>
        </Card>
    )
}

export const ProgramCard = memo(ProgramCardComponent);
