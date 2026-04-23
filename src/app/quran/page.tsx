'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Copy, Share2, Check, Search, X,
  Layers, Heart, Star, Bookmark, LayoutGrid, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';

// ━━━━━━━━━━━ TYPES ━━━━━━━━━━━

type Verse = {
  id: number;
  surah: string;
  surahNumber: number;
  ayahNumber: string; // can be range like "1-5"
  arabic: string;
  tafseer: string;
  theme?: string;
};

type Collection = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  verses: Verse[];
};

// ━━━━━━━━━━━ DATA ━━━━━━━━━━━

const QURAN_DATA: Collection[] = [
  {
    id: 'iman',
    label: 'آيات الإيمان',
    description: 'آيات تُرسّخ اليقين وتُثبّت القلوب',
    icon: Sparkles,
    color: 'text-violet-300',
    bg: 'from-violet-950/50 to-purple-950/30',
    border: 'border-violet-500/30',
    verses: [
      {
        id: 1,
        surah: 'البقرة',
        surahNumber: 2,
        ayahNumber: '255',
        arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
        tafseer: 'آية الكرسي — سيدة آيات القرآن الكريم. تُجسّد كمال صفات الله وعظمته المطلقة؛ هو الحي الدائم الذي لا تأخذه غفلة أو نوم، القيّوم على كل شيء.',
        theme: 'آية الكرسي',
      },
      {
        id: 2,
        surah: 'البقرة',
        surahNumber: 2,
        ayahNumber: '285-286',
        arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
        tafseer: 'خاتمة سورة البقرة — من قرأهما في ليلة كفتاه. تُعلن إيمان المؤمنين بكامل أركانه وتُقرّر قاعدة عدل عظيمة: لن يكلّفك الله ما لا تطيق.',
        theme: 'آمن الرسول',
      },
      {
        id: 3,
        surah: 'الإخلاص',
        surahNumber: 112,
        ayahNumber: '1-4',
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        tafseer: 'سورة الإخلاص — تعدل ثلث القرآن. إعلان التوحيد الخالص في أوجز صورة وأبلغها: الله واحد أحد لا شريك ولا نظير.',
        theme: 'سورة الإخلاص',
      },
    ],
  },
  {
    id: 'tawakkul',
    label: 'آيات التوكل والصبر',
    description: 'آيات تُعين على الصبر وتُثبّت على التوكل',
    icon: Heart,
    color: 'text-rose-300',
    bg: 'from-rose-950/50 to-pink-950/30',
    border: 'border-rose-500/30',
    verses: [
      {
        id: 4,
        surah: 'الزمر',
        surahNumber: 39,
        ayahNumber: '53',
        arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
        tafseer: 'باب الرجاء الواسع المفتوح — مهما عظمت ذنوبك فرحمة الله أوسع. أعظم آية رجاء في القرآن.',
        theme: 'الرجاء والمغفرة',
      },
      {
        id: 5,
        surah: 'الطلاق',
        surahNumber: 65,
        ayahNumber: '3',
        arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا',
        tafseer: 'وعد إلهي صريح: من أسند أمره إلى الله كفاه الله وكان له حسباً. التوكل لا يعني الكسل بل الأخذ بالأسباب مع استناد القلب إلى الله.',
        theme: 'التوكل على الله',
      },
      {
        id: 6,
        surah: 'الشرح',
        surahNumber: 94,
        ayahNumber: '5-6',
        arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        tafseer: 'بشارة مكررة: مع كل عسر يسرٌ لأن الله كرّرها — فلن يغلب عسرٌ واحد يُسرَيْن. قانون رباني في الحياة: الكرب لا يدوم.',
        theme: 'مع العسر يسر',
      },
    ],
  },
  {
    id: 'dhikr',
    label: 'آيات الذكر والدعاء',
    description: 'آيات تحثّ على ذكر الله والتقرب إليه',
    icon: Star,
    color: 'text-amber-300',
    bg: 'from-amber-950/50 to-orange-950/30',
    border: 'border-amber-500/30',
    verses: [
      {
        id: 7,
        surah: 'الرعد',
        surahNumber: 13,
        ayahNumber: '28',
        arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
        tafseer: 'كلمة قرآنية جمعت حكمة الطب النفسي كله: لا شيء يُعيد للقلب سكينته حقاً وسلامه إلا ذكر الله — وهذه حقيقة يُصدّقها كل من جرّبها.',
        theme: 'اطمئنان القلب',
      },
      {
        id: 8,
        surah: 'البقرة',
        surahNumber: 2,
        ayahNumber: '186',
        arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ',
        tafseer: 'لم يقل "قل لهم إني قريب" بل قال "فإني قريب" مباشرة — في هذا الحذف أبلغ معنى: الله قريب منك مباشرة لا يحتاج وسيطاً.',
        theme: 'قُرب الله من العبد',
      },
      {
        id: 9,
        surah: 'غافر',
        surahNumber: 40,
        ayahNumber: '60',
        arabic: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ ۚ إِنَّ الَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِي سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ',
        tafseer: 'أمر إلهي صريح بالدعاء وضمان بالإجابة — الدعاء عبادة وحده مستقل، والترك عنه تكبّر مذموم.',
        theme: 'ادعوني أستجب',
      },
    ],
  },
  {
    id: 'akhlaq',
    label: 'آيات الأخلاق',
    description: 'آيات تُرسي منظومة الأخلاق الإسلامية',
    icon: Bookmark,
    color: 'text-emerald-300',
    bg: 'from-emerald-950/50 to-teal-950/30',
    border: 'border-emerald-500/30',
    verses: [
      {
        id: 10,
        surah: 'لقمان',
        surahNumber: 31,
        ayahNumber: '17-19',
        arabic: 'يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ ۖ إِنَّ ذَٰلِكَ مِنْ عَزْمِ الْأُمُورِ ۝ وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا ۖ إِنَّ اللَّهَ لَا يُحِبُّ كُلَّ مُخْتَالٍ فَخُورٍ ۝ وَاقْصِدْ فِي مَشْيِكَ وَاغْضُضْ مِن صَوْتِكَ ۚ إِنَّ أَنكَرَ الْأَصْوَاتِ لَصَوْتُ الْحَمِيرِ',
        tafseer: 'وصايا لقمان لابنه — منهج تربوي متكامل: الصلاة، الأمر بالمعروف، الصبر، التواضع، الاعتدال في المشي، وخفض الصوت.',
        theme: 'وصايا لقمان',
      },
      {
        id: 11,
        surah: 'الإسراء',
        surahNumber: 17,
        ayahNumber: '23',
        arabic: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
        tafseer: 'قرن الله حق الوالدين بحقه — دلالة على عظمة مكانتهما. "أُفّ" أخف كلمة أذى وقد نهى عنها: التحريم هنا يشمل كل أذى لفظي أو معنوي.',
        theme: 'برّ الوالدين',
      },
    ],
  },
];

const ALL_VERSES = QURAN_DATA.flatMap((col) =>
  col.verses.map((v) => ({ ...v, collectionId: col.id, collectionLabel: col.label, collection: col }))
);

// ━━━━━━━━━━━ VERSE CARD ━━━━━━━━━━━

function VerseCard({
  verse,
  accentColor,
  border,
  index,
  isReadingMode,
  fontSize,
}: {
  verse: Verse;
  accentColor: string;
  border: string;
  index: number;
  isReadingMode?: boolean;
  fontSize?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const isSaved = localStorage.getItem(`quran_saved_${verse.id}`);
      if (isSaved === 'true') setSaved(true);
    } catch {}
  }, [verse.id]);

  const toggleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(`quran_saved_${verse.id}`, 'true');
        else localStorage.removeItem(`quran_saved_${verse.id}`);
      } catch {}
      return next;
    });
  }, [verse.id]);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${verse.arabic}\n— ${verse.surah}: ${verse.ayahNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [verse]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: verse.theme ?? verse.surah, text: `${verse.arabic}\n— ${verse.surah}: ${verse.ayahNumber}` });
    }
  }, [verse]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 240, damping: 22 }}
      className={cn(
        'group relative rounded-[2rem] border overflow-hidden',
        'bg-white/[0.03] backdrop-blur-md transition-all duration-300',
        'hover:bg-white/[0.06] hover:border-white/20',
        border
      )}
    >
      {/* Top color line */}
      <div className={cn('h-[2px] w-full opacity-60', accentColor.replace('text-', 'bg-'))} />

      <div className="p-6 md:p-8">
        {/* Surah badge + theme */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          {verse.theme && (
            <span className={cn('text-[11px] font-black uppercase tracking-widest', accentColor)}>
              {verse.theme}
            </span>
          )}
          <div className="flex items-center gap-2 mr-auto">
            <span className={cn('px-3 py-1 rounded-full text-xs font-black border bg-white/5', border, accentColor)}>
              {verse.surah}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black border border-white/10 bg-white/5 text-white/30" translate="no">
              {verse.ayahNumber}
            </span>
          </div>
        </div>

        {/* Verse text */}
        <p
          className={cn("text-white/95 text-right mb-7 text-2xl md:text-3xl transition-all", isReadingMode && "reading-text")}
          style={{ 
            fontFamily: 'var(--font-amiri, serif)', 
            lineHeight: isReadingMode ? '2' : '2.6',
            fontSize: isReadingMode ? `${fontSize && fontSize + 10}px` : undefined
          }}
        >
          {verse.arabic}
        </p>

        {/* Tafseer */}
        <div className={cn('rounded-2xl bg-white/[0.04] border p-5 text-right mb-5 transition-all duration-500', border, isReadingMode && "opacity-20 hover:opacity-100")}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">التدبّر والتفسير</p>
          <p className="text-white/55 text-sm leading-relaxed">{verse.tafseer}</p>
        </div>

        {/* Actions */}
        <div className={cn("flex items-center justify-between pt-3 border-t border-white/5 transition-all duration-500", isReadingMode && "opacity-0 h-0 overflow-hidden")}>
          <div className="flex items-center gap-2">
            {/* Save */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={toggleSave}
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-200',
                saved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-white/30 hover:text-amber-300 hover:bg-amber-500/10'
              )}
              aria-label="حفظ الآية"
            >
              <Bookmark className={cn('w-4 h-4', saved && 'fill-amber-300')} />
            </motion.button>

            {/* Copy */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleCopy}
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-200',
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:bg-white/10'
              )}
              aria-label="نسخ الآية"
            >
              <AnimatePresence mode="wait">
                <motion.span key={copied ? 'c' : 'x'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Share */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleShare}
              className="h-9 w-9 rounded-xl flex items-center justify-center border bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
              aria-label="مشاركة الآية"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          <span className="text-white/15 text-xs font-black" translate="no">
            {verse.surah} — {verse.ayahNumber}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━

export default function QuranPage() {
  const { isReadingMode, fontSize } = useReadingMode();
  const [activeCollection, setActiveCollection] = useState('iman');
  const [searchQuery, setSearchQuery] = useState('');

  const collection = useMemo(() => QURAN_DATA.find((c) => c.id === activeCollection)!, [activeCollection]);

  const displayedVerses = useMemo(() => {
    if (!searchQuery.trim()) {
      return collection.verses.map((v) => ({ ...v, collectionId: collection.id, collectionLabel: collection.label, collection }));
    }
    const q = searchQuery.trim();
    return ALL_VERSES.filter(
      (v) =>
        v.arabic.includes(q) ||
        v.surah.includes(q) ||
        v.tafseer.includes(q) ||
        (v.theme && v.theme.includes(q))
    );
  }, [searchQuery, collection]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className={cn("container relative z-10 px-4 sm:px-6", isReadingMode && "reading-content")}>
        <div className="flex justify-center mb-8 relative z-50">
            <ReadingModeToggle />
        </div>

        {/* ── Hero ── */}
        <div className={cn("text-center pt-20 pb-16 relative transition-all duration-500", isReadingMode && "opacity-0 h-0 p-0 overflow-hidden")}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black mb-6 uppercase tracking-[0.3em]">
              <BookOpen className="w-3.5 h-3.5" />
              كتاب الله العزيز
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white font-headline leading-tight mb-6 tracking-tighter">
              آيات قرآنية
            </h1>
            <p className="text-white/45 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
              "ورتّل القرآن ترتيلاً" — آيات مختارة بعناية للتدبّر واليقين.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-10 mt-12 flex-wrap">
              {[
                { label: 'مجموعة', value: QURAN_DATA.length },
                { label: 'آية مختارة', value: ALL_VERSES.length },
                { label: 'قسم', value: 'نور' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="text-4xl font-black text-white" translate="no">{s.value}</span>
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Search ── */}
        <div className={cn("max-w-2xl mx-auto mb-12 px-2 hide-in-reading-mode")}>
            <div className="relative group">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في الآيات أو التفسير..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-12 text-white placeholder-white/20 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/[0.08] transition-all text-sm"
                    dir="rtl"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>

        {/* ── Collection Tabs ── */}
        <AnimatePresence>
          {!isSearching && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-center gap-4 overflow-x-auto pb-8 mb-12 no-scrollbar justify-start md:justify-center flex-nowrap px-4">
                {QURAN_DATA.map((col, idx) => {
                  const Icon = col.icon;
                  const isActive = col.id === activeCollection;
                  return (
                    <motion.button
                      key={col.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setActiveCollection(col.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'flex items-center gap-3 px-8 py-4 rounded-[2rem] border font-black text-sm whitespace-nowrap transition-all duration-500 flex-shrink-0',
                        isActive
                          ? `bg-gradient-to-br ${col.bg} ${col.border} ${col.color} shadow-2xl scale-105`
                          : 'bg-white/[0.03] border-white/5 text-white/30 hover:bg-white/[0.08] hover:text-white/70'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? col.color : 'text-current opacity-50')} />
                      <span>{col.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global search label */}
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/10" />
            <div className="flex items-center gap-2 text-white/40 text-sm font-bold">
              <Search className="w-4 h-4" />
              نتائج البحث عن: <span className="text-white/70">"{searchQuery}"</span>
            </div>
            <div className="h-px w-12 bg-white/10" />
          </motion.div>
        )}

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {!isSearching ? (
              <motion.div
                key={activeCollection}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn('rounded-[3.5rem] p-1.5 transition-all duration-700 bg-gradient-to-br shadow-[0_0_100px_-20px_rgba(0,0,0,0.4)]', collection.bg)}
              >
                <div className="bg-[#020202]/60 backdrop-blur-3xl rounded-[3.4rem] p-8 md:p-14 relative overflow-hidden">
                  {/* Floating Icon in background */}
                  <div className="absolute -top-10 -left-10 opacity-[0.03] pointer-events-none">
                    {(() => { const Icon = collection.icon; return <Icon className="w-80 h-80 rotate-12" />; })()}
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 px-4">
                      <div className="flex items-center gap-6">
                        <div className={cn('p-5 rounded-[2rem] bg-white/5 border-2 shadow-2xl', collection.border)}>
                          {(() => { const Icon = collection.icon; return <Icon className={cn('w-10 h-10', collection.color)} />; })()}
                        </div>
                        <div className="text-right">
                          <h2 className={cn('text-3xl md:text-5xl font-black mb-1', collection.color)}>{collection.label}</h2>
                          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">{collection.description}</p>
                        </div>
                      </div>
                      <div className="bg-white/5 px-8 py-4 rounded-3xl border border-white/5 text-center">
                         <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">الآيات</p>
                         <span className="text-3xl font-black text-white" translate="no">{collection.verses.length}</span>
                      </div>
                    </div>
                    <div className="grid gap-8">
                      {collection.verses.map((v, i) => (
                        <VerseCard 
                            key={v.id} 
                            verse={v} 
                            accentColor={collection.color} 
                            border={collection.border} 
                            index={i} 
                            isReadingMode={isReadingMode}
                            fontSize={fontSize}
                        />
                      ))}
                    </div>
                    
                    {/* Motivational Footer */}
                    <div className="mt-20 pt-12 border-t border-white/5 text-center">
                       <p className="font-amiri text-2xl text-white/20 italic">
                         "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ"
                       </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {displayedVerses.length > 0 ? (
                  <div className="grid gap-8">
                    {displayedVerses.map((v, i) => (
                      <div key={v.id}>
                        <div className={cn('flex items-center gap-1.5 mb-3 px-4 text-[10px] font-black uppercase tracking-widest', v.collection.color)}>
                          <LayoutGrid className="w-4 h-4" />
                          {v.collectionLabel}
                        </div>
                        <VerseCard verse={v} accentColor={v.collection.color} border={v.collection.border} index={i} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-32 gap-6">
                    <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
                      <Search className="w-16 h-16 text-white/10" />
                    </div>
                    <p className="text-white/30 font-black text-2xl">لا نجد آيات مطابقة لـ "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery('')} className="text-sm text-emerald-400/50 hover:text-emerald-400 transition-all font-bold underline underline-offset-8">
                      العودة لتصفح المجموعات
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
