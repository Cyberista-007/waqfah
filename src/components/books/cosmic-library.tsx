'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Book, ChevronRight, ChevronLeft, Sparkles, Star, Quote, Play, Pause, BookOpen, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURED_BOOKS = [
    { 
        id: '1', 
        title: 'الرحيق المختوم', 
        author: 'صفي الرحمن المباركفوري', 
        category: 'السيرة النبوية',
        desc: 'الكتاب الفائز بالمركز الأول في مسابقة السيرة النبوية عام 1979م، أسلوب ماتع وبحث علمي رصين.',
        pages: 568, readers: '2.1M',
        color: 'from-amber-600 via-amber-700 to-amber-900', 
        glowColor: 'rgba(245,158,11,0.4)',
        spineColor: 'from-amber-800 to-amber-950',
        accent: 'text-amber-300',
        badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        coverImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Al-Raheeq_Al-Makhtum.jpg/800px-Al-Raheeq_Al-Makhtum.jpg',
        rating: 4.9,
        quote: 'خيرُ كتاب في السيرة النبوية في العصر الحديث'
    },
    { 
        id: '2', 
        title: 'زاد المعاد', 
        author: 'ابن قيم الجوزية',
        category: 'الفقه والسلوك',
        desc: 'موسوعة شاملة في هدي النبي ﷺ وسنته في كل شؤون الحياة، من أعظم ما كُتب في الإسلام.',
        pages: 1200, readers: '1.8M',
        color: 'from-emerald-600 via-emerald-700 to-emerald-900', 
        glowColor: 'rgba(16,185,129,0.4)',
        spineColor: 'from-emerald-800 to-emerald-950',
        accent: 'text-emerald-300',
        badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        coverImg: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80',
        rating: 4.8,
        quote: 'كتاب جامع لعلم السنة في أسلوب بديع'
    },
    { 
        id: '3', 
        title: 'البداية والنهاية', 
        author: 'ابن كثير',
        category: 'التاريخ الإسلامي',
        desc: 'الموسوعة التاريخية الكبرى التي تبدأ من الخلق وتنتهي بأحداث القرن الثامن الهجري.',
        pages: 2400, readers: '890K',
        color: 'from-blue-600 via-blue-700 to-blue-900', 
        glowColor: 'rgba(59,130,246,0.4)',
        spineColor: 'from-blue-800 to-blue-950',
        accent: 'text-blue-300',
        badge: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
        coverImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        rating: 4.9,
        quote: 'أعظم موسوعة تاريخية إسلامية على الإطلاق'
    },
    { 
        id: '4', 
        title: 'رياض الصالحين', 
        author: 'الإمام النووي',
        category: 'الحديث والآداب',
        desc: 'مجموعة مختارة من أحاديث النبي ﷺ في الآداب والأخلاق والعبادات، مرجع لا غنى عنه.',
        pages: 780, readers: '3.2M',
        color: 'from-rose-600 via-rose-700 to-rose-900', 
        glowColor: 'rgba(244,63,94,0.4)',
        spineColor: 'from-rose-800 to-rose-950',
        accent: 'text-rose-300',
        badge: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
        coverImg: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
        rating: 4.95,
        quote: 'من أكثر كتب الحديث قراءةً وانتشاراً في العالم'
    },
    { 
        id: '5', 
        title: 'إحياء علوم الدين', 
        author: 'الإمام الغزالي',
        category: 'التزكية والسلوك',
        desc: 'تحفة إسلامية في تزكية النفوس وتهذيب الأخلاق، أعظم كتاب في علم الأخلاق الإسلامي.',
        pages: 1600, readers: '1.4M',
        color: 'from-purple-600 via-purple-700 to-purple-900', 
        glowColor: 'rgba(168,85,247,0.4)',
        spineColor: 'from-purple-800 to-purple-950',
        accent: 'text-purple-300',
        badge: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
        coverImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
        rating: 4.85,
        quote: 'كاد إحياء العلوم يكون قرآناً'
    },
];

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(s => (
            <Star key={s} className={cn("w-3 h-3", s <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-white/20")} />
        ))}
        <span className="text-xs font-bold text-white/60 mr-1">{rating}</span>
    </div>
);

export function CosmicLibrary() {
    const [activeIndex, setActiveIndex] = useState(2);
    const [isClient, setIsClient] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const dragStartX = useRef(0);

    useEffect(() => { setIsClient(true); }, []);

    const next = useCallback(() => setActiveIndex((p) => (p + 1) % FEATURED_BOOKS.length), []);
    const prev = useCallback(() => setActiveIndex((p) => (p - 1 + FEATURED_BOOKS.length) % FEATURED_BOOKS.length), []);

    // Auto-play
    useEffect(() => {
        if (!isPlaying) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
        intervalRef.current = setInterval(next, 4000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isPlaying, next]);

    const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        setIsPlaying(false);
        dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };
    const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
        const diff = dragStartX.current - endX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        setTimeout(() => setIsPlaying(true), 2000);
    };

    const activeBook = FEATURED_BOOKS[activeIndex];

    if (!isClient) return null;

    return (
        <section 
            className="py-24 relative overflow-hidden min-h-[750px] flex flex-col justify-center border-y border-white/[0.04]" 
            dir="rtl"
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
        >
            {/* Cosmic Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none z-[1]" />
            
            {/* Dynamic Glow that follows active book */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeIndex}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[150px] opacity-30 pointer-events-none z-0"
                    style={{ background: activeBook.glowColor }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.3, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                />
            </AnimatePresence>

            {/* Starfield */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-0.5 h-0.5 rounded-full bg-white"
                        style={{ 
                            top: `${Math.random() * 100}%`, 
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.1
                        }}
                        animate={{ opacity: [0.1, 0.6, 0.1] }}
                        transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
                    />
                ))}
            </div>

            {/* Header */}
            <div className="container mx-auto px-4 text-center mb-16 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-[0.4em] mb-6"
                >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    أمهات الكتب المختارة
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 font-headline mb-3 tracking-tighter"
                >
                    مكتبة النور
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-white/40 text-base font-medium max-w-lg mx-auto"
                >
                    تصفح أمهات الكتب في فضاء المعرفة، حيث كل كتاب كوكب يضيء عقلك.
                </motion.p>
            </div>

            {/* 3D Carousel */}
            <div className="relative w-full h-[420px] flex items-center justify-center z-10 select-none">
                {FEATURED_BOOKS.map((book, idx) => {
                    const offset = idx - activeIndex;
                    let visualOffset = offset;
                    if (offset > 2) visualOffset -= FEATURED_BOOKS.length;
                    if (offset < -2) visualOffset += FEATURED_BOOKS.length;
                    const absOffset = Math.abs(visualOffset);
                    const isCenter = visualOffset === 0;
                    const scale = isCenter ? 1 : 1 - absOffset * 0.18;
                    const rotateY = visualOffset * -28;
                    const translateX = visualOffset * 260;
                    const opacity = absOffset > 2 ? 0 : isCenter ? 1 : 1 - absOffset * 0.35;
                    const zIndex = 100 - absOffset * 10;

                    return (
                        <motion.div
                            key={book.id}
                            className="absolute top-0 left-1/2 w-[220px] md:w-[280px] h-[360px] md:h-[400px] cursor-pointer transform-gpu"
                            initial={false}
                            animate={{
                                x: `calc(-50% + ${translateX}px)`,
                                rotateY: `${rotateY}deg`,
                                scale,
                                zIndex,
                                opacity,
                                y: isCenter ? [0, -10, 0] : 0
                            }}
                            transition={{
                                type: 'spring', stiffness: 120, damping: 22,
                                y: isCenter ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : undefined
                            }}
                            onClick={() => {
                                if (!isDragging) setActiveIndex(idx);
                                setIsPlaying(false);
                                setTimeout(() => setIsPlaying(true), 3000);
                            }}
                        >
                            <div className={cn(
                                "w-full h-full rounded-[1.8rem] border border-white/20 relative overflow-hidden transition-all duration-700",
                                isCenter && "ring-1 ring-white/30 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                            )}>
                                {/* Book Cover Image */}
                                <div className={cn("absolute inset-0 bg-gradient-to-br", book.color)} />
                                
                                {/* Spine */}
                                <div className={cn("absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-b opacity-80 border-l border-white/10 z-10", book.spineColor)} />
                                
                                {/* Decorative lines on cover */}
                                <div className="absolute inset-0 overflow-hidden z-5">
                                    <div className="absolute top-8 right-10 left-4 h-px bg-white/10" />
                                    <div className="absolute top-10 right-10 left-4 h-px bg-white/5" />
                                    <div className="absolute bottom-24 right-10 left-4 h-px bg-white/10" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 pr-10 p-6 flex flex-col justify-between z-20">
                                    <div>
                                        <div className={cn("inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mb-4", book.badge)}>
                                            {book.category}
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-white font-headline leading-tight drop-shadow-lg">
                                            {book.title}
                                        </h3>
                                        <p className={cn("text-sm font-bold mt-1 tracking-wide", book.accent)}>
                                            {book.author}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <StarRating rating={book.rating} />
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-white/40">
                                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {book.pages.toLocaleString()} صفحة</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {book.readers}</span>
                                        </div>
                                        {isCenter && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                                            >
                                                <Book className="w-3.5 h-3.5" /> تصفح الكتاب
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {/* Shine overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/10 z-15" />
                                <div className="absolute inset-0 bg-gradient-to-bl from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30 mix-blend-overlay" />
                                
                                {isCenter && (
                                    <Sparkles className="absolute top-5 left-5 w-5 h-5 text-white/50 animate-pulse z-40" />
                                )}
                            </div>
                            {/* Glow reflection */}
                            {isCenter && (
                                <motion.div 
                                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-xl opacity-50"
                                    style={{ background: book.glowColor }}
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Active Book Info Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-20 container mx-auto px-4 mt-10 flex justify-center"
                >
                    <div className="max-w-lg w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-black text-lg text-white mb-0.5">{activeBook.title}</h3>
                                <p className={cn("text-sm font-bold", activeBook.accent)}>{activeBook.author}</p>
                            </div>
                            <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-black border", activeBook.badge)}>
                                {activeBook.category}
                            </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-white/50 leading-relaxed">
                            <Quote className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                            <p>{activeBook.desc}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <StarRating rating={activeBook.rating} />
                            <div className="text-[10px] font-bold text-white/30 italic">"{activeBook.quote}"</div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="relative z-20 mt-8 flex items-center justify-center gap-6">
                <button 
                    onClick={() => { prev(); setIsPlaying(false); setTimeout(() => setIsPlaying(true), 3000); }}
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/15 hover:scale-110 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5">
                    {FEATURED_BOOKS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setActiveIndex(idx); setIsPlaying(false); setTimeout(() => setIsPlaying(true), 3000); }}
                            className={cn("h-1.5 rounded-full transition-all duration-500 cursor-pointer", 
                                idx === activeIndex ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" : "w-2 bg-white/20 hover:bg-white/40"
                            )}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setIsPlaying(p => !p)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button 
                    onClick={() => { next(); setIsPlaying(false); setTimeout(() => setIsPlaying(true), 3000); }}
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/15 hover:scale-110 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
}
