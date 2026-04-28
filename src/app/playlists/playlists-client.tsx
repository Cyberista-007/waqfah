'use client';

import type { Playlist, UserProfile } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ListMusic, Play, Lock, Globe, Sparkles, Share2, MoreHorizontal, ArrowLeft, Plus, Search, Activity, Users, Library } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicAppLoader } from '@/components/skeletons';

type WithId<T> = T & { id: string };

function PlaylistCard({ playlist, userProfile, index, isMine = false }: { playlist: Playlist, userProfile?: UserProfile, index: number, isMine?: boolean }) {
    const randomGradient = useMemo(() => {
        const gradients = [
            'from-emerald-500/10 to-teal-900/20',
            'from-indigo-500/10 to-blue-900/20',
            'from-purple-500/10 to-pink-900/20',
            'from-amber-500/10 to-orange-900/20',
            'from-rose-500/10 to-red-900/20',
        ];
        return gradients[index % gradients.length];
    }, [index]);

    const randomColor = useMemo(() => {
        const colors = [
            'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
            'text-indigo-400 border-indigo-400/20 bg-indigo-400/10',
            'text-purple-400 border-purple-400/20 bg-purple-400/10',
            'text-amber-400 border-amber-400/20 bg-amber-400/10',
            'text-rose-400 border-rose-400/20 bg-rose-400/10',
        ];
        return colors[index % colors.length];
    }, [index]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: (index % 6) * 0.1, type: "spring", bounce: 0.4 }}
            whileHover={{ y: -12, scale: 1.02 }}
            className="group h-full"
        >
            <Card className={cn("relative h-full flex flex-col overflow-hidden border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[3rem] transition-all duration-500 hover:border-white/20 shadow-2xl hover:shadow-primary/10", isMine ? "border-primary/20" : "")}>
                {/* 🎨 Abstract Background Pattern */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity duration-700", randomGradient)} />
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                
                <CardContent className="relative z-10 p-8 pt-10 space-y-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start w-full">
                        <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-transform duration-500 group-hover:rotate-6", randomColor)}>
                           <ListMusic className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <Badge variant="outline" className="rounded-full px-4 py-1.5 bg-white/5 border-white/10 text-[11px] font-black uppercase tracking-widest backdrop-blur-md shadow-inner">
                              {playlist.lectureIds?.length || 0} مادة
                           </Badge>
                           {isMine && (
                               <Badge variant={playlist.isPublic ? "secondary" : "outline"} className={cn("rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-inner", playlist.isPublic ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 border-white/10")}>
                                  {playlist.isPublic ? 'عام' : 'خاص'}
                               </Badge>
                           )}
                        </div>
                    </div>

                    <div className="space-y-3 flex-grow">
                        <h3 className="text-2xl md:text-3xl font-black font-headline text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all line-clamp-2 leading-tight">
                            {playlist.name}
                        </h3>
                        {playlist.description ? (
                            <p className="text-white/40 text-sm font-medium line-clamp-3 leading-relaxed">
                                {playlist.description}
                            </p>
                        ) : (
                            <p className="text-white/10 text-sm font-medium italic">لا يوجد وصف متاح لهذه القائمة.</p>
                        )}
                    </div>

                    {userProfile && (
                        <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-auto">
                            <Avatar className="h-10 w-10 border-2 border-white/10 shadow-lg">
                                <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                                <AvatarFallback className="bg-white/5 text-xs font-black">{getInitials(userProfile.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">إعداد وتنسيق</span>
                                <span className="text-sm font-bold text-white/80">{userProfile.name}</span>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="relative z-10 p-8 pt-0 flex gap-3 mt-auto w-full">
                    <Button asChild className="flex-1 h-16 rounded-[1.5rem] bg-white text-black hover:bg-white/90 font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3 group/btn">
                        <Link href={`/playlists/${playlist.id}?u=${playlist.userId}`}>
                           <span className="mt-1">تشغيل القائمة</span>
                           <Play className="w-5 h-5 fill-current transition-transform group-hover/btn:scale-110" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shrink-0">
                        <Share2 className="w-5 h-5 text-white/50" />
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

function PublicPlaylists({ initialPublicPlaylists }: { initialPublicPlaylists: Playlist[] }) {
    const firestore = useFirestore();
    const [searchQuery, setSearchQuery] = useState("");
    
    // Use initial data instead of client-side query to avoid rule issues.
    const publicPlaylists = initialPublicPlaylists;
    const publicPlaylistsLoading = false;
    const publicPlaylistsError = null;
    
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
                    const usersQuery = query(collection(firestore, 'users'), where(documentId(), 'in', chunk));
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
        
        let filtered = publicPlaylists.map(p => ({
            ...p,
            userProfile: userMap.get(p.userId)
        }));

        if (searchQuery.trim()) {
            const queryLower = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(queryLower) || 
                (p.description && p.description.toLowerCase().includes(queryLower)) ||
                (p.userProfile && p.userProfile.name.toLowerCase().includes(queryLower))
            );
        }

        // Sort by newly created first (assuming timestamp exists, fallback to normal order)
        return filtered.sort((a, b) => {
            const timeA = a.createdAt ? (typeof (a.createdAt as any).toMillis === 'function' ? (a.createdAt as any).toMillis() : new Date(a.createdAt as string).getTime() || 0) : 0;
            const timeB = b.createdAt ? (typeof (b.createdAt as any).toMillis === 'function' ? (b.createdAt as any).toMillis() : new Date(b.createdAt as string).getTime() || 0) : 0;
            return timeB - timeA;
        });
    }, [publicPlaylists, users, searchQuery]);

    if (publicPlaylistsLoading || usersLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="h-[450px] rounded-[3rem] bg-white/5 animate-pulse border border-white/5 shadow-2xl" />
                ))}
            </div>
        );
    }



    return (
        <div className="space-y-12">
            {/* Search Bar for Public Playlists */}
            {publicPlaylists && publicPlaylists.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full max-w-3xl mx-auto group"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center">
                        <Search className="absolute right-6 w-6 h-6 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث في القوائم العامة، أو باسم المنسق..."
                            className="w-full h-16 pl-6 pr-16 bg-white/[0.02] border border-white/10 rounded-[2rem] text-lg font-medium text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all backdrop-blur-xl shadow-2xl"
                        />
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {playlistsWithUsers.map((playlist, index) => (
                        <PlaylistCard key={playlist.id} playlist={playlist} userProfile={playlist.userProfile} index={index} />
                    ))}
                </AnimatePresence>
                {playlistsWithUsers.length === 0 && (
                    <div className="col-span-full py-32 text-center space-y-8 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[4rem] backdrop-blur-md max-w-4xl mx-auto">
                        <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mx-auto shadow-inner relative">
                            <Globe className="w-16 h-16 text-white/20" />
                            <div className="absolute inset-0 border border-white/5 rounded-full animate-ping opacity-20" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black font-headline text-white/60">لا توجد قوائم تشغيل مطابقة</h3>
                            <p className="text-white/30 font-medium max-w-md mx-auto leading-relaxed text-lg">
                                {searchQuery ? "لم نعثر على أي قوائم عامة تطابق بحثك الحالي." : "كن أول من يشارك قائمة تشغيل عامة مع الآخرين لينتفعوا بها."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MyPlaylists() {
    const { user } = useUser();
    const myPlaylistsPath = user ? `users/${user.uid}/playlists` : null;
    const { data: myPlaylists, isLoading } = useCollection<Playlist>(myPlaylistsPath, { orderBy: ['createdAt', 'desc'] });
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-[450px] rounded-[3rem] bg-white/5 animate-pulse border border-white/5 shadow-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-16">
            <div className="flex justify-between items-center px-4 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white">مكتبتك الخاصة</h4>
                        <p className="text-xs text-white/40 mt-1">القوائم التي قمت بإعدادها وحفظها</p>
                    </div>
                </div>
                <Button asChild className="rounded-[1.5rem] h-14 px-8 bg-white text-black hover:bg-white/90 font-black gap-2 shadow-xl hover:scale-105 transition-all">
                    <Link href="/profile/playlists">
                       إدارة وإضافة قوائم
                       <Plus className="w-5 h-5" />
                    </Link>
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {myPlaylists && myPlaylists.length > 0 ? (
                    myPlaylists.map((playlist, index) => (
                        <PlaylistCard key={playlist.id} playlist={playlist} index={index} isMine />
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center space-y-10 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[4rem] backdrop-blur-md max-w-4xl mx-auto">
                        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] relative">
                           <Library className="h-16 w-16 text-primary" />
                           <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-full border-4 border-[#0a0a0a] animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black font-headline text-white">لم تنشئ أي قائمة بعد</h3>
                            <p className="text-white/40 font-medium max-w-lg mx-auto leading-relaxed text-xl">
                                ابدأ بتنظيم محاضراتك المفضلة ودروسك المهمة في قوائم مخصصة ليسهل عليك الوصول إليها ومراجعتها.
                            </p>
                        </div>
                        <Button asChild className="rounded-[2rem] h-16 px-16 bg-primary text-white font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                            <Link href="/profile/playlists">ابدأ رحلتك الآن</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function PlaylistsClient({ initialPublicPlaylists }: { initialPublicPlaylists: Playlist[] }) {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return <CinematicAppLoader />;
    }

    return (
        <div className="min-h-screen pb-40 overflow-hidden bg-[#050505] text-right" dir="rtl">
            {/* 🎭 Cinematic Deep Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/3" />
                <div className="absolute top-1/2 left-1/2 w-[1200px] h-[600px] bg-purple-500/5 blur-[200px] rounded-full -translate-y-1/2 -translate-x-1/2 opacity-50" />
            </div>

            <div className="w-full relative z-10 px-4 md:px-8 lg:px-12 xl:px-20 mx-auto">
                {/* 🏛️ Massive Hero Section */}
                <section className="pt-32 pb-24 text-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
                    >
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-white/80">المكتبة الصوتية المنسقة</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: "spring", damping: 20 }}
                        className="text-7xl md:text-[8rem] lg:text-[10rem] font-black font-headline tracking-tighter leading-[0.9] text-white drop-shadow-2xl"
                    >
                        قوائم <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary/80 via-primary to-primary/60 italic px-2">التَّشغيل</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl text-white/40 font-medium leading-relaxed max-w-4xl mx-auto"
                    >
                        مجموعات مختارة بعناية من المحاضرات والدروس، رتبناها وصنفناها لتسهيل رحلتك في طلب العلم والترقية الإيمانية خطوة بخطوة.
                    </motion.p>
                </section>

                {/* 📊 Advanced Stats Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 max-w-7xl mx-auto"
                >
                    {[
                        { label: 'قائمة عامة', value: '+500', icon: Globe, color: 'text-blue-400' },
                        { label: 'مادة صوتية', value: '12K', icon: ListMusic, color: 'text-primary' },
                        { label: 'منسق فعال', value: '85', icon: Users, color: 'text-emerald-400' },
                        { label: 'ساعة استماع', value: '+2M', icon: Activity, color: 'text-rose-400' },
                    ].map((stat, idx) => (
                        <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl hover:bg-white/[0.04] transition-all group shadow-xl">
                            <stat.icon className={cn("w-8 h-8 mb-6 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500", stat.color)} />
                            <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:translate-x-2 transition-transform origin-right">{stat.value}</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest font-bold">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="public" className="w-full space-y-16 max-w-[1600px] mx-auto" dir="rtl">
                    <div className="flex justify-center px-4 sticky top-24 z-50">
                        <TabsList className="h-24 p-3 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] gap-3 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <TabsTrigger 
                                value="public" 
                                className="px-12 h-full rounded-[2rem] data-[state=active]:bg-white data-[state=active]:text-black text-sm font-black uppercase tracking-widest transition-all duration-500 data-[state=active]:shadow-xl"
                            >
                                <Globe className="ml-3 h-6 w-6" />
                                القوائم العامة
                            </TabsTrigger>
                            <TabsTrigger 
                                value="mine" 
                                className="px-12 h-full rounded-[2rem] data-[state=active]:bg-white data-[state=active]:text-black text-sm font-black uppercase tracking-widest transition-all duration-500 data-[state=active]:shadow-xl"
                            >
                                <Lock className="ml-3 h-6 w-6" />
                                قوائمي الخاصة
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="mt-12">
                        <TabsContent value="public" className="outline-none m-0">
                            <PublicPlaylists initialPublicPlaylists={initialPublicPlaylists} />
                        </TabsContent>

                        <TabsContent value="mine" className="outline-none m-0">
                            {user ? <MyPlaylists /> : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-40 text-center space-y-10 bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[4rem] max-w-4xl mx-auto backdrop-blur-xl shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-primary/5 blur-[100px]" />
                                    <div className="w-32 h-32 rounded-full bg-black/50 flex items-center justify-center border border-white/10 mx-auto shadow-2xl relative z-10 backdrop-blur-md">
                                        <Lock className="h-16 w-16 text-white/30" />
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <h3 className="text-4xl md:text-5xl font-black font-headline text-white drop-shadow-lg">محتوى مخصص لك</h3>
                                        <p className="text-white/40 font-medium max-w-xl mx-auto leading-relaxed text-xl italic">
                                            سجل الدخول الآن لتتمكن من إنشاء قوائمك الخاصة، حفظ المحاضرات، وبناء مكتبتك الصوتية الشخصية.
                                        </p>
                                    </div>
                                    <Button asChild className="relative z-10 rounded-[2rem] h-20 px-16 bg-white text-black font-black text-xl shadow-[0_0_40px_rgba(255,255,255,0.2)] gap-4 group hover:bg-white/90">
                                        <Link href="/auth/login?redirect_to=/playlists">
                                            <span className="mt-1">سجل الدخول للمتابعة</span>
                                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-3 transition-transform" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
                
                {/* 📜 Spiritual Quote Footer */}
                <section className="mt-48 mb-24 max-w-4xl mx-auto text-center space-y-10 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[100px] z-0 pointer-events-none" />
                   <div className="relative z-10 p-1 w-24 h-1.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full" />
                   <p className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-black font-headline text-white/50 leading-[1.6] italic drop-shadow-lg">
                      "احرص على ما ينفعك، واستعن بالله ولا تعجز"
                   </p>
                   <div className="relative z-10 text-xs font-black uppercase tracking-[0.5em] text-primary/60 bg-primary/5 inline-block px-8 py-3 rounded-full border border-primary/10">جوامع الكلم ﷺ</div>
                </section>
            </div>
        </div>
    );
}
