'use client';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  type SpeechRecognition = any;
  type SpeechRecognitionEvent = any;
}
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Play, Podcast, Hash, ArrowRight, Sparkles, ChevronDown, Mic, MicOff } from 'lucide-react';
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
import { useTranslation } from '@/lib/i18n';

interface ImmersiveSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

type SearchCategory = 'all' | 'lectures' | 'series' | 'programs' | 'books' | 'shubuhat' | 'destructive_sins';

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
        destructive_sins: DestructiveSin[]
    }>({ 
        lectures: [], 
        programs: [], 
        series: [],
        books: [],
        shubuhat: [],
        destructive_sins: []
    });
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);

    useEffect(() => {
        const hasApi = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
        setVoiceSupported(hasApi);
    }, []);

    const startVoiceSearch = () => {
        if (!voiceSupported || isListening) return;
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition: SpeechRecognition = new SR();
        recognitionRef.current = recognition;
        recognition.lang = 'ar-SA';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[event.resultIndex];
            const text = result[0].transcript;
            setQuery(text);
            if (result.isFinal) {
                setIsListening(false);
                inputRef.current?.focus();
            }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const stopVoiceSearch = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const { data: allLectures } = useCollection<Lecture>(hasOpened ? 'lectures' : null, { limit: 100, once: true });
    const { data: allPrograms } = useCollection<Program>(hasOpened ? 'programs' : null, { limit: 50, once: true });
    const { data: allSeries } = useCollection<Series>(hasOpened ? 'series' : null, { limit: 50, once: true });
    const { data: allBooks } = useCollection<Book>(hasOpened ? 'books' : null, { limit: 50, once: true });
    const { data: allShubuhat } = useCollection<Shubha>(hasOpened ? 'shubuhat' : null, { limit: 50, once: true });
    const { data: allDestructiveSins } = useCollection<DestructiveSin>(hasOpened ? 'destructive_sins' : null, { limit: 50, once: true });

    useEffect(() => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) setRecentSearches(JSON.parse(stored));
    }, []);

    useEffect(() => {
        if (isOpen) {
            setHasOpened(true);
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
            setResults({ lectures: [], programs: [], series: [], books: [], shubuhat: [], destructive_sins: [] });
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

        const fuseDestructiveSins = new Fuse(allDestructiveSins || [], { ...fuseOptions, keys: ['title', 'dialogTitle', 'concept'] });
        const destructive_sins = fuseDestructiveSins.search(q).slice(0, 5).map(r => r.item);

        setResults({ lectures, programs, series, books, shubuhat, destructive_sins });
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
            case 'muhlika': path = `/muhlikat`; break; // Keeping route as /muhlikat for URL stability
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
            ...results.destructive_sins.map(i => ({ ...i, type: 'muhlika' }))
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

    const { t, isRtl } = useTranslation();

    const categories = [
        { id: 'all', label: t('الكل', 'All') },
        { id: 'lectures', label: t('المحاضرات', 'Lectures') },
        { id: 'series', label: t('السلاسل', 'Series') },
        { id: 'programs', label: t('البرامج', 'Programs') },
        { id: 'books', label: t('المكتبة', 'Library') },
        { id: 'shubuhat', label: t('الشبهات', 'Refutations') },
        { id: 'destructive_sins', label: t('المهلكات', 'Heart Diseases') },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -12 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        dir={isRtl ? 'rtl' : 'ltr'}
                        className="w-full max-w-3xl max-h-[82vh] flex flex-col rounded-3xl bg-card/95 backdrop-blur-2xl border border-border/80 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85)] overflow-hidden"
                    >
                        {/* Compact Top Bar */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <span className="text-base font-black font-headline text-primary">{t('وقفة', 'Waqfah')}</span>
                                <span className="text-xs text-muted-foreground font-bold">• {t('البحث السريع', 'Quick Search')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold border border-border/60">
                                    ESC
                                </kbd>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="إغلاق البحث"
                                    className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center border border-border/60 transition-colors cursor-pointer group"
                                >
                                    <X className="w-4 h-4 text-foreground group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>
                        </div>

                        {/* Compact Search Input */}
                        <div className="px-5 pt-4 pb-3 border-b border-border/50 space-y-3">
                            <div className="relative flex items-center rounded-2xl bg-background/60 border border-border/80 focus-within:border-primary/60 transition-colors">
                                <div className="pr-4 pl-2 flex items-center gap-2 shrink-0">
                                    {isSearching ? (
                                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                    ) : (
                                        <Search className="w-5 h-5 text-primary/70" />
                                    )}
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isListening ? t('جارٍ الاستماع... تحدث الآن', 'Listening... Speak now') : t('ابحث عن محاضرة، سلسلة، برنامج، أو كتاب...', 'Search lectures, series, programs, or books...')}
                                    className="w-full h-12 sm:h-14 bg-transparent text-base sm:text-lg font-bold text-foreground placeholder:text-muted-foreground/60 outline-none pl-12"
                                />
                                {voiceSupported && (
                                    <button
                                        type="button"
                                        onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                                        className={cn(
                                            'absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer',
                                            isListening
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : 'bg-muted/50 border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40'
                                        )}
                                        title={isListening ? 'إيقاف الاستماع' : 'بحث صوتي'}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {isListening && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2.5 px-1">
                                            <div className="flex items-center gap-0.5 h-4">
                                                {[0, 0.1, 0.2, 0.15, 0.05].map((delay, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-1 bg-primary rounded-full"
                                                        animate={{ height: ['4px', '14px', '4px'] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay, ease: 'easeInOut' }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-primary text-xs font-bold">جارٍ التعرف على الصوت...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Compact Category Filter Pills */}
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id as SearchCategory)}
                                        className={cn(
                                            'px-3.5 py-1 rounded-full border transition-all text-xs font-bold cursor-pointer',
                                            category === cat.id
                                                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                                : 'bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                                        )}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scrollable Results & Discovery Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 text-right">
                            {isSearching ? (
                                <SearchSkeleton />
                            ) : debouncedQuery ? (
                                <div className="space-y-6">
                                    {(category === 'all' || category === 'lectures') && results.lectures.length > 0 && (
                                        <section>
                                            <h3 className="text-xs font-black text-muted-foreground mb-3 flex items-center gap-2">
                                                <span>المحاضرات</span>
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                                                    {results.lectures.length}
                                                </span>
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {results.lectures.map((lec, idx) => {
                                                    const isSelected = idx === selectedIndex;
                                                    const videoId = getVideoIdFromUrl(lec.youtubeUrl);
                                                    const placeholder = getPlaceholderImage(lec.imageId);
                                                    const imageUrl = videoId
                                                        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                                        : placeholder?.imageUrl || `https://picsum.photos/seed/${lec.slug}/400/225`;
                                                    const isExpanded = expandedItems.has(lec.id);

                                                    return (
                                                        <div
                                                            key={lec.id}
                                                            onClick={() => handleSelect(lec, 'lecture')}
                                                            className={cn(
                                                                'group flex gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer items-center',
                                                                isSelected
                                                                    ? 'bg-primary/15 border-primary'
                                                                    : 'bg-background/40 border-border/50 hover:bg-muted/60 hover:border-primary/30'
                                                            )}
                                                        >
                                                            <div className="relative w-16 h-11 rounded-xl overflow-hidden shrink-0">
                                                                <Image
                                                                    fill
                                                                    src={imageUrl}
                                                                    alt={lec.title}
                                                                    sizes="64px"
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-1.5">
                                                                    <div
                                                                        className={cn(
                                                                            'font-bold text-sm text-foreground group-hover:text-primary transition-colors',
                                                                            isExpanded ? 'line-clamp-none' : 'line-clamp-1'
                                                                        )}
                                                                    >
                                                                        {highlightMatch(lec.title, debouncedQuery)}
                                                                    </div>
                                                                    {lec.title.length > 30 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => toggleExpand(e, lec.id)}
                                                                            className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-primary shrink-0"
                                                                        >
                                                                            <ChevronDown
                                                                                className={cn(
                                                                                    'w-3.5 h-3.5 transition-transform duration-200',
                                                                                    isExpanded && 'rotate-180'
                                                                                )}
                                                                            />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {lec.programName && (
                                                                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                                                                        {lec.programName}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}

                                    {(category === 'all' || category === 'series') && results.series.length > 0 && (
                                        <section>
                                            <h3 className="text-xs font-black text-muted-foreground mb-3">السلاسل العلمية</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {results.series.map((ser, idx) => {
                                                    const selectOffset = results.lectures.length + idx;
                                                    const isSelected = selectOffset === selectedIndex;
                                                    return (
                                                        <div
                                                            key={ser.id}
                                                            onClick={() => handleSelect(ser, 'series')}
                                                            className={cn(
                                                                'flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer',
                                                                isSelected
                                                                    ? 'bg-primary/15 border-primary'
                                                                    : 'bg-background/40 border-border/50 hover:bg-muted/60 hover:border-primary/30'
                                                            )}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                                <Hash className="w-4 h-4" />
                                                            </div>
                                                            <div className="font-bold text-sm text-foreground truncate">
                                                                {highlightMatch(ser.title, debouncedQuery)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}

                                    {(category === 'all' || category === 'programs') && results.programs.length > 0 && (
                                        <section>
                                            <h3 className="text-xs font-black text-muted-foreground mb-3">البرامج الدعوية</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {results.programs.map((prog, idx) => {
                                                    const selectOffset = results.lectures.length + results.series.length + idx;
                                                    const isSelected = selectOffset === selectedIndex;
                                                    return (
                                                        <div
                                                            key={prog.id}
                                                            onClick={() => handleSelect(prog, 'program')}
                                                            className={cn(
                                                                'flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer',
                                                                isSelected
                                                                    ? 'bg-primary/15 border-primary'
                                                                    : 'bg-background/40 border-border/50 hover:bg-muted/60 hover:border-primary/30'
                                                            )}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                                <Podcast className="w-4 h-4" />
                                                            </div>
                                                            <div className="font-bold text-sm text-foreground truncate">
                                                                {highlightMatch(prog.name, debouncedQuery)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}

                                    {(category === 'all' || category === 'books') && results.books.length > 0 && (
                                        <section>
                                            <h3 className="text-xs font-black text-muted-foreground mb-3">المكتبة الرقمية</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {results.books.map((book, idx) => {
                                                    const selectOffset =
                                                        results.lectures.length + results.series.length + results.programs.length + idx;
                                                    const isSelected = selectOffset === selectedIndex;
                                                    return (
                                                        <div
                                                            key={book.id}
                                                            onClick={() => handleSelect(book, 'book')}
                                                            className={cn(
                                                                'flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer',
                                                                isSelected
                                                                    ? 'bg-primary/15 border-primary'
                                                                    : 'bg-background/40 border-border/50 hover:bg-muted/60 hover:border-primary/30'
                                                            )}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                                <BookOpen className="w-4 h-4" />
                                                            </div>
                                                            <div className="font-bold text-sm text-foreground truncate">
                                                                {highlightMatch(book.title, debouncedQuery)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}

                                    {(category === 'all' || category === 'shubuhat') && results.shubuhat.length > 0 && (
                                        <section>
                                            <h3 className="text-xs font-black text-muted-foreground mb-3">تفنيد الشبهات</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {results.shubuhat.map((shubha, idx) => {
                                                    const selectOffset =
                                                        results.lectures.length +
                                                        results.series.length +
                                                        results.programs.length +
                                                        results.books.length +
                                                        idx;
                                                    const isSelected = selectOffset === selectedIndex;
                                                    return (
                                                        <div
                                                            key={shubha.id}
                                                            onClick={() => handleSelect(shubha, 'shubha')}
                                                            className={cn(
                                                                'flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer',
                                                                isSelected
                                                                    ? 'bg-primary/15 border-primary'
                                                                    : 'bg-background/40 border-border/50 hover:bg-muted/60 hover:border-primary/30'
                                                            )}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                                <ShieldAlert className="w-4 h-4" />
                                                            </div>
                                                            <div className="font-bold text-sm text-foreground truncate">
                                                                {highlightMatch(shubha.question, debouncedQuery)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}

                                    {(category === 'all' || category === 'destructive_sins') && results.destructive_sins.length > 0 && (
                                        <section>
                                            <h3 className="text-xs font-black text-muted-foreground mb-3">أمراض القلوب (المهلكات)</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {results.destructive_sins.map((muhlika, idx) => {
                                                    const selectOffset =
                                                        results.lectures.length +
                                                        results.series.length +
                                                        results.programs.length +
                                                        results.books.length +
                                                        results.shubuhat.length +
                                                        idx;
                                                    const isSelected = selectOffset === selectedIndex;
                                                    return (
                                                        <div
                                                            key={muhlika.id}
                                                            onClick={() => handleSelect(muhlika, 'muhlika')}
                                                            className={cn(
                                                                'flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer',
                                                                isSelected
                                                                    ? 'bg-primary/15 border-primary'
                                                                    : 'bg-background/40 border-border/50 hover:bg-muted/60 hover:border-primary/30'
                                                            )}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                                <TriangleAlert className="w-4 h-4" />
                                                            </div>
                                                            <div className="font-bold text-sm text-foreground truncate">
                                                                {highlightMatch(muhlika.title, debouncedQuery)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}

                                    {results.lectures.length === 0 &&
                                        results.series.length === 0 &&
                                        results.programs.length === 0 &&
                                        results.books.length === 0 &&
                                        results.shubuhat.length === 0 &&
                                        results.destructive_sins.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                                <Search className="w-10 h-10 mb-3 opacity-30" />
                                                <h3 className="text-base font-black text-foreground">لم نعثر على نتائج مطابقة</h3>
                                                <p className="mt-1 text-xs">جرب البحث بكلمات أبسط أو التحقق من الإملاء.</p>
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Trending Tags */}
                                    <section className="bg-primary/10 rounded-2xl p-4 sm:p-5 border border-primary/20">
                                        <h4 className="text-primary font-black mb-3 text-sm flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            <span>{t('الأكثر رواجاً', 'Trending')}</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['#فقه', '#تفسير', '#سيرة', '#رقائق', '#فلسطين', '#عقيدة'].map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => setQuery(tag)}
                                                    className="px-3 py-1.5 rounded-xl bg-background/60 hover:bg-primary text-foreground/80 hover:text-primary-foreground transition-all text-xs font-bold border border-border/50 cursor-pointer"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 ? (
                                        <section className="bg-muted/30 rounded-2xl p-4 sm:p-5 border border-border/60">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-xs font-black text-muted-foreground">عمليات البحث الأخيرة</h4>
                                                <button
                                                    type="button"
                                                    onClick={clearRecentSearches}
                                                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                                                >
                                                    مسح الكل
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                {recentSearches.map((term, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setQuery(term)}
                                                        className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-foreground/80 hover:text-primary hover:bg-muted/60 transition-all text-right cursor-pointer"
                                                    >
                                                        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{term}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    ) : (
                                        <section className="bg-muted/30 rounded-2xl p-4 sm:p-5 border border-border/60 flex flex-col items-center justify-center text-center">
                                            <Search className="w-7 h-7 text-primary/40 mb-2" />
                                            <p className="text-xs font-bold text-muted-foreground">
                                                {t('اكتب أي كلمة للبحث في الدروس والكتب والسلاسل', 'Type any keyword to search lectures, books, and series')}
                                            </p>
                                        </section>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
