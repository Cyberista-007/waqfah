'use client';

import { useState, useEffect, useMemo, use, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Search, Mic, ChevronLeft, Bookmark, Heart, Share2, 
  BookOpen, Star, Info, Clock, ArrowLeft, ArrowRight,
  Library, Sparkles, Quote, MapPin, Hash, Settings, CheckCircle, Type, ShieldCheck,
  Volume2, VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { HADITH_SECTIONS_FALLBACK } from '../hadith-data-hub';
import { RIYADUSSALIHIN_FALLBACK_HADITHS } from '../riyadussalihin-data';
import { ImanCardGenerator } from '@/components/iman-card-generator';

const ALTERNATIVE_SOURCES: Record<string, string> = {
  'riyadussaliheen': 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/riyad_assalihin.json',
  'malik': 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/malik.json',
  'ahmad': 'https://raw.githubusercontent.com/Cyberista-007/Musnad-Ahmad-API/main/sections.json', 
  'darimi': 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/darimi.json'
};

const INCOMPLETE_BOOKS = ['ahmad'];
const BOOK_CACHE: Record<string, any> = {};


function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F]/g, "") // remove tashkeel
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}


function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  
  // Clean tashkeel for matching indices but preserve them for output!
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);
  
  const index = normalizedText.indexOf(normalizedQuery);
  if (index === -1) return text;
  
  // We want to find the exact character range in the original text.
  // Since removing tashkeel shortens the text, we map indices.
  let originalStart = 0;
  let normalizedIdx = 0;
  
  while (normalizedIdx < index && originalStart < text.length) {
    const char = text[originalStart];
    // Check if char is tashkeel
    if (/[\u064B-\u065F]/.test(char)) {
      originalStart++;
    } else {
      originalStart++;
      normalizedIdx++;
    }
  }
  
  // Skip any leading diacritics
  while (originalStart < text.length && /[\u064B-\u065F]/.test(text[originalStart])) {
    originalStart++;
  }
  
  let originalEnd = originalStart;
  let queryMatchedLen = 0;
  while (queryMatchedLen < normalizedQuery.length && originalEnd < text.length) {
    const char = text[originalEnd];
    if (/[\u064B-\u065F]/.test(char)) {
      originalEnd++;
    } else {
      originalEnd++;
      queryMatchedLen++;
    }
  }
  
  const before = text.substring(0, originalStart);
  const match = text.substring(originalStart, originalEnd);
  const after = text.substring(originalEnd);
  
  return (
    <>
      {before}
      <span className="bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-black border border-amber-500/20">{match}</span>
      {after}
    </>
  );
}

interface HadithGrade {
  grade: string;
  name: string;
}

interface Hadith {
  hadithnumber: number;
  text: string;
  grades: HadithGrade[];
  reference: {
    book: number;
    hadith: number;
  };
}

interface IndexData {
  [key: string]: string;
}

const GLOBAL_BOOKS_CONFIG: any = {
  'bukhari': { name: 'صحيح البخاري', subtitle: 'أصح الكتب بعد كتاب الله عز وجل', color: 'text-amber-400', bg: 'from-amber-600/20' },
  'muslim': { name: 'صحيح مسلم', subtitle: 'المسند الصحيح المختصر من السنن', color: 'text-emerald-400', bg: 'from-emerald-600/20' },
  'abudawud': { name: 'سنن أبي داود', subtitle: 'من أشهر السنن الأربعة المصنفة', color: 'text-blue-400', bg: 'from-blue-600/20' },
  'tirmidhi': { name: 'جامع الترمذي', subtitle: 'الجامع المختصر من السنن', color: 'text-rose-400', bg: 'from-rose-600/20' },
  'nasai': { name: 'سنن النسائي', subtitle: 'المجتبى من السنن الكبرى', color: 'text-violet-400', bg: 'from-violet-600/20' },
  'ibnmajah': { name: 'سنن ابن ماجه', subtitle: 'أحد الكتب الستة المعتبرة', color: 'text-orange-400', bg: 'from-orange-600/20' },
  'malik': { name: 'موطأ مالك', subtitle: 'أول المدوّنات الحديثية المرتبة', color: 'text-blue-300', bg: 'from-blue-500/20' },
  'ahmad': { name: 'مسند أحمد', subtitle: 'الديوان الأكبر لأحاديث النبي ﷺ', color: 'text-red-400', bg: 'from-red-600/20' },
  'darimi': { name: 'سنن الدارمي', subtitle: 'من أمهات السنن المعتبرة عند العلماء', color: 'text-lime-400', bg: 'from-lime-600/20' },
  'riyadussaliheen': { name: 'رياض الصالحين', subtitle: 'من كلام سيد المرسلين', color: 'text-cyan-400', bg: 'from-cyan-600/20' }
};

export default function HadithPageClient({ params }: { params: any }) {
  const unwrappedParams = use(params) as any;
  const rawBookId = unwrappedParams.bookId || 'bukhari';
  const bookId = rawBookId.trim().toLowerCase();
  const config = GLOBAL_BOOKS_CONFIG[bookId] || GLOBAL_BOOKS_CONFIG['bukhari'];
  
  const initialSections = HADITH_SECTIONS_FALLBACK[bookId] || null;
  const [sections, setSections] = useState<IndexData | null>(initialSections);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(!initialSections);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const voiceRecognitionRef = useRef<any>(null);
  
  const [fontSize, setFontSize] = useState(40); 
  const [fontFamily, setFontFamily] = useState('font-headline');
  const [showSettings, setShowSettings] = useState(false);
  
  const [favourites, setFavourites] = useState<Set<number>>(new Set());
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [playingHadithId, setPlayingHadithId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedFavs = localStorage.getItem(`fav_hadiths_${bookId}`);
    if (savedFavs) setFavourites(new Set(JSON.parse(savedFavs)));
    const savedSize = localStorage.getItem('hadith_font_size');
    if (savedSize) setFontSize(parseInt(savedSize));
    const savedFont = localStorage.getItem('hadith_font_family');
    if (savedFont) setFontFamily(savedFont);
    
    // Load read chapters
    try {
      const read = localStorage.getItem(`waqfah_read_chapters_${bookId}`);
      if (read) setReadChapters(new Set(JSON.parse(read)));
      else setReadChapters(new Set());
    } catch (e) {
      setReadChapters(new Set());
    }
  }, [bookId]);

  // Clean up audio on unmount or navigation
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedSection, bookId]);

  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const hadithParam = searchParams.get('hadith');

  useEffect(() => {
    if (sectionParam) setSelectedSection(sectionParam);
  }, [sectionParam]);

  useEffect(() => {
    if (hadithParam && !loadingHadiths && hadiths.length > 0) {
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(`hadith-${hadithParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 600);
      return () => clearTimeout(scrollTimer);
    }
  }, [hadithParam, loadingHadiths, hadiths]);

  const toggleFavorite = (h: Hadith) => {
    const id = h.hadithnumber;
    const next = new Set(favourites);
    let isAdded = false;
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      isAdded = true;
    }
    setFavourites(next);
    localStorage.setItem(`fav_hadiths_${bookId}`, JSON.stringify(Array.from(next)));
    
    // Sync with global favorites list
    try {
      let globalFavs: any[] = [];
      const stored = localStorage.getItem('waqfah_hadith_favorites');
      if (stored) globalFavs = JSON.parse(stored);
      
      const idx = globalFavs.findIndex((f: any) => f.bookId === bookId && f.hadithnumber === id);
      if (idx > -1 && !isAdded) {
        globalFavs.splice(idx, 1);
      } else if (idx === -1 && isAdded) {
        globalFavs.push({
          bookId,
          bookName: config.name,
          hadithnumber: id,
          text: h.text,
          grade: h.grades?.[0]?.grade || 'صحيح',
          savedAt: Date.now()
        });
      }
      localStorage.setItem('waqfah_hadith_favorites', JSON.stringify(globalFavs));
    } catch (e) {}

    toast({ title: isAdded ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة', duration: 1000 });
  };

  const toggleChapterRead = (sectionId: string) => {
    const next = new Set(readChapters);
    let isRead = false;
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
      isRead = true;
    }
    setReadChapters(next);
    localStorage.setItem(`waqfah_read_chapters_${bookId}`, JSON.stringify(Array.from(next)));
    toast({ 
      title: isRead ? 'تم تحديد الباب كمقروء' : 'تم إلغاء تحديد الباب كمقروء',
      description: isRead ? 'تم تحديث مستوى إنجازك في هذا الكتاب' : undefined,
      duration: 2000 
    });
  };

  const togglePlayHadith = (h: Hadith) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({ title: 'البث الصوتي غير مدعوم في متصفحك' });
      return;
    }
    
    if (playingHadithId === h.hadithnumber) {
      window.speechSynthesis.cancel();
      setPlayingHadithId(null);
    } else {
      window.speechSynthesis.cancel();
      setPlayingHadithId(h.hadithnumber);
      
      const cleanText = h.text.replace(/«|»/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arVoice) utterance.voice = arVoice;
      
      utterance.onend = () => setPlayingHadithId(null);
      utterance.onerror = () => setPlayingHadithId(null);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShare = async (h: Hadith) => {
    const textToShare = `${h.text}\n\n📚 المصدر: ${config.name}\n🔖 رقم الحديث: ${h.hadithnumber}\n\nتمت المشاركة من تطبيق "وقفة"`;
    try {
      if (navigator.share) await navigator.share({ title: config.name, text: textToShare });
      else { await navigator.clipboard.writeText(textToShare); toast({ title: 'تم نسخ نص الحديث مع التخريج' }); }
    } catch (err) {}
  };

  useEffect(() => {
    async function fetchIndex() {
      if (!initialSections) setLoading(true);
      let success = false;
      if (ALTERNATIVE_SOURCES[bookId]) {
        try {
          const url = ALTERNATIVE_SOURCES[bookId];
          const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              BOOK_CACHE[bookId] = data; 
              if (data.chapters || data.sections) {
                const mappedSections: IndexData = {};
                const sourceData = data.chapters || data.sections;
                if (Array.isArray(sourceData)) {
                  sourceData.forEach((ch: any) => {
                    mappedSections[String(ch.id)] = ch.arabic || ch.name || "";
                  });
                } else {
                  Object.entries(sourceData).forEach(([id, val]: any) => {
                    if (typeof val === 'object') mappedSections[id] = val.name;
                    else mappedSections[id] = val;
                  });
                }
                setSections(mappedSections);
                success = true;
              }
            }
        } catch (err) {}
      }

      if (!success) {
        const editions = [`${bookId}`, `${bookId}1`, `${bookId}2`];
        const providers = [
          (edition: string) => `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${edition}/sections.json`,
          (edition: string) => `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ara-${edition}/sections.json`
        ];
        for (const provider of providers) {
          if (success) break;
          for (const edition of editions) {
            try {
              const url = provider(edition);
              const res = await fetch(url, { cache: 'no-store' });
              if (!res.ok) continue;
              const data = await res.json();
              if (data.sections) { setSections(data.sections); success = true; break; }
            } catch (error) {}
          }
        }
      }
      setLoading(false);
    }
    fetchIndex();
  }, [bookId]);

  useEffect(() => {
    if (selectedSection === null) return;
    const fetchHadiths = async () => {
      setLoadingHadiths(true);
      setHadiths([]);
      let success = false;
      if (ALTERNATIVE_SOURCES[bookId]) {
        try {
          let data = null;
          if (bookId === 'ahmad' && BOOK_CACHE[bookId]) {
             const indexData = BOOK_CACHE[bookId].sections;
             const sectionInfo = indexData[selectedSection];
             const filename = (typeof sectionInfo === 'object') ? sectionInfo.file : `${selectedSection}.json`;
             let chunkUrl = ALTERNATIVE_SOURCES[bookId].replace('sections.json', `sections/${filename}`);
             const res = await fetch(chunkUrl);
             if (res.ok) data = await res.json();
          } else {
             data = BOOK_CACHE[bookId];
             if (!data) {
               const res = await fetch(ALTERNATIVE_SOURCES[bookId], { cache: 'force-cache' });
               if (res.ok) data = await res.json();
             }
          }
          if (data && data.hadiths) {
            const filtered = data.hadiths.filter((h: any) => String(h.chapterId) === String(selectedSection));
            if (filtered.length > 0) {
              const mapped = filtered.map((h: any) => ({
                hadithnumber: h.idInBook || h.id,
                text: h.arabic,
                grades: h.grades || [{ name: 'المصدر', grade: 'نسخة رقمية' }],
                reference: { book: h.chapterId, hadith: h.idInBook || h.id }
              }));
              setHadiths(mapped);
              success = true;
            }
          }
        } catch (error) {}
      }

      if (!success) {
        const editions = [`${bookId}`, `${bookId}1`, `${bookId}2`];
        const providers = [
          (edition: string, section: string) => `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${edition}/sections/${section}.json`,
          (edition: string) => `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${edition}.json`,
          (edition: string) => `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ara-${edition}.json`
        ];
        for (const provider of providers) {
          if (success) break;
          for (const edition of editions) {
            try {
              const url = provider(edition, selectedSection as string);
              const res = await fetch(url, { cache: 'no-store' });
              if (!res.ok) continue;
              const data = await res.json();
              if (data.hadiths) {
                if (!url.includes('/sections/')) {
                  const filtered = data.hadiths.filter((h: any) => 
                    String(h.reference?.book) === String(selectedSection) || 
                    String(h.book?.id) === String(selectedSection)
                  );
                  if (filtered.length > 0) { setHadiths(filtered); success = true; break; }
                } else { setHadiths(data.hadiths); success = true; break; }
              }
            } catch (error) {}
          }
        }
      }

      if (!success) {
        if (bookId === 'riyadussaliheen' && RIYADUSSALIHIN_FALLBACK_HADITHS[selectedSection]) {
           setHadiths(RIYADUSSALIHIN_FALLBACK_HADITHS[selectedSection]);
           success = true;
        }
      }
      setLoadingHadiths(false);
    }
    fetchHadiths();
  }, [selectedSection, bookId]);

  const filteredSections = useMemo(() => {
    if (!sections) return [];
    const normalizedQuery = normalizeArabic(searchQuery);
    const entries = Object.entries(sections).filter(([id, name]) => {
      const normalizedName = normalizeArabic(name);
      return normalizedName.includes(normalizedQuery) || id.includes(normalizedQuery);
    });
    if (entries.length > 0 && (entries[0][1] === "" || entries[0][1] === "introduction")) return entries.slice(1);
    return entries;
  }, [sections, searchQuery]);

    const filteredHadiths = useMemo(() => {
    if (!searchQuery || selectedSection === null) return hadiths;
    const query = normalizeArabic(searchQuery.trim());
    return hadiths.filter((h: any) => {
      const text = normalizeArabic(h.text || h.arabic || "");
      const number = String(h.hadithnumber || h.number || "");
      return text.includes(query) || number.includes(query);
    });
  }, [hadiths, searchQuery, selectedSection]);

  const totalChapters = sections ? Object.keys(sections).length : 0;
  const completedChaptersCount = readChapters.size;
  const progressPercent = totalChapters > 0 ? Math.round((completedChaptersCount / totalChapters) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
      <section className="relative px-4 pt-10 pb-20 overflow-hidden container">
        <div className={cn("absolute inset-0 bg-gradient-to-br via-background to-background rounded-[3rem] border border-white/5", config.bg)} />
        <div className="absolute inset-0 opacity-10 pointer-events-none rounded-[3rem]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container relative z-10 text-center space-y-8 max-w-4xl pt-20">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
             <Sparkles className={cn("w-4 h-4", config.color)} /> موسوعة السنة النبوية
           </motion.div>
           <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-6xl md:text-8xl lg:text-9xl font-black font-headline tracking-tighter text-white leading-tight">
             {config.name.split(' ')[0]} <span className={cn("italic font-normal block md:inline", config.color)}>{config.name.split(' ').slice(1).join(' ')}</span>
           </motion.h1>
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-white/40 italic font-serif">"{config.subtitle}"</motion.p>
           
           {totalChapters > 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 0.3 }}
               className="max-w-md mx-auto mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
             >
               <div className="flex-1 text-right">
                 <div className="text-sm font-black text-white/80">تقدم القراءة في هذا الكتاب</div>
                 <div className="text-xs text-white/40 mt-1">أكملت قراءة {completedChaptersCount} من أصل {totalChapters} باباً ({progressPercent}%)</div>
               </div>
               <div className="relative w-12 h-12 flex items-center justify-center">
                 <svg className="w-12 h-12 transform -rotate-90">
                   <circle cx="24" cy="24" r="20" className="stroke-white/5" strokeWidth="4" fill="transparent" />
                   <circle 
                     cx="24" 
                     cy="24" 
                     r="20" 
                     className={cn("transition-all duration-500", config.color?.replace('text-', 'stroke-') || 'stroke-primary')} 
                     strokeWidth="4" 
                     fill="transparent" 
                     strokeDasharray={2 * Math.PI * 20}
                     strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
                   />
                 </svg>
                 <span className="absolute text-[10px] font-black">{progressPercent}%</span>
               </div>
             </motion.div>
           )}

           {INCOMPLETE_BOOKS.includes(bookId) && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/60 text-xs font-bold">
               <Info className="w-4 h-4 text-amber-500" /> تنبيه: هذه النسخة الرقمية قد تكون غير مكتملة حالياً.
             </motion.div>
           )}
           <div className="max-w-xl mx-auto pt-10">
              <div className="relative group">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-primary transition-colors" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={selectedSection ? "بحث في هذا القسم..." : "بحث في عناوين الأبواب..."} className="w-full h-16 pr-16 pl-6 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/[0.07] outline-none font-bold text-lg transition-all text-center" />
              </div>
           </div>
        </div>
      </section>

      <div className="container px-4">
        <AnimatePresence mode="wait">
          {selectedSection === null ? (
            <div className="space-y-12">
               <div className="flex flex-wrap justify-center gap-3 mb-16">
                  {Object.entries(GLOBAL_BOOKS_CONFIG).map(([id, meta]: any) => (
                    <Link key={id} href={`/hadith/${id}`} className={cn("px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all", bookId === id ? cn("bg-white text-black border-white scale-110", meta.color) : "bg-white/5 border-white/10 text-white/40")}>{meta.name}</Link>
                  ))}
               </div>
              <motion.div key="index" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? ( Array(12).fill(0).map((_, i) => <div key={i} className="h-32 rounded-[2rem] bg-white/5 animate-pulse" />) ) : (
                  filteredSections.map(([id, name]) => (
                    <motion.button key={id} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedSection(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group relative p-8 rounded-[2.5rem] bg-card/20 border border-white/5 hover:border-primary/30 hover:bg-white/[0.02] text-right transition-all flex flex-col justify-between min-h-[160px]">
                      <div className="flex justify-between items-start mb-4">
                         <span className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs border border-white/5", config.color)}>{id}</span>
                         <div className="flex items-center gap-2">
                           {readChapters.has(id) && (
                             <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                               <CheckCircle className="w-3 h-3" /> تم
                             </span>
                           )}
                           <BookOpen className="w-5 h-5 text-white/10 group-hover:text-primary/30" />
                         </div>
                      </div>
                      <h3 className="text-xl font-black text-white leading-relaxed">{name || "بدون عنوان"}</h3>
                      <div className="absolute bottom-4 left-8 opacity-0 group-hover:opacity-100 transition-all"><ArrowLeft className={cn("w-4 h-4", config.color)} /></div>
                    </motion.button>
                  ))
                )}
              </motion.div>
            </div>
          ) : (
            <motion.div key="hadiths" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/5 flex-wrap gap-4">
                 <button onClick={() => setSelectedSection(null)} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-black text-sm"><ArrowRight className="w-5 h-5" /> الفهرس</button>
                 <div className="flex gap-2">
                   <button 
                     onClick={() => toggleChapterRead(selectedSection)} 
                     className={cn(
                       "flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm border transition-all",
                       readChapters.has(selectedSection) 
                         ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                         : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                     )}
                   >
                     <CheckCircle className="w-4 h-4" />
                     {readChapters.has(selectedSection) ? 'مكتمل' : 'تحديد كمقروء'}
                   </button>
                   <button onClick={() => setShowSettings(!showSettings)} className={cn("p-4 rounded-2xl border transition-all", showSettings ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10")}><Settings className="w-5 h-5" /></button>
                 </div>
              </div>
              <AnimatePresence>
                {showSettings && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-[2.5rem] bg-zinc-900 border border-white/10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div><label>حجم الخط: {fontSize}px</label><input type="range" min="20" max="80" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-lg accent-amber-500" /></div>
                       <div className="flex gap-2"> {['font-headline', 'font-sans', 'font-serif'].map(f => (
                         <button 
                           key={f} 
                           onClick={() => setFontFamily(f)} 
                           className={cn("px-4 py-2 rounded-xl text-[10px] font-black border", fontFamily === f ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60")}
                         >
                           {f === 'font-headline' ? 'خط العناوين' : f === 'font-sans' ? 'خط بسيط' : 'خط كلاسيكي'}
                         </button>
                       ))}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-col gap-8">
                {loadingHadiths ? ( Array(3).fill(0).map((_, i) => <div key={i} className="h-64 rounded-[3rem] bg-white/5 animate-pulse" />) ) : (
                  filteredHadiths.map((h) => (
                    <motion.div 
                      key={h.hadithnumber} 
                      id={`hadith-${h.hadithnumber}`} 
                      initial={{ opacity: 0, y: 30 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true }} 
                      className={cn(
                        "p-10 md:p-16 rounded-[4rem] bg-zinc-950 border relative overflow-hidden transition-all duration-700",
                        hadithParam === String(h.hadithnumber)
                          ? "border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.15)] ring-2 ring-amber-500/20"
                          : "border-white/10"
                      )}
                    >
                      <div className="absolute top-10 left-10 opacity-5"><Quote className="w-48 h-48" /></div>
                      <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/5 mb-8">
                           <div className="flex gap-4 items-center">
                              <span className={cn("px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em]", config.color)}>حديث رقم: {h.hadithnumber}</span>
                           </div>
                            <div className="flex gap-2">
                              <ImanCardGenerator 
                                title={`حديث شريف - ${config.name}`}
                                content={h.text}
                                source={`${config.name} - حديث رقم: ${h.hadithnumber}`}
                                trigger={
                                  <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 bg-white/5 text-white/40 hover:text-white" title="تحميل كبطاقة دعوية">
                                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                  </Button>
                                }
                              />
                             <Button 
                               onClick={() => togglePlayHadith(h)} 
                               variant="ghost" 
                               size="icon" 
                               className={cn(
                                 "rounded-xl border border-white/5 bg-white/5 transition-all",
                                 playingHadithId === h.hadithnumber ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "text-white/40 hover:text-white"
                               )}
                               title={playingHadithId === h.hadithnumber ? "إيقاف القراءة الصوتية" : "استماع للحديث"}
                             >
                               {playingHadithId === h.hadithnumber ? (
                                 <div className="flex gap-[2px] items-center justify-center h-4 w-4">
                                   <span className="w-[3px] h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                                   <span className="w-[3px] h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                   <span className="w-[3px] h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                                 </div>
                               ) : (
                                 <Volume2 className="w-4 h-4" />
                               )}
                             </Button>
                             <Button onClick={() => handleShare(h)} variant="ghost" size="icon" className="rounded-xl border border-white/5 bg-white/5"><Share2 className="w-4 h-4 opacity-40 hover:opacity-100" /></Button>
                             <Button onClick={() => toggleFavorite(h)} variant="ghost" size="icon" className={cn("rounded-xl border border-white/5 bg-white/5", favourites.has(h.hadithnumber) ? "bg-rose-500/10 border-rose-500/20" : "")}><Heart className={cn("w-4 h-4", favourites.has(h.hadithnumber) ? "fill-current text-rose-400" : "opacity-40")} /></Button>
                           </div>
                        </div>
                        <p style={{ fontSize: `${fontSize}px` }} className={cn("font-black leading-[1.8] text-white text-right", fontFamily)}>{highlightMatch(h.text, searchQuery)}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedSection && !loadingHadiths && sections && (
           <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-3xl bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-[95vw] md:max-w-none">
              {(() => {
                const sectionIds = Object.keys(sections);
                const currentIndex = sectionIds.indexOf(selectedSection);
                const prevId = sectionIds[currentIndex - 1];
                const nextId = sectionIds[currentIndex + 1];
                return (
                  <>
                    <button onClick={() => { if (prevId) { setSelectedSection(prevId); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} disabled={!prevId} className="h-12 px-4 md:px-6 rounded-xl bg-white/5 disabled:opacity-20 flex items-center gap-2 font-bold text-xs md:text-sm"><ArrowRight className="w-4 h-4" /> السابق</button>
                    <div className="w-[1px] bg-white/10 h-12" />
                    <button 
                      onClick={() => toggleChapterRead(selectedSection)} 
                      className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center border transition-all",
                        readChapters.has(selectedSection) 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                      )}
                      title={readChapters.has(selectedSection) ? 'مكتمل' : 'تحديد كمقروء'}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <div className="w-[1px] bg-white/10 h-12" />
                    <button onClick={() => { if (nextId) { setSelectedSection(nextId); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} disabled={!nextId} className={cn("h-12 px-4 md:px-6 rounded-xl text-white font-black flex items-center gap-2 disabled:opacity-20 text-xs md:text-sm", config.color?.replace('text-', 'bg-')?.replace('400', '600') || 'bg-primary')}>التالي <ArrowLeft className="w-4 h-4" /></button>
                  </>
                );
              })()}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
