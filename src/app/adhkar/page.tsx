'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Star, BookOpen, RefreshCw, Check, Heart, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { DewAdhkar } from '@/components/adhkar/dew-adhkar';

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
    <div className="flex items-center gap-4 mt-4 p-3.5 rounded-2xl bg-muted/50 border border-border pointer-events-none">
      {/* Progress ring + count */}
      <div className="relative flex-shrink-0">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
          <circle
            cx="32" cy="32" r="28"
            fill="none" stroke="currentColor" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            className={cn('transition-all duration-300', done ? 'text-emerald-500' : 'text-primary')}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {done ? (
            <Check className="w-6 h-6 text-emerald-500" />
          ) : (
            <div className="relative flex items-center justify-center notranslate" translate="no">
              <span className="text-sm font-black text-foreground tabular-nums">
                {current}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground mb-0.5 font-bold">التكرار</p>
        <div className={cn('text-lg font-black tabular-nums transition-colors notranslate flex items-baseline gap-1', done ? 'text-emerald-500' : 'text-foreground')} translate="no">
          <span className="text-xl">{current}</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-xs text-muted-foreground">{maxCount}</span>
        </div>
        {source && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{source}</p>}
      </div>

      {/* Reset */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onReset();
        }}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-background border border-border hover:bg-accent transition-all pointer-events-auto active:scale-90 text-muted-foreground hover:text-foreground"
        aria-label="إعادة"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}

// ━━━━━━━━━━━ DHIKR CARD ━━━━━━━━━━━

function DhikrCard({
  dhikr,
  accentColor,
  border,
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
    <div
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
        'w-full relative rounded-2xl border p-6 bg-background/80 transition-all cursor-pointer select-none flex flex-col items-stretch text-right outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm',
        !done ? 'border-border hover:border-primary/40' : 'border-emerald-500/30 bg-emerald-500/5 opacity-75'
      )}
    >
      {/* Arabic text */}
      <p
        className={cn("text-foreground text-right font-quran text-2xl md:text-3xl leading-relaxed mb-2 transition-all", isReadingMode && "reading-text")}
        style={{
          fontSize: isReadingMode ? `${fontSize && fontSize + 6}px` : undefined,
          lineHeight: isReadingMode ? '2' : '1.7'
        }}
      >
        {dhikr.arabic}
      </p>

      {/* Meaning */}
      {dhikr.meaning && (
        <p className="mt-3 text-sm text-muted-foreground text-right leading-relaxed border-t border-border/60 pt-3 pointer-events-none">
          {dhikr.meaning}
        </p>
      )}

      {/* Counter UI */}
      <div className={cn("w-full transition-all duration-300", isReadingMode && "opacity-30 hover:opacity-100")}>
        <DhikrCounterDisplay
          current={current}
          maxCount={dhikr.count}
          accentColor={accentColor}
          border={border}
          source={dhikr.source}
          onReset={resetCount}
        />
      </div>
    </div>
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
    <div className="min-h-screen pb-20" dir="rtl">
      <div className={cn("container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-5xl", isReadingMode && "reading-content")}>
        {/* Header */}
        <header className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/60", isReadingMode && "hidden")}>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>حصن المسلم اليومي</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-headline tracking-tight">
              الأذكار <span className="text-primary">والتسبيحات</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              «ألا بذكر الله تطمئن القلوب» — حصّن يومك بأذكار الصباح والمساء المأثورة.
            </p>
          </div>
          <ReadingModeToggle />
        </header>

        {isReadingMode && (
          <div className="flex justify-center">
            <ReadingModeToggle />
          </div>
        )}

        {/* Dew Adhkar Section */}
        <div className={cn(isReadingMode && "hidden")}>
           <DewAdhkar />
        </div>

        {/* Category Tabs */}
        <div className={cn("flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar", isReadingMode && "hidden")}>
          {ADHKAR_DATA.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cards Container */}
        <section className="bg-card/85 backdrop-blur-xl border border-border rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                {(() => { const Icon = category.icon; return <Icon className="w-6 h-6" />; })()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{category.label}</h2>
                <p className="text-xs text-muted-foreground">اضغط على أي ذكر لحساب التكرار تلقائياً</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl border border-border text-xs font-bold self-start sm:self-auto">
              <span className="text-muted-foreground">عدد الأذكار:</span>
              <span className="text-base font-black text-foreground" translate="no">{category.adhkar.length}</span>
            </div>
          </div>

          <div className="grid gap-4">
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

          <div className="pt-6 border-t border-border/60 text-center">
            <p className="font-quran text-lg text-muted-foreground">
              «فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ»
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
