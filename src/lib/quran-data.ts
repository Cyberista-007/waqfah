
import { Sparkles, Heart, Star, Bookmark } from 'lucide-react';

export type Verse = {
  id: number;
  surah: string;
  surahNumber: number;
  ayahNumber: string;
  arabic: string;
  tafseer: string;
  theme?: string;
  audio?: string;
};

export type Collection = {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  verses: Verse[];
};

export const QURAN_DATA: Collection[] = [
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
        tafseer: 'آية الكرسي — سيدة آيات القرآن الكريم. تُجسّد كمال صفات الله وعظمته المطلقة.',
        theme: 'آية الكرسي',
      },
      {
        id: 2,
        surah: 'البقرة',
        surahNumber: 2,
        ayahNumber: '285-286',
        arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
        tafseer: 'خاتمة سورة البقرة — من قرأهما في ليلة كفتاه.',
        theme: 'آمن الرسول',
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
        tafseer: 'باب الرجاء الواسع المفتوح — مهما عظمت ذنوبك فرحمة الله أوسع.',
        theme: 'الرجاء والمغفرة',
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
        tafseer: 'لا شيء يُعيد للقلب سكينته حقاً وسلامه إلا ذكر الله.',
        theme: 'اطمئنان القلب',
      },
    ],
  },
];
