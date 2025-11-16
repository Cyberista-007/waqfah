
"use client";

import { useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, User as UserIcon, Heart, LogOut, Clapperboard, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { Lecture } from "@/lib/types";
import { LectureCard } from "@/components/lecture-card";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const auth = useAuth();
    const router = useRouter();
    const [favoriteLectures, setFavoriteLectures] = useState<Lecture[]>([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!firestore || !user?.uid) {
                setIsLoadingFavorites(false);
                return;
            };
            setIsLoadingFavorites(true);
            try {
                const favoritesRef = collection(firestore, 'users', user.uid, 'favorites');
                const favoritesSnap = await getDocs(favoritesRef);
                const lectureIds = favoritesSnap.docs.map(doc => doc.id);

                if (lectureIds.length > 0) {
                    const lecturesData: Lecture[] = [];
                    // Firestore 'in' query is limited to 30 items in chunks.
                    for (let i = 0; i < lectureIds.length; i += 30) {
                        const chunk = lectureIds.slice(i, i + 30);
                        const lecturesRef = collection(firestore, 'lectures');
                        const lecturesQuery = query(lecturesRef, where('__name__', 'in', chunk));
                        const lecturesSnap = await getDocs(lecturesQuery);
                        const lectures = lecturesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture));
                        lecturesData.push(...lectures);
                    }
                    setFavoriteLectures(lecturesData);
                } else {
                    setFavoriteLectures([]);
                }
            } catch (error) {
                console.error("Error fetching favorite lectures:", error);
                setFavoriteLectures([]);
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        if (user) {
            fetchFavorites();
        }

    }, [user, firestore]);

    const onLogout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/');
        }
    }

    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-right">
                        <CardTitle className="text-3xl font-headline">{user.displayName}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                        <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                             <Button variant="outline" size="sm">
                                <Edit className="me-2 h-4 w-4" /> تعديل الملف الشخصي
                            </Button>
                            <Button onClick={onLogout} variant="destructive" size="sm">
                                <LogOut className="me-2 h-4 w-4" /> تسجيل الخروج
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <section>
                <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-3">
                    <Heart className="text-primary" />
                    المحاضرات المفضلة
                </h2>
                {isLoadingFavorites ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                           <Card key={i} className="h-[280px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
                        ))}
                    </div>
                ) : favoriteLectures.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {favoriteLectures.map(lecture => (
                            <LectureCard key={lecture.id} lecture={lecture} />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-16">
                        <CardContent className="flex flex-col items-center gap-4">
                            <Clapperboard className="w-16 h-16 text-muted-foreground" />
                            <p className="text-lg text-muted-foreground">لم تقم بإضافة أي محاضرات إلى المفضلة بعد.</p>
                            <Button asChild>
                                <Link href="/lectures">تصفح المحاضرات</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
}
