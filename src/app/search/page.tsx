'use client';

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Loader2, SearchIcon, Podcast, Book as BookIcon, Filter, Zap, Clock, Globe, LayoutGrid, Sparkles, HelpCircle, ArrowLeft } from "lucide-react";
import { LectureCard } from "@/components/lecture-card";
import { SeriesCard } from "@/components/series-card";
import { ProgramCard } from "@/components/program-card";
import { BookCard } from "@/components/book-card";
import { useCollection } from "@/firebase";
import { Lecture, Series, Program, Book } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Fuse from 'fuse.js';
import { normalizeArabic, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CinematicAppLoader } from "@/components/skeletons";

function SearchPageComponent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const searchTerm = searchParams?.get("q") || "";
    const languageFilter = searchParams?.get('lang') || 'all';
    const durationFilter = searchParams?.get('duration') || 'any';
    const transcriptSearch = searchParams?.get('transcript') === 'true';

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
        if (!debouncedSearch.trim()) return { lectures: [], series: [], programs: [], books: [] };
        
        const fuseOptions = { includeScore: false, threshold: 0.4, ignoreLocation: true, preprocessor: normalizeArabic };

        let filteredLectures = allLectures || [];
        if (languageFilter !== 'all') filteredLectures = filteredLectures.filter(l => l.language === languageFilter);
        if (durationFilter !== 'any') {
            if (durationFilter === 'under30') filteredLectures = filteredLectures.filter(l => l.duration < 1800);
            else if (durationFilter === '30to60') filteredLectures = filteredLectures.filter(l => l.duration >= 1800 && l.duration <= 3600);
            else if (durationFilter === 'over60') filteredLectures = filteredLectures.filter(l => l.duration > 3600);
        }
        const lectureFuse = new Fuse(filteredLectures, { ...fuseOptions, keys: ['title', 'description', 'programName', 'seriesTitle', ...(transcriptSearch ? ['transcript.text'] : [])] });
        
        let filteredSeries = allSeries || [];
        if (languageFilter !== 'all') filteredSeries = filteredSeries.filter(s => s.language === languageFilter);
        const seriesFuse = new Fuse(filteredSeries, { ...fuseOptions, keys: ['title', 'description', 'programName'] });
        
        const programsFuse = new Fuse(allPrograms || [], { ...fuseOptions, keys: ['name', 'bio'] });
        const booksFuse = new Fuse(allBooks || [], { ...fuseOptions, keys: ['title', 'programName'] });
        
        return { 
            lectures: lectureFuse.search(debouncedSearch).map(r => r.item), 
            series: seriesFuse.search(debouncedSearch).map(r => r.item), 
            programs: programsFuse.search(debouncedSearch).map(r => r.item), 
            books: booksFuse.search(debouncedSearch).map(r => r.item) 
        };
    }, [debouncedSearch, allLectures, allSeries, allPrograms, allBooks, languageFilter, durationFilter, transcriptSearch]);

    const hasResults = lectures.length > 0 || series.length > 0 || programs.length > 0 || books.length > 0;

    return (
        <div className="min-h-screen pb-32 overflow-hidden bg-[#050505]">
            {/* 🎭 Atmospheric Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 -translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />
            </div>

            <div className="container relative z-10 px-4">
                {/* 🏛️ Hero Section */}
                <section className="pt-24 pb-16 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner"
                    >
                        <SearchIcon className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 italic">Global Knowledge Explorer</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black font-headline tracking-tighter leading-tight"
                    >
                        {searchTerm.trim() ? (
                            <>نتائج <span className="text-primary italic">البحث</span></>
                        ) : (
                            <>استكشاف <span className="text-primary italic">الشامل</span></>
                        )}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        {searchTerm.trim() ? (
                            <>جاري البحث عن <span className="text-white">"{searchTerm}"</span> في كامل أروقة الموسوعة العلمية والمحاضرات.</>
                        ) : (
                            <>ابحث عن أي كلمة، موضوع، كتاب أو داعية. موسوعة شاملة تضم آلاف الساعات العلمية بين يديك.</>
                        )}
                    </motion.p>
                </section>

                {/* 🎛️ Filter Console */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-5xl mx-auto"
                >
                    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden p-8 mb-16 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                            <div className="md:col-span-4 space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/20 mr-2 flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> اللغة المفضلة
                                </Label>
                                <Select onValueChange={(value) => handleFilterChange("lang", value)} defaultValue={languageFilter}>
                                    <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl font-bold">
                                        <SelectValue placeholder="الكل" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                                        <SelectItem value="all">كل اللغات</SelectItem>
                                        <SelectItem value="ar">العربية</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-4 space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/20 mr-2 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> مدة المادة
                                </Label>
                                <Select onValueChange={(value) => handleFilterChange("duration", value)} defaultValue={durationFilter}>
                                    <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl font-bold">
                                        <SelectValue placeholder="أي مدة" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                                        <SelectItem value="any">أي وقت</SelectItem>
                                        <SelectItem value="under30">أقل من ٣٠ دقيقة</SelectItem>
                                        <SelectItem value="30to60">٣٠ - ٦٠ دقيقة</SelectItem>
                                        <SelectItem value="over60">أكثر من ساعة</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-4 pt-6">
                                <div className="flex items-center space-x-3 space-x-reverse bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <Checkbox 
                                        id="transcript-search" 
                                        checked={transcriptSearch}
                                        onCheckedChange={(checked) => handleFilterChange('transcript', !!checked)}
                                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <Label htmlFor="transcript-search" className="cursor-pointer font-bold text-sm text-white/60 group-hover:text-white transition-colors flex-1">
                                        البحث في التفريغ النصي
                                    </Label>
                                    <HelpCircle className="w-4 h-4 text-white/10" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-32 space-y-8">
                        <Loader2 className="animate-spin h-12 w-12 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">جاري مسح قواعد البيانات...</p>
                    </div>
                ) : searchTerm.trim() ? (
                    <div className="space-y-24">
                        {/* Programs */}
                        {programs.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400"><Podcast className="w-6 h-6" /></div>
                                    <h2 className="text-3xl font-black font-headline">البرامج <span className="text-white/20 font-sans text-sm mr-2">{programs.length}</span></h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {programs.map((p, index) => <ProgramCard key={p.id} program={p} index={index} />)}
                                </div>
                            </motion.section>
                        )}

                        {/* Series */}
                        {series.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400"><LayoutGrid className="w-6 h-6" /></div>
                                    <h2 className="text-3xl font-black font-headline">السلاسل <span className="text-white/20 font-sans text-sm mr-2">{series.length}</span></h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {series.map((s, index) => <SeriesCard key={s.id} series={s} index={index} />)}
                                </div>
                            </motion.section>
                        )}

                        {/* Lectures */}
                        {lectures.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><Zap className="w-6 h-6" /></div>
                                    <h2 className="text-3xl font-black font-headline">المحاضرات <span className="text-white/20 font-sans text-sm mr-2">{lectures.length}</span></h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {lectures.map((lecture, index) => <LectureCard key={lecture.id} lecture={lecture} index={index} />)}
                                </div>
                            </motion.section>
                        )}

                        {/* Books */}
                        {books.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400"><BookIcon className="w-6 h-6" /></div>
                                    <h2 className="text-3xl font-black font-headline">الكتب <span className="text-white/20 font-sans text-sm mr-2">{books.length}</span></h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                                    {books.map((b, index) => <BookCard key={b.id} book={b} index={index} />)}
                                </div>
                            </motion.section>
                        )}
            
                        {!hasResults && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-32 bg-white/5 border-2 border-dashed border-white/10 rounded-[4rem] space-y-8"
                            >
                                <div className="flex justify-center">
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        <SearchIcon className="h-12 w-12 text-white/10" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black font-headline text-white/40">لا توجد نتائج مطابقة</h3>
                                    <p className="text-white/20 font-medium max-w-md mx-auto leading-relaxed italic">
                                        لم نجد نتائج للبحث عن <span className="text-white">"{searchTerm}"</span>. حاول البحث بكلمات أبسط أو استخدم التصنيفات المتاحة.
                                    </p>
                                </div>
                                <Button onClick={() => router.push('/lectures')} variant="outline" className="rounded-2xl px-12 h-14 border-white/10 font-black hover:bg-white/5 transition-all gap-3">
                                    استعرض كل المحاضرات <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto py-32 text-center space-y-12"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "بحث متقدم", icon: Sparkles, desc: "بحث في العناوين والوصف وحتى داخل التفريغ النصي للمحاضرات." },
                                { title: "تصفية ذكية", icon: Filter, desc: "فلترة النتائج حسب اللغة والمدة والنوع لسهولة الوصول." },
                                { title: "شامل لكل الأقسام", icon: Globe, desc: "نتائج موحدة تشمل الكتب، المحاضرات، البرامج والسلاسل العلمية." },
                            ].map((item, i) => (
                                <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-lg font-black font-headline">{item.title}</h4>
                                    <p className="text-white/20 text-sm font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
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
    )
}

