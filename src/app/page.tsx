
import { HomeSearch } from '@/components/home-search';
import { RecommendedLectures } from '@/components/recommended-lectures';
import { ContinueListening } from '@/components/continue-listening';
import { SeriesCard } from '@/components/series-card';
import { LectureCard } from '@/components/lecture-card';
import { ChannelCard } from '@/components/channel-card';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { getDbSafe } from '@/lib/data';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { Series, Lecture, Channel } from '@/lib/types';
import { toSerializable } from '@/lib/data-helpers';
import { Suspense } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';

async function getHomePageData() {
    const { db, isLive } = getDbSafe();
    if (!isLive || !db) {
        return { latestSeries: [], latestLectures: [], topChannels: [], allChannels: [] };
    }

    try {
        const [seriesSnap, lecturesSnap, topChannelsSnap, allChannelsSnap] = await Promise.all([
            getDocs(query(collection(db, 'series'), orderBy('createdAt', 'desc'), limit(3))),
            getDocs(query(collection(db, 'lectures'), orderBy('createdAt', 'desc'), limit(3))),
            getDocs(query(collection(db, 'channels'), orderBy('followerCount', 'desc'), limit(4))),
            getDocs(query(collection(db, 'channels'))),
        ]);

        const latestSeries = seriesSnap.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Series);
        const latestLectures = lecturesSnap.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        const topChannels = topChannelsSnap.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Channel);
        const allChannels = allChannelsSnap.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Channel);

        return { latestSeries, latestLectures, topChannels, allChannels };
    } catch (error) {
        console.error("Error fetching home page data:", error);
        return { latestSeries: [], latestLectures: [], topChannels: [], allChannels: [] };
    }
}

export default async function Home() {
    const { latestSeries, latestLectures, topChannels, allChannels } = await getHomePageData();
    const heroImage = getPlaceholderImage('hero-background');

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
