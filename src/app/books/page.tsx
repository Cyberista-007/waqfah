'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { Book } from '@/lib/types';
import { Book as BookIcon, Loader2, Trash2, Search, Download, Eye, Sparkles, Library, Bookmark, Zap, X, ChevronDown, BarChart3, Users } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { useToast } from '@/hooks/use-toast';
import { useSync } from '@/hooks/useSync';
import { doc, runTransaction } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CosmicLibrary } from '@/components/books/cosmic-library';

// ─── Skeleton ───────────────────────────────────────────────
function BooksListSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                    <div className="aspect-[3/4] w-full bg-white/[0.04] border border-white/5 rounded-2xl" />
                    <div className="space-y-2 px-1">
                        <div className="h-4 bg-white/10 rounded-full w-3/4" />
                        <div className="h-3 bg-white/5 rounded-full w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Book Card ───────────────────────────────────────────────
function BookCard({
    book, idx, favorites, readingProgress, toggleFavorite, updateProgress, isAdmin, onDelete
}: {
    book: Book; idx: number; favorites: string[]; readingProgress: Record<string, number>;
    toggleFavorite: (id: string) => void; updateProgress: (id: string, p: number) => void;
    isAdmin: boolean; onDelete: (b: Book) => void;
}) {
    const isFav = favorites.includes(book.id);
    const progress = readingProgress[book.id];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: idx * 0.04, duration: 0.4 }}
            className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-1.5 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/10"
        >
            {/* Cover */}
            <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
                <Image
                    src={book.imageUrl || `https://picsum.photos/seed/${book.slug || book.id}/300/420`}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Progress badge */}
                {progress && (
                    <div className="absolute top-0 right-3 w-9 h-10 bg-primary flex items-end justify-center pb-1.5 rounded-b-xl shadow-lg z-20">
                        <span className="text-[9px] font-black text-black leading-none">ص{progress}</span>
                    </div>
                )}

                {/* Category */}
                {(book.programName || (book as any).category) && (
                    <div className="absolute top-2 left-2 z-20">
                        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
                            {book.programName || (book as any).category}
                        </span>
                    </div>
                )}

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 z-30 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-400">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center hover:scale-110 transition-all shadow-2xl hover:bg-primary hover:text-white">
                                <Eye className="w-5 h-5" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl w-full h-[92vh] p-0 bg-[#09090b] border-white/10 overflow-hidden flex flex-col rounded-t-[2rem] md:rounded-[2.5rem]">
                            <DialogHeader className="p-3 md:p-5 border-b border-white/5 bg-[#0c0c0e] flex flex-row items-center justify-between gap-4 shrink-0">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <BookIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <DialogTitle className="text-lg font-black text-white truncate">{book.title}</DialogTitle>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                                        <span className="text-[10px] font-black text-white/30 uppercase">الصفحة</span>
                                        <input
                                            type="number"
                                            defaultValue={progress || 1}
                                            className="w-12 h-7 bg-white/5 border border-white/10 rounded-lg text-center text-xs font-black text-white outline-none focus:bg-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            onChange={e => updateProgress(book.id, parseInt(e.target.value))}
                                        />
                                    </div>
                                    <button onClick={() => toggleFavorite(book.id)} className={cn("h-9 w-9 rounded-xl border flex items-center justify-center transition-all", isFav ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white")}>
                                        <Bookmark className={cn("w-4 h-4", isFav && "fill-red-500")} />
                                    </button>
                                    <a href={book.pdfUrl} target="_blank" download className="h-9 px-4 rounded-xl bg-primary text-black font-black text-xs flex items-center gap-1.5 hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                                        <Download className="w-3.5 h-3.5" /> تحميل
                                    </a>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 relative overflow-hidden">
                                <a href={book.pdfUrl} target="_blank" className="md:hidden absolute top-3 left-3 z-50 text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white/60 border border-white/10">
                                    فتح في تبويب جديد
                                </a>
                                <embed
                                    src={`${book.pdfUrl}#view=FitH&toolbar=0&navpanes=0`}
                                    type="application/pdf"
                                    className="w-full h-full border-none"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>

                    <button onClick={() => toggleFavorite(book.id)} className={cn("h-10 w-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform", isFav ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white")}>
                        <Bookmark className={cn("w-4 h-4", isFav && "fill-red-500 text-red-500")} />
                    </button>

                    {isAdmin && (
                        <button onClick={() => onDelete(book)} className="h-10 w-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:scale-110 transition-transform">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3.5 flex flex-col gap-1.5 flex-1">
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 text-right">{book.title}</h3>
                <p className="text-[11px] text-white/40 text-right line-clamp-1">{(book as any).author || 'مؤلف غير معروف'}</p>
                <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                    <a href={book.pdfUrl} target="_blank" download className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all">
                        <Download size={12} className="text-white/40 hover:text-primary transition-colors" />
                    </a>
                    {isFav && (
                        <Bookmark className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Books List ──────────────────────────────────────────────
function BooksList() {
    const { data: firestoreBooks, isLoading: isFirestoreLoading } = useCollection<Book>('books', { orderBy: ['title', 'asc'] });
    const [publicBooks, setPublicBooks] = useState<Book[]>([]);
    const [isPublicLoading, setIsPublicLoading] = useState(true);
    const { isAdmin } = useAdminAuth();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const searchRef = useRef<HTMLInputElement>(null);
    const { state: userState, updateState: syncUpdate } = useSync();
    const favorites = userState.favorites;
    const readingProgress = userState.bookProgress;

    useEffect(() => {
        const fetchPublicLibrary = async () => {
            try {
                const url = "https://raw.githubusercontent.com/Cyberista-007/Islamic-Books-Library/main/library.json";
                let res = await fetch(url);
                if (!res.ok) res = await fetch('/data/library.json');
                if (res.ok) {
                    const data = await res.json();
                    if (data.books) {
                        setPublicBooks(data.books.map((b: any) => ({
                            ...b, slug: b.slug || b.id,
                            programName: b.programName || b.category || 'مكتبة عامة',
                            imageUrl: b.imageUrl || b.coverUrl, isPublic: true
                        })));
                    }
                }
            } catch { /* silent */ } finally { setIsPublicLoading(false); }
        };
        fetchPublicLibrary();
    }, []);

    const allBooks = useMemo(() => {
        const list = Array.isArray(firestoreBooks) ? firestoreBooks : [];
        return [...list, ...publicBooks];
    }, [firestoreBooks, publicBooks]);

    const toggleFavorite = (bookId: string) => {
        const newFavs = favorites.includes(bookId) ? favorites.filter(id => id !== bookId) : [...favorites, bookId];
        syncUpdate({ favorites: newFavs });
        toast({ title: favorites.includes(bookId) ? "تمت الإزالة من المفضلة" : "أضيف للمفضلة ❤️" });
    };

    const updateProgress = (bookId: string, page: number) => {
        syncUpdate({ bookProgress: { ...readingProgress, [bookId]: page } });
    };

    const handleDelete = async () => {
        if (!bookToDelete || !firestore) return;
        try {
            await runTransaction(firestore, async (t) => {
                const statsRef = doc(firestore, 'stats', 'global');
                const statsDoc = await t.get(statsRef);
                t.set(statsRef, { books: Math.max(0, (statsDoc.data()?.books || 0) - 1) }, { merge: true });
                t.delete(doc(firestore, 'books', bookToDelete.id));
            });
            toast({ title: "تم الحذف بنجاح" });
        } catch { toast({ variant: "destructive", title: "فشل الحذف" }); }
        finally { setBookToDelete(null); }
    };

    const categories = useMemo(() => {
        const cats = new Set(allBooks.map(b => b.programName || (b as any).category).filter(Boolean));
        return Array.from(cats) as string[];
    }, [allBooks]);

    const filteredBooks = useMemo(() => {
        let result = allBooks;
        if (searchTerm) {
            const t = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(t) ||
                (b.programName || '').toLowerCase().includes(t) ||
                ((b as any).author || '').toLowerCase().includes(t)
            );
        }
        if (selectedCategory === 'favorites') result = result.filter(b => favorites.includes(b.id));
        else if (selectedCategory !== 'all') result = result.filter(b => b.programName === selectedCategory || (b as any).category === selectedCategory);
        return result;
    }, [allBooks, searchTerm, selectedCategory, favorites]);

    const isLoading = isFirestoreLoading && publicBooks.length === 0;

    return (
        <div className="space-y-10">
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: Library, label: 'كتاب ومخطوط', value: allBooks.length > 0 ? `${allBooks.length}+` : '…', color: 'text-primary' },
                    { icon: Bookmark, label: 'كتبي المفضلة', value: favorites.length.toString(), color: 'text-rose-400' },
                    { icon: BarChart3, label: 'في طور القراءة', value: Object.keys(readingProgress).length.toString(), color: 'text-amber-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1.5">
                        <Icon className={cn("w-5 h-5", color)} />
                        <span className="text-2xl font-black text-white">{value}</span>
                        <span className="text-[11px] font-bold text-white/30">{label}</span>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-2xl border border-white/[0.07] rounded-2xl p-3 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="ابحث بالعنوان أو المؤلف..."
                            className="w-full h-12 pr-12 pl-10 bg-white/[0.05] border border-white/[0.07] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-0 w-full sm:w-auto no-scrollbar">
                        {[{ id: 'all', label: 'الكل' }, { id: 'favorites', label: '❤️ المفضلة' }, ...categories.map(c => ({ id: c, label: c }))].map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedCategory(id)}
                                className={cn(
                                    "px-4 h-10 rounded-xl font-bold whitespace-nowrap text-xs transition-all border shrink-0",
                                    selectedCategory === id
                                        ? "bg-primary text-black border-primary shadow-lg shadow-primary/25"
                                        : "bg-white/[0.04] text-white/40 border-white/[0.06] hover:border-white/20 hover:text-white/70"
                                )}
                            >{label}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results count */}
            {!isLoading && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-white/30 font-medium">
                        {filteredBooks.length === 0 ? 'لا توجد نتائج' : `${filteredBooks.length} كتاب`}
                        {searchTerm && <span className="text-primary"> عن "{searchTerm}"</span>}
                    </p>
                </div>
            )}

            {/* Grid */}
            {isLoading ? (
                <BooksListSkeleton />
            ) : filteredBooks.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-center space-y-5">
                    <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-dashed border-white/10 flex items-center justify-center">
                        <Library className="w-9 h-9 text-white/10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black mb-1">لم نعثر على هذا المخطوط</h3>
                        <p className="text-white/25 text-sm">حاول البحث بكلمات أخرى أو تصفح الأقسام المختلفة</p>
                    </div>
                    <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="rounded-xl px-6 border-white/10 text-sm">
                        إعادة تعيين البحث
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    <AnimatePresence mode="popLayout">
                        {filteredBooks.map((book, idx) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                idx={idx}
                                favorites={favorites}
                                readingProgress={readingProgress}
                                toggleFavorite={toggleFavorite}
                                updateProgress={updateProgress}
                                isAdmin={isAdmin}
                                onDelete={setBookToDelete}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <DeleteConfirmationDialog
                isOpen={!!bookToDelete}
                onClose={() => setBookToDelete(null)}
                onConfirm={handleDelete}
                title="حذف الكتاب"
                description={`هل أنت متأكد من رغبتك في حذف كتاب "${bookToDelete?.title}"؟`}
            />
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function BooksPage() {
    return (
        <div className="pb-32 overflow-x-hidden" dir="rtl">
            {/* Hero */}
            <section className="relative mx-3 sm:mx-6 mt-4 sm:mt-6 h-[55vh] min-h-[480px] flex flex-col items-center justify-center text-center overflow-hidden border border-white/[0.07] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
                {/* Background */}
                <div className="absolute inset-0 bg-zinc-950">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_65%)]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.025]" />
                </div>

                {/* Animated orbs */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-1/2 -right-1/4 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />

                <div className="relative z-10 space-y-6 px-4">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-5">
                            <Zap className="w-3.5 h-3.5 fill-primary" />
                            المكتبة العلمية الرقمية
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-headline tracking-tighter text-white drop-shadow-2xl leading-none">
                            رواق <span className="text-primary">المعرفة</span>
                        </h1>
                        <p className="text-base md:text-lg text-white/35 max-w-xl mx-auto font-medium leading-relaxed mt-4 italic">
                            "خيرُ جليسٍ في الزمانِ كتابُ" — تصفح وحمّل كنوز العلم الشرعي
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center gap-8 sm:gap-12 pt-6 border-t border-white/[0.06] w-fit mx-auto"
                    >
                        {[
                            { value: '1,250+', label: 'كتاب ومخطوط', color: 'text-white' },
                            { value: '150k+', label: 'تحميل', color: 'text-primary' },
                            { value: '18', label: 'تخصص شرعي', color: 'text-white' },
                        ].map(({ value, label, color }) => (
                            <div key={label} className="flex flex-col items-center gap-0.5">
                                <span className={cn("text-2xl sm:text-3xl font-black tracking-tighter", color)}>{value}</span>
                                <span className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest">{label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20">
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-0.5 h-10 rounded-full bg-gradient-to-b from-primary to-transparent"
                    />
                </div>
            </section>

            {/* Featured 3D Carousel */}
            <CosmicLibrary />

            {/* Books Grid */}
            <div className="container px-4 mt-16">
                <div className="flex items-center gap-3 mb-10">
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-full">
                        <Library className="w-4 h-4 text-primary" />
                        <span className="text-sm font-black text-white/60">تصفح المكتبة</span>
                    </div>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                </div>
                <BooksList />
            </div>
        </div>
    );
}
