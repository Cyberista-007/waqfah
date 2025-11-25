
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Channel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface ChannelCardProps {
    channel: Channel;
    index?: number;
}

export function ChannelCard({ channel, index = 0 }: ChannelCardProps) {
    const placeholder = getPlaceholderImage(channel.imageId);
    return (
        <Link href={`/channels/${channel.slug}`} key={channel.id} className="block group">
            <Card 
                className={cn(
                    "h-full flex flex-col items-center text-center p-6 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-primary/50 rounded-xl",
                    "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <Avatar className="h-32 w-32 mb-4 border-4 border-transparent group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={placeholder?.imageUrl} alt={channel.name} />
                    <AvatarFallback className="text-4xl">{getInitials(channel.name)}</AvatarFallback>
                </Avatar>
                <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl">{channel.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2">
                    <CardDescription className="line-clamp-3">{channel.description}</CardDescription>
                </CardContent>
            </Card>
        </Link>
    )
}
