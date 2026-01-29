
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
    const { latestSeries, latestLectures, topPrograms, isLive, error } = await getHomePageData();
    const heroImage = getPlaceholderImage('hero-background');

    if (!isLive) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border text-card-foreground shadow-sm p-8 bg-destructive/10 border-destructive">
          <h2 className="text-2xl font-bold text-destructive-foreground font-headline mb-4">
            خطأ في الاتصال بقاعدة البيانات
          </h2>
          <p className="text-destructive-foreground/90 mb-4">
            فشل الخادم في الاتصال بـ Firebase. هذا يعني عادةً أن بيانات الاعتماد (مفتاح حساب الخدمة) مفقودة أو غير صحيحة.
          </p>
          <div className="bg-destructive/20 p-4 rounded-md text-destructive-foreground">
            <h3 className="font-bold mb-2">الخطأ الفني:</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {error || 'No specific error message available.'}
            </pre>
          </div>
          <p className="mt-4 text-destructive-foreground/90">
            لحل هذه المشكلة، يرجى التأكد من تعيين متغير البيئة <code className="font-mono bg-destructive/30 px-1 py-0.5 rounded">FIREBASE_SERVICE_ACCOUNT</code> بشكل صحيح في بيئة النشر الخاصة بك (مثل Vercel) أو في ملف <code className="font-mono bg-destructive/30 px-1 py-0.5 rounded">.env.local</code> للتطوير المحلي. راجع ملف <code className="font-mono bg-destructive/30 px-1 py-0.5 rounded">DEPLOYMENT.md</code> للحصول على إرشادات تفصيلية.
          </p>
        </div>
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
