'use client';

import { useState, useMemo } from 'react';
import { Flame, Target, Search, X } from 'lucide-react';
import { useCollection } from '@/firebase';
import { ChallengeCard } from '@/components/challenge-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { normalizeArabic } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { Challenge } from '@/lib/types';

function ChallengesListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-[340px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
      ))}
    </div>
  );
}

export default function ChallengesPage() {
  const { t, isRtl } = useTranslation();
  const { data: challenges, isLoading } = useCollection<Challenge>('challenges', {
    where: ['isActive', '==', true],
    orderBy: ['endDate', 'asc'],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChallenges = useMemo(() => {
    if (!challenges) return [];
    if (!searchQuery.trim()) return challenges;
    const q = normalizeArabic(searchQuery.toLowerCase());
    return challenges.filter(
      (c) =>
        normalizeArabic(c.title.toLowerCase()).includes(q) ||
        normalizeArabic((c.description || '').toLowerCase()).includes(q)
    );
  }, [challenges, searchQuery]);

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* Clean Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>{t('مسابقات وتحديات العلم', 'Faith & Knowledge Challenges')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('تحديات', 'High Resolve')} <span className="text-primary">{t('الهمة', 'Challenges')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'اشحذ همتك وسابق في الخيرات عبر تحديات علمية وتزكوية تفاعلية.',
                'Challenge yourself and grow in knowledge through interactive learning quests.'
              )}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold shadow-sm self-start md:self-auto">
            <Target className="w-4 h-4 text-orange-500" />
            <span>{challenges?.length || 0} {t('تحدي نشط', 'Active Challenges')}</span>
          </div>
        </header>

        {/* Search Toolbar */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-3.5 md:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('ابحث عن تحدٍ إيماني...', 'Search active challenges...')}
              className="pr-10 pl-9 h-11 bg-background border-border rounded-xl text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="text-xs text-muted-foreground font-semibold px-1">
            {t('المعروض:', 'Showing:')} <strong className="text-foreground">{filteredChallenges.length}</strong>
          </div>
        </section>

        {/* Challenges Grid */}
        {isLoading ? (
          <ChallengesListSkeleton />
        ) : filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge, index) => (
              <ChallengeCard challenge={challenge} key={challenge.id} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
              <Target className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {searchQuery
                ? t('لا توجد تحديات تطابق بحثك حالياً.', 'No matching challenges found.')
                : t('لا توجد تحديات نشطة حالياً.', 'No active challenges right now.')}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-xl font-bold">
                {t('إظهار كافة التحديات', 'Show all challenges')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
