"use client";

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Heart, ListMusic, History, Clock, CheckCircle, Plus, Youtube, Flame, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, getDocs, doc, orderBy, limit } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import type { Lecture, ListenHistoryItem, UserProfile, Playlist, FollowingChannel, Channel } from "@/lib/types";
import { LectureCard } from "@/components/lecture-card";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContinueListening } from "@/components/continue-listening";
import { ChannelCard } from "@/components/channel-card";

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <Card className="text-center">
            <CardContent className="p-4">
                <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{title}</p>
            </CardContent>
        </Card>
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
            } catch (error) {
                console.error("Error fetching favorite lectures:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavorites();
    }, [user, firestore]);

    if (isLoading) {
         return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
               <Card key={i} className="h-[280px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
            ))}
        </div>
    }

    return favoriteLectures.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

function ListenHistorySection() {
    const { user } = useUser();
    if (!user) return null;
    return <ContinueListening isProfilePage={true} />
}

function PlaylistsSection() {
    const { user } = useUser();
    const playlistsPath = user ? `users/${user.uid}/playlists` : null;
    const { data: playlists, isLoading } = useCollection<Playlist>(playlistsPath, { orderBy: ['createdAt', 'desc'] });

    if (isLoading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-[150px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
            ))}
        </div>
    }

    return (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map(playlist => (
                        <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="truncate font-headline">
                                    <Link href={`/playlists/${playlist.id}`} className="hover:underline">
                                        {playlist.name}
                                    </Link>
                                </CardTitle>
                                <CardDescription>{playlist.lectureIds?.length || 0} محاضرة</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description || "لا يوجد وصف."}</p>
                            </CardContent>
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
    );
}


function FollowedChannelsSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [followedChannels, setFollowedChannels] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const followingPath = user ? `users/${user.uid}/followingChannels` : null;
    const { data: following, isLoading: followingLoading } = useCollection<FollowingChannel>(followingPath);

    useEffect(() => {
        const fetchChannels = async () => {
            if (followingLoading || !firestore) return;
            if (!following || following.length === 0) {
                setIsLoading(false);
                setFollowedChannels([]);
                return;
            }
            
            try {
                const channelIds = following.map(f => f.channelId);
                const channelsData: Channel[] = [];
                for (let i = 0; i < channelIds.length; i += 30) {
                    const chunk = channelIds.slice(i, i + 30);
                    const channelsQuery = query(collection(firestore, 'channels'), where('__name__', 'in', chunk));
                    const channelsSnap = await getDocs(channelsQuery);
                    channelsData.push(...channelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel)));
                }
                setFollowedChannels(channelsData);
            } catch (error) {
                console.error("Error fetching followed channels:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChannels();
    }, [following, followingLoading, firestore]);

     if (isLoading) {
         return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
               <Card key={i} className="h-[280px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
            ))}
        </div>
    }

    return followedChannels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {followedChannels.map((channel, index) => <ChannelCard key={channel.id} channel={channel} index={index} />)}
        </div>
    ) : (
        <Card className="text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
                <Youtube className="w-16 h-16 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">لم تقم بمتابعة أي قنوات بعد.</p>
                <Button asChild><Link href="/channels">تصفح القنوات</Link></Button>
            </CardContent>
        </Card>
    );
}

function ReportsSection({ userProfile }: { userProfile: UserProfile }) {
    const totalSeconds = Math.floor((userProfile?.minutesListened || 0) * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const lecturesCompleted = userProfile?.lecturesCompleted || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="محاضرة مكتملة" value={String(lecturesCompleted)} icon={CheckCircle} />
            <StatCard title="الدقائق التي استخدمت فيها التطبيق" value={formattedTime} icon={Clock} />
            <StatCard title="أطول مداومة مستمرة دون انقطاع" value="1" icon={Flame} />
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
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold font-headline flex items-center gap-3"><ListMusic className="h-9 w-9" />مكتبتي</h1>

            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="history"><History className="me-2"/>أكمل الاستماع</TabsTrigger>
                <TabsTrigger value="favorites"><Heart className="me-2"/>المفضلة</TabsTrigger>
                <TabsTrigger value="reports"><FileText className="me-2"/>تقارير</TabsTrigger>
                <TabsTrigger value="playlists"><ListMusic className="me-2"/>قوائم التشغيل</TabsTrigger>
                <TabsTrigger value="following"><Youtube className="me-2"/>القنوات المتابعة</TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="mt-6">
                <ListenHistorySection />
              </TabsContent>
              <TabsContent value="favorites" className="mt-6">
                <FavoritesSection />
              </TabsContent>
               <TabsContent value="reports" className="mt-6">
                <ReportsSection userProfile={userProfile} />
              </TabsContent>
              <TabsContent value="playlists" className="mt-6">
                <PlaylistsSection />
              </TabsContent>
              <TabsContent value="following" className="mt-6">
                <FollowedChannelsSection />
              </TabsContent>
            </Tabs>
        </div>
    );
}
