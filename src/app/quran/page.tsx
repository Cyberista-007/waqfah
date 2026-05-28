
'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Copy, Share2, Check, Search, X,
  Layers, Heart, Star, Bookmark, LayoutGrid, Sparkles,
  Play, Pause, Volume2, Settings2, ArrowLeft, ArrowRight,
  Maximize2, Minimize2, Languages, History, Info,
  User, ChevronDown, Music, Quote, Download, Image as ImageIcon, ImagePlus,
  Palette, Edit3, Smartphone, Trophy, Target, CheckCircle2, Clock,
  Flame, BookmarkCheck, FileText, AlignRight, ChevronLeft, ChevronRight,
  Loader2, Mic, Eye, EyeOff, ChevronsDown, Map, Minus, Plus, Menu,
  Radio, VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { useSync } from '@/hooks/useSync';
import { QURAN_DATA, Verse as VerseType } from '@/lib/quran-data';
import { LuminousMushaf } from '@/components/quran/luminous-mushaf';
import confetti from 'canvas-confetti';

// ━━━━━━━━━━━ TYPES & CONSTANTS ━━━━━━━━━━━

type SurahInfo = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', icon: '🎙️' },
  { id: 'ar.husary', name: 'محمود خليل الحصري', icon: '📖' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', icon: '✨' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', icon: '🌙' },
];

const TAFSEERS = [
  { id: 'ar.muyassar', name: 'التفسير الميسر' },
  { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
  { id: 'ar.qurtubi', name: 'تفسير القرطبي' },
  { id: 'ar.waseet', name: 'التفسير الوسيط (طنطاوي)' },
  { id: 'ar.baghawi', name: 'تفسير البغوي' },
  { id: 'ar.miqbas', name: 'تفسير ابن عباس (تنوير المقباس)' },
];

const SCRIPTS = [
  { id: 'uthmani', name: 'مصحف المدينة (رسم عثماني)', edition: 'quran-uthmani', font: 'font-quran' },
  { id: 'simple', name: 'رسم إملائي (بسيط)', edition: 'quran-simple', font: 'font-amiri' },
];

const TOPICS = [
  { id: 'all', label: 'الكل' },
  { id: 'iman', label: 'الإيمان' },
  { id: 'sabr', label: 'الصبر والتوكل' },
  { id: 'rahma', label: 'الرحمة والمغفرة' },
  { id: 'memorized', label: 'المحفوظات' },
  { id: 'bookmarks', label: 'الإشارات المرجعية' },
];

const MEMO_PLANS = [
  { id: '1year', label: 'ختمة في سنة', months: 12, pagesPerDay: 1.7 },
  { id: '2years', label: 'ختمة في سنتين', months: 24, pagesPerDay: 0.8 },
  { id: '6months', label: 'ختمة في 6 أشهر', months: 6, pagesPerDay: 3.3 },
  { id: 'custom', label: 'خطة مخصصة', months: 0, pagesPerDay: 0 },
];

const TRANSLATIONS = [
  { id: 'en.sahih', name: 'English (Sahih Intl)', lang: 'en' },
  { id: 'fr.hamidullah', name: 'Français (Hamidullah)', lang: 'fr' },
  { id: 'ur.maududi', name: 'اردو (Maududi)', lang: 'ur' },
  { id: 'tr.ates', name: 'Türkçe (Süleyman Ateş)', lang: 'tr' },
];

const SEMANTIC_TOPICS = [
  {
    keywords: ['والدين', 'والدان', 'بر الوالدين', 'أبي', 'أمي', 'أبوي', 'طاعة الوالدين', 'إحسان الوالدين'],
    title: 'بر الوالدين والإحسان إليهما',
    ayahs: [
      { surah: 17, ayah: 23, text: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا' },
      { surah: 31, ayah: 14, text: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَالُهُ فِي عَامَيْنِ أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ إِلَيَّ الْمَصِيرُ' },
      { surah: 46, ayah: 15, text: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ إِحْسَانًا ۖ حَمَلَتْهُ أُمُّهُ كُرْهًا وَوَضَعَتْهُ كُرْهًا ۖ وَحَمْلُهُ وَفِصَالُهُ ثَلَاثُونَ شَهْرًا' }
    ]
  },
  {
    keywords: ['صلاة', 'صلوات', 'إقامة الصلاة', 'الصلوات', 'الفجر', 'العصر', 'أقم الصلاة'],
    title: 'أهمية الصلاة وإقامتها في وقتها',
    ayahs: [
      { surah: 20, ayah: 14, text: 'إِنَّنِي أَنَا اللَّلهِ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي وَأَقِمِ الصَّلَاةَ لِذِكْرِي' },
      { surah: 29, ayah: 45, text: 'اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ' },
      { surah: 2, ayah: 238, text: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ' }
    ]
  },
  {
    keywords: ['صبر', 'الصبر', 'صابري', 'اصبر', 'صابروا', 'تصبير'],
    title: 'فضيلة الصبر وبشرى الصابرين',
    ayahs: [
      { surah: 2, ayah: 153, text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ' },
      { surah: 2, ayah: 155, text: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ' },
      { surah: 39, ayah: 10, text: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ' }
    ]
  },
  {
    keywords: ['توبة', 'استغفار', 'مغفرة', 'تاب', 'يتوب', 'استغفر', 'يغفر', 'ذنوب', 'غفران'],
    title: 'سعة رحمة الله وقبول التوبة والاستغفار',
    ayahs: [
      { surah: 39, ayah: 53, text: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ' },
      { surah: 66, ayah: 8, text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا عَسَىٰ رَبُّكُمْ أَن يُكَفِّرَ عَنكُمْ سَيِّئَاتِكُمْ' },
      { surah: 71, ayah: 10, text: 'فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا ۝ يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا ۝ وَيُمْدِدْكُم بِأَمْوَالٍ وَبَنِينَ وَيَجْعَل لَّكُمْ جَنَّاتٍ وَيَجْعَل لَّكُمْ أَنْهَارًا' }
    ]
  },
  {
    keywords: ['ربا', 'الربا', 'أكل الربا', 'ربا الفضل', 'ربا النسيئة'],
    title: 'تحريم الربا والتحذير منه',
    ayahs: [
      { surah: 2, ayah: 275, text: 'الَّذِينَ يَأْكُلُونَ الرِّبَا لَا يَقُومُونَ إِلَّا كَمَا يَقُومُ الَّذِي يَتَخَبَّطُهُ الشَّيْطَانُ مِنَ الْمَسِّ ۚ ذَٰلِكَ بِأَنَّهُمْ قَالُوا إِنَّمَا الْبَيْعُ مِثْلُ الرِّبَا ۗ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
      { surah: 2, ayah: 278, text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَذَرُوا مَا بَقِيَ مِنَ الرِّبَا إِن كُنتُم مُّؤْمِنِينَ' }
    ]
  },
  {
    keywords: ['عدل', 'قسط', 'العدل', 'القسط', 'ميزان', 'العدالة', 'اعدلوا'],
    title: 'إقامة العدل والقسط بين الناس',
    ayahs: [
      { surah: 16, ayah: 90, text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ وَيَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ وَالْبَغْيِ ۚ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ' },
      { surah: 5, ayah: 8, text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ لِلَّهِ شُهَدَاءَ بِالْقُسْطِ ۖ وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ' }
    ]
  },
  {
    keywords: ['حجاب', 'عفة', 'يغضوا', 'يغضضن', 'فروجهم', 'فروجهن', 'ستر', 'جلايب', 'زينتهن'],
    title: 'الحجاب الشرعي والحث على العفة وغض البصر',
    ayahs: [
      { surah: 24, ayah: 30, text: 'قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ ۗ إِنَّ اللَّهَ خَبِيرٌ بِمَا يَصْنَعُونَ' },
      { surah: 24, ayah: 31, text: 'وَقُل لِّلْمُؤْمِنَاتِ يَغْضُضْن مِنْ أَبْصَارِهِنَّ وَيَحْفَظْن فُرُوجَهُنَّ وَلَا يُبْدِينَ زِينَتَهُنَّ إِلَّا مَا ظَهَرَ مِنْهَا ۖ وَلْيَضْرِبْنَ بِخُمُرِهِنَّ عَلَىٰ جُيُوبِهِنَّ' },
      { surah: 33, ayah: 59, text: 'يَا أَيُّهَا النَّبِيُّ قُل لِّأَزْوَاجِكَ وَبَنَاتِكَ وَنِسَاءِ الْمُؤْمِنِينَ يُدْنِينَ عَلَيْهِنَّ مِن جَلَابِيبِهِنَّ ۚ ذَٰلِكَ أَدْنَىٰ أَن يُعْرَفْنَ فَلَا يُؤْذَيْنَ' }
    ]
  },
  {
    keywords: ['علم', 'العلم', 'علماء', 'طلب العلم', 'تعلم', 'يعلمون', 'علّمه'],
    title: 'فضل العلم والعلماء والحث على المعرفة',
    ayahs: [
      { surah: 20, ayah: 114, text: 'فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ ۗ وَلَا تَعْجَلْ بِالْقُرْآنِ مِن قَبْلِ أَن يُقْضَىٰ إِلَيْكَ وَحْيُهُ ۖ وَقُل رَّبِّ زِدْنِي عِلْمًا' },
      { surah: 39, ayah: 9, text: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ۗ إِنَّمَا يَتَذَكَّرُ أُولُو الْأَلْبَابِ' }
    ]
  }
];


const AMBIENT_SOUNDS = [
  { id: 'rain', name: '🌧️ مطر هادئ', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  { id: 'birds', name: '🌲 عصافير الغابة', url: 'https://actions.google.com/sounds/v1/animals/forest_birds.ogg' },
  { id: 'river', name: '💧 خرير الماء', url: 'https://actions.google.com/sounds/v1/water/river_flowing.ogg' },
  { id: 'night', name: '🌙 هدوء الليل', url: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' },
];

const RADIO_STATIONS = [
  {
    id: 'cairo',
    name: 'إذاعة القرآن الكريم من القاهرة',
    subtitle: 'بث مباشر من جمهورية مصر العربية',
    url: 'https://stream.radiojar.com/8s5u5zpv870uv',
    icon: '🇪🇬',
    color: 'from-emerald-500/20 to-emerald-950/40',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400'
  },
  {
    id: 'saudi',
    name: 'إذاعة القرآن الكريم من المملكة العربية السعودية',
    subtitle: 'بث مباشر من الرياض',
    url: 'https://stream.radiojar.com/4wqbi268v30uv',
    icon: '🇸🇦',
    color: 'from-green-500/20 to-green-950/40',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400'
  },
  {
    id: 'minshawi',
    name: 'إذاعة القارئ محمد صديق المنشاوي',
    subtitle: 'ترتيل خاشع ومجود برواية حفص عن عاصم',
    url: 'https://live.mp3quran.net:9982/;stream.mp3',
    icon: '🕌',
    color: 'from-amber-500/20 to-amber-950/40',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400'
  },
  {
    id: 'abdulbasit',
    name: 'إذاعة القارئ عبد الباسط عبد الصمد',
    subtitle: 'تلاوات نادرة ومجودة بنبرة فريدة',
    url: 'https://live.mp3quran.net:9974/;stream.mp3',
    icon: '🌟',
    color: 'from-cyan-500/20 to-cyan-950/40',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400'
  },
  {
    id: 'husary',
    name: 'إذاعة القارئ محمود خليل الحصري',
    subtitle: 'المعلم والمصحف المرتل بدقة التجويد',
    url: 'https://live.mp3quran.net:9988/;stream.mp3',
    icon: '📖',
    color: 'from-blue-500/20 to-blue-950/40',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400'
  },
  {
    id: 'alafasy',
    name: 'إذاعة القارئ مشاري بن راشد العفاسي',
    subtitle: 'تلاوات عطرة بأصوات وألحان متميزة',
    url: 'https://live.mp3quran.net:9724/;stream.mp3',
    icon: '🎙️',
    color: 'from-rose-500/20 to-rose-950/40',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400'
  },
  {
    id: 'tafseer',
    name: 'إذاعة تفسير القرآن الكريم',
    subtitle: 'شروحات وتفاسير مبسطة لآيات الذكر الحكيم',
    url: 'https://live.mp3quran.net:9718/;stream.mp3',
    icon: '💡',
    color: 'from-violet-500/20 to-violet-950/40',
    borderColor: 'border-violet-500/30',
    textColor: 'text-violet-400'
  },
  {
    id: 'ruqyah',
    name: 'إذاعة الرقية الشرعية',
    subtitle: 'آيات السكينة والتحصين والشفاء من القرآن',
    url: 'https://live.mp3quran.net:9938/;stream.mp3',
    icon: '🛡️',
    color: 'from-purple-500/20 to-purple-950/40',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400'
  },
  {
    id: 'takbeerat',
    name: 'إذاعة تكبيرات العيد والذكر',
    subtitle: 'أجواء روحانية مهيبة وتكبيرات مستمرة',
    url: 'https://live.mp3quran.net:9702/;stream.mp3',
    icon: '🌙',
    color: 'from-orange-500/20 to-orange-950/40',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400'
  }
];

const MEMORIZATION_STATUS = {
  'not-started': { label: 'لم تبدأ', color: 'text-white/20', icon: Clock, bg: 'bg-white/5' },
  'memorizing': { label: 'جاري الحفظ', color: 'text-amber-400', icon: Target, bg: 'bg-amber-500/10' },
  'completed': { label: 'تم الحفظ', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10' },
  'reviewed': { label: 'تمت المراجعة', color: 'text-blue-400', icon: Trophy, bg: 'bg-blue-500/10' },
};

const CARD_THEMES = [
  { id: 'emerald', bg: 'bg-gradient-to-br from-[#022c22] via-[#064e3b] to-black', text: 'text-emerald-100', accent: 'bg-emerald-400', textGradient: 'from-emerald-200 to-emerald-500' },
  { id: 'indigo', bg: 'bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-black', text: 'text-indigo-100', accent: 'bg-indigo-400', textGradient: 'from-indigo-200 to-blue-500' },
  { id: 'amber', bg: 'bg-gradient-to-br from-[#451a03] via-[#78350f] to-black', text: 'text-amber-100', accent: 'bg-amber-400', textGradient: 'from-yellow-200 to-amber-600' },
  { id: 'rose', bg: 'bg-gradient-to-br from-[#4c0519] via-[#881337] to-black', text: 'text-rose-100', accent: 'bg-rose-400', textGradient: 'from-rose-200 to-pink-600' },
  { id: 'purple', bg: 'bg-gradient-to-br from-[#3b0764] via-[#581c87] to-black', text: 'text-purple-100', accent: 'bg-purple-400', textGradient: 'from-purple-200 to-fuchsia-600' },
  { id: 'dark', bg: 'bg-[#050505]', text: 'text-white', accent: 'bg-white/20', textGradient: 'from-white to-gray-500' },
  { id: 'gold', bg: 'bg-gradient-to-br from-[#422006] via-[#713f12] to-[#0a0a0a]', text: 'text-yellow-100', accent: 'bg-yellow-500', textGradient: 'from-yellow-100 via-yellow-400 to-yellow-700' },
  { id: 'royal', bg: 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#1e3a8a] via-[#1e40af] to-black', text: 'text-blue-100', accent: 'bg-blue-400', textGradient: 'from-blue-200 to-cyan-500' },
  { id: 'sunset', bg: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#7f1d1d] via-[#991b1b] to-black', text: 'text-red-100', accent: 'bg-red-400', textGradient: 'from-orange-200 to-red-500' },
];

const CARD_PATTERNS = [
  { id: 'none', label: 'بدون', css: '', url: '' },
  { id: 'arabesque', label: 'أرابيسك', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGNpcmNsZSBjeD0nMjAnIGN5PTIwJyByPScxNScgZmlsbD0nbm9uZScgc3Ryb2tlPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxjaXJjbGUgY3g9JzAnIGN5PScwJyByPScxNScgZmlsbD0nbm9uZScgc3Ryb2tlPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxjaXJjbGUgY3g9JzQwJyBjeT0nMCcgcj0nMTUnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48Y2lyY2xlIGN4PScwJyBjeT0nNDAnIHI9JzE1JyBmaWxsPSdub25lJyBzdHJva2U9J3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknIHN0cm9rZS13aWR0aD0nMS41Jy8+PGNpcmNsZSBjeD0nNDAnIGN5PSc0MCcgcj0nMTUnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48L3N2Zz4=" },
  { id: 'geometry', label: 'هندسي', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3QgeD0nMTAnIHk9JzEwJyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjIpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxyZWN0IHg9JzEwJyB5PScxMCcgd2lkdGg9JzIwJyBoZWlnaHQ9JzIwJyBmaWxsPSdub25lJyBzdHJva2U9J3JnYmEoMjU1LDI1NSwyNTUsMC4yKScgc3Ryb2tlLXdpZHRoPScxLjUnIHRyYW5zZm9ybT0ncm90YXRlKDQ1IDIwIDIwKScvPjwvc3ZnPg==" },
  { id: 'diamonds', label: 'معين', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTEwIDBMMjAgMTBMMTAgMjBMMCAxMFonIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48L3N2Zz4=" },
  { id: 'hexagons', label: 'سداسي', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjgnIGhlaWdodD0nNDknIHZpZXdCb3g9JzAgMCAyOCA0OScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSdub25lJyBzdHJva2U9J3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknIHN0cm9rZS13aWR0aD0nMS41Jz48cGF0aCBkPSdNMTMuOTkgOS4yNWwxMyA3LjV2MTVsLTEzIDcuNUwxIDMxLjc1di0xNWwxMi45OS03LjV6TTAgMTEuOGwxMi45OC03LjVWMS41aDE1djIuOGwxMi45OSA3LjVMMjcuOTkgMTkuM3YxMC40bDEyLjk5IDcuNXYxMC40bC0xMi45OSA3LjVWNThoLTE1di0yLjhsLTEyLjk4LTcuNUwwIDM3Ljd2LTEwLjRsLTEyLjk4LTcuNVY5LjRsMTIuOTgtNy41eicvPjwvZz48L3N2Zz4=" },
  { id: 'stars', label: 'نجوم', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTIwIDE1IEwyMSAxOSBMMjUgMjAgTDIxIDIxIEwyMCAyNSBMMTkgMjEgTDE1IDIwIEwxOSAxOSBaIE01IDUgTDUuNSA2LjUgTDcgNyBMNS41IDcuNSBMNSA5IEw0LjUgNy41IEwzIDcgTDQuNSA2LjUgWicgZmlsbD0ncmdiYSgyNTUsMjU1LDI1NSwwLjMpJy8+PC9zdmc+" },
];

const CARD_FRAMES = [
  { id: 'none', label: 'بدون', border: '' },
  { id: 'minimal', label: 'بسيط', border: 'border-2 border-white/40 m-4 rounded-[2rem]' },
  { id: 'elegant', label: 'أنيق', border: 'border-[1px] border-white/60 m-8 rounded-[1rem]' },
  { id: 'classic', label: 'كلاسيك', border: 'border-8 border-double border-white/40 m-6 rounded-[1.5rem]' },
  { id: 'mihrab', label: 'محراب', border: 'border-4 border-b-0 border-white/50 m-6 rounded-t-full' },
  { id: 'double', label: 'مضاعف', border: 'border-4 border-white/30 m-4 rounded-[2.5rem] before:content-[""] before:absolute before:inset-2 before:border-2 before:border-white/20 before:rounded-[2rem]' },
];

// ━━━━━━━━━━━ JUZ DATA ━━━━━━━━━━━
const JUZ_DATA = [
  { juz: 1, surah: 'الفاتحة', start: 'الحمد..', page: 1 },
  { juz: 2, surah: 'البقرة', start: 'سيقول..', page: 22 },
  { juz: 3, surah: 'البقرة', start: 'تلك الرسل..', page: 42 },
  { juz: 4, surah: 'آل عمران', start: 'كل الطعام..', page: 62 },
  { juz: 5, surah: 'النساء', start: 'والمحصنات..', page: 82 },
  { juz: 6, surah: 'النساء', start: 'لا يحب الله..', page: 102 },
  { juz: 7, surah: 'المائدة', start: 'لتجدن..', page: 121 },
  { juz: 8, surah: 'الأنعام', start: 'و لو أنا أنزلنا..', page: 142 },
  { juz: 9, surah: 'الأعراف', start: 'قال الملأ..', page: 162 },
  { juz: 10, surah: 'الأنفال', start: 'واعلموا..', page: 182 },
  { juz: 11, surah: 'التوبة', start: 'يعتذرون..', page: 201 },
  { juz: 12, surah: 'هود', start: 'وما من دابة..', page: 222 },
  { juz: 13, surah: 'يوسف', start: 'وما أبرئ..', page: 242 },
  { juz: 14, surah: 'الحجر', start: 'ربما..', page: 262 },
  { juz: 15, surah: 'الإسراء', start: 'سبحان..', page: 282 },
  { juz: 16, surah: 'الكهف', start: 'قال ألم..', page: 302 },
  { juz: 17, surah: 'الأنبياء', start: 'اقترب..', page: 322 },
  { juz: 18, surah: 'المؤمنون', start: 'قد أفلح..', page: 342 },
  { juz: 19, surah: 'الفرقان', start: 'وقال الذين..', page: 362 },
  { juz: 20, surah: 'النمل', start: 'أمن خلق..', page: 382 },
  { juz: 21, surah: 'العنكبوت', start: 'اتل ما..', page: 402 },
  { juz: 22, surah: 'الأحزاب', start: 'ومن يقنت..', page: 422 },
  { juz: 23, surah: 'يس', start: 'وما لي..', page: 442 },
  { juz: 24, surah: 'الزمر', start: 'فمن أظلم..', page: 462 },
  { juz: 25, surah: 'فصلت', start: 'إليه يرد..', page: 482 },
  { juz: 26, surah: 'الأحقاف', start: 'حم..', page: 502 },
  { juz: 27, surah: 'الذاريات', start: 'قال فما خطبكم..', page: 522 },
  { juz: 28, surah: 'المجادلة', start: 'قد سمع..', page: 542 },
  { juz: 29, surah: 'الملك', start: 'تبارك..', page: 562 },
  { juz: 30, surah: 'عم', start: 'عم يتساءلون..', page: 582 },
];

// ━━━━━━━━━━━ QURAN NAV DRAWER ━━━━━━━━━━━

type NavTab = 'surahs' | 'juz' | 'bookmarks';

function QuranNavDrawer({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
  surahs,
  currentPage,
  onSelectSurah,
  onSelectJuzPage,
  selectedSurah,
  bookmarks,
  onSelectBookmark,
}: {
  isOpen: boolean;
  activeTab: NavTab;
  onClose: () => void;
  onTabChange: (tab: NavTab) => void;
  surahs: SurahInfo[];
  currentPage: number;
  onSelectSurah: (n: number) => void;
  onSelectJuzPage: (page: number) => void;
  selectedSurah: number | null;
  bookmarks: string[];
  onSelectBookmark: (id: string) => void;
}) {
  const tabs: { id: NavTab; label: string }[] = [
    { id: 'surahs', label: 'السور' },
    { id: 'juz', label: 'الأجزاء' },
    { id: 'bookmarks', label: 'علامات' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm"
          />
          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-[401] w-80 bg-[#111] border-l border-white/10 flex flex-col shadow-2xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">مصحف وقفة</p>
                  <p className="text-[10px] text-white/30 font-bold mt-0.5">صفحة {currentPage}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-3 border-b border-white/10 shrink-0">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => onTabChange(t.id)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-xs font-black transition-all',
                    activeTab === t.id
                      ? 'bg-amber-500 text-black shadow-lg'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Surahs Tab */}
              {activeTab === 'surahs' && (
                <div className="py-2">
                  {surahs.map(s => (
                    <button
                      key={s.number}
                      onClick={() => { onSelectSurah(s.number); onClose(); }}
                      className={cn(
                        'w-full flex items-center justify-between px-5 py-3 text-right transition-all hover:bg-white/5',
                        selectedSurah === s.number && 'bg-amber-500/10 border-r-2 border-amber-400'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0',
                          s.revelationType === 'Meccan'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        )}>
                          {s.revelationType === 'Meccan' ? '🕌' : '🕌'}
                        </span>
                        <span className={cn(
                          'text-sm font-black',
                          selectedSurah === s.number ? 'text-amber-400' : 'text-white/80'
                        )}>
                          {s.number}. {s.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30 font-bold">{s.numberOfAyahs} آية</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Juz Tab */}
              {activeTab === 'juz' && (
                <div className="py-2">
                  {JUZ_DATA.map(j => (
                    <button
                      key={j.juz}
                      onClick={() => { onSelectJuzPage(j.page); onClose(); }}
                      className="w-full flex items-center justify-between px-5 py-3 text-right transition-all hover:bg-white/5 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-amber-500/20 transition-colors">
                          {j.juz}
                        </span>
                        <div>
                          <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors">
                            الجزء {j.juz}
                          </p>
                          <p className="text-[10px] text-amber-400/70 font-bold mt-0.5">
                            {j.surah}: <span className="text-white/40">{j.start}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/30 font-bold shrink-0">{j.page}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Bookmarks Tab */}
              {activeTab === 'bookmarks' && (
                <div className="py-2">
                  {bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 px-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                        <Bookmark className="w-7 h-7 text-white/20" />
                      </div>
                      <p className="text-white/30 text-xs font-bold">لا توجد علامات مرجعية بعد</p>
                      <p className="text-white/20 text-[10px]">اضغط على أيقونة الإشارة في أي آية لحفظها هنا</p>
                    </div>
                  ) : (
                    bookmarks.filter(b => b.startsWith('quran_')).map(b => (
                      <button
                        key={b}
                        onClick={() => { onSelectBookmark(b); onClose(); }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-right transition-all hover:bg-white/5"
                      >
                        <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-sm text-white/70 font-bold">{b.replace('quran_', '')}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ━━━━━━━━━━━ COMPONENTS ━━━━━━━━━━━

function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function PlanProgress({ percentage }: { percentage: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center mx-auto">
      <svg className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
        <motion.circle
          cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{percentage}%</span>
        <span className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">الإنجاز</span>
      </div>
    </div>
  );
}

function SurahInfoModal({ surah, onClose }: { surah: SurahInfo; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-3"><Info className="w-5 h-5 text-primary" /> تفاصيل السورة</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
          </div>
          <div className="p-10 space-y-10">
            <div className="text-center">
              <h2 className="text-6xl font-black text-white mb-2">{surah.name}</h2>
              <p className="text-primary font-bold tracking-[0.3em] uppercase text-xs">{surah.englishName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">مكان النزول</p>
                <p className="text-xl font-black text-white">{surah.revelationType === 'Meccan' ? 'مكية 🕋' : 'مدنية 🕌'}</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">عدد الآيات</p>
                <p className="text-xl font-black text-white">{surah.numberOfAyahs} آية</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">ترتيب النزول</p>
                <p className="text-xl font-black text-white">{surah.number}</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">تاريخ القراءة</p>
                <p className="text-xl font-black text-emerald-400">نشط الآن</p>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 text-center">
              <p className="text-white/60 text-sm leading-relaxed">
                تعتبر {surah.name} من السور العظيمة في القرآن الكريم، وتتميز بمواضيعها الإيمانية العميقة وتشريعاتها الحكيمة.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function ShareModal({ verse, onClose }: { verse: any; onClose: () => void }) {
  const [activeTheme, setActiveTheme] = useState(CARD_THEMES[0]);
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [customBg, setCustomBg] = useState('#134e4a'); // Default custom teal
  const [customText, setCustomText] = useState('#ccfbf1');
  const [userImage, setUserImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePatterns, setActivePatterns] = useState([CARD_PATTERNS[1]]);
  const [activeFrames, setActiveFrames] = useState([CARD_FRAMES[0]]);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'story'>('square');
  const [showTafseer, setShowTafseer] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [textGlow, setTextGlow] = useState(true);
  const [glassEffect, setGlassEffect] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [shadowDepth, setShadowDepth] = useState(40);
  const [signature, setSignature] = useState('');
  const [cardFont, setCardFont] = useState(verse.fontClass);
  const [customFontSize, setCustomFontSize] = useState(verse.arabic?.length > 150 ? 18 : 32);
  const [textAlign, setTextAlign] = useState<'center' | 'right' | 'justify'>('center');
  const [cardRadius, setCardRadius] = useState(40);
  const [filmGrain, setFilmGrain] = useState(false);
  const [gradientText, setGradientText] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    if (!cardRef.current) return;
    setIsCopying(true);
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('تم نسخ الصورة بنجاح! يمكنك لصقها الآن في أي محادثة.');
      }
    } catch (err) { console.error(err); alert('تعذر النسخ، يرجى استخدام زر التحميل.'); } finally { setIsCopying(false); }
  };

  const exportImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `waqfah-ayah-${verse.ayahNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error(err); } finally { setIsExporting(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setIsCustomTheme(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0a]" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full h-full bg-[#0a0a0a] flex flex-col md:flex-row overflow-hidden"
        >
          {/* Preview Area - Left Side */}
          <div className="flex-1 bg-black/60 p-6 md:p-12 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-l border-white/5 relative group min-h-0">
            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-[8px] font-black tracking-widest text-white/20 uppercase z-50">
              معاينة التصميم <Sparkles className="w-3 h-3" />
            </div>

            {/* Responsive Card Container */}
            <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar p-4">
              <div
                ref={cardRef}
                className={cn(
                  "flex flex-col justify-between relative overflow-hidden transition-all duration-700 shadow-2xl shrink-0 h-auto",
                  !isCustomTheme && activeTheme.bg,
                  aspectRatio === 'square' ? "w-full max-w-[500px] min-h-[500px]" : "w-[350px] md:w-[400px] min-h-[620px] md:min-h-[711px]"
                )}
                style={{
                  borderRadius: `${cardRadius}px`,
                  backgroundColor: isCustomTheme ? customBg : undefined,
                  backgroundImage: (isCustomTheme && userImage) ? `url(${userImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Pattern, Grain & Overlay Layer */}
                {activePatterns.map(pattern => (
                  <div
                    key={pattern.id}
                    className={cn("absolute inset-0 pointer-events-none transition-all duration-700", pattern.css)}
                    style={{ backgroundImage: pattern.url ? `url('${pattern.url}')` : 'none' }}
                  />
                ))}
                {filmGrain && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                )}
                <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: overlayOpacity }} />

                {/* Frame Layers */}
                {activeFrames.map(frame => (
                  frame.id !== 'none' && <div key={frame.id} className={cn("absolute inset-0 pointer-events-none z-20 transition-all duration-500", frame.border)} />
                ))}

                {/* Content Container */}
                <div className="relative z-30 flex-1 flex flex-col justify-center gap-4 p-6 md:p-10">
                  <div className={cn(
                    "p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 w-full flex-1 flex flex-col justify-center",
                    glassEffect ? "bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl" : ""
                  )}
                    style={{ boxShadow: glassEffect ? `0 ${shadowDepth}px ${shadowDepth * 2}px -${shadowDepth / 2}px rgba(0,0,0,0.5)` : 'none' }}>
                    <Quote className={cn("w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 md:mb-6 opacity-10 shrink-0", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }} />
                    <div className="space-y-4 md:space-y-6" style={{ textAlign }}>
                      <p
                        dir="rtl"
                        style={{
                          fontSize: `${customFontSize}px`,
                          textShadow: textGlow ? `0 0 30px ${isCustomTheme || activeTheme.id === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)'}` : 'none',
                          color: (isCustomTheme && !gradientText) ? customText : undefined
                        }}
                        className={cn(
                          "leading-[1.6] md:leading-[2.2] transition-all",
                          gradientText ? (isCustomTheme ? "bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500" : `bg-clip-text text-transparent bg-gradient-to-br ${activeTheme.textGradient}`) : (!isCustomTheme && activeTheme.text),
                          cardFont
                        )}
                      >
                        {verse.arabic}
                      </p>
                      {showTafseer && (
                        <p className={cn("text-[10px] md:text-sm opacity-60 leading-relaxed max-w-[90%] mx-auto font-medium", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                          {verse.tafseer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                {showMetadata && (
                  <div className="relative z-30 flex flex-col items-center pt-4 md:pt-6 mt-auto p-6 md:p-8 shrink-0">
                    <div className={cn("h-px w-12 mb-4 opacity-30", !isCustomTheme && activeTheme.accent)} style={{ backgroundColor: isCustomTheme ? customText : undefined }} />
                    <div className="text-center">
                      <span className={cn("text-[10px] md:text-sm font-black uppercase tracking-[0.2em] block mb-1", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                        سورة {verse.surah}
                      </span>
                      <span className={cn("text-[8px] md:text-xs font-bold opacity-60 uppercase tracking-widest", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                        الآية رقم {verse.ayahNumber}
                      </span>
                    </div>

                    {signature && (
                      <p className={cn("mt-4 text-[8px] md:text-[9px] font-black italic opacity-40", activeTheme.text)}>بواسطة: {signature}</p>
                    )}

                    {showLogo && (
                      <div className="mt-6 md:mt-8 flex items-center gap-2">
                        <div className={cn("px-3 py-1 rounded-full border text-[7px] md:text-[8px] font-black tracking-[0.3em] uppercase", activeTheme.text, "border-white/10 bg-white/5")}>
                          WAQFAH.COM
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls Area - Right Side */}
          <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col bg-[#080808] border-l border-white/5 h-full shrink-0">
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur-md z-50">
              <div className="flex flex-col">
                <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-3">التصميم السينمائي</h3>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">تعديل بطاقة المشاركة</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10">
              {/* Groups... */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">١. التخطيط والأبعاد</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'square', label: 'Feed (مربع)', icon: LayoutGrid },
                        { id: 'story', label: 'Story (رأسي)', icon: Maximize2 }
                      ].map(opt => (
                        <button key={opt.id} onClick={() => setAspectRatio(opt.id as any)} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all", aspectRatio === opt.id ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                          <opt.icon className="w-4 h-4" />
                          <span className="text-[9px] font-black">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">استدارة الحواف</span><span className="text-[10px] font-black text-primary">{cardRadius}px</span></div>
                      <input type="range" min="0" max="60" value={cardRadius} onChange={(e) => setCardRadius(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٢. الهوية البصرية</p>
                  <div className="grid grid-cols-6 gap-2">
                    {CARD_THEMES.map(theme => (
                      <button key={theme.id} onClick={() => { setIsCustomTheme(false); setActiveTheme(theme); }} className={cn("w-full aspect-square rounded-xl border-2 transition-all", theme.bg, !isCustomTheme && activeTheme.id === theme.id ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")} />
                    ))}
                    <button onClick={() => setIsCustomTheme(true)} className={cn("w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900", isCustomTheme && !userImage ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")}>
                      <span className="text-[10px] font-black">ألواني</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className={cn("w-full aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center bg-white/5", isCustomTheme && userImage ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")}>
                      <ImagePlus className="w-4 h-4 mb-1" />
                      <span className="text-[8px] font-black uppercase">خلفيتي</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>

                  {isCustomTheme && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2 flex flex-col items-center">
                        <label className="text-[9px] font-black text-white/50 uppercase">لون الخلفية</label>
                        <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full h-10 rounded cursor-pointer bg-transparent border-0" />
                      </div>
                      <div className="space-y-2 flex flex-col items-center">
                        <label className="text-[9px] font-black text-white/50 uppercase">لون النص</label>
                        <input type="color" value={customText} onChange={(e) => setCustomText(e.target.value)} className="w-full h-10 rounded cursor-pointer bg-transparent border-0" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGradientText(!gradientText)} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all", gradientText ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                      <span className="text-[9px] font-black">نص مُذَهَّب</span>
                      {gradientText ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                    </button>
                    <button onClick={() => setFilmGrain(!filmGrain)} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all", filmGrain ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                      <span className="text-[9px] font-black">تشويش (Grain)</span>
                      {filmGrain ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٣. الزخارف والإطارات</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {CARD_PATTERNS.map(p => {
                        const isActive = activePatterns.some(ap => ap.id === p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              if (p.id === 'none') {
                                setActivePatterns([p]);
                              } else {
                                if (isActive) {
                                  const next = activePatterns.filter(ap => ap.id !== p.id);
                                  setActivePatterns(next.length ? next : [CARD_PATTERNS[0]]);
                                } else {
                                  setActivePatterns([...activePatterns.filter(ap => ap.id !== 'none'), p]);
                                }
                              }
                            }}
                            className={cn("py-2 px-1 rounded-xl text-[10px] font-black transition-all text-center", isActive ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-white/5 text-white/40 hover:bg-white/10")}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {CARD_FRAMES.map(f => {
                        const isActive = activeFrames.some(af => af.id === f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() => {
                              if (f.id === 'none') {
                                setActiveFrames([f]);
                              } else {
                                if (isActive) {
                                  const next = activeFrames.filter(af => af.id !== f.id);
                                  setActiveFrames(next.length ? next : [CARD_FRAMES[0]]);
                                } else {
                                  setActiveFrames([...activeFrames.filter(af => af.id !== 'none'), f]);
                                }
                              }
                            }}
                            className={cn("py-2 px-1 rounded-xl text-[10px] font-black transition-all text-center border", isActive ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "border-white/5 text-white/40 hover:bg-white/10")}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٤. إعدادات النص المتقدمة</p>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">حجم الخط</span><span className="text-[10px] font-black text-primary">{customFontSize}px</span></div>
                      <input type="range" min="10" max="64" value={customFontSize} onChange={(e) => setCustomFontSize(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-white/40 uppercase">محاذاة النص</p>
                      <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                        {[
                          { id: 'right', label: 'يمين', icon: AlignRight },
                          { id: 'center', label: 'توسيط', icon: LayoutGrid },
                          { id: 'justify', label: 'ضبط', icon: FileText }
                        ].map(a => (
                          <button key={a.id} onClick={() => setTextAlign(a.id as any)} className={cn("flex-1 py-2 flex justify-center items-center rounded-md transition-all", textAlign === a.id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80")}>
                            <a.icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">تعتيم الخلفية</span><span className="text-[10px] font-black text-primary">{Math.round(overlayOpacity * 100)}%</span></div>
                      <input type="range" min="0" max="0.9" step="0.1" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">عمق الظل</span><span className="text-[10px] font-black text-primary">{shadowDepth}px</span></div>
                      <input type="range" min="0" max="100" value={shadowDepth} onChange={(e) => setShadowDepth(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setTextGlow(!textGlow)} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl transition-all", textGlow ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40")}>
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase">توهج النص</span>
                      </button>
                      <button onClick={() => setGlassEffect(!glassEffect)} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl transition-all", glassEffect ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40")}>
                        <Layers className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase">تأثير الزجاج</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">نوع الخط</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['font-quran', 'font-amiri'].map(f => (
                          <button key={f} onClick={() => setCardFont(f)} className={cn("p-2 rounded-lg text-[9px] font-black transition-all border", cardFont === f ? "border-primary text-primary bg-primary/5" : "border-white/5 text-white/40")}>
                            {f === 'font-quran' ? 'عثماني' : 'كلاسيك'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٥. التوقيع والمحتوى</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                      <input
                        type="text"
                        placeholder="أدخل اسمك للتوقيع..."
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-[10px] font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'التفسير', state: showTafseer, setter: setShowTafseer },
                        { label: 'المعلومات', state: showMetadata, setter: setShowMetadata },
                        { label: 'الشعار', state: showLogo, setter: setShowLogo },
                      ].map((t, i) => (
                        <button key={i} onClick={() => t.setter(!t.state)} className={cn("flex items-center justify-between p-3 rounded-xl transition-all", t.state ? "bg-white/10 text-white" : "bg-white/5 text-white/20", i === 2 && "col-span-2")}>
                          <span className="text-[9px] font-black">{t.label}</span>
                          {t.state ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-white/5 bg-black/80 sticky bottom-0 z-50 flex gap-2">
              <button disabled={isCopying} onClick={copyToClipboard} className="h-14 md:h-16 px-6 bg-white/10 text-white rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0">
                {isCopying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
              </button>
              <button disabled={isExporting} onClick={exportImage} className="flex-1 h-14 md:h-16 bg-white text-black rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-4xl">
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isExporting ? 'جاري التصدير...' : 'تصدير التصميم النهائي'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}



function ExamModal({ memorizedVerses, onClose, onComplete }: { memorizedVerses: any[]; onClose: () => void; onComplete: (points: number) => void }) {
  const [currentExamVerse, setCurrentExamVerse] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [examStep, setExamStep] = useState<'question' | 'result'>('question');

  useEffect(() => {
    if (memorizedVerses.length > 0) {
      const random = memorizedVerses[Math.floor(Math.random() * memorizedVerses.length)];
      setCurrentExamVerse(random);
    }
  }, [memorizedVerses]);

  if (!currentExamVerse) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-4xl p-10 md:p-16 text-center">
          <div className="mb-12">
            <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Trophy className="w-10 h-10 text-primary" /></div>
            <h3 className="text-3xl font-black text-white">اختبار تثبيت الحفظ</h3>
            <p className="text-white/40 text-sm mt-2">هل تتذكر الآية التالية؟</p>
          </div>

          <div className="space-y-10">
            <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative">
              <div className="absolute -top-4 right-10 px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">الآية السابقة</div>
              <p className="text-2xl md:text-3xl font-quran leading-relaxed text-white/60">"{currentExamVerse.arabic.split(' ').slice(0, -3).join(' ')}..."</p>
            </div>

            <AnimatePresence>
              {showAnswer ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl md:text-4xl font-quran leading-relaxed text-emerald-400 mb-6">{currentExamVerse.arabic}</p>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => { onComplete(10); onClose(); }} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all">أجبت بشكل صحيح ✅</button>
                    <button onClick={onClose} className="px-8 py-4 bg-white/5 text-white/40 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">أحتاج للمراجعة 🔄</button>
                  </div>
                </motion.div>
              ) : (
                <button onClick={() => setShowAnswer(true)} className="w-full h-24 rounded-[2.5rem] border-2 border-dashed border-white/10 text-white/20 font-black hover:border-primary/40 hover:text-primary transition-all text-xl">اضغط هنا لكشف الآية والتأكد</button>
              )}
            </AnimatePresence>
          </div>

          <button onClick={onClose} className="mt-12 text-white/20 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">إلغاء الاختبار</button>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function WordAnalysisModal({ analysis, onClose }: { analysis: any; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center">
          <div className="absolute top-4 right-4"><button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button></div>

          <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-8">التحليل اللغوي للكلمة</h3>

          {analysis.loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4"><Loader2 className="w-8 h-8 text-primary animate-spin" /><p className="text-white/40 text-xs font-bold">جاري استخراج المعاني...</p></div>
          ) : analysis.error ? (
            <div className="py-12"><p className="text-red-400 text-sm font-bold">عذراً، تعذر جلب معلومات الكلمة. تأكد من اتصالك بالإنترنت.</p></div>
          ) : analysis.wordData ? (
            <div className="space-y-6">
              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
                <p className="text-5xl font-quran text-primary leading-normal mb-4 drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">{analysis.wordData.text_uthmani}</p>
                {analysis.wordData.transliteration?.text && <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase">{analysis.wordData.transliteration.text}</p>}
              </div>

              <div className="space-y-4 text-right">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><FileText className="w-3 h-3" /> المعنى (عربي)</p>
                  <p className="text-lg font-bold text-white/90 leading-relaxed">{analysis.wordData.translation?.text || 'المعنى غير متوفر لهذه الكلمة'}</p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function VerseCard({ verse, accentColor, border, index, isReadingMode, fontSize, onPlay, onShare, onBookmark, onWordClick, isPlaying, isBookmarked, reciterName, id, fontClass, searchQuery, isHideRevealMode, quranHideMode = 'hideAll', selectedTranslation, onChatClick, isComparisonMode, selectedSecondaryTafseerName, selectedSecondaryTranslation }: any) {
  const [copied, setCopied] = useState(false);
  const verseRef = useRef<HTMLDivElement>(null);
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const [isCinematicFocus, setIsCinematicFocus] = useState(false);
  const [isLocalHideActive, setIsLocalHideActive] = useState<boolean>(false);
  const [isLocalRevealedOverride, setIsLocalRevealedOverride] = useState<boolean>(false);

  // Reset local overrides when global hide reveal mode changes
  useEffect(() => {
    setIsLocalHideActive(false);
    setIsLocalRevealedOverride(false);
  }, [isHideRevealMode]);

  const isVerseCurrentlyHidden = isHideRevealMode ? !isLocalRevealedOverride : isLocalHideActive;

  // Reset revealed words when hide/reveal mode changes, quranHideMode changes or verse changes
  useEffect(() => {
    setRevealedWords(new Set());
  }, [isHideRevealMode, quranHideMode, verse?.id]);

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[ًٌٍَُِّْ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .trim();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    const normalizedText = normalizeArabic(text);
    const normalizedQuery = normalizeArabic(query);

    if (normalizedText.includes(normalizedQuery)) {
      return <span className="text-primary drop-shadow-glow-primary font-black">{text}</span>;
    }
    return text;
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isPlaying && verseRef.current) {
      verseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isPlaying]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${verse.arabic}\n— ${verse.surah}: ${verse.ayahNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRevealWord = (wordIndex: number) => {
    setRevealedWords(prev => {
      const next = new Set(prev);
      if (next.has(wordIndex)) next.delete(wordIndex);
      else next.add(wordIndex);
      return next;
    });
  };

  return (
    <motion.div
      ref={verseRef}
      id={`verse-${id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative border overflow-hidden p-6 md:p-10 transition-all duration-500",
        isCinematicFocus ? "fixed inset-0 z-[500] rounded-none bg-black/95 backdrop-blur-3xl flex flex-col justify-center overflow-y-auto m-0 shadow-2xl" : "rounded-[2.5rem]",
        !isCinematicFocus && isPlaying ? "bg-primary/20 border-primary/60 shadow-[0_0_50px_-10px_rgba(var(--primary),0.4)] scale-[1.02]" : "",
        !isCinematicFocus && !isPlaying ? "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]" : "",
        !isCinematicFocus && border
      )}
    >
      {verse.sajdah && <div className="absolute top-0 left-0 bg-primary px-4 py-1 rounded-br-2xl text-[8px] font-black uppercase tracking-widest text-primary-foreground flex items-center gap-1.5 z-20 shadow-lg"><Star className="w-3 h-3 fill-current" /> سجدة تلاوة</div>}
      {isVerseCurrentlyHidden && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/20">
          <EyeOff className="w-3 h-3 text-violet-400" />
          <span className="text-[9px] font-black text-violet-300 uppercase tracking-widest">
            {isHideRevealMode ? "وضع الاختبار" : "إخفاء الآية"}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black border bg-black/20", border, accentColor)}>{verse.surah}</span>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-black border border-white/5 bg-black/20 text-white/40">{verse.ayahNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && <span className="text-[10px] font-bold text-primary animate-pulse ml-2 flex items-center gap-1"><Music className="w-3 h-3" /> جاري التلاوة...</span>}
          <button onClick={() => onPlay?.(verse)} className={cn("w-12 h-12 rounded-2xl transition-all duration-300 flex items-center justify-center", isPlaying ? "bg-primary text-primary-foreground shadow-glow-primary" : "bg-white/5 text-white/40 hover:bg-primary/20 hover:text-primary")}>{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}</button>
        </div>
      </div>
      <p
        dir="rtl"
        className={cn("text-white/95 text-right transition-all duration-500 select-none", isReadingMode ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl", fontClass)}
        style={{
          fontWeight: 'var(--quran-weight, 400)',
          wordSpacing: 'var(--quran-word-spacing, 0px)',
          letterSpacing: 'var(--quran-kashida, 0em)',
          fontSize: isReadingMode && fontSize ? `${fontSize + 10}px` : 'var(--quran-font-size, 2rem)',
          lineHeight: 'var(--quran-line-height, 2.3)',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem'
        }}
      >
        {verse.arabic.split(' ').map((word: string, i: number) => {
          const isRevealed = revealedWords.has(i);
          const totalWords = verse.arabic.split(' ').length;
          const halfCount = Math.ceil(totalWords / 2);
          const isHiddenByDefault = quranHideMode === 'hideAll' || (quranHideMode === 'hideFirst' && i < halfCount) || (quranHideMode === 'hideSecond' && i >= halfCount);
          const isHidden = isVerseCurrentlyHidden && isHiddenByDefault && !isRevealed;
          return (
            <motion.span
              key={i}
              whileHover={{ scale: 1.15, textShadow: "0px 0px 20px rgba(var(--primary-rgb), 0.6)", y: -3, transition: { type: "spring", stiffness: 300, damping: 15 } }}
              onClick={() => {
                if (isVerseCurrentlyHidden) {
                  toggleRevealWord(i);
                } else {
                  onWordClick?.(verse, i);
                }
              }}
              onMouseEnter={(e: any) => {
                if (isVerseCurrentlyHidden && !isRevealed) {
                  e.currentTarget.style.filter = 'blur(0px)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                }
              }}
              onMouseLeave={(e: any) => {
                if (isVerseCurrentlyHidden && !isRevealed) {
                  e.currentTarget.style.filter = 'blur(6px)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.15)';
                }
              }}
              className={cn(
                "rounded-lg px-1.5 py-0.5 cursor-pointer transition-colors duration-300 inline-block",
                isHidden
                  ? "text-white/15 bg-white/5 hover:bg-violet-500/10"
                  : "hover:text-primary hover:bg-primary/10"
              )}
              style={isHidden ? { filter: 'blur(6px)' } : {}}
              title={isVerseCurrentlyHidden ? "اضغط لكشف الكلمة" : "انقر لمعرفة التحليل اللغوي"}
            >
              {searchQuery ? highlightMatch(word, searchQuery) : word}{' '}
            </motion.span>
          );
        })}
      </p>
      <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-6">
        {!isComparisonMode ? (
          <div className="flex flex-col gap-3 max-w-2xl text-right">
            <div className="flex items-start gap-4">
              <Info className="w-4 h-4 text-white/20 mt-1 shrink-0" />
              <p className={cn("text-white/50 text-sm leading-relaxed", isVerseCurrentlyHidden && "blur-sm hover:blur-none transition-all duration-300")}>{verse.tafseer}</p>
            </div>
            {verse.translation && (
              <div className="flex items-start gap-4 border-t border-white/5 pt-2" dir={selectedTranslation?.lang === 'ur' ? 'rtl' : 'ltr'}>
                <Languages className="w-4 h-4 text-emerald-400/40 mt-1 shrink-0" />
                <p className="text-white/40 text-xs font-semibold leading-relaxed">{verse.translation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right w-full">
            {/* Column 1: Primary Interpretation */}
            <div className="flex flex-col gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">التفسير والترجمة الأساسية</span>
              </div>

              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-white/30 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-white/30 mb-1">تفسير الآية</p>
                  <p className={cn("text-white/70 text-xs leading-relaxed font-tajawal", isVerseCurrentlyHidden && "blur-sm hover:blur-none transition-all duration-300")}>{verse.tafseer}</p>
                </div>
              </div>

              {verse.translation && (
                <div className="flex items-start gap-3 border-t border-white/5 pt-3" dir={selectedTranslation?.lang === 'ur' ? 'rtl' : 'ltr'}>
                  <Languages className="w-4 h-4 text-emerald-400/30 mt-1 shrink-0" />
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/30 mb-1">الترجمة ({selectedTranslation?.name})</p>
                    <p className="text-white/60 text-xs font-semibold leading-relaxed">{verse.translation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Secondary Interpretation (Comparison) */}
            <div className="flex flex-col gap-4 p-5 rounded-3xl bg-amber-500/[0.02] border border-amber-500/10">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-amber-400/50 uppercase tracking-widest">المقارنة الجانبية</span>
              </div>

              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-400/30 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-amber-400/30 mb-1">التفسير المقارن ({selectedSecondaryTafseerName})</p>
                  <p className={cn("text-white/70 text-xs leading-relaxed font-tajawal", isVerseCurrentlyHidden && "blur-sm hover:blur-none transition-all duration-300")}>{verse.secondaryTafseer || "لا يوجد تفسير مقارن متوفر"}</p>
                </div>
              </div>

              {verse.secondaryTranslation && (
                <div className="flex items-start gap-3 border-t border-white/5 pt-3" dir={selectedSecondaryTranslation?.lang === 'ur' ? 'rtl' : 'ltr'}>
                  <Languages className="w-4 h-4 text-emerald-400/30 mt-1 shrink-0" />
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/30 mb-1">الترجمة المقارنة ({selectedSecondaryTranslation?.name})</p>
                    <p className="text-white/60 text-xs font-semibold leading-relaxed">{verse.secondaryTranslation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-4 border-t border-white/5 w-full">
          {/* Smart AI Tafseer Companion Trigger Button */}
          <button
            onClick={(e: any) => { e.stopPropagation(); onChatClick?.(verse); }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-violet-300 border border-violet-500/20 hover:from-violet-600/40 hover:to-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 text-xs font-black"
          >
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            <span>🤖 رفيق التدبر والتفسير الذكي</span>
          </button>

          {/* Cinematic Focus Mode Button */}
          <button
            onClick={(e: any) => { e.stopPropagation(); setIsCinematicFocus(!isCinematicFocus); }}
            className={cn(
              "px-5 py-3 rounded-2xl transition-all flex items-center gap-2.5 text-xs font-black border",
              isCinematicFocus 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                : "bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white"
            )}
          >
            <Eye className={cn("w-4 h-4", isCinematicFocus && "animate-pulse")} />
            <span>{isCinematicFocus ? 'إغلاق وضع التركيز' : 'التركيز السينمائي'}</span>
          </button>

          {/* Local Hide/Reveal Mode Toggle Button */}
          <button
            onClick={(e: any) => {
              e.stopPropagation();
              if (isHideRevealMode) {
                setIsLocalRevealedOverride(!isLocalRevealedOverride);
              } else {
                setIsLocalHideActive(!isLocalHideActive);
              }
            }}
            className={cn(
              "px-5 py-3 rounded-2xl transition-all flex items-center gap-2.5 text-xs font-black border",
              isVerseCurrentlyHidden
                ? "bg-violet-500/20 text-violet-400 border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                : "bg-white/5 text-white/40 border-transparent hover:bg-violet-500/10 hover:text-violet-300"
            )}
            title={isHideRevealMode ? "كشف الآية كاملة للمطابقة" : "إخفاء هذه الآية لاختبار الحفظ"}
          >
            {isVerseCurrentlyHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isVerseCurrentlyHidden ? "كشف الآية" : "إخفاء الآية"}</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={(e: any) => { e.stopPropagation(); onShare?.(verse); }} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-2 text-xs font-bold"><ImageIcon className="w-4 h-4" /> مشاركة</button>
            <button onClick={(e: any) => { e.stopPropagation(); onBookmark?.(verse); }} className={cn("p-3 rounded-xl transition-all", isBookmarked ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 hover:text-white")}><BookmarkCheck className={cn("w-4 h-4", isBookmarked && "fill-current")} /></button>
            <button onClick={handleCopy} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━

export default function QuranPage() {
  const { isReadingMode, fontSize } = useReadingMode();
  const { state, updateState } = useSync();
  const [view, setView] = useState<'full' | 'plan' | 'luminous' | 'radio'>('full');

  // ── Quran Radio States ──
  const [isPlayingRadio, setIsPlayingRadio] = useState<boolean>(false);
  const [currentRadioStation, setCurrentRadioStation] = useState<any>(null);
  const [isRadioBuffering, setIsRadioBuffering] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(0.8);
  const [radioSearchQuery, setRadioSearchQuery] = useState<string>('');
  const [favoriteRadioIds, setFavoriteRadioIds] = useState<string[]>([]);
  const radioAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('quran_favorite_radios');
      if (savedFavorites) {
        setFavoriteRadioIds(JSON.parse(savedFavorites));
      }
    }
  }, []);

  const toggleFavoriteRadio = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteRadioIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('quran_favorite_radios', JSON.stringify(next));
      return next;
    });
  }, []);
  const [activeCollection, setActiveCollection] = useState(QURAN_DATA[0].id);
  const [activeTopic, setActiveTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahContent, setSurahContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [selectedTafseer, setSelectedTafseer] = useState(TAFSEERS[0]);
  const [selectedScript, setSelectedScript] = useState(SCRIPTS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [playMode, setPlayMode] = useState<'ayah' | 'surah' | 'single'>('surah');
  const [isLoop, setIsLoop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSurahInfo, setActiveSurahInfo] = useState<SurahInfo | null>(null);
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [sharingVerse, setSharingVerse] = useState<any>(null);
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'ayah' | 'page'>('ayah');
  const [currentPage, setCurrentPage] = useState(1);
  const [recentSurahs, setRecentSurahs] = useState<number[]>([]);
  const [activeWordAnalysis, setActiveWordAnalysis] = useState<{ verse: any, wordIndex: number, wordData?: any, loading?: boolean, error?: boolean } | null>(null);
  const [mushafError, setMushafError] = useState(false);
  const [pageViewLayout, setPageViewLayout] = useState<'single' | 'double'>('double');
  const [showSidePanel, setShowSidePanel] = useState<boolean>(false);
  const [showPageReciterMenu, setShowPageReciterMenu] = useState<boolean>(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState<boolean>(false);
  const [navDrawerTab, setNavDrawerTab] = useState<NavTab>('surahs');

  // Audio repetition and looping states
  const [verseRepetition, setVerseRepetition] = useState<number>(1);
  const [verseRepetitionCount, setVerseRepetitionCount] = useState<number>(0);
  const [rangeLoopActive, setRangeLoopActive] = useState<boolean>(false);
  const [rangeStartVerse, setRangeStartVerse] = useState<any>(null);
  const [rangeEndVerse, setRangeEndVerse] = useState<any>(null);
  const [rangeLoopCount, setRangeLoopCount] = useState<number>(0);
  const [maxRangeLoop, setMaxRangeLoop] = useState<number>(1);

  // AI Speech Recitation Check states
  const [isTestingRecitation, setIsTestingRecitation] = useState<boolean>(false);
  const [testVerse, setTestVerse] = useState<any>(null);
  const [isListeningRecitation, setIsListeningRecitation] = useState<boolean>(false);
  const [testWordsResult, setTestWordsResult] = useState<any[] | null>(null);
  const [testMatchPercentage, setTestMatchPercentage] = useState<number>(0);

  // Dual-page image sources and loading states
  const [rightImgSrc, setRightImgSrc] = useState<string>('');
  const [isRightImageLoading, setIsRightImageLoading] = useState<boolean>(true);
  const [leftImgSrc, setLeftImgSrc] = useState<string>('');
  const [isLeftImageLoading, setIsLeftImageLoading] = useState<boolean>(true);
  const [rightImgError, setRightImgError] = useState<boolean>(false);
  const [leftImgError, setLeftImgError] = useState<boolean>(false);
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [tafseerResults, setTafseerResults] = useState<any[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // ── Phase 2: New Smart Features States ──
  const [isHideRevealMode, setIsHideRevealMode] = useState<boolean>(false);
  const [quranHideMode, setQuranHideMode] = useState<'show' | 'hideFirst' | 'hideSecond' | 'hideAll'>('hideAll');
  const [isAutoScrollActive, setIsAutoScrollActive] = useState<boolean>(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(3);
  const [pauseSecondsBetweenAyahs, setPauseSecondsBetweenAyahs] = useState<number>(0);
  const autoScrollRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceRecognitionRef = useRef<any>(null);
  const [searchFilter, setSearchFilter] = useState<'all' | 'surahs' | 'verses' | 'tafseer'>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Phase 3: Brand New Optimized & Developed Features States ──
  const [mushafType, setMushafType] = useState<'image' | 'digital'>('image');
  const [selectedTranslation, setSelectedTranslation] = useState(TRANSLATIONS[0]);
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.3);
  const [isCustomPlanModalOpen, setIsCustomPlanModalOpen] = useState<boolean>(false);
  const [isTajweedGuideOpen, setIsTajweedGuideOpen] = useState<boolean>(false);
  const [customPagesInput, setCustomPagesInput] = useState<number>(2);
  const [customDurationInput, setCustomDurationInput] = useState<number>(6);
  const [customPlanType, setCustomPlanType] = useState<'pages' | 'duration'>('pages');
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Phase 4: Comparison & AI Chat Companion States ──
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [selectedSecondaryTafseer, setSelectedSecondaryTafseer] = useState(TAFSEERS[1]);
  const [selectedSecondaryTranslation, setSelectedSecondaryTranslation] = useState(TRANSLATIONS[1]);
  const [activeChatVerse, setActiveChatVerse] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatConnectionMode, setChatConnectionMode] = useState<'online' | 'local'>('online');

  // ── Phase 5: Dynamic Typography Engine States ──
  const [isTypographyPanelOpen, setIsTypographyPanelOpen] = useState<boolean>(false);
  const [typoFontWeight, setTypoFontWeight] = useState<number>(400);
  const [typoLineHeight, setTypoLineHeight] = useState<number>(2.3);
  const [typoWordSpacing, setTypoWordSpacing] = useState<number>(0);
  const [typoLetterSpacing, setTypoLetterSpacing] = useState<number>(0);
  const [typoFontSize, setTypoFontSize] = useState<number>(32);

  // Sync typography to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--quran-weight', String(typoFontWeight));
    root.style.setProperty('--quran-line-height', String(typoLineHeight));
    root.style.setProperty('--quran-word-spacing', `${typoWordSpacing}px`);
    root.style.setProperty('--quran-kashida', `${typoLetterSpacing}em`);
    root.style.setProperty('--quran-font-size', `${typoFontSize}px`);
  }, [typoFontWeight, typoLineHeight, typoWordSpacing, typoLetterSpacing, typoFontSize]);

  // Persistence Effect
  useEffect(() => {
    const savedReciter = localStorage.getItem('quran_reciter');
    const savedTafseer = localStorage.getItem('quran_tafseer');
    const savedTranslation = localStorage.getItem('quran_translation');
    const savedMushafType = localStorage.getItem('quran_mushaf_type');
    const savedScript = localStorage.getItem('quran_script');
    const savedSpeed = localStorage.getItem('quran_speed');
    const savedHistory = localStorage.getItem('quran_search_history');
    const savedPlayMode = localStorage.getItem('quran_play_mode');

    if (savedReciter) setSelectedReciter(JSON.parse(savedReciter));
    if (savedTafseer) setSelectedTafseer(JSON.parse(savedTafseer));
    if (savedTranslation) setSelectedTranslation(JSON.parse(savedTranslation));
    if (savedMushafType) setMushafType(savedMushafType as any);
    if (savedScript) setSelectedScript(JSON.parse(savedScript));
    if (savedSpeed) setPlaybackSpeed(parseFloat(savedSpeed));
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    if (savedPlayMode) setPlayMode(savedPlayMode as any);
  }, []);

  useEffect(() => {
    localStorage.setItem('quran_reciter', JSON.stringify(selectedReciter));
    localStorage.setItem('quran_tafseer', JSON.stringify(selectedTafseer));
    localStorage.setItem('quran_translation', JSON.stringify(selectedTranslation));
    localStorage.setItem('quran_mushaf_type', mushafType);
    localStorage.setItem('quran_script', JSON.stringify(selectedScript));
    localStorage.setItem('quran_speed', playbackSpeed.toString());
    localStorage.setItem('quran_play_mode', playMode);
  }, [selectedReciter, selectedTafseer, selectedTranslation, mushafType, selectedScript, playbackSpeed, playMode]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, currentAudio]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Auto-Scroll (Tahajjud Mode) Effect ──
  useEffect(() => {
    if (isAutoScrollActive) {
      const scrollStep = () => {
        window.scrollBy(0, autoScrollSpeed * 0.4);
        autoScrollRef.current = requestAnimationFrame(scrollStep);
      };
      autoScrollRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    }
    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };
  }, [isAutoScrollActive, autoScrollSpeed]);

  // ── Cleanup pause timer on unmount ──
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  // ── Ambient Sound Control Effect ──
  useEffect(() => {
    if (!ambientAudioRef.current && typeof Audio !== 'undefined') {
      ambientAudioRef.current = new Audio();
      ambientAudioRef.current.loop = true;
    }

    if (activeAmbient) {
      const sound = AMBIENT_SOUNDS.find(s => s.id === activeAmbient);
      if (sound && ambientAudioRef.current) {
        ambientAudioRef.current.src = sound.url;
        ambientAudioRef.current.volume = ambientVolume;
        ambientAudioRef.current.play().catch(e => console.warn("Failed to play ambient sound:", e));
      }
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    }
  }, [activeAmbient]);

  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (radioAudioRef.current) {
      radioAudioRef.current.volume = radioVolume;
    }
  }, [radioVolume]);

  useEffect(() => {
    return () => {
      if (radioAudioRef.current) {
        radioAudioRef.current.pause();
        radioAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (radioAudioRef.current) {
      radioAudioRef.current.volume = radioVolume;
    }
  }, [radioVolume]);

  useEffect(() => {
    return () => {
      if (radioAudioRef.current) {
        radioAudioRef.current.pause();
        radioAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah').then(res => res.json()).then(data => setSurahs(data.data));
    const recents = JSON.parse(localStorage.getItem('quran_recents') || '[]');
    setRecentSurahs(recents);
    const randomAyah = Math.floor(Math.random() * 6236) + 1;
    fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/${selectedScript.edition},ar.jalalayn`).then(res => res.json()).then(data => {
      const scriptData = data.data[0]; const jalalayn = data.data[1];
      setDailyVerse({ id: scriptData.number, arabic: scriptData.text, tafseer: jalalayn.text, surah: scriptData.surah.name, ayahNumber: scriptData.numberInSurah });
    });
  }, [selectedScript]);


  const loadSurah = useCallback(async (num: number) => {
    setIsLoading(true); setSelectedSurah(num);
    setRecentSurahs(prev => {
      const newRecents = [num, ...prev.filter(n => n !== num)].slice(0, 4);
      localStorage.setItem('quran_recents', JSON.stringify(newRecents));
      return newRecents;
    });
    try {
      const [scriptData, tafseer, translationData, secTafseerData, secTranslationData] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${num}/editions/${selectedScript.edition}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedTafseer.id}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedTranslation.id}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedSecondaryTafseer.id}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedSecondaryTranslation.id}`).then(res => res.json())
      ]);
      const combined = scriptData.data[0].ayahs.map((ayah: any, i: number) => ({
        id: ayah.number,
        surah: scriptData.data[0].name,
        surahNumber: num,
        ayahNumber: ayah.numberInSurah,
        arabic: ayah.text,
        tafseer: tafseer.data.ayahs[i].text,
        translation: translationData?.data?.ayahs?.[i]?.text || '',
        secondaryTafseer: secTafseerData?.data?.ayahs?.[i]?.text || '',
        secondaryTranslation: secTranslationData?.data?.ayahs?.[i]?.text || '',
        sajdah: ayah.sajdah,
        page_number: ayah.page || 1,
        juz_number: ayah.juz || 1
      }));

      // Clean Bismillah from first verse if surah is not Fatiha (1) or Tawbah (9)
      if (num !== 1 && num !== 9 && combined.length > 0) {
        // Very aggressive regex to handle almost all Bismillah variations across different APIs/Scripts
        const bismillahPattern = /^بِسْمِ[\s\S]*?الرَّحِيْمِ\s*|^بِسْمِ[\s\S]*?الرَّحِيمِ\s*/;
        combined[0].arabic = combined[0].arabic.replace(bismillahPattern, "").trim();
      }

      setSurahContent(combined);
      // Immediately set current page to the first page of this surah
      if (combined.length > 0) {
        setCurrentPage(combined[0].page_number);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [selectedTafseer, selectedScript, selectedTranslation, selectedSecondaryTafseer, selectedSecondaryTranslation]);

  // Effect to reload surah when tafseer, translation or script changes
  useEffect(() => {
    if (selectedSurah) loadSurah(selectedSurah);
  }, [selectedTafseer, selectedScript, selectedTranslation, selectedSecondaryTafseer, selectedSecondaryTranslation, loadSurah, selectedSurah]);

  const rightPage = useMemo(() => {
    return pageViewLayout === 'double' ? (currentPage % 2 === 0 ? currentPage - 1 : currentPage) : currentPage;
  }, [currentPage, pageViewLayout]);

  const leftPage = useMemo(() => {
    return rightPage + 1;
  }, [rightPage]);

  // Load right page image
  useEffect(() => {
    setRightImgError(false);
    setIsRightImageLoading(true);
    setRightImgSrc(`https://quran.islam-db.com/public/data/pages/quranpages_1920/images/page${String(rightPage).padStart(3, '0')}.png`);
  }, [rightPage]);

  // Load left page image
  useEffect(() => {
    setLeftImgError(false);
    setIsLeftImageLoading(true);
    setLeftImgSrc(`https://quran.islam-db.com/public/data/pages/quranpages_1920/images/page${String(leftPage).padStart(3, '0')}.png`);
  }, [leftPage]);

  // Fallback handlers
  const handleRightImageError = useCallback(() => {
    if (rightImgSrc.includes('quranpages_1920')) {
      setRightImgSrc(`https://quran.islam-db.com/public/data/pages/quranpages_1024/images/page${String(rightPage).padStart(3, '0')}.png`);
    } else {
      setRightImgError(true);
    }
  }, [rightImgSrc, rightPage]);

  const handleLeftImageError = useCallback(() => {
    if (leftImgSrc.includes('quranpages_1920')) {
      setLeftImgSrc(`https://quran.islam-db.com/public/data/pages/quranpages_1024/images/page${String(leftPage).padStart(3, '0')}.png`);
    } else {
      setLeftImgError(true);
    }
  }, [leftImgSrc, leftPage]);

  // If right image fails, or both fail, we fallback to text
  useEffect(() => {
    if (pageViewLayout === 'double') {
      if (rightImgError && leftImgError) {
        setMushafError(true);
      } else {
        setMushafError(false);
      }
    } else {
      if (rightImgError) {
        setMushafError(true);
      } else {
        setMushafError(false);
      }
    }
  }, [rightImgError, leftImgError, pageViewLayout]);

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u065F\u06D6-\u06ED]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .trim();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const normalizedQuery = normalizeArabic(query.toLowerCase());
    const words = text.split(' ');

    return words.map((word, i) => {
      const normalizedWord = normalizeArabic(word.toLowerCase());
      if (normalizedWord.includes(normalizedQuery)) {
        return (
          <span key={i} className="text-primary drop-shadow-glow-primary font-black">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  const filteredSurahs = useMemo(() => {
    const query = normalizeArabic(searchQuery.toLowerCase());
    if (!query) return surahs;

    return surahs.filter(s =>
      normalizeArabic(s.name).includes(query) ||
      s.englishName.toLowerCase().includes(query) ||
      s.number.toString() === query
    );
  }, [surahs, searchQuery]);

  const semanticResults = useMemo(() => {
    const query = normalizeArabic(searchQuery.trim().toLowerCase());
    if (!query || query.length < 2) return [];

    const foundTopic = SEMANTIC_TOPICS.find(topic =>
      topic.keywords.some(keyword => query.includes(normalizeArabic(keyword)) || normalizeArabic(keyword).includes(query))
    );

    if (!foundTopic) return [];

    return foundTopic.ayahs.map((a, index) => {
      const surahObj = surahs.find(s => s.number === a.surah);
      const surahName = surahObj ? surahObj.name : 'سورة مجهولة';
      return {
        id: a.surah * 1000 + a.ayah,
        surah: surahName,
        surahNumber: a.surah,
        ayahNumber: a.ayah.toString(),
        arabic: a.text,
        tafseer: `مطابقة دلالية لموضوع: ${foundTopic.title}`,
        type: 'verse',
        isSemantic: true,
        semanticTitle: foundTopic.title
      };
    });
  }, [searchQuery, surahs]);

  const searchResults = useMemo(() => {
    const query = normalizeArabic(searchQuery.trim());
    if (!query || query.length < 2) return [];

    const results: any[] = [];

    // 0. Prepend Semantic Results
    semanticResults.forEach(v => {
      results.push({
        ...v,
        accentColor: 'text-emerald-400',
        border: 'border-emerald-500/20'
      });
    });

    // 1. Search in global results first (most accurate for broad search)
    globalResults.forEach(v => {
      if (!results.some(r => r.surahNumber === v.surahNumber && r.ayahNumber.toString() === v.ayahNumber.toString())) {
        results.push({
          ...v,
          type: 'verse',
          accentColor: 'text-primary',
          border: 'border-primary/20',
          isGlobal: true
        });
      }
    });

    // 2. Search in selected collections
    if (results.length < 10) {
      QURAN_DATA.forEach(col => {
        col.verses.forEach(v => {
          if (normalizeArabic(v.arabic).includes(query) || normalizeArabic(v.tafseer).includes(query)) {
            if (!results.some(r => r.surahNumber === v.surahNumber && r.ayahNumber.toString() === v.ayahNumber.toString())) {
              results.push({ ...v, type: 'verse', accentColor: col.color, border: col.border });
            }
          }
        });
      });
    }

    // 3. Search in currently loaded surah content
    if (surahContent.length > 0 && results.length < 15) {
      surahContent.forEach(v => {
        if (normalizeArabic(v.arabic).includes(query) || normalizeArabic(v.tafseer).includes(query)) {
          if (!results.some(r => r.surahNumber === v.surahNumber && r.ayahNumber.toString() === v.ayahNumber.toString())) {
            results.push({ ...v, type: 'verse', accentColor: 'text-primary', border: 'border-primary/20' });
          }
        }
      });
    }

    return results.slice(0, 30);
  }, [searchQuery, surahContent, globalResults, semanticResults]);

  // Global Search Effect (Debounced)
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setGlobalResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        // Save to history if query is significant
        if (query.length > 3) {
          setSearchHistory(prev => {
            const next = [query, ...prev.filter(h => h !== query)].slice(0, 6);
            localStorage.setItem('quran_search_history', JSON.stringify(next));
            return next;
          });
        }

        // Fetch BOTH Quran and Tafseer results for separate tabs
        const [quranRes, tafseerRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/search/${query}/all/quran-simple`),
          fetch(`https://api.alquran.cloud/v1/search/${query}/all/ar.muyassar`)
        ]);

        const [quranData, tafseerData] = await Promise.all([quranRes.json(), tafseerRes.json()]);

        if (quranData.data && quranData.data.matches) {
          setGlobalResults(quranData.data.matches.map((m: any) => ({
            id: m.number,
            surah: m.surah.name,
            surahNumber: m.surah.number,
            ayahNumber: m.numberInSurah,
            arabic: m.text,
            type: 'verse',
            page_number: m.page
          })));
        }

        if (tafseerData.data && tafseerData.data.matches) {
          setTafseerResults(tafseerData.data.matches.map((m: any) => ({
            id: m.number,
            surah: m.surah.name,
            surahNumber: m.surah.number,
            ayahNumber: m.numberInSurah,
            arabic: m.text,
            type: 'tafseer',
            page_number: m.page
          })));
        }
      } catch (e) {
        console.error("Global search failed", e);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchResultClick = (v: any) => {
    setView('full');
    setViewMode('ayah');
    setSelectedSurah(v.surahNumber);
    loadSurah(v.surahNumber);
    setSearchQuery('');

    let attempts = 0;
    const scrollInterval = setInterval(() => {
      const el = document.getElementById(`verse-${v.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-primary/40', 'ring-offset-8');
        setTimeout(() => el.classList.remove('ring-4', 'ring-primary/40', 'ring-offset-8'), 3000);
        clearInterval(scrollInterval);
      }
      if (attempts++ > 15) clearInterval(scrollInterval);
    }, 400);
  };

  const toggleBookmark = (verse: any) => {
    const currentBookmarks = state.favorites || [];
    const id = `quran_${verse.id}`;
    if (currentBookmarks.includes(id)) { updateState({ favorites: currentBookmarks.filter(b => b !== id) }); }
    else { updateState({ favorites: [...currentBookmarks, id] }); }
  };

  const updateMemorization = (surahNum: number, status: keyof typeof MEMORIZATION_STATUS) => {
    const currentProg = state.quranMemorization || {};
    updateState({ quranMemorization: { ...currentProg, [surahNum]: status } });
  };

  const memorizedVerses = useMemo(() => {
    const list: any[] = [];
    QURAN_DATA.forEach(col => {
      col.verses.forEach(v => {
        if (state.quranMemorization?.[v.surahNumber] === 'completed') {
          list.push(v);
        }
      });
    });
    return list;
  }, [state.quranMemorization]);

  const pages = useMemo(() => {
    if (!selectedSurah || surahContent.length === 0) return {};
    const grouped: { [key: number]: any[] } = {};
    surahContent.forEach((v: any) => {
      const p = v.page_number || 1;
      if (!grouped[p]) grouped[p] = [];
      grouped[p].push(v);
    });
    return grouped;
  }, [selectedSurah, surahContent]);

  const pageNumbers = useMemo(() => Object.keys(pages).map(Number).sort((a, b) => a - b), [pages]);

  // Touch gesture state and handlers for page flipping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const currentIndex = pageNumbers.indexOf(currentPage);
    if (currentIndex === -1) return;

    if (isLeftSwipe) {
      // Swiping left (finger moves left) -> previous page in RTL
      if (currentIndex > 0) {
        setCurrentPage(pageNumbers[currentIndex - 1]);
      }
    } else if (isRightSwipe) {
      // Swiping right (finger moves right) -> next page in RTL
      if (currentIndex < pageNumbers.length - 1) {
        setCurrentPage(pageNumbers[currentIndex + 1]);
      }
    }
  }, [touchStart, touchEnd, pageNumbers, currentPage]);

  const memorizationStats = useMemo(() => {
    const prog = state.quranMemorization || {};
    const completed = Object.values(prog).filter(s => s === 'completed' || s === 'reviewed').length;
    return { completed, percentage: Math.round((completed / 114) * 100) };
  }, [state.quranMemorization]);

  const handlePlayVerse = useCallback((verse: any) => {
    if (currentAudio?.id === verse.id) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { audioRef.current?.play(); setIsPlaying(true); }
      return;
    }

    // Stop radio if playing
    if (isPlayingRadio) {
      setIsPlayingRadio(false);
      radioAudioRef.current?.pause();
    }

    setCurrentAudio(verse);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = `https://cdn.islamic.network/quran/audio/128/${selectedReciter.id}/${verse.id}.mp3`;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
    }
  }, [selectedReciter, isPlaying, currentAudio, playbackSpeed, isPlayingRadio]);

  const handlePlayRadio = useCallback((station: any) => {
    if (currentRadioStation?.id === station.id) {
      if (isPlayingRadio) {
        radioAudioRef.current?.pause();
        setIsPlayingRadio(false);
      } else {
        setIsRadioBuffering(true);
        radioAudioRef.current?.play().catch(err => {
          console.error("Failed to play radio:", err);
          setIsPlayingRadio(false);
        });
        setIsPlayingRadio(true);
      }
      return;
    }

    // Stop recitation play if active
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }

    // Stop ambient sound if active
    if (activeAmbient) {
      setActiveAmbient(null);
    }

    setCurrentRadioStation(station);
    setIsPlayingRadio(true);
    setIsRadioBuffering(true);

    if (radioAudioRef.current) {
      radioAudioRef.current.src = station.url;
      radioAudioRef.current.volume = radioVolume;
      radioAudioRef.current.play().catch(err => {
        console.error("Failed to play radio stream:", err);
        setIsPlayingRadio(false);
        setIsRadioBuffering(false);
      });
    }
  }, [currentRadioStation, isPlayingRadio, isPlaying, activeAmbient, radioVolume]);

  const cleanArabicText = useCallback((text: string) => {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u065F\u06D6-\u06ED\u0670\u0671\u06E5\u06E6]/g, "") // remove tashkeel & quran stop signs
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/[\.\,\?\!\-\،\؛\؟]/g, "") // remove punctuation
      .replace(/\s+/g, " ")
      .trim();
  }, []);

  const compareRecitation = useCallback((spokenText: string, originalText: string) => {
    const origWords = originalText.split(/\s+/);
    const spokenWords = spokenText.split(/\s+/);

    const results = [];
    let sp = 0;
    let correctCount = 0;

    for (let i = 0; i < origWords.length; i++) {
      const origWord = origWords[i];
      const normOrig = cleanArabicText(origWord);

      let matched = false;
      // lookahead window of 4 words in spoken text
      for (let offset = 0; offset < 4; offset++) {
        const checkIndex = sp + offset;
        if (checkIndex < spokenWords.length) {
          const normSpoken = cleanArabicText(spokenWords[checkIndex]);
          if (normOrig === normSpoken || normOrig.includes(normSpoken) || normSpoken.includes(normOrig)) {
            matched = true;
            sp = checkIndex + 1;
            break;
          }
        }
      }

      if (matched) {
        results.push({ word: origWord, status: 'correct' });
        correctCount++;
      } else {
        results.push({ word: origWord, status: 'incorrect' });
      }
    }

    const percentage = origWords.length > 0 ? Math.round((correctCount / origWords.length) * 100) : 0;
    return { results, percentage };
  }, [cleanArabicText]);

  const startListeningRecitation = useCallback((verse: any) => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('متصفحك لا يدعم التحليل الصوتي المتقدم. يُرجى استخدام متصفح Chrome أو Edge.');
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }

    setTestVerse(verse);
    setIsTestingRecitation(true);
    setIsListeningRecitation(true);
    setTestWordsResult(null);
    setTestMatchPercentage(0);

    const recognition = new SpeechRecognitionAPI();
    voiceRecognitionRef.current = recognition;
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: any) => {
      let currentTranscript = '';
      for (let i = 0; i < e.results.length; ++i) {
        currentTranscript += e.results[i][0].transcript + ' ';
      }

      if (currentTranscript.trim()) {
        const { results, percentage } = compareRecitation(currentTranscript, verse.arabic);
        setTestWordsResult(results);
        setTestMatchPercentage(percentage);
      }
    };

    recognition.onend = () => setIsListeningRecitation(false);
    recognition.start();
  }, [compareRecitation, isPlaying]);

  const stopListeningRecitation = useCallback(() => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      voiceRecognitionRef.current = null;
    }
    setIsListeningRecitation(false);
  }, []);

  const handleAudioEnded = useCallback(() => {
    // 1. Verse Repetition
    if (verseRepetition > 1 && verseRepetitionCount < verseRepetition - 1) {
      setVerseRepetitionCount(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    } else {
      setVerseRepetitionCount(0);
    }

    // 2. Loop Verse (Legacy loop toggle)
    if (isLoop) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    // 3. Range Loop Active
    if (rangeLoopActive && rangeStartVerse && rangeEndVerse) {
      if (currentAudio?.id === rangeEndVerse.id) {
        if (rangeLoopCount + 1 < maxRangeLoop) {
          setRangeLoopCount(prev => prev + 1);
          handlePlayVerse(rangeStartVerse);
        } else {
          setIsPlaying(false);
          setRangeLoopCount(0);
        }
        return;
      } else {
        const idx = surahContent.findIndex(v => v.id === currentAudio?.id);
        if (idx !== -1 && idx < surahContent.length - 1) {
          const nextVerse = surahContent[idx + 1];
          if (nextVerse.id <= rangeEndVerse.id) {
            handlePlayVerse(nextVerse);
            return;
          }
        }
        setIsPlaying(false);
        return;
      }
    }

    // 4. Normal Autoplay
    if (playMode === 'single') {
      setIsPlaying(false);
      return;
    }

    let nextVerse = null;
    if (playMode === 'surah') {
      const idx = surahContent.findIndex(v => v.id === currentAudio?.id);
      if (idx !== -1 && idx < surahContent.length - 1) {
        nextVerse = surahContent[idx + 1];
        if (viewMode === 'page' && nextVerse.page && nextVerse.page !== currentPage) {
          setCurrentPage(nextVerse.page);
        }
      }
    } else {
      if (viewMode === 'ayah') {
        const idx = surahContent.findIndex(v => v.id === currentAudio?.id);
        if (idx !== -1 && idx < surahContent.length - 1) nextVerse = surahContent[idx + 1];
      } else {
        const currentPageVerses = pages[currentPage] || [];
        const idx = currentPageVerses.findIndex(v => v.id === currentAudio?.id);
        if (idx !== -1 && idx < currentPageVerses.length - 1) {
          nextVerse = currentPageVerses[idx + 1];
        } else {
          const pageIndex = pageNumbers.indexOf(currentPage);
          if (pageIndex !== -1 && pageIndex < pageNumbers.length - 1) {
            const nextPage = pageNumbers[pageIndex + 1];
            setCurrentPage(nextPage);
            const nextPageVerses = pages[nextPage] || [];
            if (nextPageVerses.length > 0) {
              nextVerse = nextPageVerses[0];
            }
          }
        }
      }
    }

    if (nextVerse) {
      if (pauseSecondsBetweenAyahs > 0) {
        // Clear any previous pause timer
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
          handlePlayVerse(nextVerse);
        }, pauseSecondsBetweenAyahs * 1000);
      } else {
        handlePlayVerse(nextVerse);
      }
    } else {
      setIsPlaying(false);
    }
  }, [
    verseRepetition,
    verseRepetitionCount,
    isLoop,
    rangeLoopActive,
    rangeStartVerse,
    rangeEndVerse,
    rangeLoopCount,
    maxRangeLoop,
    playMode,
    viewMode,
    surahContent,
    pages,
    currentPage,
    pageNumbers,
    currentAudio,
    handlePlayVerse,
    pauseSecondsBetweenAyahs
  ]);



  const activatePlan = (planId: string) => {
    if (planId === 'custom') {
      setIsCustomPlanModalOpen(true);
      return;
    }
    updateState({
      activeMemoPlan: {
        planId,
        startDate: new Date().toISOString(),
        dailyReminderTime: '08:00'
      }
    });
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  const handleExamComplete = (points: number) => {
    updateState({ points: (state.points || 0) + points });
  };

  const handleSendChatMessage = async (customPrompt?: string) => {
    const text = customPrompt || chatInput;
    if (!text.trim() || !activeChatVerse) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Filter out the initial greeting so that the Gemini API chat history starts with a user message
      const apiMessages = updatedMessages.filter((m, idx) => !(idx === 0 && m.role === 'model'));

      // 1. Try sending to the local Gemini endpoint /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: `أنت عالم ومفسر إسلامي خبير ومتخصص في بلاغة القرآن الكريم، أسباب النزول، والدروس الدعوية والتربوية المستفادة.
أنت تساعد المستخدم حالياً في تدبر وتأمل هذه الآية الكريمة:
- السورة: سورة ${activeChatVerse.surah} (رقم السورة: ${activeChatVerse.surahNumber})
- الآية: آية رقم ${activeChatVerse.ayahNumber}
- نص الآية بالرسم العثماني: "${activeChatVerse.arabic}"
- التفسير الميسر المعتمد للآية: "${activeChatVerse.tafseer}"
- ترجمة الآية المعتمدة: "${activeChatVerse.translation || 'غير متوفرة حالياً'}"

توجيهات مهمة للإجابة:
1. التزم بالمنهج الإسلامي الوسطي المعتمد في التفسير والتدبر.
2. أجب باللغة العربية الفصحى المبسطة بأسلوب حواري دافئ، محبب وميسر للقلوب.
3. إذا سألك المستخدم عن البلاغة، فركّز على مواطن الجمال اللغوي، التقديم والتأخير، إعجاز الألفاظ، والطباق أو السجع القرآني الفريد.
4. إذا سألك عن سبب النزول، اعتمد على الأحاديث والروايات الصحيحة المأثورة في أسباب النزول.
5. إذا سألك عن الدروس، فاستنبط له فوائد عملية يمكنه تطبيقها في حياته اليومية وعلاقته بالله ومع الناس.
6. لا تجب عن أي أسئلة خارج نطاق الدين الإسلامي، وتدبر الآية الكريمة المعطاة.`,
          messages: apiMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          }))
        })
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setChatMessages(prev => [...prev, { role: 'model', content: data.text }]);
        setChatConnectionMode('online');
      } else {
        throw new Error(data.error || "ONLINE_API_FAILED");
      }
    } catch (err: any) {
      console.warn("AI Chat API failed, using local scholar database:", err);
      setChatConnectionMode('local');

      let explanation = '';
      const key = `${activeChatVerse.surahNumber}:${activeChatVerse.ayahNumber}`;
      const lowerText = text.toLowerCase();

      const localData = LOCAL_SCHOLAR_DB[key] || null;

      if (lowerText.includes('بلاغة') || lowerText.includes('إعجاز') || lowerText.includes('جمال')) {
        explanation = localData?.rhetoric || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'rhetoric');
      } else if (lowerText.includes('نزول') || lowerText.includes('سبب')) {
        explanation = localData?.revelation || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'revelation');
      } else if (lowerText.includes('درس') || lowerText.includes('دروس') || lowerText.includes('عبر') || lowerText.includes('مستفاد')) {
        explanation = localData?.lessons || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'lessons');
      } else {
        explanation = `أهلاً بك في رفيق التفسير والتدبر المحلي. إليك تفصيل لآية ${activeChatVerse.ayahNumber} من سورة ${activeChatVerse.surah}:\n\n` +
          `**✨ بلاغة الآية:**\n${localData?.rhetoric || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'rhetoric')}\n\n` +
          `**📜 سبب النزول:**\n${localData?.revelation || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'revelation')}\n\n` +
          `**💡 الدروس والعبر:**\n${localData?.lessons || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'lessons')}`;
      }

      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'model', content: explanation }]);
      }, 500);
    } finally {
      setIsChatLoading(false);
    }
  };

  const startTafseerChat = (verse: any) => {
    setActiveChatVerse(verse);
    setChatMessages([
      {
        role: 'model',
        content: `أهلاً بك في **مساعد التفسير والتدبر الذكي** 🤖 لآية **${verse.ayahNumber}** من **سورة ${verse.surah}**.\n\nيمكنني مساعدتك في استكشاف بلاغة الآية، سبب نزولها، واستنباط الدروس المستفادة. اختر أحد الأسئلة الجاهزة بالأسفل أو اكتب سؤالك الخاص!`
      }
    ]);
    setChatInput('');
    setIsChatLoading(false);
    setChatConnectionMode('online');
  };

  const saveCustomPlan = () => {
    let pagesPerDay = customPagesInput;
    let months = 0;
    if (customPlanType === 'duration') {
      months = customDurationInput;
      pagesPerDay = Math.round((604 / (months * 30)) * 10) / 10;
    }
    updateState({
      activeMemoPlan: {
        planId: 'custom',
        startDate: new Date().toISOString(),
        dailyReminderTime: '08:00',
        customPagesPerDay: pagesPerDay,
        customMonths: months
      }
    });
    setIsCustomPlanModalOpen(false);
  };

  const getDailyWord = useCallback(() => {
    if (!state.activeMemoPlan) return null;
    const plan = MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId);
    if (!plan) return { page: 1, surah: 'البقرة' };

    let pagesPerDay = plan.pagesPerDay;
    if (plan.id === 'custom') {
      pagesPerDay = state.activeMemoPlan.customPagesPerDay || 1.0;
    }

    const start = new Date(state.activeMemoPlan.startDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));

    const targetPage = Math.min(604, Math.floor(diffDays * pagesPerDay) + 1);

    // Simple lookup for surah based on page (could be more precise with a full map)
    let surah = 'البقرة';
    if (targetPage > 582) surah = 'النبأ';
    else if (targetPage > 562) surah = 'الملك';
    else if (targetPage > 526) surah = 'الواقعة';
    else if (targetPage > 499) surah = 'الأحقاف';
    else if (targetPage > 440) surah = 'يس';
    else if (targetPage > 282) surah = 'الإسراء';
    else if (targetPage > 177) surah = 'الأعراف';

    return { page: targetPage, surah };
  }, [state.activeMemoPlan]);

  const dailyWord = useMemo(() => getDailyWord(), [getDailyWord]);

  useEffect(() => {
    if (pageNumbers.length > 0 && !pageNumbers.includes(currentPage)) {
      setCurrentPage(pageNumbers[0]);
    }
  }, [pageNumbers, currentPage]);

  const handleShare = useCallback((verse: any) => {
    setSharingVerse({ ...verse, fontClass: selectedScript.font });
  }, [selectedScript]);

  const streak = useMemo(() => {
    // Simple streak logic (could be more complex with actual dates)
    return memorizationStats.completed > 0 ? (memorizationStats.completed % 7) + 1 : 0;
  }, [memorizationStats]);

  const filteredStations = useMemo(() => {
    let list = RADIO_STATIONS;
    if (radioSearchQuery.trim()) {
      const q = normalizeArabic(radioSearchQuery.toLowerCase());
      list = list.filter(s =>
        normalizeArabic(s.name).includes(q) ||
        s.subtitle.toLowerCase().includes(q)
      );
    }
    // Sort so that favorites are pinned at the top
    return [...list].sort((a, b) => {
      const aFav = favoriteRadioIds.includes(a.id) ? 1 : 0;
      const bFav = favoriteRadioIds.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [radioSearchQuery, favoriteRadioIds]);

  const handleWordClick = async (verse: any, wordIndex: number) => {
    // verse.surahNumber must be available. If not, we might need a lookup, but it should be available.
    const sNum = verse.surahNumber || QURAN_DATA.find(c => c.verses.some(v => v.id === verse.id))?.verses.find(v => v.id === verse.id)?.surahNumber || 2;

    setActiveWordAnalysis({ verse, wordIndex, loading: true });
    try {
      // language=ar gives Arabic translation, text_uthmani for clean display
      const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${sNum}:${verse.ayahNumber}?language=ar&words=true&word_fields=text_uthmani,translation,transliteration`);
      const data = await res.json();
      const apiWords = data.verse.words;
      // Map frontend clicked word to API word array. API array often includes the end symbol as a word.
      const wordData = apiWords[wordIndex] || apiWords[apiWords.length - 2];

      setActiveWordAnalysis({ verse, wordIndex, wordData, loading: false });
    } catch (e) {
      setActiveWordAnalysis({ verse, wordIndex, error: true, loading: false });
    }
  };

  return (
    <div className="min-h-screen pb-40">
      <div className="fixed top-0 left-0 w-full h-1 z-[250] pointer-events-none">
        <motion.div className="h-full bg-primary shadow-glow-primary" style={{ width: `${scrollProgress}%` }} />
      </div>

      <audio ref={audioRef} onEnded={handleAudioEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
      <audio
        ref={radioAudioRef}
        onPlay={() => {
          setIsPlayingRadio(true);
          setIsRadioBuffering(false);
        }}
        onPause={() => setIsPlayingRadio(false)}
        onWaiting={() => setIsRadioBuffering(true)}
        onPlaying={() => setIsRadioBuffering(false)}
        onCanPlay={() => setIsRadioBuffering(false)}
      />

      {/* ═══════════════════ FIXED TOP BAR ═══════════════════ */}
      <div className="fixed top-1 left-1/2 -translate-x-1/2 z-[200] w-[98%] max-w-7xl">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_10px_50px_-10px_rgba(0,0,0,0.8)] px-4 md:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Right: View Mode & Tajweed */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTajweedGuideOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e1b4b]/40 text-purple-300 border border-purple-900/30 hover:bg-[#1e1b4b]/60 hover:text-white transition-all text-[9px] font-black"
              >
                📖 التجويد
              </button>
              <button
                onClick={() => setIsTypographyPanelOpen(p => !p)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-2 rounded-xl transition-all text-[9px] font-black border",
                  isTypographyPanelOpen
                    ? "bg-primary/20 border-primary/45 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                )}
                title="تغيير حجم الخط والتباعد"
              >
                <span>Aa حجم الخط</span>
              </button>
              <div className={cn("flex bg-white/5 border border-white/10 rounded-xl p-1", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
                <button onClick={() => setViewMode('ayah')} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", viewMode === 'ayah' ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/30 hover:text-white")}>آيات</button>
                <button onClick={() => setViewMode('page')} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", viewMode === 'page' ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/30 hover:text-white")}>صفحة</button>
              </div>
            </div>

            {/* Center: Main Tabs */}
            <div className={cn("flex items-center gap-1.5 flex-1 justify-center overflow-x-auto no-scrollbar", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              {['full', 'plan', 'luminous', 'radio'].map((v: any) => (
                <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={cn(
                    "px-4 md:px-6 py-2 rounded-xl font-black text-[10px] md:text-xs transition-all border relative overflow-hidden whitespace-nowrap",
                    view === v ? "bg-white text-black border-white shadow-glow-white" : "bg-white/5 text-white/30 border-white/5 hover:bg-white/10"
                  )}
                >
                  {v === 'full' ? 'المصحف كاملاً' : v === 'luminous' ? 'المصحف المضيء' : v === 'plan' ? 'خطة الحفظ' : 'إذاعة القرآن'}
                </button>
              ))}
            </div>

            {/* Left: Reading Mode */}
            <div className="shrink-0">
              <ReadingModeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* ── Quran Nav Drawer ── */}
      <QuranNavDrawer
        isOpen={navDrawerOpen}
        activeTab={navDrawerTab}
        onClose={() => setNavDrawerOpen(false)}
        onTabChange={setNavDrawerTab}
        surahs={surahs}
        currentPage={currentPage}
        selectedSurah={selectedSurah}
        onSelectSurah={(n) => { loadSurah(n); setView('full'); setViewMode('ayah'); }}
        onSelectJuzPage={(page) => { setCurrentPage(page); setView('full'); setViewMode('page'); }}
        bookmarks={state.favorites || []}
        onSelectBookmark={(id) => { /* scroll to verse */ }}
      />

      {/* ── 3 Floating Nav Strip Buttons ── */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[390] flex flex-col gap-1" dir="ltr">
        {/* Strip 1 — السور */}
        <button
          onClick={() => { setNavDrawerTab('surahs'); setNavDrawerOpen(true); }}
          className="group flex items-center gap-0 overflow-hidden rounded-l-2xl transition-all duration-300 hover:gap-2 bg-[#1a1208] border border-amber-900/40 border-r-0 hover:bg-[#2a1e0a] shadow-xl"
          title="قائمة السور"
        >
          <span className="text-[10px] font-black text-amber-400/80 group-hover:text-amber-300 whitespace-nowrap max-w-0 group-hover:max-w-[60px] overflow-hidden transition-all duration-300 pl-3">
            السور
          </span>
          <div className="w-9 h-12 flex items-center justify-center shrink-0">
            <div className="flex flex-col gap-[3px]">
              <span className="block w-4 h-[2px] bg-amber-500/70 rounded-full group-hover:bg-amber-400 transition-colors" />
              <span className="block w-4 h-[2px] bg-amber-500/70 rounded-full group-hover:bg-amber-400 transition-colors" />
              <span className="block w-4 h-[2px] bg-amber-500/70 rounded-full group-hover:bg-amber-400 transition-colors" />
            </div>
          </div>
        </button>

        {/* Strip 2 — الأجزاء */}
        <button
          onClick={() => { setNavDrawerTab('juz'); setNavDrawerOpen(true); }}
          className="group flex items-center gap-0 overflow-hidden rounded-l-2xl transition-all duration-300 hover:gap-2 bg-[#0a1810] border border-emerald-900/40 border-r-0 hover:bg-[#0e2416] shadow-xl"
          title="قائمة الأجزاء"
        >
          <span className="text-[10px] font-black text-emerald-400/80 group-hover:text-emerald-300 whitespace-nowrap max-w-0 group-hover:max-w-[60px] overflow-hidden transition-all duration-300 pl-3">
            الأجزاء
          </span>
          <div className="w-9 h-12 flex items-center justify-center shrink-0">
            <div className="flex flex-col gap-[3px]">
              <span className="block w-4 h-[2px] bg-emerald-500/70 rounded-full group-hover:bg-emerald-400 transition-colors" />
              <span className="block w-3 h-[2px] bg-emerald-500/70 rounded-full group-hover:bg-emerald-400 transition-colors" />
              <span className="block w-4 h-[2px] bg-emerald-500/70 rounded-full group-hover:bg-emerald-400 transition-colors" />
            </div>
          </div>
        </button>

        {/* Strip 3 — علامات */}
        <button
          onClick={() => { setNavDrawerTab('bookmarks'); setNavDrawerOpen(true); }}
          className="group flex items-center gap-0 overflow-hidden rounded-l-2xl transition-all duration-300 hover:gap-2 bg-[#150a18] border border-purple-900/40 border-r-0 hover:bg-[#1e1020] shadow-xl"
          title="العلامات المرجعية"
        >
          <span className="text-[10px] font-black text-purple-400/80 group-hover:text-purple-300 whitespace-nowrap max-w-0 group-hover:max-w-[60px] overflow-hidden transition-all duration-300 pl-3">
            علامات
          </span>
          <div className="w-9 h-12 flex items-center justify-center shrink-0">
            <Bookmark className="w-3.5 h-3.5 text-purple-500/70 group-hover:text-purple-400 transition-colors" />
          </div>
        </button>
      </div>
      <AnimatePresence>
        {sharingVerse && <ShareModal verse={sharingVerse} onClose={() => setSharingVerse(null)} />}
        {isExamOpen && <ExamModal memorizedVerses={memorizedVerses} onClose={() => setIsExamOpen(false)} onComplete={handleExamComplete} />}
        {activeSurahInfo && <SurahInfoModal surah={activeSurahInfo} onClose={() => setActiveSurahInfo(null)} />}
        {activeWordAnalysis && <WordAnalysisModal analysis={activeWordAnalysis} onClose={() => setActiveWordAnalysis(null)} />}
        {isCustomPlanModalOpen && (
          <CustomPlanModal
            onClose={() => setIsCustomPlanModalOpen(false)}
            customPagesInput={customPagesInput}
            setCustomPagesInput={setCustomPagesInput}
            customDurationInput={customDurationInput}
            setCustomDurationInput={setCustomDurationInput}
            customPlanType={customPlanType}
            setCustomPlanType={setCustomPlanType}
            onSave={saveCustomPlan}
          />
        )}
        {isTajweedGuideOpen && <TajweedGuideModal onClose={() => setIsTajweedGuideOpen(false)} />}
        {activeChatVerse && (
          <TafseerChatModal
            verse={activeChatVerse}
            messages={chatMessages}
            isListLoading={isChatLoading}
            connectionMode={chatConnectionMode}
            onClose={() => setActiveChatVerse(null)}
            onSendMessage={handleSendChatMessage}
            chatInput={chatInput}
            setChatInput={setChatInput}
          />
        )}
      </AnimatePresence>

      {/* ════════════ TYPOGRAPHY PANEL BUTTON ════════════ */}
      <button
        onClick={() => setIsTypographyPanelOpen(p => !p)}
        className={cn(
          "fixed right-0 bottom-36 z-[390] group flex items-center gap-0 overflow-hidden rounded-l-2xl transition-all duration-300 hover:gap-2 border border-r-0 shadow-xl",
          isTypographyPanelOpen
            ? "bg-primary/20 border-primary/50 text-primary"
            : "bg-[#0a120a] border-emerald-900/40 hover:bg-[#0f1f0f] text-emerald-400/80 hover:text-emerald-300"
        )}
        title="لوحة تحكم الخطوط"
      >
        <span className="text-[10px] font-black whitespace-nowrap max-w-0 group-hover:max-w-[80px] overflow-hidden transition-all duration-300 pl-3">
          الخطوط
        </span>
        <div className="w-9 h-12 flex items-center justify-center shrink-0">
          <span className="text-base font-black">Aa</span>
        </div>
      </button>

      {/* ════════════ TYPOGRAPHY PANEL ════════════ */}
      <AnimatePresence>
        {isTypographyPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-12 bottom-16 z-[389] w-80 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-black text-white flex items-center gap-2.5">
                <span className="text-xl">Aa</span>
                <span>محرّك الخط القرآني</span>
              </h3>
              <button onClick={() => setIsTypographyPanelOpen(false)} className="p-1.5 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview */}
            <div className="mx-5 mt-5 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">معاينة مباشرة</p>
              <span
                dir="rtl"
                style={{
                  fontSize: `${typoFontSize}px`,
                  fontWeight: typoFontWeight,
                  lineHeight: typoLineHeight,
                  letterSpacing: `${typoLetterSpacing}em`,
                  wordSpacing: `${typoWordSpacing}px`
                }}
                className="text-white/90 leading-loose block"
              >
                بِسْمِ اللَّهِ
              </span>
            </div>

            {/* Controls */}
            <div className="p-5 flex flex-col gap-5">

              {/* Font Size */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">حجم الخط</span>
                  <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{typoFontSize}px</span>
                </div>
                <input
                  type="range" min={20} max={72} step={2}
                  value={typoFontSize}
                  onChange={e => setTypoFontSize(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 rounded-full cursor-pointer bg-white/10"
                />
                <div className="flex justify-between text-[9px] text-white/20 font-black">
                  <span>20px</span><span>72px</span>
                </div>
              </div>

              {/* Font Weight */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">سماكة الخط</span>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">{typoFontWeight}</span>
                </div>
                <input
                  type="range" min={100} max={900} step={100}
                  value={typoFontWeight}
                  onChange={e => setTypoFontWeight(Number(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 rounded-full cursor-pointer bg-white/10"
                />
                <div className="flex justify-between text-[9px] text-white/20 font-black">
                  <span>رفيع</span><span>عادي</span><span>عريض</span>
                </div>
              </div>

              {/* Line Height */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">تباعد الأسطر</span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{typoLineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range" min={1.2} max={4.0} step={0.1}
                  value={typoLineHeight}
                  onChange={e => setTypoLineHeight(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 rounded-full cursor-pointer bg-white/10"
                />
                <div className="flex justify-between text-[9px] text-white/20 font-black">
                  <span>مضغوط</span><span>متسع</span>
                </div>
              </div>

              {/* Word Spacing */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">تباعد الكلمات</span>
                  <span className="text-xs font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg">{typoWordSpacing}px</span>
                </div>
                <input
                  type="range" min={0} max={30} step={1}
                  value={typoWordSpacing}
                  onChange={e => setTypoWordSpacing(Number(e.target.value))}
                  className="w-full accent-violet-400 h-1.5 rounded-full cursor-pointer bg-white/10"
                />
              </div>

              {/* Letter Spacing (Kashida) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">تمديد الحروف (كشيدة)</span>
                  <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg">{typoLetterSpacing.toFixed(2)}em</span>
                </div>
                <input
                  type="range" min={0} max={0.3} step={0.01}
                  value={typoLetterSpacing}
                  onChange={e => setTypoLetterSpacing(Number(e.target.value))}
                  className="w-full accent-rose-400 h-1.5 rounded-full cursor-pointer bg-white/10"
                />
              </div>

              {/* Reset */}
              <button
                onClick={() => { setTypoFontWeight(400); setTypoLineHeight(2.3); setTypoWordSpacing(0); setTypoLetterSpacing(0); setTypoFontSize(32); }}
                className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-xs font-black mt-1"
              >
                ↺ إعادة الضبط الافتراضي
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container relative z-10 px-4 pt-24">
        {/* ═══ Contextual Toolbar ═══ */}
        <div className={cn("mb-10 p-4 rounded-[2rem] bg-white/[0.02] border border-white/5 transition-all", isReadingMode && "opacity-0 h-0 overflow-hidden mb-0 pointer-events-none")}>
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {/* Tafseer Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">التفسير الحالي</p><p className="text-xs font-bold text-white">{selectedTafseer.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                  {TAFSEERS.map(t => (<button key={t.id} onClick={() => setSelectedTafseer(t)} className={cn("w-full text-right p-4 rounded-xl text-xs font-bold transition-all", selectedTafseer.id === t.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/5 hover:text-white")}>{t.name}</button>))}
                </div>
              </div>
            </div>

            {/* Translation Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">الترجمة الحالية</p><p className="text-xs font-bold text-white">{selectedTranslation.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Languages className="w-5 h-5" /></div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                  {TRANSLATIONS.map(t => (<button key={t.id} onClick={() => setSelectedTranslation(t)} className={cn("w-full text-right p-4 rounded-xl text-xs font-bold transition-all", selectedTranslation.id === t.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/5 hover:text-white")}>{t.name}</button>))}
                </div>
              </div>
            </div>

            {/* Script Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">نوع الرسم</p><p className="text-xs font-bold text-white">{selectedScript.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><AlignRight className="w-5 h-5" /></div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] right-0 pt-3 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[75]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                  {SCRIPTS.map(s => (<button key={s.id} onClick={() => setSelectedScript(s)} className={cn("w-full text-right p-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between", selectedScript.id === s.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/5 hover:text-white")}><span>{s.name}</span>{selectedScript.id === s.id && <Check className="w-3 h-3" />}</button>))}
                </div>
              </div>
            </div>

            {/* Comparison Mode Toggle */}
            <div className={cn("relative transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <button
                onClick={() => setIsComparisonMode(!isComparisonMode)}
                className={cn(
                  "flex items-center gap-3 border rounded-2xl p-2 pr-4 transition-all hover:bg-white/10 cursor-pointer text-right",
                  isComparisonMode
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
                title="تفعيل مقارنة التراجم والتفاسير جنبًا إلى جنب"
              >
                <div className="text-right">
                  <p className="text-[8px] font-black opacity-55 uppercase tracking-widest">شاشة المقارنة</p>
                  <p className="text-xs font-bold">{isComparisonMode ? "مقارنة نشطة" : "مقارنة مغلقة"}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", isComparisonMode ? "bg-amber-500/30 text-amber-300" : "bg-primary/20 text-primary")}>
                  <LayoutGrid className="w-5 h-5" />
                </div>
              </button>
            </div>

            {/* Memorization Test Mode Toggle */}
            <div className={cn("relative transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <button
                onClick={() => setIsHideRevealMode(!isHideRevealMode)}
                className={cn(
                  "flex items-center gap-3 border rounded-2xl p-2 pr-4 transition-all hover:bg-white/10 cursor-pointer text-right",
                  isHideRevealMode
                    ? "bg-violet-500/20 border-violet-500/30 text-violet-300 hover:bg-violet-500/30"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
                title="تفعيل وضع اختبار الحفظ (إخفاء/إظهار الكلمات)"
              >
                <div className="text-right">
                  <p className="text-[8px] font-black opacity-55 uppercase tracking-widest">اختبار الحفظ</p>
                  <p className="text-xs font-bold">{isHideRevealMode ? "وضع الإخفاء نشط" : "وضع الإخفاء مغلق"}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", isHideRevealMode ? "bg-violet-500/30 text-violet-300" : "bg-primary/20 text-primary")}>
                  <EyeOff className="w-5 h-5" />
                </div>
              </button>
            </div>

            {isComparisonMode && (
              <>
                {/* Secondary Tafseer Selector */}
                <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
                  <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-2 pr-4 hover:bg-amber-500/10 cursor-pointer">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-amber-400/50 uppercase tracking-widest">التفسير المقارن</p>
                      <p className="text-xs font-bold text-amber-300">{selectedSecondaryTafseer.name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300"><FileText className="w-5 h-5" /></div>
                    <ChevronDown className="w-4 h-4 text-amber-300/40 mr-2" />
                  </div>
                  <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                    <div className="bg-[#0a0a0a] border border-amber-500/25 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                      {TAFSEERS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedSecondaryTafseer(t)}
                          className={cn(
                            "w-full text-right p-4 rounded-xl text-xs font-bold transition-all",
                            selectedSecondaryTafseer.id === t.id ? "bg-amber-500 text-black font-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secondary Translation Selector */}
                <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
                  <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-2 pr-4 hover:bg-amber-500/10 cursor-pointer">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-amber-400/50 uppercase tracking-widest">الترجمة المقارنة</p>
                      <p className="text-xs font-bold text-amber-300">{selectedSecondaryTranslation.name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300"><Languages className="w-5 h-5" /></div>
                    <ChevronDown className="w-4 h-4 text-amber-300/40 mr-2" />
                  </div>
                  <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                    <div className="bg-[#0a0a0a] border border-amber-500/25 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                      {TRANSLATIONS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedSecondaryTranslation(t)}
                          className={cn(
                            "w-full text-right p-4 rounded-xl text-xs font-bold transition-all",
                            selectedSecondaryTranslation.id === t.id ? "bg-amber-500 text-black font-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}


            {/* Reciter Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">القارئ الحالي</p><p className="text-xs font-bold text-white">{selectedReciter.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">{selectedReciter.icon}</div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] left-0 pt-3 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[70]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-3 shadow-3xl backdrop-blur-3xl">
                  <div className="grid gap-1">{RECITERS.map(r => (<button key={r.id} onClick={() => setSelectedReciter(r)} className={cn("flex items-center justify-between p-4 rounded-2xl transition-all", selectedReciter.id === r.id ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-white/40 hover:text-white")}><span className="font-bold text-sm">{r.name}</span><span className="text-lg">{r.icon}</span></button>))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Surahs ── */}
        {!isReadingMode && !selectedSurah && recentSurahs.length > 0 && (
          <div className="w-full mb-10 overflow-hidden">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2 px-4"><History className="w-3.5 h-3.5" /> استكمل قراءتك</p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
              {recentSurahs.map(num => {
                const surah = surahs.find(s => s.number === num);
                if (!surah) return null;
                return (<button key={num} onClick={() => loadSurah(num)} className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl hover:bg-white/10 hover:border-primary/20 transition-all whitespace-nowrap"><span className="w-8 h-8 rounded-lg bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center">{num}</span><span className="font-bold text-sm">{surah.name}</span></button>);
              })}
            </div>
          </div>
        )}

        {/* ── Dashboard Bento Grid ── */}
        {!isReadingMode && !selectedSurah && view === 'full' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Memorization Progress (Large, spans 2 columns) */}
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group hover:border-white/20 transition-all cursor-default shadow-3xl">
              <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-primary to-emerald-400 w-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full gap-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-primary border border-primary/20"><Trophy className="w-8 h-8 text-primary" /></div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">إنجاز الحفظ</h3>
                      <p className="text-white/40 text-sm font-bold flex items-center gap-2">
                        المصحف كاملاً
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        114 سورة
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary group-hover:bg-primary/10 transition-all cursor-help relative" title="النسبة المئوية لما أتممت حفظه من إجمالي سور القرآن الكريم.">
                    <Info className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-end justify-between">
                    <span className="text-6xl font-black text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">{memorizationStats.percentage}%</span>
                    <span className="text-sm font-black text-white/40 uppercase tracking-widest mb-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">تم حفظ {memorizationStats.completed} سورة</span>
                  </div>
                  <div className="h-5 bg-black rounded-full overflow-hidden border border-white/10 relative p-1 shadow-inner">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${memorizationStats.percentage}%` }} className="h-full bg-gradient-to-r from-primary to-emerald-400 shadow-glow-primary rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Streak Card (Square) */}
            <div className="bg-gradient-to-br from-[#1c0a00] to-[#0a0400] border border-orange-500/20 rounded-[3rem] p-8 relative overflow-hidden group hover:border-orange-500/40 hover:shadow-[0_0_50px_-15px_rgba(249,115,22,0.3)] transition-all cursor-default flex flex-col justify-center items-center text-center shadow-3xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay pointer-events-none" />

              <div className="w-24 h-24 rounded-full bg-gradient-to-t from-orange-500/10 to-orange-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-orange-500/20 relative">
                <Flame className="w-12 h-12 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,1)] z-10" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
              </div>

              <h4 className="text-5xl font-black text-white mb-2 drop-shadow-md">{streak}</h4>
              <p className="text-orange-500/80 text-[10px] font-black uppercase tracking-[0.3em]">أيام متتالية</p>

              {/* Tooltip / Motivation */}
              <div className="absolute bottom-6 px-5 py-2.5 bg-orange-500/10 backdrop-blur-md rounded-full border border-orange-500/20 text-[10px] font-black text-orange-200 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-xl">
                حافظ على وردك اليومي 🔥
              </div>
            </div>

            {/* Quick Access / Plan Cards */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer shadow-xl" onClick={() => setView('plan')}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shadow-inner"><Target className="w-6 h-6 text-blue-400" /></div>
                  <div>
                    <h4 className="text-white font-black text-sm mb-1">الخطة الحالية</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">ختمة في سنة</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer shadow-xl" onClick={() => { setNavDrawerOpen(true); setNavDrawerTab('bookmarks'); }}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shadow-inner"><BookmarkCheck className="w-6 h-6 text-emerald-400" /></div>
                  <div>
                    <h4 className="text-white font-black text-sm mb-1">الآيات المحفوظة</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">راجع وردك اليومي</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ── Daily Verse ── */}
        {!isReadingMode && !selectedSurah && view === 'full' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-20 group">
            <div className="relative rounded-[3.5rem] p-1.5 bg-gradient-to-br from-primary/30 via-primary/5 to-transparent border border-primary/10">
              <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[3.4rem] p-10 md:p-14 overflow-hidden relative">
                <Quote className="absolute -top-10 -left-10 w-40 h-40 text-primary/5 -rotate-12" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10">آيـة الـيـوم الملهمة</div>
                  {dailyVerse ? (
                    <>
                      <p
                        className={cn("text-3xl md:text-5xl text-white/90 mb-10 text-center", selectedScript.font)}
                        style={{ lineHeight: '2.5', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                      >
                        {dailyVerse.arabic}
                      </p>
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-white/40 text-sm leading-relaxed max-w-2xl italic">"{dailyVerse.tafseer}"</p>
                        <div className="h-px w-20 bg-primary/20 my-2" />
                        <span className="text-primary font-black text-xs uppercase tracking-widest font-tajawal">
                          سورة {dailyVerse.surah} • آية {dailyVerse.ayahNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-10">
                        <button onClick={() => handleShare(dailyVerse)} className="w-14 h-14 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:text-primary transition-all"><ImageIcon className="w-6 h-6" /></button>
                        <button onClick={() => handlePlayVerse(dailyVerse)} className="w-20 h-20 rounded-[2.5rem] bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-glow-primary">{currentAudio?.id === dailyVerse.id && isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}</button>
                        <button className="w-14 h-14 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:text-white transition-all"><Share2 className="w-6 h-6" /></button>
                      </div>
                    </>
                  ) : <Loader2 className="w-10 h-10 text-primary animate-spin" />}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Search ── */}
        <div className={cn("w-full mb-16 space-y-8", isReadingMode && "opacity-0 h-0 overflow-hidden mb-0 transition-all")}>
          <div className="relative group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={view === 'full' ? "ابحث عن سورة، جزء، أو رقم..." : "ابحث في الآيات المختارة..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-20 bg-white/5 border border-white/10 rounded-[2.5rem] ps-16 pe-16 text-xl text-white outline-none focus:border-primary/30 focus:bg-white/[0.08] transition-all shadow-inner"
            />
            <button
              onClick={() => {
                // Stop if already listening
                if (isListening) {
                  voiceRecognitionRef.current?.stop();
                  setIsListening(false);
                  return;
                }

                // Check browser support
                const SpeechRecognitionAPI =
                  (window as any).SpeechRecognition ||
                  (window as any).webkitSpeechRecognition;

                if (!SpeechRecognitionAPI) {
                  alert('متصفحك لا يدعم البحث الصوتي. يُرجى استخدام Chrome أو Edge.');
                  return;
                }

                const recognition = new SpeechRecognitionAPI();
                voiceRecognitionRef.current = recognition;
                recognition.lang = 'ar-SA';
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => setIsListening(true);

                recognition.onresult = (e: any) => {
                  const result = e.results[e.resultIndex];
                  const transcript = result[0].transcript;
                  setSearchQuery(transcript);
                  if (result.isFinal) {
                    setIsListening(false);
                  }
                };

                recognition.onerror = (e: any) => {
                  console.warn('Voice search error:', e.error);
                  setIsListening(false);
                };

                recognition.onend = () => {
                  setIsListening(false);
                };

                try {
                  recognition.start();
                } catch (err) {
                  console.warn('Failed to start voice search:', err);
                  setIsListening(false);
                }
              }}
              className={cn(
                "absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all overflow-hidden",
                isListening
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] scale-110"
                  : "bg-primary/10 text-primary border border-primary/20 hover:scale-110 hover:bg-primary/20"
              )}
              title={isListening ? 'إيقاف الاستماع' : 'بحث صوتي باللغة العربية'}
            >
              {isListening ? (
                <div className="flex gap-[3px] items-center">
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] bg-white rounded-full"
                      animate={{ height: [6, 16, 6] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex flex-col items-center gap-6">
            {searchHistory.length > 0 && searchQuery.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center px-4 animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] w-full text-center mb-1">عمليات البحث الأخيرة</span>
                {searchHistory.map(h => (
                  <button key={h} onClick={() => setSearchQuery(h)} className="px-5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-2">
                    <Clock className="w-3 h-3 opacity-30" /> {h}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center px-4">
              {['الجنة', 'الصبر', 'الرحمة', 'القلب', 'الاستغفار', 'التوكل'].map(keyword => (
                <button
                  key={keyword}
                  onClick={() => setSearchQuery(keyword)}
                  className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-white/30 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                >
                  # {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search Results Overlay ── */}
        <AnimatePresence>
          {searchQuery.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full mb-16 space-y-6"
            >
              <div className="flex items-center justify-between px-6">
                <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-primary" /> نتائج البحث الذكي ({searchResults.length})
                </h3>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'surahs', label: 'سور' },
                    { id: 'verses', label: 'آيات' },
                    { id: 'tafseer', label: 'تفسير' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSearchFilter(tab.id as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all",
                        searchFilter === tab.id ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/20 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                {isSearchingGlobal && (
                  <div className="flex items-center justify-center py-10 gap-3 text-primary animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">جاري البحث في كامل المصحف...</span>
                  </div>
                )}

                {/* Surah Matches (if in 'all' or 'surahs' filter) */}
                {(searchFilter === 'all' || searchFilter === 'surahs') && filteredSurahs.length > 0 && searchQuery.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {filteredSurahs.slice(0, 6).map((s: any) => (
                      <motion.button
                        key={`search-surah-${s.number}`}
                        whileHover={{ y: -3, scale: 1.02 }}
                        onClick={() => { setSelectedSurah(s.number); loadSurah(s.number); setView('full'); setViewMode('ayah'); setSearchQuery(''); }}
                        className="flex items-center gap-4 p-5 rounded-[2rem] bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all text-right group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center group-hover:scale-110 transition-transform">{s.number}</div>
                        <div>
                          <h4 className="text-white font-black text-sm">{highlightMatch(s.name, searchQuery)}</h4>
                          <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">{s.numberOfAyahs} آية</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Verse Matches (if in 'all' or 'verses' filter) */}
                {(searchFilter === 'all' || searchFilter === 'verses') && searchResults.map((v, i) => (
                  <div key={`search-container-${v.id}`} onClick={() => handleSearchResultClick(v)} className="cursor-pointer">
                    <VerseCard
                      id={v.id}
                      verse={v}
                      accentColor={v.accentColor}
                      border={v.border}
                      index={i}
                      searchQuery={searchQuery}
                      isHideRevealMode={isHideRevealMode}
                    quranHideMode={quranHideMode}
                      onPlay={(e: any) => { e.stopPropagation(); handlePlayVerse(v); }}
                      onShare={(e: any) => { e.stopPropagation(); handleShare(v); }}
                      onBookmark={(e: any) => { e.stopPropagation(); toggleBookmark(v); }}
                      onWordClick={(e: any) => { e.stopPropagation(); handleWordClick(v, 0); }}
                      isPlaying={currentAudio?.id === v.id && isPlaying}
                      isBookmarked={state.favorites?.includes(`quran_${v.id}`)}
                      reciterName={selectedReciter.name}
                      fontClass={selectedScript.font}
                      selectedTranslation={selectedTranslation}
                      onChatClick={startTafseerChat}
                      isComparisonMode={isComparisonMode}
                      selectedSecondaryTafseerName={selectedSecondaryTafseer.name}
                      selectedSecondaryTranslation={selectedSecondaryTranslation}
                    />
                  </div>
                ))}

                {/* Tafseer Matches */}
                {(searchFilter === 'all' || searchFilter === 'tafseer') && tafseerResults.map((v, i) => (
                  <div key={`search-tafseer-${v.id}`} onClick={() => handleSearchResultClick(v)} className="cursor-pointer">
                    <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all text-right group relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                      <div className="flex justify-between items-center mb-6 relative z-10">
                        <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">نتائج التفسير الميسر</span>
                        <span className="text-xs font-black text-white/20">{v.surah} - آية {v.ayahNumber}</span>
                      </div>
                      <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium relative z-10">
                        {highlightMatch(v.arabic, searchQuery)}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-amber-400/40 text-[10px] font-bold relative z-10">
                        <Sparkles className="w-3 h-3" /> اضغط للانتقال لموضع الآية في المصحف
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent my-10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content View ── */}
        <div className="w-full">

          {view === 'full' && (
            <div className="space-y-12">
              {!selectedSurah ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSurahs.map((s: SurahInfo, i: number) => {
                    const status = (state.quranMemorization?.[s.number] || 'not-started') as keyof typeof MEMORIZATION_STATUS;
                    const config = MEMORIZATION_STATUS[status];
                    const StatusIcon = config.icon;

                    return (
                      <motion.button
                        key={s.number}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => loadSurah(s.number)}
                        className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/20 transition-all text-right relative overflow-hidden"
                      >
                        {status !== 'not-started' && (
                          <div className={cn("absolute top-0 right-0 w-2 h-full", config.color.replace('text-', 'bg-'))} />
                        )}
                        <div className="flex items-center gap-5 relative z-10">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all shadow-xl",
                            status !== 'not-started' ? `${config.bg} ${config.color}` : "bg-white/5 text-white/20"
                          )}>
                            {status === 'not-started' ? s.number : <StatusIcon className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-relaxed font-tajawal">
                              {s.name}
                            </h3>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                              {s.numberOfAyahs} آية • {config.label}
                            </p>
                          </div>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-white/10 group-hover:text-primary transition-all" />
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className={cn("flex flex-col md:flex-row justify-between items-center gap-8 bg-white/5 p-10 rounded-[3.5rem] border border-white/10", isReadingMode && "fixed top-8 left-8 right-8 z-50")}>
                    <button onClick={() => setSelectedSurah(null)} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 transition-all font-black text-sm border border-white/10"><ArrowRight className="w-4 h-4" /> الفهرس</button>
                    <div className="text-center group">
                      <h2
                        onClick={() => {
                          const surah = surahs.find(s => s.number === selectedSurah);
                          if (surah) setActiveSurahInfo(surah);
                        }}
                        className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 cursor-help hover:text-primary transition-colors flex items-center justify-center gap-4"
                      >
                        {surahContent[0]?.surah}
                        <Info className="w-8 h-8 opacity-0 group-hover:opacity-20 transition-all" />
                      </h2>
                      <div className="flex flex-wrap items-center justify-center gap-2">{Object.entries(MEMORIZATION_STATUS).map(([key, config]) => (<button key={key} onClick={() => updateMemorization(selectedSurah, key as any)} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border", (state.quranMemorization?.[selectedSurah] || 'not-started') === key ? `${config.bg} ${config.color} border-white/20` : "bg-white/5 text-white/20 border-transparent hover:bg-white/10")}><config.icon className="w-3.5 h-3.5" /> {config.label}</button>))}</div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                      {/* Reciter Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowPageReciterMenu(prev => !prev)}
                          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all border bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/25"
                        >
                          <span>{selectedReciter.icon}</span>
                          <span>{selectedReciter.name}</span>
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                        {showPageReciterMenu && (
                          <div className="absolute top-13 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 z-50 bg-[#0d0d0d] border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[210px] space-y-1">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-3 pb-2 border-b border-white/5 mb-2 text-right">اختر القارئ</p>
                            {RECITERS.map(r => (
                              <button
                                key={r.id}
                                onClick={() => { setSelectedReciter(r); setShowPageReciterMenu(false); }}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right",
                                  selectedReciter.id === r.id
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                                    : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
                                )}
                              >
                                <span className="text-base">{r.icon}</span>
                                <span className="flex-1">{r.name}</span>
                                {selectedReciter.id === r.id && <span className="text-amber-400 text-sm">✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Playback Mode Control */}
                      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5" dir="rtl">
                        <button
                          onClick={() => setPlayMode('surah')}
                          className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5", playMode === 'surah' ? "bg-amber-500 text-black shadow-glow-amber" : "text-white/40 hover:text-white")}
                          title="تشغيل السورة كاملة متواصلة"
                        >
                          🔁 السورة كاملة
                        </button>
                        <button
                          onClick={() => setPlayMode('ayah')}
                          className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5", playMode === 'ayah' ? "bg-amber-500 text-black shadow-glow-amber" : "text-white/40 hover:text-white")}
                          title="تشغيل آية بعد آية تلقائياً"
                        >
                          ⏭️ آية بعد آية
                        </button>
                        <button
                          onClick={() => setPlayMode('single')}
                          className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5", playMode === 'single' ? "bg-amber-500 text-black shadow-glow-amber" : "text-white/40 hover:text-white")}
                          title="تشغيل آية واحدة فقط والوقوف"
                        >
                          🔂 آية واحدة
                        </button>
                      </div>
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="flex flex-col items-center py-48 gap-6"><Loader2 className="w-16 h-16 text-primary animate-spin" /><p className="text-white/20 font-black tracking-widest uppercase text-[10px]">جاري جلب الآيات العظيمة...</p></div>
                  ) : (
                    <>
                      {viewMode === 'ayah' ? (
                        <div className="grid gap-10">
                          {selectedSurah !== 1 && selectedSurah !== 9 && (
                            <div className={cn("text-center py-10 opacity-80", selectedScript.font)}>
                              <p className="text-4xl md:text-6xl text-white/90">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                            </div>
                          )}
                          {surahContent.map((v, i) => (
                            <VerseCard
                              key={v.id}
                              id={v.id}
                              verse={v}
                              accentColor="text-primary"
                              border="border-primary/20"
                              index={i}
                              isReadingMode={isReadingMode}
                              fontSize={fontSize}
                              isHideRevealMode={isHideRevealMode}
                    quranHideMode={quranHideMode}
                              onPlay={handlePlayVerse}
                              onShare={handleShare}
                              onBookmark={toggleBookmark}
                              onWordClick={handleWordClick}
                              isBookmarked={state.favorites?.includes(`quran_${v.id}`)}
                              isPlaying={currentAudio?.id === v.id && isPlaying}
                              reciterName={selectedReciter.name}
                              fontClass={selectedScript.font}
                              selectedTranslation={selectedTranslation}
                              onChatClick={startTafseerChat}
                              isComparisonMode={isComparisonMode}
                              selectedSecondaryTafseerName={selectedSecondaryTafseer.name}
                              selectedSecondaryTranslation={selectedSecondaryTranslation}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-6 w-full">
                          {/* Layout Controls Bar */}
                          <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4" dir="rtl">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => setPageViewLayout(pageViewLayout === 'double' ? 'single' : 'double')}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border", pageViewLayout === 'double' ? "bg-primary text-primary-foreground border-primary/20" : "bg-white/5 text-white/40 border-transparent hover:bg-white/10")}
                              >
                                {pageViewLayout === 'double' ? "عرض صفحة واحدة" : "عرض صفحتين (3D)"}
                              </button>

                              <button
                                onClick={() => setMushafType(mushafType === 'digital' ? 'image' : 'digital')}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border", mushafType === 'digital' ? "bg-amber-500 text-black border-amber-400/20" : "bg-white/5 text-white/40 border-transparent hover:bg-white/10")}
                              >
                                {mushafType === 'digital' ? "عرض المصحف المصور 🖼️" : "عرض المصحف الرقمي التفاعلي ✍️"}
                              </button>

                              <button
                                onClick={() => setShowSidePanel(!showSidePanel)}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border", showSidePanel ? "bg-primary text-primary-foreground border-primary/20" : "bg-white/5 text-white/40 border-transparent hover:bg-white/10")}
                              >
                                {showSidePanel ? "إخفاء اللوحة الذكية" : "إظهار اللوحة الذكية"}
                              </button>

                              {/* ── Reciter Selector in Page View ── */}
                              <div className="relative">
                                <button
                                  onClick={() => setShowPageReciterMenu(prev => !prev)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all border bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/25"
                                >
                                  <span>{selectedReciter.icon}</span>
                                  <span>{selectedReciter.name}</span>
                                  <ChevronDown className="w-3 h-3 opacity-60" />
                                </button>
                                {showPageReciterMenu && (
                                  <div className="absolute top-11 right-0 z-50 bg-[#0d0d0d] border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[210px] space-y-1">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-3 pb-2 border-b border-white/5 mb-2 text-right">اختر القارئ</p>
                                    {RECITERS.map(r => (
                                      <button
                                        key={r.id}
                                        onClick={() => { setSelectedReciter(r); setShowPageReciterMenu(false); }}
                                        className={cn(
                                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right",
                                          selectedReciter.id === r.id
                                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                                            : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
                                        )}
                                      >
                                        <span className="text-base">{r.icon}</span>
                                        <span className="flex-1">{r.name}</span>
                                        {selectedReciter.id === r.id && <span className="text-amber-400 text-sm">✓</span>}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* ── Playback Mode Selector in Page View ── */}
                              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5" dir="rtl">
                                <button
                                  onClick={() => setPlayMode('surah')}
                                  className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black transition-all", playMode === 'surah' ? "bg-amber-500 text-black font-black" : "text-white/40 hover:text-white")}
                                  title="سماع السورة كاملة"
                                >
                                  🔁 السورة كاملة
                                </button>
                                <button
                                  onClick={() => setPlayMode('ayah')}
                                  className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black transition-all", playMode === 'ayah' ? "bg-amber-500 text-black font-black" : "text-white/40 hover:text-white")}
                                  title="سماع آية بعد آية"
                                >
                                  ⏭️ آية بعد آية
                                </button>
                                <button
                                  onClick={() => setPlayMode('single')}
                                  className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black transition-all", playMode === 'single' ? "bg-amber-500 text-black font-black" : "text-white/40 hover:text-white")}
                                  title="سماع آية واحدة فقط"
                                >
                                  🔂 آية واحدة
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold">
                              <span>سورة {surahContent[0]?.surah || '-'}</span>
                              <span className="opacity-30">|</span>
                              <span>صفحة {currentPage}</span>
                              <span className="opacity-30">|</span>
                              <span>الجزء {pages[currentPage]?.[0]?.juz_number || '-'}</span>
                            </div>
                          </div>

                          {/* Swipe Hint — mobile only */}
                          <div className="lg:hidden flex items-center justify-center gap-2 text-white/30 text-[10px] font-bold mb-2 select-none" dir="rtl">
                            <span className="text-base">👆</span>
                            <span>مرّر إصبعك على المصحف لتقليب الصفحات</span>
                          </div>

                          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left: The page workspace (double/single) */}
                            <div className={cn("w-full transition-all duration-500", showSidePanel ? "lg:col-span-8" : "lg:col-span-12")}>
                              {pages[currentPage] ? (
                                <div className="space-y-6">
                                  {pageViewLayout === 'double' ? (
                                    <>
                                      {/* Desktop Double-Page Flip Book Spread */}
                                      <div
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        className="hidden lg:block relative bg-[#2a1b0e] p-8 rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-8 border-[#3d2715]"
                                      >
                                        <div className="grid grid-cols-2 gap-0 relative bg-[#fbf9f1] rounded-2xl shadow-inner overflow-hidden min-h-[550px]">
                                          {/* Spine gutter shadow */}
                                          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-black/10 z-20 pointer-events-none" />
                                          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-black/15 via-transparent to-black/15 z-10 pointer-events-none" />

                                          {/* Right Page (Odd) */}
                                          <div className="relative border-l border-black/5 p-8 flex flex-col justify-between">
                                            <div className="flex justify-between items-center text-[9px] font-black text-amber-950/40 pb-2 border-b border-amber-950/5 mb-4">
                                              <span>صفحة {rightPage}</span>
                                              <span>الجزء {pages[rightPage]?.[0]?.juz_number || '-'}</span>
                                            </div>

                                            {!rightImgError && mushafType !== 'digital' ? (
                                              <div className="relative flex-1 flex items-center justify-center">
                                                {isRightImageLoading && (
                                                  <Loader2 className="w-8 h-8 animate-spin text-amber-800/40 absolute" />
                                                )}
                                                <img
                                                  src={rightImgSrc}
                                                  onLoad={() => setIsRightImageLoading(false)}
                                                  onError={handleRightImageError}
                                                  alt={`Page ${rightPage}`}
                                                  className={cn("max-h-[580px] object-contain mix-blend-multiply opacity-95 transition-opacity duration-300", isRightImageLoading ? "opacity-0" : "opacity-95")}
                                                />
                                              </div>
                                            ) : (
                                              <div className="flex-1 text-center font-quran text-2xl text-amber-950 leading-loose flex flex-wrap justify-center content-center gap-x-2 gap-y-1" dir="rtl">
                                                {pages[rightPage]?.map((v: any) => (
                                                  <span key={v.id} onClick={() => handlePlayVerse(v)} className={cn("cursor-pointer hover:text-primary transition-all rounded px-1", currentAudio?.id === v.id ? "text-primary font-black bg-primary/10" : "")}>
                                                    {v.arabic}
                                                    <span className="mx-1 inline-flex w-8 h-8 rounded-full border border-amber-950/20 items-center justify-center text-[9px] font-sans text-amber-900 bg-amber-950/5 align-middle">
                                                      {v.ayahNumber}
                                                    </span>
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                            <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                          </div>

                                          {/* Left Page (Even) */}
                                          <div className="relative p-8 flex flex-col justify-between">
                                            <div className="flex justify-between items-center text-[9px] font-black text-amber-950/40 pb-2 border-b border-amber-950/5 mb-4">
                                              <span>الجزء {pages[leftPage]?.[0]?.juz_number || '-'}</span>
                                              <span>صفحة {leftPage}</span>
                                            </div>

                                            {!leftImgError && mushafType !== 'digital' ? (
                                              <div className="relative flex-1 flex items-center justify-center">
                                                {isLeftImageLoading && (
                                                  <Loader2 className="w-8 h-8 animate-spin text-amber-800/40 absolute" />
                                                )}
                                                <img
                                                  src={leftImgSrc}
                                                  onLoad={() => setIsLeftImageLoading(false)}
                                                  onError={handleLeftImageError}
                                                  alt={`Page ${leftPage}`}
                                                  className={cn("max-h-[580px] object-contain mix-blend-multiply opacity-95 transition-opacity duration-300", isLeftImageLoading ? "opacity-0" : "opacity-95")}
                                                />
                                              </div>
                                            ) : (
                                              <div className="flex-1 text-center font-quran text-2xl text-amber-950 leading-loose flex flex-wrap justify-center content-center gap-x-2 gap-y-1" dir="rtl">
                                                {pages[leftPage]?.map((v: any) => (
                                                  <span key={v.id} onClick={() => handlePlayVerse(v)} className={cn("cursor-pointer hover:text-primary transition-all rounded px-1", currentAudio?.id === v.id ? "text-primary font-black bg-primary/10" : "")}>
                                                    {v.arabic}
                                                    <span className="mx-1 inline-flex w-8 h-8 rounded-full border border-amber-950/20 items-center justify-center text-[9px] font-sans text-amber-900 bg-amber-950/5 align-middle">
                                                      {v.ayahNumber}
                                                    </span>
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                            <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Mobile Single-Page Fallback */}
                                      <div
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        className="lg:hidden relative bg-[#2a1b0e] p-5 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] border-6 border-[#3d2715]"
                                      >
                                        <div className="relative bg-[#fbf9f1] rounded-xl shadow-inner overflow-hidden p-6 min-h-[480px] flex flex-col justify-between">
                                          <div className="flex justify-between items-center text-[9px] font-black text-amber-950/40 pb-2 border-b border-amber-950/5 mb-4">
                                            <span>صفحة {currentPage}</span>
                                            <span>الجزء {pages[currentPage]?.[0]?.juz_number || '-'}</span>
                                          </div>

                                          {!mushafError && mushafType !== 'digital' ? (
                                            <div className="relative flex-1 flex items-center justify-center">
                                              {isRightImageLoading && (
                                                <Loader2 className="w-8 h-8 animate-spin text-amber-800/40 absolute" />
                                              )}
                                              <img
                                                src={rightImgSrc}
                                                onLoad={() => setIsRightImageLoading(false)}
                                                onError={handleRightImageError}
                                                alt={`Page ${currentPage}`}
                                                className={cn("max-h-[500px] object-contain mix-blend-multiply opacity-95 transition-opacity duration-300", isRightImageLoading ? "opacity-0" : "opacity-95")}
                                              />
                                            </div>
                                          ) : (
                                            <div className="flex-1 text-center font-quran text-xl text-amber-950 leading-loose flex flex-wrap justify-center content-center gap-x-2 gap-y-1" dir="rtl">
                                              {pages[currentPage]?.map((v: any) => (
                                                <span key={v.id} onClick={() => handlePlayVerse(v)} className={cn("cursor-pointer hover:text-primary transition-all rounded px-1", currentAudio?.id === v.id ? "text-primary font-black bg-primary/10" : "")}>
                                                  {v.arabic}
                                                  <span className="mx-1 inline-flex w-8 h-8 rounded-full border border-amber-950/20 items-center justify-center text-[9px] font-sans text-amber-900 bg-amber-950/5 align-middle">
                                                    {v.ayahNumber}
                                                  </span>
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    /* Single-Page Layout (All Screens) */
                                    <div
                                      onTouchStart={handleTouchStart}
                                      onTouchMove={handleTouchMove}
                                      onTouchEnd={handleTouchEnd}
                                      className="relative bg-[#2a1b0e] p-8 rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-8 border-[#3d2715] max-w-xl mx-auto"
                                    >
                                      <div className="relative bg-[#fbf9f1] rounded-2xl shadow-inner overflow-hidden p-8 min-h-[550px] flex flex-col justify-between">
                                        <div className="flex justify-between items-center text-[9px] font-black text-amber-950/40 pb-2 border-b border-amber-950/5 mb-4">
                                          <span>صفحة {currentPage}</span>
                                          <span>الجزء {pages[currentPage]?.[0]?.juz_number || '-'}</span>
                                        </div>

                                        {!mushafError && mushafType !== 'digital' ? (
                                          <div className="relative flex-1 flex items-center justify-center">
                                            {isRightImageLoading && (
                                              <Loader2 className="w-8 h-8 animate-spin text-amber-800/40 absolute" />
                                            )}
                                            <img
                                              src={rightImgSrc}
                                              onLoad={() => setIsRightImageLoading(false)}
                                              onError={handleRightImageError}
                                              alt={`Page ${currentPage}`}
                                              className={cn("max-h-[580px] object-contain mix-blend-multiply opacity-95 transition-opacity duration-300", isRightImageLoading ? "opacity-0" : "opacity-95")}
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex-1 text-center font-quran text-2xl text-amber-950 leading-loose flex flex-wrap justify-center content-center gap-x-2 gap-y-1" dir="rtl">
                                            {pages[currentPage]?.map((v: any) => (
                                              <span key={v.id} onClick={() => handlePlayVerse(v)} className={cn("cursor-pointer hover:text-primary transition-all rounded px-1", currentAudio?.id === v.id ? "text-primary font-black bg-primary/10" : "")}>
                                                {v.arabic}
                                                <span className="mx-1 inline-flex w-8 h-8 rounded-full border border-amber-950/20 items-center justify-center text-[9px] font-sans text-amber-900 bg-amber-950/5 align-middle">
                                                  {v.ayahNumber}
                                                </span>
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="py-20 flex flex-col items-center gap-4 text-white/20">
                                  <Loader2 className="w-8 h-8 animate-spin" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">جاري إعداد الصفحة...</p>
                                </div>
                              )}
                            </div>

                            {/* Right: The Split-Screen Side Panel Drawer */}
                            {showSidePanel && (
                              <div className="w-full lg:col-span-4 bg-[#080808]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl space-y-6 lg:sticky lg:top-6" dir="rtl">
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <h3 className="text-white font-black text-xs">اللوحة الذكية التفاعلية</h3>
                                  </div>
                                  <button onClick={() => setShowSidePanel(false)} className="w-8 h-8 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Verses Interactive Directory */}
                                <div className="space-y-3">
                                  <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest">آيات الصفحة الحالية</h4>
                                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {((pageViewLayout === 'double'
                                      ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                      : (pages[currentPage] || [])) as any[]).map((verse: any) => {
                                        const isCurrentActive = currentAudio?.id === verse.id;
                                        return (
                                          <div
                                            key={verse.id}
                                            onClick={() => handlePlayVerse(verse)}
                                            className={cn(
                                              "p-3.5 rounded-2xl border transition-all cursor-pointer text-right space-y-2",
                                              isCurrentActive
                                                ? "bg-primary/10 border-primary/30"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                                            )}
                                          >
                                            <div className="flex justify-between items-center text-[9px] font-bold text-white/40">
                                              <span className="px-2 py-0.5 rounded bg-white/5">آية {verse.ayahNumber}</span>
                                              <span>صفحة {verse.page_number}</span>
                                            </div>
                                            <p className="font-quran text-base text-white leading-relaxed">{verse.arabic}</p>
                                            {isCurrentActive && (
                                              <div className="pt-2.5 border-t border-white/5 text-xs text-white/60 font-tajawal space-y-1">
                                                <p className="text-primary font-black">تفسير الآية:</p>
                                                <p className="leading-relaxed text-[11px] text-white/70">{verse.tafseer}</p>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>

                                {/* memorization repetition module */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                                  <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest pb-2 border-b border-white/5">أدوات الحفظ والمراجعة التكرارية</h4>

                                  {/* Single Verse Repetition */}
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/60">تكرار الآية الحالية:</span>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setVerseRepetition(prev => Math.max(1, prev - 1))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm">-</button>
                                      <span className="w-6 text-center text-primary font-black">{verseRepetition}x</span>
                                      <button onClick={() => setVerseRepetition(prev => prev + 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm">+</button>
                                    </div>
                                  </div>

                                  {/* Range Loop */}
                                  <div className="space-y-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-white/60">تكرار نطاق من الآيات (حلقة):</span>
                                      <button
                                        onClick={() => setRangeLoopActive(!rangeLoopActive)}
                                        className={cn("px-3 py-1 rounded-lg text-[9px] font-black transition-all", rangeLoopActive ? "bg-primary text-primary-foreground shadow-glow-primary" : "bg-white/5 text-white/40")}
                                      >
                                        {rangeLoopActive ? "مفعل" : "مغلق"}
                                      </button>
                                    </div>

                                    {rangeLoopActive && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[8px] text-white/30 font-bold block">من آية:</label>
                                          <select
                                            value={rangeStartVerse?.id || ''}
                                            onChange={(e) => {
                                              const currentRangeVerses = pageViewLayout === 'double'
                                                ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                                : (pages[currentPage] || []);
                                              const v = currentRangeVerses.find((x: any) => x.id === Number(e.target.value));
                                              if (v) setRangeStartVerse(v);
                                            }}
                                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                                          >
                                            <option value="">اختر...</option>
                                            {((pageViewLayout === 'double'
                                              ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                              : (pages[currentPage] || [])) as any[]).map((x: any) => (
                                                <option key={x.id} value={x.id}>آية {x.ayahNumber}</option>
                                              ))}
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[8px] text-white/30 font-bold block">إلى آية:</label>
                                          <select
                                            value={rangeEndVerse?.id || ''}
                                            onChange={(e) => {
                                              const currentRangeVerses = pageViewLayout === 'double'
                                                ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                                : (pages[currentPage] || []);
                                              const v = currentRangeVerses.find((x: any) => x.id === Number(e.target.value));
                                              if (v) setRangeEndVerse(v);
                                            }}
                                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                                          >
                                            <option value="">اختر...</option>
                                            {((pageViewLayout === 'double'
                                              ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                              : (pages[currentPage] || [])) as any[]).map((x: any) => (
                                                <option key={x.id} value={x.id}>آية {x.ayahNumber}</option>
                                              ))}
                                          </select>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Speech Recitation Verification Panel */}
                                {currentAudio && (
                                  <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">تسميع الآية بالذكاء الاصطناعي</h4>
                                      {isTestingRecitation && (
                                        <button
                                          onClick={() => {
                                            stopListeningRecitation();
                                            setIsTestingRecitation(false);
                                            setTestWordsResult(null);
                                          }}
                                          className="text-[9px] text-white/40 hover:text-white"
                                        >
                                          إلغاء
                                        </button>
                                      )}
                                    </div>

                                    {!isTestingRecitation ? (
                                      <button
                                        onClick={() => startListeningRecitation(currentAudio)}
                                        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-glow-primary"
                                      >
                                        <Mic className="w-3.5 h-3.5" />
                                        <span>ابدأ التسميع الصوتي الآن</span>
                                      </button>
                                    ) : (
                                      <div className="space-y-3">
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 min-h-[60px] flex items-center justify-center flex-wrap gap-1" dir="rtl">
                                          {testWordsResult ? (
                                            testWordsResult.map((w, idx) => (
                                              <span
                                                key={idx}
                                                className={cn(
                                                  "text-sm font-quran transition-colors",
                                                  w.status === 'correct' ? "text-emerald-400 font-bold" : "text-red-500 line-through opacity-60"
                                                )}
                                              >
                                                {w.word}
                                              </span>
                                            ))
                                          ) : (
                                            <p className="text-white/20 text-[10px] font-bold animate-pulse">اقرأ الآية بصوتك المرتل الآن...</p>
                                          )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <span className={cn("w-2 h-2 rounded-full", isListeningRecitation ? "bg-emerald-500 animate-ping" : "bg-red-500")} />
                                            <span className="text-[10px] text-white/60">{isListeningRecitation ? "جاري الاستماع..." : "متوقف"}</span>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {isListeningRecitation ? (
                                              <button
                                                onClick={stopListeningRecitation}
                                                className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[9px] font-black hover:bg-red-500/30 transition-all"
                                              >
                                                إيقاف الاستماع
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() => startListeningRecitation(currentAudio)}
                                                className="px-2.5 py-1 bg-primary text-primary-foreground rounded-lg text-[9px] font-black hover:scale-105 transition-all"
                                              >
                                                تحدث مجدداً
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        {testMatchPercentage > 0 && (
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-black">
                                              <span className="text-white/40">نسبة تطابق التسميع:</span>
                                              <span className="text-primary">{testMatchPercentage}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${testMatchPercentage}%` }} />
                                            </div>
                                            {testMatchPercentage === 100 && (
                                              <p className="text-[10px] text-emerald-400 font-black text-center pt-1 animate-bounce">ما شاء الله! قراءة وحفظ متقن 100% ✨</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}


                                {/* ── Ambient Focus Sounds ── */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                    <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest">أصوات التركيز المهدئة 🌧️</h4>
                                    {activeAmbient && (
                                      <button
                                        onClick={() => setActiveAmbient(null)}
                                        className="text-[9px] text-amber-500 font-bold hover:text-amber-400"
                                      >
                                        إيقاف الكل
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    {AMBIENT_SOUNDS.map(s => {
                                      const isActive = activeAmbient === s.id;
                                      return (
                                        <button
                                          key={s.id}
                                          onClick={() => setActiveAmbient(isActive ? null : s.id)}
                                          className={cn(
                                            "p-3 rounded-xl text-[10px] font-black text-right transition-all flex items-center justify-between border",
                                            isActive
                                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                                              : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
                                          )}
                                        >
                                          <span>{s.name}</span>
                                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {activeAmbient && (
                                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                                      <div className="flex justify-between items-center text-[8px] font-black text-white/30">
                                        <span>حجم صوت الخلفية</span>
                                        <span>{Math.round(ambientVolume * 100)}%</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={ambientVolume}
                                        onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Pagination Control buttons at the bottom of the page */}
                          <div className="flex items-center gap-6 mt-4">
                            <button
                              disabled={pageNumbers.indexOf(currentPage) === 0}
                              onClick={() => setCurrentPage(pageNumbers[pageNumbers.indexOf(currentPage) - 1])}
                              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-20 shadow-xl"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="px-8 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/40 text-xs tracking-widest shadow-inner">
                              {pageNumbers.indexOf(currentPage) + 1} <span className="mx-2 opacity-20">/</span> {pageNumbers.length}
                            </div>
                            <button
                              disabled={pageNumbers.indexOf(currentPage) === pageNumbers.length - 1}
                              onClick={() => setCurrentPage(pageNumbers[pageNumbers.indexOf(currentPage) + 1])}
                              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-20 shadow-xl"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {view === 'plan' && (
            <div className="space-y-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                  {/* Left Column: Progress & Quick Actions */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <PlanProgress percentage={memorizationStats.percentage} />
                      <div className="mt-8">
                        <h3 className="text-2xl font-black text-white mb-2">تقدمك الحالي</h3>
                        <p className="text-white/30 text-xs font-bold leading-relaxed">
                          أنت تسير بشكل رائع! لقد أنجزت {memorizationStats.completed} سورة من أصل 114 سورة.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">سور محفوظة</p>
                          <p className="text-xl font-black text-white">{memorizationStats.completed}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">النقاط</p>
                          <p className="text-xl font-black text-primary">{(state.points || 0) + (memorizationStats.completed * 50)}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsExamOpen(true)}
                      disabled={memorizedVerses.length === 0}
                      className="w-full p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between group disabled:opacity-50 shadow-xl"
                    >
                      <div className="text-right">
                        <h4 className="text-amber-100 font-black mb-1">اختبار الحفظ</h4>
                        <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest">ثبت حفظك بالاختبارات</p>
                      </div>
                      <Trophy className="w-8 h-8 text-amber-400" />
                    </button>
                  </div>

                  {/* Right Column: Active Plan & Selection */}
                  <div className="lg:col-span-8 space-y-8">
                    {state.activeMemoPlan ? (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 text-white/[0.02] text-9xl font-black select-none pointer-events-none">📖</div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
                          <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                              <Target className="w-3.5 h-3.5" /> الخطة الحالية
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                              {MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId)?.label}
                            </h2>
                            <p className="text-white/40 text-sm leading-relaxed max-w-md">
                              تتطلب هذه الخطة حفظ {MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId)?.pagesPerDay} صفحة يومياً لإكمال المصحف كاملاً.
                            </p>
                          </div>

                          <div className="w-full md:w-auto p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-glow-primary text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">الورد اليومي المقترح</p>
                            <h3 className="text-2xl font-black mb-6">
                              صفحة {dailyWord?.page} - {dailyWord?.surah}
                            </h3>
                            <button
                              onClick={() => {
                                setView('full');
                                setViewMode('page');
                                setCurrentPage(dailyWord?.page || 1);
                                // Optional: load the specific surah for that page
                              }}
                              className="w-full py-4 bg-black/20 hover:bg-black/30 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all"
                            >
                              ابدأ الآن <ArrowLeft className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/5">
                          <h4 className="text-sm font-black text-white/30 uppercase tracking-widest mb-8">تغيير الخطة</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {MEMO_PLANS.map(plan => {
                              const isActive = state.activeMemoPlan?.planId === plan.id;
                              return (
                                <button
                                  key={plan.id}
                                  onClick={() => activatePlan(plan.id)}
                                  className={cn(
                                    "p-6 rounded-2xl border transition-all text-right group",
                                    isActive ? "bg-primary/20 border-primary shadow-glow-primary" : "bg-white/5 border-white/5 hover:border-white/20"
                                  )}
                                >
                                  <h5 className={cn("font-black text-sm mb-1", isActive ? "text-primary" : "text-white/60")}>{plan.label}</h5>
                                  <p className="text-[10px] text-white/20 font-bold">{plan.months > 0 ? `${plan.months} شهراً` : 'مخصص'}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-16 text-center space-y-8">
                        <Sparkles className="w-16 h-16 text-primary mx-auto opacity-20" />
                        <div>
                          <h2 className="text-3xl font-black text-white mb-4">ابدأ رحلتك المباركة</h2>
                          <p className="text-white/40 max-w-md mx-auto leading-relaxed">قم باختيار الخطة التي تناسب وقتك وقدراتك لنقوم بمساعدتك في تتبع وردك اليومي ومراجعتك بانتظام.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          {MEMO_PLANS.map(plan => (
                            <button key={plan.id} onClick={() => activatePlan(plan.id)} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-right group">
                              <h4 className="text-white font-black mb-2 group-hover:text-primary transition-colors">{plan.label}</h4>
                              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{plan.months > 0 ? `${plan.months} شهراً` : 'خطة حرة'}</p>
                              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-sm font-black text-primary">{plan.pagesPerDay} <span className="text-[10px] text-white/40 font-normal">صفحة/يوم</span></span>
                                <ArrowLeft className="w-4 h-4 text-white/10 group-hover:text-primary group-hover:translate-x-[-4px] transition-all" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between">
                        <div className="text-right">
                          <h4 className="text-white font-black mb-1">أوسمة الإنجاز</h4>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">تلقيت 3 أوسمة هذا الأسبوع</p>
                        </div>
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] shadow-lg">🏆</div>)}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between">
                        <div className="text-right">
                          <h4 className="text-white font-black mb-1">سجل المراجعة</h4>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">آخر مراجعة: منذ يومين</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400"><History className="w-6 h-6" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {view === 'radio' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Hero Player Card */}
                <div className="lg:col-span-1 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 flex flex-col justify-between relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {/* Glowing ambient background based on selected station */}
                  <div
                    className={cn(
                      "absolute -top-32 -right-32 w-80 h-80 blur-[120px] rounded-full opacity-25 transition-all duration-1000 pointer-events-none bg-gradient-to-br",
                      currentRadioStation ? currentRadioStation.color : "from-primary/30 to-transparent"
                    )}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center gap-6">
                    <div className="px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>إذاعة القرآن الكريم</span>
                    </div>

                    {/* Rotating Vinyl design */}
                    <div className="relative w-48 h-48 my-2 flex items-center justify-center">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full border border-white/5 bg-black/50 transition-all duration-[4s] shadow-2xl flex items-center justify-center",
                          isPlayingRadio && !isRadioBuffering ? "animate-spin" : ""
                        )}
                        style={{ animationDuration: '10s' }}
                      >
                        {/* Vinyl grooves */}
                        <div className="absolute inset-2 rounded-full border border-dashed border-white/5" />
                        <div className="absolute inset-4 rounded-full border border-white/5" />
                        <div className="absolute inset-8 rounded-full border border-dashed border-white/5" />
                        <div className="absolute inset-12 rounded-full border border-white/5" />
                      </div>

                      {/* Vinyl center sticker */}
                      <div className={cn(
                        "w-20 h-20 rounded-full bg-gradient-to-tr flex flex-col items-center justify-center border-[6px] border-black/90 shadow-2xl relative z-10 transition-all duration-700",
                        currentRadioStation ? currentRadioStation.color : "from-zinc-800 to-zinc-900"
                      )}>
                        <span className="text-3xl">{currentRadioStation ? currentRadioStation.icon : '📻'}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2 h-20 flex flex-col justify-center">
                      {currentRadioStation ? (
                        <>
                          <h3 className="text-xl font-black text-white leading-tight px-2">{currentRadioStation.name}</h3>
                          <p className="text-white/40 text-xs font-semibold">{currentRadioStation.subtitle}</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-black text-white/40">بانتظار اختيار محطة</h3>
                          <p className="text-white/20 text-xs font-medium">استمتع بتلاوات وبث مباشر على مدار الساعة</p>
                        </>
                      )}
                    </div>

                    {/* Wave Visualizer */}
                    <div className="flex gap-[4px] items-center h-10 my-1 justify-center w-full">
                      {isPlayingRadio && !isRadioBuffering ? (
                        [0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2].map((val, i) => (
                          <motion.div
                            key={i}
                            className={cn("w-[4px] rounded-full", currentRadioStation ? currentRadioStation.textColor.replace('text-', 'bg-') : "bg-primary")}
                            animate={{ height: [8, 32, 8] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.7 + (i % 3) * 0.12,
                              delay: i * 0.07,
                              ease: 'easeInOut'
                            }}
                          />
                        ))
                      ) : isRadioBuffering ? (
                        <div className="flex items-center gap-2 text-white/40 text-xs font-black animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>جاري تحميل البث المباشر...</span>
                        </div>
                      ) : (
                        <div className="h-[2px] w-36 bg-white/10 rounded-full" />
                      )}
                    </div>

                    {/* Player Controls */}
                    <div className="w-full flex flex-col items-center gap-4 mt-2">
                      {/* Play Button */}
                      {currentRadioStation && (
                        <button
                          onClick={() => handlePlayRadio(currentRadioStation)}
                          className={cn(
                            "w-16 h-16 rounded-[2rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl",
                            isPlayingRadio && !isRadioBuffering ? "bg-white text-black hover:bg-white/90" : "bg-primary text-primary-foreground shadow-glow-primary"
                          )}
                        >
                          {isRadioBuffering ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : isPlayingRadio ? (
                            <Pause className="w-6 h-6 fill-current" />
                          ) : (
                            <Play className="w-6 h-6 fill-current" />
                          )}
                        </button>
                      )}

                      {/* Volume controls */}
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl w-full max-w-[220px]">
                        <button onClick={() => setRadioVolume(prev => prev === 0 ? 0.8 : 0)} className="text-white/40 hover:text-white transition-colors shrink-0">
                          {radioVolume === 0 ? <VolumeX className="w-4.5 h-4.5 text-rose-500" /> : <Volume2 className="w-4.5 h-4.5 text-primary" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={radioVolume}
                          onChange={(e) => setRadioVolume(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stations List Grid Section */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                  {/* Search bar inside Radio View */}
                  <div className="relative group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="ابحث عن محطة بث أو اسم قارئ..."
                      value={radioSearchQuery}
                      onChange={(e) => setRadioSearchQuery(e.target.value)}
                      className="w-full h-16 bg-[#0a0a0a]/80 border border-white/10 rounded-[1.5rem] ps-14 pe-6 text-sm text-white outline-none focus:border-primary/30 focus:bg-white/[0.04] transition-all"
                    />
                    {radioSearchQuery && (
                      <button onClick={() => setRadioSearchQuery('')} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        <X className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  {/* Stations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                    {filteredStations.map(station => {
                      const isCurrent = currentRadioStation?.id === station.id;
                      const isPlayingThis = isCurrent && isPlayingRadio;
                      const isFav = favoriteRadioIds.includes(station.id);
                      return (
                        <div
                          key={station.id}
                          onClick={() => handlePlayRadio(station)}
                          className={cn(
                            "p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden group hover:scale-[1.015]",
                            isCurrent
                              ? `${station.color} ${station.borderColor} shadow-[0_15px_35px_-5px_rgba(0,0,0,0.4)]`
                              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                          )}
                        >
                          {/* Favorite button */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white/5 border border-white/5 shadow-inner shrink-0">
                                {station.icon}
                              </div>
                              <div className="text-right">
                                <h4 className={cn("font-black text-sm transition-colors", isCurrent ? "text-white" : "text-white/85 group-hover:text-white")}>{station.name}</h4>
                                <p className="text-[10px] text-white/35 font-bold line-clamp-1 mt-0.5">{station.subtitle}</p>
                              </div>
                            </div>

                            <button onClick={(e) => toggleFavoriteRadio(station.id, e)} className="p-2 hover:bg-white/10 rounded-xl transition-colors self-start z-20">
                              <Heart className={cn("w-4 h-4 transition-colors", isFav ? "text-rose-500 fill-current" : "text-white/20 group-hover:text-white/40")} />
                            </button>
                          </div>

                          <div className="flex justify-between items-center mt-2 border-t border-white/[0.03] pt-4">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all",
                              isPlayingThis
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 animate-pulse"
                                : isCurrent && isRadioBuffering
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                  : "bg-white/5 text-white/35 border-transparent"
                            )}>
                              {isPlayingThis ? "البث المباشر نشط 🟢" : isCurrent && isRadioBuffering ? "جاري التوصيل..." : "بث مباشر"}
                            </span>

                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                              isCurrent ? "bg-white text-black" : "bg-white/5 text-white/40 group-hover:bg-primary/20 group-hover:text-primary"
                            )}>
                              {isPlayingThis ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredStations.length === 0 && (
                      <div className="col-span-full py-20 text-center text-white/20">
                        <Radio className="w-12 h-12 mx-auto opacity-15 mb-4 animate-pulse" />
                        <p className="text-sm font-bold">لم نجد محطة بث تطابق بحثك</p>
                        <p className="text-[10px] text-white/10 mt-1">تأكد من إدخال اسم القارئ بشكل صحيح</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Luminous Mushaf View ── */}
      {view === 'luminous' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[200] bg-black overflow-y-auto">
          <div className="sticky top-4 left-4 z-50 flex justify-end px-4">
            <button onClick={() => setView('full')} className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md">
              <X className="w-6 h-6" />
            </button>
          </div>
          <LuminousMushaf
            surahs={surahs}
            currentAudio={currentAudio}
            isPlaying={isPlaying}
            onPlay={handlePlayVerse}
            selectedScript={selectedScript}
            selectedTafseer={selectedTafseer}
            selectedReciter={selectedReciter}
            reciters={RECITERS}
            onSelectReciter={setSelectedReciter}
            selectedTranslation={selectedTranslation}
            translations={TRANSLATIONS}
            onSelectTranslation={setSelectedTranslation}
            audioRef={audioRef}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {currentAudio && (
          <motion.div initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 150, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-xl">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 shadow-[0_20px_100px_-20px_rgba(0,0,0,1)] flex items-center justify-between gap-8">
              <div className="flex items-center gap-5 overflow-hidden"><div className="w-16 h-16 rounded-[2rem] bg-primary/20 flex items-center justify-center shrink-0 shadow-inner"><span className="text-2xl animate-pulse">{selectedReciter.icon}</span></div><div className="overflow-hidden"><h4 className="text-white font-black text-base truncate mb-1">سورة {currentAudio.surah}</h4><div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black">آية {currentAudio.ayahNumber}</span><span className="text-white/20 text-[10px] font-bold">بصوت {selectedReciter.name}</span></div></div></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5" dir="rtl">
                  <button
                    onClick={() => setPlayMode('surah')}
                    className={cn(
                      "px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1",
                      playMode === 'surah' ? "bg-primary text-primary-foreground font-black shadow-glow-primary" : "text-white/40 hover:text-white"
                    )}
                    title="سماع السورة كاملة"
                  >
                    🔁 <span className="hidden sm:inline">السورة كاملة</span>
                  </button>
                  <button
                    onClick={() => setPlayMode('ayah')}
                    className={cn(
                      "px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1",
                      playMode === 'ayah' ? "bg-primary text-primary-foreground font-black shadow-glow-primary" : "text-white/40 hover:text-white"
                    )}
                    title="سماع آية بعد آية"
                  >
                    ⏭️ <span className="hidden sm:inline">آية بعد آية</span>
                  </button>
                  <button
                    onClick={() => setPlayMode('single')}
                    className={cn(
                      "px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1",
                      playMode === 'single' ? "bg-primary text-primary-foreground font-black shadow-glow-primary" : "text-white/40 hover:text-white"
                    )}
                    title="سماع آية واحدة فقط"
                  >
                    🔂 <span className="hidden sm:inline">آية واحدة</span>
                  </button>
                </div>
                <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mr-2">السرعة</span>
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={cn("w-8 h-8 rounded-lg text-[10px] font-black transition-all", playbackSpeed === speed ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/10")}>{speed}x</button>
                  ))}
                </div>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-[2rem] bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-glow-white shrink-0">{isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}</button>
                <button onClick={() => { setCurrentAudio(null); setIsPlaying(false); audioRef.current?.pause(); }} className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 hover:text-white transition-all flex items-center justify-center shrink-0"><X className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ━━━━━━━━━━━ ADDITIONAL MODALS ━━━━━━━━━━━

function CustomPlanModal({ onClose, customPagesInput, setCustomPagesInput, customDurationInput, setCustomDurationInput, customPlanType, setCustomPlanType, onSave }: any) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl p-8" dir="rtl">
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <h3 className="text-lg font-black text-white flex items-center gap-3"><Target className="w-5 h-5 text-primary" /> إنشاء خطة حفظ مخصصة</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-4.5 h-4.5 text-white/40" /></button>
          </div>

          <div className="py-6 space-y-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button onClick={() => setCustomPlanType('pages')} className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", customPlanType === 'pages' ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white")}>حسب الورد اليومي (صفحات)</button>
              <button onClick={() => setCustomPlanType('duration')} className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", customPlanType === 'duration' ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white")}>حسب مدة الختم (أشهر)</button>
            </div>

            {customPlanType === 'pages' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">عدد الصفحات يومياً:</span>
                  <span className="text-sm font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">{customPagesInput} صفحات</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={customPagesInput}
                  onChange={(e) => setCustomPagesInput(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 mt-4">
                  <p className="text-[11px] font-tajawal text-white/50 leading-relaxed">
                    بمعدل حفظ <strong className="text-primary font-black">{customPagesInput} صفحات</strong> يومياً، ستختم القرآن الكريم كاملاً في غضون:
                  </p>
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~ {Math.round(604 / (customPagesInput * 30)) || 1} أشهر تقريباً</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">المدة المطلوبة للختم:</span>
                  <span className="text-sm font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">{customDurationInput} أشهر</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="36"
                  step="1"
                  value={customDurationInput}
                  onChange={(e) => setCustomDurationInput(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 mt-4">
                  <p className="text-[11px] font-tajawal text-white/50 leading-relaxed">
                    لتتمكن من الختم في غضون <strong className="text-primary font-black">{customDurationInput} أشهر</strong>، سيتوجب عليك يومياً حفظ:
                  </p>
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>~ {Math.round((604 / (customDurationInput * 30)) * 10) / 10} صفحة يومياً</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/5">
            <button onClick={onSave} className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-primary">تفعيل الخطة المخصصة</button>
            <button onClick={onClose} className="px-6 py-4 bg-white/5 text-white/60 rounded-2xl font-black text-xs hover:bg-white/10 transition-all">إلغاء</button>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function TajweedGuideModal({ onClose }: any) {
  const rules = [
    {
      title: 'أحكام النون الساكنة والتنوين', items: [
        { name: 'الإظهار', desc: 'إخراج الحرف من مخرجه دون غنة. حروفه: (ء، هـ، ع، ح، غ، خ)', color: 'bg-blue-500/10 border-blue-500/20 text-blue-300' },
        { name: 'الإدغام', desc: 'دمج النون في الحرف التالي بغنة أو بدونها. حروفه: (ي، ر، م، ل، و، ن)', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
        { name: 'الإقلاب', desc: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند حرف (الباء)', color: 'bg-amber-500/10 border-amber-500/20 text-amber-300' },
        { name: 'الإخفاء', desc: 'نطق الحرف بحالة بين الإظهار والإدغام مع الغنة. بقية الحروف الـ 15', color: 'bg-violet-500/10 border-violet-500/20 text-violet-300' }
      ]
    },
    {
      title: 'المدود الأساسية', items: [
        { name: 'المد الطبيعي', desc: 'مد بمقدار حركتين عند انعدام الهمز أو السكون بعد حرف المد', color: 'bg-rose-500/10 border-rose-500/20 text-rose-300' },
        { name: 'المد المتصل', desc: 'أن يقع الهمز بعد حرف المد في كلمة واحدة، ويمد 4 أو 5 حركات واجبة', color: 'bg-purple-500/10 border-purple-500/20 text-purple-300' },
        { name: 'المد المنفصل', desc: 'أن يقع حرف المد في كلمة والهمز في الكلمة التالية، ويمد 4 أو 5 حركات جائزة', color: 'bg-orange-500/10 border-orange-500/20 text-orange-300' }
      ]
    }
  ];

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-4xl max-h-[85vh] flex flex-col" dir="rtl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
            <h3 className="text-xl font-black text-white flex items-center gap-3"><Star className="w-5 h-5 text-primary" /> دليل أحكام التجويد المبسط</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
          </div>

          <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
            {rules.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-r-2 border-primary pr-3">{section.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={cn(
                        "p-5 border rounded-2xl space-y-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-white/20 select-none",
                        item.color
                      )}
                    >
                      <h5 className="font-bold text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.name}
                      </h5>
                      <p className="text-white/70 text-[11px] leading-relaxed font-tajawal">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-white/5 bg-black/50 flex justify-end shrink-0">
            <button onClick={onClose} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:scale-105 transition-all">فهمت</button>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

// ━━━━━━━━━━━ SMART AI CHAT COMPANION SUPPORT ━━━━━━━━━━━

function TafseerChatModal({ verse, messages, isListLoading, connectionMode, onClose, onSendMessage, chatInput, setChatInput }: any) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-4xl max-h-[85vh] flex flex-col" dir="rtl">

          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black text-white">رفيق التفسير والتدبر الذكي 🤖</h3>
                <p className="text-[10px] text-white/40">سورة {verse.surah} • آية {verse.ayahNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[9px] font-black border",
                connectionMode === 'online'
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}>
                {connectionMode === 'online' ? "متصل بالذكاء الاصطناعي 🟢" : "وضع التدبر المحلي 🟠"}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-4.5 h-4.5 text-white/40" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-black/[0.15]">
            {messages.map((msg: any, idx: number) => {
              const isAssistant = msg.role === 'model' || msg.role === 'assistant';
              return (
                <div key={idx} className={cn("flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-top-2 duration-300", isAssistant ? "mr-0 ml-auto" : "ml-0 mr-auto flex-row-reverse")}>
                  <div className={cn("w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs", isAssistant ? "bg-primary/20 text-primary" : "bg-white/10 text-white/80")}>
                    {isAssistant ? '🤖' : '👤'}
                  </div>
                  <div className={cn("p-4 rounded-3xl text-xs leading-relaxed", isAssistant ? "bg-white/[0.03] border border-white/5 text-white/80" : "bg-primary text-primary-foreground font-semibold")}>
                    <p className="whitespace-pre-line font-tajawal">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {isListLoading && (
              <div className="flex gap-3 max-w-[85%] mr-0 ml-auto items-center animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs text-primary">🤖</div>
                <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 text-white/40 text-[11px] font-tajawal">جاري التدبر والتأمل في الآية...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Recommendations */}
          {messages.length === 1 && (
            <div className="p-4 bg-black/40 border-t border-white/5 space-y-2 shrink-0">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right mb-1">أسئلة مقترحة للتدبر:</p>
              <div className="flex flex-wrap gap-2 justify-start">
                <button onClick={() => onSendMessage('ما البلاغة والإعجاز اللغوي في هذه الآية الكريمة؟')} className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">✨ بلاغة الآية وإعجازها</button>
                <button onClick={() => onSendMessage('ما هو سبب نزول هذه الآية الكريمة؟')} className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">📜 سبب النزول</button>
                <button onClick={() => onSendMessage('ما هي الدروس والعبر المستفادة من هذه الآية للعمل بها في حياتي؟')} className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">💡 الدروس والعبر</button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-black/50 shrink-0 flex gap-2 items-center">
            <input
              type="text"
              placeholder="اكتب سؤالك الخاص حول تفسير الآية أو بلاغتها..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
              disabled={isListLoading}
              className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-tajawal"
            />
            <button
              onClick={() => onSendMessage()}
              disabled={isListLoading || !chatInput.trim()}
              className="p-3.5 bg-primary text-primary-foreground rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5 transform rotate-180" />
            </button>
          </div>

        </motion.div>
      </div>
    </ModalPortal>
  );
}

const LOCAL_SCHOLAR_DB: Record<string, { rhetoric: string; revelation: string; lessons: string }> = {
  "2:255": {
    rhetoric: "آية الكرسي هي أعظم آية في القرآن. فيها من البلاغة ما يبهر العقول: الفواصل الموسيقية الهادئة المتسقة، التكرار اللطيف لأسماء الله الحسنى، والتقابل البديع بين (السماوات والأرض)، وطباق السلب بين (لا تأخذه) و(ولا نوم)، والأسلوب الخبري المؤكد لحفظ الكون وعلو الخالق سبحانه وتعالى.",
    revelation: "لم يرد سبب نزول خاص ثابت لآية الكرسي بخصوص مناسبة معينة، بل نزلت بياناً لعظمة الخالق وإثباتاً لتوحيد الألوهية والربوبية والأسماء والصفات، وهي تعد مستقلاً بذاته كأعظم آية تصف جلال الله سبحانه وتعالى.",
    lessons: "1. إثبات انفراد الله بالملك والتدبير والقيومية.\n2. إثبات الشفاعة بإذن الله وحده.\n3. سعة علم الله المحيط بالماضي والحاضر والمستقبل.\n4. عظمة سلطان الله وحفظه للكون بلا مشقة أو تعب."
  },
  "1:1": {
    rhetoric: "سورة الفاتحة تسمى الشافية والوافية. البلاغة فيها تتجلى في افتتاحها بـ (الحمد لله) بصيغة الاسم الدال على الثبوت والاستمرار، والالتفات البديع من الغيبة (الحمد لله رب العالمين) إلى الخطاب والدعاء المباشر (إياك نعبد وإياك نستعين) استشعاراً للقرب والعبودية.",
    revelation: "نزلت سورة الفاتحة بمكة بمناسبة فرض الصلاة، وقيل نزلت مرتين تعظيماً لشأنها (مرة بمكة ومرة بالمدينة)، وهي ركيزة الصلاة ومفتاح القرآن الكريم.",
    lessons: "1. وجوب إخلاص العبادة والاستعانة بالله وحده.\n2. إثبات الهداية إلى الصراط المستقيم كأعظم نعمة.\n3. التحذير من طريق المغضوب عليهم والضالين."
  }
};

const getLocalFallbackExplanation = (surahName: string, ayahNumber: string, arabicText: string, type: 'rhetoric' | 'revelation' | 'lessons') => {
  const shortText = arabicText.length > 40 ? `${arabicText.slice(0, 40)}...` : arabicText;
  if (type === 'rhetoric') {
    return `التأمل البلاغي والجمالي لآية ${ayahNumber} من سورة ${surahName} (${shortText}):\n\nتتجلى البلاغة الإعجازية في هذا الموضع من خلال انتقاء الحروف المتناغمة والفواصل الصوتية الدقيقة. تعزز الآية المعنى الموجه للقلب عبر الطباق أو المقابلة والتقديم والـتأخير بما يفيد الحصر والتعظيم لجلال الله وأحكام رسالته.`;
  } else if (type === 'revelation') {
    return `سبب النزول والسياق التاريخي لآية ${ayahNumber} من سورة ${surahName}:\n\nنزلت هذه الآية الكريمة في إطار توجيه المسلمين وتثبيتهم إبان العهد النبوي الشريف. تقرر الآية قاعدة إيمانية أو حكماً تشريعياً استجابةً لتساؤلات الصحابة أو تعقيباً على أحداث ووقائع تاريخية واكبت نزول الوحي.`;
  } else {
    return `أهم الدروس والعظات المستخلصة لآية ${ayahNumber} من سورة ${surahName}:\n\n` +
      `1. استشعار الرقابة الإلهية الدائمة في السر والعلن واللجوء المستمر للخالق تضرعاً وطاعة.\n` +
      `2. العمل بوجيه التوجيهات القرآنية والأحكام الشرعية المتضمنة بالآية وتطبيقها في السلوك اليومي.\n` +
      `3. التدبر الدائم والتأمل الواعي في دلالات الوحي لزيادة منسوب اليقين وثبات القلوب.`;
  }
};
