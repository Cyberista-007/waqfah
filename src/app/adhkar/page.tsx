'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Star, BookOpen, RefreshCw, Check, Heart, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';

// ━━━━━━━━━━━ DATA ━━━━━━━━━━━

type Dhikr = {
  id: number;
  arabic: string;
  transliteration?: string;
  meaning?: string;
  count: number;
  source?: string;
};

type Category = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  adhkar: Dhikr[];
};

const ADHKAR_DATA: Category[] = [
  {
    id: 'morning',
    label: 'أذكار الصباح',
    icon: Sun,
    color: 'text-amber-400',
    bg: 'from-amber-950/40 to-orange-950/20',
    border: 'border-amber-500/30',
    adhkar: [
      {
        id: 1,
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        meaning: 'أصبحنا على ملك الله ونعمته',
        count: 1,
        source: 'رواه مسلم',
      },
      {
        id: 2,
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        count: 1,
        source: 'رواه الترمذي',
      },
      {
        id: 3,
        arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        meaning: 'تنزيه الله وتحميده',
        count: 100,
        source: 'رواه مسلم',
      },
      {
        id: 4,
        arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        meaning: 'سيد الاستغفار',
        count: 1,
        source: 'رواه البخاري',
      },
      {
        id: 5,
        arabic: 'أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
        count: 3,
        source: 'رواه أبو داود',
      },
      {
        id: 6,
        arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        count: 3,
        source: 'رواه أبو داود والترمذي',
      },
    ],
  },
  {
    id: 'evening',
    label: 'أذكار المساء',
    icon: Moon,
    color: 'text-indigo-400',
    bg: 'from-indigo-950/40 to-violet-950/20',
    border: 'border-indigo-500/30',
    adhkar: [
      {
        id: 7,
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        count: 1,
        source: 'رواه مسلم',
      },
      {
        id: 8,
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
        count: 1,
        source: 'رواه الترمذي',
      },
      {
        id: 9,
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
        count: 3,
        source: 'رواه أبو داود',
      },
      {
        id: 10,
        arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أنت',
        count: 3,
        source: 'رواه أبو داود',
      },
    ],
  },
  {
    id: 'sleep',
    label: 'أذكار النوم',
    icon: Star,
    color: 'text-violet-400',
    bg: 'from-violet-950/40 to-purple-950/20',
    border: 'border-violet-500/30',
    adhkar: [
      {
        id: 11,
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        count: 1,
        source: 'رواه البخاري',
      },
      {
        id: 12,
        arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        count: 3,
        source: 'رواه أبو داود',
      },
      {
        id: 13,
        arabic: 'سُبْحَانَ اللَّهِ',
        count: 33,
        source: 'رواه البخاري ومسلم',
      },
      {
        id: 14,
        arabic: 'الْحَمْدُ لِلَّهِ',
        count: 33,
        source: 'رواه البخاري ومسلم',
      },
      {
        id: 15,
        arabic: 'اللَّهُ أَكْبَرُ',
        count: 34,
        source: 'رواه البخاري ومسلم',
      },
      {
        id: 16,
        arabic: 'آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهما وَهُوَ الْعَلِيُّ الْعَظِيمُ',
        meaning: 'آية الكرسي — البقرة: ٢٥٥',
        count: 1,
        source: 'رواه البخاري',
      },
    ],
  },
  {
    id: 'general',
    label: 'أذكار عامة',
    icon: BookOpen,
    color: 'text-emerald-400',
    bg: 'from-emerald-950/40 to-teal-950/20',
    border: 'border-emerald-500/30',
    adhkar: [
      {
        id: 17,
        arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        count: 100,
        source: 'رواه البخاري',
      },
      {
        id: 18,
        arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
        meaning: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان',
        count: 100,
        source: 'رواه البخاري ومسلم',
      },
      {
        id: 19,
        arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        meaning: 'الاستغفار التام',
        count: 100,
        source: 'رواه الترمذي',
      },
      {
        id: 20,
        arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
        count: 10,
        source: 'رواه الطبراني',
      },
    ],
  },
];

// ━━━━━━━━━━━ COUNTER DISPLAY ━━━━━━━━━━━

function DhikrCounterDisplay({
  current,
  maxCount,
  accentColor,
  border,
  source,
  onReset
}: {
  current: number;
  maxCount: number;
  accentColor: string;
  border: string;
  source?: string;
  onReset: () => void;
}) {
  const done = current >= maxCount;
  const progress = Math.min((current / maxCount) * 100, 100);

  return (
    <div className={cn('flex items-center gap-3 mt-4 p-3 rounded-2xl bg-white/5 border pointer-events-none', border)}>
      {/* Progress ring + count */}
      <div className="relative flex-shrink-0">
        <svg width="68" height="68" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
          <circle
            cx="32" cy="32" r="28"
            fill="none" stroke="currentColor" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            className={cn('transition-all duration-300', accentColor)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className={cn('w-6 h-6', accentColor)} />
              </motion.div>
            ) : (
              <div className="relative flex items-center justify-center notranslate" translate="no">
                <Fingerprint className={cn('absolute inset-0 w-8 h-8 opacity-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', accentColor)} />
                <motion.span
                  key={current}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-sm font-black text-white tabular-nums relative z-10"
                >
                  {current}
                </motion.span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/40 mb-0.5 uppercase tracking-widest font-black">التكرار</p>
        <div className={cn('text-xl font-black tabular-nums transition-colors notranslate flex items-baseline gap-1', done ? accentColor : 'text-white')} translate="no">
          <span className="text-2xl">{current}</span>
          <span className="text-white/20 opacity-50">/</span>
          <span className="text-sm opacity-50">{maxCount}</span>
        </div>
        {source && <p className="text-[10px] text-white/30 mt-0.5 truncate italic">{source}</p>}
      </div>

      {/* Reset */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onReset();
        }}
        className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all pointer-events-auto group/reset active:scale-90"
        aria-label="إعادة"
      >
        <RefreshCw className="w-5 h-5 text-white/60 group-hover/reset:text-white transition-colors" />
      </button>
    </div>
  );
}

// ━━━━━━━━━━━ DHIKR CARD ━━━━━━━━━━━

function DhikrCard({
  dhikr,
  accentColor,
  border,
  index,
  isReadingMode,
  fontSize
}: {
  dhikr: Dhikr;
  accentColor: string;
  border: string;
  index: number;
  isReadingMode?: boolean;
  fontSize?: number;
}) {
  const [current, setCurrent] = useState(0);
  const done = current >= dhikr.count;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`dhikr_count_${dhikr.id}`);
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val >= 0) {
          setCurrent(Math.min(val, dhikr.count));
        }
      }
    } catch { }
  }, [dhikr.id, dhikr.count]);

  const handleTap = useCallback(() => {
    if (current < dhikr.count) {
      setCurrent(prev => {
        const next = prev + 1;
        try { localStorage.setItem(`dhikr_count_${dhikr.id}`, next.toString()); } catch { }
        return next;
      });
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(12);
      }
    }
  }, [current, dhikr.count, dhikr.id]);

  const resetCount = useCallback(() => {
    setCurrent(0);
    try { localStorage.removeItem(`dhikr_count_${dhikr.id}`); } catch { }
  }, [dhikr.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={!done ? { scale: 0.985 } : {}}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      onClick={handleTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTap();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'w-full relative rounded-[2.5rem] border p-7 bg-white/[0.04] backdrop-blur-md transition-all duration-300 cursor-pointer select-none overflow-hidden transform-gpu flex flex-col items-stretch text-right outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        border,
        !done ? 'hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12]' : 'grayscale-[0.5] opacity-60'
      )}
    >
      {/* Background Icon Hint */}
      <Fingerprint className={cn('absolute -bottom-8 -right-8 w-40 h-40 opacity-[0.03] pointer-events-none transition-opacity', !done && 'group-hover:opacity-[0.08]')} />

      {/* Arabic text */}
      <p
        className={cn("text-white text-right font-amiri text-2xl md:text-3xl leading-relaxed mb-3 transition-all", isReadingMode && "reading-text")}
        style={{
          fontFamily: 'var(--font-amiri, serif)',
          fontSize: isReadingMode ? `${fontSize && fontSize + 6}px` : undefined,
          lineHeight: isReadingMode ? '2' : '1.6'
        }}
      >
        {dhikr.arabic}
      </p>

      {/* Meaning */}
      {dhikr.meaning && (
        <p className="mt-5 text-base text-white/50 text-right leading-relaxed border-t border-white/5 pt-5 italic pointer-events-none">
          {dhikr.meaning}
        </p>
      )}

      {/* Counter UI */}
      <div className={cn("w-full transition-all duration-500", isReadingMode && "opacity-20 hover:opacity-100")}>
        <DhikrCounterDisplay
          current={current}
          maxCount={dhikr.count}
          accentColor={accentColor}
          border={border}
          source={dhikr.source}
          onReset={resetCount}
        />
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━

export default function AdhkarPage() {
  const { isReadingMode, fontSize } = useReadingMode();
  const [activeCategory, setActiveCategory] = useState('morning');

  const category = useMemo(
    () => ADHKAR_DATA.find(c => c.id === activeCategory)!,
    [activeCategory]
  );

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className={cn("container relative z-10", isReadingMode && "reading-content")}>
        <div className="flex justify-center mb-10 relative z-50">
          <ReadingModeToggle />
        </div>
        {/* Hero Section */}
        <div className={cn("text-center pt-20 pb-16 relative transition-all duration-500", isReadingMode && "opacity-0 h-0 p-0 overflow-hidden")}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black mb-6 uppercase tracking-[0.3em]">
              <Heart className="w-3.5 h-3.5 fill-primary" />
              حصن المسلم اليومي
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white font-headline leading-tight mb-6 tracking-tighter">
              الأذكار والتسبيحات
            </h1>
            <p className="text-white/40 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-tajawal">
              "ألا بذكر الله تطمئن القلوب" — حَصِّن يومك بأذكار الصباح والمساء المأثورة.
            </p>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className={cn("flex items-center gap-3 overflow-x-auto pb-8 mb-12 no-scrollbar justify-center flex-nowrap px-4 hide-in-reading-mode")}>
          {ADHKAR_DATA.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = cat.id === activeCategory;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveCategory(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex items-center gap-3 px-8 py-4 rounded-[2rem] border font-black text-sm whitespace-nowrap transition-all duration-500',
                  isActive
                    ? `bg-gradient-to-br ${cat.bg} ${cat.border} ${cat.color} shadow-2xl scale-105`
                    : 'bg-white/[0.03] border-white/5 text-white/30 hover:bg-white/[0.08] hover:text-white/70'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? cat.color : 'text-current opacity-50')} />
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Cards Container */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn('rounded-[3.5rem] p-1.5 transition-all duration-700 bg-gradient-to-br shadow-[0_0_100px_-20px_rgba(0,0,0,0.4)]', category.bg)}
            >
              <div className="bg-[#020202]/60 backdrop-blur-3xl rounded-[3.4rem] p-8 md:p-14 relative overflow-hidden">
                {/* Floating Category Icon in background */}
                <div className="absolute -top-10 -left-10 opacity-[0.03] pointer-events-none">
                  {(() => { const Icon = category.icon; return <Icon className="w-80 h-80 rotate-12" />; })()}
                </div>

                <div className="relative z-10">
                  {/* Category Header */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-4">
                    <div className="flex items-center gap-6">
                      <div className={cn('p-5 rounded-[2rem] bg-white/5 border-2 shadow-2xl', category.border)}>
                        {(() => { const Icon = category.icon; return <Icon className={cn('w-10 h-10', category.color)} />; })()}
                      </div>
                      <div className="text-right">
                        <h2 className={cn('text-3xl md:text-5xl font-black mb-1', category.color)}>
                          {category.label}
                        </h2>
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">حصن المسلم اليومي</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 bg-white/5 px-8 py-4 rounded-3xl border border-white/5">
                      <div className="text-center">
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">المحتوى</p>
                        <p className="text-2xl font-black text-white" translate="no">{category.adhkar.length}</p>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="text-center">
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">تنبيه</p>
                        <p className={cn("text-xs font-bold", category.color)}>انقر للعد</p>
                      </div>
                    </div>
                  </div>

                  {/* Adhkar List */}
                  <div className="grid gap-8">
                    {category.adhkar.map((dhikr, i) => (
                      <DhikrCard
                        key={dhikr.id}
                        dhikr={dhikr}
                        accentColor={category.color}
                        border={category.border}
                        index={i}
                        isReadingMode={isReadingMode}
                        fontSize={fontSize}
                      />
                    ))}
                  </div>

                  {/* Motivational Footer */}
                  <div className="mt-20 pt-12 border-t border-white/5 text-center">
                    <p className="font-amiri text-2xl text-white/20 italic">
                      "فاذكروني أذكركم واشكروا لي ولا تكفرون"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
