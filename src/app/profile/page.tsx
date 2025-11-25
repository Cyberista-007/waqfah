
"use client";

import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, User as UserIcon, Heart, LogOut, Edit, ListMusic, History, Clock, CheckCircle, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, getDocs, doc, orderBy, limit } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import type { Lecture, ListenHistoryItem, UserProfile, Playlist } from "@/lib/types";
import { LectureCard } from "@/components/lecture-card";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { ContinueListening } from "@/components/continue-listening";
import { getInitials } from "@/lib/utils";

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

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const userDocRef = useMemo(() => (user && firestore ? doc(firestore, "users", user.uid) : null), [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login?redirect_to=/profile');
        }
    }, [user, isUserLoading, router]);

    const onLogout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/');
        }
    }

    if (isUserLoading || isProfileLoading || !user || !userProfile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

    if (isEditing) {
        return (
            <EditProfileForm 
                user={user} 
                userProfile={userProfile as UserProfile}
                onClose={() => setIsEditing(false)}
            />
        );
    }
    
    const minutesListened = Math.floor(userProfile?.minutesListened || 0);
    const hoursListened = (minutesListened / 60).toFixed(1);
    const lecturesCompleted = userProfile?.lecturesCompleted || 0;

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.photoURL || userProfile?.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-right">
                    <h1 className="text-3xl font-bold font-headline">{user.displayName}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    {userProfile?.bio && <p className="mt-2 text-foreground">{userProfile.bio}</p>}
                    <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                           <Edit className="me-2 h-4 w-4" /> تعديل الملف الشخصي
                        </Button>
                        <Button onClick={onLogout} variant="secondary" size="sm">
                            <LogOut className="me-2 h-4 w-4" /> تسجيل الخروج
                        </Button>
                    </div>
                </div>
            </header>

            <section>
                <h2 className="text-2xl font-bold mb-4 font-headline">إحصائياتي</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="ساعة استماع" value={hoursListened} icon={Clock} />
                    <StatCard title="محاضرة مكتملة" value={String(lecturesCompleted)} icon={CheckCircle} />
                </div>
            </section>
            
            <Separator />

            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history"><History className="me-2"/>أكمل الاستماع</TabsTrigger>
                <TabsTrigger value="favorites"><Heart className="me-2"/>المفضلة</TabsTrigger>
                <TabsTrigger value="playlists"><ListMusic className="me-2"/>قوائم التشغيل</TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="mt-6">
                <ListenHistorySection />
              </TabsContent>
              <TabsContent value="favorites" className="mt-6">
                <FavoritesSection />
              </TabsContent>
              <TabsContent value="playlists" className="mt-6">
                <PlaylistsSection />
              </TabsContent>
            </Tabs>
        </div>
    );
}
