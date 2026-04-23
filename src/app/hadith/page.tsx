'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book, Search, Star, Heart, Share2, Library, Sparkles,
  ChevronLeft, BookOpen, Quote, ShieldCheck, Clock, Layers,
  Compass, Hash, ArrowRight, Zap, RefreshCw, Copy, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HADITH_SECTIONS_FALLBACK } from './hadith-data-hub';

interface HadithStat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

const STATS: HadithStat[] = [
  { label: 'إجمالي الأحاديث', value: '50,000+', icon: Library, color: 'text-amber-500' },
  { label: 'دواوين السنة', value: '10+', icon: ShieldCheck, color: 'text-emerald-500' },
  { label: 'أبواب فقهية', value: '3,500+', icon: Layers, color: 'text-blue-500' },
  { label: 'دقة المراجعة', value: 'موثق', icon: Star, color: 'text-rose-500' },
];

const MAIN_BOOKS = [
  {
    id: 'bukhari',
    name: 'صحيح البخاري',
    author: 'الإمام البخاري',
    count: '7,563',
    color: 'text-amber-400',
    bg: 'from-amber-600/20',
    tag: 'أصح الكتب',
    desc: 'المسند الصحيح المختصر من أمور رسول الله ﷺ وسننه وأيامه.'
  },
  {
    id: 'muslim',
    name: 'صحيح مسلم',
    author: 'الإمام مسلم',
    count: '3,033',
    color: 'text-emerald-400',
    bg: 'from-emerald-600/20',
    tag: 'درجة الصحة العليا',
    desc: 'الجامع الصحيح المسند المختصر من السنن عن رسول الله ﷺ.'
  },
  {
    id: 'abudawud',
    name: 'سنن أبي داود',
    author: 'أبو داود السجستاني',
    count: '5,274',
    color: 'text-blue-400',
    bg: 'from-blue-600/20',
    tag: 'أشهر السنن',
    desc: 'ألفه الإمام أحمد بن شعيب السجستاني في المسائل الفقهية.'
  },
  {
    id: 'tirmidhi',
    name: 'جامع الترمذي',
    author: 'الإمام الترمذي',
    count: '3,956',
    color: 'text-rose-400',
    bg: 'from-rose-600/20',
    tag: 'جمع السنن والعلل',
    desc: 'الجامع المختصر من السنن عن رسول الله ﷺ ومعرفة الصحيح والمعلول.'
  },
  {
    id: 'nasai',
    name: 'سنن النسائي',
    author: 'الإمام النسائي',
    count: '5,758',
    color: 'text-violet-400',
    bg: 'from-violet-600/20',
    tag: 'المجتبى',
    desc: 'يُعد أقل الكتب الستة بعد الصحيحين حديثاً ضعيفاً ورجلاً متكلماً فيه.'
  },
  {
    id: 'ibnmajah',
    name: 'سنن ابن ماجه',
    author: 'ابن ماجه القزويني',
    count: '4,341',
    color: 'text-orange-400',
    bg: 'from-orange-600/20',
    tag: 'متمم الستة',
    desc: 'من أمهات كتب الحديث الستة العظيمة التي عليها مدار الإسلام.'
  },
  {
    id: 'malik',
    name: 'موطأ مالك',
    author: 'الإمام مالك بن أنس',
    count: '1,720',
    color: 'text-blue-300',
    bg: 'from-blue-500/20',
    tag: 'أول المدوّنات',
    desc: 'أقدم كتب الحديث التي وصلت إلينا، رتبه الإمام مالك على الأبواب الفقهية.',
    isNew: true
  },
  {
    id: 'ahmad',
    name: 'مسند أحمد',
    author: 'الإمام أحمد بن حنبل',
    count: '27,647',
    color: 'text-red-400',
    bg: 'from-red-600/20',
    tag: 'أضخم المسانيد',
    desc: 'ديوان السنة الأكبر، رتبه الإمام أحمد بن حنبل على مسانيد الصحابة رضي الله عنهم.',
    isNew: true
  },
  {
    id: 'darimi',
    name: 'سنن الدارمي',
    author: 'الإمام الدارمي',
    count: '3,503',
    color: 'text-lime-400',
    bg: 'from-lime-600/20',
    tag: 'إتقان الترتيب',
    desc: 'من أمهات السنن، امتاز ببراعة الترتيب ودقة التبويب الفقهي والحديثي.',
    isNew: true
  },
  {
    id: 'riyadussaliheen',
    name: 'رياض الصالحين',
    author: 'الإمام النووي',
    count: '1,896',
    color: 'text-cyan-400',
    bg: 'from-cyan-600/20',
    tag: 'كتاب الرقائق والآداب',
    desc: 'من أشهر كتب الحديث في العالم الإسلامي، جمع فيه النووي الأحاديث الصحيحة في الترغيب والترهيب.'
  }
];

export default function HadithHubPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'about'>('books');
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // 📖 Daily Hadith State
  const [dailyHadith, setDailyHadith] = useState({
    text: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى فمن كانت هجرته إلى الله ورسوله، فهجرته إلى الله ورسوله',
    book: 'صحيح البخاري',
    number: '1',
    grade: 'صحيح',
    bookId: 'bukhari'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchRandomHadith();
  }, []);

  const fetchRandomHadith = async () => {
    setRefreshing(true);
    try {
      // Logic to get random hadith from Bukhari or Muslim
      const bookIds = ['bukhari', 'muslim'];
      const randomBook = bookIds[Math.floor(Math.random() * bookIds.length)];
      const randomSection = Math.floor(Math.random() * 20) + 1; // Try one of the first 20 chapters

      const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${randomBook}/sections/${randomSection}.json`);
      const data = await res.json();

      if (data.hadiths && data.hadiths.length > 0) {
        const h = data.hadiths[Math.floor(Math.random() * data.hadiths.length)];
        setDailyHadith({
          text: h.text,
          book: randomBook === 'bukhari' ? 'صحيح البخاري' : 'صحيح مسلم',
          number: h.hadithnumber.toString(),
          grade: 'صحيح',
          bookId: randomBook
        });
        setIsFavorite(false); // Reset favorite for new hadith
      }
    } catch (error) {
      console.error("Failed to fetch random hadith", error);
    }
    setRefreshing(false);
  };

  const handleCopy = () => {
    const textToCopy = `«${dailyHadith.text}»\n\n📚 المصدر: ${dailyHadith.book}\n🔢 رقم الحديث: ${dailyHadith.number}\n\nتم النسخ من تطبيق "وقفة"`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: 'تم نسخ الحديث بنجاح', description: 'يمكنك الآن مشاركته مع أحبابك' });
  };

  const handleShare = async () => {
    const textToShare = `«${dailyHadith.text}»\n\n📚 المصدر: ${dailyHadith.book}\n🔢 رقم الحديث: ${dailyHadith.number}\n\nتمت المشاركة من تطبيق "وقفة"`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'حديث اليوم', text: textToShare });
      } catch (err) { }
    } else {
      handleCopy();
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة',
      variant: !isFavorite ? 'default' : 'destructive'
    });
  };

  // 🔍 Universal Search Logic
  const globalResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const results: any[] = [];

    Object.entries(HADITH_SECTIONS_FALLBACK).forEach(([bookId, sections]) => {
      Object.entries(sections).forEach(([sectionId, sectionName]) => {
        if (sectionName.includes(searchQuery)) {
          results.push({
            bookId,
            sectionId,
            sectionName,
            bookMeta: MAIN_BOOKS.find(b => b.id === bookId)
          });
        }
      });
    });
    return results.slice(0, 12); // Limit to 12 results for speed/UI
  }, [searchQuery]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30 pb-32">
      {/* 🔮 Cinematic Hero Section */}
      <section className="relative pt-40 pb-32 px-4 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />

        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col gap-16 items-center">
            <div className="w-full space-y-8 text-center flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]"
              >
                <Sparkles className="w-4 h-4" /> موسوعة السنة النبوية الشاملة
              </motion.div>

              <h1 className="text-7xl md:text-[7rem] lg:text-[8rem] font-black font-headline tracking-tighter leading-[0.8] text-white">
                كُنوز <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-amber-500 to-amber-700 italic">الوَحي</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/40 font-medium leading-relaxed max-w-3xl mx-auto">
                أضخم منصة رقمية تفاعلية لجَمع وتصنيف السُّنة النبوية المطهَّرة من "الكتب الستة"، بدقة عالية وتجربة قراءة سينمائية فريدة.
              </p>

              {/* Stats Bento */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-4xl mx-auto">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <stat.icon className={cn("w-6 h-6 mb-4 mx-auto", stat.color)} />
                    <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform origin-center">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-5xl relative"
            >
              <div className="absolute inset-0 bg-amber-500/20 blur-[100px] opacity-30" />
              <div className="relative p-10 md:p-14 rounded-[4rem] bg-zinc-900/50 border border-white/10 backdrop-blur-3xl space-y-10 overflow-hidden group">
                <Quote className="absolute top-10 left-10 w-32 h-32 text-white/[0.03] group-hover:scale-110 transition-transform" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                      <Copy className="w-4 h-4 opacity-40 hover:opacity-100" />
                    </Button>
                    <Button
                      onClick={toggleFavorite}
                      variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl bg-white/5 border border-white/5 transition-all", isFavorite ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "hover:bg-white/10 opacity-40")}>
                      <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                      <Share2 className="w-4 h-4 opacity-40 hover:opacity-100" />
                    </Button>
                  </div>
                  <span className="px-4 py-1.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-400 text-[10px] font-black text-black uppercase tracking-widest shadow-lg shadow-amber-500/20">حديث اليوم</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={dailyHadith.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative z-10"
                  >
                    <p className={cn(
                      "text-2xl md:text-3xl font-bold font-headline leading-[2.2] text-center text-white transition-all group-hover:text-amber-200",
                      refreshing && "opacity-50 blur-sm"
                    )}>
                      «{dailyHadith.text}»
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex gap-4 items-center opacity-40 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Book className="w-4 h-4" /> {dailyHadith.book}</div>
                    <div className="flex items-center gap-2 text-emerald-400"><ShieldCheck className="w-4 h-4" /> {dailyHadith.grade}</div>
                  </div>
                  <Button
                    onClick={fetchRandomHadith}
                    disabled={refreshing}
                    className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all font-black text-xs border border-white/5 group-hover:border-amber-500/30"
                  >
                    <RefreshCw className={cn("w-4 h-4 ml-3", refreshing && "animate-spin")} /> تجديد
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 🛸 Global Explorer Section */}
      <section className="container mx-auto px-4 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-6 py-4 rounded-[3rem] bg-white/5 border border-white/5">
          <div className="flex gap-4 p-2 bg-[#0a0a0a] rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('books')}
              className={cn("px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'books' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white")}
            >
              دواوين السنة
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={cn("px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'about' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white")}
            >
              حول الموسوعة
            </button>
          </div>

          <div className="flex-1 max-w-xl group relative">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(e.target.value.length > 1);
              }}
              placeholder="ابحث في الموسوعة الشاملة (كلمة، موضوع، باب)..."
              className="w-full h-14 pr-16 pl-6 rounded-2xl bg-black/40 border border-white/10 focus:border-amber-500/50 outline-none transition-all font-bold"
            />
            <AnimatePresence>
              {showResults && globalResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-4 p-4 rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl z-[100] backdrop-blur-xl"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 px-4">نتائج البحث في الأبواب ({globalResults.length})</div>
                  <div className="grid grid-cols-1 gap-2">
                    {globalResults.map((res: any, i: number) => (
                      <Link key={`${res.bookId}-${res.sectionId}`} href={`/hadith/${res.bookId}?section=${res.sectionId}`}>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs", res.bookMeta?.color)}>
                              {res.sectionId}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{res.sectionName}</div>
                              <div className="text-[10px] text-white/40">{res.bookMeta?.name}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-amber-500 transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'books' ? (
            <motion.div
              key="books-grid"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {MAIN_BOOKS.map((book, idx) => (
                <Link key={book.id} href={`/hadith/${book.id}`}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="group p-1 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-[3rem] h-full"
                  >
                    <div className="relative h-full p-10 rounded-[2.8rem] bg-[#0d0d0d] border border-white/5 overflow-hidden flex flex-col justify-between space-y-8">
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", book.bg)} />

                      <div className="relative z-10 flex justify-between items-start">
                        <div className={cn("w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform", book.color)}>
                          <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {(book as any).isNew && (
                            <span className="px-3 py-1 rounded-full bg-amber-500 text-[8px] font-black uppercase text-black animate-pulse shadow-lg shadow-amber-500/20">جديد</span>
                          )}
                          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                            {book.tag}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 space-y-4">
                        <h2 className="text-4xl font-black text-white tracking-tighter group-hover:text-amber-500 transition-colors">
                          {book.name}
                        </h2>
                        <div className="text-sm font-bold text-white/40">{book.author}</div>
                        <p className="text-white/20 text-xs leading-relaxed font-medium line-clamp-2">
                          {book.desc}
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">عدد الأحاديث</span>
                          <span className={cn("text-xl font-black", book.color)}>{book.count}</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="about-info"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="p-16 rounded-[4rem] bg-white/5 border border-white/5 space-y-10">
                <h2 className="text-5xl font-black font-headline">عن الموسوعة الشاملة</h2>
                <p className="text-xl text-white/40 leading-loose">
                  تعد هذه الموسوعة مشروعاً رقمياً طموحاً يهدف إلى رقمنة السنة النبوية الشريفة باستخدام أحدث تقنيات الويب، مع التركيز التام على دقة المصادر من "الكتب الستة"، وتصنيفها بطريقة تسهل على الباحث والقارئ الوصول إلى المعلومة الصحيحة بيسر وسهولة.
                </p>
                <div className="space-y-6">
                  {['فحص وتدقيق يدوي وبرمجي للأحاديث', 'دعم درجات الصحة والضعف', 'دليل موضوعي وفقهي شامل', 'مشاركة وتنزيل بصيغ متعددة'].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-emerald-500 font-bold">
                      <Zap className="w-5 h-5 fill-current" /> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-16 rounded-[4rem] bg-amber-500/[0.03] border border-amber-500/10 space-y-10 border-dashed">
                <h3 className="text-3xl font-black uppercase tracking-widest text-amber-500">منهجية التحقيق</h3>
                <p className="text-white/40 leading-loose">
                  تعتمد الموسوعة على "أمهات الكتب الحديثية" بإسنادها الكامل، مع استعراض أحكام كبار المحدثين في العصر الحديث مثل الشيخ الألباني رحمه الله، مما يجعلها مرجعاً موثوقاً لطالب العلم وللمسلم غير المتخصص على حد سواء.
                </p>
                <button className="h-16 px-10 rounded-2xl bg-amber-500 text-black font-black hover:scale-105 transition-transform flex items-center gap-4">
                  تحميل الدليل المنهجي للموسوعة <Zap className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 💎 Footer Navigation Hints */}
      <section className="container mx-auto px-4 mt-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">سهولة الوصول</div>
            <p className="text-sm font-medium">بحث متقدم بالأرقام والمواضيع والأبواب</p>
          </div>
          <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">التوثيق العلمي</div>
            <p className="text-sm font-medium">عرض درجات الأحاديث من المصادر المعتمدة</p>
          </div>
          <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">المشاركة الذكية</div>
            <p className="text-sm font-medium">إمكانية نسخ الأحاديث مع تخريجها الكامل</p>
          </div>
        </div>
      </section>
    </div>
  );
}
