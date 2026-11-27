'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Trophy,
  Lock,
  CheckCircle2,
  Headphones,
  BookOpen,
  Film,
  Loader2,
  Search,
  Copy,
  X,
  ArrowUpRight,
  Heart,
  Home,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCollection, useUser, useDoc } from '@/firebase';
import { useBadgeManager } from '@/hooks/useBadgeManager';
import { iconMap } from '@/lib/icon-map';
import { cn, getInitials, normalizeArabic } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';
import type { UserProfile, GamificationBadge, UserBadge } from '@/lib/types';

export default function BadgesPage() {
  const { t, isRtl } = useTranslation();
  const { user } = useUser();
  useBadgeManager();

  const userDocPath = user ? `users/${user.uid}` : null;
  const userBadgesPath = user ? `users/${user.uid}/user_badges` : null;

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocPath);
  const { data: allBadges, isLoading: badgesLoading } = useCollection<GamificationBadge>(
    'gamification_badges',
    { orderBy: ['points', 'asc'] }
  );
  const { data: earnedBadges, isLoading: earnedBadgesLoading } = useCollection<UserBadge>(userBadgesPath);

  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<GamificationBadge | null>(null);
  const [copied, setCopied] = useState(false);

  const isLoading = profileLoading || badgesLoading || (user && earnedBadgesLoading);
  const earnedBadgeIds = useMemo(() => new Set(earnedBadges?.map((b) => b.id) || []), [earnedBadges]);

  const stats = useMemo(() => {
    if (!allBadges) return { total: 0, earned: 0, percentage: 0 };
    const total = allBadges.length;
    const earned = allBadges.filter((b) => earnedBadgeIds.has(b.id)).length;
    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { total, earned, percentage };
  }, [allBadges, earnedBadgeIds]);

  const collectorRank = useMemo(() => {
    const pct = stats.percentage;
    if (pct === 0) return t('مستكشف مبتدئ', 'Beginner Explorer');
    if (pct <= 30) return t('سالك طريق العلم', 'Seeker of Knowledge');
    if (pct <= 60) return t('جامع الفضائل', 'Collector of Virtues');
    if (pct <= 99) return t('صاحب الهمة العالية', 'High Achiever');
    return t('فارس وقفة الذهبي', 'Waqfah Gold Scholar');
  }, [stats.percentage, t]);

  const daysWithWaqfah = useMemo(() => {
    if (!userProfile?.createdAt) return 1;
    const createdAt = userProfile.createdAt as any;
    const regDate =
      createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
    const diffTime = Math.abs(Date.now() - regDate.getTime());
    return Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }, [userProfile?.createdAt]);

  const formatMinutesValue = (mins: number) => {
    if (!mins) return `0 ${t('دقيقة', 'min')}`;
    if (mins < 60) return `${mins} ${t('دقيقة', 'min')}`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs} ${t('ساعة', 'hr')} ${rem} ${t('دقيقة', 'min')}` : `${hrs} ${t('ساعة', 'hr')}`;
  };

  useEffect(() => {
    if (!isLoading && stats.earned > 0) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, stats.earned]);

  const filteredBadges = useMemo(() => {
    if (!allBadges) return [];
    const q = normalizeArabic(searchTerm.toLowerCase());
    return allBadges.filter((badge) => {
      const isEarned = earnedBadgeIds.has(badge.id);
      const matchesFilter = filter === 'all' ? true : filter === 'earned' ? isEarned : !isEarned;
      const matchesSearch =
        !q ||
        normalizeArabic(badge.title.toLowerCase()).includes(q) ||
        normalizeArabic(badge.description.toLowerCase()).includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [allBadges, filter, searchTerm, earnedBadgeIds]);

  const handleBadgeClick = (badge: GamificationBadge, earned: boolean) => {
    setSelectedBadge(badge);
    if (earned) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'minutesListened':
        return t('دقيقة استماع', 'minutes');
      case 'lecturesCompleted':
        return t('محاضرات مكتملة', 'lectures');
      case 'seriesCompleted':
        return t('سلاسل منجزة', 'series');
      case 'totalDonated':
        return t('جنيه تبرعات', 'EGP donated');
      case 'points':
        return t('نقطة', 'pts');
      default:
        return t('وحدة', 'units');
    }
  };

  const handleCopyLink = (badge: GamificationBadge) => {
    const text = `الحمد لله! حصلت على وسام "${badge.title}" (+${badge.points} نقطة) من منصة وقفة.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = (badge: GamificationBadge) => {
    const text = encodeURIComponent(`الحمد لله! حصلت على وسام "${badge.title}" من منصة وقفة!`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-foreground">
          {t('جاري تحميل الأوسمة...', 'Loading badges...')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-6xl">
        {/* Profile Summary Card */}
        {user && userProfile ? (
          <section className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary/30 shrink-0">
                <AvatarImage src={userProfile.photoURL || ''} alt={userProfile.name} />
                <AvatarFallback className="font-bold text-lg">{getInitials(userProfile.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                  <Home className="w-3.5 h-3.5" />
                  <span>{collectorRank}</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground truncate">{userProfile.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{daysWithWaqfah} {t('يوم معنا', 'days member')}</span>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-amber-500">
                    {stats.earned}/{stats.total} {t('وسام', 'badges')} ({stats.percentage}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('الاستماع', 'Listening')}</span>
                  <Headphones className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-foreground truncate">
                  {formatMinutesValue(userProfile.minutesListened || 0)}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('المحاضرات', 'Lectures')}</span>
                  <BookOpen className="w-4 h-4 text-sky-500" />
                </div>
                <p className="text-base font-black text-foreground">{userProfile.lecturesCompleted || 0}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('السلاسل', 'Series')}</span>
                  <Film className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-base font-black text-foreground">{userProfile.seriesCompleted || 0}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('النقاط', 'Points')}</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-base font-black text-amber-500">{userProfile.points || 0}</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="p-8 rounded-3xl bg-card/60 border border-dashed border-border text-center space-y-3">
            <Trophy className="w-10 h-10 text-primary/60 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">
              {t('سجّل دخولك لتتبع أوسمتك', 'Sign in to track your badges')}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t(
                'تتبع ساعات الاستماع وإتمام السلاسل واحصد الأوسمة العلمية.',
                'Track study hours, complete series, and unlock achievement badges.'
              )}
            </p>
            <Button asChild className="rounded-xl font-bold">
              <Link href="/auth/login?redirect_to=/badges">{t('تسجيل الدخول', 'Sign In')}</Link>
            </Button>
          </section>
        )}

        {/* Header + Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-headline text-foreground">
                {t('أوسمة المنصة', 'Platform Badges')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t('اضغط على أي وسام لعرض تفاصيله وشروط الحصول عليه.', 'Click any badge to view details and requirements.')}
              </p>
            </div>
          </div>

          <div className="bg-card/80 border border-border rounded-2xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={t('ابحث عن وسام...', 'Search badges...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 pl-9 h-10 bg-background border-border rounded-xl text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-1 p-1 bg-muted/60 border border-border rounded-xl">
              {[
                { id: 'all', label: t('الكل', 'All') },
                { id: 'earned', label: t('المكتسبة', 'Earned') },
                { id: 'locked', label: t('قيد الإنجاز', 'Locked') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex-1 sm:flex-none',
                    filter === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        {filteredBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBadges.map((badge) => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const IconComponent = iconMap[badge.icon] || Trophy;
              const userValue = userProfile ? (userProfile as any)[badge.metric] || 0 : 0;
              const rawProgress = badge.threshold > 0 ? (userValue / badge.threshold) * 100 : 0;
              const progress = Math.min(100, Math.max(0, rawProgress));

              return (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge, isEarned)}
                  className={cn(
                    'group p-5 rounded-2xl border transition-all flex flex-col cursor-pointer shadow-sm hover:-translate-y-1',
                    isEarned
                      ? 'border-amber-500/35 bg-amber-500/5 hover:border-amber-500/60'
                      : 'border-border bg-card/70 hover:border-primary/40'
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        isEarned ? 'bg-amber-500 text-white shadow' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {isEarned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> {t('مكتسب', 'Earned')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> {t('مقفل', 'Locked')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
                    {badge.description}
                  </p>

                  <div className="space-y-2.5 pt-3 border-t border-border/50">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-muted-foreground">{t('المكافأة', 'Reward')}</span>
                      <span className="text-amber-500">+{badge.points} {t('نقطة', 'pts')}</span>
                    </div>

                    {!isEarned && userProfile && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>{t('التقدم', 'Progress')}</span>
                          <span>
                            {Math.round(userValue)} / {badge.threshold}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-2">
            <Trophy className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-base font-bold text-foreground">
              {t('لا توجد أوسمة مطابقة لبحثك', 'No matching badges found')}
            </p>
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (() => {
        const isEarned = earnedBadgeIds.has(selectedBadge.id);
        const IconComponent = iconMap[selectedBadge.icon] || Trophy;
        const userValue = userProfile ? (userProfile as any)[selectedBadge.metric] || 0 : 0;
        const progress =
          selectedBadge.threshold > 0
            ? Math.min(100, (userValue / selectedBadge.threshold) * 100)
            : 0;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          >
            <div
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute left-4 top-4 p-2 rounded-xl bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div
                  className={cn(
                    'w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg',
                    isEarned ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <IconComponent className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-foreground">{selectedBadge.title}</h2>
                <p className="text-xs font-bold text-amber-500">
                  +{selectedBadge.points} {t('نقطة مكافأة', 'bonus points')}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">{t('الحالة', 'Status')}</span>
                  <span className={isEarned ? 'text-emerald-500' : 'text-muted-foreground'}>
                    {isEarned ? t('مكتسب', 'Earned') : t('قيد الإنجاز', 'In Progress')}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('التقدم', 'Progress')}</span>
                  <span>
                    {Math.round(userValue)} / {selectedBadge.threshold}{' '}
                    {getMetricLabel(selectedBadge.metric)}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {isEarned ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => shareOnWhatsApp(selectedBadge)}
                    className="h-10 rounded-xl font-bold text-xs gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>{t('واتساب', 'WhatsApp')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCopyLink(selectedBadge)}
                    className="h-10 rounded-xl font-bold text-xs gap-1.5"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t('تم النسخ!', 'Copied!') : t('نسخ', 'Copy')}</span>
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full h-10 rounded-xl font-bold">
                  <Link href="/lectures" onClick={() => setSelectedBadge(null)}>
                    {t('ابدأ التعلم لتحصيل الوسام', 'Start learning to unlock')}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
