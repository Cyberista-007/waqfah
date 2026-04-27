'use client';

import type { Playlist, UserProfile } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ListMusic, Play, Loader2, Lock, Globe, Sparkles, Heart, Share2, MoreHorizontal, Clock, ArrowLeft, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicAppLoader } from '@/components/skeletons';

type WithId<T> = T & { id: string };

function PlaylistCard({ playlist, userProfile, index, isMine = false }: { playlist: Playlist, userProfile?: UserProfile, index: number, isMine?: boolean }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className="group"
        >
            <Card className="relative h-full overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10 shadow-2xl">
                {/* 🎨 Abstract Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                
                <CardContent className="p-8 pt-10 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                           <ListMusic className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex gap-2">
                           {isMine && (
                               <Badge variant={playlist.isPublic ? "secondary" : "outline"} className="rounded-lg px-3 py-1 bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest">
                                  {playlist.isPublic ? 'عام' : 'خاص'}
                               </Badge>
                           )}
                           <Badge variant="outline" className="rounded-lg px-3 py-1 bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest">
                              {playlist.lectureIds?.length || 0} مادة
                           </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black font-headline text-white group-hover:text-primary transition-colors line-clamp-1">
                            {playlist.name}
                        </h3>
                        {playlist.description ? (
                            <p className="text-white/30 text-sm font-medium line-clamp-2 leading-relaxed">
                                {playlist.description}
                            </p>
                        ) : (
                            <p className="text-white/10 text-sm font-medium italic">لا يوجد وصف متاح لهذه القائمة.</p>
                        )}
                    </div>

                    {userProfile && (
                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                            <Avatar className="h-8 w-8 border border-white/10">
                                <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                                <AvatarFallback className="bg-white/5 text-[10px]">{getInitials(userProfile.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">منسق القائمة</span>
                                <span className="text-xs font-bold text-white/60">{userProfile.name}</span>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-8 pt-0 flex gap-3">
                    <Button asChild className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 gap-2">
                        <Link href={`/playlists/${playlist.id}`}>
                           تشغيل القائمة
                           <Play className="w-4 h-4 fill-current" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <Share2 className="w-4 h-4 text-white/40" />
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

function PublicPlaylists() {
    const firestore = useFirestore();
    const { data: publicPlaylists, isLoading: publicPlaylistsLoading } = useCollection<Playlist>('playlists', { where: ['isPublic', '==', true], orderBy: ['createdAt', 'desc'], limit: 30 });
    
    const userIds = useMemo(() => {
        if (!publicPlaylists) return [];
        return [...new Set(publicPlaylists.map(p => p.userId).filter(Boolean))];
    }, [publicPlaylists]);

    const [users, setUsers] = useState<WithId<UserProfile>[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const userIdsJson = JSON.stringify(userIds);

    useEffect(() => {
        if (!firestore || userIds.length === 0) {
            setUsers([]);
            setUsersLoading(false);
            return;
        }

        const fetchUsers = async () => {
            setUsersLoading(true);
            const usersData: WithId<UserProfile>[] = [];
            const chunks: string[][] = [];
            for (let i = 0; i < userIds.length; i += 30) {
                chunks.push(userIds.slice(i, i + 30));
            }
            
            try {
                for (const chunk of chunks) {
                    if (chunk.length === 0) continue;
                    const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk));
                    const usersSnap = await getDocs(usersQuery);
                    usersData.push(...usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<UserProfile>)));
                }
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching user profiles for playlists:", error);
            } finally {
                setUsersLoading(false);
            }
        };

        fetchUsers();
    }, [firestore, userIdsJson]);
    
    const playlistsWithUsers = useMemo(() => {
        if (!publicPlaylists || !users) return [];
        const userMap = new Map(users.map(u => [u.id, u]));
        return publicPlaylists.map(p => ({
            ...p,
            userProfile: userMap.get(p.userId)
        }));
    }, [publicPlaylists, users]);

    if (publicPlaylistsLoading || usersLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-[350px] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
                {playlistsWithUsers.map((playlist, index) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} userProfile={playlist.userProfile} index={index} />
                ))}
            </AnimatePresence>
            {playlistsWithUsers.length === 0 && (
                <div className="col-span-full py-32 text-center space-y-6 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]">
                    <Globe className="w-16 h-16 text-white/10 mx-auto" />
                    <p className="text-xl font-black text-white/40">لا توجد قوائم تشغيل عامة حالياً</p>
                </div>
            )}
        </div>
    );
}

function MyPlaylists() {
    const { user } = useUser();
    const myPlaylistsPath = user ? `users/${user.uid}/playlists` : null;
    const { data: myPlaylists, isLoading } = useCollection<Playlist>(myPlaylistsPath, { orderBy: ['createdAt', 'desc'] });
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-[350px] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40">قوائمك الشخصية</h4>
                </div>
                <Button asChild variant="outline" className="rounded-2xl h-12 px-8 border-white/10 hover:bg-white/10 font-black gap-2">
                    <Link href="/profile/playlists">
                       إدارة القوائم
                       <MoreHorizontal className="w-4 h-4" />
                    </Link>
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myPlaylists && myPlaylists.length > 0 ? (
                    myPlaylists.map((playlist, index) => (
                        <PlaylistCard key={playlist.id} playlist={playlist} index={index} isMine />
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center space-y-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[4rem]">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mx-auto">
                           <Plus className="h-12 w-12 text-white/10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black font-headline text-white/40">لم تنشئ أي قائمة بعد</h3>
                            <p className="text-white/20 font-medium max-w-md mx-auto leading-relaxed italic">
                                ابدأ بتنظيم محاضراتك المفضلة في قوائم خاصة ليسهل عليك الرجوع إليها.
                            </p>
                        </div>
                        <Button asChild className="rounded-2xl h-16 px-12 bg-primary text-white font-black text-lg shadow-xl shadow-primary/20">
                            <Link href="/profile/playlists">ابدأ الآن</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PlaylistsPage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return <CinematicAppLoader />;
    }

    return (
        <div className="min-h-screen pb-32 overflow-hidden bg-[#050505]">
            {/* 🎭 Atmospheric Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="container relative z-10 px-4">
                {/* 🏛️ Hero Section */}
                <section className="pt-24 pb-16 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner"
                    >
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 italic">Curated Spiritual Collections</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black font-headline tracking-tighter leading-tight"
                    >
                        قوائم <span className="text-primary italic">التَّشغيل</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        مجموعات مختارة بعناية من المحاضرات والدروس، مرتبة حسب المواضيع لتسهيل رحلتك في طلب العلم والترقية الإيمانية.
                    </motion.p>
                </section>

                <Tabs defaultValue="public" className="w-full space-y-16">
                    <div className="flex justify-center px-4">
                        <TabsList className="h-20 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] gap-2">
                            <TabsTrigger 
                                value="public" 
                                className="px-10 h-full rounded-[1.5rem] data-[state=active]:bg-white data-[state=active]:text-black text-xs font-black uppercase tracking-widest transition-all duration-500"
                            >
                                <Globe className="me-3 h-5 w-5" />
                                القوائم العامة
                            </TabsTrigger>
                            <TabsTrigger 
                                value="mine" 
                                className="px-10 h-full rounded-[1.5rem] data-[state=active]:bg-white data-[state=active]:text-black text-xs font-black uppercase tracking-widest transition-all duration-500"
                            >
                                <Lock className="me-3 h-5 w-5" />
                                قوائمي الخاصة
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="public" className="mt-0 outline-none">
                        <PublicPlaylists />
                    </TabsContent>

                    <TabsContent value="mine" className="mt-0 outline-none">
                        {user ? <MyPlaylists /> : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-32 text-center space-y-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[4rem] max-w-4xl mx-auto"
                            >
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mx-auto">
                                    <Lock className="h-12 w-12 text-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black font-headline text-white/40">محتوى خاص</h3>
                                    <p className="text-white/20 font-medium max-w-md mx-auto leading-relaxed italic">
                                        سجل الدخول لعرض قوائمك الخاصة وإدارتها والاستمتاع بتجربة مخصصة لك بالكامل.
                                    </p>
                                </div>
                                <Button asChild className="rounded-2xl h-16 px-12 bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 gap-3 group">
                                    <Link href="/auth/login?redirect_to=/playlists">
                                        تسجيل الدخول الآن
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                                    </Link>
                                </Button>
                            </motion.div>
                        )}
                    </TabsContent>
                </Tabs>
                
                {/* 📜 Spiritual Quote Footer */}
                <section className="mt-40 max-w-3xl mx-auto text-center space-y-8">
                   <div className="p-1 w-20 h-1 bg-primary/20 mx-auto rounded-full" />
                   <p className="text-2xl md:text-3xl font-black font-headline text-white/40 leading-relaxed italic">
                      "احرص على ما ينفعك، واستعن بالله ولا تعجز"
                   </p>
                   <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">جوامع الكلم ﷺ</div>
                </section>
            </div>
        </div>
    );
}

