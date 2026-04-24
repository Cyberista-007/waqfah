
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Play, Podcast, Hash, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCollection } from '@/firebase';
import { Lecture, Program, Series, Book, Shubha, DestructiveSin } from '@/lib/types';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { getVideoIdFromUrl } from '@/lib/utils';
import { SearchSkeleton } from './skeletons';
import Fuse from 'fuse.js';
import { ThreeDTilt } from './ui/three-d-tilt';
import { BookOpen, ShieldAlert, TriangleAlert } from 'lucide-react';

interface ImmersiveSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

type SearchCategory = 'all' | 'lectures' | 'series' | 'programs' | 'books' | 'shubuhat' | 'muhlikat';

export function ImmersiveSearch({ isOpen, onClose }: ImmersiveSearchProps) {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [category, setCategory] = useState<SearchCategory>('all');
    const [results, setResults] = useState<{ 
        lectures: Lecture[], 
        programs: Program[], 
        series: Series[],
        books: Book[],
        shubuhat: Shubha[],
        muhlikat: DestructiveSin[]
    }>({ 
        lectures: [], 
        programs: [], 
        series: [],
        books: [],
        shubuhat: [],
        muhlikat: []
    });
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const { data: allLectures } = useCollection<Lecture>('lectures', { limit: 100 });
    const { data: allPrograms } = useCollection<Program>('programs', { limit: 50 });
    const { data: allSeries } = useCollection<Series>('series', { limit: 50 });
    const { data: allBooks } = useCollection<Book>('books', { limit: 50 });
    const { data: allShubuhat } = useCollection<Shubha>('shubuhat', { limit: 50 });
    const { data: allMuhlikat } = useCollection<DestructiveSin>('muhlikat', { limit: 50 });

    useEffect(() => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) setRecentSearches(JSON.parse(stored));
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setSelectedIndex(-1);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        if (!query) {
            setDebouncedQuery('');
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            setIsSearching(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults({ lectures: [], programs: [], series: [], books: [], shubuhat: [], muhlikat: [] });
            return;
        }

        const fuseOptions = {
            keys: [
                { name: 'title', weight: 0.9 },
                { name: 'name', weight: 0.9 },
                { name: 'description', weight: 0.1 },
                { name: 'bio', weight: 0.1 }
            ],
            threshold: 0.4,
            distance: 100,
            includeMatches: true,
            shouldSort: true,
            minMatchCharLength: 1,
            ignoreLocation: true,
            useExtendedSearch: true
        };

        const q = debouncedQuery.toLowerCase();

        const fuseLectures = new Fuse(allLectures || [], fuseOptions);
        const lectures = fuseLectures.search(q).slice(0, 10).map(r => r.item);

        const fusePrograms = new Fuse(allPrograms || [], fuseOptions);
        const programs = fusePrograms.search(q).slice(0, 5).map(r => r.item);

        const fuseSeries = new Fuse(allSeries || [], fuseOptions);
        const series = fuseSeries.search(q).slice(0, 5).map(r => r.item);

        const fuseBooks = new Fuse(allBooks || [], fuseOptions);
        const books = fuseBooks.search(q).slice(0, 5).map(r => r.item);

        const fuseShubuhat = new Fuse(allShubuhat || [], { ...fuseOptions, keys: ['question', 'summary', 'answer'] });
        const shubuhat = fuseShubuhat.search(q).slice(0, 5).map(r => r.item);

        const fuseMuhlikat = new Fuse(allMuhlikat || [], { ...fuseOptions, keys: ['title', 'dialogTitle', 'concept'] });
        const muhlikat = fuseMuhlikat.search(q).slice(0, 5).map(r => r.item);

        setResults({ lectures, programs, series, books, shubuhat, muhlikat });
        setSelectedIndex(-1);
    }, [debouncedQuery, allLectures, allPrograms, allSeries]);

    const addToRecent = (term: string) => {
        if (!term.trim() || term.startsWith('#')) return;
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const handleSelect = (item: any, type: 'lecture' | 'program' | 'series' | 'book' | 'shubha' | 'muhlika') => {
        addToRecent(debouncedQuery || query || item.title || item.name || item.question);
        
        let path = '';
        switch(type) {
            case 'lecture': path = `/lectures/${item.slug}`; break;
            case 'program': path = `/programs/${item.slug}`; break;
            case 'series': path = `/series/${item.id}`; break;
            case 'book': path = `/books`; break; // Simple link for now, could be deeper
            case 'shubha': path = `/shubuhat`; break;
            case 'muhlika': path = `/muhlikat`; break;
        }
        
        router.push(path);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const allItems = [
            ...results.lectures.map(i => ({ ...i, type: 'lecture' })),
            ...results.programs.map(i => ({ ...i, type: 'program' })),
            ...results.series.map(i => ({ ...i, type: 'series' })),
            ...results.books.map(i => ({ ...i, type: 'book' })),
            ...results.shubuhat.map(i => ({ ...i, type: 'shubha' })),
            ...results.muhlikat.map(i => ({ ...i, type: 'muhlika' }))
        ];
        const totalResults = allItems.length;

        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < totalResults - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        if (e.key === 'Enter') {
            if (selectedIndex >= 0) {
                const selected = allItems[selectedIndex];
                if (selected) handleSelect(selected, (selected as any).type as any);
            } else if (query) {
                addToRecent(query);
                router.push(`/search?q=${encodeURIComponent(query)}`);
                onClose();
            }
        }
    };

    const highlightMatch = (text: string, term: string) => {
        if (!term) return text;
        const parts = text.split(new RegExp(`(${term})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === term.toLowerCase() ? (
                        <span key={i} className="text-primary bg-primary/10 px-0.5 rounded">{part}</span>
                    ) : part
                )}
            </span>
        );
    };

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const categories = [
        { id: 'all', label: 'الكل' },
        { id: 'lectures', label: 'المحاضرات' },
        { id: 'series', label: 'السلاسل' },
        { id: 'programs', label: 'البرامج' },
        { id: 'books', label: 'المكتبة' },
        { id: 'shubuhat', label: 'الشبهات' },
        { id: 'muhlikat', label: 'المهلكات' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-[80px] p-6 md:p-12 overflow-y-auto custom-scrollbar"
                >
                    <div className="container mx-auto max-w-6xl h-full flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-3xl font-black font-headline text-primary italic tracking-tight shadow-glow-primary">وقـــفــــة</div>
                            <button onClick={onClose} className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group">
                                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="relative mb-8">
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    {isSearching && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                                    <Search className="w-8 h-8 text-primary shadow-glow-primary opacity-50" />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="ما الذي تبحث عنه..."
                                    className="w-full h-24 md:h-32 bg-transparent text-3xl md:text-5xl lg:text-7xl font-black text-white placeholder:text-white/10 outline-none ps-24 pe-6 border-b-2 border-white/5 focus:border-primary transition-all duration-500"
                                />
                            </motion.div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-12 animate-reveal" dir="rtl">
                            {categories.map((cat, i) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id as SearchCategory)}
                                    className={cn(
                                        "px-6 py-2 rounded-full border transition-all text-sm font-bold active:scale-95",
                                        category === cat.id
                                            ? "bg-primary border-primary text-primary-foreground shadow-glow-primary"
                                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                    )}
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 text-right mb-20" dir="rtl">
                            <div className="lg:col-span-8 space-y-10">
                                {isSearching ? (
                                    <SearchSkeleton />
                                ) : (debouncedQuery ? (
                                    <>
                                        {(category === 'all' || category === 'lectures') && results.lectures.length > 0 && (
                                            <section>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-3">
                                                    <div className="h-px w-8 bg-white/10" /> المحاضرات
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {results.lectures.map((lec, idx) => {
                                                        const isSelected = idx === selectedIndex;
                                                        const videoId = getVideoIdFromUrl(lec.youtubeUrl);
                                                        const placeholder = getPlaceholderImage(lec.imageId);
                                                        const imageUrl = videoId
                                                            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                                            : placeholder?.imageUrl || `https://picsum.photos/seed/${lec.slug}/400/225`;
                                                        const isExpanded = expandedItems.has(lec.id);

                                                        return (
                                                            <ThreeDTilt key={lec.id} tiltMax={10}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    layout
                                                                    onClick={() => handleSelect(lec, 'lecture')}
                                                                    className={cn(
                                                                        "group flex gap-4 p-5 rounded-[2rem] border transition-all cursor-pointer overflow-hidden items-start h-full",
                                                                        isSelected ? "bg-primary/20 border-primary shadow-glow-primary" : "bg-white/5 border-white/5 hover:bg-white/10"
                                                                    )}
                                                                >
                                                                    <div className="relative w-24 h-14 rounded-2xl overflow-hidden shrink-0 shadow-2xl mt-1">
                                                                        <Image fill src={imageUrl} alt={lec.title} className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                    </div>
                                                                    <div className="flex flex-col justify-center overflow-hidden flex-grow">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <motion.div 
                                                                                layout
                                                                                className={cn(
                                                                                    "font-bold text-white group-hover:text-primary transition-all duration-300 pr-1",
                                                                                    isExpanded ? "line-clamp-none" : "line-clamp-1"
                                                                            )}>
                                                                                {highlightMatch(lec.title, debouncedQuery)}
                                                                            </motion.div>
                                                                            {lec.title.length > 30 && (
                                                                                <button 
                                                                                    onClick={(e) => toggleExpand(e, lec.id)}
                                                                                    className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-primary transition-colors mt-0.5"
                                                                                >
                                                                                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-[10px] text-white/40 uppercase font-black">{lec.programName}</div>
                                                                    </div>
                                                                </motion.div>
                                                            </ThreeDTilt>
                                                        )
                                                    })}
                                                </div>
                                            </section>
                                        )}

                                        {(category === 'all' || category === 'series') && results.series.length > 0 && (
                                            <section>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-3">
                                                    <div className="h-px w-8 bg-white/10" /> السلاسل العلمية
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {results.series.map((ser, idx) => {
                                                        const selectOffset = results.lectures.length + idx;
                                                        const isSelected = selectOffset === selectedIndex;
                                                        return (
                                                            <ThreeDTilt key={ser.id} tiltMax={10}>
                                                                <div onClick={() => handleSelect(ser, 'series')} className={cn("flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer group h-full", isSelected ? "bg-primary/20 border-primary" : "bg-white/5 border-transparent hover:border-white/10")}>
                                                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                                                                        <Hash className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="font-bold text-white/80">{highlightMatch(ser.title, debouncedQuery)}</div>
                                                                </div>
                                                            </ThreeDTilt>
                                                        )
                                                    })}
                                                </div>
                                            </section>
                                        )}

                                        {(category === 'all' || category === 'programs') && results.programs.length > 0 && (
                                            <section>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-3">
                                                    <div className="h-px w-8 bg-white/10" /> البرامج الدعوية
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {results.programs.map((prog, idx) => {
                                                        const selectOffset = results.lectures.length + results.series.length + idx;
                                                        const isSelected = selectOffset === selectedIndex;
                                                        return (
                                                            <ThreeDTilt key={prog.id} tiltMax={10}>
                                                                <div onClick={() => handleSelect(prog, 'program')} className={cn("flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer group h-full", isSelected ? "bg-primary/20 border-primary" : "bg-white/5 border-transparent hover:border-white/10")}>
                                                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                                                                        <Podcast className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="font-bold text-white/80">{highlightMatch(prog.name, debouncedQuery)}</div>
                                                                </div>
                                                            </ThreeDTilt>
                                                        )
                                                    })}
                                                </div>
                                            </section>
                                        )}

                                        {(category === 'all' || category === 'books') && results.books.length > 0 && (
                                            <section>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-3">
                                                    <div className="h-px w-8 bg-white/10" /> المكتبة الرقمية
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {results.books.map((book, idx) => {
                                                        const selectOffset = results.lectures.length + results.series.length + results.programs.length + idx;
                                                        const isSelected = selectOffset === selectedIndex;
                                                        return (
                                                            <ThreeDTilt key={book.id} tiltMax={10}>
                                                                <div onClick={() => handleSelect(book, 'book')} className={cn("flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer group h-full", isSelected ? "bg-primary/20 border-primary" : "bg-white/5 border-transparent hover:border-white/10")}>
                                                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                                                                        <BookOpen className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="font-bold text-white/80">{highlightMatch(book.title, debouncedQuery)}</div>
                                                                </div>
                                                            </ThreeDTilt>
                                                        )
                                                    })}
                                                </div>
                                            </section>
                                        )}

                                        {(category === 'all' || category === 'shubuhat') && results.shubuhat.length > 0 && (
                                            <section>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-3">
                                                    <div className="h-px w-8 bg-white/10" /> تفنيد الشبهات
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {results.shubuhat.map((shubha, idx) => {
                                                        const selectOffset = results.lectures.length + results.series.length + results.programs.length + results.books.length + idx;
                                                        const isSelected = selectOffset === selectedIndex;
                                                        return (
                                                            <ThreeDTilt key={shubha.id} tiltMax={10}>
                                                                <div onClick={() => handleSelect(shubha, 'shubha')} className={cn("flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer group h-full", isSelected ? "bg-primary/20 border-primary" : "bg-white/5 border-transparent hover:border-white/10")}>
                                                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                                                                        <ShieldAlert className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="font-bold text-white/80">{highlightMatch(shubha.question, debouncedQuery)}</div>
                                                                </div>
                                                            </ThreeDTilt>
                                                        )
                                                    })}
                                                </div>
                                            </section>
                                        )}

                                        {(category === 'all' || category === 'muhlikat') && results.muhlikat.length > 0 && (
                                            <section>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-3">
                                                    <div className="h-px w-8 bg-white/10" /> أمراض القلوب (المهلكات)
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {results.muhlikat.map((muhlika, idx) => {
                                                        const selectOffset = results.lectures.length + results.series.length + results.programs.length + results.books.length + results.shubuhat.length + idx;
                                                        const isSelected = selectOffset === selectedIndex;
                                                        return (
                                                            <ThreeDTilt key={muhlika.id} tiltMax={10}>
                                                                <div onClick={() => handleSelect(muhlika, 'muhlika')} className={cn("flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer group h-full", isSelected ? "bg-primary/20 border-primary" : "bg-white/5 border-transparent hover:border-white/10")}>
                                                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                                                                        <TriangleAlert className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="font-bold text-white/80">{highlightMatch(muhlika.title, debouncedQuery)}</div>
                                                                </div>
                                                            </ThreeDTilt>
                                                        )
                                                    })}
                                                </div>
                                            </section>
                                        )}

                                        {results.lectures.length === 0 && results.series.length === 0 && results.programs.length === 0 && results.books.length === 0 && results.shubuhat.length === 0 && results.muhlikat.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-20 text-white/10">
                                                <Search className="w-20 h-20 mb-6 opacity-5" />
                                                <h2 className="text-3xl font-black italic tracking-tighter">لم نعثر على كنوز مطابقة...</h2>
                                                <p className="mt-2 text-white/20">جرب البحث بكلمات أبسط أو التحقق من الإملاء.</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 text-white/5">
                                        <Search className="w-32 h-32 mb-8 opacity-5 animate-pulse" />
                                        <h2 className="text-5xl font-black italic tracking-tighter mix-blend-overlay">اكتشف العلم</h2>
                                    </div>
                                ))}
                            </div>

                            <div className="lg:col-span-4 space-y-12">
                                {recentSearches.length > 0 && !query && (
                                    <section className="bg-white/5 rounded-[3.5rem] p-10 border border-white/5">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">عمليات البحث الأخيرة</h4>
                                            <button 
                                                onClick={clearRecentSearches}
                                                className="text-[10px] font-black text-primary/40 hover:text-primary transition-colors hover:underline"
                                            >
                                                مسح الكل
                                            </button>
                                        </div>
                                        <div className="space-y-5">
                                            {recentSearches.map((term, i) => (
                                                <button key={i} onClick={() => setQuery(term)} className="flex items-center gap-4 w-full text-white/50 hover:text-primary transition-all text-right group">
                                                    <Loader2 className="w-4 h-4 opacity-10 group-hover:rotate-180 transition-transform duration-700" />
                                                    <span className="font-bold">{term}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className="bg-primary/10 rounded-[4rem] p-12 border border-primary/20 relative overflow-hidden group">
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all duration-1000" />
                                    <h4 className="text-primary font-black mb-8 text-2xl flex items-center gap-3">
                                        <Sparkles className="w-8 h-8 shadow-glow-primary" /> الأكثر رواجاً
                                    </h4>
                                    <div className="flex flex-wrap gap-2 relative z-10">
                                        {['#فقه', '#تفسير', '#سيرة', '#رقائق', '#فلسطين', '#عقيدة'].map(tag => (
                                            <button key={tag} onClick={() => setQuery(tag)} className="px-6 py-3 rounded-2xl bg-black/40 hover:bg-primary text-white/60 hover:text-white transition-all text-sm font-black tracking-tighter">
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
