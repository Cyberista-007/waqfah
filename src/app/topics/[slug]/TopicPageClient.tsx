'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCollection } from '@/firebase';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { CinematicAppLoader } from '@/components/skeletons';
import { ChevronRight, Layers, ListVideo, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import type { Lecture, Series } from '@/lib/types';

export default function TopicPageClient() {
  const { t, isRtl } = useTranslation();
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent(slugParam as string);

  const { data: lectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', {
    where: ['topic', '==', slug],
    limit: 100,
  });

  const { data: series, isLoading: seriesLoading } = useCollection<Series>('series', {
    where: ['topic', '==', slug],
    limit: 50,
  });

  const isLoading = lecturesLoading || seriesLoading;

  if (isLoading) {
    return <CinematicAppLoader />;
  }

  const hasContent = (lectures?.length || 0) > 0 || (series?.length || 0) > 0;

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-10">
        {/* Clean Topic Header */}
        <header className="space-y-4 pb-6 border-b border-border/60">
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <ChevronRight className="w-4 h-4" />
            <span>{t('العودة إلى المسارات والموضوعات', 'Back to Topics')}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>{t('موضوع علمي', 'Topic')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
                {slug}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
              {series && series.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
                  <ListVideo className="w-4 h-4 text-primary" />
                  <span>{series.length} {t('سلسلة', 'Series')}</span>
                </div>
              )}
              {lectures && lectures.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
                  <Clapperboard className="w-4 h-4 text-emerald-500" />
                  <span>{lectures.length} {t('محاضرة', 'Lectures')}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {!hasContent ? (
          <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-4">
            <p className="text-lg font-bold text-foreground">
              {t('لا يوجد محتوى متاح لهذا الموضوع حالياً.', 'No content available for this topic yet.')}
            </p>
            <Button asChild variant="outline" className="rounded-xl font-bold">
              <Link href="/topics">{t('تصفح جميع الموضوعات', 'Browse all topics')}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {series && series.length > 0 && (
              <section className="space-y-5">
                <h2 className="text-xl md:text-2xl font-bold font-headline text-foreground">
                  {t('السلاسل المختارة', 'Featured Series')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {series.map((s, idx) => (
                    <SeriesCard key={s.id} series={s} index={idx} />
                  ))}
                </div>
              </section>
            )}

            {lectures && lectures.length > 0 && (
              <section className="space-y-5">
                <h2 className="text-xl md:text-2xl font-bold font-headline text-foreground">
                  {t('المحاضرات', 'Lectures')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {lectures.map((l, idx) => (
                    <LectureCard key={l.id} lecture={l} index={idx} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
