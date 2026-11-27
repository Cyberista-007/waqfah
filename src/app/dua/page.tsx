'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HandHeart, Copy, Share2, Check, Search, X,
  Sunrise, Sunset, Moon, Laptop, Coffee, Car, Heart, Utensils, Droplets, LayoutGrid, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { ImanCardGenerator } from '@/components/iman-card-generator';

// ━━━━━━━━━━━ TYPES ━━━━━━━━━━━

type Dua = {
  id: number;
  title: string;
  arabic: string;
  transliteration?: string;
  meaning: string;
  source: string;
};

type Category = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  bg: string;
  border: string;
  dua: Dua[];
};

// ━━━━━━━━━━━ DATA ━━━━━━━━━━━

const DUA_DATA: Category[] = [
  {
    id: 'morning',
    label: 'أدعية الصباح',
    icon: Sunrise,
    color: 'text-amber-300',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'from-amber-950/50 to-orange-950/30',
    border: 'border-amber-500/30',
    dua: [
      {
        id: 1,
        title: 'دعاء الاستيقاظ من النوم',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        meaning: 'الحمد لله الذي أعادنا للحياة بعد النوم وإليه المرجع والمصير',
        source: 'رواه البخاري',
      },
      {
        id: 2,
        title: 'دعاء الصباح',
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        meaning: 'اللهم بإذنك وقدرتك أصبحنا وأمسينا ونحيا ونموت وإليك المرجع',
        source: 'رواه الترمذي',
      },
      {
        id: 3,
        title: 'دعاء سيد الاستغفار',
        arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        meaning: 'سيد الاستغفار — يغفر الله لمن قاله صادقاً من قلبه في الصباح أو المساء فمات',
        source: 'رواه البخاري',
      },
    ],
  },
  {
    id: 'evening',
    label: 'أدعية المساء',
    icon: Sunset,
    color: 'text-rose-300',
    gradient: 'from-rose-400 to-pink-500',
    bg: 'from-rose-950/50 to-pink-950/30',
    border: 'border-rose-500/30',
    dua: [
      {
        id: 4,
        title: 'دعاء المساء',
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
        meaning: 'اللهم بإذنك وقدرتك أمسينا وأصبحنا ونحيا ونموت وإليك المرجع',
        source: 'رواه الترمذي',
      },
      {
        id: 5,
        title: 'دعاء العافية',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
        meaning: 'طلب العفو والعافية في الدنيا والآخرة',
        source: 'رواه ابن ماجه',
      },
      {
        id: 6,
        title: 'دعاء حفظ الله',
        arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        meaning: 'من قالها ثلاثاً لم يضره شيء حتى يصبح أو يمسي',
        source: 'رواه أبو داود والترمذي',
      },
    ],
  },
  {
    id: 'sleep',
    label: 'أدعية النوم',
    icon: Moon,
    color: 'text-violet-300',
    gradient: 'from-violet-400 to-purple-500',
    bg: 'from-violet-950/50 to-purple-950/30',
    border: 'border-violet-500/30',
    dua: [
      {
        id: 7,
        title: 'دعاء النوم',
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        meaning: 'باسمك يا الله أنام (كالموت) وأستيقظ (كالحياة)',
        source: 'رواه البخاري',
      },
      {
        id: 8,
        title: 'دعاء القلق والوسواس',
        arabic: 'اللَّهُمَّ رَبَّ السَّمَاوَاتِ وَرَبَّ الأَرْضِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى وَمُنَزِّلَ التَّوْرَاةِ وَالإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ',
        meaning: 'دعاء النبي ﷺ إذا حزبه أمر — اللجوء إلى الله من كل شر',
        source: 'رواه مسلم',
      },
      {
        id: 9,
        title: 'آية الكرسي',
        arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
        meaning: 'من قرأها عند النوم لم يزل عليه من الله حافظ ولا يقربه شيطان حتى يصبح',
        source: 'رواه البخاري',
      },
    ],
  },
  {
    id: 'daily',
    label: 'أدعية الأنشطة اليومية',
    icon: Coffee,
    color: 'text-emerald-300',
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'from-emerald-950/50 to-teal-950/30',
    border: 'border-emerald-500/30',
    dua: [
      {
        id: 10,
        title: 'دعاء الخروج من المنزل',
        arabic: 'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
        meaning: 'يُقال عند الخروج من البيت فيُقال له: كُفيت ووُقيت وهُديت',
        source: 'رواه أبو داود والترمذي',
      },
      {
        id: 11,
        title: 'دعاء ركوب السيارة',
        arabic: 'بِسْمِ اللهِ، وَالْحَمْدُ لِلهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ',
        meaning: 'التسمية والحمد والتسبيح عند ركوب وسائل النقل — الزخرف:١٣',
        source: 'رواه مسلم',
      },
      {
        id: 12,
        title: 'دعاء الطعام',
        arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْراً مِنْهُ',
        meaning: 'يُقال عند تناول الطعام طلباً للبركة وخير أفضل',
        source: 'رواه الترمذي',
      },
      {
        id: 13,
        title: 'دعاء الشرب',
        arabic: 'الْحَمْدُ لِلهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
        meaning: 'شكر الله على نعمة الطعام والشراب ونعمة الإسلام',
        source: 'رواه أبو داود والترمذي',
      },
    ],
  },
  {
    id: 'hardship',
    label: 'أدعية الكرب والضيق',
    icon: Heart,
    color: 'text-sky-300',
    gradient: 'from-sky-400 to-blue-500',
    bg: 'from-sky-950/50 to-blue-950/30',
    border: 'border-sky-500/30',
    dua: [
      {
        id: 14,
        title: 'دعاء الكرب',
        arabic: 'لَا إِلَهَ إِلَّا اللهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
        meaning: 'دعاء النبي ﷺ حين الكرب الشديد — فيه ثلاث تهليلات عظيمة تفريج الغم',
        source: 'رواه البخاري ومسلم',
      },
      {
        id: 15,
        title: 'دعاء الهم والحزن',
        arabic: 'اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَداً مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي',
        meaning: 'من قال هذا الدعاء أذهب الله همه وأبدله مكانه فرجاً',
        source: 'رواه أحمد',
      },
      {
        id: 16,
        title: 'دعاء المظلوم',
        arabic: 'اللَّهُمَّ إِنِّي أَشْكُو إِلَيْكَ ضَعْفَ قُوَّتِي وَقِلَّةَ حِيلَتِي وَهَوَانِي عَلَى النَّاسِ، يَا أَرْحَمَ الرَّاحِمِينَ',
        meaning: 'دعاء النبي ﷺ في أحلك لحظاته — الشكوى إلى الله وحده',
        source: 'رواه الترمذي',
      },
    ],
  },
  {
    id: 'quran',
    label: 'أدعية قرآنية',
    icon: Laptop,
    color: 'text-indigo-300',
    gradient: 'from-indigo-400 to-violet-500',
    bg: 'from-indigo-950/50 to-violet-950/30',
    border: 'border-indigo-500/30',
    dua: [
      {
        id: 17,
        title: 'دعاء الهداية — الفاتحة',
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        meaning: 'طلب الهداية إلى الصراط المستقيم — صراط الأنبياء والصديقين والشهداء والصالحين',
        source: 'الفاتحة: ٦-٧',
      },
      {
        id: 18,
        title: 'دعاء موسى عليه السلام',
        arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي ۝ يَفْقَهُوا قَوْلِي',
        meaning: 'من أعظم الأدعية لشرح الصدر وتيسير الأمور وإجادة البيان',
        source: 'طه: ٢٥-٢٨',
      },
      {
        id: 19,
        title: 'دعاء أهل الجنة',
        arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ',
        meaning: 'سؤال الثبات على الهداية بعد نيلها — من دعاء أولي الألباب',
        source: 'آل عمران: ٨',
      },
      {
        id: 20,
        title: 'دعاء يونس عليه السلام',
        arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
        meaning: 'لم يدعُ بها مكروب إلا فرّج الله عنه — من أعظم الأدعية للفرج',
        source: 'الأنبياء: ٨٧',
      },
    ],
  },
];

const ALL_DUA = DUA_DATA.flatMap((cat) =>
  cat.dua.map((d) => ({ ...d, categoryId: cat.id, categoryLabel: cat.label, category: cat }))
);

// ━━━━━━━━━━━ DUA CARD ━━━━━━━━━━━

function DuaCard({
  dua,
  accentColor,
  border,
  index,
  isReadingMode,
  fontSize,
}: {
  dua: Dua;
  accentColor: string;
  border: string;
  index: number;
  isReadingMode?: boolean;
  fontSize?: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${dua.title}\n\n${dua.arabic}\n\n${dua.meaning}\n— ${dua.source}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [dua]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: dua.title, text: `${dua.arabic}\n\n${dua.meaning}\n— ${dua.source}` });
    }
  }, [dua]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 250, damping: 22 }}
      className={cn(
        'group relative rounded-2xl border border-border overflow-hidden bg-background/80 hover:border-primary/40 transition-all shadow-sm'
      )}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <HandHeart className="w-3.5 h-3.5" />
            <span>{dua.title}</span>
          </div>
        </div>

        {/* Arabic Text */}
        <p
          className={cn("text-foreground text-right leading-[2.2] text-xl md:text-2xl transition-all font-quran", isReadingMode && "reading-text")}
          style={{
            fontSize: isReadingMode ? `${fontSize && fontSize + 8}px` : undefined,
            lineHeight: isReadingMode ? '2' : '2.2'
          }}
        >
          {dua.arabic}
        </p>

        {/* Meaning */}
        <div className={cn('rounded-xl bg-muted/50 border border-border p-4 text-right space-y-1', isReadingMode && "opacity-30 hover:opacity-100")}>
          <p className="text-[11px] font-bold text-muted-foreground">المعنى والفائدة</p>
          <p className="text-foreground/85 text-sm leading-relaxed">{dua.meaning}</p>
        </div>

        {/* Source + Actions */}
        <div className={cn("flex items-center justify-between pt-3 border-t border-border/60", isReadingMode && "opacity-0 h-0 overflow-hidden")}>
          <div className="flex items-center gap-2">
            <ImanCardGenerator 
              title={`دعاء مأثور - ${dua.title}`}
              content={dua.arabic}
              secondaryContent={dua.meaning}
              source={`المأثورات - ${dua.source}`}
              trigger={
                <button
                  className="h-9 w-9 rounded-xl flex items-center justify-center border border-border bg-card text-amber-500 hover:bg-accent transition-all cursor-pointer"
                  title="تحميل كبطاقة دعوية"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              }
            />

            <button
              onClick={handleCopy}
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center border transition-all',
                copied
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
              aria-label="نسخ الدعاء"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleShare}
              className="h-9 w-9 rounded-xl flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              aria-label="مشاركة الدعاء"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs font-bold text-primary">{dua.source}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━

export default function DuaPage() {
  const { isReadingMode, fontSize } = useReadingMode();
  const [activeCategory, setActiveCategory] = useState('morning');
  const [searchQuery, setSearchQuery] = useState('');

  const category = useMemo(() => DUA_DATA.find((c) => c.id === activeCategory)!, [activeCategory]);

  const displayedDua = useMemo(() => {
    if (!searchQuery.trim()) {
      return category.dua.map((d) => ({ ...d, categoryId: category.id, categoryLabel: category.label, category }));
    }
    const q = searchQuery.trim();
    return ALL_DUA.filter(
      (d) =>
        d.arabic.includes(q) ||
        d.title.includes(q) ||
        d.meaning.includes(q) ||
        d.source.includes(q)
    );
  }, [searchQuery, category]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <div className={cn("container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-5xl", isReadingMode && "reading-content")}>
        {/* Header */}
        <header className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/60", isReadingMode && "hidden")}>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <HandHeart className="w-3.5 h-3.5" />
              <span>أدعية وأذكار مأثورة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-headline tracking-tight">
              الأدعية <span className="text-primary">المأثورة</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              «ادعوني أستجب لكم» — ادعُ بمأثور الدعاء عن النبي ﷺ والصالحين ({ALL_DUA.length} دعاء في {DUA_DATA.length} أبواب).
            </p>
          </div>
          <ReadingModeToggle />
        </header>

        {isReadingMode && (
          <div className="flex justify-center">
            <ReadingModeToggle />
          </div>
        )}

        {/* Search */}
        <div className={cn("relative", isReadingMode && "hidden")}>
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأدعية..."
            className="w-full bg-card border border-border rounded-2xl py-3 pr-10 pl-10 text-foreground placeholder:text-muted-foreground text-right focus:outline-none focus:border-primary text-sm"
            dir="rtl"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        {!isSearching && (
          <div className={cn("flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar", isReadingMode && "hidden")}>
            {DUA_DATA.map((cat) => {
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
        )}

        {/* Content Area */}
        {!isSearching ? (
          <section className="bg-card/85 backdrop-blur-xl border border-border rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  {(() => { const Icon = category.icon; return <Icon className="w-6 h-6" />; })()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{category.label}</h2>
                  <p className="text-xs text-muted-foreground">باب الدعاء المستجاب</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl border border-border text-xs font-bold self-start sm:self-auto">
                <span className="text-muted-foreground">الأدعية المتاحة:</span>
                <span className="text-base font-black text-foreground" translate="no">{category.dua.length}</span>
              </div>
            </div>

            <div className="grid gap-4">
              {category.dua.map((d, i) => (
                <DuaCard
                  key={d.id}
                  dua={d}
                  accentColor={category.color}
                  border={category.border}
                  index={i}
                  isReadingMode={isReadingMode}
                  fontSize={fontSize}
                />
              ))}
            </div>
          </section>
        ) : displayedDua.length > 0 ? (
          <div className="grid gap-4">
            {displayedDua.map((d, i) => (
              <div key={d.id} className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{d.categoryLabel}</span>
                </div>
                <DuaCard dua={d} accentColor={d.category.color} border={d.category.border} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-3">
            <Search className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-lg font-bold text-foreground">لا توجد نتائج لـ &quot;{searchQuery}&quot;</p>
            <button onClick={() => setSearchQuery('')} className="text-sm text-primary font-bold hover:underline">
              العودة لتصفح التصنيفات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
