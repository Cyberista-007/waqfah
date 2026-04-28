'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HandHeart, Copy, Share2, Check, Search, X,
  Sunrise, Sunset, Moon, Laptop, Coffee, Car, Heart, Utensils, Droplets, LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';

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
        'group relative rounded-[2rem] border overflow-hidden',
        'bg-white/[0.03] backdrop-blur-md transition-all duration-300',
        'hover:bg-white/[0.06] hover:border-white/20 hover:shadow-xl',
        border
      )}
    >
      {/* Top color bar */}
      <div className={cn('h-[2px] w-full opacity-60', accentColor.replace('text-', 'bg-'))} />

      <div className="p-6 md:p-8">
        {/* Title */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border text-xs font-black', border, accentColor)}>
            <HandHeart className="w-3.5 h-3.5" />
            {dua.title}
          </div>
        </div>

        {/* Arabic Text */}
        <p
          className={cn("text-white/95 text-right leading-[2.6] mb-6 text-xl md:text-2xl transition-all font-quran", isReadingMode && "reading-text")}
          style={{
            fontSize: isReadingMode ? `${fontSize && fontSize + 8}px` : undefined,
            lineHeight: isReadingMode ? '2' : '2.6'
          }}
        >
          {dua.arabic}
        </p>

        {/* Meaning */}
        <div className={cn('rounded-2xl bg-white/[0.04] border p-4 text-right mb-4 transition-all duration-500', border, isReadingMode && "opacity-20 hover:opacity-100")}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">المعنى والفائدة</p>
          <p className="text-white/60 text-sm leading-relaxed">{dua.meaning}</p>
        </div>

        {/* Source + Actions */}
        <div className={cn("flex items-center justify-between pt-3 border-t border-white/5 transition-all duration-500", isReadingMode && "opacity-0 h-0 overflow-hidden")}>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={handleCopy}
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-200',
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:bg-white/10'
              )}
              aria-label="نسخ الدعاء"
            >
              <AnimatePresence mode="wait">
                <motion.span key={copied ? 'c' : 'x'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={handleShare}
              className="h-9 w-9 rounded-xl flex items-center justify-center border bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
              aria-label="مشاركة الدعاء"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="text-right">
            <p className={cn('text-xs font-black', accentColor)}>{dua.source}</p>
          </div>
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
    <div className="min-h-screen pb-24 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className={cn("container relative z-10", isReadingMode && "reading-content")}>
        <div className="flex justify-center mb-10 relative z-50">
          <ReadingModeToggle />
        </div>
        {/* Hero Section */}
        <div className={cn("text-center pt-20 pb-16 relative transition-all duration-500", isReadingMode && "opacity-0 h-0 p-0 overflow-hidden")}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-black mb-6 uppercase tracking-[0.3em]">
              <HandHeart className="w-3.5 h-3.5" />
              أدعية وأذكار مأثورة
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white font-headline leading-none mb-6 tracking-tighter">
              الأدعية المأثورة
            </h1>
            <p className="text-white/45 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
              "ادعوني أستجب لكم" — ادعُ بمأثور الدعاء عن النبي ﷺ والصالحين.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-10 mt-12 flex-wrap">
              {[
                { label: 'تصنيف', value: DUA_DATA.length },
                { label: 'دعاء مأثور', value: ALL_DUA.length },
                { label: 'قسم', value: 'مبارك' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="text-4xl font-black text-white" translate="no">{s.value}</span>
                  <span className="text-white/25 text-[10px] font-bold uppercase tracking-widest mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className={cn("w-full mb-12 px-2 hide-in-reading-mode")}>
          <div className="relative group">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-sky-400 transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأدعية..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-12 text-white placeholder-white/20 text-right focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white/[0.08] transition-all text-sm"
              dir="rtl"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {!isSearching && (
          <div className={cn("flex items-center gap-4 overflow-x-auto pb-8 mb-12 no-scrollbar justify-start md:justify-center flex-nowrap px-4 hide-in-reading-mode")}>
            {DUA_DATA.map((cat, idx) => {
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
                    'flex items-center gap-3 px-8 py-4 rounded-[2rem] border font-black text-sm whitespace-nowrap transition-all duration-500 flex-shrink-0',
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
        )}

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

        {/* Content Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {!isSearching ? (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn('rounded-[3.5rem] p-1.5 transition-all duration-700 bg-gradient-to-br shadow-[0_0_100px_-20px_rgba(0,0,0,0.4)]', category.bg)}
              >
                <div className="bg-[#020202]/60 backdrop-blur-3xl rounded-[3.4rem] p-8 md:p-14 relative overflow-hidden">
                  {/* Floating Icon in background */}
                  <div className="absolute -top-10 -left-10 opacity-[0.03] pointer-events-none">
                    {(() => { const Icon = category.icon; return <Icon className="w-80 h-80 rotate-12" />; })()}
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 px-4">
                      <div className="flex items-center gap-6">
                        <div className={cn('p-5 rounded-[2rem] bg-white/5 border-2 shadow-2xl', category.border)}>
                          {(() => { const Icon = category.icon; return <Icon className={cn('w-10 h-10', category.color)} />; })()}
                        </div>
                        <div className="text-right">
                          <h2 className={cn('text-3xl md:text-5xl font-black mb-1', category.color)}>{category.label}</h2>
                          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">باب الدعاء المستجاب</p>
                        </div>
                      </div>
                      <div className="bg-white/5 px-8 py-4 rounded-3xl border border-white/5 text-center">
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">الأدعية المتاحة</p>
                        <span className="text-3xl font-black text-white" translate="no">{category.dua.length}</span>
                      </div>
                    </div>
                    <div className="grid gap-8">
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

                    {/* Motivational Footer */}
                    <div className="mt-20 pt-12 border-t border-white/5 text-center">
                      <p className="font-quran text-2xl text-white/20 italic">
                        "وإذا سألك عبادي عني فإني قريب أجيب دعوة الداع إذا دعان"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {displayedDua.length > 0 ? (
                  <div className="grid gap-8">
                    {displayedDua.map((d, i) => (
                      <div key={d.id}>
                        <div className={cn('flex items-center gap-1.5 mb-3 px-4 text-[10px] font-black uppercase tracking-widest', d.category.color)}>
                          <LayoutGrid className="w-4 h-4" />
                          {d.categoryLabel}
                        </div>
                        <DuaCard dua={d} accentColor={d.category.color} border={d.category.border} index={i} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-32 gap-6">
                    <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
                      <Search className="w-16 h-16 text-white/10" />
                    </div>
                    <p className="text-white/30 font-black text-2xl">لا توجد نتائج لـ "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery('')} className="text-sm text-sky-400/50 hover:text-sky-400 transition-all font-bold underline underline-offset-8">
                      العودة لتصفح التصنيفات
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
