'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layers, Route, GraduationCap, Sparkles, Search, X } from 'lucide-react';
import { useCollection } from '@/firebase';
import { getPlaceholderImage } from '@/lib/images';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { normalizeArabic } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { Topic } from '@/lib/types';

function TopicsPageSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-[340px] rounded-2xl bg-muted/50 border border-border animate-pulse"
        />
      ))}
    </div>
  );
}

export default function TopicsPage() {
  const { t, isRtl } = useTranslation();
  const { data: topics, isLoading } = useCollection<Topic>('topics', { orderBy: ['name', 'asc'] });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!searchQuery.trim()) return topics;
    const q = normalizeArabic(searchQuery.toLowerCase());
    return topics.filter(
      (topic) =>
        normalizeArabic(topic.name.toLowerCase()).includes(q) ||
        normalizeArabic((topic.description || '').toLowerCase()).includes(q)
    );
  }, [topics, searchQuery]);

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* Clean Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>{t('التصنيفات والموضوعات', 'Topics & Pathways')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('مسارات', 'Learning')} <span className="text-primary">{t('التعلم', 'Topics')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'رحلات معرفية منظمة في شتى العلوم الشرعية وبناء الشخصية المسلمة.',
                'Organized knowledge pathways across Islamic sciences and spiritual growth.'
              )}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold shadow-sm self-start md:self-auto">
            <Route className="w-4 h-4 text-primary" />
            <span>{topics?.length || 0} {t('مسار وموضوع', 'Topics')}</span>
          </div>
        </header>

        {/* Search Bar */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-3.5 md:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('ابحث في الموضوعات...', 'Search topics...')}
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
            {t('المعروض:', 'Showing:')} <strong className="text-foreground">{filteredTopics.length}</strong>
          </div>
        </section>

        {/* Topics Grid */}
        {isLoading ? (
          <TopicsPageSkeleton />
        ) : filteredTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTopics.map((topic) => {
              const placeholder = getPlaceholderImage(topic.imageId);
              return (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-card/80 border border-border hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                      src={placeholder?.imageUrl || `https://picsum.photos/seed/${topic.slug}/600/400`}
                      alt={topic.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-bold text-white">{t('مسار علمي', 'Pathway')}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {topic.name}
                    </h2>
                    {topic.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{t('استعراض المحتوى', 'Explore topic')}</span>
                      </span>
                      <Route className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
              <Layers className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {searchQuery ? t('لا توجد موضوعات مطابقة', 'No matching topics') : t('لا توجد موضوعات مضافة حالياً', 'No topics available yet')}
            </p>
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
