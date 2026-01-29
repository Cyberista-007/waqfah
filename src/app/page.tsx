
import { HomeSearch } from '@/components/home-search';
import { RecommendedLectures } from '@/components/recommended-lectures';
import { ContinueListening } from '@/components/continue-listening';
import { SeriesCard } from '@/components/series-card';
import { LectureCard } from '@/components/lecture-card';
import { ProgramCard } from '@/components/program-card';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { getHomePageData } from '@/lib/data';
import { Suspense } from 'react';
import { HomePageSkeleton } from '@/components/skeletons';

export default async function Home() {
    const { latestSeries, latestLectures, topPrograms } = await getHomePageData();
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
          <h2 className="text-3xl font-bold mb-6 font-headline">أبرز البرامج</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
             {topPrograms?.map((program, index) => (
                <ProgramCard program={program} key={program.id} index={index}/>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 font-headline">أحدث المحاضرات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestLectures?.map((lecture, index) => {
                return (
                    <LectureCard key={lecture.id} lecture={lecture} index={index}/>
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
