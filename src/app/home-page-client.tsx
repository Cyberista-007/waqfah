'use client';

import { HomeSearch } from '@/components/home-search';
import { RecommendedLectures } from '@/components/recommended-lectures';
import { ContinueWatching } from '@/components/continue-listening';
import { SeriesCard } from '@/components/series-card';
import { LectureCard } from '@/components/lecture-card';
import { ProgramCard } from '@/components/program-card';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { Suspense, useState, useMemo, useEffect } from 'react';
import type { Lecture, Series, Program } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from './skeletons';
import { PinnedItems } from '@/app/pinned-items';
import { ShortsCarousel } from '@/components/ShortsCarousel';
import { useAppearance } from '@/components/appearance-provider';

// New Component for paginated sections
function PaginatedSection({
  title,
  items,
  renderItem,
  viewAllHref,
  itemsPerPage = 4,
  gridClassName,
}: {
  title: string;
  items: any[] | null;
  renderItem: (item: any, index: number) => React.ReactNode;
  viewAllHref: string;
  itemsPerPage?: number;
  gridClassName?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

    if (!items || items.length === 0) {
    if (title === "أحدث المحاضرات") {
        return (
             <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold font-headline">{title}</h2>
                     <Button asChild variant="outline">
                        <Link href={viewAllHref}>
                            <span>عرض الكل</span>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                        </Link>
                    </Button>
                </div>
                 <div className="text-center py-10 text-muted-foreground">
                    لا يوجد محتوى لعرضه حالياً في هذا القسم.
                </div>
            </section>
        )
    }
    return null;
  }

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + itemsPerPage, items.length));
  };

  const hasMoreToLoad = visibleCount < items.length;

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-headline">{title}</h2>
        <Button asChild variant="outline">
          <Link href={viewAllHref}>
            <span>عرض الكل</span>
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Link>
        </Button>
      </div>
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 gap-6',
          gridClassName || 'lg:grid-cols-4'
        )}
      >
        {items.slice(0, visibleCount).map((item, index) => renderItem(item, index))}
      </div>
      {hasMoreToLoad && (
        <div className="text-center mt-8">
          <Button onClick={handleShowMore}>تحميل المزيد</Button>
        </div>
      )}
    </section>
  );
}


export function HomePageClient() {
  const { data: latestLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'], limit: 20 });
  const { data: topPrograms, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['followerCount', 'desc'], limit: 12 });
  const { data: latestSeries, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['createdAt', 'desc'], limit: 12 });
  const { heroImageUrl: customHeroUrl } = useAppearance();

  const isLoading = seriesLoading || lecturesLoading || programsLoading;

  const { shorts, regularLectures } = useMemo(() => {
    if (!latestLectures) return { shorts: [], regularLectures: [] };
    const shortsArr: Lecture[] = [];
    const regularLecturesArr: Lecture[] = [];
    latestLectures.forEach(lecture => {
        // Shorts are defined as 180 seconds (3 minutes) or less
        if (lecture.duration <= 180) {
            shortsArr.push(lecture);
        } else {
            regularLecturesArr.push(lecture);
        }
    });
    return { shorts: shortsArr, regularLectures: regularLecturesArr };
  }, [latestLectures]);
  
  const heroImage = getPlaceholderImage('hero-background');
  const [heroImageUrl, setHeroImageUrl] = useState(customHeroUrl || heroImage?.imageUrl);


  useEffect(() => {
    if (customHeroUrl) {
      setHeroImageUrl(customHeroUrl);
      return;
    }
    const featuredProgram = topPrograms?.[0];
    if (featuredProgram?.youtubeUrl) {
      const fetchBanner = async () => {
        try {
          const response = await fetch(`${window.location.origin}/api/youtube-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: featuredProgram.youtubeUrl, fetchChannelInfo: true }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.channelInfo?.bannerUrl) {
              const highResBanner = data.channelInfo.bannerUrl.replace('=w1060', '=w2120').replace('=w1707', '=w2120');
              setHeroImageUrl(highResBanner);
            }
          }
        } catch (error) {
          console.error("Failed to fetch YouTube banner for hero:", error);
          setHeroImageUrl(heroImage?.imageUrl);
        }
      };
      fetchBanner();
    } else {
        setHeroImageUrl(heroImage?.imageUrl);
    }
  }, [topPrograms, heroImage?.imageUrl, customHeroUrl]);

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="space-y-12">
      <section className="relative -mt-[calc(4rem+1px)] flex h-[60vh] min-h-[500px] flex-col items-center justify-center text-center text-white rounded-b-3xl overflow-hidden">
        {heroImageUrl && heroImage && (
          <Image
            src={heroImageUrl}
            alt={heroImage.description}
            fill
            className="object-cover image-theme-filter"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-headline tracking-tight">
            العلم الشرعي بين يديك
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.
          </p>
          <HomeSearch />
        </div>
      </section>

      <div className="container py-8 space-y-16">
        <Suspense>
            <PinnedItems />
        </Suspense>
        <Suspense>
          <ContinueWatching />
        </Suspense>
        <Suspense>
          <RecommendedLectures />
        </Suspense>

        <ShortsCarousel shorts={shorts} />

        <PaginatedSection
          title="أبرز البرامج"
          items={topPrograms}
          viewAllHref="/programs"
          itemsPerPage={4}
          renderItem={(item, index) => <ProgramCard program={item} index={index} key={item.id} />}
        />
        
        <PaginatedSection
            title="أحدث المحاضرات"
            items={regularLectures}
            viewAllHref="/lectures"
            itemsPerPage={3}
            gridClassName="lg:grid-cols-3"
            renderItem={(item, index) => <LectureCard lecture={item} index={index} key={item.id} />}
        />
        
        <PaginatedSection
            title="أحدث السلاسل"
            items={latestSeries}
            viewAllHref="/series"
            itemsPerPage={3}
            gridClassName="lg:grid-cols-3"
            renderItem={(item, index) => <SeriesCard series={item} index={index} key={item.id} />}
        />

      </div>
    </div>
  );
}
