'use client';

import { useState, useMemo } from 'react';
import { ListVideo, Search, Sparkles, BookOpen, Clapperboard, X } from 'lucide-react';
import { SeriesCard } from '@/components/series-card';
import { useCollection } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { normalizeArabic } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { Series } from '@/lib/types';

function SeriesListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-[340px] rounded-2xl bg-muted/50 animate-pulse border border-border"
        />
      ))}
    </div>
  );
}

export default function SeriesListPage() {
  const { t, isRtl } = useTranslation();
  const { data: allSeries, isLoading } = useCollection<Series>('series', {
    orderBy: ['createdAt', 'desc'],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const totalLecturesCount = useMemo(() => {
    if (!allSeries) return 0;
    return allSeries.reduce((acc, s) => acc + (s.lectureCount || 0), 0);
  }, [allSeries]);

  const filteredSeries = useMemo(() => {
    if (!allSeries) return [];
    if (!searchQuery.trim()) return allSeries;
    const q = normalizeArabic(searchQuery.toLowerCase());
    return allSeries.filter(
      (s) =>
        normalizeArabic(s.title.toLowerCase()).includes(q) ||
        normalizeArabic((s.description || '').toLowerCase()).includes(q) ||
        normalizeArabic((s.programName || '').toLowerCase()).includes(q)
    );
  }, [allSeries, searchQuery]);

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* Clean Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('منهجية الطلب والبناء العلمي', 'Structured Learning Series')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('السلاسل', 'Scientific')} <span className="text-primary">{t('العلمية', 'Series')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'تعلّم العلم الشرعي بخطوات ثابتة ومنهجية واضحة عبر سلاسل مترابطة تشمل شتى فنون المعرفة.',
                'Learn step by step through structured series across Islamic sciences and spiritual growth.'
              )}
            </p>
          </div>

          {/* Live Stats */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <ListVideo className="w-4 h-4 text-primary" />
              <span>{allSeries?.length || 0} {t('سلسلة', 'Series')}</span>
            </div>
            {totalLecturesCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
                <Clapperboard className="w-4 h-4 text-emerald-500" />
                <span>{totalLecturesCount} {t('محاضرة', 'Lectures')}</span>
              </div>
            )}
          </div>
        </header>

        {/* Search Bar */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-3.5 md:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('ابحث عن سلسلة علمية أو برنامج...', 'Search for a series or program...')}
              className="pr-10 pl-9 h-11 bg-background border-border rounded-xl text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label={t('مسح البحث', 'Clear search')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold px-1">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>
              {t('المعروض:', 'Showing:')} <strong className="text-foreground">{filteredSeries.length}</strong>
            </span>
          </div>
        </section>

        {/* Grid */}
        {isLoading ? (
          <SeriesListSkeleton />
        ) : filteredSeries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeries.map((series, index) => (
              <SeriesCard series={series} key={series.id} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">
                {t('لا توجد سلاسل تطابق بحثك', 'No matching series found')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('جرّب البحث بكلمة أخرى أو تصفح جميع السلاسل.', 'Try another keyword or clear your search.')}
              </p>
            </div>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-xl font-bold">
                {t('مسح البحث', 'Clear search')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
