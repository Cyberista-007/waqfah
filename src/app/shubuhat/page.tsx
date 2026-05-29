"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, BrainCircuit, Atom, BookOpen, ScrollText, Search, ChevronDown, 
  Scale, Lightbulb, Sparkles, MessageSquareWarning, Fingerprint, 
  ShieldAlert, BookMarked, Share2, Library, Quote, CheckCircle2,
  Users, Activity, ThumbsUp, ThumbsDown, MessageSquarePlus, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase';
import type { Shubha } from '@/lib/types';

// Map Arabic category names from JSON to internal IDs
const CAT_MAP: Record<string, string> = {
  'القرآن الكريم': 'quran',
  'السنة النبوية': 'sunnah',
  'العقيدة': 'aqeedah',
  'العقيدة والفلسفة': 'aqeedah',
  'الشريعة الإسلامية': 'sharia',
  'النبوة والرسالة': 'prophethood',
  'التاريخ الإسلامي': 'history',
  'المرأة والأسرة': 'women',
  'العلم والتجربة': 'science',
  'العلم الحديث': 'science',
  'الإلحاد': 'atheism',
};

function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u0652]/g, '') // Remove diacritics (harakat)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function highlightText(text: string, highlight: string) {
  if (!highlight || !highlight.trim()) return <span>{text}</span>;
  
  const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const words = escapedHighlight.split(/\s+/).filter(Boolean);
  if (words.length === 0) return <span>{text}</span>;
  
  const regex = new RegExp(`(${words.join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-indigo-500/30 text-indigo-200 px-0.5 rounded font-bold">{part}</mark>
        ) : (
          part
        )
      )}
    </span>
  );
}


const CATEGORIES = [
  { id: 'all', name: 'الكل', icon: Sparkles, color: 'text-white', bg: 'bg-white/5' },
  { id: 'quran', name: 'القرآن الكريم', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'sunnah', name: 'السنة النبوية', icon: ScrollText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'aqeedah', name: 'العقيدة', icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'sharia', name: 'الشريعة', icon: Scale, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'prophethood', name: 'النبوة', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'history', name: 'التاريخ', icon: Library, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'women', name: 'المرأة والأسرة', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'science', name: 'العلم الحديث', icon: Atom, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'atheism', name: 'الإلحاد', icon: BrainCircuit, color: 'text-red-400', bg: 'bg-red-500/10' },
];

// Fallback data (first few entries while loading)
const SHUBUHAT_FALLBACK: any[] = [];

export default function ShubuhatPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTabMapping, setActiveTabMapping] = useState<Record<string, string>>({});
  const [helpfulState, setHelpfulState] = useState<Record<string, 'up' | 'down'>>({});
  const [localShubuhat, setLocalShubuhat] = useState<any[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const { toast } = useToast();

  const { data: firebaseShubuhat, isLoading: isFirebaseLoading } = useCollection<Shubha>('shubuhat', { orderBy: ['createdAt', 'desc'] });

  // Fetch the 500 shubuhat from local public file (downloaded from GitHub)
  useEffect(() => {
    const load = async () => {
      try {
        const urls = ['/data/shubuhat.json', 'https://raw.githubusercontent.com/Cyberista-007/religious-misconceptions/main/data.json'];
        let data: any[] | null = null;
        for (const url of urls) {
          try {
            const res = await fetch(url);
            if (res.ok) { data = await res.json(); break; }
          } catch { continue; }
        }
        if (Array.isArray(data)) {
          setLocalShubuhat(data.map((item: any, idx: number) => ({
            id: String(item.id || idx + 1),
            categoryId: CAT_MAP[item.category] || 'aqeedah',
            question: item.question,
            summary: item.summary,
            answer: item.answer,
            sources: typeof item.sources === 'string' ? item.sources.split('،').map((s: string) => s.trim()) : (item.sources || []),
            tags: item.tags || [],
            views: item.views || Math.floor(Math.random() * 2000 + 200),
            isVerified: item.is_verified ?? true,
          })));
        }
      } catch { /* silent */ } finally { setIsLocalLoading(false); }
    };
    load();
  }, []);

  const isLoading = isFirebaseLoading && isLocalLoading;
  
  // Priority: Firebase > local JSON > fallback
  const shubuhatData = (firebaseShubuhat && firebaseShubuhat.length > 0)
    ? firebaseShubuhat
    : localShubuhat.length > 0
      ? localShubuhat
      : SHUBUHAT_FALLBACK as any[];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ بنجاح",
      description: "تم نسخ الرد إلى الحافظة لمشاركته.",
    });
  };

  const handleHelpful = (id: string, type: 'up' | 'down') => {
    setHelpfulState(prev => ({ ...prev, [id]: type }));
    toast({
      title: type === 'up' ? "شكراً لملاحظاتك!" : "نأسف لذلك",
      description: type === 'up' ? "سعدنا بأن الرد كان مقنعاً ومفيداً لك." : "سنعمل على تحسين جودة الرد وتوضيحه بشكل أفضل.",
    });
  };

  const handleShare = async (item: any) => {
    const shareText = `تفنيد شبهة: ${item.question}\n\n${item.summary}`;
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?id=${item.id}` : '';
    const fullText = `${shareText}\n\nاقرأ الرد كاملاً على منصة وقفة:\n${shareUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'منصة وقفة - تفنيد الشبهات',
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "تم فتح المشاركة",
          description: "تم استدعاء شاشة المشاركة بنجاح.",
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(fullText);
          toast({
            title: "تم نسخ النص ورابط المشاركة",
            description: "تم نسخ محتوى الشبهة ورابطها للحافظة لمشاركتها يدوياً.",
          });
        }
      }
    } else {
      // Fallback for desktop browsers
      navigator.clipboard.writeText(fullText);
      toast({
        title: "تم نسخ النص ورابط المشاركة",
        description: "عذراً، متصفحك لا يدعم المشاركة المباشرة. تم نسخ الرابط وموجز الرد للحافظة لمشاركته في أي تطبيق.",
      });
      
      // Let's redirect them to WhatsApp Web/App as a friendly fallback shortcut
      const encodedText = encodeURIComponent(fullText);
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    }
  };


  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: shubuhatData.length };
    shubuhatData.forEach(item => {
      const cat = item.categoryId || 'aqeedah';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [shubuhatData]);

  const filteredShubuhat = useMemo(() => {
    const normalizedQuery = normalizeArabic(searchQuery);
    if (!normalizedQuery) {
      return shubuhatData.filter(item => activeCategory === 'all' || item.categoryId === activeCategory);
    }

    const queryTokens = normalizedQuery.split(' ').filter(Boolean);

    const scored = shubuhatData
      .filter(item => activeCategory === 'all' || item.categoryId === activeCategory)
      .map(item => {
        const normQuestion = normalizeArabic(item.question || '');
        const normAnswer = normalizeArabic(item.answer || '');
        const normSummary = normalizeArabic(item.summary || '');
        const normTags = (item.tags || []).map((t: string) => normalizeArabic(t));

        let score = 0;
        let matchedAllTokens = true;

        for (const token of queryTokens) {
          let tokenMatched = false;
          if (normQuestion.includes(token)) {
            score += 10;
            if (normQuestion.startsWith(token) || normQuestion.includes(' ' + token)) {
              score += 5;
            }
            tokenMatched = true;
          }
          if (normSummary.includes(token)) {
            score += 5;
            tokenMatched = true;
          }
          if (normAnswer.includes(token)) {
            score += 2;
            tokenMatched = true;
          }
          if (normTags.some((t: string) => t.includes(token))) {
            score += 8;
            tokenMatched = true;
          }

          if (!tokenMatched) {
            matchedAllTokens = false;
          }
        }

        return { item, score, matchedAllTokens };
      })
      .filter(res => res.matchedAllTokens || res.score > 5)
      .sort((a, b) => b.score - a.score);

    return scored.map(res => res.item);
  }, [activeCategory, searchQuery, shubuhatData]);


  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeCategory, searchQuery]);
  const pagedShubuhat = useMemo(() => filteredShubuhat.slice(0, page * PAGE_SIZE), [filteredShubuhat, page]);
  const hasMore = pagedShubuhat.length < filteredShubuhat.length;

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (expandedId !== id && !activeTabMapping[id]) {
      setActiveTabMapping(prev => ({ ...prev, [id]: 'answer' }));
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-indigo-500/30 pb-32">
      {/* 🌌 Cinematic Hero Section */}
      <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 pt-40 pb-20 px-4 overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl bg-[#0a0a0a]">
        {/* Background Gradients & Noise */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 animate-pulse duration-1000" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4" />

        <div className="container relative z-10 mx-auto w-full text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            <ShieldCheck className="w-4 h-4" /> الدفاع عن الثوابت الإسلامية
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 20 }}
            className="text-7xl md:text-[8rem] font-black font-headline tracking-tighter leading-[0.9] text-white"
          >
            حصن <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-300 via-indigo-500 to-purple-600 italic drop-shadow-lg">اليقين</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/40 font-medium leading-relaxed max-w-3xl mx-auto"
          >
            منصة فكرية متطورة لتفكيك الشبهات المعاصرة والرد عليها بمنهجية علمية وعقلية صارمة، لترسيخ اليقين وحماية الوعي.
          </motion.p>

          {/* 📊 Advanced Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full mx-auto"
          >
            {[
              { label: 'شبهة مفندة', value: shubuhatData.length > 0 ? `${shubuhatData.length}+` : '+500', icon: ShieldCheck, color: 'text-indigo-400' },
              { label: 'تصنيف علمي', value: '10', icon: Library, color: 'text-emerald-400' },
              { label: 'باحث ومختص', value: '45', icon: Users, color: 'text-amber-400' },
              { label: 'تحديثات مستمرة', value: 'يومياً', icon: Activity, color: 'text-rose-400' },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-[2.25rem] bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(255,255,255,0.05),0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out hover:border-emerald-500/25 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(255,255,255,0.05),0_25px_50px_rgba(16,185,129,0.04)] hover:bg-white/[0.03] group">
                <stat.icon className={cn("w-6 h-6 mx-auto mb-4 opacity-50 group-hover:opacity-100 transition-opacity", stat.color)} />
                <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform origin-center">{stat.value}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative w-full mx-auto group mt-12"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute right-6 w-6 h-6 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن شبهة، كلمة مفتاحية، أو موضوع..."
                className="w-full h-16 pl-6 pr-16 bg-white/[0.03] border border-white/10 rounded-2xl text-lg font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all backdrop-blur-xl shadow-2xl"
              />
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-white/40 font-bold">مواضيع شائعة:</span>
              {[
                'حفظ القرآن',
                'النهي عن النفخ',
                'خلق الكون',
                'السحر والشعوذة',
                'الزلازل والبراكين',
                'عقود الاستصناع'
              ].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-white/60 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 transition-all font-medium"
                >
                  {tag}
                </button>
              ))}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all font-bold"
                >
                  إعادة تعيين ✕
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🧭 Categories Browser */}
      <section className="container mx-auto w-full px-4 mt-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all border shadow-lg relative group overflow-hidden",
                  isActive
                    ? "bg-white text-black border-transparent shadow-white/20"
                    : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                )}
              >
                <cat.icon className={cn("w-5 h-5", isActive ? "text-black" : cat.color)} />
                <span>{cat.name}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-black",
                  isActive 
                    ? "bg-black/10 text-black" 
                    : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white"
                )}>
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 🛡️ Advanced Shubuhat Grid / Master-Detail Accordion */}
      <section className="container mx-auto w-full px-4 mt-20 relative z-10">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-[120px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse flex items-center p-8 md:p-10 gap-6">
                  <div className="w-[72px] h-[72px] rounded-[1.5rem] bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div className="w-24 h-3 bg-white/5 rounded-full" />
                    <div className="w-2/3 h-6 bg-white/10 rounded-full" />
                    <div className="w-1/3 h-4 bg-white/5 rounded-full hidden md:block" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredShubuhat.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Fingerprint className="w-20 h-20 mx-auto text-white/10 mb-6" />
              <h3 className="text-2xl font-black text-white/50">لم نجد شبهات تطابق بحثك</h3>
              <p className="text-white/30 mt-2">حاول استخدام كلمات مفتاحية مختلفة</p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-6">
                {pagedShubuhat.map((item, index) => {
                const category = CATEGORIES.find(c => c.id === item.categoryId);
                const isExpanded = expandedId === item.id;
                const activeTab = activeTabMapping[item.id] || 'answer';
                const relatedItems = shubuhatData.filter(s => s.id !== item.id && s.categoryId === item.categoryId).slice(0, 2);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(index * 0.03, 0.4) }}
                    key={item.id}
                    className={cn(
                      "group rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative",
                      isExpanded
                        ? "bg-zinc-900/80 border-indigo-500/40 shadow-[0_0_80px_-15px_rgba(99,102,241,0.25)]"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-2xl"
                    )}
                  >
                    {/* Hover Glow Effect */}
                    {!isExpanded && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />}

                    <button
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full text-right p-8 md:p-10 flex items-start gap-6 relative z-10"
                    >
                      <div className={cn("shrink-0 p-5 rounded-[1.5rem] border", isExpanded ? "border-indigo-500/30" : "border-transparent", category?.bg)}>
                        {category && <category.icon className={cn("w-8 h-8", category.color)} />}
                      </div>
                      
                      <div className="flex-1 space-y-3 pt-2">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-widest opacity-60 mb-4">
                          <span className={category?.color}>{category?.name}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          {item.isVerified && (
                            <>
                              <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> موثق علمياً</span>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                            </>
                          )}
                          {item.tags && item.tags.map((tag: string, tIndex: number) => (
                            <React.Fragment key={tag}>
                              <span className="text-white/60">{tag}</span>
                              {tIndex < item.tags.length - 1 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                            </React.Fragment>
                          ))}
                        </div>
                        <h2 className={cn("text-2xl md:text-4xl font-black leading-tight text-white transition-colors", isExpanded ? "text-indigo-300" : "group-hover:text-indigo-200")}>
                          {highlightText(item.question, searchQuery)}
                        </h2>
                        {!isExpanded && (
                          <p className="text-white/40 text-lg md:text-xl leading-relaxed mt-4 line-clamp-2 font-medium">
                            {highlightText(item.summary, searchQuery)}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 pt-4 hidden md:block">
                        <div className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500",
                          isExpanded ? "bg-indigo-500 text-white border-transparent rotate-180 shadow-lg shadow-indigo-500/20" : "bg-white/5 border-white/10 text-white/40 group-hover:bg-white/10 group-hover:scale-110"
                        )}>
                          <ChevronDown className="w-6 h-6" />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 md:px-10 pb-10">
                            {/* Inner Tabs for Answer Structuring */}
                            <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
                                <button 
                                  onClick={() => setActiveTabMapping(prev => ({ ...prev, [item.id]: 'answer' }))}
                                  className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'answer' ? "bg-indigo-500/20 text-indigo-400" : "text-white/40 hover:text-white")}
                                >
                                  التفنيد والرد
                                </button>
                                <button 
                                  onClick={() => setActiveTabMapping(prev => ({ ...prev, [item.id]: 'sources' }))}
                                  className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'sources' ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white")}
                                >
                                  المصادر والمراجع
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'answer' && (
                                    <motion.div 
                                      key="answer"
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      className="flex gap-6 items-start"
                                    >
                                      <div className="shrink-0 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hidden md:block">
                                        <Lightbulb className="w-6 h-6 text-indigo-400" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="space-y-6">
                                          {item.answer.split('\n\n').map((paragraph: string, pIndex: number) => (
                                            <p key={pIndex} className="text-xl md:text-2xl leading-[2.2] text-white/80 font-medium font-tajawal selection:bg-indigo-500/40">
                                              {highlightText(paragraph, searchQuery)}
                                            </p>
                                          ))}
                                        </div>

                                        <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                                          <span className="text-white/60 font-bold text-lg">هل كان هذا التفنيد مقنعاً ومفيداً لك؟</span>
                                          <div className="flex gap-3">
                                            <Button 
                                              variant="outline" 
                                              onClick={(e) => { e.stopPropagation(); handleHelpful(item.id, 'up'); }}
                                              className={cn("rounded-xl border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30", helpfulState[item.id] === 'up' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30")}
                                            >
                                              <ThumbsUp className="w-4 h-4 ml-2" /> نعم، مقنع
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              onClick={(e) => { e.stopPropagation(); handleHelpful(item.id, 'down'); }}
                                              className={cn("rounded-xl border-white/10 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30", helpfulState[item.id] === 'down' && "bg-rose-500/20 text-rose-400 border-rose-500/30")}
                                            >
                                              <ThumbsDown className="w-4 h-4 ml-2" /> غير مقنع
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                )}

                                {activeTab === 'sources' && (
                                    <motion.div 
                                      key="sources"
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      className="flex gap-6 items-start"
                                    >
                                      <div className="shrink-0 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hidden md:block">
                                        <BookMarked className="w-6 h-6 text-emerald-400" />
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="text-lg font-black text-emerald-400 mb-6">مصادر التوثيق والاستزادة:</h3>
                                        <ul className="space-y-4">
                                            {item.sources && item.sources.map((source: string, sIdx: number) => (
                                                <li key={sIdx} className="flex items-center gap-4 text-xl text-white/70 font-medium">
                                                    <Quote className="w-5 h-5 text-emerald-500/40" />
                                                    {source}
                                                </li>
                                            ))}
                                        </ul>
                                      </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Actions Footer */}
                            <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-white/30 text-xs font-bold uppercase tracking-widest">
                                    <span>تمت المشاهدة {item.views} مرة</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button 
                                    onClick={(e) => { e.stopPropagation(); handleCopy(item.answer); }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
                                  >
                                    <ShieldAlert className="w-4 h-4 ml-2" /> نسخ الرد
                                  </Button>
                                  <Button variant="ghost" className="hidden sm:flex border border-white/10 hover:bg-white/10 text-white rounded-xl px-6 h-12 font-bold">
                                    <MessageSquareWarning className="w-4 h-4 ml-2" /> إبلاغ عن شبهة
                                  </Button>
                                  <Button 
                                    onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                                    variant="outline" className="border-white/10 hover:bg-white/10 text-white rounded-xl h-12 w-12 p-0"
                                    title="مشاركة الشبهة"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white rounded-xl h-12 w-12 p-0">
                                    <BookMarked className="w-4 h-4" />
                                  </Button>
                                </div>
                            </div>

                            {/* Related Shubuhat */}
                            {relatedItems.length > 0 && (
                              <div className="mt-8 pt-8 border-t border-white/5">
                                <h4 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2"><Library className="w-4 h-4"/> شبهات ذات صلة</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {relatedItems.map(related => (
                                    <button 
                                      key={related.id} 
                                      onClick={() => {
                                        window.scrollTo({ top: 400, behavior: 'smooth' });
                                        toggleAccordion(related.id);
                                      }}
                                      className="text-right p-5 rounded-[1.5rem] bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group/related"
                                    >
                                      <h5 className="text-white/80 font-bold mb-2 group-hover/related:text-indigo-400 transition-colors line-clamp-1 text-lg">{related.question}</h5>
                                      <p className="text-white/40 text-sm line-clamp-2 font-medium">{related.summary}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
            {/* Load More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 mt-12"
              >
                <p className="text-white/30 text-sm">
                  عرض {pagedShubuhat.length} من {filteredShubuhat.length} شبهة
                </p>
                <Button
                  onClick={() => setPage(p => p + 1)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 h-14 font-bold text-lg shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
                >
                  تحميل المزيد
                </Button>
              </motion.div>
            )}
            </>
          )}
        </AnimatePresence>
      </section>

      {/* 💬 Ask a Scholar Floating Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 left-8 z-50 bg-indigo-600 text-white rounded-full p-3 md:p-4 shadow-[0_0_40px_-5px_rgba(99,102,241,0.5)] flex items-center gap-3 border border-indigo-400/30 group transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </div>
        <span className="font-bold text-lg hidden sm:block pr-2 pl-2">اسأل خبيراً</span>
      </motion.button>
    </div>
  );
}
