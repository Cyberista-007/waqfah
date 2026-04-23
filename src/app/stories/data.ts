import { Sparkles, BookOpen, Quote, ShieldCheck, Heart, Users, Star } from 'lucide-react';

export type Story = {
  id: string;
  title: string;
  source: 'quran' | 'sunnah';
  category: 'prophets' | 'parables' | 'sahaba' | 'reflections' | 'sunnah';
  summary: string;
  content: string;
  lesson: string;
  reference: string;
  image?: string;
  color: string;
  bg: string;
  border: string;
};

export type StoryCategory = {
  id: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
};

export const STORY_CATEGORIES: StoryCategory[] = [
  {
    id: 'prophets',
    label: 'قصص الأنبياء',
    icon: Sparkles,
    color: 'text-amber-400',
    bg: 'from-amber-950/50 to-amber-900/20',
    border: 'border-amber-500/30'
  },
  {
    id: 'parables',
    label: 'أمثال وقصص القرآن',
    icon: BookOpen,
    color: 'text-emerald-400',
    bg: 'from-emerald-950/50 to-emerald-900/20',
    border: 'border-emerald-500/30'
  },
  {
    id: 'sunnah',
    label: 'قصص السنة النبوية',
    icon: Quote,
    color: 'text-blue-400',
    bg: 'from-blue-950/50 to-blue-900/20',
    border: 'border-blue-500/30'
  },
  {
    id: 'sahaba',
    label: 'مواقف الصحابة',
    icon: ShieldCheck,
    color: 'text-rose-400',
    bg: 'from-rose-950/50 to-rose-900/20',
    border: 'border-rose-500/30'
  }
];

export const STORIES: Story[] = [
  {
    id: 'yusuf-dream',
    title: 'تأويل رؤيا يوسف عليه السلام',
    source: 'quran',
    category: 'prophets',
    summary: 'قصة صبر يوسف عليه السلام وكيف تحول السجن إلى ملك والضيق إلى فرج.',
    content: 'بدأ الخبر برؤيا صادقة رآها يوسف في صباه، فأسرها له أبوه خوفاً من كيد إخوته. تتابعت الأحداث من البئر إلى الرق، ثم فتنة امرأة العزيز، فالسجن بضع سنين. وفي كل ذلك كان يوسف مثالاً للعفة والأمانة حتى مكن الله له في الأرض وأصبح على خزائن مصر، فجمع الله شمله بأهله وتجلت قدرة الله في تحقيق وعده الصادق.',
    lesson: 'الصبر مفتاح الفرج، وحسن الظن بالله هو سبيل التمكين، وأن كيد البشر لا يغلب قدر الله.',
    reference: 'سورة يوسف',
    color: 'text-amber-400',
    bg: 'from-amber-950/40 to-transparent',
    border: 'border-amber-500/20'
  },
  {
    id: 'cave-companions',
    title: 'قصة أصحاب الكهف',
    source: 'quran',
    category: 'parables',
    summary: 'فتية آمنوا بربهم فزادهم الله هدى وحفظهم في كهفهم مئات السنين.',
    content: 'خرج فتية من قومهم فراراً بدينهم، فآووا إلى كهف موحش، لكنه كان برحمة الله أوسع من قصور الظلم. ضرب الله على آذانهم فناموا ثلاثمئة سنين وتسعة، وشملتهم رعاية الله بأن يقلبهم ذات اليمين وذات الشمال، حتى استيقظوا في زمن آمن فيه الناس بالبعث، فكانوا آية باقية على قدرة الله.',
    lesson: 'الإيمان بالله هو العاصم من الفتن، وبذل الأسباب مع التوكل يثمر رعاية إلهية تتجاوز نواميس الكون.',
    reference: 'سورة الكهف',
    color: 'text-emerald-400',
    bg: 'from-emerald-950/40 to-transparent',
    border: 'border-emerald-500/20'
  },
  {
    id: 'cave-locked-three',
    title: 'الثلاثة الذين انطبقت عليهم الصخرة',
    source: 'sunnah',
    category: 'sunnah',
    summary: 'ثلاثة رجال أطبق عليهم الغار صخرة ضخمة، فتوسلوا إلى الله بصالح أعمالهم.',
    content: 'انطلق ثلاثة رهط ممن قبلكم في رحلة، فآواهم المبيت إلى غار، فانحطت صخرة من الجبل فسدت عليهم الغار. فقالوا: إنه لا ينجيكم من هذه الصخرة إلا أن تدعو الله بصالح أعمالكم. فتوسل الأول ببره بوالديه، والثاني بعفته عن الحرام، والثالث بأمانته في مال الأجير، فانفرجت الصخرة فخرجوا يمشون.',
    lesson: 'الإخلاص في العمل الصالح هو المنجي في الكربات، وبر الوالدين والعفة والأمانة من أعظم القربات.',
    reference: 'صحيح البخاري ومسلم',
    color: 'text-blue-400',
    bg: 'from-blue-950/40 to-transparent',
    border: 'border-blue-500/20'
  },
  {
    id: 'kill-99',
    title: 'الرجل الذي قتل مئة نفس',
    source: 'sunnah',
    category: 'sunnah',
    summary: 'رجل أسرف على نفسه بالقتل ثم طلب التوبة، فرحمة الله وسعت خطيئته.',
    content: 'كان فيمن كان قبلكم رجل قتل تسعة وتسعين نفساً، فسأل عن أعلم أهل الأرض، فدُل على راهب، فقال: له توبة؟ قال: لا، فقتله فكمل به مئة. ثم سأل عن عالم فدُل عليه، فقال: نعم، ومن يحول بينه وبين التوبة؟ وأمره بالهجرة إلى أرض صالحة. وفي طريقه قبضه الموت، فاختصمت فيه ملائكة الرحمة والعذاب، فنحاه الله لملائكة الرحمة بقليل من المسافة.',
    lesson: 'باب التوبة مفتوح مهما عظمت المعاصي، وصحبة الصالحين وهجر بيئة المعصية من شروط الثبات.',
    reference: 'صحيح مسلم',
    color: 'text-cyan-400',
    bg: 'from-cyan-950/40 to-transparent',
    border: 'border-cyan-500/20'
  },
  {
    id: 'abu-bakr-migration',
    title: 'أبو بكر في الغار مع النبي ﷺ',
    source: 'sunnah',
    category: 'sahaba',
    summary: 'موقف الصديق رضي الله عنه في حماية النبي ﷺ أثناء الهجرة.',
    content: 'في غار ثور، كان المشركون على بعد أقدام قليلة. نظر أبو بكر إلى أقدامهم وقال بصوت خائف على النبي: يا رسول الله، لو نظر أحدكم تحت قدميه لرآنا. فأجابه النبي ﷺ باليقين الذي لا يتزعزع: "ما ظنك يا أبا بكر باثنين الله ثالثهما؟". فأنزل الله سكينته عليهما وأيدهما بجنود لم يروها.',
    lesson: 'اليقين بالله يطرد الخوف، والصحبة الصالحة تتجلى في أحلك الظروف بفداء الروح للدين.',
    reference: 'سورة التوبة والحديث الصحيح',
    color: 'text-rose-400',
    bg: 'from-rose-950/40 to-transparent',
    border: 'border-rose-500/20'
  }
];
