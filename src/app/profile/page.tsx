'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Heart, ListMusic, History, Clock, CheckCircle, Plus, Youtube, Flame, FileText, Podcast, Play, Notebook, Clapperboard, HandHeart, BookCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { collection, query, where, getDocs, doc, orderBy, limit, collectionGroup } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import type { Lecture, ListenHistoryItem, UserProfile, Playlist, Following, Program, UserChallenge, Challenge, LectureClip, LectureNote } from "@/lib/types";
import { LectureCard } from "@/components/lecture-card";
import Link from "next/link";
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

function ContinueWatchingSection() {
    const { user } = useUser();
    if (!user) return null;
    return <ContinueWatching isProfilePage={true} />
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
                        <Card key={playlist.id} className="hover:shadow-lg transition-shadow flex flex-col justify-between rounded-xl">
                            <CardHeader className="flex-grow">
                                <CardTitle className="font-headline text-xl">
                                    <Link href={`/playlists/${playlist.id}`} className="hover:underline">
                                        {playlist.name}
                                    </Link>
                                </CardTitle>
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
         return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
               <Card key={i} className="h-[280px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
            ))}
        </div>
    }

    return followedPrograms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

function ReportsSection({ userProfile }: { userProfile: UserProfile }) {
    const { siteTimeInSeconds } = useAudioPlayer();

    const totalSeconds = siteTimeInSeconds;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const lecturesCompleted = userProfile?.lecturesCompleted || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="محاضرة مكتملة" value={String(lecturesCompleted)} icon={CheckCircle} />
            <StatCard title="إجمالي الوقت في الموقع" value={formattedTime} icon={Clock} />
            <StatCard title="أطول مداومة مستمرة دون انقطاع" value="1" icon={Flame} />
        </div>
    )
}

function UserChallengesSection() {
    const { user } = useUser();
    const userChallengesPath = user ? `users/${user.uid}/user_challenges` : null;
    const { data: userChallengesData, isLoading: userChallengesLoading } = useCollection<UserChallenge>(userChallengesPath, { orderBy: ['startedAt', 'desc']});
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
        return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
               <Card key={i} className="h-[200px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userChallenges.map(({id, status, challengeDetails}) => (
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

function SavedClipsSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [clips, setClips] = useState<LectureClip[]>([]);
    const [lectures, setLectures] = useState<Record<string, Lecture>>({});
    const [isLoading, setIsLoading] = useState(true);
    const { playTrack } = useAudioPlayer();

    useEffect(() => {
        if (!firestore || !user) {
            setIsLoading(false);
            return;
        };

        const fetchClips = async () => {
            setIsLoading(true);
            try {
                const clipsQuery = query(collectionGroup(firestore, 'clips'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
                const clipsSnap = await getDocs(clipsQuery);
                const userClips = clipsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LectureClip));
                setClips(userClips);

                if (userClips.length > 0) {
                    const lectureIds = [...new Set(userClips.map(c => c.lectureId))];
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
                console.error("Error fetching saved clips:", error);
                if (error.code === 'permission-denied') {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `clips (collectionGroup) or lectures`,
                        operation: 'list',
                    }));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchClips();
    }, [user, firestore]);

     if (isLoading) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
               <Card key={i} className="h-[150px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
            ))}
        </div>
    }

    if (clips.length === 0) {
        return (
            <Card className="text-center py-16">
                <CardContent className="flex flex-col items-center gap-4">
                    <Clapperboard className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">لم تقم بإنشاء أي مقاطع بعد.</p>
                    <p className="text-sm text-muted-foreground">يمكنك إنشاء مقاطع من صفحة أي محاضرة.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {clips.map(clip => {
                const lecture = lectures[clip.lectureId];
                if (!lecture) return null;

                return (
                    <Card key={clip.id} className="p-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{clip.title}</p>
                            <Link href={`/lectures/${lecture.slug}`} className="text-sm text-muted-foreground hover:underline">
                                من محاضرة: {lecture.title}
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => playTrack(lecture, clip.startTime, clip.endTime)}
                            >
                                <Play className="h-5 w-5" />
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

function AllNotesSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [notes, setNotes] = useState<LectureNote[]>([]);
    const [lectures, setLectures] = useState<Record<string, Lecture>>({});
    const [isLoading, setIsLoading] = useState(true);

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

     if (isLoading) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
               <Card key={i} className="h-[200px]"><CardContent className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
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
        <div className="space-y-4">
            {notes.map(note => {
                const lecture = lectures[note.lectureId];
                return (
                    <Card key={note.id}>
                        <CardHeader>
                            <CardTitle>
                                <Link href={`/lectures/${lecture?.slug}`} className="hover:underline">
                                    {lecture?.title || 'محاضرة محذوفة'}
                                </Link>
                            </CardTitle>
                             <CardDescription>
                                آخر تحديث: {note.updatedAt ? formatDistanceToNow(note.updatedAt.toDate(), { addSuffix: true, locale: ar }) : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
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
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold font-headline flex items-center gap-3"><ListMusic className="h-9 w-9 animate-icon-draw" />مكتبتي</h1>

            <Tabs defaultValue="history" className="w-full">
              <div className="flex justify-center overflow-x-auto pb-2">
                <TabsList className="h-auto p-1.5 shrink-0">
                  <TabsTrigger value="history" className="px-4 py-2 rounded-full flex items-center gap-2"><History className="h-5 w-5"/>أكمل المشاهدة</TabsTrigger>
                  <TabsTrigger value="favorites" className="px-4 py-2 rounded-full flex items-center gap-2"><Heart className="h-5 w-5"/>المفضلة</TabsTrigger>
                  <TabsTrigger value="reports" className="px-4 py-2 rounded-full flex items-center gap-2"><FileText className="h-5 w-5"/>تقارير</TabsTrigger>
                  <TabsTrigger value="accountability" className="px-4 py-2 rounded-full flex items-center gap-2"><BookCheck className="h-5 w-5"/>محاسبة النفس</TabsTrigger>
                  <TabsTrigger value="playlists" className="px-4 py-2 rounded-full flex items-center gap-2"><ListMusic className="h-5 w-5"/>قوائم التشغيل</TabsTrigger>
                  <TabsTrigger value="following" className="px-4 py-2 rounded-full flex items-center gap-2"><Podcast className="h-5 w-5"/>البرامج المتابعة</TabsTrigger>
                  <TabsTrigger value="challenges" className="px-4 py-2 rounded-full flex items-center gap-2"><Flame className="h-5 w-5"/>تحدياتي</TabsTrigger>
                  <TabsTrigger value="donations" className="px-4 py-2 rounded-full flex items-center gap-2"><HandHeart className="h-5 w-5"/>الدعم</TabsTrigger>
                  <TabsTrigger value="clips" className="px-4 py-2 rounded-full flex items-center gap-2"><Clapperboard className="h-5 w-5"/>مقاطعي</TabsTrigger>
                  <TabsTrigger value="notes" className="px-4 py-2 rounded-full flex items-center gap-2"><Notebook className="h-5 w-5"/>ملاحظاتي</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="history" className="mt-6">
                <ContinueWatchingSection />
              </TabsContent>
              <TabsContent value="favorites" className="mt-6">
                <FavoritesSection />
              </TabsContent>
               <TabsContent value="reports" className="mt-6">
                <ReportsSection userProfile={userProfile} />
              </TabsContent>
               <TabsContent value="accountability" className="mt-6">
                <AccountabilityTracker showHeader={false} redirectToOnAuth='/profile' />
              </TabsContent>
              <TabsContent value="playlists" className="mt-6">
                <PlaylistsSection />
              </TabsContent>
              <TabsContent value="following" className="mt-6">
                <FollowedProgramsSection />
              </TabsContent>
              <TabsContent value="challenges" className="mt-6">
                <UserChallengesSection />
              </TabsContent>
               <TabsContent value="donations" className="mt-6">
                <DonationsSection userProfile={userProfile} />
              </TabsContent>
              <TabsContent value="clips" className="mt-6">
                <SavedClipsSection />
              </TabsContent>
              <TabsContent value="notes" className="mt-6">
                <AllNotesSection />
              </TabsContent>
            </Tabs>
        </div>
    );
}
