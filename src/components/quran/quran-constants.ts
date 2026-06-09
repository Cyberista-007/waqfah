import { Clock, Target, CheckCircle2, Trophy } from 'lucide-react';

export type SurahInfo = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

export type RadioStation = {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  icon: string;
  color: string;
  borderColor: string;
  textColor: string;
  channelId?: string;
  publishedAt?: string;
};

export const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', icon: '🎙️' },
  { id: 'ar.husary', name: 'محمود خليل الحصري', icon: '📖' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', icon: '✨' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', icon: '🌙' },
];

export const TAFSEERS = [
  { id: 'ar.muyassar', name: 'التفسير الميسر' },
  { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
  { id: 'ar.qurtubi', name: 'تفسير القرطبي' },
  { id: 'ar.waseet', name: 'التفسير الوسيط (طنطاوي)' },
  { id: 'ar.baghawi', name: 'تفسير البغوي' },
  { id: 'ar.miqbas', name: 'تفسير ابن عباس (تنوير المقباس)' },
];

export const SCRIPTS = [
  { id: 'uthmani', name: 'مصحف المدينة (رسم عثماني)', edition: 'quran-uthmani', font: 'font-quran' },
  { id: 'simple', name: 'رسم إملائي (بسيط)', edition: 'quran-simple', font: 'font-amiri' },
];

export const TOPICS = [
  { id: 'all', label: 'الكل' },
  { id: 'iman', label: 'الإيمان' },
  { id: 'sabr', label: 'الصبر والتوكل' },
  { id: 'rahma', label: 'الرحمة والمغفرة' },
  { id: 'memorized', label: 'المحفوظات' },
  { id: 'bookmarks', label: 'الإشارات المرجعية' },
];

export const MEMO_PLANS = [
  { id: '1year', label: 'ختمة في سنة', months: 12, pagesPerDay: 1.7 },
  { id: '2years', label: 'ختمة في سنتين', months: 24, pagesPerDay: 0.8 },
  { id: '6months', label: 'ختمة في 6 أشهر', months: 6, pagesPerDay: 3.3 },
  { id: 'custom', label: 'خطة مخصصة', months: 0, pagesPerDay: 0 },
];

export const TRANSLATIONS = [
  { id: 'en.sahih', name: 'English (Sahih Intl)', lang: 'en' },
  { id: 'fr.hamidullah', name: 'Français (Hamidullah)', lang: 'fr' },
  { id: 'ur.maududi', name: 'اردو (Maududi)', lang: 'ur' },
  { id: 'tr.ates', name: 'Türkçe (Süleyman Ateş)', lang: 'tr' },
];

export const SEMANTIC_TOPICS = [
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
      { surah: 20, ayah: 14, text: 'إِنَّنيِ أَنَا اللَّه لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي وَأَقِمِ الصَّلَاةَ لِذِكْرِي' },
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
      { surah: 2, ayah: 275, text: 'الَّذِينَ يَأْكُلُونَ الرِّبَا لَا يَقُومُونَ إِلَّا كَمَا يَقُومُ الَّذِي يَتَخَبَّطُهُ الشَّيْطَانُ مِنَ الْمَسِّ ۚ ذَٰلِكَ بِأَنهمْ قَالُوا إِنَّمَا الْبَيْعُ مِثْلُ الرِّبَا ۗ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
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

export const AMBIENT_SOUNDS = [
  { id: 'rain', name: '🌧️ مطر هادئ', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  { id: 'birds', name: '🌲 عصافير الغابة', url: 'https://actions.google.com/sounds/v1/animals/forest_birds.ogg' },
  { id: 'river', name: '💧 خرير الماء', url: 'https://actions.google.com/sounds/v1/water/river_flowing.ogg' },
  { id: 'night', name: '🌙 هدوء الليل', url: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' },
];

export const PREMIUM_RECITERS_STATIONS: RadioStation[] = [
  {
    id: 'premium_maher',
    name: 'القارئ ماهر المعيقلي 🎙️',
    subtitle: 'بث مباشر على مدار الساعة',
    url: 'https://backup.qurango.net/radio/maher',
    icon: '🎙️',
    color: 'from-amber-500/20 to-amber-950/40',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400'
  },
  {
    id: 'premium_basit',
    name: 'القارئ عبد الباسط عبد الصمد 🌙',
    subtitle: 'نوادر التلاوات والمحافل الخارجية',
    url: 'https://backup.qurango.net/radio/basit',
    icon: '🌙',
    color: 'from-emerald-500/20 to-emerald-950/40',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400'
  },
  {
    id: 'premium_alafasy',
    name: 'القارئ مشاري بن راشد العفاسي ✨',
    subtitle: 'المصحف المرتل العذب',
    url: 'https://backup.qurango.net/radio/alafasy',
    icon: '✨',
    color: 'from-blue-500/20 to-blue-950/40',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400'
  },
  {
    id: 'premium_minshawi',
    name: 'القارئ محمد صديق المنشاوي 📖',
    subtitle: 'مدرسة الترتيل والخشوع والخضوع',
    url: 'https://backup.qurango.net/radio/minshawi',
    icon: '📖',
    color: 'from-rose-500/20 to-rose-950/40',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400'
  },
  {
    id: 'premium_yasser',
    name: 'القارئ ياسر الدوسري 🌟',
    subtitle: 'تلاوات خاشعة من الحرمين الشريفين',
    url: 'https://backup.qurango.net/radio/yasser',
    icon: '🌟',
    color: 'from-cyan-500/20 to-cyan-950/40',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400'
  },
  {
    id: 'premium_ajm',
    name: 'القارئ أحمد بن علي العجمي ⚡',
    subtitle: 'تلاوة مرتلة برواية حفص عن عاصم',
    url: 'https://backup.qurango.net/radio/ajm',
    icon: '⚡',
    color: 'from-yellow-500/20 to-yellow-950/40',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400'
  },
  {
    id: 'premium_sds',
    name: 'القارئ عبد الرحمن السديس 🏛️',
    subtitle: 'رئيس الشؤون الدينية للمسجد الحرام',
    url: 'https://backup.qurango.net/radio/sds',
    icon: '🏛️',
    color: 'from-purple-500/20 to-purple-950/40',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400'
  },
  {
    id: 'premium_shur',
    name: 'القارئ سعود الشريم 🕋',
    subtitle: 'تلاوات الحرم المكي الشريف التاريخية',
    url: 'https://backup.qurango.net/radio/shur',
    icon: '🕋',
    color: 'from-indigo-500/20 to-indigo-950/40',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-400'
  },
  {
    id: 'premium_gmd',
    name: 'القارئ سعد الغامدي 🍃',
    subtitle: 'المصحف المرتل برواية حفص',
    url: 'https://backup.qurango.net/radio/s_gmd',
    icon: '🍃',
    color: 'from-teal-500/20 to-teal-950/40',
    borderColor: 'border-teal-500/30',
    textColor: 'text-teal-400'
  },
  {
    id: 'premium_frs',
    name: 'القارئ فارس عباد 🕊️',
    subtitle: 'بث مباشر عذب وخاشع',
    url: 'https://backup.qurango.net/radio/frs_a',
    icon: '🕊️',
    color: 'from-violet-500/20 to-violet-950/40',
    borderColor: 'border-violet-500/30',
    textColor: 'text-violet-400'
  }
];

export const MEMORIZATION_STATUS = {
  'not-started': { label: 'لم تبدأ', color: 'text-white/20', icon: Clock, bg: 'bg-white/5' },
  'memorizing': { label: 'جاري الحفظ', color: 'text-amber-400', icon: Target, bg: 'bg-amber-500/10' },
  'completed': { label: 'تم الحفظ', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10' },
  'reviewed': { label: 'تمت المراجعة', color: 'text-blue-400', icon: Trophy, bg: 'bg-blue-500/10' },
};

export const CARD_THEMES = [
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

export const CARD_PATTERNS = [
  { id: 'none', label: 'بدون', css: '', url: '' },
  { id: 'arabesque', label: 'أرابيسك', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGNpcmNsZSBjeD0nMjAnIGN5PTIwJyByPScxNScgZmlsbD0nbm9uZScgc3Ryb2tlPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxjaXJjbGUgY3g9JzAnIGN5PScwJyByPScxNScgZmlsbD0nbm9uZScgc3Ryb2tlPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxjaXJjbGUgY3g9JzQwJyBjeT0nMCcgcj0nMTUnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48Y2lyY2xlIGN4PScwJyBjeT0nNDAnIHI9JzE1JyBmaWxsPSdub25lJyBzdHJva2U9J3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknIHN0cm9rZS13aWR0aD0nMS41Jy8+PGNpcmNsZSBjeD0nNDAnIGN5PSc0MCcgcj0nMTUnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48L3N2Zz4=" },
  { id: 'geometry', label: 'هندسي', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3QgeD0nMTAnIHk9JzEwJyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjIpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxyZWN0IHg9JzEwJyB5PScxMCcgd2lkdGg9JzIwJyBoZWlnaHQ9JzIwJyBmaWxsPSdub25lJyBzdHJva2U9J3JnYmEoMjU1LDI1NSwyNTUsMC4yKScgc3Ryb2tlLXdpZHRoPScxLjUnIHRyYW5zZm9ybT0ncm90YXRlKDQ1IDIwIDIwKScvPjwvc3ZnPg==" },
  { id: 'diamonds', label: 'معين', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTEwIDBMMjAgMTBMMTAgMjBMMCAxMFonIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48L3N2Zz4=" },
  { id: 'hexagons', label: 'سداسي', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjgnIGhlaWdodD0nNDknIHZpZXdCb3g9JzAgMCAyOCA0OScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz4gPGcgZmlsbD0nbm9uZScgc3Ryb2tlPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJyBzdHJva2Utd2lkdGg9JzEuNSc+PHBhdGggZD0nM00xMy45OSA5LjI1bDEzIDcuNXYxNWwtMTMgNy41TDEgMzEuNzV2LTE1bDEyLjk5LTcuNVowIDExLjhsMTIuOTgtNy41VjEuNWgxNXYyLjhsMTIuOTkgNy41TDI3Ljk5IDE5LjN2MTAuNGwxMi45OSA3LjV2MTAuNGwtMTIuOTkgNy41VjU4aC0xNXYtMi44bC0xMi45OC03LjVMMCAzNy43di0xMC40bC0xMi45OC03LjVWOS40bDEyLjk4LTcuNXonLz48L2c+PC9zdmc+" },
  { id: 'stars', label: 'نجوم', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTIwIDE1IEwyMSAxOSBMMjUgMjAgTDIxIDIxIEwyMCAyNSBMMTkgMjEgTDE1IDIwIEwxOSAxOSBaIE01IDUgTDUuNSA2LjUgTDcgNyBMNS41IDcuNSBMNSA5IEw0LjUgNy41IEwzIDcgTDQuNSA2LjUgWicgZmlsbD0ncmdiYSgyNTUsMjU1LDI1NSwwLjMpJy8+PC9zdmc+" },
];

export const CARD_FRAMES = [
  { id: 'none', label: 'بدون', border: '' },
  { id: 'minimal', label: 'بسيط', border: 'border-2 border-white/40 m-4 rounded-[2rem]' },
  { id: 'elegant', label: 'أنيق', border: 'border-[1px] border-white/60 m-8 rounded-[1rem]' },
  { id: 'classic', label: 'كلاسيك', border: 'border-8 border-double border-white/40 m-6 rounded-[1.5rem]' },
  { id: 'mihrab', label: 'محراب', border: 'border-4 border-b-0 border-white/50 m-6 rounded-t-full' },
  { id: 'double', label: 'مضاعف', border: 'border-4 border-white/30 m-4 rounded-[2.5rem] before:content-[""] before:absolute before:inset-2 before:border-2 before:border-white/20 before:rounded-[2rem]' },
];

export const SURAH_JUZ_MAPPING: { [key: number]: number } = {
  1: 1, 2: 1, 3: 3, 4: 4, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 11, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 16, 20: 16, 21: 17, 22: 17, 23: 18, 24: 18, 25: 19, 26: 19, 27: 19, 28: 20, 29: 20, 30: 21, 31: 21, 32: 21, 33: 21, 34: 22, 35: 22, 36: 22, 37: 23, 38: 23, 39: 23, 40: 24, 41: 24, 42: 25, 43: 25, 44: 25, 45: 25, 46: 26, 47: 26, 48: 26, 49: 26, 50: 26, 51: 26, 52: 27, 53: 27, 54: 27, 55: 27, 56: 27, 57: 27, 58: 28, 59: 28, 60: 28, 61: 28, 62: 28, 63: 28, 64: 28, 65: 28, 66: 28, 67: 29, 68: 29, 69: 29, 70: 29, 71: 29, 72: 29, 73: 29, 74: 29, 75: 29, 76: 29, 77: 29, 78: 30, 79: 30, 80: 30, 81: 30, 82: 30, 83: 30, 84: 30, 85: 30, 86: 30, 87: 30, 88: 30, 89: 30, 90: 30, 91: 30, 92: 30, 93: 30, 94: 30, 95: 30, 96: 30, 97: 30, 98: 30, 99: 30, 100: 30, 101: 30, 102: 30, 103: 30, 104: 30, 105: 30, 106: 30, 107: 30, 108: 30, 109: 30, 110: 30, 111: 30, 112: 30, 113: 30, 114: 30
};

export const JUZ_DATA = [
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
