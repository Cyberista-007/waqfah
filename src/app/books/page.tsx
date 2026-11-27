'use client';

import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import {
  Book as BookIcon,
  Trash2,
  Search,
  Download,
  Eye,
  Sparkles,
  Library,
  Bookmark,
  X,
  BookOpen,
  LayoutGrid,
  List,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { doc, runTransaction } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { Pagination } from '@/components/pagination';
import { useCollection, useFirestore } from '@/firebase';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useToast } from '@/hooks/use-toast';
import { useSync } from '@/hooks/useSync';
import { cn, normalizeArabic } from '@/lib/utils';
import type { Book } from '@/lib/types';

const ITEMS_PER_PAGE = 24;

function BooksListSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-[3/4] w-full bg-muted border border-border rounded-2xl" />
          <div className="space-y-2 px-1">
            <div className="h-4 bg-muted rounded-full w-3/4" />
            <div className="h-3 bg-muted/60 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BookReaderDialog({
  book,
  progress,
  isFav,
  toggleFavorite,
  updateProgress,
  trigger,
}: {
  book: Book;
  progress?: number;
  isFav: boolean;
  toggleFavorite: (id: string) => void;
  updateProgress: (id: string, p: number) => void;
  trigger: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl w-full h-[92vh] p-0 overflow-hidden flex flex-col rounded-2xl md:rounded-3xl border-border bg-card">
        <DialogHeader className="p-3.5 md:p-4 border-b border-border bg-muted/40 flex flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <BookIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 text-right">
              <DialogTitle className="text-sm md:text-base font-bold text-foreground truncate">
                {book.title}
              </DialogTitle>
              {(book as any).author && (
                <p className="text-xs text-muted-foreground truncate">{(book as any).author}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-xl border border-border">
              <span className="text-[11px] font-semibold text-muted-foreground">صفحة</span>
              <input
                type="number"
                min={1}
                defaultValue={progress || 1}
                className="w-12 h-7 bg-muted/50 border border-border rounded-lg text-center text-xs font-bold text-foreground outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) updateProgress(book.id, val);
                }}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleFavorite(book.id)}
              className={cn(
                'h-9 w-9 rounded-xl',
                isFav && 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              )}
              title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Bookmark className={cn('w-4 h-4', isFav && 'fill-current')} />
            </Button>

            {book.pdfUrl && (
              <>
                <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl" title="فتح في تبويب جديد">
                  <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button asChild size="sm" className="h-9 px-3.5 rounded-xl font-bold gap-1.5">
                  <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تحميل</span>
                  </a>
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 relative bg-zinc-950 overflow-hidden">
          {book.pdfUrl ? (
            <embed
              src={`${book.pdfUrl}#view=FitH&toolbar=0&navpanes=0`}
              type="application/pdf"
              className="w-full h-full border-none"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/60 gap-2">
              <BookIcon className="w-10 h-10 opacity-40" />
              <p className="text-sm font-semibold">رابط القراءة غير متاح حالياً لهذا الكتاب.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookCard({
  book,
  viewMode,
  favorites,
  readingProgress,
  toggleFavorite,
  updateProgress,
  isAdmin,
  onDelete,
}: {
  book: Book;
  viewMode: 'grid' | 'list';
  favorites: string[];
  readingProgress: Record<string, number>;
  toggleFavorite: (id: string) => void;
  updateProgress: (id: string, p: number) => void;
  isAdmin: boolean;
  onDelete: (b: Book) => void;
}) {
  const isFav = favorites.includes(book.id);
  const progress = readingProgress[book.id];
  const category = book.programName || (book as any).category;
  const coverUrl = book.imageUrl || `https://picsum.photos/seed/${book.slug || book.id}/300/420`;
  const author = (book as any).author || 'مؤلف غير محدد';

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-card/80 border border-border hover:border-primary/40 transition-all shadow-sm">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
            <Image src={coverUrl} alt={book.title} fill className="object-cover" sizes="64px" />
          </div>

          <div className="min-w-0 space-y-1 text-right">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {category}
                </span>
              )}
              {progress && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                  صفحة {progress}
                </span>
              )}
            </div>
            <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-1">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{author}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <BookReaderDialog
            book={book}
            progress={progress}
            isFav={isFav}
            toggleFavorite={toggleFavorite}
            updateProgress={updateProgress}
            trigger={
              <Button size="sm" className="h-9 px-3.5 rounded-xl font-bold gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">قراءة</span>
              </Button>
            }
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleFavorite(book.id)}
            className={cn('h-9 w-9 rounded-xl', isFav && 'text-rose-500 border-rose-500/30 bg-rose-500/10')}
            title="المفضلة"
          >
            <Bookmark className={cn('w-4 h-4', isFav && 'fill-current')} />
          </Button>

          {book.pdfUrl && (
            <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl" title="تحميل">
              <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="w-4 h-4" />
              </a>
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(book)}
              className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
              title="حذف الكتاب"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card/80 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg">
      {/* Book Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={coverUrl}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* Reading Progress Ribbon */}
        {progress && (
          <div className="absolute top-0 right-2.5 px-2 pt-1.5 pb-2 bg-primary text-primary-foreground rounded-b-lg shadow-md z-20">
            <span className="text-[10px] font-black leading-none block">ص {progress}</span>
          </div>
        )}

        {/* Category Badge */}
        {category && (
          <div className="absolute top-2.5 left-2.5 z-20 max-w-[70%]">
            <span className="inline-block truncate max-w-full text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/15">
              {category}
            </span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 z-30 flex items-center justify-center gap-2 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <BookReaderDialog
            book={book}
            progress={progress}
            isFav={isFav}
            toggleFavorite={toggleFavorite}
            updateProgress={updateProgress}
            trigger={
              <button
                className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform shadow-lg"
                title="قراءة الكتاب"
              >
                <Eye className="w-4 h-4" />
                <span>قراءة</span>
              </button>
            }
          />

          <button
            onClick={() => toggleFavorite(book.id)}
            className={cn(
              'h-11 w-11 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg border',
              isFav
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
            )}
            title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Bookmark className={cn('w-4 h-4', isFav && 'fill-current')} />
          </button>

          {isAdmin && (
            <button
              onClick={() => onDelete(book)}
              className="h-11 w-11 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              title="حذف الكتاب"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Book Info */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 text-right">
        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{author}</p>

        <div className="mt-auto pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {book.pdfUrl && (
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg bg-muted hover:bg-accent text-xs font-semibold text-foreground transition-colors"
                title="تحميل PDF"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>تحميل</span>
              </a>
            )}
          </div>

          <button
            onClick={() => toggleFavorite(book.id)}
            className={cn(
              'h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors',
              isFav ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:bg-muted'
            )}
            aria-label="المفضلة"
          >
            <Bookmark className={cn('w-3.5 h-3.5', isFav && 'fill-current')} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BooksPage() {
  const { data: firestoreBooks, isLoading: isFirestoreLoading } = useCollection<Book>('books', {
    orderBy: ['title', 'asc'],
  });
  const [publicBooks, setPublicBooks] = useState<Book[]>([]);
  const [isPublicLoading, setIsPublicLoading] = useState(true);

  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { state: userState, updateState: syncUpdate } = useSync();

  const favorites = userState.favorites;
  const readingProgress = userState.bookProgress;

  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPublicLibrary = async () => {
      try {
        const url =
          'https://raw.githubusercontent.com/Cyberista-007/Islamic-Books-Library/main/library.json';
        let res = await fetch(url);
        if (!res.ok) res = await fetch('/data/library.json');
        if (res.ok) {
          const data = await res.json();
          if (data.books) {
            setPublicBooks(
              data.books.map((b: any) => ({
                ...b,
                slug: b.slug || b.id,
                programName: b.programName || b.category || 'مكتبة عامة',
                imageUrl: b.imageUrl || b.coverUrl,
                isPublic: true,
              }))
            );
          }
        }
      } catch {
        // silent fallback
      } finally {
        setIsPublicLoading(false);
      }
    };
    fetchPublicLibrary();
  }, []);

  const allBooks = useMemo(() => {
    const list = Array.isArray(firestoreBooks) ? firestoreBooks : [];
    return [...list, ...publicBooks];
  }, [firestoreBooks, publicBooks]);

  const categories = useMemo(() => {
    const cats = new Set(allBooks.map((b) => b.programName || (b as any).category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [allBooks]);

  const continueReadingBooks = useMemo(() => {
    const ids = Object.keys(readingProgress);
    if (ids.length === 0) return [];
    return allBooks.filter((b) => readingProgress[b.id] > 0).slice(0, 4);
  }, [allBooks, readingProgress]);

  const filteredBooks = useMemo(() => {
    let result = allBooks;

    if (searchTerm.trim()) {
      const q = normalizeArabic(searchTerm.toLowerCase());
      result = result.filter(
        (b) =>
          normalizeArabic(b.title.toLowerCase()).includes(q) ||
          normalizeArabic((b.programName || '').toLowerCase()).includes(q) ||
          normalizeArabic(((b as any).author || '').toLowerCase()).includes(q)
      );
    }

    if (selectedCategory === 'favorites') {
      result = result.filter((b) => favorites.includes(b.id));
    } else if (selectedCategory === 'reading') {
      result = result.filter((b) => !!readingProgress[b.id]);
    } else if (selectedCategory !== 'all') {
      result = result.filter(
        (b) => b.programName === selectedCategory || (b as any).category === selectedCategory
      );
    }

    return result;
  }, [allBooks, searchTerm, selectedCategory, favorites, readingProgress]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(
    () =>
      filteredBooks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredBooks, currentPage]
  );

  const toggleFavorite = (bookId: string) => {
    const exists = favorites.includes(bookId);
    const newFavs = exists ? favorites.filter((id) => id !== bookId) : [...favorites, bookId];
    syncUpdate({ favorites: newFavs });
    toast({ title: exists ? 'تمت الإزالة من المفضلة' : 'أضيف إلى المفضلة' });
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
        t.set(
          statsRef,
          { books: Math.max(0, (statsDoc.data()?.books || 0) - 1) },
          { merge: true }
        );
        t.delete(doc(firestore, 'books', bookToDelete.id));
      });
      toast({ title: 'تم حذف الكتاب بنجاح' });
    } catch {
      toast({ variant: 'destructive', title: 'فشل حذف الكتاب' });
    } finally {
      setBookToDelete(null);
    }
  };

  const isLoading = isFirestoreLoading && isPublicLoading && allBooks.length === 0;
  const hasActiveFilters = Boolean(searchTerm.trim() || selectedCategory !== 'all');

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* ── 1. CLEAN LIBRARY HEADER ── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>المكتبة العلمية الرقمية</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              مكتبة <span className="text-primary">وقفة</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              تصفح واقرأ وحمّل أمهات الكتب الشرعية والمراجع العلمية مع حفظ تلقائي لصفحة القراءة والمفضلة.
            </p>
          </div>

          {/* Live Stats Pills */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <Library className="w-4 h-4 text-primary" />
              <span>{allBooks.length} كتاب</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>{categories.length} قسم</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <Bookmark className="w-4 h-4 text-rose-500" />
              <span>{favorites.length} مفضل</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>{Object.keys(readingProgress).length} قيد القراءة</span>
            </div>
          </div>
        </header>

        {/* ── 2. CONTINUE READING STRIP ── */}
        {continueReadingBooks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2>استكمال القراءة</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {continueReadingBooks.map((book) => {
                const page = readingProgress[book.id];
                const coverUrl =
                  book.imageUrl || `https://picsum.photos/seed/${book.slug || book.id}/300/420`;
                return (
                  <BookReaderDialog
                    key={book.id}
                    book={book}
                    progress={page}
                    isFav={favorites.includes(book.id)}
                    toggleFavorite={toggleFavorite}
                    updateProgress={updateProgress}
                    trigger={
                      <button className="flex items-center gap-3 p-3 rounded-2xl bg-card/80 border border-border hover:border-primary/40 transition-all text-right group shadow-sm">
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image src={coverUrl} alt={book.title} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {book.title}
                          </p>
                          <span className="inline-block text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            متابعة من صفحة {page}
                          </span>
                        </div>
                      </button>
                    }
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── 3. SEARCH, CATEGORY FILTER & VIEW TOGGLE ── */}
        <section className="sticky top-16 z-30 bg-background/85 backdrop-blur-xl border border-border rounded-2xl p-3.5 md:p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="ابحث بالعنوان أو المؤلف أو القسم..."
                className="pr-10 pl-9 h-11 bg-card border-border rounded-xl text-sm font-medium text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="مسح البحث"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Grid / List View Switcher */}
            <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-xl self-end md:self-auto shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label="عرض شبكي"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">شبكة</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors',
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label="عرض قائمة"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">قائمة</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'favorites', label: 'المفضلة' },
              { id: 'reading', label: 'قيد القراءة' },
              ...categories.map((c) => ({ id: c, label: c })),
            ].map(({ id, label }) => {
              const isActive = selectedCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={cn(
                    'px-3.5 h-9 rounded-xl font-bold whitespace-nowrap text-xs transition-all border shrink-0',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Active Results Summary */}
          {!isLoading && hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <span>
                عرض <strong className="text-foreground">{filteredBooks.length}</strong> كتاب
                {searchTerm && (
                  <>
                    {' '}
                    عن <strong className="text-primary">&quot;{searchTerm}&quot;</strong>
                  </>
                )}
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-primary font-bold hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            </div>
          )}
        </section>

        {/* ── 4. BOOKS DISPLAY ── */}
        {isLoading ? (
          <BooksListSkeleton />
        ) : filteredBooks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-card/50 border border-dashed border-border rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Library className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">لم يتم العثور على كتب مطابقة</h3>
              <p className="text-sm text-muted-foreground">
                حاول البحث بكلمات أخرى أو اختر قسماً آخر من المكتبة.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="rounded-xl px-6 font-bold"
            >
              إعادة تعيين البحث
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5'
                : 'grid grid-cols-1 lg:grid-cols-2 gap-3.5'
            )}
          >
            {paginatedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                viewMode={viewMode}
                favorites={favorites}
                readingProgress={readingProgress}
                toggleFavorite={toggleFavorite}
                updateProgress={updateProgress}
                isAdmin={isAdmin}
                onDelete={setBookToDelete}
              />
            ))}
          </div>
        )}

        {/* ── 5. PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>

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
