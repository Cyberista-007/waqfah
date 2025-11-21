import { getAllPublicPlaylists } from '@/lib/data';
import type { Playlist, UserProfile } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ListMusic, User, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'قوائم التشغيل العامة',
  description: 'اكتشف قوائم التشغيل التي أنشأها المستخدمون الآخرون.',
};

// Revalidate this page every 15 minutes
export const revalidate = 900;

interface PublicPlaylist extends Playlist {
    userProfile?: UserProfile;
}

export default async function PublicPlaylistsPage() {
    const playlists: PublicPlaylist[] = await getAllPublicPlaylists();

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
                <ListMusic className="h-10 w-10"/>
                قوائم التشغيل العامة
            </h1>
            
            {playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {playlists.map((playlist, index) => (
                        <Card 
                            key={playlist.id} 
                            className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20 rounded-xl flex flex-col justify-between animate-fade-in-up"
                             style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">
                                    <Link href={`/playlists/${playlist.id}`} className="hover:text-primary transition-colors">{playlist.name}</Link>
                                </CardTitle>
                                {playlist.userProfile && (
                                     <CardDescription className="flex items-center gap-2 pt-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={playlist.userProfile.photoURL} alt={playlist.userProfile.name} />
                                            <AvatarFallback>{getInitials(playlist.userProfile.name)}</AvatarFallback>
                                        </Avatar>
                                        <span>{playlist.userProfile.name}</span>
                                    </CardDescription>
                                )}
                            </CardHeader>
                             <CardContent className='flex justify-between items-center'>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Play className="h-4 w-4"/>
                                    <span>{playlist.lectureIds?.length || 0} محاضرة</span>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/playlists/${playlist.id}`}>عرض القائمة</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">لا توجد قوائم تشغيل عامة متاحة حاليًا.</p>
                </div>
            )}
        </div>
    );
}

    