"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LectureCard } from "@/components/lecture-card";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCollection } from "@/firebase";
import type { Lecture, Series } from "@/lib/types";
import { CinematicAppLoader } from "@/components/skeletons";
import { useMemo, useState, Suspense } from "react";
import { Search, Sparkles, Play, Clock, Users, Headphones, Zap, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import Fuse from 'fuse.js';
import { normalizeArabic } from "@/lib/utils";
import { Pagination } from "@/components/pagination";
import { motion, AnimatePresence } from "framer-motion";
import LecturePageClient from "./[slug]/LecturePageClient";

const ITEMS_PER_PAGE = 12;

function LecturesListPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle SPA sub-routing for Electron
  const pathParts = pathname.split('/').filter(Boolean);
  const isIndividualLecture = pathParts.length > 1;

  if (isIndividualLecture) {
    return <LecturePageClient />;
  }

  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'] });
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });

  const currentPage = Number(searchParams.get('page')) || 1;
  const seriesFilter = searchParams.get('series');
  const sortOrder = searchParams.get('sort') || 'newest';
  
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (type: 'series' | 'sort', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', '1'); 

    if (value === "all") {
      current.delete(type);
    } else {
      current.set(type, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  const handlePageChange = (page: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', page.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    window.scrollTo(0, 0); 
    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const filteredLectures = useMemo(() => {
    if (!allLectures) return [];
    
    let lectures = [...allLectures];
    
    if (seriesFilter && seriesFilter !== 'all') {
      lectures = lectures.filter(l => l.seriesId === seriesFilter);
    }

    if (searchTerm) {
        const fuseOptions = {
          includeScore: false,
          keys: ['title', 'description', 'programName', 'seriesTitle'],
          threshold: 0.4,
          ignoreLocation: true,
          getFn: (obj: any, path: string | string[]) => {
            const value = (Fuse as any).defaultGetFn(obj, path);
            if (typeof value === 'string') return normalizeArabic(value);
            return value;
          }
        };
        const fuse = new Fuse(lectures, fuseOptions);
        lectures = fuse.search(normalizeArabic(searchTerm)).map(result => result.item);
    }
    
    lectures.sort((a, b) => {
      const toDate = (ts: any) => ts && typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
      const dateA = toDate(a.createdAt);
      const dateB = toDate(b.createdAt);
      
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }

      switch (sortOrder) {
          case 'oldest':
              return dateA.getTime() - dateB.getTime();
          case 'most_popular':
              return (b.viewCount || 0) - (a.viewCount || 0);
          case 'alphabetical':
              return a.title.localeCompare(b.title, 'ar');
          case 'newest':
          default:
              return dateB.getTime() - dateA.getTime();
      }
    });

    return lectures;

  }, [allLectures, seriesFilter, sortOrder, searchTerm]);

  const totalPages = Math.ceil(filteredLectures.length / ITEMS_PER_PAGE);
  const lecturesForPage = filteredLectures.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const isLoading = lecturesLoading || seriesLoading;

  if (isLoading) {
    return <CinematicAppLoader />;
  }

  return (
    <div className="min-h-screen pb-20 overflow-hidden" dir="rtl">
        {/* Hero Section */}
        <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 pt-16 pb-24 overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl bg-white/[0.02]">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner"
                    >
                        <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400/80 italic">Islamic Knowledge Library</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-tight"
                    >
                        مكتبة <span className="text-primary italic">المحاضرات</span> الشاملة
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        استكشف آلاف الساعات من الدروس العلمية والمحاضرات الدعوية لنخبة من العلماء والمحاضرين.
                    </motion.p>

                    {/* Quick Stats */}
                    <motion.div 
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
                    >
                        {[
                            { label: 'محاضرة', value: '3,500+', icon: Play, color: 'text-primary' },
                            { label: 'مستمع', value: '15K+', icon: Headphones, color: 'text-emerald-400' },
                            { label: 'ساعة علم', value: '2,000+', icon: Clock, color: 'text-amber-400' },
                            { label: 'داعية ومحاضر', value: '20+', icon: Users, color: 'text-blue-400' },
                        ].map((stat, i) => (
                            <motion.div 
                                key={i} 
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="p-6 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] hover:bg-white/10 transition-colors group"
                            >
                                <div className={`mb-3 flex justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="text-3xl font-black mb-1 tabular-nums">{stat.value}</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Filters & Content */}
        <main className="container mx-auto px-6 space-y-12">
            {/* Search and Filters Bar (Glassy & Premium) */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="relative w-full lg:w-[450px] group/search">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500 group-focus-within/search:text-primary transition-all duration-300" />
                    <Input 
                        placeholder="ابحث عن محاضرة بالاسم أو المضمون..." 
                        className="pr-14 h-16 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-bold text-lg shadow-inner text-right"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                         <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 z-10 pointer-events-none" />
                        <Select onValueChange={(value) => handleFilterChange("series", value)} defaultValue={seriesFilter || "all"}>
                        <SelectTrigger className="h-14 pr-10 bg-white/5 border-white/5 rounded-xl font-bold">
                            <SelectValue placeholder="فلترة حسب السلسلة" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                            <SelectItem value="all">كل السلاسل</SelectItem>
                            {allSeries?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="relative w-full sm:w-64">
                         <Zap className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 z-10 pointer-events-none" />
                        <Select onValueChange={(value) => handleFilterChange("sort", value)} defaultValue={sortOrder}>
                        <SelectTrigger className="h-14 pr-10 bg-white/5 border-white/5 rounded-xl font-bold">
                            <SelectValue placeholder="فرز حسب" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                            <SelectItem value="newest">الأحدث أولاً</SelectItem>
                            <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                            <SelectItem value="most_popular">الأكثر استماعاً</SelectItem>
                            <SelectItem value="alphabetical">أبجدي (أ-ي)</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Grid Container */}
            <AnimatePresence mode="popLayout">
                {lecturesForPage.length > 0 ? (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                    >
                        {lecturesForPage.map((lecture, index) => (
                            <LectureCard key={lecture.id} lecture={lecture} index={index} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]"
                    >
                        <div className="flex justify-center mb-6">
                            <Search className="h-16 w-16 text-zinc-700" />
                        </div>
                        <p className="text-2xl font-black text-zinc-500">لا توجد محاضرات تطابق خياراتك.</p>
                        <button 
                            onClick={() => { setSearchTerm(''); handleFilterChange('series', 'all'); }}
                            className="mt-4 text-primary font-bold hover:underline"
                        >
                            إعادة ضبط الفلاتر
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center pt-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </main>
    </div>
  );
}

export default function LecturesPage() {
    return (
        <Suspense fallback={<CinematicAppLoader />}>
            <LecturesListPageClient />
        </Suspense>
    );
}
