import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Channel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { FollowButton } from './follow-button';
import { UserPlus } from 'lucide-react';
import { memo } from 'react';

interface ChannelCardProps {
    channel: Channel;
    index?: number;
}

const ChannelCardComponent = ({ channel, index = 0 }: ChannelCardProps) => {
    const placeholder = getPlaceholderImage(channel.imageId);
    const imageUrl = channel.imageUrl || placeholder?.imageUrl;

    return (
        <Card 
            className={cn(
                "h-full flex flex-col items-center text-center p-6 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-primary/50 rounded-xl",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Link href={`/channels/${channel.slug}`} key={channel.id} className="block group w-full">
                <Avatar className="h-32 w-32 mb-4 border-4 border-transparent group-hover:border-primary/50 transition-colors mx-auto">
                    <AvatarImage src={imageUrl} alt={channel.name} className="image-theme-filter" />
                    <AvatarFallback className="text-4xl">{getInitials(channel.name)}</AvatarFallback>
                </Avatar>
                <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{channel.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2 flex-grow">
                    <CardDescription className="line-clamp-3">{channel.description}</CardDescription>
                </CardContent>
            </Link>
            <CardFooter className="p-0 pt-4 mt-auto w-full">
                 <FollowButton channelId={channel.id} />
            </CardFooter>
        </Card>
    )
}

export const ChannelCard = memo(ChannelCardComponent);
