'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Award, Loader2, Sparkles, Medal, User, Crown, Flame, ChevronLeft } from 'lucide-react';
import { useCollection, useUser } from '@/firebase';
import type { UserProfile, GamificationBadge, UserBadge } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBadgeManager } from '@/hooks/useBadgeManager';
import { iconMap } from '@/lib/icon-map';
import { cn, getInitials } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

function BadgeItem({ badge, earned }: { badge: GamificationBadge; earned: boolean }) {
  const { t } = useTranslation();
  const Icon = iconMap[badge.icon] || Sparkles;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex flex-col items-center justify-center text-center p-5 rounded-2xl border transition-all',
              earned
                ? 'border-amber-500/35 bg-amber-500/10 shadow-sm'
                : 'border-border bg-card/60 opacity-60 hover:opacity-100'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center h-14 w-14 rounded-2xl mb-3 shadow-sm',
                earned ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-7 w-7" />
            </div>
            <h4 className="font-bold text-sm text-foreground line-clamp-1">{badge.title}</h4>
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
              +{badge.points} {t('نقطة', 'pts')}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 rounded-xl">
          <p className="text-xs font-medium leading-relaxed">{badge.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function LeaderboardPage() {
  const { t, isRtl } = useTranslation();
  const { user } = useUser();
  useBadgeManager();

  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>('users', {
    orderBy: ['points', 'desc'],
    limit: 100,
  });
  const { data: allBadges, isLoading: allBadgesLoading } = useCollection<GamificationBadge>(
    'gamification_badges',
    { orderBy: ['points', 'asc'] }
  );
  const userBadgesPath = user ? `users/${user.uid}/user_badges` : null;
  const { data: earnedBadges, isLoading: userBadgesLoading } = useCollection<UserBadge>(userBadgesPath);

  const isLoading = usersLoading || allBadgesLoading || (user && userBadgesLoading);

  const { top3, restOfUsers } = useMemo(() => {
    if (!users) return { top3: [], restOfUsers: [] };
    return {
      top3: users.slice(0, 3),
      restOfUsers: users.slice(3),
    };
  }, [users]);

  const userRank = useMemo(() => {
    if (!user || !users) return null;
    const rank = users.findIndex((u) => u.id === user.uid);
    return rank !== -1 ? rank + 1 : null;
  }, [user, users]);

  const earnedBadgeIds = useMemo(() => new Set(earnedBadges?.map((b) => b.id) || []), [earnedBadges]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-10 max-w-5xl">
        {/* Clean Header */}
        <header className="text-center space-y-3 pb-6 border-b border-border/60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('لوحة الشرف والمنافسة', 'Hall of Honor')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
            {t('لوحة', 'Points')} <span className="text-primary">{t('الصدارة', 'Leaderboard')}</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {t(
              '«وفي ذلك فليتنافس المتنافسون» — تسابق في طلب العلم والعمل الصالح واجمع الأوسمة.',
              'Compete in learning, consistency, and collecting scientific achievement badges.'
            )}
          </p>
        </header>

        {/* Podium Section */}
        {top3.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Second Place */}
            {top3[1] && (
              <div className="order-2 md:order-1 bg-card/80 border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
                <div className="relative mb-3">
                  <Avatar className="w-16 h-16 border-2 border-slate-400">
                    <AvatarImage src={top3[1].photoURL} />
                    <AvatarFallback className="font-bold">{getInitials(top3[1].name)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-500 text-white text-xs font-black flex items-center justify-center shadow">
                    2
                  </span>
                </div>
                <p className="font-bold text-base text-foreground line-clamp-1">{top3[1].name}</p>
                <p className="text-sm font-bold text-muted-foreground mt-1">
                  {top3[1].points || 0} {t('نقطة', 'pts')}
                </p>
              </div>
            )}

            {/* First Place */}
            {top3[0] && (
              <div className="order-1 md:order-2 bg-amber-500/10 border border-amber-500/30 rounded-3xl p-7 flex flex-col items-center text-center shadow-sm">
                <Crown className="w-8 h-8 text-amber-500 fill-amber-500 mb-2" />
                <div className="relative mb-3">
                  <Avatar className="w-20 h-20 border-4 border-amber-500">
                    <AvatarImage src={top3[0].photoURL} />
                    <AvatarFallback className="font-black text-xl text-amber-500">
                      {getInitials(top3[0].name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 text-[10px] font-black px-3 py-0.5 rounded-full shadow">
                    #1
                  </span>
                </div>
                <p className="font-black text-lg text-foreground line-clamp-1">{top3[0].name}</p>
                <p className="text-sm font-black text-amber-500 mt-1 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span>{top3[0].points || 0} {t('نقطة', 'pts')}</span>
                </p>
              </div>
            )}

            {/* Third Place */}
            {top3[2] && (
              <div className="order-3 bg-card/80 border border-border rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
                <div className="relative mb-3">
                  <Avatar className="w-16 h-16 border-2 border-amber-700/70">
                    <AvatarImage src={top3[2].photoURL} />
                    <AvatarFallback className="font-bold">{getInitials(top3[2].name)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center shadow">
                    3
                  </span>
                </div>
                <p className="font-bold text-base text-foreground line-clamp-1">{top3[2].name}</p>
                <p className="text-sm font-bold text-amber-600 mt-1">
                  {top3[2].points || 0} {t('نقطة', 'pts')}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex justify-center">
            <TabsList className="h-11 p-1 bg-muted/60 border border-border rounded-xl inline-flex gap-1">
              <TabsTrigger value="leaderboard" className="px-5 rounded-lg text-xs sm:text-sm font-bold gap-2">
                <Medal className="h-4 w-4" />
                <span>{t('المتصدرون', 'Rankings')}</span>
              </TabsTrigger>
              <TabsTrigger value="all-badges" className="px-5 rounded-lg text-xs sm:text-sm font-bold gap-2">
                <Award className="h-4 w-4" />
                <span>{t('الأوسمة', 'All Badges')}</span>
              </TabsTrigger>
              <TabsTrigger value="my-badges" className="px-5 rounded-lg text-xs sm:text-sm font-bold gap-2">
                <Sparkles className="h-4 w-4" />
                <span>{t('أوسمتي', 'My Badges')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="leaderboard" className="m-0">
            <div className="bg-card/80 border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-5 py-3.5 text-right text-xs font-bold text-muted-foreground">
                        {t('الترتيب', 'Rank')}
                      </th>
                      <th className="px-5 py-3.5 text-right text-xs font-bold text-muted-foreground">
                        {t('المستخدم', 'User')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-bold text-muted-foreground">
                        {t('النقاط', 'Points')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {restOfUsers?.map((u, index) => {
                      const actualRank = index + 4;
                      const isMe = user && u.id === user.uid;
                      return (
                        <tr
                          key={u.id}
                          className={cn('hover:bg-accent/40 transition-colors', isMe && 'bg-primary/5')}
                        >
                          <td className="px-5 py-3.5 font-bold text-sm text-muted-foreground tabular-nums">
                            #{actualRank}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border border-border">
                                <AvatarImage src={u.photoURL} alt={u.name} />
                                <AvatarFallback className="text-xs font-bold">{getInitials(u.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-sm text-foreground">{u.name}</p>
                                {isMe && (
                                  <span className="text-[11px] font-bold text-primary">
                                    {t('أنت', 'You')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-left">
                            <div className="inline-flex items-center gap-1.5 font-bold text-sm text-foreground tabular-nums">
                              <span>{u.points || 0}</span>
                              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {user && userRank && (
                <div className="p-5 bg-primary/10 border-t border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground">{t('ترتيبك الحالي', 'Your Rank')}</p>
                    <h4 className="text-2xl font-black text-foreground">#{userRank}</h4>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all-badges" className="m-0 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-foreground">{t('متجر الأوسمة', 'Available Badges')}</h2>
              <p className="text-xs text-muted-foreground">
                {t('أكمل المهام المعرفية لتحظى بهذه الأوسمة في ملفك الشخصي.', 'Complete study milestones to unlock these badges.')}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allBadges?.map((badge) => (
                <BadgeItem key={badge.id} badge={badge} earned={earnedBadgeIds.has(badge.id)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-badges" className="m-0">
            <div className="bg-card/80 border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
              {earnedBadges && earnedBadges.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">{t('إنجازاتك', 'Your Achievements')}</h3>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
                      {earnedBadges.length} {t('وسام مكتسب', 'Earned')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {allBadges
                      ?.filter((b) => earnedBadgeIds.has(b.id))
                      .map((badge) => (
                        <BadgeItem key={badge.id} badge={badge} earned={true} />
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-14 space-y-4">
                  <Award className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-foreground">
                      {t('لم تحصل على أي أوسمة بعد', 'No badges earned yet')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('ابدأ الاستماع للمحاضرات وإتمام السلاسل لتحصل على أول أوسمتك!', 'Start listening to lectures to earn your first badge.')}
                    </p>
                  </div>
                  <Button asChild className="rounded-xl font-bold gap-2">
                    <Link href="/lectures">
                      <span>{t('ابدأ الرحلة الآن', 'Start Learning')}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
