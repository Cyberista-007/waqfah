'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  orderBy,
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
  Loader2,
  Heart,
  ListMusic,
  History,
  Clock,
  CheckCircle,
  Plus,
  Flame,
  FileText,
  Podcast,
  Play,
  Notebook,
  HandHeart,
  BookCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Award,
  Medal,
  Trash2,
  Layers,
  Wifi,
  Settings,
} from 'lucide-react';

import {
  useUser,
  useFirestore,
  useDoc,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getOfflineLectures, deleteAudioFromOffline } from '@/lib/offline-audio';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { LectureCard } from '@/components/lecture-card';
import { ProgramCard } from '@/components/program-card';
import { ContinueWatching } from '@/components/continue-listening';
import { DonationTierBadge } from '@/components/DonationTierBadge';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { cn, getVideoIdFromUrl } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/images';
import type {
  Lecture,
  ListenHistoryItem,
  UserProfile,
  Playlist,
  Following,
  Program,
  UserChallenge,
  Challenge,
  LectureNote,
  GamificationBadge,
  UserBadge,
} from '@/lib/types';

const AccountabilityTracker = dynamic(
  () => import('@/components/accountability-tracker').then((mod) => mod.AccountabilityTracker),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-7 w-7 text-primary" />
      </div>
    ),
  }
);

const toDateHelper = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (typeof timestamp.seconds === 'number') return new Date(timestamp.seconds * 1000);
  if (typeof timestamp._seconds === 'number') return new Date(timestamp._seconds * 1000);
  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? null : d;
};

function StatCard({
  title,
  value,
  icon: Icon,
  color = 'text-primary',
  bg = 'bg-primary/10',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-card/80 border border-border shadow-sm flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground truncate">{title}</p>
      </div>
    </div>
  );
}

function OverviewSection({
  userProfile,
  onNavigateTab,
}: {
  userProfile: UserProfile;
  onNavigateTab: (tab: string) => void;
}) {
  const { t } = useTranslation();
  const { siteTimeInSeconds } = useAudioPlayer();

  const totalSeconds = siteTimeInSeconds;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const points = userProfile.points || 0;
  const level = Math.floor(points / 500) + 1;
  const pointsIntoLevel = points % 500;
  const remainingPoints = 500 - pointsIntoLevel;
  const levelProgress = Math.round((pointsIntoLevel / 500) * 100);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('محاضرة مكتملة', 'Completed Lectures')}
          value={userProfile.lecturesCompleted || 0}
          icon={CheckCircle}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatCard
          title={t('وقت التعلم', 'Study Time')}
          value={formattedTime}
          icon={Clock}
          color="text-sky-500"
          bg="bg-sky-500/10"
        />
        <StatCard
          title={t('النقاط', 'Points')}
          value={points}
          icon={Sparkles}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatCard
          title={t('سلاسل مكتملة', 'Completed Series')}
          value={userProfile.seriesCompleted || 0}
          icon={Trophy}
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-emerald-500" />
              <span>{t('محاسبة النفس اليومية', 'Daily Self-Accountability')}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('accountability')}
              className="text-xs font-bold text-primary hover:underline"
            >
              {t('عرض الكل', 'View full log')}
            </button>
          </div>
          <div className="p-5 sm:p-6 rounded-2xl bg-card/80 border border-border shadow-sm">
            <AccountabilityTracker showHeader={false} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-500" />
            <span>{t('المستوى العلمي', 'Learning Level')}</span>
          </h3>
          <div className="p-6 rounded-2xl bg-card/80 border border-border shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center">
              <span className="text-3xl font-black text-amber-500">{level}</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">
                {userProfile.role === 'admin'
                  ? t('مشرف المنصة', 'Platform Admin')
                  : t('طالب علم', 'Student of Knowledge')}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t(
                  `متبقٍ ${remainingPoints} نقطة للوصول للمستوى ${level + 1}`,
                  `${remainingPoints} pts left to reach Level ${level + 1}`
                )}
              </p>
            </div>
            <div className="w-full space-y-1.5">
              <Progress value={levelProgress} className="h-2" />
              <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span>{pointsIntoLevel} / 500</span>
                <span>{levelProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoritesSection() {
  const { t } = useTranslation();
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
        const lectureIds = favoritesSnap.docs.map((d) => d.id);

        if (lectureIds.length > 0) {
          const lecturesData: Lecture[] = [];
          for (let i = 0; i < lectureIds.length; i += 30) {
            const chunk = lectureIds.slice(i, i + 30);
            const lecturesQuery = query(collection(firestore, 'lectures'), where('__name__', 'in', chunk));
            const lecturesSnap = await getDocs(lecturesQuery);
            lecturesData.push(...lecturesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Lecture)));
          }
          setFavoriteLectures(lecturesData);
        } else {
          setFavoriteLectures([]);
        }
      } catch (error: any) {
        console.error('Error fetching favorite lectures:', error);
        if (error.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: `users/${user.uid}/favorites`,
              operation: 'list',
            })
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, [user, firestore]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[240px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return favoriteLectures.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {favoriteLectures.map((lecture, idx) => (
        <LectureCard key={lecture.id} lecture={lecture} index={idx} />
      ))}
    </div>
  ) : (
    <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-3">
      <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto" />
      <p className="text-base font-bold text-foreground">
        {t('لم تقم بإضافة أي محاضرات إلى المفضلة بعد.', 'No favorite lectures yet.')}
      </p>
      <Button asChild variant="outline" className="rounded-xl font-bold">
        <Link href="/lectures">{t('تصفح المحاضرات', 'Browse Lectures')}</Link>
      </Button>
    </div>
  );
}

function PlaylistsSection() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists, isLoading } = useCollection<Playlist>(playlistsPath, {
    orderBy: ['createdAt', 'desc'],
  });

  const handleDelete = () => {
    if (!playlistToDelete || !firestore || !user) return;
    const playlistRef = doc(firestore, 'users', user.uid, 'playlists', playlistToDelete.id);
    deleteDocumentNonBlocking(playlistRef);
    toast({
      variant: 'destructive',
      title: t('تم الحذف بنجاح', 'Deleted successfully'),
      description: `${t('تم حذف قائمة التشغيل', 'Deleted playlist')} "${playlistToDelete.name}".`,
    });
    setPlaylistToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[180px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-end">
          <Button asChild className="rounded-xl font-bold gap-2">
            <Link href="/profile/playlists">
              <Plus className="w-4 h-4" />
              <span>{t('إنشاء أو تعديل قائمة', 'Create / Manage Playlists')}</span>
            </Link>
          </Button>
        </div>

        {playlists && playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="flex flex-col justify-between rounded-2xl border-border bg-card/80">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="font-headline text-lg">
                      <Link href={`/playlists/${playlist.id}?u=${playlist.userId}`} className="hover:text-primary transition-colors">
                        {playlist.name}
                      </Link>
                    </CardTitle>
                    <Button
                      onClick={() => setPlaylistToDelete(playlist)}
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8 rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {playlist.description && (
                    <CardDescription className="line-clamp-2">{playlist.description}</CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="flex justify-between items-center pt-3 border-t border-border/50">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Play className="h-3.5 w-3.5 text-primary" />
                    <span>{playlist.lectureIds?.length || 0} {t('محاضرة', 'Lectures')}</span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="rounded-xl font-bold">
                    <Link href={`/playlists/${playlist.id}?u=${playlist.userId}`}>
                      {t('عرض', 'Open')}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-3">
            <ListMusic className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-base font-bold text-foreground">
              {t('لم تقم بإنشاء أي قوائم تشغيل بعد.', 'No playlists created yet.')}
            </p>
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={!!playlistToDelete}
        onClose={() => setPlaylistToDelete(null)}
        onConfirm={handleDelete}
        title={t('حذف قائمة التشغيل', 'Delete Playlist')}
        description={`${t('هل أنت متأكد من حذف قائمة التشغيل', 'Delete playlist')} "${playlistToDelete?.name}"؟`}
      />
    </>
  );
}

function FollowedProgramsSection() {
  const { t } = useTranslation();
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
        const programIds = following.map((f) => f.programId);
        const programsData: Program[] = [];
        for (let i = 0; i < programIds.length; i += 30) {
          const chunk = programIds.slice(i, i + 30);
          const programsQuery = query(collection(firestore, 'programs'), where('__name__', 'in', chunk));
          const programsSnap = await getDocs(programsQuery);
          programsData.push(...programsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Program)));
        }
        setFollowedPrograms(programsData);
      } catch (error: any) {
        console.error('Error fetching followed programs:', error);
        if (error.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({ path: 'programs', operation: 'list' })
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [following, followingLoading, firestore]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[240px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return followedPrograms.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {followedPrograms.map((program, index) => (
        <ProgramCard key={program.id} program={program} index={index} />
      ))}
    </div>
  ) : (
    <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-3">
      <Podcast className="w-10 h-10 text-muted-foreground/40 mx-auto" />
      <p className="text-base font-bold text-foreground">
        {t('لم تقم بمتابعة أي قنوات أو برامج بعد.', 'Not following any channels yet.')}
      </p>
      <Button asChild variant="outline" className="rounded-xl font-bold">
        <Link href="/programs">{t('تصفح البرامج والقنوات', 'Browse Channels')}</Link>
      </Button>
    </div>
  );
}

function ReportsSection({ userProfile, user }: { userProfile: UserProfile; user: User }) {
  const { t } = useTranslation();
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
        const [favoritesSnap, playlistsSnap, followingSnap, notesSnap, challengesSnap, badgesSnap] =
          await Promise.all([
            getDocs(collection(firestore, 'users', user.uid, 'favorites')),
            getDocs(collection(firestore, 'users', user.uid, 'playlists')),
            getDocs(collection(firestore, 'users', user.uid, 'following')),
            getDocs(collection(firestore, 'users', user.uid, 'notes')),
            getDocs(
              query(
                collection(firestore, 'users', user.uid, 'user_challenges'),
                where('status', '==', 'completed')
              )
            ),
            getDocs(collection(firestore, 'users', user.uid, 'user_badges')),
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
        console.error('Error fetching extra stats:', e);
      } finally {
        setIsLoadingExtra(false);
      }
    };
    fetchCounts();
  }, [user, firestore]);

  const hours = Math.floor(siteTimeInSeconds / 3600);
  const minutes = Math.floor((siteTimeInSeconds % 3600) / 60);
  const seconds = Math.floor(siteTimeInSeconds % 60);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title={t('محاضرة مكتملة', 'Completed Lectures')} value={userProfile?.lecturesCompleted || 0} icon={CheckCircle} />
      <StatCard title={t('إجمالي الوقت في الموقع', 'Total Study Time')} value={formattedTime} icon={Clock} />
      <StatCard title={t('النقاط المكتسبة', 'Earned Points')} value={userProfile?.points || 0} icon={Sparkles} />
      <StatCard title={t('السلاسل المكتملة', 'Completed Series')} value={userProfile?.seriesCompleted || 0} icon={Trophy} />
      <StatCard title={t('المحاضرات المفضلة', 'Favorites')} value={isLoadingExtra ? '…' : extraStats.favorites} icon={Heart} />
      <StatCard title={t('قوائم التشغيل', 'Playlists')} value={isLoadingExtra ? '…' : extraStats.playlists} icon={ListMusic} />
      <StatCard title={t('القنوات المتابعة', 'Followed Channels')} value={isLoadingExtra ? '…' : extraStats.following} icon={UserPlus} />
      <StatCard title={t('الملاحظات المدونة', 'Saved Notes')} value={isLoadingExtra ? '…' : extraStats.notes} icon={Notebook} />
      <StatCard title={t('التحديات المكتملة', 'Completed Challenges')} value={isLoadingExtra ? '…' : extraStats.completedChallenges} icon={Award} />
      <StatCard title={t('الأوسمة المكتسبة', 'Earned Badges')} value={isLoadingExtra ? '…' : extraStats.userBadges} icon={Medal} />
      {(userProfile?.totalDonated || 0) > 0 && (
        <StatCard
          title={t('إجمالي التبرعات', 'Total Donated')}
          value={`${new Intl.NumberFormat('ar-EG').format(userProfile.totalDonated || 0)} EGP`}
          icon={HandHeart}
        />
      )}
    </div>
  );
}

function UserChallengesSection() {
  const { t } = useTranslation();
  const { user } = useUser();
  const userChallengesPath = user ? `users/${user.uid}/user_challenges` : null;
  const { data: userChallengesData, isLoading: userChallengesLoading } = useCollection<UserChallenge>(
    userChallengesPath,
    { orderBy: ['startedAt', 'desc'] }
  );
  const { data: allChallenges, isLoading: allChallengesLoading } = useCollection<Challenge>('challenges');

  const isLoading = userChallengesLoading || allChallengesLoading;
  const userChallenges =
    !isLoading && userChallengesData && allChallenges
      ? userChallengesData
          .map((uc) => ({ ...uc, challengeDetails: allChallenges.find((c) => c.id === uc.challengeId) }))
          .filter((uc): uc is UserChallenge & { challengeDetails: Challenge } => !!uc.challengeDetails)
      : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[180px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (userChallenges.length === 0) {
    return (
      <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-3">
        <Flame className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <p className="text-base font-bold text-foreground">
          {t('لم تشترك في أي تحديات بعد.', 'No active challenges yet.')}
        </p>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link href="/challenges">{t('تصفح التحديات', 'Browse Challenges')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {userChallenges.map(({ id, status, challengeDetails }) => (
        <Card key={id} className="flex flex-col justify-between rounded-2xl border-border bg-card/80">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{challengeDetails.title}</CardTitle>
              <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                {status === 'completed' ? t('مكتمل', 'Completed') : t('قيد التقدم', 'In Progress')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground line-clamp-2">{challengeDetails.description}</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full rounded-xl font-bold">
              <Link href={`/series/${challengeDetails.seriesId}`}>
                {t('الذهاب إلى السلسلة', 'Go to Series')}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function AllNotesSection() {
  const { t, lang } = useTranslation();
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
    }

    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const notesQuery = query(collection(firestore, 'users', user.uid, 'notes'), orderBy('updatedAt', 'desc'));
        const notesSnap = await getDocs(notesQuery);
        const userNotes = notesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as LectureNote));
        setNotes(userNotes);

        if (userNotes.length > 0) {
          const lectureIds = [...new Set(userNotes.map((n) => n.lectureId))];
          const lecturesData: Record<string, Lecture> = {};

          for (let i = 0; i < lectureIds.length; i += 30) {
            const chunk = lectureIds.slice(i, i + 30);
            const lecturesQuery = query(collection(firestore, 'lectures'), where('__name__', 'in', chunk));
            const lecturesSnap = await getDocs(lecturesQuery);
            lecturesSnap.forEach((d) => {
              lecturesData[d.id] = { id: d.id, ...d.data() } as Lecture;
            });
          }
          setLectures(lecturesData);
        }
      } catch (error: any) {
        console.error('Error fetching notes:', error);
        if (error.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({ path: `users/${user.uid}/notes`, operation: 'list' })
          );
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
    setNotes((prev) => prev.filter((note) => note.id !== noteToDelete.id));
    toast({ variant: 'destructive', title: t('تم حذف الملاحظة', 'Note deleted') });
    setNoteToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-[120px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-2">
        <Notebook className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <p className="text-base font-bold text-foreground">{t('لم تكتب أي ملاحظات بعد.', 'No notes saved yet.')}</p>
        <p className="text-xs text-muted-foreground">
          {t('يمكنك كتابة ملاحظات خاصة من صفحة أي محاضرة.', 'Write personal notes from any lecture page.')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {notes.map((note) => {
          const lecture = lectures[note.lectureId];
          return (
            <Card key={note.id} className="relative group rounded-2xl border-border bg-card/80">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 left-3 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setNoteToDelete(note)}
                aria-label={t('حذف الملاحظة', 'Delete note')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardHeader>
                <CardTitle className="text-base">
                  <Link href={`/lectures/${lecture?.slug || '#'}`} className="hover:text-primary transition-colors">
                    {lecture?.title || t('محاضرة غير متاحة', 'Unavailable lecture')}
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs">
                  {note.updatedAt
                    ? formatDistanceToNow(toDateHelper(note.updatedAt) || new Date(), {
                        addSuffix: true,
                        locale: lang === 'ar' ? ar : enUS,
                      })
                    : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DeleteConfirmationDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteNote}
        title={t('حذف الملاحظة', 'Delete Note')}
        description={t('هل أنت متأكد من حذف هذه الملاحظة نهائياً؟', 'Permanently delete this note?')}
      />
    </>
  );
}

function BadgesSection() {
  const { t, lang } = useTranslation();
  const { user } = useUser();
  const { data: allBadges, isLoading: loadingAll } = useCollection<GamificationBadge>('gamification_badges');
  const { data: userBadges, isLoading: loadingUser } = useCollection<UserBadge>(
    user ? `users/${user.uid}/user_badges` : null
  );

  if (loadingAll || loadingUser) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-muted/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  const earnedIds = userBadges ? userBadges.map((ub) => ub.badgeId) : [];
  const enrichedBadges = (allBadges || [])
    .map((badge) => {
      const userBadge = userBadges?.find((ub) => ub.badgeId === badge.id);
      return { ...badge, isEarned: earnedIds.includes(badge.id), earnedAt: userBadge?.earnedAt };
    })
    .sort((a, b) => {
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      return a.threshold - b.threshold;
    });

  if (enrichedBadges.length === 0) {
    return (
      <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-2">
        <Medal className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <p className="text-base font-bold text-foreground">{t('لا توجد أوسمة متاحة حالياً.', 'No badges available yet.')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {enrichedBadges.map((badge) => (
        <div
          key={badge.id}
          className={cn(
            'p-5 rounded-2xl border flex flex-col items-center text-center space-y-3 transition-all',
            badge.isEarned
              ? 'bg-primary/5 border-primary/30 shadow-sm'
              : 'bg-card/50 border-border opacity-60'
          )}
        >
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              badge.isEarned ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            <Medal className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-foreground">{badge.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
          </div>
          <div className="pt-2 border-t border-border/50 w-full text-[11px] font-semibold">
            {badge.isEarned && badge.earnedAt ? (
              <span className="text-primary">
                {formatDistanceToNow(toDateHelper(badge.earnedAt) || new Date(), {
                  addSuffix: true,
                  locale: lang === 'ar' ? ar : enUS,
                })}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {badge.threshold} {badge.metric === 'points' ? t('نقطة', 'pts') : t('وحدة', 'units')}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonationsSection({ userProfile }: { userProfile: UserProfile }) {
  const { t } = useTranslation();

  if (!userProfile.totalDonated || userProfile.totalDonated === 0) {
    return (
      <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-3">
        <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <p className="text-base font-bold text-foreground">{t('لم تقم بأي تبرعات بعد.', 'No donations recorded yet.')}</p>
        <Button asChild className="rounded-xl font-bold">
          <Link href="/donations">{t('ادعم المنصة', 'Support Platform')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="max-w-xl mx-auto rounded-2xl border-border bg-card/80">
      <CardHeader>
        <CardTitle>{t('ملخص مساهماتك', 'Contribution Summary')}</CardTitle>
        <CardDescription>{t('شكراً لدعمك الكريم للمشروع.', 'Thank you for supporting Waqfah.')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <span className="text-sm text-muted-foreground">{t('إجمالي المساهمات', 'Total Donated')}</span>
          <span className="font-bold text-lg text-foreground">
            {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(
              userProfile.totalDonated
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('مستوى الدعم', 'Support Tier')}</span>
          {userProfile.donationTier ? (
            <DonationTierBadge tier={userProfile.donationTier} />
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Switch id="show-donations" disabled />
          <Label htmlFor="show-donations" className="text-xs text-muted-foreground">
            {t('إظهار ملخص التبرعات للعامة في ملفي الشخصي (قيد التطوير)', 'Show donations publicly (coming soon)')}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

function OfflineSection() {
  const { t } = useTranslation();
  const [offlineLectures, setOfflineLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setOfflineLectures(getOfflineLectures());
    setIsLoading(false);
  }, []);

  const handleDelete = async (lecture: Lecture) => {
    try {
      await deleteAudioFromOffline(lecture.id, lecture.audioSrc);
      setOfflineLectures((prev) => prev.filter((l) => l.id !== lecture.id));
      toast({
        title: t('تم الحذف بنجاح', 'Removed'),
        description: `${t('تمت إزالة', 'Removed')} "${lecture.title}"`,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('فشل الحذف', 'Failed'), description: error.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Wifi className="w-5 h-5 text-emerald-500" />
          <span>{t('المحاضرات المحفوظة دون اتصال', 'Offline Saved Lectures')}</span>
        </h3>
        <span className="text-xs text-muted-foreground">
          {t('التخزين محلي بالكامل على هذا المتصفح.', 'Stored locally on this browser.')}
        </span>
      </div>

      {offlineLectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offlineLectures.map((lecture) => {
            const videoId = getVideoIdFromUrl(lecture.youtubeUrl);
            const placeholder = getPlaceholderImage(lecture.imageId);
            const imageUrl = videoId
              ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
              : placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/400/225`;

            return (
              <div
                key={lecture.id}
                className="p-4 rounded-2xl bg-card/80 border border-border flex flex-col justify-between gap-4 shadow-sm"
              >
                <div className="flex gap-3.5">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-border">
                    <NextImage src={imageUrl} alt={lecture.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-bold text-sm text-foreground line-clamp-1">
                      <Link href={`/lectures/${lecture.slug}`} className="hover:text-primary transition-colors">
                        {lecture.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {lecture.seriesTitle || t('محاضرة منفردة', 'Standalone Lecture')}
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      {lecture.duration
                        ? `${Math.round(lecture.duration / 60)} ${t('دقيقة', 'min')}`
                        : t('المدة غير معروفة', 'Unknown duration')}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <Button asChild size="sm" className="rounded-xl font-bold gap-1.5">
                    <Link href={`/lectures/${lecture.slug}`}>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t('استماع الآن', 'Play Now')}</span>
                    </Link>
                  </Button>
                  <Button
                    onClick={() => handleDelete(lecture)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 rounded-xl gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('حذف', 'Remove')}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-3">
          <Wifi className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <p className="text-base font-bold text-foreground">
            {t('لا توجد محاضرات محفوظة دون اتصال بعد.', 'No offline lectures saved yet.')}
          </p>
          <Button asChild variant="outline" className="rounded-xl font-bold">
            <Link href="/lectures">{t('تصفح المحاضرات', 'Browse Lectures')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect_to=/profile');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isProfileLoading || !user || !userProfile) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <ProfileContent user={user} userProfile={userProfile} />
    </Suspense>
  );
}

function ProfileContent({ user, userProfile }: { user: User; userProfile: UserProfile }) {
  const { t, isRtl } = useTranslation();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: history } = useCollection<ListenHistoryItem>(`users/${user.uid}/listenHistory`);
  const { data: favorites } = useCollection<{ id: string }>(`users/${user.uid}/favorites`);
  const { data: playlists } = useCollection<Playlist>(`users/${user.uid}/playlists`);
  const { data: following } = useCollection<Following>(`users/${user.uid}/following`);
  const { data: userChallenges } = useCollection<UserChallenge>(`users/${user.uid}/user_challenges`);
  const { data: notes } = useCollection<LectureNote>(`users/${user.uid}/notes`);

  const [offlineCount, setOfflineCount] = useState(0);
  useEffect(() => {
    setOfflineCount(getOfflineLectures().length);
  }, []);

  const tabs = [
    { id: 'overview', label: t('نظرة عامة', 'Overview'), icon: Layers, count: null },
    { id: 'history', label: t('أكمل المشاهدة', 'History'), icon: History, count: history?.length || 0 },
    { id: 'favorites', label: t('المفضلة', 'Favorites'), icon: Heart, count: favorites?.length || 0 },
    { id: 'accountability', label: t('محاسبة النفس', 'Accountability'), icon: BookCheck, count: null },
    { id: 'offline', label: t('التحميلات', 'Offline'), icon: Wifi, count: offlineCount },
    { id: 'playlists', label: t('قوائم التشغيل', 'Playlists'), icon: ListMusic, count: playlists?.length || 0 },
    { id: 'badges', label: t('الأوسمة', 'Badges'), icon: Medal, count: null },
    { id: 'following', label: t('المتابَعون', 'Following'), icon: Podcast, count: following?.length || 0 },
    { id: 'challenges', label: t('التحديات', 'Challenges'), icon: Flame, count: userChallenges?.length || 0 },
    { id: 'notes', label: t('ملاحظاتي', 'Notes'), icon: Notebook, count: notes?.length || 0 },
    { id: 'reports', label: t('إحصائيات', 'Reports'), icon: FileText, count: null },
    { id: 'donations', label: t('الدعم', 'Support'), icon: HandHeart, count: null },
  ];

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* Clean Profile Header */}
        <header className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-primary/30 bg-muted overflow-hidden flex items-center justify-center shrink-0">
              {userProfile.photoURL ? (
                <NextImage src={userProfile.photoURL} alt={userProfile.name} fill className="object-cover" />
              ) : (
                <span className="text-3xl font-black text-primary">{userProfile.name?.charAt(0)}</span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-headline text-foreground">
                  {userProfile.name}
                </h1>
                <Badge variant="secondary" className="text-xs font-bold">
                  {userProfile.role === 'admin' ? t('مدير النظام', 'Admin') : t('طالب علم', 'Learner')}
                </Badge>
                {userProfile.donationTier && <DonationTierBadge tier={userProfile.donationTier} />}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-amber-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{userProfile.points || 0} {t('نقطة', 'pts')}</span>
                </span>
                {userProfile.bio && <span>• {userProfile.bio}</span>}
              </div>
            </div>
          </div>

          <Button asChild variant="outline" className="h-10 px-4 rounded-xl font-bold gap-2 self-center sm:self-auto">
            <Link href="/settings">
              <Settings className="w-4 h-4" />
              <span>{t('الإعدادات', 'Settings')}</span>
            </Link>
          </Button>
        </header>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="overflow-x-auto no-scrollbar pb-1">
            <TabsList className="inline-flex h-auto p-1.5 bg-muted/60 border border-border rounded-2xl gap-1 w-max">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/20">
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="m-0">
            <OverviewSection userProfile={userProfile} onNavigateTab={setActiveTab} />
          </TabsContent>
          <TabsContent value="history" className="m-0">
            <ContinueWatching isProfilePage={true} />
          </TabsContent>
          <TabsContent value="favorites" className="m-0">
            <FavoritesSection />
          </TabsContent>
          <TabsContent value="reports" className="m-0">
            <ReportsSection userProfile={userProfile} user={user} />
          </TabsContent>
          <TabsContent value="accountability" className="m-0">
            <AccountabilityTracker showHeader={false} />
          </TabsContent>
          <TabsContent value="offline" className="m-0">
            <OfflineSection />
          </TabsContent>
          <TabsContent value="playlists" className="m-0">
            <PlaylistsSection />
          </TabsContent>
          <TabsContent value="badges" className="m-0">
            <BadgesSection />
          </TabsContent>
          <TabsContent value="following" className="m-0">
            <FollowedProgramsSection />
          </TabsContent>
          <TabsContent value="challenges" className="m-0">
            <UserChallengesSection />
          </TabsContent>
          <TabsContent value="donations" className="m-0">
            <DonationsSection userProfile={userProfile} />
          </TabsContent>
          <TabsContent value="notes" className="m-0">
            <AllNotesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
