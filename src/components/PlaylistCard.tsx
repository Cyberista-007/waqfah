'use client';

import type { Playlist, UserProfile } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface PlaylistCardProps {
    playlist: Playlist;
    userProfile?: UserProfile;
    index?: number;
}

const PlaylistCardComponent = ({ playlist, userProfile, index = 0 }: PlaylistCardProps) => {
    return (
        <Card 
            className={cn(
                "h-full text-right transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20 rounded-xl flex flex-col justify-between",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <CardHeader className="text-right">
                <CardTitle className="font-headline text-xl">
                    <Link href={`/playlists/${playlist.id}?u=${playlist.userId}`} className="hover:text-primary transition-colors">{playlist.name}</Link>
                </CardTitle>
                {userProfile && (
                     <CardDescription className="flex items-center justify-end gap-2 pt-1">
                        <span>{userProfile.name}</span>
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                            <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                        </Avatar>
                    </CardDescription>
                )}
            </CardHeader>
            <CardFooter className='flex justify-between items-center pt-4'>
                <Button asChild size="sm" variant="outline">
                    <Link href={`/playlists/${playlist.id}?u=${playlist.userId}`}>عرض القائمة</Link>
                </Button>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{playlist.lectureIds?.length || 0} محاضرة</span>
                    <Play className="h-4 w-4"/>
                </div>
            </CardFooter>
        </Card>
    );
};

export const PlaylistCard = memo(PlaylistCardComponent);
