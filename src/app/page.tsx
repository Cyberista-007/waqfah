
"use client";

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useCollection, useUser } from '@/firebase';
import type { Series, Lecture, Sheikh, Channel } from '@/lib/types';
import { HomePageSkeleton } from '@/components/skeletons';
import { RecommendedLectures } from '@/components/recommended-lectures';
import { ContinueListening } from '@/components/continue-listening';
import { SeriesCard } from '@/components/series-card';
import { LectureCard } from '@/components/lecture-card';
import { ChannelCard } from '@/components/channel-card';

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  const { data: latestSeries, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['createdAt', 'desc'], limit: 3 });
  const { data: latestLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'], limit: 3 });
  const { data: topChannels, isLoading: channelsLoading } = useCollection<Channel>('channels', { orderBy: ['name', 'asc'], limit: 4 });
  const { data: allChannels, isLoading: allChannelsLoading } = useCollection<Channel>('channels');


  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  if (seriesLoading || lecturesLoading || channelsLoading || allChannelsLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="space-y-12">
      <section className="relative -mt-[calc(4rem+1px)] flex h-[60vh] min-h-[500px] flex-col items-center justify-center text-center animated-gradient rounded-b-3xl">
        <div className="container relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-headline tracking-tight text-foreground">
            العلم الشرعي بين يديك
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.
          </p>
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="search"
                  name="search"
                  placeholder="ابحث عن محاضرة، سلسلة، كتاب..."
                  className="w-full p-6 pe-12 text-lg rounded-full shadow-lg focus:ring-2 focus:ring-ring border-2 border-transparent focus:border-primary transition-all duration-300"
                  aria-label="بحث"
                />
                <button type="submit" className="absolute top-1/2 end-4 -translate-y-1/2 text-muted-foreground">
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="py-8 space-y-16">
        <div className="container">
          {user && <ContinueListening />}
          {user && <RecommendedLectures />}
        </div>
        
        <section className="container">
          <h2 className="text-3xl font-bold mb-6 font-headline">أبرز القنوات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
             {topChannels?.map((channel, index) => (
                <ChannelCard channel={channel} key={channel.id} index={index}/>
            ))}
          </div>
        </section>

        <section>
          <div className="container">
            <h2 className="text-3xl font-bold mb-6 font-headline">أحدث المحاضرات</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {latestLectures?.map((lecture, index) => {
                const channel = allChannels?.find(c => c.id === lecture.channelId);
                return (
                    <LectureCard key={lecture.id} lecture={lecture} channel={channel} index={index}/>
                )
            })}
          </div>
        </section>

        <section>
          <div className="container">
            <h2 className="text-3xl font-bold mb-6 font-headline">أحدث السلاسل</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {latestSeries?.map((series, index) => (
              <SeriesCard key={series.id} series={series} index={index}/>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
