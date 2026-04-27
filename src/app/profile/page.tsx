'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Heart, ListMusic, History, Clock, CheckCircle, Plus, Youtube, Flame, FileText, Podcast, Play, Notebook, HandHeart, BookCheck, Sparkles, Trophy, UserPlus, Award, Medal, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { collection, query, where, getDocs, doc, orderBy, limit, collectionGroup } from "firebase/firestore";
import { useEffect, useState, useMemo, useCallback } from "react";
import type { Lecture, ListenHistoryItem, UserProfile, Playlist, Following, Program, UserChallenge, Challenge, LectureNote, GamificationBadge, UserBadge } from "@/lib/types";
import type { User } from 'firebase/auth';
import { LectureCard } from "@/components/lecture-card";
import Link from "next/link";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContinueWatching } from "@/components/continue-listening";
import { ProgramCard } from "@/components/program-card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DonationTierBadge } from "@/components/DonationTierBadge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AccountabilityTracker } from "@/components/accountability-tracker";
import { useAudioPlayer } from "@/components/audio-player-provider";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { cn } from "@/lib/utils";

const toDateHelper = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
};

function StatCard({ title, value, icon: Icon, color = "text-primary", bg = "bg-primary/10" }: { title: string, value: string | number, icon: React.ElementType, color?: string, bg?: string }) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl overflow-hidden group transition-all duration-500"
        >
            <div className={cn("absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full", bg)} />
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className={cn("p-4 rounded-2xl mb-4 border border-white/5 shadow-xl transition-transform group-hover:rotate-12", bg)}>
                    <Icon className={cn("w-8 h-8", color)} />
                </div>
                <p className="text-3xl font-black text-white tracking-tighter mb-1">{value}</p>
                <p className="text-xs font-black text-white/30 uppercase tracking-widest">{title}</p>
            </div>
        </motion.div>
    )
}

function OverviewSection({ userProfile, user }: { userProfile: UserProfile; user: User }) {
    const { siteTimeInSeconds } = useAudioPlayer();

    const totalSeconds = siteTimeInSeconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div className="space-y-12">
            {/* 📊 Bento Grid Stats */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-6">
                <StatCard title="محاضرة مكتملة" value={userProfile.lecturesCompleted || 0} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-500/10" />
                <StatCard title="وقت التعلم" value={formattedTime} icon={Clock} color="text-sky-400" bg="bg-sky-500/10" />
                <StatCard title="النقاط" value={userProfile.points || 0} icon={Sparkles} color="text-amber-400" bg="bg-amber-500/10" />
                <StatCard title="سلاسل مكتملة" value={userProfile.seriesCompleted || 0} icon={Trophy} color="text-purple-400" bg="bg-purple-500/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 🎯 Accountability Quick Access */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black flex items-center gap-3">
                            <BookCheck className="w-6 h-6 text-emerald-400" />
                            محاسبة النفس اليومية
                        </h3>
                        <Link href="/profile?tab=accountability" className="text-xs font-bold text-white/40 hover:text-white transition-colors">مشاهدة السجل الكامل</Link>
                    </div>
                    <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                        <AccountabilityTracker showHeader={false} />
                    </div>
                </div>

                {/* 🏆 Level & Rank */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                        <Medal className="w-6 h-6 text-amber-400" />
                        المستوى الإيماني
                    </h3>
                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                            <Sparkles className="w-32 h-32 text-amber-500" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-500/30 flex items-center justify-center shadow-2xl">
                                <span className="text-4xl font-black text-amber-400">12</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white">طالب علم مثابر</h4>
                                <p className="text-white/40 text-sm mt-1 font-medium">بقي لك 450 نقطة للمستوى القادم</p>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "65%" }}
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FavoritesSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [favoriteLectures, setFavoriteLectures] = useState<Lecture[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!firestore || !user?.uid) {
                if (!firestore) setIsLoading(false);
                return;
            }

            try {
                const favoritesRef = collection(firestore, 'users', user.uid, 'favorites');
                const favoritesSnap = await getDocs(favoritesRef);
                const lectureIds = favoritesSnap.docs.map(doc => doc.id);

                if (lectureIds.length > 0) {
                    const lecturesData: Lecture[] = [];
                    // Firestore 'in' query supports up to 30 items
                    for (let i = 0; i < lectureIds.length; i += 30) {
                        const chunk = lectureIds.slice(i, i + 30);
                        const lecturesRef = collection(firestore, 'lectures');
                        const lecturesQuery = query(lecturesRef, where('__name__', 'in', chunk));
                        const lecturesSnap = await getDocs(lecturesQuery);
                        lecturesData.push(...lecturesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture)));
                    }
                    setFavoriteLectures(lecturesData);
                } else {
                    setFavoriteLectures([]);
                }
            } catch (error: any) {
                console.error("Error fetching favorite lectures:", error);
                if (error.code === 'permission-denied') {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `users/${user.uid}/favorites (or lectures)`,
                        operation: 'list',
                    }));
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavorites();
    }, [user, firestore]);

    if (isLoading) {
        return <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-[280px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></CardContent></Card>
            ))}
        </div>
    }

    return favoriteLectures.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6">
            {favoriteLectures.map(lecture => <LectureCard key={lecture.id} lecture={lecture} />)}
        </div>
    ) : (
        <Card className="text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
                <Heart className="w-16 h-16 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">لم تقم بإضافة أي محاضرات إلى المفضلة بعد.</p>
                <Button asChild><Link href="/lectures">تصفح المحاضرات</Link></Button>
            </CardContent>
        </Card>
    );
}

function ContinueWatchingSection() {
    const { user } = useUser();
    if (!user) return null;
    return <ContinueWatching isProfilePage={true} />
}

function PlaylistsSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

    const playlistsPath = user ? `users/${user.uid}/playlists` : null;
    const { data: playlists, isLoading } = useCollection<Playlist>(playlistsPath, { orderBy: ['createdAt', 'desc'] });

    const handleDelete = () => {
        if (!playlistToDelete || !firestore || !user) return;

        const playlistRef = doc(firestore, 'users', user.uid, 'playlists', playlistToDelete.id);
        deleteDocumentNonBlocking(playlistRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف قائمة التشغيل "${playlistToDelete.name}".`,
        });
        setPlaylistToDelete(null);
    };

    if (isLoading) {
        return <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-[150px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></CardContent></Card>
            ))}
        </div>
    }

    return (
        <>
            <div>
                <div className="flex justify-end mb-4">
                    <Button asChild>
                        <Link href="/profile/playlists">
                            <Plus className="me-2 h-4 w-4" />
                            إنشاء أو تعديل قائمة
                        </Link>
                    </Button>
                </div>
                {playlists && playlists.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-6">
                        {playlists.map(playlist => (
                            <Card key={playlist.id} className="hover:shadow-lg transition-shadow flex flex-col justify-between rounded-xl">
                                <CardHeader className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="font-headline text-xl">
                                            <Link href={`/playlists/${playlist.id}`} className="hover:underline">
                                                {playlist.name}
                                            </Link>
                                        </CardTitle>
                                        <Button onClick={() => setPlaylistToDelete(playlist)} variant="ghost" size="icon" className="text-destructive h-8 w-8 -mt-2 -mr-2">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {playlist.description && (
                                        <CardDescription className="pt-2 line-clamp-2">{playlist.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardFooter className="flex justify-between items-center pt-4 mt-auto">
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Play className="h-4 w-4" />
                                        <span>{playlist.lectureIds?.length || 0} محاضرة</span>
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/playlists/${playlist.id}`}>عرض</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-16">
                        <CardContent className="flex flex-col items-center gap-4">
                            <ListMusic className="w-16 h-16 text-muted-foreground" />
                            <p className="text-lg text-muted-foreground">لم تقم بإنشاء أي قوائم تشغيل بعد.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
            <DeleteConfirmationDialog
                isOpen={!!playlistToDelete}
                onClose={() => setPlaylistToDelete(null)}
                onConfirm={handleDelete}
                title="حذف قائمة التشغيل"
                description={`هل أنت متأكد من رغبتك في حذف قائمة التشغيل "${playlistToDelete?.name}"؟`}
            />
        </>
    );
}


function FollowedProgramsSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [followedPrograms, setFollowedPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const followingPath = user ? `users/${user.uid}/following` : null;
    const { data: following, isLoading: followingLoading } = useCollection<Following>(followingPath);

    useEffect(() => {
        const fetchPrograms = async () => {
            if (followingLoading || !firestore) return;
            if (!following || following.length === 0) {
                setIsLoading(false);
                setFollowedPrograms([]);
                return;
            }

            try {
                const programIds = following.map(f => f.programId);
                const programsData: Program[] = [];
                for (let i = 0; i < programIds.length; i += 30) {
                    const chunk = programIds.slice(i, i + 30);
                    const programsQuery = query(collection(firestore, 'programs'), where('__name__', 'in', chunk));
                    const programsSnap = await getDocs(programsQuery);
                    programsData.push(...programsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program)));
                }
                setFollowedPrograms(programsData);
            } catch (error: any) {
                console.error("Error fetching followed programs:", error);
                if (error.code === 'permission-denied') {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `programs`,
                        operation: 'list',
                    }));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrograms();
    }, [following, followingLoading, firestore]);

    if (isLoading) {
        return <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-[280px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></CardContent></Card>
            ))}
        </div>
    }

    return followedPrograms.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-6">
            {followedPrograms.map((program, index) => <ProgramCard key={program.id} program={program} index={index} />)}
        </div>
    ) : (
        <Card className="text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
                <Podcast className="w-16 h-16 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">لم تقم بمتابعة أي برامج بعد.</p>
                <Button asChild><Link href="/programs">تصفح البرامج</Link></Button>
            </CardContent>
        </Card>
    );
}

function ReportsSection({ userProfile, user }: { userProfile: UserProfile; user: User }) {
    const { siteTimeInSeconds } = useAudioPlayer();
    const firestore = useFirestore();

    const [extraStats, setExtraStats] = useState({
        favorites: 0,
        playlists: 0,
        following: 0,
        notes: 0,
        completedChallenges: 0,
        userBadges: 0,
    });
    const [isLoadingExtra, setIsLoadingExtra] = useState(true);

    useEffect(() => {
        if (!user || !firestore) return;

        const fetchCounts = async () => {
            setIsLoadingExtra(true);
            try {
                const favoritesRef = collection(firestore, 'users', user.uid, 'favorites');
                const playlistsRef = collection(firestore, 'users', user.uid, 'playlists');
                const followingRef = collection(firestore, 'users', user.uid, 'following');
                const notesRef = collection(firestore, 'users', user.uid, 'notes');
                const challengesRef = query(collection(firestore, 'users', user.uid, 'user_challenges'), where('status', '==', 'completed'));
                const badgesRef = collection(firestore, 'users', user.uid, 'user_badges');

                const [
                    favoritesSnap,
                    playlistsSnap,
                    followingSnap,
                    notesSnap,
                    challengesSnap,
                    badgesSnap,
                ] = await Promise.all([
                    getDocs(favoritesRef),
                    getDocs(playlistsRef),
                    getDocs(followingRef),
                    getDocs(notesRef),
                    getDocs(challengesRef),
                    getDocs(badgesRef),
                ]);

                setExtraStats({
                    favorites: favoritesSnap.size,
                    playlists: playlistsSnap.size,
                    following: followingSnap.size,
                    notes: notesSnap.size,
                    completedChallenges: challengesSnap.size,
                    userBadges: badgesSnap.size,
                });
            } catch (e) {
                console.error("Error fetching extra stats:", e);
            } finally {
                setIsLoadingExtra(false);
            }
        }
        fetchCounts();
    }, [user, firestore]);

    const totalSeconds = siteTimeInSeconds;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const lecturesCompleted = userProfile?.lecturesCompleted || 0;
    const points = userProfile?.points || 0;
    const seriesCompleted = userProfile?.seriesCompleted || 0;
    const totalDonated = userProfile?.totalDonated || 0;

    const renderStat = (title: string, value: string | number, icon: React.ElementType, loading?: boolean) => {
        if (loading) {
            return <Card className="text-center"><CardContent className="p-4 flex items-center justify-center h-full"><Loader2 className="h-8 w-8 mx-auto animate-spin" /></CardContent></Card>
        }
        return <StatCard title={title} value={value} icon={icon} />
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4">
            <StatCard title="محاضرة مكتملة" value={String(lecturesCompleted)} icon={CheckCircle} />
            <StatCard title="إجمالي الوقت في الموقع" value={formattedTime} icon={Clock} />
            <StatCard title="النقاط المكتسبة" value={points} icon={Sparkles} />
            <StatCard title="السلاسل المكتملة" value={seriesCompleted} icon={Trophy} />

            {renderStat("المحاضرات المفضلة", extraStats.favorites, Heart, isLoadingExtra)}
            {renderStat("قوائم التشغيل", extraStats.playlists, ListMusic, isLoadingExtra)}
            {renderStat("البرامج المتابعة", extraStats.following, UserPlus, isLoadingExtra)}
            {renderStat("الملاحظات المدونة", extraStats.notes, Notebook, isLoadingExtra)}
            {renderStat("التحديات المكتملة", extraStats.completedChallenges, Award, isLoadingExtra)}
            {renderStat("الأوسمة المكتسبة", extraStats.userBadges, Medal, isLoadingExtra)}

            <StatCard title="أطول مداومة مستمرة دون انقطاع" value="1" icon={Flame} />

            {totalDonated > 0 && <StatCard title="إجمالي التبرعات" value={`${new Intl.NumberFormat('ar-EG').format(totalDonated)} جنيه`} icon={HandHeart} />}
        </div>
    )
}

function UserChallengesSection() {
    const { user } = useUser();
    const userChallengesPath = user ? `users/${user.uid}/user_challenges` : null;
    const { data: userChallengesData, isLoading: userChallengesLoading } = useCollection<UserChallenge>(userChallengesPath, { orderBy: ['startedAt', 'desc'] });
    const { data: allChallenges, isLoading: allChallengesLoading } = useCollection<Challenge>('challenges');

    const [userChallenges, setUserChallenges] = useState<(UserChallenge & { challengeDetails?: Challenge })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userChallengesLoading || allChallengesLoading) return;
        if (!userChallengesData || !allChallenges) {
            setIsLoading(false);
            return;
        }

        const enrichedChallenges = userChallengesData.map(uc => {
            const challengeDetails = allChallenges.find(c => c.id === uc.challengeId);
            return { ...uc, challengeDetails };
        }).filter(uc => uc.challengeDetails);

        setUserChallenges(enrichedChallenges as (UserChallenge & { challengeDetails: Challenge })[]);
        setIsLoading(false);

    }, [userChallengesData, allChallenges, userChallengesLoading, allChallengesLoading]);

    if (isLoading) {
        return <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-[200px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></CardContent></Card>
            ))}
        </div>
    }

    if (userChallenges.length === 0) {
        return (
            <Card className="text-center py-16">
                <CardContent className="flex flex-col items-center gap-4">
                    <Flame className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">لم تشترك في أي تحديات بعد.</p>
                    <Button asChild><Link href="/challenges">تصفح التحديات</Link></Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-6">
            {userChallenges.map(({ id, status, challengeDetails }) => (
                <Card key={id} className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>{challengeDetails?.title}</CardTitle>
                        <Badge variant={status === 'completed' ? 'default' : 'secondary'} className="w-fit">{status === 'completed' ? 'مكتمل' : 'قيد التقدم'}</Badge>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{challengeDetails?.description}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href={`/series/${challengeDetails?.seriesId}`}>
                                الذهاب إلى السلسلة
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

function AllNotesSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [notes, setNotes] = useState<LectureNote[]>([]);
    const [lectures, setLectures] = useState<Record<string, Lecture>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [noteToDelete, setNoteToDelete] = useState<LectureNote | null>(null);

    useEffect(() => {
        if (!firestore || !user) {
            setIsLoading(false);
            return;
        };

        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                const notesCollectionRef = collection(firestore, 'users', user.uid, 'notes');
                const notesQuery = query(notesCollectionRef, orderBy('updatedAt', 'desc'));
                const notesSnap = await getDocs(notesQuery);
                const userNotes = notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LectureNote));
                setNotes(userNotes);

                if (userNotes.length > 0) {
                    const lectureIds = [...new Set(userNotes.map(n => n.lectureId))];
                    const lecturesData: Record<string, Lecture> = {};

                    for (let i = 0; i < lectureIds.length; i += 30) {
                        const chunk = lectureIds.slice(i, i + 30);
                        const lecturesQuery = query(collection(firestore, 'lectures'), where('__name__', 'in', chunk));
                        const lecturesSnap = await getDocs(lecturesQuery);
                        lecturesSnap.forEach(doc => {
                            lecturesData[doc.id] = { id: doc.id, ...doc.data() } as Lecture;
                        });
                    }
                    setLectures(lecturesData);
                }
            } catch (error: any) {
                console.error("Error fetching notes:", error);
                if (error.code === 'permission-denied') {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `users/${user.uid}/notes or lectures`,
                        operation: 'list',
                    }));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, [user, firestore]);

    const handleDeleteNote = async () => {
        if (!noteToDelete || !firestore || !user) return;

        const noteRef = doc(firestore, 'users', user.uid, 'notes', noteToDelete.id);
        deleteDocumentNonBlocking(noteRef);

        setNotes(prev => prev.filter(note => note.id !== noteToDelete.id));

        toast({
            variant: "destructive",
            title: "تم حذف الملاحظة",
        });

        setNoteToDelete(null);
    };

    if (isLoading) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
                <Card key={i} className="h-[200px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></CardContent></Card>
            ))}
        </div>
    }

    if (notes.length === 0) {
        return (
            <Card className="text-center py-16">
                <CardContent className="flex flex-col items-center gap-4">
                    <Notebook className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">لم تكتب أي ملاحظات بعد.</p>
                    <p className="text-sm text-muted-foreground">يمكنك كتابة ملاحظات خاصة من صفحة أي محاضرة.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {notes.map(note => {
                    const lecture = lectures[note.lectureId];
                    return (
                        <Card key={note.id} className="relative group">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 left-2 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={() => setNoteToDelete(note)}
                                aria-label="حذف الملاحظة"
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <CardHeader className="text-right">
                                <CardTitle>
                                    <Link href={`/lectures/${lecture?.slug || '#'}`} className="hover:underline">
                                        {lecture?.title || 'محاضرة محذوفة'}
                                    </Link>
                                </CardTitle>
                                <CardDescription>
                                    آخر تحديث: {note.updatedAt ? formatDistanceToNow(toDateHelper(note.updatedAt) || new Date(), { addSuffix: true, locale: ar }) : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-right">
                                <p className="text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <DeleteConfirmationDialog
                isOpen={!!noteToDelete}
                onClose={() => setNoteToDelete(null)}
                onConfirm={handleDeleteNote}
                title="حذف الملاحظة"
                description="هل أنت متأكد من رغبتك في حذف هذه الملاحظة بشكل دائم؟"
            />
        </>
    );
}

function BadgesSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { data: allBadges, isLoading: loadingAll } = useCollection<GamificationBadge>('gamification_badges');
    const { data: userBadges, isLoading: loadingUser } = useCollection<UserBadge>(user ? `users/${user.uid}/user_badges` : null);

    const [enrichedBadges, setEnrichedBadges] = useState<(GamificationBadge & { isEarned: boolean, earnedAt?: any })[]>([]);

    useEffect(() => {
        if (loadingAll || loadingUser || !allBadges) return;

        const earnedIds = userBadges ? userBadges.map(ub => ub.badgeId) : [];
        const enriched = allBadges.map(badge => {
            const userBadge = userBadges?.find(ub => ub.badgeId === badge.id);
            return {
                ...badge,
                isEarned: earnedIds.includes(badge.id),
                earnedAt: userBadge?.earnedAt
            };
        });

        // Sort: Earned first, then by threshold
        enriched.sort((a, b) => {
            if (a.isEarned && !b.isEarned) return -1;
            if (!a.isEarned && b.isEarned) return 1;
            return a.threshold - b.threshold;
        });

        setEnrichedBadges(enriched);
    }, [allBadges, userBadges, loadingAll, loadingUser]);

    if (loadingAll || loadingUser) {
        return <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-[2.5rem] bg-white/5 animate-pulse" />
            ))}
        </div>
    }

    if (enrichedBadges.length === 0) {
        return (
            <Card className="text-center py-16">
                <CardContent className="flex flex-col items-center gap-4">
                    <Medal className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">لا توجد أوسمة متاحة حالياً.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-6">
            {enrichedBadges.map((badge) => (
                <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={cn(
                        "relative p-8 rounded-[2.5rem] border flex flex-col items-center text-center transition-all duration-500 overflow-hidden group",
                        badge.isEarned 
                            ? "bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-[0_20px_50px_-20px_rgba(var(--primary-rgb),0.3)]" 
                            : "bg-white/[0.02] border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                    )}
                >
                    {badge.isEarned && (
                        <div className="absolute top-0 right-0 p-4">
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                    )}
                    
                    <div className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 relative z-10 transition-transform duration-700 group-hover:rotate-12",
                        badge.isEarned ? "bg-primary/20 border border-primary/20" : "bg-white/5 border border-white/10"
                    )}>
                        <Medal className={cn("w-10 h-10", badge.isEarned ? "text-primary" : "text-white/20")} />
                    </div>

                    <div className="space-y-2 relative z-10">
                        <h4 className="font-black text-white text-sm uppercase tracking-tight">{badge.title}</h4>
                        <p className="text-[10px] text-white/30 font-medium leading-relaxed line-clamp-2">{badge.description}</p>
                    </div>

                    {badge.isEarned && badge.earnedAt && (
                        <div className="mt-4 pt-4 border-t border-white/5 w-full">
                            <p className="text-[8px] font-black text-primary/60 uppercase tracking-[0.2em]">تم الحصول عليه</p>
                            <p className="text-[9px] text-white/20 font-bold mt-1">
                                {formatDistanceToNow(toDateHelper(badge.earnedAt) || new Date(), { addSuffix: true, locale: ar })}
                            </p>
                        </div>
                    )}

                    {!badge.isEarned && (
                        <div className="mt-4 pt-4 border-t border-white/5 w-full">
                            <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em]">المطلوب</p>
                            <p className="text-[9px] text-white/30 font-bold mt-1">{badge.threshold} {badge.metric === 'points' ? 'نقطة' : 'وحدة'}</p>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    )
}

function DonationsSection({ userProfile }: { userProfile: UserProfile }) {
    if (!userProfile.totalDonated || userProfile.totalDonated === 0) {
        return (
            <Card className="text-center py-16">
                <CardContent className="flex flex-col items-center gap-4">
                    <Heart className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">لم تقم بأي تبرعات بعد.</p>
                    <Button asChild><Link href="/donations">ادعم المشروع</Link></Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>ملخص مساهماتك</CardTitle>
                    <CardDescription>شكرًا لدعمك السخي للمشروع. جزاك الله خيرًا.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground">إجمالي المساهمات</span>
                        <span className="font-bold text-lg">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(userProfile.totalDonated)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">مستوى الدعم الحالي</span>
                        {userProfile.donationTier ? (
                            <DonationTierBadge tier={userProfile.donationTier} />
                        ) : (
                            <span className="text-muted-foreground">لا يوجد</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse pt-4">
                        <Switch id="show-donations" disabled />
                        <Label htmlFor="show-donations">إظهار ملخص التبرعات للعامة في ملفي الشخصي (قيد التطوير)</Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const userDocRef = useMemoFirebase(() => (user && firestore ? doc(firestore, "users", user.uid) : null), [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login?redirect_to=/profile');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || isProfileLoading || !user || !userProfile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

    return <ProfileContent user={user} userProfile={userProfile} />;
}

function ProfileContent({ user, userProfile }: { user: User, userProfile: UserProfile }) {
    // Counts for tabs
    const { data: history } = useCollection<ListenHistoryItem>(`users/${user.uid}/listenHistory`);
    const { data: favorites } = useCollection<{ id: string }>(`users/${user.uid}/favorites`);
    const { data: playlists } = useCollection<Playlist>(`users/${user.uid}/playlists`);
    const { data: following } = useCollection<Following>(`users/${user.uid}/following`);
    const { data: userChallenges } = useCollection<UserChallenge>(`users/${user.uid}/user_challenges`);
    const { data: notes } = useCollection<LectureNote>(`users/${user.uid}/notes`);

    const tabs = [
        { id: 'overview', label: 'لوحة التحكم', icon: Layers, count: null, color: 'text-primary' },
        { id: 'history', label: 'أكمل المشاهدة', icon: History, count: history?.length || 0, color: 'text-sky-500' },
        { id: 'favorites', label: 'المفضلة', icon: Heart, count: favorites?.length || 0, color: 'text-rose-500' },
        { id: 'accountability', label: 'محاسبة النفس', icon: BookCheck, count: null, color: 'text-emerald-500' },
        { id: 'playlists', label: 'قوائم التشغيل', icon: ListMusic, count: playlists?.length || 0, color: 'text-amber-500' },
        { id: 'badges', label: 'الأوسمة', icon: Medal, count: null, color: 'text-yellow-500' },
        { id: 'following', label: 'البرامج المتابعة', icon: Podcast, count: following?.length || 0, color: 'text-purple-500' },
        { id: 'challenges', label: 'تحدياتي', icon: Flame, count: userChallenges?.length || 0, color: 'text-orange-500' },
        { id: 'notes', label: 'ملاحظاتي', icon: Notebook, count: notes?.length || 0, color: 'text-cyan-500' },
        { id: 'reports', label: 'إحصائيات', icon: FileText, count: null, color: 'text-indigo-500' },
        { id: 'donations', label: 'الدعم', icon: HandHeart, count: null, color: 'text-red-500' },
    ];

    return (
        <div className="space-y-16 pb-20">
            {/* 👤 Immersive Profile Header */}
            <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 py-32 flex flex-col items-center justify-center text-center overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-zinc-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                </div>

                <div className="container relative z-10 flex flex-col items-center gap-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/20 p-2 bg-background shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
                            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center relative group">
                                {userProfile.photoURL ? (
                                    <NextImage src={userProfile.photoURL} alt={userProfile.name} fill className="object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <span className="text-5xl font-black text-white/10 uppercase tracking-tighter">
                                        {userProfile.name?.charAt(0)}
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <UserPlus className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        {/* Status Pulse */}
                        <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-emerald-500 border-4 border-background animate-pulse" />
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white"
                        >
                            {userProfile.name}
                        </motion.h1>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center justify-center gap-4"
                        >
                            <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-white/5 border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                                {userProfile.role === 'admin' ? 'مدير النظام' : 'طالب علم'}
                            </Badge>
                            {userProfile.donationTier && (
                                <DonationTierBadge tier={userProfile.donationTier} />
                            )}
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                <Flame className="w-3.5 h-3.5 fill-current" />
                                42 يوم متواصل
                            </div>
                        </motion.div>
                        {userProfile.bio && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg text-white/30 max-w-xl mx-auto italic font-medium"
                            >
                                "{userProfile.bio}"
                            </motion.p>
                        )}
                    </div>
                </div>
            </section>

            <Tabs defaultValue="overview" className="w-full relative px-4 sm:px-0">
              <div className="sticky top-[72px] md:top-[80px] z-40 py-2 md:py-8 -mx-4 px-4 overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth touch-pan-x">
                <TabsList className={cn(
                    "h-auto p-2 bg-zinc-950/40 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-nowrap md:grid md:grid-cols-5 gap-2 items-center mx-auto w-max md:w-full max-w-5xl ring-1 ring-white/5 transition-all duration-700",
                    "rounded-[2rem] md:rounded-[3rem] overflow-visible"
                )}>
                  {tabs.map((tab) => (
                    <TabsTrigger 
                        key={tab.id}
                        value={tab.id} 
                        className={cn(
                            "px-5 py-3 md:py-4 rounded-[1.5rem] md:rounded-2xl flex items-center justify-center md:justify-start gap-3 transition-all duration-500 data-[state=active]:bg-primary/20 data-[state=active]:text-primary group/tab min-w-max md:min-w-0 md:w-full",
                            "hover:bg-white/5 border border-transparent data-[state=active]:border-primary/20 relative overflow-hidden",
                            "data-[state=active]:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]"
                        )}
                    >
                        <div className="relative z-10 flex items-center gap-3">
                            <tab.icon className={cn("h-4 w-4 md:h-5 md:w-5 transition-transform duration-500 group-hover/tab:scale-125 group-hover/tab:rotate-12", tab.color)} />
                            <span className="font-bold text-xs md:text-sm tracking-tight whitespace-nowrap">{tab.label}</span>
                            {tab.count !== null && (
                                <span className="flex items-center justify-center min-w-[20px] h-[20px] md:min-w-[24px] md:h-[24px] px-1.5 rounded-full bg-white/5 text-[9px] md:text-[10px] font-black border border-white/5 group-data-[state=active]/tab:bg-primary/20 group-data-[state=active]/tab:border-primary/20 group-data-[state=active]/tab:text-primary transition-colors">
                                    {tab.count}
                                </span>
                            )}
                        </div>
                        {/* Active Indicator Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-data-[state=active]/tab:opacity-100 transition-opacity" />
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

                <div className="mt-16 container">
                    <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <OverviewSection userProfile={userProfile} user={user} />
                    </TabsContent>
                    <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <ContinueWatchingSection />
                    </TabsContent>
                    <TabsContent value="favorites" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <FavoritesSection />
                    </TabsContent>
                    <TabsContent value="reports" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <ReportsSection userProfile={userProfile} user={user} />
                    </TabsContent>
                    <TabsContent value="accountability" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <AccountabilityTracker showHeader={false} />
                    </TabsContent>
                    <TabsContent value="playlists" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <PlaylistsSection />
                    </TabsContent>
                    <TabsContent value="badges" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <BadgesSection />
                    </TabsContent>
                    <TabsContent value="following" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <FollowedProgramsSection />
                    </TabsContent>
                    <TabsContent value="challenges" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <UserChallengesSection />
                    </TabsContent>
                    <TabsContent value="donations" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <DonationsSection userProfile={userProfile} />
                    </TabsContent>
                    <TabsContent value="notes" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <AllNotesSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
