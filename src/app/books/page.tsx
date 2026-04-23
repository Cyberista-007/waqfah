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
import { doc, runTransaction } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


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
    const { data: allBooks, isLoading } = useCollection<Book>('books', { orderBy: ['title', 'asc']});
    const { isAdmin } = useAdminAuth();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredBooks = useMemo(() => {
        if (!allBooks) return [];
        let filtered = allBooks;

        if (searchTerm) {
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (book.programName || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(book => book.programName === selectedCategory);
        }

        return filtered;
    }, [allBooks, searchTerm, selectedCategory]);

    const categories = useMemo(() => {
        if (!allBooks) return [];
        const cats = new Set(allBooks.map(b => b.programName).filter(Boolean));
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
                        placeholder="ابحث في رفوف المكتبة..."
                        className="w-full h-16 pr-14 pl-6 bg-white/5 border-none rounded-3xl text-xl font-bold focus:ring-2 ring-primary/20 transition-all placeholder:text-white/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
                    <button 
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-6 h-12 rounded-2xl font-bold whitespace-nowrap transition-all border",
                            selectedCategory === 'all' ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                        )}
                    >
                        الكل
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat!)}
                            className={cn(
                                "px-6 h-12 rounded-2xl font-bold whitespace-nowrap transition-all border",
                                selectedCategory === cat ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                            )}
                        >
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
                            <motion.div
                                key={book.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group flex flex-col gap-4 relative"
                            >
                                {/* 📕 3D Book Container */}
                                <div className="relative aspect-[3/4] w-full perspective-1000">
                                    <div className="w-full h-full relative transition-all duration-500 group-hover:rotate-y-[-20deg] group-hover:translate-x-[-10px] transform-style-3d shadow-[20px_20px_50px_rgba(0,0,0,0.5)]">
                                        {/* Cover */}
                                        <div className="absolute inset-0 bg-zinc-900 rounded-r-lg overflow-hidden border border-white/10 z-20">
                                            <Image
                                                src={book.imageUrl || getPlaceholderImage(book.imageId)?.imageUrl || `https://picsum.photos/seed/${book.slug}/400/600`}
                                                alt={book.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-40" />
                                        </div>
                                        
                                        {/* Spine / Thickness effect */}
                                        <div className="absolute top-0 bottom-0 -right-4 w-4 bg-zinc-800 border-y border-r border-white/5 rounded-r-lg origin-left rotate-y-[90deg] z-10" />
                                        
                                        {/* Glass Overlay on Hover */}
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-4 backdrop-blur-sm rounded-r-lg">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="icon" className="h-12 w-12 rounded-full bg-white text-black hover:scale-110 transition-transform">
                                                        <Eye className="w-6 h-6" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl h-[90vh] p-0 bg-zinc-950 border-white/10 overflow-hidden">
                                                    <DialogHeader className="p-4 border-b border-white/5 bg-zinc-900 flex flex-row items-center justify-between">
                                                        <DialogTitle className="text-xl font-black">{book.title}</DialogTitle>
                                                        <Button asChild size="sm" variant="outline" className="ml-8">
                                                            <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                                                                <Download className="w-4 h-4 ml-2" /> تحميل
                                                            </a>
                                                        </Button>
                                                    </DialogHeader>
                                                    <iframe src={`${book.pdfUrl}#toolbar=0`} className="w-full h-full border-none" />
                                                </DialogContent>
                                            </Dialog>
                                            
                                            <Button asChild size="icon" className="h-12 w-12 rounded-full bg-primary text-white hover:scale-110 transition-transform">
                                                <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                                                    <Download className="w-6 h-6" />
                                                </a>
                                            </Button>
                                        </div>

                                        {/* Admin Delete */}
                                        {isAdmin && (
                                            <button 
                                                onClick={(e) => { e.preventDefault(); setBookToDelete(book); }}
                                                className="absolute top-4 left-4 z-40 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Shadow under the book */}
                                    <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/40 blur-xl rounded-full -z-10 group-hover:scale-110 transition-transform" />
                                </div>

                                {/* ℹ️ Book Info */}
                                <div className="space-y-1 px-1">
                                    <h3 className="text-lg font-black text-white line-clamp-1 leading-snug tracking-tight">{book.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{book.programName || "مؤلفات عامة"}</span>
                                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                                        <span className="text-[10px] font-bold text-primary/60">PDF</span>
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
        <section className="relative -mx-4 sm:-mx-8 -mt-[calc(4rem+2rem+1px)] h-[50vh] min-h-[450px] flex flex-col items-center justify-center text-center overflow-hidden border-b border-white/5">
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

        <div className="container px-4">
            <BooksList />
        </div>
    </div>
  );
}
