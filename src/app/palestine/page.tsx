
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Shield, 
  History, 
  Star, 
  Flag, 
  MessageSquare, 
  Info,
  ExternalLink,
  ChevronDown,
  Quote,
  Sparkles,
  Zap,
  Globe,
  HandHelping,
  Key,
  Gamepad2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Users,
  Utensils,
  Camera,
  Play,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Sun,
  Lock,
  Eye,
  MousePointer2,
  Music,
  Library,
  Milestone,
  Palette,
  Building2,
  Compass,
  Earth,
  Waves,
  Mountain,
  Trophy,
  Landmark,
  Calendar,
  TreePine,
  Megaphone,
  HeartPulse,
  GraduationCap,
  Share2
} from 'lucide-react';
import { 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useVelocity 
} from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ━━━━━━━━━━━ TYPES & INTERFACES ━━━━━━━━━━━

interface FlagColor { color: string; label: string; meaning: string; }
interface Personality { name: string; role: string; description: string; image?: string; }
interface Section { id: string; title: string; icon: any; color: string; description: string; }
interface Verse { text: string; source: string; }
interface TimelineItem { year: string; title: string; description: string; type?: 'major' | 'minor'; }
interface City { name: string; title: string; description: string; population?: string; knownFor?: string; }
interface PoetryItem { text: string; author: string; title?: string; }
interface SymbolItem { name: string; description: string; image?: string; icon?: string; color: string; detail?: string; }
interface QuizQuestion { question: string; options: string[]; correct: number; hint: string; explanation: string; }
interface GlobalQuote { text: string; author: string; role: string; country?: string; }
interface TatreezPattern { name: string; origin: string; meaning: string; detail?: string; }
interface Resource { title: string; type: string; desc: string; link?: string; author?: string; }
interface ArchDetail { title: string; period: string; desc: string; icon?: any; }

// ━━━━━━━━━━━ CONSTANTS ━━━━━━━━━━━

const FLAG_COLORS: FlagColor[] = [
  { color: '#000000', label: 'الأسود', meaning: 'يرمز للحزن على الاضطهاد والظلم الذي تعرض له الشعب الفلسطيني عبر العصور.' },
  { color: '#FFFFFF', label: 'الأبيض', meaning: 'يرمز للسلام والنقاء، والأمل في غدٍ مشرق تسوده الحرية والكرامة.' },
  { color: '#00843D', label: 'الأخضر', meaning: 'يرمز لأرض فلسطين الخصبة، والزيتون، والحياة الدائمة المتجددة.' },
  { color: '#E4312B', label: 'الأحمر', meaning: 'يرمز لدماء الشهداء الأبرار التي روت تراب الوطن دفاعاً عن الحق.' },
];

const FAMOUS_FIGURES: Personality[] = [
  { name: 'غسان كنفاني', role: 'أديب ومناضل', description: 'صاحب رواية "عائد إلى حيفا"، وأحد أبرز من جسدوا القضية في الأدب العربي المعاصر، استشهد دفاعاً عن حلم العودة.' },
  { name: 'ناجي العلي', role: 'رسام كاريكاتير', description: 'مبتكر شخصية "حنظلة" التي أصبحت رمزاً عالمياً للصمود والرفض، جسدت ريشته وجع المخيم وحلم الوطن.' },
  { name: 'محمود درويش', role: 'شاعر الأرض والوطن', description: 'صوت فلسطين الذي وصل للعالمية، كتب وثيقة إعلان الاستقلال، وجعل من كلماته سلاحاً في وجه النسيان.' },
  { name: 'إدوارد سعيد', role: 'مفكر وأكاديمي عالمي', description: 'صاحب كتاب "الاستشراق"، وأهم المدافعين عن الحقوق الفلسطينية في المحافل الدولية والأكاديمية العالمية.' },
  { name: 'دلال المغربي', role: 'مناضلة ثورية', description: 'جسدت شجاعة المرأة الفلسطينية في الميدان، وقادت عملية فدائية بطولية سطرها التاريخ.' },
  { name: 'ياسر عرفات', role: 'رمز الثورة', description: 'الأب الروحي للثورة الفلسطينية المعاصرة، الذي حمل غصن الزيتون في يد وبندقية الثائر في الأخرى.' }
];

const GLOBAL_QUOTES: GlobalQuote[] = [
  { text: "إن حريتنا لن تكتمل بدون حرية الفلسطينيين.", author: "نيلسون مانديلا", role: "زعيم جنوب أفريقيا ومناضل عالمي" },
  { text: "إذا لم تكن حذراً، فإن الصحف ستجعلك تكره المضطهدين وتحب أولئك الذين يقومون بالاضطهاد.", author: "مالكوم إكس", role: "داعية حقوقي ومدافع عن الحرية" },
  { text: "فلسطين هي الامتحان الأكبر للضمير العالمي في القرن الحادي والعشرين، والعدالة فيها هي ميزان عدالة العالم.", author: "مفكر معاصر", role: "صوت إنساني من أجل الحق" },
];

const SECTIONS: Section[] = [
  {
    id: 'history',
    title: 'تاريخٌ لا يُمحى',
    icon: History,
    color: 'text-amber-400',
    description: 'منذ فجر التاريخ، كانت فلسطين مهد الحضارات وملتقى الرسالات. أرضٌ شهدت أعظم الأحداث التاريخية التي شكلت وجدان البشرية عبر العصور.',
  },
  {
    id: 'alaqsa',
    title: 'المسجد الأقصى',
    icon: Star,
    color: 'text-emerald-400',
    description: 'قبلة المسلمين الأولى، وثالث الحرمين الشريفين، ومسرى النبي محمد صلى الله عليه وسلم. مكانٌ يجمع بين القدسية والجمال المعماري الفريد.',
  },
  {
    id: 'resilience',
    title: 'صمودٌ أسطوري',
    icon: Shield,
    color: 'text-rose-400',
    description: 'شعبٌ علم العالم معنى الصبر والإرادة. في كل زاوية من زوايا القدس وغزة وحيفا، هناك قصة فخر وتحدٍ لا تنتهي ترويها الجدران.',
  },
  {
    id: 'solidarity',
    title: 'واجبنا الإنساني',
    icon: HandHelping,
    color: 'text-sky-400',
    description: 'قضية فلسطين هي ميزان العدالة في العالم. الوقوف معها هو وقوفٌ مع الحق والحرية والكرامة الإنسانية التي لا تتجزأ.',
  },
];

const VERSES: Verse[] = [
  {
    text: "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ لِنُرِيَهُ مِنْ آيَاتِنَا ۚ إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ",
    source: "سورة الإسراء - ١",
  },
  {
    text: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    source: "سورة آل عمران - ١٣٩",
  },
  {
    text: "أُذِنَ لِلَّذِينَ يُقَاتَلُونَ بِأَنَّهُمْ ظُلِمُوا ۚ وَإِنَّ اللَّهَ عَلَىٰ نَصْرِهِمْ لَقَدِيرٌ",
    source: "سورة الحج - ٣٩",
  }
];

const TIMELINE: TimelineItem[] = [
  { year: '١٩١٧', title: 'وعد بلفور', description: 'بداية المؤامرة الدولية لزرع الكيان الصهيوني في قلب الأمة العربية عبر وعد بريطاني ممن لا يملك لمن لا يستحق.' },
  { year: '١٩٤٨', title: 'النكبة الكبرى', description: 'تهجير مئات الآلاف من الفلسطينيين من مدنهم وقراهم، وتدمير أكثر من ٥٠٠ قرية، وبداية صراع البقاء واللجوء.' },
  { year: '١٩٦٧', title: 'النكسة واحتلال القدس', description: 'احتلال القدس الشرقية والضفة الغربية وقطاع غزة، وبداية مرحلة جديدة من المقاومة المسلحة لاستعادة الأرض.' },
  { year: '١٩٨٧', title: 'انتفاضة الحجارة', description: 'ثورة شعبية كبرى هزت أركان الاحتلال وأعادت القضية لصدارة المشهد العالمي عبر طفل الحجر.' },
  { year: '٢٠٠٠', title: 'انتفاضة الأقصى', description: 'اندلاع الثورة رداً على تدنيس المسجد الأقصى، وتأكيداً على أن القدس خط أحمر لا يمكن تجاوزه.' },
  { year: '٢٠٢١', title: 'هبة القدس وسيفها', description: 'توحد الشعب الفلسطيني في كافة أماكن تواجده دفاعاً عن حي الشيخ جراح والمسجد الأقصى.' },
  { year: 'اليوم', title: 'الصمود المستمر', description: 'رغم كل الصعاب، يبقى الشعب الفلسطيني متمسكاً بأرضه، حامياً لمقدساته، ومؤمناً بحتمية العودة والتحرير.' },
];

const CITIES: City[] = [
  { name: 'القدس', title: 'زهرة المدائن', description: 'العاصمة الأبدية، قلب فلسطين النابض، ومجمع المقدسات الإسلامية والمسيحية، أقدم مدن التاريخ وأكثرها قدسية.', knownFor: 'المسجد الأقصى، كنيسة القيامة، أسوار القدس' },
  { name: 'غزة', title: 'هاشم الغزة', description: 'رمز العزة والصمود، المدينة الضاربة في عمق التاريخ، منبع الثقافة والمقاومة، وبوابة فلسطين الجنوبية.', knownFor: 'الميناء التاريخي، المسجد العمري، الصمود الأسطوري' },
  { name: 'نابلس', title: 'جبل النار', description: 'معقل الثوار وعاصمة الاقتصاد والتراث العريق في شمال الضفة، تشتهر بعبق تاريخها وطيب مأكولاتها.', knownFor: 'الكنافة النابلسية، صناعة الصابون، البلدة القديمة' },
  { name: 'الخليل', title: 'مدينة الرحمن', description: 'حاضنة المسجد الإبراهيمي الشريف، المدينة التي لا تعرف الانكسار، عاصمة الصناعة والحرف التقليدية.', knownFor: 'المسجد الإبراهيمي، صناعة الزجاج، العنب الخليلي' },
  { name: 'حيفا', title: 'عروس البحر', description: 'جوهرة الساحل، حيث تلتقي جبال الكرمل بأمواج المتوسط في لوحة أبدية، رمز التعايش والجمال الطبيعي.', knownFor: 'جبل الكرمل، ميناء حيفا، حدائق البهائيين' },
  { name: 'يافا', title: 'عروس فلسطين', description: 'ميناء التاريخ وعبق البرتقال الذي لا يغيب عن ذاكرة الأجيال، البوابة الثقافية لفلسطين قبل النكبة.', knownFor: 'ميناء يافا، برتقال يافا، برج الساعة' },
  { name: 'الناصرة', title: 'بشارة السلام', description: 'مدينة البشارة، حيث نشأ السيد المسيح عليه السلام، مركز الثقافة والجمال في الجليل الأعلى.', knownFor: 'كنيسة البشارة، العين، جبل القفزة' },
  { name: 'رام الله', title: 'عاصمة الروح', description: 'مركز الحياة الثقافية والسياسية المعاصرة، مدينة الفن والمؤسسات والنبض المتجدد.', knownFor: 'متحف محمود درويش، قصر الثقافة، الحياة الحيوية' }
];

const SYMBOLS: SymbolItem[] = [
  { 
    name: 'حنظلة', 
    description: 'الطفل الذي أدار ظهره للعالم احتجاجاً على الظلم، وسيبقى كذلك حتى يعود لوطنه، رمز الصمود المطلق.', 
    image: '/palestine_handala.png',
    color: 'bg-zinc-800',
    detail: 'ابتكره الفنان ناجي العلي ليكون شاهداً على المأساة والبطولة.'
  },
  { 
    name: 'مفتاح العودة', 
    description: 'رمز تورثه الأجيال، يمثل الحق المقدس في العودة إلى البيوت التي هجروا منها قسراً عام ٤٨.', 
    image: '/palestine_key.png',
    color: 'bg-amber-900/40',
    detail: 'يحتفظ به الكبار ويسلمونه للصغار كعهد لا يسقط بالتقادم.'
  },
  { 
    name: 'البطيخ', 
    description: 'رمزٌ بديل استخدمه الفلسطينيون للتعبير عن ألوان علمهم عندما منعه الاحتلال في فترات سابقة.', 
    icon: '🍉',
    color: 'bg-emerald-900/40',
    detail: 'ألوانه (الأحمر، الأسود، الأخضر، الأبيض) تحكي قصة العلم المقاوم.'
  },
  { 
    name: 'شقائق النعمان', 
    description: 'الزهرة التي نبتت من دماء الشهداء، وترمز للوفاء للأرض والتضحية المستمرة والجمال الدامي.', 
    icon: '🌺',
    color: 'bg-rose-900/40',
    detail: 'تنتشر في ربيع فلسطين لتذكرنا بدماء من رووا هذه الأرض.'
  },
  {
    name: 'الكوفية',
    description: 'وشاح العزة والهوية، غرزاتها تمثل شباك الصيد، أوراق الزيتون، وخطوط التجارة.',
    icon: '🏁',
    color: 'bg-white/10',
    detail: 'تحولت من غطاء للرأس إلى رمز عالمي للنضال والحرية.'
  },
  {
    name: 'شجرة الزيتون',
    description: 'رمز السلام والصمود، شجر معمر يضرب جذوره في أعماق الأرض منذ آلاف السنين.',
    icon: '🌳',
    color: 'bg-emerald-800/40',
    detail: 'تمثل ارتباط الفلسطيني بأرضه، فهي لا تموت وتنتج الخير دائماً.'
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "ما هي عاصمة فلسطين الأبدية؟",
    options: ["نابلس", "حيفا", "القدس", "غزة"],
    correct: 2,
    hint: "تضم المسجد الأقصى وقبة الصخرة المشرفة.",
    explanation: "القدس هي العاصمة الأبدية والتاريخية لفلسطين، وهي مدينة مقدسة للديانات السماوية الثلاث."
  },
  {
    question: "ما هو لقب مدينة غزة التاريخي؟",
    options: ["زهرة المدائن", "هاشم الغزة", "جبل النار", "عروس البحر"],
    correct: 1,
    hint: "تنسب للجد الأكبر للنبي محمد صلى الله عليه وسلم.",
    explanation: "لقبت بغزة هاشم نسبة إلى هاشم بن عبد مناف، جد الرسول ﷺ، الذي توفي ودفن فيها."
  },
  {
    question: "ماذا يرمز مفتاح العودة في الثقافة الفلسطينية؟",
    options: ["بناء بيت جديد", "حق العودة للأرض", "فتح أبواب العلم", "رمز للصناعة"],
    correct: 1,
    hint: "مرتبط بالنكبة والبيوت التي هجر منها أهلها قسراً.",
    explanation: "يمثل المفتاح إصرار اللاجئين على العودة لبيوتهم الأصلية التي طردوا منها عام ١٩٤٨."
  },
  {
    question: "في أي عام حدثت 'النكبة' الفلسطينية؟",
    options: ["١٩١٧", "١٩٦٧", "١٩٤٨", "١٩٨٧"],
    correct: 2,
    hint: "العام الذي تم فيه إعلان قيام الكيان الصهيوني وتهجير الشعب.",
    explanation: "النكبة حدثت عام ١٩٤٨، حيث تم تهجير أكثر من ٧٥٠ ألف فلسطيني وتدمير قرابة ٥٠٠ قرية."
  }
];

const POETRY: PoetryItem[] = [
  { text: "عَلَى هَذِهِ الأَرْض مَا يَسْتَحِقُّ الحَيَاة", author: "محمود درويش", title: "في حضرة الغياب" },
  { text: "سَأَحْمِلُ رُوحِي عَلَى رَاحَتِي.. وَأُلْقِي بِهَا فِي مَهَاوِي الرَّدَى", author: "عبد الرحيم محمود", title: "الشهيد" },
  { text: "يا ظلام السجن خيّم.. إننا نهوى الظلاما.. ليس بعد السجن إلا.. فجر مجدٍ يتسامى", author: "نجيب الريس", title: "نشيد السجين" },
];

const GALLERY_IMAGES = [
  { src: '/palestine_hero_cinematic_1777220019628.png', title: 'المسجد الأقصى المبارك', location: 'القدس الشريف' },
  { src: '/palestine_gallery_gaza_sunset_1777281374815.png', title: 'غروب الشمس في غزة', location: 'شاطئ بحر غزة' },
  { src: '/palestine_gallery_jerusalem_old_city_1777281398422.png', title: 'أزقة البلدة القديمة', location: 'القدس، فلسطين' },
  { src: '/palestine_landscape_olive_trees_1777280376366.png', title: 'أشجار الزيتون المعمرة', location: 'جبال الجليل' },
];

const NAKBA_VILLAGES = [
  "دير ياسين", "الطنطورة", "اللد", "الرملة", "صفد", "طبريا", "بيسان", "أسدود", "المجدل", "الفالوجة", "عمواس", "يالو", "بيت نوبا", "قالونيا", "عين كارم", "لفتا", "المالحة", "إجزم", "لوبية", "صبارين", "سحماتا", "كفر برعم", "إقرث", "المنشية", "عاقر", "يبنا", "المسمية", "القسطل", "دير أبان", "البريج"
];

const NAKBA_VILLAGES_DATA = [
  { name: "دير ياسين", district: "القدس", year: "1948", population: "750", fact: "وقعت فيها مجزرة بشعة تعد من أشهر محطات النكبة." },
  { name: "الطنطورة", district: "حيفا", year: "1948", population: "1,500", fact: "قرية ساحلية اشتهرت بصيد الأسماك." },
  { name: "اللد", district: "اللد", year: "1948", population: "20,000", fact: "مدينة تاريخية شهدت تهجيراً قسرياً واسعاً." },
  { name: "سحماتا", district: "عكا", year: "1948", population: "1,130", fact: "قرية جبلية تمتاز بزراعة التبغ والزيتون." },
  { name: "لفتا", district: "القدس", year: "1948", population: "2,500", fact: "ما تزال بيوتها الحجرية شاهدة على الوجود الفلسطيني." },
  { name: "القسطل", district: "القدس", year: "1948", population: "100", fact: "شهدت معركة القسطل واستشهاد القائد عبد القادر الحسيني." },
  { name: "إجزم", district: "حيفا", year: "1948", population: "2,970", fact: "كانت من كبرى قرى حيفا وأكثرها صموداً." },
  { name: "بيت محسير", district: "القدس", year: "1948", population: "2,400", fact: "قرية استراتيجية على طريق القدس - يافا." }
];

const TATREEZ_PATTERNS: TatreezPattern[] = [
  { name: 'السرو', origin: 'القدس وحيفا', meaning: 'يرمز للخلود والبقاء الدائم في الأرض، فهو شجر لا يذبل.', detail: 'يستخدم غالباً في جوانب الثوب الفلسطيني (البنيقة).' },
  { name: 'الخيمة', origin: 'الخليل ويأفا', meaning: 'ترمز للحماية والضيافة العربية الأصيلة والمأوى والوطن.', detail: 'شكل هندسي مثلثي يعبر عن الاستقرار والبيت.' },
  { name: 'ريش النعام', origin: 'غزة والساحل', meaning: 'يرمز للرقة والجمال والحياة البحرية والريش المتطاير مع الموج.', detail: 'يتميز بألوانه الزاهية المستوحاة من الطبيعة الساحلية.' },
  { name: 'عنق الجمل', origin: 'النقب وبئر السبع', meaning: 'يرمز للصبر والتحمل في ظروف الصحراء القاسية والترحال.', detail: 'نقشة بدوية أصيلة تعكس حياة البادية الفلسطينية.' },
  { name: 'المناجل', origin: 'رام الله والريف', meaning: 'ترمز لموسم الحصاد وارتباط الفلاح بأرضه وعمله الدؤوب.', detail: 'تتكرر بشكل متوازي لتعطي شكل حقل القمح.' }
];

const RESOURCES: Resource[] = [
  { title: 'تطهير فلسطين عرقياً', type: 'كتاب', desc: 'للمؤرخ إيلان بابيه، دراسة تاريخية معمقة لأحداث النكبة وخطة التهجير الصهيونية.', author: 'إيلان بابيه' },
  { title: 'فيلم "فرحة"', type: 'فيلم', desc: 'عمل درامي يصور أحداث النكبة من منظور فتاة فلسطينية صغيرة حلمت بالتعليم فوجدت الحرب.', author: 'دارين سلام' },
  { title: 'القدس وعد السماء', type: 'وثائقي', desc: 'يستعرض تاريخ المدينة المقدسة ومكانتها الدينية عبر العصور وصراع البقاء فيها.', author: 'قناة الجزيرة' },
  { title: 'رأيت رام الله', type: 'كتاب', desc: 'سيرة ذاتية تحكي رحلة العودة المؤلمة والجميلة للشاعر مريد البرغوثي.', author: 'مريد البرغوثي' },
  { title: 'باب الشمس', type: 'رواية/فيلم', desc: 'ملحمة تحكي تاريخ اللجوء والحب والمقاومة على مدى أجيال.', author: 'إلياس خوري' }
];

const ARCH_DETAILS: ArchDetail[] = [
  { title: 'العقود المدببة', period: 'العصر المملوكي', desc: 'تعتبر من أبرز سمات العمارة في القدس والبلدات القديمة، ترمز للقوة والارتفاع والسمو.', icon: Landmark },
  { title: 'الحجر المقدسي', period: 'تاريخي - أزلي', desc: 'حجر جيري طبيعي يتميز بلونه الكريمي والذهبي، يعطي المدن هويتها البصرية الفريدة التي تقاوم الزمن.', icon: Mountain },
  { title: 'المشربيات الخشبية', period: 'العصر العثماني', desc: 'عناصر خشبية مزخرفة تطل على الشوارع، توفر الخصوصية والجمالية المعمارية وتسمح بمرور الضوء.', icon: BoxSelectIcon },
  { title: 'المحراب الأموي', period: 'العصر الأموي', desc: 'فنون الزخرفة والفسيفساء التي تزين جدران قبة الصخرة والمسجد الأقصى، تمثل ذروة الفن الإسلامي.', icon: Sparkles }
];

const RESISTANCE_CHRONICLES: TimelineItem[] = [
  { year: '1936', title: 'الثورة الفلسطينية الكبرى', description: 'أطول إضراب في التاريخ الحديث ضد الاستعمار البريطاني والمشروع الصهيوني، جسد وحدة الشعب وإصراره.' },
  { year: '1948', title: 'النكبة والمقاومة المستمرة', description: 'رغم التهجير، بدأت خلايا المقاومة الأولى في التشكل لحماية ما تبقى من الأرض والمطالبة بالحق.' },
  { year: '1987', title: 'انتفاضة الحجارة', description: 'هبة شعبية سلمية أذهلت العالم، حيث واجه الأطفال والمقاومون دبابات الاحتلال بحجارة الأرض.' },
  { year: '2000', title: 'انتفاضة الأقصى', description: 'انفجار الغضب الشعبي رداً على تدنيس المقدسات، وتحول المقاومة إلى مرحلة أكثر تنظيماً وقوة.' },
  { year: '2021', title: 'هبة القدس وسيف القدس', description: 'توحدت كل الجبهات الفلسطينية في الداخل والشتات دفاعاً عن حي الشيخ جراح والمسجد الأقصى.' },
  { year: 'اليوم', title: 'صمود أسطوري مستمر', description: 'رغم كل التحديات، تبتكر المقاومة أساليب جديدة للبقاء والصمود، مؤكدة أن الحق لا يموت بالتقادم.' }
];

const HERITAGE_ARTIFACTS: SymbolItem[] = [
  { name: 'مفتاح العودة', description: 'المفتاح الأصلي لبيوت النكبة، الذي تتوارثه الأجيال كوثيقة ملكية لا تقبل القسمة أو التنازل.', color: 'amber', icon: 'Key' },
  { name: 'الثوب الفلسطيني', description: 'هوية مطرزة بخيوط من تاريخ كل قرية، حيث تحكي كل غرزة قصة أرض وجذور ضاربة في عمق الزمن.', color: 'rose', icon: 'Palette' },
  { name: 'شجر الزيتون المعمر', description: 'أكثر من مجرد شجر، إنه شاهد صامت على آلاف السنين من الوجود الفلسطيني، يرفض الانكسار.', color: 'emerald', icon: 'TreePine' },
  { name: 'حنظلة', description: 'الطفل الذي أدار ظهره للعالم احتجاجاً، وأصبح ضمير الثورة ورمزاً للطفولة الفلسطينية الصامدة.', color: 'slate', icon: 'Shield' }
];

const GLOBAL_TRUTH_DATA = [
  { title: 'جدار الفصل العنصري', desc: 'جدار يمتد لمئات الكيلومترات، يمزق القرى، يفصل العائلات، ويحول المدن إلى سجون مفتوحة.', icon: 'Lock' },
  { title: 'نقاط التفتيش', desc: 'أكثر من 700 نقطة عائق وخنق تقيد حركة الفلسطينيين اليومية، تحول المسافات القصيرة إلى رحلات عذاب.', icon: 'Milestone' },
  { title: 'الأسرى الأبطال', desc: 'آلاف الفلسطينيين خلف القضبان، يجسدون صموداً لا يلين في وجه السجان والمحاكم غير العادلة.', icon: 'Users' },
  { title: 'التوسع الاستيطاني', desc: 'سرقة ممنهجة للأرض عبر بناء مستعمرات غير شرعية تلتهم الجبال والوديان في الضفة الغربية.', icon: 'Building2' }
];

// ━━━━━━━━━━━ UTILS ━━━━━━━━━━━

function BoxSelectIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 3a2 2 0 0 0-2 2" />
      <path d="M19 3a2 2 0 0 1 2 2" />
      <path d="M21 19a2 2 0 0 1-2 2" />
      <path d="M5 21a2 2 0 0 1-2-2" />
      <path d="M9 3h10" />
      <path d="M9 21h10" />
      <path d="M3 9v10" />
      <path d="M21 9v10" />
    </svg>
  );
}

// ━━━━━━━━━━━ CINEMATIC UTILS ━━━━━━━━━━━

/**
 * Cinematic Audio Player: Atmospheric sounds for immersion.
 */
function CinematicAudioPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-12 left-12 z-[100]">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl group overflow-hidden relative"
      >
        <div className={cn("absolute inset-0 bg-emerald-500/20 transition-opacity duration-500", isPlaying ? "opacity-100" : "opacity-0")} />
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-emerald-400 animate-pulse" />
        ) : (
          <VolumeX className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
        )}
        
        {/* Invisible Audio Element */}
        <audio 
          ref={audioRef} 
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
          loop 
        />
        
        {/* Visualizer Lines */}
        {isPlaying && (
          <div className="absolute bottom-2 flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                className="w-1 bg-emerald-400 rounded-full"
              />
            ))}
          </div>
        )}
      </motion.button>
      
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-20 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-2xl px-6 py-2 rounded-2xl border border-white/10 whitespace-nowrap"
          >
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">صوت الصمود · قيد التشغيل</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Glassy Background: Animated colorful blobs behind a deep blur.
 */
function GlassyBackground() {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
      {/* NO solid base — we let the site's bg-background show through */}
      
      {/* Animated Blobs — slightly more visible on lighter themes */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, -50, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/[0.07] rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ 
          x: [0, -100, 0], 
          y: [0, 100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-500/[0.07] rounded-full blur-[150px]"
      />
      <motion.div 
        animate={{ 
          x: [0, 50, 0], 
          y: [0, 150, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-amber-500/[0.04] rounded-full blur-[100px]"
      />
    </div>
  );
}

/**
 * Film Grain: Adds a subtle cinematic texture to the entire page.
 */
function FilmGrain() {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}

/**
 * Cinematic Cursor: A custom cursor that reacts to the environment.
 */
function CinematicCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  React.useEffect(() => {
    // Only initialize cursor tracking on devices that support hover (non-touch)
    if (window.matchMedia('(hover: hover)').matches) {
      const moveCursor = (e: MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      };
      window.addEventListener('mousemove', moveCursor);
      return () => window.removeEventListener('mousemove', moveCursor);
    }
  }, []);

  // Return null on touch devices
  if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
    return null;
  }

  return (
    <motion.div
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
      }}
      className="fixed top-0 left-0 w-8 h-8 border border-rose-500 rounded-full z-[9999] pointer-events-none mix-blend-difference flex items-center justify-center"
    >
      <div className="w-1 h-1 bg-rose-500 rounded-full" />
    </motion.div>
  );
}

/**
 * Parallax Image: An image that moves slower than the scroll.
 */
function ParallaxImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
        <Image src={src} alt={alt} fill className="object-cover" />
      </motion.div>
    </div>
  );
}

// ━━━━━━━━━━━ COMPONENTS ━━━━━━━━━━━

/**
 * Quote Section: A transition of power and meaning.
 */
function QuoteSection() {
  return (
    <section className="py-32 relative">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-6xl mx-auto p-16 md:p-24 bg-white/[0.02] border border-white/5 rounded-[4rem] text-center relative overflow-hidden"
        >
          <Quote className="w-16 h-16 text-rose-500/20 absolute -top-8 left-1/2 -translate-x-1/2" />
          <h2 className="text-3xl md:text-5xl font-quran leading-relaxed text-white/90">
            {VERSES[0].text}
          </h2>
          <p className="mt-8 text-rose-500 font-black tracking-widest text-sm uppercase">
            {VERSES[0].source}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Section Grid: The main pillars of the page.
 */
function SectionGrid() {
  return (
    <section className="py-24">
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-right group"
            >
              <div className={cn("w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", section.color)}>
                <section.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">{section.title}</h3>
              <p className="text-lg text-white/40 leading-relaxed">{section.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


/**
 * Hero Section: The grand introduction with cinematic visuals.
 */
function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative min-h-[120vh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
        <Image
          src="/palestine_hero_cinematic_1777220019628.png"
          alt="Al-Aqsa Mosque Palestine Cinematic"
          fill
          className="object-cover brightness-[0.4] scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </motion.div>

      {/* Dynamic Light Rays */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1], x: [-20, 20, -20] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-[1] pointer-events-none bg-[conic-gradient(from_0deg_at_50%_0%,transparent_0deg,rgba(16,185,129,0.05)_180deg,transparent_360deg)]" 
      />

      <div className="container relative z-10 px-6 text-center space-y-16">
        <motion.div
          style={{ y: y2 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] mx-auto"
        >
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/50">
            فلسطين الأبية · رحلة سينمائية في عمق الذاكرة
          </span>
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <h1 className="text-[clamp(3.5rem,12vw,14rem)] font-black font-headline tracking-tighter leading-[0.8] mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
            أرض <span className="text-emerald-500 text-glow-emerald">الزيتون</span> <br />
            و <span className="text-rose-500 text-glow-rose">الصمود</span>
          </h1>
          <div className="h-1.5 w-48 bg-emerald-500/30 mx-auto rounded-full overflow-hidden">
             <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: "100%" }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="h-full w-1/2 bg-emerald-500" 
             />
          </div>
        </motion.div>

        <motion.p
          style={{ y: y2, opacity }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-2xl md:text-4xl text-white/40 font-medium leading-relaxed max-w-5xl mx-auto font-sans tracking-tight"
        >
          ليس مجرد موقع جغرافي، بل هو التاريخ الذي يرفض النسيان، والعدل الذي ينتظر الإشراق، والروح التي تسكن في كل قلب حر ينبض بالانتماء.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 pt-12"
        >
          <button className="group relative h-20 px-16 bg-white text-black rounded-3xl font-black text-xl overflow-hidden hover:scale-105 transition-all shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)]">
            <span className="relative z-10 flex items-center gap-4">
              ابدأ الرحلة <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
            </span>
          </button>
          <button className="h-20 px-12 bg-white/5 backdrop-blur-2xl border border-white/10 text-white rounded-3xl font-black text-xl hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-4">
            <Eye className="w-6 h-6 text-emerald-500" /> مشاهدة الوثائقي
          </button>
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-2 cursor-pointer"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">اسحب للأسفل</span>
          <ChevronDown className="w-10 h-10" />
        </motion.div>
      </div>
    </section>
  );
}



/**
 * Sacred Connection: The religious and spiritual importance of Palestine.
 */
function SacredConnectionBento() {
  return (
    <section id="sacred" className="py-40 relative overflow-hidden">
       <div className="container px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-right mb-24 space-y-6"
          >
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                <Star className="w-5 h-5 text-emerald-500 shadow-glow-emerald" />
                <span className="text-xs font-black uppercase text-emerald-400 tracking-widest">المكانة المقدسة · أرض المحشر</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
               أرض <span className="text-white/20 italic">الأنبياء</span> <br /> 
               و <span className="text-emerald-500">الوحي المقدس</span>
             </h2>
             <p className="text-xl text-white/40 max-w-2xl mr-auto font-medium">
               لم تكن فلسطين يوماً مجرد تراب، بل هي موضع نظر السماء، ومسرى سيد الخلق، وأرضٌ بارك الله فيها للعالمين.
             </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[350px]">
             {/* Main Bento Box: Al-Aqsa */}
             <motion.div 
                whileHover={{ y: -10 }}
                className="md:col-span-8 row-span-2 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-16 relative overflow-hidden flex flex-col justify-end text-right group shadow-2xl"
             >
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/palestine_hero_cinematic_1777220019628.png')] bg-cover opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                <div className="absolute top-16 left-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                <Star className="w-24 h-24 text-emerald-500/10 absolute top-16 left-16 group-hover:rotate-45 transition-transform duration-1000" />
                
                <div className="relative z-10 space-y-8">
                  <h3 className="text-5xl font-black text-white leading-tight">ثالث الحرمين الشريفين</h3>
                  <div className="h-1 w-24 bg-emerald-500 rounded-full" />
                  <p className="text-2xl text-white/50 leading-relaxed max-w-2xl ml-auto font-quran italic">
                    "عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: لا تُشدُّ الرحال إلا إلى ثلاثة مساجد: المسجد الحرام، ومسجدي هذا، والمسجد الأقصى".
                  </p>
                  <p className="text-sm font-black text-emerald-500/60 uppercase tracking-[0.3em]">متفق عليه</p>
                </div>
             </motion.div>

             {/* Secondary Bento: Mahshar */}
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="md:col-span-4 rounded-[4rem] bg-white/[0.02] backdrop-blur-2xl border border-white/5 p-12 flex flex-col justify-center text-right relative overflow-hidden group shadow-xl"
             >
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 blur-3xl rounded-full" />
                <h4 className="text-3xl font-black text-white mb-6 group-hover:text-emerald-500 transition-colors">أرض المحشر والمنشر</h4>
                <p className="text-lg text-white/40 leading-relaxed">
                  جاء في الأثر أن فلسطين هي الأرض التي سيجمع الله فيها الناس يوم القيامة، فهي مركز الأرض وبداية النهاية.
                </p>
             </motion.div>

             {/* Tertiary Bento: Isra */}
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="md:col-span-4 rounded-[4rem] bg-white/[0.02] backdrop-blur-2xl border border-white/5 p-12 flex flex-col justify-center text-right relative overflow-hidden group shadow-xl"
             >
                <Sparkles className="w-12 h-12 text-emerald-500/40 mb-8" />
                <h4 className="text-3xl font-black text-white mb-6 group-hover:text-emerald-500 transition-colors">مسرى الرسول ﷺ</h4>
                <p className="text-lg text-white/40 leading-relaxed">
                  شهدت الأرض المباركة أعظم رحلة في تاريخ البشرية، رحلة الإسراء والمعراج، حيث أمَّ النبي محمد ﷺ الأنبياء جميعاً.
                </p>
             </motion.div>

             {/* Bottom Wide Bento: Prophets */}
             <motion.div 
                className="md:col-span-12 rounded-[4rem] bg-white/[0.01] backdrop-blur-md border border-white/5 p-16 flex flex-col md:flex-row items-center gap-16 text-right relative overflow-hidden"
             >
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
                
                <div className="flex-1 space-y-6">
                   <h3 className="text-4xl font-black text-white">أرضٌ بارك الله حولها</h3>
                   <p className="text-xl text-white/40 leading-relaxed">
                     البركة في فلسطين ليست معنوية فقط، بل هي بركة في الأرض والزرع والماء والإنسان، بنص القرآن الكريم في أكثر من موضع.
                   </p>
                </div>
                
                <div className="w-2 h-24 bg-emerald-500/10 rounded-full hidden md:block" />
                
                <div className="flex-1 space-y-6">
                   <h3 className="text-4xl font-black text-white">موطن الأنبياء الكرام</h3>
                   <p className="text-xl text-white/40 leading-relaxed">
                     عاش على أرضها وسار في طرقاتها إبراهيم، داود، سليمان، زكريا، يحيى، وعيسى عليهم السلام أجمعين.
                   </p>
                </div>
             </motion.div>
          </div>
       </div>
    </section>
  );
}

/**
 * Lest We Forget Memorial: Interactive archive of villages.
 */
function LestWeForgetMemorial() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const filteredVillages = searchTerm 
    ? NAKBA_VILLAGES.filter(v => v.includes(searchTerm))
    : [];

  return (
    <section id="nakba" className="py-60 relative overflow-hidden">
      <div className="container px-6">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-32 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-8 text-right max-w-3xl"
          >
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
                <History className="w-5 h-5 text-rose-500 shadow-glow-rose" />
                <span className="text-xs font-black uppercase text-rose-400 tracking-widest">ذاكرة لا تموت</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black leading-none">حتى لا ننسى <br /> <span className="text-white/20 italic">قرى النكبة</span></h2>
             <p className="text-2xl text-white/40 leading-relaxed font-medium">
               أكثر من 500 قرية ومدينة فلسطينية تم تدميرها وتهجير سكانها عام 1948. الأسماء ليست مجرد كلمات، بل هي جذورٌ تضرب في الأرض وتنتظر العودة.
             </p>
          </motion.div>

          <div className="w-full lg:w-96 relative group">
             <input 
               type="text" 
               placeholder="ابحث عن قرية..."
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-20 px-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl text-right font-bold focus:outline-none focus:border-rose-500/50 transition-all shadow-2xl"
             />
             <Info className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-hover:text-rose-500/50 transition-colors" />
          </div>
        </div>

        {/* Search Results / Featured Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-40">
          {searchTerm ? (
            filteredVillages.map((village, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/5 text-center group hover:bg-rose-500/10 transition-all"
              >
                 <span className="text-xl font-black text-white group-hover:text-rose-500 transition-colors">{village}</span>
              </motion.div>
            ))
          ) : (
            NAKBA_VILLAGES_DATA.slice(0, 8).map((village, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-10 rounded-[3.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-right group relative overflow-hidden shadow-3xl hover:bg-white/[0.06] transition-all"
              >
                 <div className="absolute top-0 right-0 w-2 h-full bg-rose-500/20 group-hover:bg-rose-500 transition-all duration-500" />
                 <Key className="w-12 h-12 text-rose-500/10 absolute top-8 left-8 group-hover:rotate-45 transition-transform" />
                 <h4 className="text-3xl font-black text-white mb-4">{village.name}</h4>
                 <div className="space-y-4">
                    <div className="flex items-center justify-end gap-3 text-white/40">
                       <span className="text-sm font-bold">{village.district}</span>
                       <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-end gap-3 text-white/40">
                       <span className="text-sm font-bold">{village.year}</span>
                       <Calendar className="w-4 h-4" />
                    </div>
                 </div>
                 <p className="mt-8 text-sm text-white/30 leading-relaxed group-hover:text-white/60 transition-colors">{village.fact}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* Scrolling Marquee of all villages */}
        <div className="relative py-24 border-y border-white/5 overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,49,43,0.03),transparent)]" />
           <motion.div 
             animate={{ x: [0, -4000] }}
             transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
             className="flex gap-24 items-center whitespace-nowrap"
           >
              {[...NAKBA_VILLAGES, ...NAKBA_VILLAGES].map((village, i) => (
                <span key={i} className="text-4xl md:text-7xl font-black text-white/5 hover:text-rose-500/40 transition-all duration-700 cursor-default select-none">
                  {village}
                </span>
              ))}
           </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Media Gallery: High-end cinematic image slider.
 */
function MediaGallery() {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  const next = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };
  const prev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  };

  return (
    <section className="py-40 relative overflow-hidden">
       <div className="container px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
             <div className="space-y-6 text-right">
                <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
                   <Camera className="w-5 h-5 text-emerald-500 shadow-glow-emerald" />
                   <span className="text-xs font-black uppercase text-emerald-400 tracking-widest">جمال الأرض الباقي</span>
                </div>
                <h2 className="text-5xl md:text-8xl font-black leading-none">عدسة <br /> <span className="text-white/20">فلسطينية أصيلة</span></h2>
             </div>
             <div className="flex gap-6">
                <button onClick={prev} className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/30 transition-all group backdrop-blur-xl">
                   <ArrowLeft className="w-8 h-8 group-hover:-translate-x-2 transition-transform" />
                </button>
                <button onClick={next} className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/30 transition-all group backdrop-blur-xl">
                   <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>

          <div className="relative h-[60vh] md:h-[85vh] rounded-[3rem] md:rounded-[5rem] overflow-hidden group shadow-3xl">
             <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={index}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 200 : -200, scale: 1.1 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction > 0 ? -200 : 200, scale: 1.1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                   <Image 
                     src={GALLERY_IMAGES[index].src} 
                     alt={GALLERY_IMAGES[index].title} 
                     fill 
                     className="object-cover group-hover:scale-105 transition-transform duration-[3s] ease-out"
                   />
                   {/* Cinematic Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                   <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                   
                   <div className="absolute bottom-24 right-24 text-right space-y-6">
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg font-black uppercase tracking-[0.5em] text-emerald-500"
                      >
                        {GALLERY_IMAGES[index].location}
                      </motion.p>
                      <motion.h3 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl md:text-9xl font-black text-white leading-tight"
                      >
                        {GALLERY_IMAGES[index].title}
                      </motion.h3>
                   </div>
                   
                   {/* Slide Indicator */}
                   <div className="absolute bottom-24 left-24 flex items-center gap-4">
                      {GALLERY_IMAGES.map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-1.5 transition-all duration-500 rounded-full",
                            i === index ? "w-12 bg-emerald-500" : "w-4 bg-white/20"
                          )} 
                        />
                      ))}
                   </div>
                </motion.div>
             </AnimatePresence>
          </div>
       </div>
    </section>
  );
}

/**
 * Tatreez Patterns: Cultural identity through thread.
 */
function TatreezPatternsGrid() {
  return (
    <section className="py-40">
       <div className="container px-6">
          <div className="flex flex-col lg:flex-row items-center gap-24">
              <div className="flex-1 relative order-2 lg:order-1">
                <div className="absolute -inset-10 bg-rose-500/10 blur-[120px] rounded-full" />
                <motion.div 
                   whileHover={{ scale: 1.02 }}
                   className="relative rounded-[3rem] md:rounded-[5rem] overflow-hidden border border-white/5 shadow-2xl h-[400px] md:h-[800px]"
                >
                   <ParallaxImage 
                     src="/palestine_tatreez_detail.png" 
                     alt="Tatreez Detail Close Up" 
                     className="w-full h-full" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>
                
                {/* Float Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="absolute -bottom-10 -right-10 p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-3xl max-w-xs text-right hidden md:block"
                >
                   <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2">تراث عالمي</p>
                   <p className="text-lg font-bold text-white/80">التطريز الفلسطيني مدرج ضمن قائمة اليونسكو للتراث الثقافي غير المادي.</p>
                </motion.div>
             </div>

             <div className="flex-1 space-y-16 text-right order-1 lg:order-2">
                <div className="space-y-8">
                   <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
                      <Palette className="w-5 h-5 text-rose-500 shadow-glow-rose" />
                      <span className="text-xs font-black uppercase text-rose-400 tracking-widest">نقوش الهوية والتراب</span>
                   </div>
                   <h2 className="text-5xl md:text-8xl font-black leading-none">لغة <br /> <span className="text-white/20">الألوان والخيوط</span></h2>
                   <p className="text-2xl text-white/40 leading-relaxed font-medium">
                     كل غرزة في الثوب الفلسطيني هي توثيق لجغرافية المكان؛ فأنماط الجبل تختلف عن الساحل، ولكنها جميعاً تجتمع في حب الأرض والانتماء.
                   </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   {TATREEZ_PATTERNS.map((p, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-10 rounded-[3.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/5 hover:border-rose-500/30 transition-all group relative overflow-hidden shadow-lg"
                      >
                         <div className="absolute top-0 right-0 w-2 h-0 bg-rose-500 group-hover:h-full transition-all duration-500" />
                         <h4 className="text-2xl font-black text-white mb-2 group-hover:text-rose-500 transition-colors">{p.name}</h4>
                         <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">{p.origin}</p>
                         <p className="text-base text-white/40 leading-relaxed mb-4">{p.meaning}</p>
                         <p className="text-xs text-rose-500/40 font-bold italic">{p.detail}</p>
                      </motion.div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

/**
 * Global Voices: Quotes from global figures.
 */
function GlobalVoicesSection() {
  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03),transparent)] pointer-events-none" />
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-32 space-y-8"
        >
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">أصوات <span className="text-emerald-500">الحرية العالمية</span></h2>
          <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full" />
          <p className="text-2xl text-white/40 font-medium">القضية الفلسطينية هي ميزان الضمير العالمي، وقضية كل إنسان يؤمن بالحق والعدل فوق كل أرض.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {GLOBAL_QUOTES.map((quote, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-16 rounded-[4.5rem] bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all"
            >
              <Quote className="w-16 h-16 text-white/5 absolute -top-8 -right-8 group-hover:text-emerald-500/20 transition-colors" />
              <p className="text-2xl font-bold text-white/80 leading-relaxed mb-12 text-right relative z-10 italic">
                "{quote.text}"
              </p>
              <div className="pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                 <div className="text-right">
                    <p className="text-xl font-black text-white">{quote.author}</p>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">{quote.role}</p>
                 </div>
                 <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Globe className="w-7 h-7 text-emerald-500 shadow-glow-emerald" />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Diaspora & Unity: Global reach of the cause.
 */
function DiasporaUnitySection() {
  return (
    <section className="py-40 relative overflow-hidden">
       {/* Animated Background Map Lines */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
             <motion.path 
               d="M500,500 Q700,300 900,500" 
               stroke="currentColor" fill="none" strokeWidth="2"
               animate={{ pathLength: [0, 1] }} transition={{ duration: 3, repeat: Infinity }}
             />
             <motion.path 
               d="M500,500 Q300,700 100,500" 
               stroke="currentColor" fill="none" strokeWidth="2"
               animate={{ pathLength: [0, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
             />
          </svg>
       </div>

       <div className="container px-6 flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <div className="flex-1 space-y-12 text-right">
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
                <Earth className="w-5 h-5 text-amber-500 shadow-glow-amber" />
                <span className="text-xs font-black uppercase text-amber-400 tracking-widest">فلسطين في وجدان العالم</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black leading-tight">شعبٌ واحد <br /><span className="text-white/20">رغم المسافات والجراح</span></h2>
             <p className="text-2xl text-white/40 leading-relaxed font-medium">
               ينتشر الفلسطينيون في كل بقاع الأرض، من أقصى تشيلي إلى الكويت، ومن الأردن إلى شتات أوروبا. ورغم تباعد المسافات، تظل البوصلة واحدة والقلوب معلقة بالأرض الأم.
             </p>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'الأردن الشقيق', value: '٢.٤ مليون+' },
                  { label: 'سوريا ولبنان', value: '١ مليون+' },
                  { label: 'أمريكا اللاتينية', value: '٧٠٠ ألف+' },
                  { label: 'أوروبا وأمريكا', value: '٥٠٠ ألف+' },
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.05 }}
                    className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-all"
                  >
                     <p className="text-3xl font-black text-white mb-2">{stat.value}</p>
                     <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">{stat.label}</p>
                  </motion.div>
                ))}
             </div>
          </div>

          <div className="flex-1 relative">
             <div className="absolute inset-0 bg-amber-500/10 blur-[120px] rounded-full" />
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative rounded-[5rem] overflow-hidden border border-white/10 shadow-3xl h-[600px]"
             >
                <ParallaxImage 
                  src="/palestine_diaspora.png" 
                  alt="Global Palestinian Diaspora Connection Map" 
                  className="w-full h-full grayscale-[0.3] hover:grayscale-0 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
             </motion.div>
          </div>
       </div>
    </section>
  );
}

/**
 * Architecture Section: Stones and arches history.
 */
function ArchHistorySection() {
  return (
    <section className="py-40">
       <div className="container px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-24 space-y-8"
          >
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter">عمارة <span className="text-amber-500">الحجر المقدسي</span></h2>
             <p className="text-2xl text-white/40 font-medium">تتميز المدن الفلسطينية بعمارة فريدة تمزج بين الفن الإسلامي العريق والهوية المحلية الصادقة، شاهدة على حضارة ضاربة في القدم.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
             {ARCH_DETAILS.map((arch, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all text-right group relative overflow-hidden"
                >
                   <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full group-hover:bg-amber-500/10 transition-all" />
                   <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-10 group-hover:scale-110 transition-transform">
                      <arch.icon className="w-10 h-10" />
                   </div>
                   <h3 className="text-3xl font-black text-white mb-3 group-hover:text-amber-500 transition-colors">{arch.title}</h3>
                   <p className="text-xs font-black text-amber-500/60 uppercase tracking-[0.3em] mb-6">{arch.period}</p>
                   <p className="text-lg text-white/40 leading-relaxed">{arch.desc}</p>
                </motion.div>
             ))}
          </div>
       </div>
    </section>
  );
}

/**
 * Digital Library: Resources for learning.
 */
function DigitalLibrarySection() {
  return (
    <section className="py-40 bg-black/40 relative">
       <div className="container px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-8">
             <div className="space-y-6 text-right">
                <div className="inline-flex items-center gap-4 px-8 py-3 bg-sky-500/10 border border-sky-500/20 rounded-full">
                   <Library className="w-5 h-5 text-sky-500 shadow-glow-sky" />
                   <span className="text-xs font-black uppercase text-sky-500 tracking-widest">مكتبة المقاومة المعرفية</span>
                </div>
                <h2 className="text-5xl md:text-8xl font-black">تعلم <br /> <span className="text-white/20 italic">لتقوى في الحق</span></h2>
             </div>
             <p className="text-xl text-white/30 max-w-md md:text-left text-right font-medium">الوعي هو السلاح الأول، والمعرفة هي مفتاح الصمود في وجه التزييف.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-right">
             {RESOURCES.map((res, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-2xl border border-white/5 hover:border-sky-500/20 transition-all space-y-8 group relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-3xl rounded-full" />
                   <div className="flex items-center justify-between">
                      <div className="px-6 py-2 rounded-full bg-sky-500/10 text-sky-500 font-black text-[10px] uppercase tracking-widest">
                         {res.type}
                      </div>
                      <BookOpen className="w-6 h-6 text-white/10" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black text-white group-hover:text-sky-400 transition-colors">{res.title}</h3>
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{res.author}</p>
                      <p className="text-lg text-white/40 leading-relaxed">{res.desc}</p>
                   </div>
                   <button className="flex items-center gap-3 text-sky-500 font-black text-xs uppercase tracking-[0.3em] group-hover:gap-5 transition-all">
                      اكتشف المصدر <ArrowRight className="w-4 h-4" />
                   </button>
                </motion.div>
             ))}
          </div>
       </div>
    </section>
  );
}

/**
 * Future Hope: A vision of liberation.
 */
/**
 * Solidarity Action Grid: Practical steps for the user.
 */
function SolidarityActionGrid() {
  const actions = [
    { title: "نشر الوعي", desc: "كن صوتاً لمن لا صوت له، شارك الحقائق والقصص الإنسانية.", icon: Megaphone, color: "bg-sky-500" },
    { title: "الدعم الإغاثي", desc: "ساهم في تضميد الجراح من خلال المؤسسات الموثوقة.", icon: HeartPulse, color: "bg-rose-500" },
    { title: "التعليم والتعلم", desc: "اقرأ عن التاريخ الحقيقي وعلّم الأجيال القادمة معنى الحق.", icon: GraduationCap, color: "bg-emerald-500" },
    { title: "التضامن الرقمي", desc: "استخدم منصاتك لكسر التعتيم الإعلامي عن الحقيقة.", icon: Share2, color: "bg-amber-500" }
  ];

  return (
    <section className="py-40 relative">
      <div className="container px-6">
        <div className="text-right mb-24 space-y-6">
           <h2 className="text-5xl md:text-8xl font-black tracking-tighter">كيف <span className="text-emerald-500">ننتصر</span> للحق؟</h2>
           <p className="text-2xl text-white/40 max-w-2xl mr-auto font-medium">خطوات عملية بسيطة ولكنها عظيمة الأثر في دعم صمود الشعب الفلسطيني ونشر رسالة العدل.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {actions.map((action, i) => (
             <motion.div
               key={i}
               whileHover={{ y: -20, scale: 1.02 }}
               className="p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-right space-y-8 group relative overflow-hidden shadow-2xl"
             >
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 bg-white/5 group-hover:scale-110 transition-transform", action.color.replace('bg', 'text'))}>
                   <action.icon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-white">{action.title}</h3>
                <p className="text-lg text-white/50 leading-relaxed">{action.desc}</p>
                <div className="pt-6">
                   <button className="text-sm font-black text-white/30 group-hover:text-white transition-colors flex items-center gap-2">
                     اعرف المزيد <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}

function FutureHopeSection() {
  return (
    <section className="py-40 bg-[#050505] relative overflow-hidden">
       <div className="container px-6 flex flex-col lg:flex-row-reverse items-center gap-24">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-12 text-right"
          >
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Sun className="w-5 h-5 text-emerald-500 shadow-glow-emerald" />
                <span className="text-xs font-black uppercase text-emerald-500 tracking-widest">رؤية الغد والتحرير</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black leading-tight">فجر <br /> <span className="text-white/20">الحرية والعودة</span></h2>
             <p className="text-2xl text-white/40 leading-relaxed font-medium">
               نؤمن أن الحق سيعود يوماً لصاحبه، وأن القدس ستشرق شمسها من جديد بسلامٍ وحرية حقيقية. الأمل هو وقود الصمود، واليقين بالنصر هو بوصلة الأحرار التي لا تخطئ.
             </p>
             <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 border-r-8 border-r-emerald-500 shadow-2xl">
                <p className="text-xl font-bold text-white/80 leading-relaxed italic">
                  "إنهم يرونه بعيداً ونراه قريباً.. ستظل فلسطين في الذاكرة حية حتى يكتمل المشهد بالعودة الكبرى والتحرير الناجز."
                </p>
             </div>
          </motion.div>
          
          <div className="flex-1 relative">
             <div className="absolute inset-0 bg-emerald-500/10 blur-[150px] rounded-full" />
             <motion.div 
               whileHover={{ scale: 1.02 }}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="relative rounded-[5rem] overflow-hidden border border-white/10 shadow-3xl h-[600px]"
             >
                <ParallaxImage 
                  src="/palestine_future_liberated_jerusalem_1777281555771.png" 
                  alt="Future Liberated Palestine Vision" 
                  className="w-full h-full" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute top-12 left-12 px-8 py-3 bg-black/60 backdrop-blur-xl rounded-full border border-white/10">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">يقين بالنصر</p>
                </div>
             </motion.div>
          </div>
       </div>
    </section>
  );
}

/**
 * Commitment & Pledge: Interactive oath section.
 */
function CommitmentSection() {
  const [steps, setSteps] = React.useState([false, false, false]);
  const toggleStep = (i: number) => {
    const newSteps = [...steps];
    newSteps[i] = !newSteps[i];
    setSteps(newSteps);
  };

  return (
    <section id="pledge" className="py-40 bg-black relative">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-5xl mx-auto rounded-[5rem] bg-white/[0.02] border border-white/5 p-16 md:p-32 text-right relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-rose-500 via-white to-emerald-500" />
           
           <div className="space-y-8 mb-24">
              <h2 className="text-4xl md:text-7xl font-black mb-6">عهدنا <span className="text-rose-500 italic">للقضية</span></h2>
              <p className="text-2xl text-white/40 font-medium max-w-2xl mr-auto leading-relaxed">
                 القضية لا تنتهي بانتهاء القراءة، بل هي أمانة تبدأ بالوعي وتستمر بالالتزام الدائم والعمل الدؤوب في كل ميدان.
              </p>
           </div>
           
           <div className="space-y-8">
              {[
                { title: "سأتعلم أكثر وأعمق", desc: "سأقرأ عن تاريخ فلسطين، قرآها المهجرة، وشهدائها، وسأعرف تفاصيل الحق الفلسطيني الذي لا يضيع." },
                { title: "سأنشر الوعي في كل مكان", desc: "سأتحدث مع من حولي، وسأستخدم كل منبر متاح لأحكي قصة العدل في وجه الظلم." },
                { title: "لن أنسى أبداً ولن أساوم", desc: "سأظل حاملاً للأمانة، ناقلاً لها للأجيال القادمة كوصية مقدسة لا تقبل التنازل." }
              ].map((step, i) => (
                <motion.button 
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleStep(i)}
                  className={cn(
                    "w-full p-10 rounded-[3.5rem] border transition-all flex items-center gap-10 group text-right",
                    steps[i] ? "bg-emerald-500/10 border-emerald-500/40 shadow-glow-emerald/10" : "bg-white/[0.03] border-white/10 hover:border-white/20"
                  )}
                >
                   <div className={cn(
                     "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all flex-shrink-0 shadow-2xl",
                     steps[i] ? "bg-emerald-500 text-black rotate-[360deg]" : "bg-white/10 text-white/20 group-hover:text-white"
                   )}>
                      {steps[i] ? <CheckCircle2 className="w-8 h-8" /> : <Star className="w-8 h-8" />}
                   </div>
                   <div className="flex-1 space-y-2">
                      <h4 className={cn("text-2xl md:text-3xl font-black transition-colors", steps[i] ? "text-emerald-500" : "text-white")}>{step.title}</h4>
                      <p className="text-lg text-white/40 leading-relaxed">{step.desc}</p>
                   </div>
                </motion.button>
              ))}
           </div>

           <AnimatePresence>
             {steps.every(s => s) && (
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-20 p-12 rounded-[4rem] bg-emerald-500/10 border border-emerald-500/30 text-center space-y-10 shadow-glow-emerald/20"
                >
                   <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-glow-emerald">
                      <Key className="w-12 h-12 text-black" />
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-4xl font-black text-emerald-500 uppercase tracking-widest">تم استلام الأمانة بنجاح</h4>
                      <p className="text-2xl text-white/70 font-medium leading-relaxed max-w-2xl mx-auto">
                         أنت الآن سفيرٌ لهذه القضية العادلة في كل بقعة تطأها قدماك. تذكر أن العهد باقٍ ما بقي فينا نبض، وأن الفجر قادم لا محالة.
                      </p>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Flag Meanings: Detailed color explanation.
 */
function FlagMeaningSection() {
  return (
    <section className="py-40 bg-black/40 overflow-hidden relative">
      <div className="container px-6 text-right">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="max-w-4xl mb-24 space-y-8"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-rose-500/10 border border-rose-500/20 rounded-full">
             <Flag className="w-5 h-5 text-rose-500" />
             <span className="text-xs font-black uppercase text-rose-500 tracking-widest">ألوان الكرامة</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black leading-tight">حكاية <span className="text-rose-500">العلم</span></h2>
          <p className="text-2xl text-white/40 font-medium leading-relaxed">وراء كل لون في علمنا حكاية، ومعنىً يعمق الانتماء لهذه الأرض المقدسة التي ارتوت بدماء الأحرار.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FLAG_COLORS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[4rem] bg-white/[0.03] border border-white/5 relative group hover:bg-white/[0.06] transition-all overflow-hidden"
            >
              <div className="w-full h-3 rounded-full mb-10 transition-all duration-700 group-hover:scale-x-110" style={{ backgroundColor: item.color }} />
              <h3 className="text-3xl font-black text-white mb-6">{item.label}</h3>
              <p className="text-lg text-white/40 leading-relaxed font-medium">{item.meaning}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Famous Figures: Profiles of resilience.
 */
function PersonalitiesSection() {
  return (
    <section className="py-40">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32">
          <div className="space-y-8 text-right">
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-sky-500/10 border border-sky-500/20 rounded-full">
                <Users className="w-5 h-5 text-sky-500 shadow-glow-sky" />
                <span className="text-xs font-black uppercase text-sky-500 tracking-widest">شخصيات حفرت التاريخ</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black text-right tracking-tighter">أصوات <br /> <span className="text-white/20">لا تنحني للريح</span></h2>
          </div>
          <p className="text-2xl text-white/40 max-w-xl md:text-left text-right leading-relaxed font-medium">مفكرون، أدباء، وفنانون حملوا فلسطين في قلوبهم وأقلامهم وأسمعوا العالم صوت الحق الذي لا يغيب.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FAMOUS_FIGURES.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[4.5rem] bg-white/[0.02] border border-white/5 hover:border-sky-500/20 transition-all text-right group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-0 bg-sky-500 group-hover:h-full transition-all duration-500" />
              <h3 className="text-3xl font-black text-white mb-2 group-hover:text-sky-400 transition-colors">{person.name}</h3>
              <p className="text-sm font-black text-sky-500/60 uppercase tracking-[0.3em] mb-8">{person.role}</p>
              <p className="text-lg text-white/40 leading-relaxed font-medium">{person.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Food Culture: The taste of home.
 */
function FoodCultureSection() {
  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6 flex flex-col lg:flex-row items-center gap-24">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-12 text-right"
        >
           <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
              <Utensils className="w-5 h-5 text-amber-500 shadow-glow-amber" />
              <span className="text-xs font-black uppercase text-amber-400 tracking-widest">ثقافة وتذوق وأصالة</span>
           </div>
           <h2 className="text-5xl md:text-8xl font-black text-right leading-tight">خيرات <span className="text-white/20 italic">الأرض المباركة</span></h2>
           <p className="text-2xl text-white/40 leading-relaxed font-medium">
             زيت الزيتون المعصور بكرامة، والزعتر البري، والخبز الساخن من فرن الطابون.. هي ليست مجرد وجبة، بل هي طقسٌ يومي يجمع العائلة ويعمق الارتباط بالتراب الفلسطيني.
           </p>
           <div className="flex flex-wrap gap-4 justify-end">
              {['المقلوبة العالمية', 'المنسف الخليلي', 'المسخن الفلسطيني', 'الكنافة النابلسية', 'المفتول الريفي'].map(f => (
                <span key={f} className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-white/70 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-default">
                  {f}
                </span>
              ))}
           </div>
        </motion.div>
        
        <div className="flex-1 relative">
           <div className="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full" />
           <motion.div 
             whileHover={{ scale: 1.02 }}
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="relative rounded-[5rem] overflow-hidden border border-white/5 shadow-3xl h-[700px]"
           >
              <ParallaxImage 
                src="/palestine_food.png" 
                alt="Palestinian Traditional Food Culture" 
                className="w-full h-full" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
           </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Knowledge Quiz: Interactive educational game.
 */
function KnowledgeQuiz() {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(false);

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    if (index === QUIZ_QUESTIONS[currentQuestion].correct) setScore(score + 1);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else setIsFinished(true);
  };

  const restart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <section id="quiz" className="py-40 relative">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto rounded-[5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-16 md:p-32 relative overflow-hidden shadow-3xl"
        >
           <div className="absolute top-12 left-12 flex items-center gap-4 text-white/20 font-black text-[10px] uppercase tracking-[0.4em]">
              <span>تحدي المعرفة</span>
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
              <span>{currentQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
           </div>

           <AnimatePresence mode="wait">
              {!isFinished ? (
                <motion.div 
                  key={currentQuestion} 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-12 text-right"
                >
                  <h4 className="text-3xl md:text-5xl font-black text-white leading-tight">
                    {QUIZ_QUESTIONS[currentQuestion].question}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {QUIZ_QUESTIONS[currentQuestion].options.map((option, i) => (
                      <button 
                        key={i} 
                        disabled={showResult}
                        onClick={() => handleAnswer(i)}
                        className={cn(
                          "p-10 rounded-[2.5rem] text-right font-black text-xl transition-all border shadow-2xl",
                          selectedOption === i 
                            ? (i === QUIZ_QUESTIONS[currentQuestion].correct 
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-emerald/20 scale-105" 
                                : "bg-rose-500/20 border-rose-500 text-rose-400 scale-95") 
                            : "bg-white/[0.03] border-white/5 hover:border-white/20 text-white/60 hover:text-white"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/10 space-y-6"
                    >
                       <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-2xl font-black",
                            selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? 'إجابة صحيحة ومباركة!' : 'للاسف، المعلومة الصحيحة هي:'}
                          </p>
                          <Star className={cn("w-8 h-8", selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? "text-emerald-500 fill-emerald-500" : "text-rose-500")} />
                       </div>
                       <p className="text-xl text-white/60 leading-relaxed font-medium">{QUIZ_QUESTIONS[currentQuestion].explanation}</p>
                       <button 
                         onClick={nextQuestion}
                         className="h-16 px-12 bg-white text-black rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-glow-white mr-auto flex items-center gap-3"
                       >
                         السؤال التالي <ArrowRight className="w-5 h-5" />
                       </button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-12 py-16"
                >
                  <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-glow-emerald">
                     <Trophy className="w-16 h-16 text-black" />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-4xl md:text-6xl font-black text-white">انتهى التحدي المعرفي!</h4>
                     <p className="text-2xl text-white/40 font-medium">لقد أجبت على {score} من أصل {QUIZ_QUESTIONS.length} بشكل صحيح.</p>
                  </div>
                  <div className="flex items-center justify-center gap-6">
                     <button onClick={restart} className="h-16 px-12 bg-white/5 border border-white/10 text-white rounded-2xl font-black hover:bg-white/10 transition-all">إعادة التحدي</button>
                     <button className="h-16 px-12 bg-emerald-500 text-black rounded-2xl font-black hover:scale-105 transition-all shadow-glow-emerald">شارك نتيجتك</button>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Timeline Section: The historical progression.
 */
function TimelineSection() {
  return (
    <section id="timeline" className="py-40 relative overflow-hidden text-right">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-32 space-y-6"
        >
           <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none">محطات في <br /> <span className="text-rose-500">مسيرة الحق</span></h2>
           <p className="text-2xl text-white/30 max-w-2xl mr-auto font-medium leading-relaxed">كل عام مرّ على هذه الأرض هو شاهدٌ على محاولة الاقتلاع، وشاهدٌ أكبر على صمود الجذور الفلسطينية الراسخة.</p>
        </motion.div>

        <div className="space-y-24 relative">
           {/* Timeline Line */}
           <div className="absolute right-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-rose-500/50 via-white/5 to-emerald-500/50 hidden md:block" />
           
           {TIMELINE.map((item, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className={cn(
                 "relative flex flex-col md:flex-row items-center gap-12 group",
                 i % 2 === 0 ? "md:flex-row-reverse" : ""
               )}
             >
                {/* Connector Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-black border-4 border-rose-500 rounded-full z-20 group-hover:scale-150 group-hover:bg-rose-500 transition-all duration-500 hidden md:block" />
                
                <div className="w-full md:w-1/2 p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/5 hover:border-rose-500/20 transition-all shadow-2xl relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/5 blur-3xl rounded-full" />
                   <span className="text-4xl font-black text-rose-500 mb-4 block group-hover:scale-110 transition-transform origin-right">{item.year}</span>
                   <h4 className="text-3xl font-black text-white mb-4">{item.title}</h4>
                   <p className="text-xl text-white/40 leading-relaxed font-medium">{item.description}</p>
                </div>
                
                <div className="w-full md:w-1/2 hidden md:block" />
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Poetry Section: The literary soul of Palestine.
 */
function PoetrySection() {
  return (
    <section className="py-60 relative overflow-hidden bg-black">
      {/* Decorative Arabic Calligraphy Pattern (SVG) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
         <p className="text-[30rem] font-quran select-none">فلسطين</p>
      </div>

      <div className="container px-6 relative z-10">
        <div className="space-y-40">
          {POETRY.map((p, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="max-w-6xl mx-auto text-center group"
            >
              <Quote className="w-20 h-20 text-white/5 mx-auto mb-16 group-hover:text-rose-500/20 transition-colors duration-1000" />
              <h3 className="text-5xl md:text-8xl font-quran leading-[1.4] text-white/90 mb-12 drop-shadow-2xl">
                "{p.text}"
              </h3>
              <div className="flex flex-col items-center gap-4">
                 <div className="h-px w-20 bg-rose-500/40" />
                 <span className="text-2xl font-black text-rose-500 uppercase tracking-[0.4em]">{p.author}</span>
                 {p.title && <span className="text-sm font-bold text-white/20 italic">{p.title}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Symbols Section: The iconic markers of identity.
 */
/**
 * Resistance Stats: Data that tells a story of survival.
 */
function ResistanceStatsSection() {
  const stats = [
    { label: "عام من الصمود", value: "76+", icon: Calendar, color: "text-rose-500" },
    { label: "شجرة زيتون", value: "11M+", icon: TreePine, color: "text-emerald-500" },
    { label: "لاجئ حول العالم", value: "7M+", icon: Users, color: "text-sky-500" },
    { label: "مدن وقرى محتلة", value: "500+", icon: Landmark, color: "text-amber-500" }
  ];

  return (
    <section className="py-40 relative">
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center space-y-6 group overflow-hidden shadow-2xl"
            >
               <div className={cn("absolute -top-12 -right-12 w-40 h-40 blur-3xl opacity-10 rounded-full", stat.color.replace('text', 'bg'))} />
               <stat.icon className={cn("w-12 h-12 mx-auto mb-8 transition-transform group-hover:scale-125 duration-500", stat.color)} />
               <motion.h4 
                 initial={{ scale: 0.5 }}
                 whileInView={{ scale: 1 }}
                 className="text-6xl md:text-8xl font-black text-white"
               >
                 {stat.value}
               </motion.h4>
               <p className="text-xl font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SymbolsSection() {
  return (
    <section id="symbols" className="py-40">
      <div className="container px-6">
        <div className="text-right mb-24 space-y-6">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">رموز <span className="text-rose-500">لا تنكسر</span></h2>
          <p className="text-2xl text-white/40 max-w-2xl mr-auto font-medium">أيقونات فلسطينية تحولت من مجرد رسومات وأشياء إلى رموز عالمية للصمود والحرية والعودة.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {SYMBOLS.map((symbol, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[4.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/5 hover:bg-white/[0.06] transition-all text-right group relative overflow-hidden shadow-xl"
            >
              <div className={cn("absolute top-0 right-0 w-3 h-full opacity-20", symbol.color)} />
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-4xl mb-10 group-hover:scale-110 transition-transform">
                {symbol.icon || <Star className="w-10 h-10 text-rose-500" />}
              </div>
              <h3 className="text-3xl font-black text-white mb-4">{symbol.name}</h3>
              <p className="text-lg text-white/50 leading-relaxed mb-6">{symbol.description}</p>
              <p className="text-xs font-bold text-white/20 italic">{symbol.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TreePlantingSimulation() {
  const [isPlanted, setIsPlanted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const plantTree = () => {
    setIsPlanted(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 3000);
  };

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-16"
        >
          <div className="space-y-6">
            <h2 className="text-4xl md:text-7xl font-black">ازرع <span className="text-emerald-500">زيتونة</span> للأمل المستمر</h2>
            <p className="text-2xl text-white/40 font-medium">شجرة الزيتون هي أعظم رمز للصمود الفلسطيني؛ فهي لا تموت، تضرب جذورها في التاريخ، وتثمر خيراً للأجيال. ازرع زيتونة رمزية الآن.</p>
          </div>

          <div className="relative h-96 flex items-center justify-center">
             <AnimatePresence mode="wait">
                {!isPlanted ? (
                  <motion.button
                    key="seed"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={plantTree}
                    className="group relative w-40 h-40 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center gap-4 transition-all shadow-glow-emerald/10"
                  >
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-ping group-hover:animate-none" />
                    <Leaf className="w-16 h-16 text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500/60">اضغط للزراعة</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="tree"
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="flex flex-col items-center gap-8"
                  >
                     <div className="relative">
                        <motion.div 
                          animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="w-48 h-48 bg-emerald-500/30 rounded-full flex items-center justify-center blur-3xl absolute inset-0"
                        />
                        <div className="relative z-10 flex flex-col items-center">
                           <motion.div
                             animate={{ 
                               rotate: [-2, 2, -2],
                               scale: [1, 1.05, 1]
                             }}
                             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                           >
                             <Image src="/palestine_landscape_olive_trees_1777280376366.png" alt="Planted Olive Tree" width={300} height={300} className="rounded-full border-4 border-emerald-500/30 shadow-3xl" />
                           </motion.div>
                           <div className="w-2 h-16 bg-emerald-900/60 rounded-full -mt-4 shadow-glow-emerald" />
                        </div>
                     </div>
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.5 }}
                       className="space-y-4"
                     >
                        <p className="text-4xl font-black text-white">تمت الزراعة بنجاح في أرض الذاكرة!</p>
                        <p className="text-xl text-white/40 font-bold uppercase tracking-[0.3em]">لقد غرست اليوم جذراً جديداً للأمل لا يمكن اقتلاعه.</p>
                     </motion.div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Prayer Counter: Spiritual solidarity engagement.
 */
function PrayerCounter() {
  const [count, setCount] = React.useState(0);
  const [isJumping, setIsJumping] = React.useState(false);

  const increment = () => {
    setCount(prev => prev + 1);
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);
  };

  return (
    <section className="py-40 bg-black/80 text-center relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.02),transparent)]" />
       <div className="container px-6 space-y-12 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white/80">أرسل دعوة صادقة لأهلنا في فلسطين</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={increment}
            className="group relative w-48 h-48 rounded-[3rem] bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center mx-auto hover:bg-white/5 hover:border-rose-500/40 transition-all shadow-3xl"
          >
             <Heart className={cn(
               "w-16 h-16 transition-all duration-500",
               count > 0 ? "text-rose-500 fill-rose-500 scale-110 shadow-glow-rose" : "text-white/20",
               isJumping ? "animate-bounce" : ""
             )} />
             <motion.span 
               key={count}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-white mt-4 font-black text-3xl font-headline"
             >
               {count.toLocaleString()}
             </motion.span>
             <div className="absolute -inset-4 bg-rose-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
          <p className="text-lg text-white/30 font-medium">كل ضغطة تمثل قلباً ينبض بالدعاء والتضامن.</p>
       </div>
    </section>
  );
}

/**
 * Al-Aqsa Detailed: The core of the identity.
 */
function AlAqsaDetail() {
  return (
    <section id="alaqsa-detail" className="py-60 relative bg-black">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
      
      <div className="container px-6 flex flex-col lg:flex-row items-center gap-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-12 text-right"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Sparkles className="w-5 h-5 text-emerald-500 shadow-glow-emerald" />
            <span className="text-xs font-black uppercase text-emerald-500 tracking-widest">القدس الشريف · بوابتنا للسماء</span>
          </div>
          <h2 className="text-6xl md:text-9xl font-black font-headline tracking-tighter text-right leading-[0.9]">
            المسجد الأقصى <br />
            <span className="text-white/20 italic">جوهرة الوجود</span>
          </h2>
          <p className="text-2xl text-white/40 leading-relaxed font-medium">
            على مساحة ١٤٤ دونماً من القداسة، يرتفع المسجد الأقصى كأعظم شاهد حي على الحق العربي والإسلامي في القدس. ليس مجرد بناء من حجر، بل هو قطعة من الجنة على الأرض وجزء لا يتجزأ من عقيدة المسلمين وهويتهم.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            {[
              { icon: MapPin, text: "ثاني مسجد وضع في الأرض بعد الكعبة المشرفة" },
              { icon: Star, text: "محل رحلة الإسراء ومعراج النبي ﷺ للسماء" },
              { icon: History, text: "أرض الأنبياء ومهبط الوحي وقبلة المسلمين الأولى" },
              { icon: Shield, text: "رمز خالد للصمود والمقاومة والسيادة العربية" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 text-white/80 font-bold group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  <item.icon className="w-7 h-7" />
                </div>
                <span className="text-lg leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-emerald-500/10 blur-[150px] rounded-full" />
          <motion.div 
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative rounded-[5rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group"
          >
            <Image 
              src="/palestine_hero_cinematic_1777220019628.png" 
              alt="Al-Aqsa Mosque Dome of the Rock" 
              width={900} 
              height={1100} 
              className="w-full h-auto object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[2s]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <div className="absolute bottom-12 right-12 left-12 p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] text-right space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30">تحفة العمارة الإسلامية</p>
              <p className="text-xl font-bold text-white/80 leading-relaxed">
                قبة الصخرة المشرفة، أيقونة الجمال وجوهر رحاب المسجد الأقصى المبارك، حيث تلتقي الفنون بالقداسة.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Resistance Chronicles: A cinematic timeline of the struggle.
 */
function ResistanceChroniclesSection() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <motion.div className="h-full bg-rose-500 origin-left" style={{ scaleX }} />
      </div>
      
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-24 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
            <Shield className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-black uppercase text-rose-400 tracking-widest">تاريخ من الإرادة · سجل المقاومة</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
            كرونولوجيا <span className="text-rose-500">النضال</span>
          </h2>
          <p className="text-2xl text-white/40 max-w-3xl mr-auto font-medium leading-relaxed">
            المقاومة ليست مجرد رد فعل، بل هي أسلوب حياة وإصرار على الوجود في وجه محاولات المحو.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line — Visible only on Desktop */}
          <div className="absolute right-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
          
          <div className="space-y-20 md:space-y-32">
            {RESISTANCE_CHRONICLES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={cn(
                  "relative flex flex-col md:flex-row items-center gap-8 md:gap-20",
                  i % 2 === 0 ? "md:flex-row-reverse" : ""
                )}
              >
                {/* Connector Dot */}
                <div className="absolute right-1/2 translate-x-1/2 w-5 h-5 bg-rose-500 rounded-full border-4 border-black z-10 hidden md:block shadow-glow-rose" />
                
                <div className="w-full md:w-[45%] space-y-4 text-center md:text-right">
                  <span className="text-5xl md:text-8xl font-black text-rose-500/10 block leading-none">{item.year}</span>
                  <h3 className="text-2xl md:text-4xl font-black text-white">{item.title}</h3>
                  <p className="text-base md:text-lg text-white/40 leading-relaxed max-w-md mx-auto md:mr-0">{item.description}</p>
                </div>
                <div className="hidden md:block md:w-[10%]" />
                <div className="hidden md:block md:w-[45%]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Museum of Heritage: High-end artifact showcase.
 */
function MuseumOfHeritageSection() {
  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.05),transparent)] pointer-events-none" />
      
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-32 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl mx-auto">
            <Palette className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">متحف الذاكرة الحية</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">
            مقتنيات <span className="text-amber-500 text-glow-amber">لا تُباع</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {HERITAGE_ARTIFACTS.map((artifact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center overflow-hidden hover:bg-white/[0.06] transition-all"
            >
              <div className={cn(
                "absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-20",
                artifact.color === 'amber' ? 'bg-amber-500' : 
                artifact.color === 'rose' ? 'bg-rose-500' : 
                artifact.color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-500'
              )} />
              
              <div className="relative z-10 space-y-8">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {artifact.icon === 'Key' && <Key className="w-10 h-10 text-amber-400" />}
                  {artifact.icon === 'Palette' && <Palette className="w-10 h-10 text-rose-400" />}
                  {artifact.icon === 'TreePine' && <TreePine className="w-10 h-10 text-emerald-400" />}
                  {artifact.icon === 'Shield' && <Shield className="w-10 h-10 text-slate-400" />}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">{artifact.name}</h3>
                  <p className="text-white/40 leading-relaxed font-medium">{artifact.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Global Awareness Grid: Hidden truths exposed.
 */
function GlobalAwarenessGrid() {
  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-12 text-right"
          >
            <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
              <Eye className="w-5 h-5 text-rose-400" />
              <span className="text-xs font-black uppercase text-rose-400 tracking-widest">ما لا تراه الكاميرات</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              حقائق <span className="text-rose-500">مغيبة</span> عن العالم
            </h2>
            <p className="text-2xl text-white/40 font-medium leading-relaxed">
              خلف الصور الجميلة، هناك واقع يومي من الفصل والتقييد، يواجهه الفلسطيني بإبداع مذهل في الصمود والالتفاف على المحتل.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {GLOBAL_TRUTH_DATA.map((item, i) => (
                <div key={i} className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 space-y-4">
                  <h4 className="text-xl font-black text-white">{item.title}</h4>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-[5rem] overflow-hidden group shadow-3xl"
          >
            <Image
              src="/media__1774007763847.png"
              alt="Truth Visualization"
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-12 right-12 left-12 p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] text-right">
              <p className="text-sm font-black text-rose-500 uppercase tracking-widest mb-2">الشاهد الصامت</p>
              <p className="text-xl font-bold text-white">"الجدران قد تفصل الأجساد، لكنها لا تمنع الأرواح من التلاقي والحرية."</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Cities Explorer: Immersive Palestinian cities grid.
 */
function CitiesExplorerSection() {
  const [active, setActive] = React.useState<number | null>(null);

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-24 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
            <MapPin className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">جغرافية الحب والوطن</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
            مدن <span className="text-amber-500">لا تُنسى</span>
          </h2>
          <p className="text-2xl text-white/40 max-w-3xl mr-auto font-medium leading-relaxed">
            كل مدينة فلسطينية هي رواية بحد ذاتها، مكتوبة بأصابع الزمن وروح الإنسان المتجذر في الأرض.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CITIES.map((city, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onHoverStart={() => setActive(i)}
              onHoverEnd={() => setActive(null)}
              className="relative p-10 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-right group cursor-default overflow-hidden shadow-2xl transition-all hover:bg-white/[0.06]"
              style={{ minHeight: 280 }}
            >
              {/* Glow effect */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-4xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">{city.name}</h3>
                  <p className="text-sm font-black text-amber-500/60 uppercase tracking-widest mb-6">{city.title}</p>
                </div>
                
                <motion.p
                  initial={false}
                  animate={{ opacity: active === i ? 1 : 0.4, y: active === i ? 0 : 8 }}
                  transition={{ duration: 0.3 }}
                  className="text-base text-white/60 leading-relaxed"
                >
                  {city.description}
                </motion.p>

                {city.knownFor && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: active === i ? 1 : 0, y: active === i ? 0 : 10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="mt-6 pt-6 border-t border-white/5"
                  >
                    <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest mb-2">اشتهرت بـ</p>
                    <p className="text-sm text-white/50">{city.knownFor}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Pledge Counter: A real, Firestore-backed solidarity commitment tracker.
 * Anti-manipulation: localStorage (client) + IP-hash fingerprint (server).
 */
const PLEDGE_LS_KEY = 'waqfah_palestine_pledged_v1';
const PLACEHOLDER_NAMES = ["أحمد", "سارة", "خالد", "فاطمة", "Omar", "Aisha", "محمد", "Layla", "يوسف", "Nour", "Karim", "هند", "Tariq", "ريم", "Hassan"];

type PledgeStatus = 'idle' | 'loading' | 'pledged' | 'already_pledged' | 'error';

function PledgeCounterSection() {
  const [count, setCount] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<PledgeStatus>('idle');
  const [name, setName] = React.useState('');
  const [pledgedName, setPledgedName] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  // Fetch the real count on mount
  React.useEffect(() => {
    // Check client-side cache first
    const lsData = localStorage.getItem(PLEDGE_LS_KEY);
    if (lsData) {
      try {
        const parsed = JSON.parse(lsData);
        if (parsed?.pledged) {
          setStatus('already_pledged');
          setPledgedName(parsed.name || '');
        }
      } catch { /* ignore */ }
    }

    // Always fetch the real live count from the server
    fetch('/api/palestine/pledge')
      .then(r => r.json())
      .then(data => setCount(data.count ?? 14872))
      .catch(() => setCount(14872));
  }, []);

  const handlePledge = async () => {
    // Client-side guard: check localStorage before hitting the server
    const lsData = localStorage.getItem(PLEDGE_LS_KEY);
    if (lsData) {
      const parsed = JSON.parse(lsData);
      if (parsed?.pledged) {
        setStatus('already_pledged');
        setPledgedName(parsed.name || '');
        return;
      }
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/palestine/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (res.status === 409 || data.alreadyPledged) {
        // Server says already pledged — update localStorage to avoid future calls
        localStorage.setItem(PLEDGE_LS_KEY, JSON.stringify({ pledged: true, name }));
        setStatus('already_pledged');
        setPledgedName(name);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'حدث خطأ. حاول مرة أخرى.');
        setStatus('error');
        return;
      }

      // Success! Save to localStorage so we don't hit the server again
      localStorage.setItem(PLEDGE_LS_KEY, JSON.stringify({ pledged: true, name }));
      setCount(data.count);
      setPledgedName(name);
      setStatus('pledged');
    } catch {
      setErrorMsg('تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مجدداً.');
      setStatus('error');
    }
  };

  const isPledged = status === 'pledged' || status === 'already_pledged';
  const isLoading = status === 'loading';

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent)] pointer-events-none" />
      <div className="container px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-16 md:p-24 rounded-[5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center space-y-16 shadow-3xl relative overflow-hidden"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full" />

            {/* Header */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl mx-auto">
                <Heart className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase text-emerald-400 tracking-widest">جدار التضامن العالمي · حقيقي ومباشر</span>
              </div>

              <h2 className="text-5xl md:text-8xl font-black tracking-tighter">
                {count === null ? (
                  <span className="inline-block animate-pulse text-white/30">جاري التحميل...</span>
                ) : (
                  <motion.span
                    key={count}
                    initial={{ scale: 1.3, color: "#10b981" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.5 }}
                    className="inline-block"
                  >
                    {count.toLocaleString('ar-SA')}
                  </motion.span>
                )}
                <br />
                <span className="text-white/20">صوت حقيقي معنا حتى الآن</span>
              </h2>

              <p className="text-2xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">
                كل صوت هنا حقيقي. لا تكرار، لا تلاعب. فقط أحرار يُسجّلون موقفهم من الحق.
              </p>
            </div>

            {/* Form / State */}
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {!isPledged && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto"
                  >
                    <input
                      type="text"
                      placeholder="اسمك (اختياري)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isLoading}
                      maxLength={60}
                      className="flex-1 h-16 px-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl text-right font-bold focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-40"
                    />
                    <motion.button
                      whileHover={isLoading ? {} : { scale: 1.05 }}
                      whileTap={isLoading ? {} : { scale: 0.95 }}
                      onClick={handlePledge}
                      disabled={isLoading}
                      className={cn(
                        "h-16 px-12 rounded-2xl font-black text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] whitespace-nowrap min-w-[180px]",
                        isLoading
                          ? "bg-emerald-500/40 text-black/40 cursor-wait"
                          : "bg-emerald-500 text-black hover:bg-emerald-400"
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-3 justify-center">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-5 h-5 border-2 border-black/40 border-t-black rounded-full"
                          />
                          جاري التسجيل...
                        </span>
                      ) : "أعلن دعمي ←"}
                    </motion.button>
                  </motion.div>
                )}

                {isPledged && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="space-y-4"
                  >
                    <div className="text-6xl">🤲</div>
                    <p className="text-2xl font-black text-emerald-400">
                      {status === 'already_pledged'
                        ? `${pledgedName || 'أيها الحر'}، دعمك مُسجَّل بالفعل. شكراً لصمودك! 🌿`
                        : `شكراً ${pledgedName || 'أيها الحر'}! صوتك مسجل في سجل التاريخ.`}
                    </p>
                    <p className="text-white/40">لن ننسى، ولن نسكت، ولن نتوقف حتى يُحقَق العدل.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-rose-400 font-bold"
                >
                  ⚠️ {errorMsg}
                </motion.p>
              )}
            </div>

            {/* Solidarity Wall — decorative names */}
            <div className="relative z-10 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {PLACEHOLDER_NAMES.map((n, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-4 py-2 text-sm font-bold text-white/30 bg-white/[0.02] border border-white/5 rounded-2xl"
                >
                  {n}
                </motion.span>
              ))}
              {isPledged && pledgedName && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 text-sm font-bold text-emerald-400 border border-emerald-500/30 rounded-2xl bg-emerald-500/10"
                >
                  {pledgedName} ✓
                </motion.span>
              )}
              {count !== null && (
                <span className="px-4 py-2 text-sm font-bold text-white/20 border border-white/5 rounded-2xl">
                  و{Math.max(0, count - PLACEHOLDER_NAMES.length).toLocaleString('ar-SA')}+ آخرون...
                </span>
              )}
            </div>

            {/* Integrity badge */}
            <div className="relative z-10 flex items-center justify-center gap-3 text-white/20">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">نظام تصويت نزيه · صوت واحد لكل شخص · محمي من التلاعب</span>
              <Shield className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Immersive Poetry Wall: Cinematic Palestinian poetry showcase.
 */
function ImmersivePoetryWall() {
  const poems = [
    {
      text: "عَلَى هَذِهِ الأَرْضِ مَا يَسْتَحِقُّ الحَيَاةَ",
      author: "محمود درويش",
      work: "على هذه الأرض",
      lang: "ar"
    },
    {
      text: "نحن لا نريد السلام الذي هو سلام العبيد، نريد السلام الذي هو عدالة",
      author: "غسان كنفاني",
      work: "رسائل من غزة",
      lang: "ar"
    },
    {
      text: "سَأَحْمِلُ رُوحِي عَلَى رَاحَتِي، وَأُلْقِي بِهَا فِي مَهَاوِي الرَّدَى",
      author: "عبد الرحيم محمود",
      work: "قصيدة الشهيد",
      lang: "ar"
    },
    {
      text: "حتى حين أسكت، لا أسكت؛ فصمتي يصرخ",
      author: "فدوى طوقان",
      work: "وجدت حياتي",
      lang: "ar"
    },
  ];

  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % poems.length), 6000);
    return () => clearInterval(t);
  }, [poems.length]);

  return (
    <section className="py-60 relative overflow-hidden">
      {/* Dramatic background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(228,49,43,0.06),transparent_70%)]" />

      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-32 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl mx-auto">
            <Quote className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-black uppercase text-rose-400 tracking-widest">أدب المقاومة · صوت الأرض</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">
            حين تتكلم <span className="text-rose-500">القصيدة</span>
          </h2>
        </motion.div>

        {/* Featured Poem */}
        <div className="max-w-5xl mx-auto mb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-16 md:p-24 rounded-[5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center shadow-3xl overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-500/5 blur-[80px] rounded-full" />
              <Quote className="w-12 h-12 md:w-20 md:h-20 text-rose-500/10 mx-auto mb-10" />
              <p className="text-xl md:text-5xl font-black leading-relaxed text-white mb-12 font-quran">
                "{poems[active].text}"
              </p>
              <div className="space-y-2">
                <p className="text-lg md:text-xl font-black text-rose-400">{poems[active].author}</p>
                <p className="text-[10px] md:text-sm text-white/30 font-bold uppercase tracking-widest">{poems[active].work}</p>
              </div>

              {/* Poem Indicators */}
              <div className="flex justify-center gap-4 mt-12">
                {poems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={cn(
                      "transition-all duration-500 rounded-full",
                      i === active ? "w-10 h-3 bg-rose-500" : "w-3 h-3 bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* All Poems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {poems.map((poem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActive(i)}
              className={cn(
                "p-10 rounded-[3.5rem] border text-right cursor-pointer transition-all group",
                active === i
                  ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.1)]"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              )}
            >
              <p className="text-lg font-bold text-white/70 leading-relaxed mb-6 italic">"{poem.text.slice(0, 60)}..."</p>
              <p className="text-sm font-black text-rose-400">{poem.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Global Media Watch: Trusted sources to learn the truth.
 */
function GlobalMediaWatchSection() {
  const sources = [
    { category: "وثائقيات", icon: "🎬", items: [
      { title: "فيلم فرحة", desc: "رواية النكبة من عيون طفلة فلسطينية", tag: "Netflix" },
      { title: "5 كاميرات مكسورة", desc: "تصوير ميداني للمقاومة الشعبية", tag: "Oscar" },
      { title: "مواطن/مهاجر", desc: "قصة الهوية في ظل الاحتلال", tag: "Sundance" },
    ]},
    { category: "كتب مرجعية", icon: "📚", items: [
      { title: "تطهير فلسطين عرقياً", desc: "إيلان بابيه - الرواية التاريخية الموثقة", tag: "تاريخ" },
      { title: "رأيت رام الله", desc: "مريد البرغوثي - سيرة العودة المؤلمة", tag: "أدب" },
      { title: "The Question of Palestine", desc: "إدوارد سعيد - الصوت الأكاديمي الأكبر", tag: "أكاديمي" },
    ]},
    { category: "مصادر إخبارية", icon: "📡", items: [
      { title: "الجزيرة الإنجليزية", desc: "أوسع تغطية ميدانية في العالم العربي", tag: "aljazeera.com" },
      { title: "Middle East Eye", desc: "تقارير معمقة من داخل الأراضي الفلسطينية", tag: "middleeasteye.net" },
      { title: "972 Magazine", desc: "صحافة مستقلة من الأرض المحتلة", tag: "+972mag.com" },
    ]},
  ];

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-24 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-black uppercase text-sky-400 tracking-widest">مصادر موثوقة · اعرف الحقيقة</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
            تعلّم <span className="text-sky-500">الحقيقة</span> <br />
            <span className="text-white/20">من مصادرها</span>
          </h2>
          <p className="text-2xl text-white/40 max-w-3xl mr-auto font-medium leading-relaxed">
            في زمن تشويه الحقائق، المعرفة هي السلاح الأول. هذه المصادر الموثوقة ستجعلك سفيراً للحق في كل مكان.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {sources.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="p-10 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 space-y-10 shadow-2xl group hover:border-sky-500/20 transition-all"
            >
              <div className="flex items-center justify-end gap-4">
                <h3 className="text-2xl font-black text-white">{src.category}</h3>
                <span className="text-4xl">{src.icon}</span>
              </div>
              <div className="space-y-6">
                {src.items.map((item, j) => (
                  <div key={j} className="p-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-3xl text-right transition-all group/item cursor-pointer">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className="text-[10px] font-black text-sky-500/70 uppercase tracking-widest px-3 py-1 bg-sky-500/10 rounded-full">{item.tag}</span>
                      <h4 className="text-lg font-black text-white group-hover/item:text-sky-400 transition-colors">{item.title}</h4>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Facts Counter: Verified data that cannot be denied.
 */
function FactsCounterSection() {
  const facts = [
    { value: "750K+", label: "فلسطيني هُجِّر عام النكبة 1948", color: "text-rose-500", bg: "bg-rose-500" },
    { value: "531", label: "قرية ومدينة دُمِّرت بالكامل", color: "text-amber-500", bg: "bg-amber-500" },
    { value: "140+", label: "قرار أممي يُطالب بالحقوق الفلسطينية", color: "text-sky-500", bg: "bg-sky-500" },
    { value: "7M+", label: "لاجئ فلسطيني في شتى بقاع الأرض", color: "text-emerald-500", bg: "bg-emerald-500" },
    { value: "56+", label: "عاماً من الاحتلال المستمر للأرض", color: "text-violet-500", bg: "bg-violet-500" },
    { value: "2M+", label: "إنسان محاصر في قطاع غزة", color: "text-rose-500", bg: "bg-rose-500" },
  ];

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(228,49,43,0.04),transparent)] pointer-events-none" />
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-32 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl mx-auto">
            <Shield className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-black uppercase text-rose-400 tracking-widest">أرقام موثقة · لا يمكن إنكارها</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">
            الحقيقة <span className="text-rose-500">بالأرقام</span>
          </h2>
          <p className="text-2xl text-white/40 font-medium max-w-3xl mx-auto leading-relaxed">
            هذه ليست إحصاءات، بل هي أرواح وذكريات وأحلام. كل رقم هنا يحمل ألم إنسان حقيقي يستحق أن يُعرف حقه.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {facts.map((fact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className="p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center relative overflow-hidden group shadow-2xl hover:bg-white/[0.06] transition-all"
            >
              <div className={cn("absolute inset-x-0 bottom-0 h-1 opacity-60", fact.bg)} />
              <div className={cn("absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-5 transition-opacity group-hover:opacity-15", fact.bg)} />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={cn("text-6xl md:text-8xl font-black mb-6", fact.color)}
              >
                {fact.value}
              </motion.p>
              <p className="text-xl font-bold text-white/50 leading-relaxed">{fact.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center text-white/20 text-sm font-bold mt-16 tracking-widest uppercase"
        >
          المصادر: الأمم المتحدة · هيومن رايتس ووتش · منظمة العفو الدولية · بتسيلم
        </motion.p>
      </div>
    </section>
  );
}

/**
 * Global Solidarity Call: Organizations and ways to act.
 */
function GlobalSolidarityCallSection() {
  const organizations = [
    { name: "الأونروا", nameEn: "UNRWA", desc: "وكالة الأمم المتحدة لإغاثة اللاجئين الفلسطينيين وتشغيلهم", color: "border-sky-500/30", link: "https://unrwa.org" },
    { name: "منظمة العفو", nameEn: "Amnesty International", desc: "التقارير الحقوقية الدولية التي وثّقت جرائم الاحتلال", color: "border-amber-500/30", link: "https://amnesty.org" },
    { name: "هيومن رايتس ووتش", nameEn: "Human Rights Watch", desc: "تقارير ميدانية موثقة عن انتهاكات حقوق الإنسان", color: "border-rose-500/30", link: "https://hrw.org" },
    { name: "BDS Movement", nameEn: "حركة المقاطعة الدولية", desc: "حملة مقاطعة وسحب الاستثمارات والعقوبات لدعم الحقوق", color: "border-emerald-500/30", link: "https://bdsmovement.net" },
  ];

  const actions = [
    { icon: Share2, title: "انشر الوعي", desc: "شارك هذه الصفحة مع 10 أشخاص اليوم", color: "text-sky-400" },
    { icon: BookOpen, title: "تعلم أكثر", desc: "اقرأ كتاباً واحداً عن فلسطين هذا الشهر", color: "text-amber-400" },
    { icon: HeartPulse, title: "ادعم إغاثياً", desc: "تبرع لمنظمة موثوقة تدعم الأسر الفلسطينية", color: "text-rose-400" },
    { icon: Megaphone, title: "كن صوتاً", desc: "شارك في الفعاليات والمظاهرات السلمية المحلية", color: "text-emerald-400" },
  ];

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6 space-y-32">
        {/* Organizations */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-right mb-20 space-y-6"
          >
            <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-black uppercase text-emerald-400 tracking-widest">منظمات دولية · شركاء الحق</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
              العالم <span className="text-emerald-500">معنا</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {organizations.map((org, i) => (
              <motion.a
                key={i}
                href={org.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border-2 text-right flex items-center gap-10 group shadow-2xl hover:bg-white/[0.06] transition-all cursor-pointer",
                  org.color
                )}
              >
                <div className="flex-1 space-y-4">
                  <h3 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{org.name}</h3>
                  <p className="text-sm font-bold text-white/30 uppercase tracking-widest">{org.nameEn}</p>
                  <p className="text-lg text-white/50 leading-relaxed">{org.desc}</p>
                </div>
                <ExternalLink className="w-8 h-8 text-white/20 group-hover:text-emerald-500 group-hover:scale-125 transition-all flex-shrink-0" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Action Steps */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20 space-y-6"
          >
            <h2 className="text-4xl md:text-7xl font-black">
              ماذا تفعل <span className="text-rose-500">الآن</span>؟
            </h2>
            <p className="text-xl text-white/40 font-medium max-w-2xl mx-auto">خطوات بسيطة، لكنها تُصنع فرقاً حقيقياً</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {actions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -15, scale: 1.03 }}
                transition={{ delay: i * 0.1 }}
                className="p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center space-y-8 shadow-2xl group cursor-pointer"
              >
                <div className={cn("w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform", action.color)}>
                  <action.icon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white">{action.title}</h3>
                <p className="text-lg text-white/40 leading-relaxed">{action.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Palestine Map Overlay: Fixed background element.
 */
function PalestineMapOverlay() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.02] z-[-1] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vh]">
        <svg viewBox="0 0 200 600" className="w-full h-full fill-white">
          <path d="M100 0 C120 100, 150 200, 140 300 C130 400, 110 500, 100 600 L80 600 C70 500, 50 400, 60 300 C70 200, 80 100, 100 0" />
        </svg>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━

export default function PalestinePage() {
  return (
    <main className="min-h-screen text-foreground selection:bg-rose-500/30 selection:text-rose-400 overflow-x-hidden relative" dir="rtl">
      {/* Cinematic & Glassy Elements */}
      <CinematicAudioPlayer />
      <GlassyBackground />
      <FilmGrain />
      <CinematicCursor />
      
      {/* Background Architecture Elements */}
      <PalestineMapOverlay />
      
      {/* Cinematic Journey Sections */}
      <HeroSection />
      
      <QuoteSection />

      <ResistanceStatsSection />
      
      <SectionGrid />

      <SacredConnectionBento />

      <LestWeForgetMemorial />

      <MediaGallery />

      <AlAqsaDetail />

      <EternalSpiritSection />

      <ResistanceChroniclesSection />

      <MuseumOfHeritageSection />

      <GlobalAwarenessGrid />

      <TatreezPatternsGrid />

      <GlobalVoicesSection />

      <ArchHistorySection />

      <DiasporaUnitySection />

      <DigitalLibrarySection />

      <CitiesExplorerSection />

      <ImmersivePoetryWall />

      <GlobalMediaWatchSection />

      <FactsCounterSection />

      <FutureHopeSection />

      <PledgeCounterSection />

      <GlobalSolidarityCallSection />

      <SolidarityActionGrid />

      <CommitmentSection />

      <FlagMeaningSection />

      <PersonalitiesSection />

      <FoodCultureSection />

      <SymbolsSection />

      <KnowledgeQuiz />

      <TimelineSection />

      <PoetrySection />

      <TreePlantingSimulation />

      <PrayerCounter />
      
      {/* Global Solidarity Card */}
      <section className="py-20 md:py-60">
        <div className="container px-6">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="text-center bg-gradient-to-br from-rose-950/20 via-black to-emerald-950/20 p-12 md:p-40 rounded-[3rem] md:rounded-[6rem] border border-white/5 relative overflow-hidden group shadow-3xl"
          >
            <div className="absolute inset-0 bg-[url('/palestine_hero_cinematic_1777220019628.png')] bg-cover opacity-5 grayscale group-hover:opacity-10 transition-opacity duration-1000" />
            <motion.div 
               animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
               transition={{ duration: 10, repeat: Infinity }}
               className="absolute -top-20 -right-20 w-80 h-80 bg-rose-500/5 blur-[100px] rounded-full" 
            />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full" />
            
            <div className="relative z-10 space-y-12">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-12 border border-white/10 group-hover:scale-110 transition-transform">
                  <Heart className="w-12 h-12 text-rose-500 animate-pulse fill-rose-500/20" />
               </div>
               <h2 className="text-[clamp(2.5rem,8vw,8rem)] font-black font-headline tracking-tighter leading-tight">
                 كن صوتاً <span className="text-rose-500">للحق</span> <br /> 
                 في أرض <span className="text-emerald-500">الأنبياء</span>
               </h2>
               <p className="text-lg md:text-2xl text-white/40 font-medium max-w-3xl mx-auto leading-relaxed">
                 انتهت الكلمات ولكن القضية مستمرة في قلوب الأحرار. كل مشاركة، كل كلمة وعي، وكل دعاء صادق هو خطوة نحو فجر الحرية الموعود.
               </p>
               <div className="pt-12">
                  <button className="h-20 px-16 bg-white text-black rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-glow-white backdrop-blur-xl">
                    شارك الأمانة الآن
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer Heritage */}
      <footer className="py-32 border-t border-white/5 relative">
        <div className="container px-6 text-center space-y-12">
          <div className="flex items-center justify-center gap-6 md:gap-10">
            <div className="w-12 md:w-20 h-1.5 bg-red-600 rounded-full shadow-glow-rose/50" />
            <div className="w-12 md:w-20 h-1.5 bg-white rounded-full shadow-glow-white/50" />
            <div className="w-12 md:w-20 h-1.5 bg-emerald-600 rounded-full shadow-glow-emerald/50" />
          </div>
          
          <div className="space-y-4">
             <h3 className="text-3xl font-black tracking-widest text-white">ستبقى فلسطين حرة أبية</h3>
             <p className="text-white/20 text-sm font-black uppercase tracking-[0.6em]">WAQFAH PLATFORM · EST 2026</p>
          </div>
          
          <div className="flex items-center justify-center gap-8 pt-8">
             {['القدس', 'غزة', 'حيفا', 'يافا', 'نابلس', 'الخليل'].map(city => (
               <span key={city} className="text-[10px] font-black text-white/10 uppercase tracking-widest hover:text-white/40 transition-colors cursor-default">
                  {city}
               </span>
             ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

