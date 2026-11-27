'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Podcast, Search, Sparkles, Users, X } from 'lucide-react';
import { ProgramCard } from '@/components/program-card';
import { useCollection } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { normalizeArabic } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { Program } from '@/lib/types';
import ProgramPageClient from './[slug]/ProgramPageClient';

function ProgramsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-[360px] rounded-2xl bg-muted/50 animate-pulse border border-border"
        />
      ))}
    </div>
  );
}

export default function ProgramsPage() {
  const pathname = usePathname();
  const pathParts = pathname.split('/').filter(Boolean);
  const isIndividualProgram = pathParts.length > 1;

  if (isIndividualProgram) {
    return <ProgramPageClient />;
  }

  return <ProgramsDirectory />;
}

function ProgramsDirectory() {
  const { t, isRtl } = useTranslation();
  const { data: programs, isLoading } = useCollection<Program>('programs', {
    orderBy: ['followerCount', 'desc'],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const totalFollowers = useMemo(() => {
    if (!programs) return 0;
    return programs.reduce((acc, p) => acc + (p.followerCount || 0), 0);
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    if (!programs) return [];
    if (!searchQuery.trim()) return programs;
    const q = normalizeArabic(searchQuery.toLowerCase());
    return programs.filter(
      (p) =>
        normalizeArabic(p.name.toLowerCase()).includes(q) ||
        normalizeArabic((p.bio || '').toLowerCase()).includes(q)
    );
  }, [programs, searchQuery]);

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* Clean Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('القنوات والدعاة', 'Channels & Scholars')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('البرامج', 'Knowledge')} <span className="text-primary">{t('والقنوات', 'Channels')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'استكشف القنوات العلمية والبرامج الدعوية المميزة لنخبة من العلماء وطلبة العلم.',
                'Explore curated Islamic channels and programs from trusted scholars and speakers.'
              )}
            </p>
          </div>

          {/* Live Stats */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <Podcast className="w-4 h-4 text-primary" />
              <span>{programs?.length || 0} {t('قناة وبرنامج', 'Channels')}</span>
            </div>
            {totalFollowers > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>{totalFollowers} {t('متابع', 'Followers')}</span>
              </div>
            )}
          </div>
        </header>

        {/* Search Bar */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-3.5 md:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('ابحث عن قناة أو برنامج...', 'Search for a channel or program...')}
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
            <Podcast className="w-4 h-4 text-primary" />
            <span>
              {t('المعروض:', 'Showing:')} <strong className="text-foreground">{filteredPrograms.length}</strong>
            </span>
          </div>
        </section>

        {/* Grid */}
        {isLoading ? (
          <ProgramsListSkeleton />
        ) : filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrograms.map((program, index) => (
              <ProgramCard program={program} key={program.id} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">
                {t('لا توجد قنوات تطابق بحثك', 'No matching channels found')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('جرّب البحث باسم آخر.', 'Try another name or keyword.')}
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
