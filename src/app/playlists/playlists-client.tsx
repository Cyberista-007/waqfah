'use client';

import type { Playlist, UserProfile } from '@/lib/types';
import Link from 'next/link';
import {
  ListMusic,
  Play,
  Lock,
  Globe,
  Sparkles,
  Share2,
  ArrowLeft,
  Plus,
  Search,
  Library,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, normalizeArabic, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { CinematicAppLoader } from '@/components/skeletons';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

type WithId<T> = T & { id: string };

function PlaylistCard({
  playlist,
  userProfile,
  isMine = false,
}: {
  playlist: Playlist;
  userProfile?: UserProfile;
  isMine?: boolean;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/playlists/${playlist.id}?u=${playlist.userId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: playlist.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: t('تم نسخ رابط القائمة!', 'Playlist link copied!') });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: t('تم نسخ رابط القائمة!', 'Playlist link copied!') });
      } catch {}
    }
  };

  return (
    <div
      className={cn(
        'group h-full flex flex-col rounded-2xl border bg-card/80 backdrop-blur-xl p-5 space-y-4 shadow-sm hover:border-primary/40 hover:-translate-y-1 transition-all duration-300',
        isMine ? 'border-primary/30' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <ListMusic className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <Badge variant="secondary" className="text-[11px] font-bold">
            {playlist.lectureIds?.length || 0} {t('مادة', 'Items')}
          </Badge>
          {isMine && (
            <Badge
              variant="outline"
              className={cn(
                'text-[11px] font-bold gap-1',
                playlist.isPublic ? 'text-emerald-500 border-emerald-500/30' : 'text-muted-foreground'
              )}
            >
              {playlist.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{playlist.isPublic ? t('عامة', 'Public') : t('خاصة', 'Private')}</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-1.5 flex-1">
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {playlist.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {playlist.description || t('لا يوجد وصف متاح لهذه القائمة.', 'No description available.')}
        </p>
      </div>

      {userProfile && (
        <div className="flex items-center gap-2.5 pt-3 border-t border-border/60">
          <Avatar className="h-7 w-7 border border-border">
            <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
            <AvatarFallback className="text-[10px] font-bold">
              {getInitials(userProfile.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-muted-foreground truncate">
            {userProfile.name}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button asChild className="flex-1 h-10 rounded-xl font-bold text-xs gap-2">
          <Link href={`/playlists/${playlist.id}?u=${playlist.userId}`}>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t('عرض وتشغيل', 'Open Playlist')}</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          className="h-10 w-10 rounded-xl shrink-0"
          title={t('مشاركة', 'Share')}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function PublicPlaylists({ initialPublicPlaylists }: { initialPublicPlaylists: Playlist[] }) {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const userIds = useMemo(() => {
    if (!initialPublicPlaylists) return [];
    return [...new Set(initialPublicPlaylists.map((p) => p.userId).filter(Boolean))];
  }, [initialPublicPlaylists]);

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
          usersData.push(...usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WithId<UserProfile>)));
        }
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching user profiles for playlists:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [firestore, userIdsJson, userIds]);

  const playlistsWithUsers = useMemo(() => {
    const userMap = new Map(users.map((u) => [u.id, u]));
    let filtered = (initialPublicPlaylists || []).map((p) => ({
      ...p,
      userProfile: userMap.get(p.userId),
    }));

    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery.toLowerCase());
      filtered = filtered.filter(
        (p) =>
          normalizeArabic(p.name.toLowerCase()).includes(q) ||
          (p.description && normalizeArabic(p.description.toLowerCase()).includes(q)) ||
          (p.userProfile && normalizeArabic(p.userProfile.name.toLowerCase()).includes(q))
      );
    }

    return filtered.sort((a, b) => {
      const timeA = a.createdAt
        ? typeof (a.createdAt as any).toMillis === 'function'
          ? (a.createdAt as any).toMillis()
          : new Date(a.createdAt as string).getTime() || 0
        : 0;
      const timeB = b.createdAt
        ? typeof (b.createdAt as any).toMillis === 'function'
          ? (b.createdAt as any).toMillis()
          : new Date(b.createdAt as string).getTime() || 0
        : 0;
      return timeB - timeA;
    });
  }, [initialPublicPlaylists, users, searchQuery]);

  if (usersLoading && initialPublicPlaylists.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[240px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {initialPublicPlaylists && initialPublicPlaylists.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ابحث في القوائم العامة أو باسم المنسق...', 'Search public playlists...')}
            className="pr-10 pl-9 h-11 bg-card border-border rounded-xl text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {playlistsWithUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlistsWithUsers.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} userProfile={playlist.userProfile} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 bg-card/50 border border-dashed border-border rounded-3xl">
          <Globe className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">
            {t('لا توجد قوائم تشغيل مطابقة', 'No matching playlists found')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? t('لم نعثر على قوائم عامة تطابق بحثك الحالي.', 'No public playlists match your query.')
              : t('كن أول من يشارك قائمة تشغيل عامة لينتفع بها الآخرون.', 'Be the first to share a public playlist.')}
          </p>
        </div>
      )}
    </div>
  );
}

function MyPlaylists() {
  const { t } = useTranslation();
  const { user } = useUser();
  const myPlaylistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: myPlaylists, isLoading } = useCollection<Playlist>(myPlaylistsPath, {
    orderBy: ['createdAt', 'desc'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[240px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 p-5 rounded-2xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{t('مكتبتك الخاصة', 'Your Library')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('القوائم التي قمت بإنشائها وتنسيقها', 'Playlists you created and organized')}
            </p>
          </div>
        </div>
        <Button asChild className="rounded-xl h-10 px-5 font-bold gap-2">
          <Link href="/profile/playlists">
            <Plus className="w-4 h-4" />
            <span>{t('إدارة وإضافة قوائم', 'Manage Playlists')}</span>
          </Link>
        </Button>
      </div>

      {myPlaylists && myPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {myPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} isMine />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 bg-card/50 border border-dashed border-border rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto text-primary">
            <Library className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">{t('لم تنشئ أي قائمة بعد', 'No playlists created yet')}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t(
                'نظّم محاضراتك المفضلة في قوائم مخصصة ليسهل عليك الوصول إليها ومراجعتها.',
                'Organize your favorite lectures into custom playlists.'
              )}
            </p>
          </div>
          <Button asChild className="rounded-xl h-10 px-6 font-bold">
            <Link href="/profile/playlists">{t('أنشئ قائمتك الأولى', 'Create First Playlist')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export function PlaylistsClient({ initialPublicPlaylists }: { initialPublicPlaylists: Playlist[] }) {
  const { t, isRtl } = useTranslation();
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <CinematicAppLoader />;
  }

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* Clean Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('المكتبة الصوتية المنسقة', 'Curated Audio Playlists')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('قوائم', 'Audio')} <span className="text-primary">{t('التشغيل', 'Playlists')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'مجموعات مختارة ومنسقة من المحاضرات والدروس لتسهيل المراجعة والتعلّم.',
                'Selected collections of lectures organized for easier study and listening.'
              )}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold shadow-sm self-start md:self-auto">
            <Globe className="w-4 h-4 text-primary" />
            <span>{initialPublicPlaylists?.length || 0} {t('قائمة عامة', 'Public Playlists')}</span>
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="public" className="w-full space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          <TabsList className="inline-flex h-11 p-1 bg-muted/60 border border-border rounded-xl">
            <TabsTrigger value="public" className="rounded-lg px-5 text-xs sm:text-sm font-bold gap-2">
              <Globe className="w-4 h-4" />
              <span>{t('القوائم العامة', 'Public Playlists')}</span>
            </TabsTrigger>
            <TabsTrigger value="mine" className="rounded-lg px-5 text-xs sm:text-sm font-bold gap-2">
              <Lock className="w-4 h-4" />
              <span>{t('قوائمي الخاصة', 'My Playlists')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="outline-none m-0">
            <PublicPlaylists initialPublicPlaylists={initialPublicPlaylists} />
          </TabsContent>

          <TabsContent value="mine" className="outline-none m-0">
            {user ? (
              <MyPlaylists />
            ) : (
              <div className="py-20 text-center space-y-4 bg-card/50 border border-dashed border-border rounded-3xl max-w-2xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {t('سجّل الدخول لإدارة قوائمك', 'Sign in to view your playlists')}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {t(
                      'سجل الدخول لإنشاء قوائمك الخاصة وحفظ المحاضرات المفضلة لديك.',
                      'Sign in to create custom playlists and save favorite lectures.'
                    )}
                  </p>
                </div>
                <Button asChild className="rounded-xl h-10 px-6 font-bold gap-2">
                  <Link href="/auth/login?redirect_to=/playlists">
                    <span>{t('تسجيل الدخول', 'Sign In')}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
