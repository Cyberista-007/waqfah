
import { HomeSearch } from '@/components/home-search';
import { RecommendedLectures } from '@/components/recommended-lectures';
import { ContinueListening } from '@/components/continue-listening';
import { SeriesCard } from '@/components/series-card';
import { LectureCard } from '@/components/lecture-card';
import { ChannelCard } from '@/components/channel-card';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { getDbSafe } from '@/lib/data';
import { collection, getDocs } from 'firebase/firestore';
import type { Series, Lecture, Channel } from '@/lib/types';
import { toSerializable } from '@/lib/data-helpers';
import { Suspense } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getHomePageData() {
    const { db, isLive } = getDbSafe();
    if (!isLive || !db) {
        return { isLive, latestSeries: [], latestLectures: [], topChannels: [], allChannels: [] };
    }

    try {
        const [seriesSnap, lecturesSnap, channelsSnap] = await Promise.all([
            getDocs(collection(db, 'series')),
            getDocs(collection(db, 'lectures')),
            getDocs(collection(db, 'channels')),
        ]);

        const allSeries = seriesSnap.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Series);
        const allLectures = lecturesSnap.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        const allChannels = channelsSnap.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Channel);

        // Sort and limit in code
        const latestSeries = [...allSeries]
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 3);
            
        const latestLectures = [...allLectures]
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 3);

        const topChannels = [...allChannels]
            .sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0))
            .slice(0, 4);

        return { isLive, latestSeries, latestLectures, topChannels, allChannels };
    } catch (error) {
        console.error("Error fetching home page data:", error);
        return { isLive: true, latestSeries: [], latestLectures: [], topChannels: [], allChannels: [] };
    }
}

export default async function Home() {
    const { isLive, latestSeries, latestLectures, topChannels, allChannels } = await getHomePageData();
    const heroImage = getPlaceholderImage('hero-background');

    if (!isLive) {
        return (
            <div className="container py-8 text-center">
                <Card className="p-8 bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive font-headline">خطأ في الاتصال بقاعدة البيانات</CardTitle>
                        <CardDescription className="text-destructive/80">
                            فشل الخادم في الاتصال بـ Firebase. يرجى التأكد من تعيين متغير البيئة `FIREBASE_SERVICE_ACCOUNT` بشكل صحيح.
                            <br />
                            راجع ملف `DEPLOYMENT.md` للحصول على الإرشادات.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <div className="space-y-12">
      <section className="relative -mt-[calc(4rem+1px)] flex h-[60vh] min-h-[500px] flex-col items-center justify-center text-center text-white rounded-b-3xl overflow-hidden">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
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
          <ContinueListening />
        </Suspense>
        <Suspense>
          <RecommendedLectures />
        </Suspense>
        
        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">أبرز القنوات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
             {topChannels?.map((channel, index) => (
                <ChannelCard channel={channel} key={channel.id} index={index}/>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">أحدث المحاضرات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestLectures?.map((lecture, index) => {
                const channel = allChannels?.find(c => c.id === lecture.channelId);
                return (
                    <LectureCard key={lecture.id} lecture={lecture} channel={channel} index={index}/>
                )
            })}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">أحدث السلاسل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestSeries?.map((series, index) => (
              <SeriesCard key={series.id} series={series} index={index}/>
            ))}
          </div>
        </section>

      </div>
    </div>
    </Suspense>
  );
}
