'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useMemo, Suspense, useState, useEffect } from 'react';
import {
  Loader2,
  Search as SearchIcon,
  Podcast,
  Book as BookIcon,
  Filter,
  Zap,
  Clock,
  Globe,
  LayoutGrid,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { ProgramCard } from '@/components/program-card';
import { BookCard } from '@/components/book-card';
import { useCollection } from '@/firebase';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Fuse from 'fuse.js';
import { normalizeArabic } from '@/lib/utils';
import { CinematicAppLoader } from '@/components/skeletons';
import { useTranslation } from '@/lib/i18n';
import type { Lecture, Series, Program, Book } from '@/lib/types';

function SearchPageComponent() {
  const { t, isRtl } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams?.get('q') || '';
  const languageFilter = searchParams?.get('lang') || 'all';
  const durationFilter = searchParams?.get('duration') || 'any';
  const transcriptSearch = searchParams?.get('transcript') === 'true';

  const [inputValue, setInputValue] = useState(urlQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(urlQuery);

  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
      if (inputValue !== urlQuery) {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (inputValue.trim()) current.set('q', inputValue.trim());
        else current.delete('q');
        router.replace(`${pathname}?${current.toString()}`, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');
  const { data: allBooks, isLoading: booksLoading } = useCollection<Book>('books');

  const isLoading = lecturesLoading || seriesLoading || programsLoading || booksLoading;

  const handleFilterChange = (type: 'lang' | 'duration' | 'transcript', value: string | boolean) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (type === 'transcript') {
      if (value) current.set(type, 'true');
      else current.delete(type);
    } else if (value === 'all' || value === 'any' || !value) {
      current.delete(type);
    } else {
      current.set(type, value as string);
    }
    router.replace(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const { lectures, series, programs, books } = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return { lectures: [], series: [], programs: [], books: [] };
    }

    const fuseOptions = {
      includeScore: false,
      threshold: 0.4,
      ignoreLocation: true,
      getFn: (obj: any, path: any) => {
        const keys = Array.isArray(path) ? path : path.split('.');
        let value = obj;
        for (const key of keys) {
          if (value == null) break;
          value = value[key];
        }
        if (typeof value === 'string') return normalizeArabic(value);
        return value;
      },
    };

    const queryNormalized = normalizeArabic(debouncedSearch);

    let filteredLectures = allLectures || [];
    if (languageFilter !== 'all') {
      filteredLectures = filteredLectures.filter((l) => l.language === languageFilter);
    }
    if (durationFilter !== 'any') {
      if (durationFilter === 'under30') filteredLectures = filteredLectures.filter((l) => l.duration < 1800);
      else if (durationFilter === '30to60')
        filteredLectures = filteredLectures.filter((l) => l.duration >= 1800 && l.duration <= 3600);
      else if (durationFilter === 'over60') filteredLectures = filteredLectures.filter((l) => l.duration > 3600);
    }
    const lectureFuse = new Fuse(filteredLectures, {
      ...fuseOptions,
      keys: ['title', 'description', 'programName', 'seriesTitle', ...(transcriptSearch ? ['transcript.text'] : [])],
    });

    let filteredSeries = allSeries || [];
    if (languageFilter !== 'all') {
      filteredSeries = filteredSeries.filter((s) => s.language === languageFilter);
    }
    const seriesFuse = new Fuse(filteredSeries, {
      ...fuseOptions,
      keys: ['title', 'description', 'programName'],
    });

    const programsFuse = new Fuse(allPrograms || [], { ...fuseOptions, keys: ['name', 'bio'] });
    const booksFuse = new Fuse(allBooks || [], { ...fuseOptions, keys: ['title', 'programName'] });

    return {
      lectures: lectureFuse.search(queryNormalized).map((r) => r.item),
      series: seriesFuse.search(queryNormalized).map((r) => r.item),
      programs: programsFuse.search(queryNormalized).map((r) => r.item),
      books: booksFuse.search(queryNormalized).map((r) => r.item),
    };
  }, [debouncedSearch, allLectures, allSeries, allPrograms, allBooks, languageFilter, durationFilter, transcriptSearch]);

  const totalCount = lectures.length + series.length + programs.length + books.length;
  const hasResults = totalCount > 0;

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* Clean Header */}
        <header className="space-y-3 pb-6 border-b border-border/60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <SearchIcon className="w-3.5 h-3.5" />
            <span>{t('البحث الشامل في المنصة', 'Global Platform Search')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
            {debouncedSearch.trim() ? (
              <>
                {t('نتائج البحث عن', 'Results for')}{' '}
                <span className="text-primary">&quot;{debouncedSearch}&quot;</span>
              </>
            ) : (
              <>
                {t('استكشف', 'Explore')} <span className="text-primary">{t('الموسوعة', 'Everything')}</span>
              </>
            )}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            {t(
              'ابحث في المحاضرات، السلاسل العلمية، القنوات، الكتب، وحتى داخل التفريغ النصي.',
              'Search across lectures, series, channels, books, and even inside transcripts.'
            )}
          </p>
        </header>

        {/* Search & Filters Console */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">
                {t('كلمة البحث', 'Search query')}
              </Label>
              <div className="relative">
                <SearchIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('اكتب موضوعاً، اسم محاضرة، أو داعية...', 'Type a topic, lecture title, or scholar...')}
                  className="pr-10 pl-9 h-11 bg-background border-border rounded-xl text-sm"
                />
                {inputValue && (
                  <button
                    onClick={() => setInputValue('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>{t('اللغة', 'Language')}</span>
              </Label>
              <Select
                onValueChange={(value) => handleFilterChange('lang', value)}
                value={languageFilter}
              >
                <SelectTrigger className="h-11 bg-background border-border rounded-xl text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">{t('كل اللغات', 'All languages')}</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('المدة', 'Duration')}</span>
              </Label>
              <Select
                onValueChange={(value) => handleFilterChange('duration', value)}
                value={durationFilter}
              >
                <SelectTrigger className="h-11 bg-background border-border rounded-xl text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="any">{t('أي مدة', 'Any length')}</SelectItem>
                  <SelectItem value="under30">{t('أقل من 30 دقيقة', 'Under 30 min')}</SelectItem>
                  <SelectItem value="30to60">{t('30 - 60 دقيقة', '30 - 60 min')}</SelectItem>
                  <SelectItem value="over60">{t('أكثر من ساعة', 'Over 1 hour')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="transcript-search"
                className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-background border border-border cursor-pointer hover:border-primary/40 transition-colors"
              >
                <Checkbox
                  id="transcript-search"
                  checked={transcriptSearch}
                  onCheckedChange={(checked) => handleFilterChange('transcript', !!checked)}
                />
                <span className="text-xs font-bold text-foreground select-none">
                  {t('البحث في التفريغ النصي', 'Search inside transcripts')}
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
            <p className="text-xs font-bold text-muted-foreground">
              {t('جاري البحث في قواعد البيانات...', 'Searching platform databases...')}
            </p>
          </div>
        ) : debouncedSearch.trim() ? (
          hasResults ? (
            <div className="space-y-12">
              {programs.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <Podcast className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">
                      {t('البرامج والقنوات', 'Channels')} ({programs.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {programs.map((p, index) => (
                      <ProgramCard key={p.id} program={p} index={index} />
                    ))}
                  </div>
                </section>
              )}

              {series.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid className="w-5 h-5 text-purple-500" />
                    <h2 className="text-xl font-bold text-foreground">
                      {t('السلاسل', 'Series')} ({series.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {series.map((s, index) => (
                      <SeriesCard key={s.id} series={s} index={index} />
                    ))}
                  </div>
                </section>
              )}

              {lectures.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-bold text-foreground">
                      {t('المحاضرات', 'Lectures')} ({lectures.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {lectures.map((lecture, index) => (
                      <LectureCard key={lecture.id} lecture={lecture} index={index} />
                    ))}
                  </div>
                </section>
              )}

              {books.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <BookIcon className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-bold text-foreground">
                      {t('الكتب', 'Books')} ({books.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {books.map((b, index) => (
                      <BookCard key={b.id} book={b} index={index} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  {t('لا توجد نتائج مطابقة', 'No matching results')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('لم نجد نتائج للبحث عن', 'No results found for')} &quot;{debouncedSearch}&quot;.
                </p>
              </div>
              <Button onClick={() => router.push('/lectures')} variant="outline" className="rounded-xl font-bold gap-2">
                <span>{t('استعرض كل المحاضرات', 'Browse all lectures')}</span>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: t('بحث ذكي متقدم', 'Smart Search'),
                icon: Sparkles,
                desc: t(
                  'بحث سريع في العناوين والوصف وحتى داخل نصوص التفريغ للمحاضرات.',
                  'Fast search across titles, descriptions, and lecture transcripts.'
                ),
              },
              {
                title: t('تصفية دقيقة', 'Precise Filtering'),
                icon: Filter,
                desc: t(
                  'فلترة النتائج حسب اللغة ومدة المحاضرة لتصل للمطلوب فوراً.',
                  'Filter results by language and duration.'
                ),
              },
              {
                title: t('شامل لكل الأقسام', 'Unified Index'),
                icon: Globe,
                desc: t(
                  'نتائج موحدة تجمع القنوات، السلاسل، المحاضرات، والكتب في مكان واحد.',
                  'Unified results across channels, series, lectures, and books.'
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-card/70 border border-border space-y-3 text-center shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<CinematicAppLoader />}>
      <SearchPageComponent />
    </Suspense>
  );
}
