'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Play, Search, Share2, Clock, ListVideo, Rss, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LectureListItem } from '@/components/lecture-list-item';
import { SeriesCertificate } from './series-certificate';
import { formatTotalDuration, getVideoIdFromUrl, getInitials, normalizeArabic } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/images';
import { useTranslation } from '@/lib/i18n';
import type { Series, Lecture, Program, ListenHistoryItem } from '@/lib/types';

interface SeriesClientPageProps {
  series: Series;
  lecturesInSeries: Lecture[];
  seriesCreator: Program | null;
}

export function SeriesClientPage({ series, lecturesInSeries, seriesCreator }: SeriesClientPageProps) {
  const { t, isRtl } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(listenHistoryPath, {
    where: ['seriesId', '==', series.id],
  });

  const filteredLectures = useMemo(() => {
    if (!searchTerm.trim()) return lecturesInSeries;
    const q = normalizeArabic(searchTerm.toLowerCase());
    return lecturesInSeries.filter((lecture) =>
      normalizeArabic(lecture.title.toLowerCase()).includes(q)
    );
  }, [lecturesInSeries, searchTerm]);

  const seriesProgress = useMemo(() => {
    if (!listenHistory || !lecturesInSeries || lecturesInSeries.length === 0) return 0;
    const completedLecturesCount = listenHistory.filter((item) => {
      const lecture = lecturesInSeries.find((l) => l.id === item.lectureId);
      return lecture && item.duration > 0 && item.position / item.duration > 0.95;
    }).length;
    return (completedLecturesCount / lecturesInSeries.length) * 100;
  }, [listenHistory, lecturesInSeries]);

  const totalDuration = useMemo(
    () => lecturesInSeries.reduce((acc, lecture) => acc + (lecture.duration || 0), 0),
    [lecturesInSeries]
  );

  const handleShare = async () => {
    const shareData = {
      title: `${t('سلسلة:', 'Series:')} ${series.title}`,
      text: `${t('شاهد سلسلة', 'Watch series')} "${series.title}"`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: t('تم نسخ الرابط!', 'Link copied!') });
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: t('تم نسخ الرابط!', 'Link copied!') });
    }
  };

  const handlePlayAll = () => {
    const firstLecture = lecturesInSeries[0];
    if (firstLecture) {
      router.push(`/lectures/${firstLecture.slug}`);
    } else {
      toast({ variant: 'destructive', title: t('لا توجد محاضرات في هذه السلسلة.', 'No lectures in this series.') });
    }
  };

  const handleSubscribePodcast = async () => {
    const feedUrl = `${window.location.origin}/api/podcasts/${series.slug}`;
    try {
      await navigator.clipboard.writeText(feedUrl);
      toast({
        title: t('تم نسخ رابط البودكاست!', 'Podcast RSS URL copied!'),
        description: t(
          'يمكنك الآن لصق هذا الرابط في تطبيق البودكاست المفضل لديك للاشتراك ومتابعة السلسلة.',
          'Paste this RSS URL into your preferred podcast app to subscribe.'
        ),
      });
    } catch {
      toast({ variant: 'destructive', title: t('فشل نسخ الرابط', 'Failed to copy link'), description: feedUrl });
    }
  };

  const { imageUrl, imageHint } = useMemo(() => {
    if (lecturesInSeries && lecturesInSeries.length > 0) {
      const lectureWithImage = lecturesInSeries.find((l) => l.youtubeUrl || l.imageId);
      if (lectureWithImage) {
        const videoId = getVideoIdFromUrl(lectureWithImage.youtubeUrl);
        if (videoId) {
          return {
            imageUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            imageHint: 'youtube thumbnail',
          };
        }
        const placeholder = getPlaceholderImage(lectureWithImage.imageId);
        if (placeholder) {
          return { imageUrl: placeholder.imageUrl, imageHint: placeholder.imageHint };
        }
      }
    }
    const seriesPlaceholder = getPlaceholderImage(series.imageId);
    return {
      imageUrl: seriesPlaceholder?.imageUrl || `https://picsum.photos/seed/${series.slug}/600/600`,
      imageHint: seriesPlaceholder?.imageHint || 'islamic art',
    };
  }, [lecturesInSeries, series.imageId, series.slug]);

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-6xl">
        {/* Clean Series Overview Card */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
          {/* Thumbnail */}
          <div className="relative w-full max-w-sm md:w-80 shrink-0 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-muted border border-border/60 shadow-md">
            <Image
              src={imageUrl}
              alt={series.title}
              fill
              className="object-cover"
              priority
              data-ai-hint={imageHint}
            />
          </div>

          {/* Series Details */}
          <div className="flex-1 flex flex-col justify-between gap-5 text-center md:text-start min-w-0">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                {seriesCreator && (
                  <Link
                    href={`/programs/${seriesCreator.slug}`}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border hover:border-primary/40 transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={seriesCreator.imageUrl} alt={seriesCreator.name} />
                      <AvatarFallback className="text-[10px] font-bold">
                        {getInitials(seriesCreator.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-bold text-foreground">{seriesCreator.name}</span>
                  </Link>
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <ListVideo className="w-3.5 h-3.5" />
                  <span>{lecturesInSeries.length} {t('محاضرة', 'Lectures')}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTotalDuration(totalDuration)}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline text-foreground tracking-tight">
                {series.title}
              </h1>

              {series.description && (
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {series.description}
                </p>
              )}
            </div>

            {/* User Progress */}
            {user && (
              <div className="bg-muted/40 border border-border/60 rounded-2xl p-3.5 space-y-2 max-w-md mx-auto md:mx-0 w-full">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">{t('تقدّمك في السلسلة', 'Your progress')}</span>
                  <span className="text-primary">{Math.round(seriesProgress)}%</span>
                </div>
                <Progress value={seriesProgress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <Button onClick={handlePlayAll} className="h-11 px-6 rounded-xl font-bold gap-2 shadow-sm">
                <Play className="w-4 h-4 fill-current" />
                <span>{t('ابدأ السلسلة', 'Start Series')}</span>
              </Button>

              <Button
                onClick={handleSubscribePodcast}
                variant="outline"
                className="h-11 px-4 rounded-xl font-bold gap-2"
              >
                <Rss className="w-4 h-4 text-orange-500" />
                <span>RSS</span>
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-xl"
                title={t('مشاركة السلسلة', 'Share series')}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Completion Certificate */}
        {seriesProgress >= 98 && (
          <SeriesCertificate
            seriesTitle={series.title}
            userName={user?.displayName || 'طالب علم'}
            seriesId={series.id}
          />
        )}

        {/* Syllabus / Lectures List */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-headline text-foreground">
                {t('محطات السلسلة', 'Series Episodes')}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {t('تصفح المحاضرات مرتبة خطوة بخطوة.', 'Browse episodes in sequence.')}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t('ابحث داخل السلسلة...', 'Search episodes...')}
                className="pr-10 pl-9 h-10 bg-background border-border rounded-xl text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>

          <div className="space-y-3">
            {filteredLectures.length > 0 ? (
              filteredLectures.map((lecture, index) => (
                <LectureListItem key={lecture.id} lecture={lecture} index={index + 1} />
              ))
            ) : (
              <div className="text-center py-16 bg-muted/30 border border-dashed border-border rounded-2xl space-y-2">
                <ListVideo className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <p className="text-base font-bold text-foreground">
                  {t('لم نعثر على محاضرة مطابقة', 'No matching episode found')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('حاول البحث بكلمة مفتاحية أخرى.', 'Try another search keyword.')}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
