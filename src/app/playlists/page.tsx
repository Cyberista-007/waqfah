'use client';
import type { Playlist, UserProfile } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ListMusic, Play, Loader2, Lock, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCollection, useUser } from '@/firebase';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

function PlaylistsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-xl flex flex-col justify-between">
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                         <div className="flex items-center gap-2 pt-1">
                            <div className="h-6 w-6 rounded-full bg-muted"></div>
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                        </div>
                    </CardHeader>
                    <CardContent className='flex justify-between items-center'>
                       <div className="h-4 bg-muted rounded w-1/3"></div>
                       <div className="h-9 w-24 bg-muted rounded-full"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function PublicPlaylists() {
    const { data: publicPlaylists, isLoading: publicPlaylistsLoading } = useCollection<Playlist>('playlists', { where: ['isPublic', '==', true], orderBy: ['createdAt', 'desc'], limit: 30 });
    const { data: users, isLoading: usersLoading } = useCollection<UserProfile>('users');
    
    const playlistsWithUsers = useMemo(() => {
        if (!publicPlaylists || !users) return [];
        const userMap = new Map(users.map(u => [u.id, u]));
        return publicPlaylists.map(p => ({
            ...p,
            userProfile: userMap.get(p.userId)
        }));

    }, [publicPlaylists, users]);

    const isLoading = publicPlaylistsLoading || usersLoading;

    if (isLoading) {
        return <PlaylistsSkeleton />;
    }

    return (
        <>
            {playlistsWithUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {playlistsWithUsers.map((playlist, index) => (
                        <Card 
                            key={playlist.id} 
                            className="text-right transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20 rounded-xl flex flex-col justify-between animate-fade-in-up"
                             style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <CardHeader className="text-right">
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
        </>
    );
}

function MyPlaylists() {
    const { user } = useUser();
    const myPlaylistsPath = user ? `users/${user.uid}/playlists` : null;
    const { data: myPlaylists, isLoading } = useCollection<Playlist>(myPlaylistsPath, { orderBy: ['createdAt', 'desc'] });
    
    if (isLoading) {
        return <PlaylistsSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button asChild>
                    <Link href="/profile/playlists">إدارة قوائمي</Link>
                </Button>
            </div>
            {myPlaylists && myPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myPlaylists.map((playlist, index) => (
                        <Card 
                            key={playlist.id} 
                            className="text-right transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 border-2 border-transparent hover:border-primary/50 hover:shadow-primary/20 rounded-xl flex flex-col justify-between animate-fade-in-up"
                             style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <CardHeader>
                                 <div className='flex justify-start items-center gap-2'>
                                    <CardTitle className="font-headline text-xl">
                                        <Link href={`/playlists/${playlist.id}`} className="hover:text-primary transition-colors">{playlist.name}</Link>
                                    </CardTitle>
                                    <Badge variant={playlist.isPublic ? "secondary" : "outline"}>
                                        {playlist.isPublic ? 'عام' : 'خاص'}
                                    </Badge>
                                 </div>
                                {playlist.description && (
                                     <CardDescription className="pt-1 line-clamp-2 text-right">
                                        {playlist.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                             <CardFooter className='flex justify-between items-center pt-4'>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Play className="h-4 w-4"/>
                                    <span>{playlist.lectureIds?.length || 0} محاضرة</span>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/playlists/${playlist.id}`}>عرض القائمة</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <p className="text-lg text-muted-foreground">لم تقم بإنشاء أي قوائم تشغيل بعد.</p>
                     <Button asChild variant="link">
                        <Link href="/profile/playlists">ابدأ الآن</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function PlaylistsPage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
                <ListMusic className="h-10 w-10"/>
                قوائم التشغيل
            </h1>
            
            <Tabs defaultValue="public" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="public">
                        <Globe className="me-2 h-4 w-4" />
                        القوائم العامة
                    </TabsTrigger>
                    <TabsTrigger value="mine">
                        <Lock className="me-2 h-4 w-4" />
                        قوائمي
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="public" className="mt-6">
                    <PublicPlaylists />
                </TabsContent>
                <TabsContent value="mine" className="mt-6">
                   {user ? <MyPlaylists /> : (
                       <div className="text-center py-16 border-2 border-dashed rounded-xl">
                            <p className="text-lg text-muted-foreground mb-4">
                                سجل الدخول لعرض قوائمك الخاصة وإدارتها.
                            </p>
                            <Button asChild>
                                <Link href="/auth/login?redirect_to=/playlists">تسجيل الدخول</Link>
                            </Button>
                        </div>
                   )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
