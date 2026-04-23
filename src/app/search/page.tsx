'use client';
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Loader2, SearchIcon, Podcast, Book as BookIcon } from "lucide-react";
import { LectureCard } from "@/components/lecture-card";
import { SeriesCard } from "@/components/series-card";
import { ProgramCard } from "@/components/program-card";
import { BookCard } from "@/components/book-card";
import { useCollection } from "@/firebase";
import { Lecture, Series, Program, Book } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Fuse from 'fuse.js';
import { normalizeArabic } from "@/lib/utils";

function SearchPageComponent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const searchTerm = searchParams?.get("q") || "";
    const languageFilter = searchParams?.get('lang') || 'all';
    const durationFilter = searchParams?.get('duration') || 'any';
    const transcriptSearch = searchParams?.get('transcript') === 'true';

    // Debounce state to avoid heavy CPU usage during typing
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');
    const { data: allBooks, isLoading: booksLoading } = useCollection<Book>('books');

    const isLoading = lecturesLoading || seriesLoading || programsLoading || booksLoading;

    const handleFilterChange = (type: 'lang' | 'duration' | 'transcript', value: string | boolean) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (type === 'transcript') {
            if (value) {
                current.set(type, 'true');
            } else {
                current.delete(type);
            }
        } else if (value === 'all' || value === 'any' || !value) {
            current.delete(type);
        } else {
            current.set(type, value as string);
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";

        // Using router.replace to avoid polluting browser history with every filter change
        router.replace(`${pathname}${query}`, { scroll: false });
    };

    const { lectures, series, programs, books } = useMemo(() => {
        if (!debouncedSearch.trim()) {
            return { lectures: [], series: [], programs: [], books: [] };
        }
        
        const fuseOptions = {
            includeScore: false,
            threshold: 0.4,
            ignoreLocation: true,
            preprocessor: normalizeArabic,
        };

        // Lectures
        let filteredLectures = allLectures || [];

        // Apply filters before fuzzy search for better performance
        if (languageFilter !== 'all') {
            filteredLectures = filteredLectures.filter(l => l.language === languageFilter);
        }
        if (durationFilter !== 'any') {
            switch(durationFilter) {
                case 'under30':
                    filteredLectures = filteredLectures.filter(l => l.duration < 1800);
                    break;
                case '30to60':
                    filteredLectures = filteredLectures.filter(l => l.duration >= 1800 && l.duration <= 3600);
                    break;
                case 'over60':
                    filteredLectures = filteredLectures.filter(l => l.duration > 3600);
                    break;
            }
        }

        const lectureKeys = ['title', 'description', 'programName', 'seriesTitle'];
        if (transcriptSearch) {
          lectureKeys.push('transcript.text');
        }
        const lectureFuse = new Fuse(filteredLectures, { ...fuseOptions, keys: lectureKeys });
        const finalLectures = lectureFuse.search(debouncedSearch).map(result => result.item);

        // Series
        let filteredSeries = allSeries || [];
        if (languageFilter !== 'all') {
            filteredSeries = filteredSeries.filter(s => s.language === languageFilter);
        }
        const seriesFuse = new Fuse(filteredSeries, { ...fuseOptions, keys: ['title', 'description', 'programName'] });
        const finalSeries = seriesFuse.search(debouncedSearch).map(result => result.item);
        
        // Programs
        const programsFuse = new Fuse(allPrograms || [], { ...fuseOptions, keys: ['name', 'bio'] });
        const finalPrograms = programsFuse.search(debouncedSearch).map(result => result.item);
        
        // Books
        const booksFuse = new Fuse(allBooks || [], { ...fuseOptions, keys: ['title', 'programName'] });
        const finalBooks = booksFuse.search(debouncedSearch).map(result => result.item);
        
        return { 
            lectures: finalLectures, 
            series: finalSeries, 
            programs: finalPrograms, 
            books: finalBooks 
        };
    }, [debouncedSearch, allLectures, allSeries, allPrograms, allBooks, languageFilter, durationFilter, transcriptSearch]);

    const hasResults = lectures.length > 0 || series.length > 0 || programs.length > 0 || books.length > 0;

    return (
        <div>
             {!searchTerm.trim() ? (
                <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">
                        الرجاء إدخال مصطلح للبحث عنه في الشريط أعلاه.
                    </p>
                </div>
            ) : (
                <>
                <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
                    <SearchIcon />
                    نتائج البحث عن: <span className="text-primary">"{searchTerm}"</span>
                </h1>

                <Card className="mb-8 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <Label htmlFor="lang-filter">اللغة</Label>
                            <Select onValueChange={(value) => handleFilterChange("lang", value)} defaultValue={languageFilter}>
                            <SelectTrigger id="lang-filter">
                                <SelectValue placeholder="اختر اللغة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="ar">العربية</SelectItem>
                                <SelectItem value="en">الإنجليزية</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="duration-filter">مدة المحاضرة</Label>
                            <Select onValueChange={(value) => handleFilterChange("duration", value)} defaultValue={durationFilter}>
                            <SelectTrigger id="duration-filter">
                                <SelectValue placeholder="اختر المدة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">أي مدة</SelectItem>
                                <SelectItem value="under30">أقل من 30 دقيقة</SelectItem>
                                <SelectItem value="30to60">30 - 60 دقيقة</SelectItem>
                                <SelectItem value="over60">أكثر من 60 دقيقة</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse pt-4">
                            <Checkbox 
                                id="transcript-search" 
                                checked={transcriptSearch}
                                onCheckedChange={(checked) => handleFilterChange('transcript', !!checked)}
                            />
                            <Label htmlFor="transcript-search" className="cursor-pointer">
                                بحث في التفريغ النصي
                            </Label>
                        </div>
                    </div>
                </Card>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-16 h-16 animate-spin" /></div>
                ) : (
                    <div className="space-y-12">
                        {programs.length > 0 && (
                            <section>
                                <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-3"><Podcast /> البرامج</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {programs.map((p, index) => <ProgramCard key={p.id} program={p} index={index} />)}
                                </div>
                            </section>
                        )}
                        {series.length > 0 && (
                            <section>
                                <h2 className="text-3xl font-bold mb-6 font-headline">السلاسل</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {series.map((s, index) => <SeriesCard key={s.id} series={s} index={index} />)}
                                </div>
                            </section>
                        )}
                        {lectures.length > 0 && (
                            <section>
                                <h2 className="text-3xl font-bold mb-6 font-headline">المحاضرات</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lectures.map((lecture, index) => <LectureCard key={lecture.id} lecture={lecture} index={index} />)}
                                </div>
                            </section>
                        )}
                        {books.length > 0 && (
                            <section>
                                <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-3"><BookIcon /> الكتب</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                                {books.map((b, index) => <BookCard key={b.id} book={b} index={index} />)}
                                </div>
                            </section>
                        )}
            
                        {!hasResults && (
                            <div className="text-center py-16">
                                <p className="text-lg text-muted-foreground">
                                    لم يتم العثور على نتائج للبحث عن: <span className="font-bold text-foreground">"{searchTerm}"</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}
                </>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-16 h-16 animate-spin" /></div>}>
            <SearchPageComponent />
        </Suspense>
    )
}
