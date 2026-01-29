'use client';
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { Loader2, SearchIcon, Podcast, Book as BookIcon } from "lucide-react";
import { LectureCard } from "@/components/lecture-card";
import { SeriesCard } from "@/components/series-card";
import { ProgramCard } from "@/components/program-card";
import { BookCard } from "@/components/book-card";
import { useCollection } from "@/firebase";
import { Lecture, Series, Program, Book } from "@/lib/types";

function SearchPageComponent() {
    const searchParams = useSearchParams();
    const searchTerm = searchParams?.get("q") || "";

    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');
    const { data: allBooks, isLoading: booksLoading } = useCollection<Book>('books');

    const isLoading = lecturesLoading || seriesLoading || programsLoading || booksLoading;

    const { lectures, series, programs, books } = useMemo(() => {
        if (!searchTerm) {
            return { lectures: [], series: [], programs: [], books: [] };
        }
        
        const searchTermLower = searchTerm.toLowerCase();
        const filteredLectures = (allLectures || []).filter(l => 
            (l.title || '').toLowerCase().includes(searchTermLower) || 
            (l.description || '').toLowerCase().includes(searchTermLower) ||
            (l.programName || '').toLowerCase().includes(searchTermLower) ||
            (l.seriesTitle || '').toLowerCase().includes(searchTermLower)
        );
        const filteredSeries = (allSeries || []).filter(s => 
            (s.title || '').toLowerCase().includes(searchTermLower) ||
            (s.description || '').toLowerCase().includes(searchTermLower) ||
            (s.programName || '').toLowerCase().includes(searchTermLower)
        );
        const filteredPrograms = (allPrograms || []).filter(p => 
            (p.name || '').toLowerCase().includes(searchTermLower) ||
            (p.bio || '').toLowerCase().includes(searchTermLower)
        );
        const filteredBooks = (allBooks || []).filter(b => 
            (b.title || '').toLowerCase().includes(searchTermLower)
        );
        
        return { 
            lectures: filteredLectures, 
            series: filteredSeries, 
            programs: filteredPrograms, 
            books: filteredBooks 
        };
    }, [searchTerm, allLectures, allSeries, allPrograms, allBooks]);

    const hasResults = lectures.length > 0 || series.length > 0 || programs.length > 0 || books.length > 0;

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
                <SearchIcon />
                نتائج البحث عن: <span className="text-primary">"{searchTerm}"</span>
            </h1>

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
        
                    {!hasResults && searchTerm && (
                         <div className="text-center py-16">
                            <p className="text-lg text-muted-foreground">
                                لم يتم العثور على نتائج للبحث عن: <span className="font-bold text-foreground">"{searchTerm}"</span>
                            </p>
                        </div>
                    )}
                </div>
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
