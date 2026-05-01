'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/images';
import type { Book } from '@/lib/types';
import { Book as BookIcon, Loader2, Trash2, Search, Download, Eye, Sparkles, Filter, Library, Layers, Bookmark, ArrowRight, Zap } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore } from '@/firebase';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { useToast } from '@/hooks/use-toast';
import { useSync } from '@/hooks/useSync';
import { doc, runTransaction } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CosmicLibrary } from '@/components/books/cosmic-library';


function BooksListSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 animate-pulse">
                 <div className="aspect-[3/4] w-full bg-white/[0.03] border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
                 </div>
                 <div className="space-y-2 px-2">
                    <div className="h-5 bg-white/10 rounded-full w-3/4" />
                    <div className="h-3 bg-white/5 rounded-full w-1/2" />
                 </div>
              </div>
            ))}
        </div>
    )
}

function BooksList() {
    const { data: firestoreBooks, isLoading: isFirestoreLoading } = useCollection<Book>('books', { orderBy: ['title', 'asc']});
    const [publicBooks, setPublicBooks] = useState<Book[]>([]);
    const [isPublicLoading, setIsPublicLoading] = useState(true);
    const { isAdmin } = useAdminAuth();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    const { state: userState, updateState: syncUpdate } = useSync();
    
    // Derived states for easier usage
    const favorites = userState.favorites;
    const readingProgress = userState.bookProgress;

    useEffect(() => {
        const fetchPublicLibrary = async () => {
            try {
                const PUBLIC_LIB_URL = "https://raw.githubusercontent.com/Cyberista-007/Islamic-Books-Library/main/library.json";
                let res = await fetch(PUBLIC_LIB_URL);
                if (!res.ok) res = await fetch('/data/library.json');

                if (res.ok) {
                    const data = await res.json();
                    if (data.books) {
                        const mapped = data.books.map((b: any) => ({
                            ...b,
                            slug: b.slug || b.id,
                            programName: b.programName || b.category || "مكتبة عامة",
                            imageUrl: b.imageUrl || b.coverUrl,
                            isPublic: true 
                        }));
                        setPublicBooks(mapped);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch library", error);
            } finally {
                setIsPublicLoading(false);
            }
        };
        fetchPublicLibrary();
    }, []);

    const allBooks = useMemo(() => {
        const firestoreList = Array.isArray(firestoreBooks) ? firestoreBooks : [];
        return [...firestoreList, ...publicBooks];
    }, [firestoreBooks, publicBooks]);

    const toggleFavorite = (bookId: string) => {
        const newFavs = favorites.includes(bookId) 
            ? favorites.filter(id => id !== bookId)
            : [...favorites, bookId];
        syncUpdate({ favorites: newFavs });
        toast({ title: favorites.includes(bookId) ? "تمت الإزالة من المفضلة" : "أضيف للمفضلة ❤️" });
    };

    const updateProgress = (bookId: string, page: number) => {
        syncUpdate({ 
            bookProgress: { ...readingProgress, [bookId]: page } 
        });
    };

    const isLoading = isFirestoreLoading && publicBooks.length === 0;

    const filteredBooks = useMemo(() => {
        if (!allBooks || allBooks.length === 0) return [];
        let filtered = allBooks;

        if (searchTerm) {
            const lowTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(lowTerm) ||
                (book.programName || '').toLowerCase().includes(lowTerm) ||
                ((book as any).author || '').toLowerCase().includes(lowTerm) ||
                ((book as any).category || '').toLowerCase().includes(lowTerm)
            );
        }

        if (selectedCategory === 'favorites') {
            filtered = filtered.filter(book => favorites.includes(book.id));
        } else if (selectedCategory !== 'all') {
            filtered = filtered.filter(book => (book.programName === selectedCategory) || ((book as any).category === selectedCategory));
        }

        return filtered;
    }, [allBooks, searchTerm, selectedCategory, favorites]);

    const categories = useMemo(() => {
        if (!allBooks) return [];
        const cats = new Set(allBooks.map(b => b.programName || (b as any).category).filter(Boolean));
        return Array.from(cats);
    }, [allBooks]);

    const handleDelete = async () => {
        if (!bookToDelete || !firestore) return;
        const bookRef = doc(firestore, 'books', bookToDelete.id);
        const statsRef = doc(firestore, 'stats', 'global');

        try {
            await runTransaction(firestore, async (transaction) => {
                const statsDoc = await transaction.get(statsRef);
                const currentBooks = statsDoc.data()?.books || 0;
                transaction.set(statsRef, { books: Math.max(0, currentBooks - 1) }, { merge: true });
                transaction.delete(bookRef);
            });
            toast({ title: "تم الحذف بنجاح" });
        } catch (error) {
            toast({ variant: "destructive", title: "فشل الحذف" });
        } finally {
            setBookToDelete(null);
        }
    };

    return (
        <div className="space-y-16">
            {/* 🔍 Search & Filters Bar */}
            <div className="flex flex-col lg:flex-row items-center gap-6 bg-white/[0.02] border border-white/5 p-4 rounded-[2.5rem] backdrop-blur-3xl sticky top-24 z-30 shadow-2xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <input 
                        type="text"
                        placeholder="ابحث بالعنوان، المؤلف أو القسم..."
                        className="w-full h-16 pr-14 pl-6 bg-white/5 border-none rounded-3xl text-xl font-bold focus:ring-2 ring-primary/20 transition-all placeholder:text-white/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
                    <button 
                        onClick={() => setSelectedCategory('all')}
                        className={cn("px-6 h-12 rounded-2xl font-bold whitespace-nowrap transition-all border", selectedCategory === 'all' ? "bg-primary text-white border-primary shadow-lg" : "bg-white/5 text-white/40 border-white/5 hover:border-white/20")}
                    > الكل </button>
                    <button 
                        onClick={() => setSelectedCategory('favorites')}
                        className={cn("px-6 h-12 rounded-2xl font-bold whitespace-nowrap transition-all border flex items-center gap-2", selectedCategory === 'favorites' ? "bg-red-500 text-white border-red-500 shadow-lg" : "bg-white/5 text-red-400/40 border-white/5 hover:border-red-500/20")}
                    > <Bookmark className="w-4 h-4" /> المفضلة </button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat!)} className={cn("px-6 h-12 rounded-2xl font-bold whitespace-nowrap transition-all border", selectedCategory === cat ? "bg-primary text-white border-primary shadow-lg" : "bg-white/5 text-white/40 border-white/5 hover:border-white/20")}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <BooksListSkeleton />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12">
                    <AnimatePresence mode="popLayout">
                        {filteredBooks.map((book, idx) => (
                            <motion.div key={book.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group relative flex flex-col rounded-[2rem] overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:bg-white/[0.07]">
                                <div className="relative aspect-[3/4] w-full bg-black/40 overflow-hidden">
                                    <Image src={book.imageUrl || `https://picsum.photos/seed/${book.slug}/400/600`} alt={book.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/30 to-black/10" />
                                    
                                    {readingProgress[book.id] && (
                                        <div className="absolute top-0 right-4 w-10 h-12 bg-primary flex items-center justify-center rounded-b-xl shadow-lg z-30">
                                            <span className="text-[10px] font-black text-black leading-none pt-1">ص {readingProgress[book.id]}</span>
                                        </div>
                                    )}
                                        
                                        <div className="absolute inset-0 z-40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="icon" className="h-14 w-14 rounded-2xl bg-white text-black hover:scale-110 transition-all shadow-2xl hover:bg-primary hover:text-white">
                                                        <Eye className="w-7 h-7" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-6xl w-full h-[92vh] md:h-[92vh] p-0 bg-[#09090b] border-white/10 overflow-hidden flex flex-col rounded-t-[2.5rem] md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                                                    <DialogHeader className="p-2 md:p-5 px-3 md:px-8 border-b border-white/5 bg-[#0c0c0e] flex flex-row items-center justify-between gap-1 md:gap-6 shrink-0">
                                                        <div className="flex items-center gap-1.5 md:gap-4 min-w-0 flex-1">
                                                            <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                                <BookIcon className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                                                            </div>
                                                            <DialogTitle className="text-sm md:text-2xl font-black text-white truncate drop-shadow-md tracking-tight hidden xs:block">{book.title}</DialogTitle>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                                                            {/* 💾 Advanced Page Input */}
                                                            <div className="flex items-center gap-1.5 md:gap-3 bg-black/40 p-1 md:p-1.5 pr-2 md:pr-4 rounded-xl md:rounded-2xl border border-white/10 group/input focus-within:border-primary/50 transition-all">
                                                                <span className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest hidden sm:block">الصفحة</span>
                                                                <input 
                                                                    type="number" 
                                                                    defaultValue={readingProgress[book.id] || 1}
                                                                    className="w-9 md:w-14 h-7 md:h-10 bg-white/5 border border-white/10 rounded-lg md:rounded-xl text-center text-[10px] md:text-sm font-black text-white outline-none focus:bg-white/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    onChange={(e) => updateProgress(book.id, parseInt(e.target.value))}
                                                                />
                                                            </div>

                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                onClick={() => toggleFavorite(book.id)} 
                                                                className={cn(
                                                                    "rounded-xl md:rounded-2xl h-8 w-8 md:h-14 md:w-auto md:px-6 border-white/10 bg-white/5 hover:bg-white/10 transition-all font-black gap-2",
                                                                    favorites.includes(book.id) && "border-red-500/20 bg-red-500/10 text-red-400"
                                                                )}
                                                            >
                                                                <Bookmark className={cn("w-3.5 h-3.5 md:w-5 md:h-5", favorites.includes(book.id) && "fill-red-500 text-red-500")} />
                                                                <span className="hidden md:inline">{favorites.includes(book.id) ? "مفضل" : "مفضل"}</span>
                                                            </Button>
                                                            
                                                            <Button asChild size="icon" className="rounded-xl md:rounded-2xl h-8 w-8 md:h-14 md:w-auto md:px-8 bg-primary text-white hover:scale-105 transition-all font-black gap-2 shadow-lg shadow-primary/20">
                                                                <a href={book.pdfUrl} target="_blank" download>
                                                                    <Download className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                                                    <span className="hidden md:inline">تحميل</span>
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </DialogHeader>
                                                    
                                                    <div className="flex-1 bg-[#121214] relative overflow-hidden flex flex-col">
                                                        {/* 📱 Mobile Fallback: Open in New Tab if iframe fails */}
                                                        <div className="md:hidden absolute top-4 left-4 z-50">
                                                            <Button asChild size="sm" variant="secondary" className="rounded-xl opacity-40 hover:opacity-100 backdrop-blur-md">
                                                                <a href={book.pdfUrl} target="_blank">
                                                                    <Eye className="w-4 h-4 ml-2" />
                                                                    عرض ملء الشاشة
                                                                </a>
                                                            </Button>
                                                        </div>

                                                        <embed 
                                                            src={`${book.pdfUrl}#view=FitH&scrollbar=0&toolbar=0&navpanes=0`} 
                                                            type="application/pdf"
                                                            className="flex-1 w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity" 
                                                            style={{ 
                                                                width: '1px', 
                                                                minWidth: '100%', 
                                                                height: '100%',
                                                                backgroundColor: '#121214'
                                                            }}
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            
                                            <button onClick={() => toggleFavorite(book.id)} className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform">
                                                <Bookmark className={cn("w-6 h-6", favorites.includes(book.id) ? "fill-red-500 text-red-500" : "text-white")} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── Info Section ── */}
                                    <div className="flex flex-col gap-2 p-5 flex-1 relative z-10 bg-[#09090b]/40">
                                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 text-right">
                                            {book.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-1.5 justify-end mt-auto">
                                            <span className="text-[11px] text-white/45 line-clamp-1">{(book as any).author || "مؤلف غير معروف"}</span>
                                        </div>

                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

                                        <div className="flex items-center justify-between mt-1">
                                            <a 
                                                href={book.pdfUrl} 
                                                target="_blank" 
                                                download 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group/dl"
                                            >
                                                <Download size={14} className="text-white/50 group-hover/dl:text-primary group-hover/dl:-translate-y-0.5 transition-all" />
                                            </a>
                                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                                                {book.programName || (book as any).category || 'كتاب'}
                                            </span>
                                        </div>
                                    </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!isLoading && filteredBooks.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                        <Library className="w-10 h-10 text-white/10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black">لم نعثر على هذا المخطوط</h3>
                        <p className="text-white/20 max-w-sm mx-auto">حاول البحث بكلمات أخرى أو تصفح الأقسام الجانبية للمكتبة.</p>
                    </div>
                    <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="rounded-2xl px-8 border-white/10">إعادة تعيين البحث</Button>
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


export default function BooksPage() {
  return (
    <div className="space-y-20 pb-32 overflow-x-hidden">
        {/* 🏛️ Cinematic Library Hero */}
        <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 h-[50vh] min-h-[450px] flex flex-col items-center justify-center text-center overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-zinc-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>
            
            {/* Animated Shapes */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" 
            />
            
            <div className="container relative z-10 space-y-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                        <Zap className="w-4 h-4 fill-primary" />
                        المكتبة العلمية الرقمية
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-white drop-shadow-2xl mb-6 italic uppercase">
                        رواق <span className="text-primary">المعرفة</span>
                    </h1>
                    <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed italic">
                        "خيرُ جليسٍ في الزمانِ كتابُ" — تصفح، اقرأ وحمّل كنوز العلم الشرعي لمختصين ومحاضرين من شتى بقاع الأمة.
                    </p>
                </motion.div>
                
                {/* Stats row */}
                <div className="flex items-center justify-center gap-12 pt-8 border-t border-white/5 w-fit mx-auto">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-white tracking-tighter">1,250+</span>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">كتاب ومخطوط</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-primary tracking-tighter">150k+</span>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">عملية تحميل</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-white tracking-tighter">18</span>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">تخصص شرعي</span>
                    </div>
                </div>
            </div>
            
            {/* Floating indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-primary to-transparent" />
            </div>
        </section>

        <CosmicLibrary />

        <div className="container px-4 mt-24">
            <BooksList />
        </div>
    </div>
  );
}
