import {
  Star, Sparkles, BookMarked, Compass, Sun, Layers
} from 'lucide-react';

export const PILLARS = [
  {
    id: 'allah',
    label: 'الإيمان بالله',
    sublabel: 'التوحيد الخالص',
    icon: Star,
    color: 'text-amber-400',
    bg: 'from-amber-950/50 to-orange-950/30',
    border: 'border-amber-500/30',
    articles: [
      {
        id: 'tawhid-rububiyyah',
        title: 'توحيد الربوبية',
        body: 'الإقرار بأن الله وحده هو الخالق الرازق المدبر لأمور الكون، لا شريك له في ذلك.',
        evidence: 'وَلَئِن سألتهم من خلق السماوات والأرض ليقولن الله'
      },
      {
        id: 'tawhid-uluhiyyah',
        title: 'توحيد الألوهية',
        body: 'إفراد الله بالعبادة؛ من صلاة ودعاء وتوكل وذبح ونذر، وهو الغاية من خلق الجن والإنس.',
        evidence: 'وَمَا خلقت الجن والإنس إلا ليعبدون'
      }
    ]
  },
  {
    id: 'angels',
    label: 'الإيمان بالملائكة',
    sublabel: 'عالم النور والطاعة',
    icon: Sparkles,
    color: 'text-sky-400',
    bg: 'from-sky-950/50 to-cyan-950/30',
    border: 'border-sky-500/30',
    articles: [
      {
        id: 'angels-nature',
        title: 'طبيعة الملائكة',
        body: 'خلقهم الله من نور، لا يعصون الله ما أمرهم ويفعلون ما يؤمرون، ولهم وظائف كالوحي والقبض.',
        evidence: 'لَا يَعْصُونَ اللَّهَ مَا أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ'
      }
    ]
  },
  {
    id: 'books',
    label: 'الإيمان بالكتب',
    sublabel: 'الوحي المنزّل',
    icon: BookMarked,
    color: 'text-emerald-400',
    bg: 'from-emerald-950/50 to-teal-950/30',
    border: 'border-emerald-500/30',
    articles: [
      {
        id: 'books-quran',
        title: 'القرآن الكريم',
        body: 'كلام الله حقيقة، أُنزل على محمد ﷺ، وهو المحفوظ من التحريف والمهيمن على ما قبله.',
        evidence: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ'
      }
    ]
  },
  {
    id: 'messengers',
    label: 'الإيمان بالرسل',
    sublabel: 'قافلة الهداة',
    icon: Compass,
    color: 'text-violet-400',
    bg: 'from-violet-950/50 to-purple-950/30',
    border: 'border-violet-500/30',
    articles: [
      {
        id: 'messengers-duty',
        title: 'رسالة الأنبياء',
        body: 'تبليغ الوحي ودعوة الناس لتوحيد الله، وهم بشر معصومون في التبليغ.',
        evidence: 'وَلَقَدْ بَعَثْنَا فِي كُلِّ أُمَّةٍ رَسُولاً أَنِ اعْبُدُوا اللَّهَ'
      }
    ]
  },
  {
    id: 'lastday',
    label: 'الإيمان باليوم الآخر',
    sublabel: 'الدار الباقية',
    icon: Sun,
    color: 'text-orange-400',
    bg: 'from-orange-950/50 to-red-950/30',
    border: 'border-orange-500/30',
    articles: [
      {
        id: 'lastday-meaning',
        title: 'البعث والحساب',
        body: 'الإيمان بالحياة بعد الموت، والحشر، والميزان، والجنة والنار كجزاء عادل.',
        evidence: 'ثُمَّ إِنَّكُمْ يَوْمَ الْقِيَامَةِ تُبْعَثُونَ'
      }
    ]
  },
  {
    id: 'qadar',
    label: 'الإيمان بالقدر',
    sublabel: 'العلم المحيط',
    icon: Layers,
    color: 'text-rose-400',
    bg: 'from-rose-950/50 to-pink-950/30',
    border: 'border-rose-500/30',
    articles: [
      {
        id: 'qadar-levels',
        title: 'مراتب القدر الأربعة',
        body: 'الإيمان بعلم الله القديم، وكتابته لكل شيء، ومشيئته النافذة، وخلقه لكل كائن.',
        evidence: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ'
      }
    ]
  }
];

export const TERMINOLOGY = [
  {
    title: 'العقيدة',
    definition: 'ما ينعقد عليه القلب جازماً به، وهي القواعد الإيمانية التي لا يقبل فيها الشك.',
  },
  {
    title: 'التوحيد',
    definition: 'إفراد الله سبحانه بما يختص به من الربوبية والألوهية والأسماء والصفات.',
  },
  {
    title: 'الولاء والبراء',
    definition: 'محبة المؤمنين ونصرتهم، وبغض الكفر والباطل والتبرؤ منه.',
  },
];
