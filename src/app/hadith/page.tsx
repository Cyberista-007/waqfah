'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book, Search, Mic, Star, Heart, Share2, Library, Sparkles,
  BookOpen, Quote, ShieldCheck, Layers,
  ArrowRight, Zap, RefreshCw, Copy, Trash2, Users, Volume2, ArrowLeft,
  Clock, Trophy, Check, X, HelpCircle, Award, ChevronLeft, Loader2
} from 'lucide-react';
import { ImanCardGenerator } from '@/components/iman-card-generator';
import { HadithMemorizer } from '@/components/hadith-memorizer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HADITH_SECTIONS_FALLBACK } from './hadith-data-hub';
import { usePathname } from 'next/navigation';
import HadithPageClient from './[bookId]/HadithPageClient';

const BADGES = [
  { id: 'novice', name: 'مبتدئ السنة', req: 10, desc: 'أجب بشكل صحيح عن سؤال واحد في التحدي (10 نقاط).', icon: Award, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'seeker', name: 'طالب علم', req: 30, desc: 'أجب بشكل صحيح عن 3 أسئلة (30 نقطة).', icon: BookOpen, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'narrator', name: 'راوية الحديث', req: 50, desc: 'أجب بشكل صحيح عن 5 أسئلة (50 نقطة).', icon: Users, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'guardian', name: 'حافظ السنن', req: 80, desc: 'اجمع 80 نقطة معرفية في تحدي السنة.', icon: ShieldCheck, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'scholar', name: 'محدّث الديار', req: 100, desc: 'اجمع 100 نقطة معرفية في تحدي السنة.', icon: Trophy, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
];



function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F]/g, "") // remove tashkeel
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

function getHadithSnippet(text: string, query: string, maxLength: number = 100): string {
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);
  const matchIdx = normalizedText.indexOf(normalizedQuery);
  if (matchIdx === -1) return text.substring(0, maxLength) + '...';
  
  const start = Math.max(0, matchIdx - 40);
  const end = Math.min(text.length, matchIdx + normalizedQuery.length + 60);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

function highlightSnippet(text: string, query: string) {
  if (!query) return text;
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);
  const index = normalizedText.indexOf(normalizedQuery);
  if (index === -1) return text;

  let originalStart = 0;
  let normalizedIdx = 0;
  while (normalizedIdx < index && originalStart < text.length) {
    if (/[\u064B-\u065F]/.test(text[originalStart])) {
      originalStart++;
    } else {
      originalStart++;
      normalizedIdx++;
    }
  }
  let originalEnd = originalStart;
  let queryMatchedLen = 0;
  while (queryMatchedLen < normalizedQuery.length && originalEnd < text.length) {
    if (/[\u064B-\u065F]/.test(text[originalEnd])) {
      originalEnd++;
    } else {
      originalEnd++;
      queryMatchedLen++;
    }
  }

  const before = text.substring(0, originalStart);
  const match = text.substring(originalStart, originalEnd);
  const after = text.substring(originalEnd);
  return (
    <>
      {before}
      <span className="bg-amber-500/20 text-amber-300 font-bold px-1 rounded">{match}</span>
      {after}
    </>
  );
}

interface HadithStat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

const STATS: HadithStat[] = [
  { label: 'إجمالي الأحاديث', value: '50,000+', icon: Library, color: 'text-amber-500' },
  { label: 'دواوين السنة', value: '10+', icon: ShieldCheck, color: 'text-emerald-500' },
  { label: 'أبواب فقهية', value: '3,500+', icon: Layers, color: 'text-blue-500' },
  { label: 'دقة المراجعة', value: 'موثق', icon: Star, color: 'text-rose-500' },
];

const MAIN_BOOKS = [
  {
    id: 'bukhari',
    name: 'صحيح البخاري',
    author: 'الإمام البخاري',
    count: '7,563',
    color: 'text-amber-400',
    bg: 'from-amber-600/20',
    tag: 'أصح الكتب',
    desc: 'المسند الصحيح المختصر من أمور رسول الله ﷺ وسننه وأيامه.'
  },
  {
    id: 'muslim',
    name: 'صحيح مسلم',
    author: 'الإمام مسلم',
    count: '3,033',
    color: 'text-emerald-400',
    bg: 'from-emerald-600/20',
    tag: 'درجة الصحة العليا',
    desc: 'الجامع الصحيح المسند المختصر من السنن عن رسول الله ﷺ.'
  },
  {
    id: 'abudawud',
    name: 'سنن أبي داود',
    author: 'أبو داود السجستاني',
    count: '5,274',
    color: 'text-blue-400',
    bg: 'from-blue-600/20',
    tag: 'أشهر السنن',
    desc: 'ألفه الإمام أحمد بن شعيب السجستاني في المسائل الفقهية.'
  },
  {
    id: 'tirmidhi',
    name: 'جامع الترمذي',
    author: 'الإمام الترمذي',
    count: '3,956',
    color: 'text-rose-400',
    bg: 'from-rose-600/20',
    tag: 'جمع السنن والعلل',
    desc: 'الجامع المختصر من السنن عن رسول الله ﷺ ومعرفة الصحيح والمعلول.'
  },
  {
    id: 'nasai',
    name: 'سنن النسائي',
    author: 'الإمام النسائي',
    count: '5,758',
    color: 'text-violet-400',
    bg: 'from-violet-600/20',
    tag: 'المجتبى',
    desc: 'يُعد أقل الكتب الستة بعد الصحيحين حديثاً ضعيفاً ورجلاً متكلماً فيه.'
  },
  {
    id: 'ibnmajah',
    name: 'سنن ابن ماجه',
    author: 'ابن ماجه القزويني',
    count: '4,341',
    color: 'text-orange-400',
    bg: 'from-orange-600/20',
    tag: 'متمم الستة',
    desc: 'من أمهات كتب الحديث الستة العظيمة التي عليها مدار الإسلام.'
  },
  {
    id: 'malik',
    name: 'موطأ مالك',
    author: 'الإمام مالك بن أنس',
    count: '1,720',
    color: 'text-blue-300',
    bg: 'from-blue-500/20',
    tag: 'أول المدوّنات',
    desc: 'أقدم كتب الحديث التي وصلت إلينا، رتبه الإمام مالك على الأبواب الفقهية.',
    isNew: true
  },
  {
    id: 'ahmad',
    name: 'مسند أحمد',
    author: 'الإمام أحمد بن حنبل',
    count: '27,647',
    color: 'text-red-400',
    bg: 'from-red-600/20',
    tag: 'أضخم المسانيد',
    desc: 'ديوان السنة الأكبر، رتبه الإمام أحمد بن حنبل على مسانيد الصحابة رضي الله عنهم.',
    isNew: true
  },
  {
    id: 'darimi',
    name: 'سنن الدارمي',
    author: 'الإمام الدارمي',
    count: '3,503',
    color: 'text-lime-400',
    bg: 'from-lime-600/20',
    tag: 'إتقان الترتيب',
    desc: 'من أمهات السنن، امتاز ببراعة الترتيب ودقة التبويب الفقهي والحديثي.',
    isNew: true
  },
  {
    id: 'riyadussaliheen',
    name: 'رياض الصالحين',
    author: 'الإمام النووي',
    count: '1,896',
    color: 'text-cyan-400',
    bg: 'from-cyan-600/20',
    tag: 'كتاب الرقائق والآداب',
    desc: 'من أشهر كتب الحديث في العالم الإسلامي، جمع فيه النووي الأحاديث الصحيحة في الترغيب والترهيب.'
  }
];

interface FavoriteHadith {
  bookId: string;
  bookName: string;
  hadithnumber: number;
  text: string;
  grade?: string;
  savedAt: number;
}

interface Narrator {
  id: string;
  name: string;
  count: string;
  title: string;
  fullName: string;
  bio: string;
  details: string[];
  color: string;
  bg: string;
}

const NARRATORS: Narrator[] = [
  {
    id: 'abuhurairah',
    name: 'أبو هريرة رضي الله عنه',
    title: 'راوية الإسلام وأحفظ الصحابة',
    count: '5,374 حديثاً',
    fullName: 'عبد الرحمن بن صخر الدوسي',
    bio: 'أكثر الصحابة رواية للحديث النبوي على الإطلاق. امتاز بشدة الحفظ وبركة دعاء النبي ﷺ له بألا ينسى ما يسمعه.',
    details: [
      'أسلم عام خيبر (سنة 7 هـ) ولزم النبي ﷺ أربع سنوات لزوماً تاماً.',
      'كان من أهل الصفة (الفقراء المقيمين في المسجد النبوي) متفرغاً للعلم.',
      'دعا له النبي ﷺ فبسط ثوبه ثم ضمه إلى صدره فلم ينسَ شيئاً بعده.',
      'توفي في المدينة المنورة سنة 57 هـ عن عمر ناهز 78 عاماً.'
    ],
    color: 'text-amber-400 border-amber-500/20',
    bg: 'from-amber-600/10 to-transparent'
  },
  {
    id: 'ibnumar',
    name: 'عبد الله بن عمر رضي الله عنهما',
    title: 'الفقيه الورع والمقتدي بالأثر',
    count: '2,630 حديثاً',
    fullName: 'عبد الله بن عمر بن الخطاب القرشي',
    bio: 'ابن أمير المؤمنين عمر بن الخطاب. كان من أشد الناس حرصاً على اتباع أثر النبي ﷺ وتقليده في كل حركة وسكنة.',
    details: [
      'أسلم بمكة وهو صغير مع والده وهاجر معه إلى المدينة المنورة.',
      'شهد غزوة الخندق وما بعدها، وكان من صغار الصحابة سناً في البداية.',
      'عُرف بورعه الشديد وزهده، وامتناعه عن تولي القضاء والخلافة تجنباً للفتن.',
      'توفي بمكة المكرمة سنة 73 هـ وهو آخر من مات من الصحابة بمكة.'
    ],
    color: 'text-emerald-400 border-emerald-500/20',
    bg: 'from-emerald-600/10 to-transparent'
  },
  {
    id: 'anas',
    name: 'أنس بن مالك رضي الله عنه',
    title: 'خادم رسول الله ﷺ وصاحب سره',
    count: '2,286 حديثاً',
    fullName: 'أنس بن مالك الأنصاري الخزرجي',
    bio: 'خدم النبي ﷺ عشر سنين منذ هجرته إلى المدينة حتى وفاته. دعا له النبي ﷺ بكثرة المال والولد وطول العمر فاستُجيب له.',
    details: [
      'قدمته أمه أم سليم للنبي ﷺ ليخدمه وهو ابن عشر سنين.',
      'قال عن خدمة النبي: "خدمته عشر سنين فما قال لي أف قط ولا قال لشيء صنعته لم صنعته".',
      'كان من آخر الصحابة وفاةً بالبصرة، ونقل تفاصيل دقيقة عن بيت النبوة.',
      'توفي بالبصرة سنة 93 هـ وقد جاوز مائة عام.'
    ],
    color: 'text-blue-400 border-blue-500/20',
    bg: 'from-blue-600/10 to-transparent'
  },
  {
    id: 'aisha',
    name: 'عائشة أم المؤمنين رضي الله عنها',
    title: 'أفقه نساء الأمة وحبيبة رسول الله',
    count: '2,210 حديثاً',
    fullName: 'عائشة بنت أبي بكر الصديق',
    bio: 'أم المؤمنين وزوجة النبي ﷺ، وأعلم نساء المسلمين بالفقه والطب والشعر. نقلت للأمة دقائق أحوال النبي ﷺ الأسرية والمنزلية.',
    details: [
      'تزوجها النبي ﷺ في مكة وبنى بها في المدينة بعد الهجرة.',
      'نزل الوحي في لحافها دون غيرها من نساء النبي ﷺ وبُرِّئت من فوق سبع سموات.',
      'كان كبار الصحابة يرجعون إليها ليستفتونها في معضلات المسائل والفرائض.',
      'توفيت بالمدينة المنورة سنة 58 هـ ودفنت بالبقيع.'
    ],
    color: 'text-rose-400 border-rose-500/20',
    bg: 'from-rose-600/10 to-transparent'
  },
  {
    id: 'ibnabbas',
    name: 'عبد الله بن عباس رضي الله عنهما',
    title: 'ترجمان القرآن وحبر الأمة',
    count: '1,660 حديثاً',
    fullName: 'عبد الله بن عباس بن عبد المطلب',
    bio: 'ابن عم النبي ﷺ. دعا له النبي ﷺ قائلاً: "اللهم فقهه في الدين وعلمه التأويل"، فصار أعلم الأمة بتفسير القرآن الكريم.',
    details: [
      'ولد بمكة قبل الهجرة بثلاث سنين، ولازم النبي ﷺ في أواخر حياته.',
      'أسس مدرسة علمية كبرى بمكة وفد إليها طلاب العلم من كل حدب وصوب.',
      'كان يسمى "البحر" لغزارة علمه وسعة إطلاعه في شتى العلوم.',
      'توفي بالطائف سنة 68 هـ وصلى عليه محمد بن الحنفية.'
    ],
    color: 'text-violet-400 border-violet-500/20',
    bg: 'from-violet-600/10 to-transparent'
  },
  {
    id: 'jabir',
    name: 'جابر بن عبد الله رضي الله عنهما',
    title: 'صاحب رحلة طلب الحديث الشهيرة',
    count: '1,540 حديثاً',
    fullName: 'جابر بن عبد الله الأنصاري',
    bio: 'شهد بيعة العقبة الثانية مع والده وهو صغير، وحضر غزوات كثيرة. رحل مسيرة شهر كامل للشام لطلب حديث واحد.',
    details: [
      'استشهد والده عبد الله بن عمرو بن حرام في غزوة أحد وترك عليه ديوناً وأخوات.',
      'دعا له النبي ﷺ وبرك في تمر أبيه فقضى دينه وبقي التمر كما هو.',
      'أقام حلقة علمية واسعة في المسجد النبوي الشريف في آخر حياته.',
      'توفي بالمدينة المنورة سنة 78 هـ وكان آخر من مات بالمدينة من الصحابة.'
    ],
    color: 'text-cyan-400 border-cyan-500/20',
    bg: 'from-cyan-600/10 to-transparent'
  }
];

export default function HadithHubPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'books' | 'favorites' | 'narrators' | 'notes' | 'about'>('books');
    const [hadithNotes, setHadithNotes] = useState<Record<string, { note: string; hadithText: string; bookName: string; sectionId: string }>>({});

    useEffect(() => {
      try {
        const storedNotes = localStorage.getItem('waqfah_hadith_notes');
        if (storedNotes) setHadithNotes(JSON.parse(storedNotes));
      } catch (e) {}
    }, [activeTab]);

    const deleteNote = (key: string) => {
      const nextNotes = { ...hadithNotes };
      delete nextNotes[key];
      setHadithNotes(nextNotes);
      localStorage.setItem('waqfah_hadith_notes', JSON.stringify(nextNotes));
      toast({ title: 'تم حذف الملاحظة بنجاح' });
    };
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const voiceRecognitionRef = useRef<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [isPlayingDaily, setIsPlayingDaily] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteHadith[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [selectedNarrator, setSelectedNarrator] = useState<Narrator | null>(null);
  const { toast } = useToast();

  const [searchMode, setSearchMode] = useState<'chapters' | 'hadiths'>('chapters');
  const [globalHadiths, setGlobalHadiths] = useState<any[]>([]);
  const [loadingGlobalHadiths, setLoadingGlobalHadiths] = useState(false);

  const fetchGlobalHadithsForSearch = useCallback(async () => {
    if (globalHadiths.length > 0 || loadingGlobalHadiths) return;
    setLoadingGlobalHadiths(true);
    try {
      const bukhariRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.json`, { cache: 'force-cache' });
      const bukhariData = bukhariRes.ok ? await bukhariRes.json() : null;

      const muslimRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim.json`, { cache: 'force-cache' });
      const muslimData = muslimRes.ok ? await muslimRes.json() : null;

      const riyadRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-riyadussaliheen.json`, { cache: 'force-cache' });
      const riyadData = riyadRes.ok ? await riyadRes.json() : null;

      const list: any[] = [];
      if (bukhariData?.hadiths) {
        bukhariData.hadiths.forEach((h: any) => {
          list.push({
            ...h,
            bookId: 'bukhari',
            bookName: 'صحيح البخاري',
            color: 'text-amber-400'
          });
        });
      }
      if (muslimData?.hadiths) {
        muslimData.hadiths.forEach((h: any) => {
          list.push({
            ...h,
            bookId: 'muslim',
            bookName: 'صحيح مسلم',
            color: 'text-emerald-400'
          });
        });
      }
      if (riyadData?.hadiths) {
        riyadData.hadiths.forEach((h: any) => {
          list.push({
            ...h,
            bookId: 'riyadussaliheen',
            bookName: 'رياض الصالحين',
            color: 'text-cyan-400'
          });
        });
      }

      setGlobalHadiths(list);
    } catch (e) {
      console.error("Failed to load global hadiths for search", e);
    } finally {
      setLoadingGlobalHadiths(false);
    }
  }, [globalHadiths.length, loadingGlobalHadiths]);

  const matchingGlobalHadiths = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const q = normalizeArabic(searchQuery.trim());
    return globalHadiths.filter((h: any) => {
      const text = normalizeArabic(h.text || h.arabic || "");
      const num = String(h.hadithnumber || h.number || "");
      return text.includes(q) || num.includes(q);
    }).slice(0, 30);
  }, [globalHadiths, searchQuery]);

  useEffect(() => {
    if (searchMode === 'hadiths') {
      fetchGlobalHadithsForSearch();
    }
  }, [searchMode, fetchGlobalHadithsForSearch]);

  // 🏆 Trivia States
  const TRIVIA_QUESTIONS = useMemo(() => [
    {
      q: "من هو الصحابي الجليل الملقب بـ 'راوية الإسلام' وأحفظ الصحابة؟",
      options: ["عبد الله بن عمر", "أنس بن مالك", "أبو هريرة", "عبد الله بن عباس"],
      correct: 2,
      hint: "دعا له الرسول ﷺ ببركة الحفظ وبسط ثوبه ثم ضمه."
    },
    {
      q: "ما هو كتاب الحديث الذي يُعد أصح الكتب المصنفة بعد القرآن الكريم مباشرة؟",
      options: ["صحيح مسلم", "موطأ مالك", "صحيح البخاري", "سنن أبي داود"],
      correct: 2,
      hint: "صنّفه الإمام محمد بن إسماعيل البخاري رحمه الله."
    },
    {
      q: "من هي أم المؤمنين التي كانت مرجعاً فقهياً لكبار الصحابة ونزلت براءتها في سورة النور؟",
      options: ["حفصة بنت عمر", "عائشة بنت أبي بكر", "أم سلمة", "زينب بنت جحش"],
      correct: 1,
      hint: "ابنة الصديق رضي الله عنهما وحبيبة رسول الله ﷺ."
    },
    {
      q: "من هو الصحابي الأنصاري الذي خدم النبي ﷺ 10 سنوات ودعا له النبي بطول العمر وكثرة الولد؟",
      options: ["أنس بن مالك", "جابر بن عبد الله", "أبو سعيد الخدري", "زيد بن حارثة"],
      correct: 0,
      hint: "كنيته أبو حمزة، وتوفي بالبصرة بعد أن جاوز المائة عام."
    },
    {
      q: "من هو الصحابي الجليل الملقب بـ 'ترجمان القرآن' وحبر هذه الأمة؟",
      options: ["عبد الله بن مسعود", "عبد الله بن عباس", "علي بن أبي طالب", "أبي بن كعب"],
      correct: 1,
      hint: "ابن عم رسول الله ﷺ ودعا له الرسول بالفقه والتأويل."
    }
  ], []);

  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showTriviaFeedback, setShowTriviaFeedback] = useState(false);
  const [triviaScore, setTriviaScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const THEMATIC_TOPICS = useMemo(() => [
    { title: "النية والإخلاص", query: "النية", icon: Sparkles, desc: "أحاديث حول النية وإخلاص العمل لله" },
    { title: "العلم والتعليم", query: "العلم", icon: BookOpen, desc: "فضل العلم وطلبه وتعليمه للناس" },
    { title: "مكارم الأخلاق", query: "الخلق", icon: Star, desc: "حسن الخلق والأمانة وبر الوالدين" },
    { title: "الصبر والرضا", query: "الصبر", icon: Clock, desc: "فضل الصبر والاحتساب عند الابتلاء" },
  ], []);

  const handleAnswer = (optionIdx: number) => {
    if (showTriviaFeedback) return;
    setSelectedOption(optionIdx);
    setShowTriviaFeedback(true);
    const isCorrect = optionIdx === TRIVIA_QUESTIONS[triviaIndex].correct;
    
    let nextScore = triviaScore;
    if (isCorrect) {
      nextScore += 10;
      setTriviaScore(nextScore);
      localStorage.setItem('waqfah_trivia_score', nextScore.toString());
      toast({
        title: "إجابة صحيحة! 🎉",
        description: "+10 نقاط إضافية في رصيدك المعرفي",
        duration: 2000
      });
    } else {
      toast({
        title: "إجابة خاطئة ❌",
        description: `الإجابة الصحيحة هي: ${TRIVIA_QUESTIONS[triviaIndex].options[TRIVIA_QUESTIONS[triviaIndex].correct]}`,
        variant: "destructive",
        duration: 3000
      });
    }
    const nextAnswered = answeredCount + 1;
    setAnsweredCount(nextAnswered);
    localStorage.setItem('waqfah_trivia_answered', nextAnswered.toString());
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowTriviaFeedback(false);
    setTriviaIndex((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
  };

  // Handle SPA sub-routing for Electron
  const pathParts = pathname.split('/').filter(Boolean);
  const bookIdFromPath = pathParts.length > 1 ? pathParts[1] : null;

  // 📖 Daily Hadith State
  const [dailyHadith, setDailyHadith] = useState({
    text: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى فمن كانت هجرته إلى الله ورسوله، فهجرته إلى الله ورسوله',
    book: 'صحيح البخاري',
    number: '1',
    grade: 'صحيح',
    bookId: 'bukhari'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchRandomHadith();

    // Load global favorites
    try {
      const storedFavs = localStorage.getItem('waqfah_hadith_favorites');
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
    } catch (e) {}

    // Load trivia stats
    try {
      const score = localStorage.getItem('waqfah_trivia_score');
      if (score) setTriviaScore(parseInt(score));
      const count = localStorage.getItem('waqfah_trivia_answered');
      if (count) setAnsweredCount(parseInt(count));
    } catch (e) {}

    // Calculate progress for each book
    try {
      const progress: Record<string, number> = {};
      MAIN_BOOKS.forEach(book => {
        const readKey = `waqfah_read_chapters_${book.id}`;
        const readVal = localStorage.getItem(readKey);
        const readChapters = readVal ? JSON.parse(readVal) : [];
        const totalChapters = Object.keys(HADITH_SECTIONS_FALLBACK[book.id] || {}).length || 50;
        progress[book.id] = Math.min(100, Math.round((readChapters.length / totalChapters) * 100));
      });
      setProgressMap(progress);
    } catch (e) {}
  }, []);

  // Update heart active status for daily hadith if daily hadith updates or favorites updates
  useEffect(() => {
    if (dailyHadith) {
      const found = favorites.some(
        f => f.bookId === dailyHadith.bookId && f.hadithnumber === parseInt(dailyHadith.number)
      );
      setIsFavorite(found);
    }
  }, [dailyHadith, favorites]);

  // Clean up speech when navigating away
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (bookIdFromPath) {
    return <HadithPageClient params={Promise.resolve({ bookId: bookIdFromPath })} />;
  }

  const fetchRandomHadith = async () => {
    setRefreshing(true);
    setIsPlayingDaily(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    try {
      const bookIds = ['bukhari', 'muslim'];
      const randomBook = bookIds[Math.floor(Math.random() * bookIds.length)];
      const randomSection = Math.floor(Math.random() * 20) + 1; 

      const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${randomBook}/sections/${randomSection}.json`);
      const data = await res.json();

      if (data.hadiths && data.hadiths.length > 0) {
        const h = data.hadiths[Math.floor(Math.random() * data.hadiths.length)];
        setDailyHadith({
          text: h.text,
          book: randomBook === 'bukhari' ? 'صحيح البخاري' : 'صحيح مسلم',
          number: h.hadithnumber.toString(),
          grade: 'صحيح',
          bookId: randomBook
        });
      }
    } catch (error) {
      console.error("Failed to fetch random hadith", error);
    }
    setRefreshing(false);
  };

  const handleCopy = () => {
    const textToCopy = `«${dailyHadith.text}»\n\n📚 المصدر: ${dailyHadith.book}\n🔢 رقم الحديث: ${dailyHadith.number}\n\nتم النسخ من تطبيق "وقفة"`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: 'تم نسخ الحديث بنجاح', description: 'يمكنك الآن مشاركته مع أحبابك' });
  };

  const handleShare = async () => {
    const textToShare = `«${dailyHadith.text}»\n\n📚 المصدر: ${dailyHadith.book}\n🔢 رقم الحديث: ${dailyHadith.number}\n\nتمت المشاركة من تطبيق "وقفة"`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'حديث اليوم', text: textToShare });
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  const toggleFavorite = () => {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);

    try {
      let globalFavs: FavoriteHadith[] = [];
      const stored = localStorage.getItem('waqfah_hadith_favorites');
      if (stored) globalFavs = JSON.parse(stored);

      const idx = globalFavs.findIndex(
        f => f.bookId === dailyHadith.bookId && f.hadithnumber === parseInt(dailyHadith.number)
      );

      if (idx > -1 && !nextFavorite) {
        globalFavs.splice(idx, 1);
      } else if (idx === -1 && nextFavorite) {
        globalFavs.push({
          bookId: dailyHadith.bookId,
          bookName: dailyHadith.book,
          hadithnumber: parseInt(dailyHadith.number),
          text: dailyHadith.text,
          grade: dailyHadith.grade,
          savedAt: Date.now()
        });
      }
      localStorage.setItem('waqfah_hadith_favorites', JSON.stringify(globalFavs));
      setFavorites(globalFavs);

      // Sync specific book key
      const bookFavsKey = `fav_hadiths_${dailyHadith.bookId}`;
      const storedBookFavs = localStorage.getItem(bookFavsKey);
      let bookFavsList: number[] = storedBookFavs ? JSON.parse(storedBookFavs) : [];
      if (!nextFavorite) {
        bookFavsList = bookFavsList.filter(num => num !== parseInt(dailyHadith.number));
      } else {
        if (!bookFavsList.includes(parseInt(dailyHadith.number))) {
          bookFavsList.push(parseInt(dailyHadith.number));
        }
      }
      localStorage.setItem(bookFavsKey, JSON.stringify(bookFavsList));

    } catch (e) {
      console.error(e);
    }

    toast({
      title: nextFavorite ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة',
      duration: 1500
    });
  };

  const removeFavorite = (fav: FavoriteHadith) => {
    const nextGlobal = favorites.filter(f => !(f.bookId === fav.bookId && f.hadithnumber === fav.hadithnumber));
    setFavorites(nextGlobal);
    localStorage.setItem('waqfah_hadith_favorites', JSON.stringify(nextGlobal));

    try {
      const bookFavsKey = `fav_hadiths_${fav.bookId}`;
      const storedBookFavs = localStorage.getItem(bookFavsKey);
      if (storedBookFavs) {
        const bookFavs: number[] = JSON.parse(storedBookFavs);
        const nextBookFavs = bookFavs.filter(num => num !== fav.hadithnumber);
        localStorage.setItem(bookFavsKey, JSON.stringify(nextBookFavs));
      }
    } catch (e) {
      console.error(e);
    }

    toast({ title: 'تمت إزالة الحديث من المفضلة', variant: 'destructive' });
  };

  const togglePlayDaily = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({ title: 'البث الصوتي غير مدعوم في متصفحك' });
      return;
    }

    if (isPlayingDaily) {
      window.speechSynthesis.cancel();
      setIsPlayingDaily(false);
    } else {
      setIsPlayingDaily(true);
      const cleanText = dailyHadith.text.replace(/«|»/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arVoice) utterance.voice = arVoice;

      utterance.onend = () => setIsPlayingDaily(false);
      utterance.onerror = () => setIsPlayingDaily(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // 🔍 Universal context-aware Search Logic
  const globalResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const results: any[] = [];
    const normalizedQuery = normalizeArabic(searchQuery);

    Object.entries(HADITH_SECTIONS_FALLBACK).forEach(([bookId, sections]) => {
      Object.entries(sections).forEach(([sectionId, sectionName]) => {
        const normalizedSection = normalizeArabic(sectionName);
        if (normalizedSection.includes(normalizedQuery)) {
          results.push({
            bookId,
            sectionId,
            sectionName,
            bookMeta: MAIN_BOOKS.find(b => b.id === bookId)
          });
        }
      });
    });
    return results.slice(0, 12); 
  }, [searchQuery]);

  const filteredFavorites = useMemo(() => {
    if (!searchQuery) return favorites;
    const q = normalizeArabic(searchQuery);
    return favorites.filter(
      f => normalizeArabic(f.text).includes(q) || normalizeArabic(f.bookName).includes(q)
    );
  }, [favorites, searchQuery]);

  const filteredNarrators = useMemo(() => {
    if (!searchQuery) return NARRATORS;
    const q = normalizeArabic(searchQuery);
    return NARRATORS.filter(
      n => normalizeArabic(n.name).includes(q) || normalizeArabic(n.title).includes(q) || normalizeArabic(n.fullName).includes(q)
    );
  }, [searchQuery]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30 pb-32">
      {/* 🔮 Cinematic Hero Section */}
      <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 pt-40 pb-32 px-4 overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl bg-[#0a0a0a]">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />

        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col gap-16 items-center">
            <div className="w-full space-y-8 text-center flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]"
              >
                <Sparkles className="w-4 h-4" /> موسوعة السنة النبوية الشاملة
              </motion.div>

              <h1 className="text-7xl md:text-[7rem] lg:text-[8rem] font-black font-headline tracking-tighter leading-[0.8] text-white">
                كُنوز <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-amber-500 to-amber-700 italic">الوَحي</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/40 font-medium leading-relaxed max-w-3xl mx-auto">
                أضخم منصة رقمية تفاعلية لجَمع وتصنيف السُّنة النبوية المطهَّرة من "الكتب الستة"، بدقة عالية وتجربة قراءة سينمائية فريدة.
              </p>

              {/* Stats Bento */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-4xl mx-auto">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <stat.icon className={cn("w-6 h-6 mb-4 mx-auto", stat.color)} />
                    <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform origin-center">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-6xl mx-auto items-stretch">
              {/* Daily Hadith card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3 relative"
              >
                <div className="absolute inset-0 bg-amber-500/20 blur-[100px] opacity-30" />
                <div className="relative p-10 md:p-14 rounded-[4rem] bg-zinc-900/50 border border-white/10 backdrop-blur-3xl space-y-10 overflow-hidden group h-full flex flex-col justify-between">
                  <Quote className="absolute top-10 left-10 w-32 h-32 text-white/[0.03] group-hover:scale-110 transition-transform" />

                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCopy}
                        variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                        title="نسخ الحديث"
                      >
                        <Copy className="w-4 h-4 opacity-40 hover:opacity-100" />
                      </Button>
                      <Button
                        onClick={toggleFavorite}
                        variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl bg-white/5 border border-white/5 transition-all", isFavorite ? "text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse" : "hover:bg-white/10 opacity-40")}
                        title="إضافة للمفضلة"
                      >
                        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                      </Button>
                      <Button
                        onClick={handleShare}
                        variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                        title="مشاركة الحديث"
                      >
                        <Share2 className="w-4 h-4 opacity-40 hover:opacity-100" />
                      </Button>
                      <Button
                        onClick={togglePlayDaily}
                        variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl bg-white/5 border border-white/5 transition-all", isPlayingDaily ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "hover:bg-white/10 opacity-40")}
                        title={isPlayingDaily ? "إيقاف القراءة" : "استماع صوتي للحديث"}
                      >
                        {isPlayingDaily ? (
                          <span className="flex items-center justify-center gap-0.5">
                            <span className="w-1 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-1 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                          </span>
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                      <HadithMemorizer 
                        text={dailyHadith.text}
                        reference={`${dailyHadith.book} - حديث رقم: ${dailyHadith.number}`}
                      />
                      <ImanCardGenerator 
                        title={`حديث اليوم - ${dailyHadith.book}`}
                        content={dailyHadith.text}
                        source={`${dailyHadith.book} - حديث رقم: ${dailyHadith.number}`}
                        trigger={
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                            title="تحميل كبطاقة دعوية"
                          >
                            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                          </Button>
                        }
                      />
                    </div>
                    <span className="px-4 py-1.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-400 text-[10px] font-black text-black uppercase tracking-widest shadow-lg shadow-amber-500/20">حديث اليوم</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={dailyHadith.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative z-10 flex-1 flex items-center justify-center py-6"
                    >
                      <p className={cn(
                        "text-xl md:text-2xl font-bold font-headline leading-[2.2] text-center text-white transition-all group-hover:text-amber-200",
                        refreshing && "opacity-50 blur-sm"
                      )}>
                        «{dailyHadith.text}»
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex justify-between items-center relative z-10 pt-4 border-t border-white/5">
                    <div className="flex gap-4 items-center opacity-40 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-2"><Book className="w-4 h-4" /> {dailyHadith.book}</div>
                      <div className="flex items-center gap-2 text-emerald-400"><ShieldCheck className="w-4 h-4" /> {dailyHadith.grade}</div>
                    </div>
                    <Button
                      onClick={fetchRandomHadith}
                      disabled={refreshing}
                      className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all font-black text-xs border border-white/5 group-hover:border-amber-500/30"
                    >
                      <RefreshCw className={cn("w-4 h-4 ml-3", refreshing && "animate-spin")} /> تجديد
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Trivia Challenge card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="lg:col-span-2 relative"
              >
                <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] opacity-25" />
                <div className="relative p-10 rounded-[4rem] bg-zinc-900/50 border border-white/10 backdrop-blur-3xl h-full flex flex-col justify-between overflow-hidden group">
                  <div className="absolute top-10 left-10 w-24 h-24 text-amber-500/[0.03] pointer-events-none">
                    <Trophy className="w-full h-full" />
                  </div>

                  <div className="flex justify-between items-center relative z-10 mb-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors bg-white/5 border border-white/5 hover:border-amber-500/30 px-3 py-1.5 rounded-xl">
                          <Trophy className="w-4 h-4 animate-pulse animate-duration-1000" />
                          <span className="text-[10px] font-black uppercase tracking-widest">النقاط: {triviaScore} • الأوسمة 🎖️</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md bg-zinc-950/95 border border-white/10 text-white rounded-[2.5rem] p-8 text-right">
                        <DialogHeader className="pb-4 border-b border-white/5">
                          <DialogTitle className="text-2xl font-black flex items-center gap-2 justify-end">
                            <span>خزانة <span className="text-amber-500">أوسمتك المعرفية</span></span>
                            <Award className="w-6 h-6 text-amber-500 animate-bounce" />
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar" dir="rtl">
                          {BADGES.map((badge) => {
                            const isUnlocked = triviaScore >= badge.req;
                            const BadgeIcon = badge.icon;
                            return (
                              <div 
                                key={badge.id}
                                className={cn(
                                  "p-4 rounded-2xl border flex items-center gap-4 transition-all justify-between",
                                  isUnlocked 
                                    ? "bg-white/5 border-white/10 shadow-lg" 
                                    : "bg-black/40 border-white/5 opacity-40"
                                )}
                              >
                                <div className="flex items-center gap-3 text-right">
                                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", badge.color)}>
                                    <BadgeIcon className="w-5 h-5" />
                                  </div>
                                  <div className="text-right">
                                    <h4 className="text-sm font-black text-white">{badge.name}</h4>
                                    <p className="text-[10px] text-white/40 mt-0.5">{badge.desc}</p>
                                  </div>
                                </div>
                                <div className="text-left shrink-0">
                                  {isUnlocked ? (
                                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-black">مفتوح 🔓</span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-white/30 text-[9px] font-black">مغلق 🔒 ({badge.req}ن)</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <span className="px-4 py-1.5 rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-400 text-[10px] font-black text-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">تحدي السنة</span>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col justify-between gap-6">
                    <div>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">سؤال {triviaIndex + 1} / {TRIVIA_QUESTIONS.length}</span>
                      <h3 className="text-base font-bold text-white leading-relaxed mt-2 text-right">{TRIVIA_QUESTIONS[triviaIndex].q}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {TRIVIA_QUESTIONS[triviaIndex].options.map((option, idx) => {
                        let btnStyle = "bg-white/5 border-white/5 text-white/70 hover:bg-white/10";
                        if (showTriviaFeedback) {
                          if (idx === TRIVIA_QUESTIONS[triviaIndex].correct) {
                            btnStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
                          } else if (idx === selectedOption) {
                            btnStyle = "bg-rose-500/20 border-rose-500/40 text-rose-400";
                          } else {
                            btnStyle = "bg-white/5 border-white/5 opacity-30 text-white/55";
                          }
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={showTriviaFeedback}
                            className={cn(
                              "w-full py-3 px-4 rounded-2xl border text-right font-black text-xs transition-all flex items-center justify-between gap-3",
                              btnStyle
                            )}
                          >
                            <span>{option}</span>
                            {showTriviaFeedback && idx === TRIVIA_QUESTIONS[triviaIndex].correct && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {showTriviaFeedback && idx === selectedOption && idx !== TRIVIA_QUESTIONS[triviaIndex].correct && (
                              <X className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center relative z-10 pt-6 mt-6 border-t border-white/5">
                    <span className="text-[10px] text-white/30 font-medium">الأسئلة المجابة: {answeredCount}</span>
                    {showTriviaFeedback ? (
                      <Button
                        onClick={handleNextQuestion}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition-all flex items-center gap-2"
                      >
                        السؤال التالي <ArrowLeft className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <span className="text-[10px] text-amber-500/60 font-bold max-w-[200px] text-left truncate" title={TRIVIA_QUESTIONS[triviaIndex].hint}>
                        💡 تلميح: {TRIVIA_QUESTIONS[triviaIndex].hint}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛸 Global Explorer Section */}
      <section className="container mx-auto px-4 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-6 py-4 rounded-[3rem] bg-white/5 border border-white/5">
          <div className="flex flex-wrap gap-2 p-2 bg-[#0a0a0a] rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('books')}
              className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'books' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white")}
            >
              دواوين السنة
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'favorites' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white")}
            >
              المفضلة
              {favorites.length > 0 && (
                <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-black", activeTab === 'favorites' ? "bg-black text-white" : "bg-white/10 text-white/60")}>
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('narrators')}
              className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'narrators' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white")}
            >
              رواة الحديث
            </button>
            
            <button
              onClick={() => setActiveTab('notes')}
              className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'notes' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white")}
            >
              تأملاتي وملاحظاتي 📝
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'about' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white")}
            >
              حول الموسوعة
            </button>
          </div>

          <div className="flex-1 max-w-xl group relative">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(e.target.value.length > 1);
              }}
              placeholder={
                  activeTab === 'books'
                    ? "بحث في موسوعة الحديث الشريف (كتب، أبواب، أحاديث)..."
                    : activeTab === 'favorites'
                    ? "بحث في أحاديثك المحفوظة..."
                    : activeTab === 'narrators'
                    ? "البحث عن الراوي بالاسم أو اللقب..."
                    : activeTab === 'notes'
                    ? "البحث في ملاحظاتك وتأملاتك..."
                    : "بحث..."
                }
              className="w-full h-14 pr-16 pl-16 rounded-2xl bg-black/40 border border-white/10 focus:border-amber-500/50 outline-none transition-all font-bold text-center"
            />
            <button
              onClick={() => {
                if (isListening) {
                  voiceRecognitionRef.current?.stop();
                  setIsListening(false);
                  return;
                }
                const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SpeechRecognitionAPI) {
                  alert('متصفحك لا يدعم البحث الصوتي.');
                  return;
                }
                const recognition = new SpeechRecognitionAPI();
                voiceRecognitionRef.current = recognition;
                recognition.lang = 'ar-SA';
                recognition.onstart = () => setIsListening(true);
                recognition.onresult = (e: any) => {
                  const transcript = e.results[0][0].transcript;
                  setSearchQuery(transcript);
                  setShowResults(transcript.length > 1);
                };
                recognition.onerror = () => setIsListening(false);
                recognition.onend = () => setIsListening(false);
                recognition.start();
              }}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
            {activeTab === 'books' && (
              <div className="flex justify-center gap-2 mt-4 mb-2">
                <button
                  type="button"
                  onClick={() => setSearchMode('chapters')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black transition-all border",
                    searchMode === 'chapters'
                      ? "bg-amber-500 text-black border-amber-500 shadow-glow-primary"
                      : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  📖 بحث في الأبواب
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('hadiths')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black transition-all border flex items-center gap-1.5",
                    searchMode === 'hadiths'
                      ? "bg-amber-500 text-black border-amber-500 shadow-glow-primary"
                      : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  📜 بحث في الأحاديث
                  {loadingGlobalHadiths && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                </button>
              </div>
            )}
            <AnimatePresence>
              {showResults && activeTab === 'books' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-4 p-6 rounded-[2rem] bg-zinc-900/95 border border-white/10 shadow-2xl z-[100] backdrop-blur-2xl max-h-[480px] overflow-y-auto no-scrollbar"
                >
                  {searchMode === 'chapters' ? (
                    <>
                      {globalResults.length === 0 ? (
                        <div className="text-center py-10 text-white/30 text-xs font-bold">
                          لم نجد أبواباً تطابق بحثك.
                        </div>
                      ) : (
                        <>
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 px-4">نتائج البحث في الأبواب ({globalResults.length})</div>
                          <div className="grid grid-cols-1 gap-2">
                            {globalResults.map((res: any, i: number) => (
                              <Link key={`${res.bookId}-${res.sectionId}`} href={`/hadith/${res.bookId}?section=${res.sectionId}`}>
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs", res.bookMeta?.color)}>
                                      {res.sectionId}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{res.sectionName}</div>
                                      <div className="text-[10px] text-white/40">{res.bookMeta?.name}</div>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-amber-500 transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {loadingGlobalHadiths ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                          <div className="text-xs font-black text-white/50 animate-pulse">جاري تحميل وتدقيق قاعدة بيانات الأحاديث الشريفة...</div>
                        </div>
                      ) : matchingGlobalHadiths.length === 0 ? (
                        <div className="text-center py-12 text-white/30 text-xs font-bold">
                          لم نجد أحاديث تطابق بحثك.
                        </div>
                      ) : (
                        <>
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 px-4">نتائج البحث في نصوص الأحاديث ({matchingGlobalHadiths.length})</div>
                          <div className="grid grid-cols-1 gap-3">
                            {matchingGlobalHadiths.map((res: any, i: number) => {
                              const snippet = getHadithSnippet(res.text || res.arabic || "", searchQuery);
                              return (
                                <Link 
                                  key={`${res.bookId}-${res.hadithnumber}`} 
                                  href={`/hadith/${res.bookId}?section=${res.reference?.book || 1}&hadith=${res.hadithnumber}`}
                                >
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="p-5 rounded-2xl hover:bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all group text-right space-y-3"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className={cn("px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black", res.color)}>
                                        {res.bookName} • حديث رقم {res.hadithnumber}
                                      </span>
                                      <ArrowLeft className="w-4 h-4 text-white/20 group-hover:text-amber-500 transition-all translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                                    </div>
                                    <p className="text-xs font-semibold text-white/70 leading-relaxed font-sans line-clamp-2 group-hover:text-white transition-colors" dir="rtl">
                                      {highlightSnippet(snippet, searchQuery)}
                                    </p>
                                  </motion.div>
                                </Link>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {['النية', 'العلم', 'الصبر', 'التقوى', 'الصدق'].map(keyword => (
                <button
                  key={keyword}
                  onClick={() => { setSearchQuery(keyword); setShowResults(true); }}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-white/30 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20 transition-all"
                >
                  # {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
            {activeTab === 'notes' ? (
              <motion.div
                key="notes-grid"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-8"
              >
                {Object.keys(hadithNotes).length === 0 ? (
                  <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                      <BookOpen className="w-10 h-10 animate-bounce" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-2xl font-black">لا توجد تأملات أو ملاحظات محفوظة</h3>
                      <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
                        عند قراءة الأحاديث في الموسوعة، يمكنك النقر على زر الملاحظة لتدوين تأملاتك وملاحظاتك العلمية حولها لتظهر في هذا القسم الخاص بك.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                    {Object.entries(hadithNotes)
                      .filter(([_, item]) => {
                        if (!searchQuery) return true;
                        return item.note.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               item.hadithText.toLowerCase().includes(searchQuery.toLowerCase());
                      })
                      .map(([key, item]) => {
                        const [bookId, hadithId] = key.split('_');
                        return (
                          <div key={key} className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/10 backdrop-blur-3xl flex flex-col justify-between overflow-hidden relative group text-right">
                            <div className="space-y-6">
                              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-xs font-black text-amber-500">{item.bookName} - حديث رقم {hadithId}</span>
                                <Link 
                                  href={`/hadith/${bookId}?hadith=${hadithId}`}
                                  className="text-[10px] font-black text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-xl flex items-center gap-1"
                                >
                                  عرض الحديث 🔗
                                </Link>
                              </div>
                              <p className="text-xs text-white/60 italic leading-relaxed bg-black/25 p-4 rounded-xl border border-white/5 max-h-24 overflow-y-auto no-scrollbar">
                                « {item.hadithText} »
                              </p>
                              <div className="space-y-2">
                                <div className="text-[10px] font-black text-amber-500/80">تأملاتي وملاحظاتي:</div>
                                <p className="text-sm font-bold text-white leading-relaxed whitespace-pre-line">
                                  {item.note}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end pt-6 mt-6 border-t border-white/5">
                              <Button
                                onClick={() => deleteNote(key)}
                                variant="ghost"
                                className="px-4 py-2 rounded-xl text-xs font-black text-red-400 hover:bg-red-500/10 hover:text-red-400"
                              >
                                حذف الملاحظة
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'favorites' ? (
            <motion.div
              key="favorites-grid"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-8"
            >
              {filteredFavorites.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] space-y-6">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                    <Heart className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">لا توجد أحاديث محفوظة</h3>
                    <p className="text-white/40 max-w-md mx-auto text-sm">
                      {searchQuery 
                        ? "لم نجد نتائج تطابق بحثك في الأحاديث المحفوظة."
                        : "لم تقم بإضافة أي أحاديث للمفضلة حتى الآن. تصفح الكتب واضغط على زر القلب لحفظ أحاديثك المفضلة هنا."}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button 
                      onClick={() => setActiveTab('books')}
                      className="px-8 py-4 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-xs"
                    >
                      تصفح دواوين السنة
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredFavorites.map((fav) => (
                    <motion.div 
                      key={`${fav.bookId}-${fav.hadithnumber}`} 
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 md:p-10 rounded-[3rem] bg-zinc-900 border border-white/5 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-amber-500/20 transition-all"
                    >
                      <Quote className="absolute top-10 left-10 w-24 h-24 text-white/[0.02]" />
                      
                      <div className="flex justify-between items-center relative z-10">
                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/60">
                          {fav.bookName} • حديث رقم {fav.hadithnumber}
                        </span>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              const textToCopy = `«${fav.text}»\n\n📚 المصدر: ${fav.bookName}\n🔢 رقم الحديث: ${fav.hadithnumber}\n\nتم النسخ من تطبيق "وقفة"`;
                              navigator.clipboard.writeText(textToCopy);
                              toast({ title: 'تم نسخ الحديث' });
                            }} 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            onClick={() => removeFavorite(fav)} 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10"
                            title="إزالة من المفضلة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-lg md:text-xl font-bold font-headline leading-loose text-right text-white/85 group-hover:text-white transition-colors relative z-10">
                        «{fav.text}»
                      </p>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> {fav.grade || 'صحيح'}
                        </span>
                        <Link 
                          href={`/hadith/${fav.bookId}`}
                          className="text-[10px] font-black text-amber-500 hover:underline flex items-center gap-1"
                        >
                          عرض في الكتاب <ArrowLeft className="w-3 h-3" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'narrators' ? (
            <motion.div
              key="narrators-grid-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-12"
            >
              {/* Narrators Statistics */}
              <div className="p-8 md:p-10 rounded-[3rem] bg-zinc-900/40 border border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
                  <h3 className="text-xl font-black text-white">إحصائيات مرويات الصحابة رضي الله عنهم</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {NARRATORS.map(n => {
                    const cleanCount = parseInt(n.count.replace(/[^0-9]/g, ''));
                    const percentage = Math.round((cleanCount / 5374) * 100);
                    return (
                      <div key={n.id} className="p-5 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between gap-3">
                        <div className="text-xs text-white/50 font-bold truncate">{n.name.split(' ')[0] + ' ' + (n.name.split(' ')[1] || '')}</div>
                        <div>
                          <div className="text-lg font-black text-white">{n.count.split(' ')[0]}</div>
                          <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Narrators Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNarrators.map((narrator) => (
                  <motion.div
                    key={narrator.id}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedNarrator(narrator)}
                    className="group cursor-pointer p-8 rounded-[3rem] bg-zinc-900 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between min-h-[250px] relative overflow-hidden"
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", narrator.bg)} />
                    
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                        {narrator.count}
                      </div>
                      <Users className="w-5 h-5 text-white/10 group-hover:text-amber-500/30 transition-colors" />
                    </div>

                    <div className="relative z-10 space-y-2">
                      <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors">
                        {narrator.name}
                      </h3>
                      <p className="text-xs text-white/40 font-bold">{narrator.title}</p>
                      <p className="text-white/20 text-xs leading-relaxed line-clamp-2 mt-2">
                        {narrator.bio}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-6 mt-6 border-t border-white/5 text-[10px] font-black text-white/40 group-hover:text-amber-500 transition-colors">
                      <span>استكشف سيرة الراوي</span>
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'books' ? (
            <motion.div
              key="books-thematic-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-16"
            >
              {/* Thematic Topics */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-amber-500" />
                  <h3 className="text-2xl font-black font-headline text-white">التصنيف الموضوعي السريع</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {THEMATIC_TOPICS.map((topic) => (
                    <motion.button
                      key={topic.title}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSearchQuery(topic.query);
                        setShowResults(true);
                        window.scrollTo({ top: 600, behavior: 'smooth' });
                      }}
                      className="p-6 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-amber-500/20 text-right flex flex-col justify-between min-h-[140px] transition-all hover:bg-white/[0.01] group"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                          <topic.icon className="w-5 h-5" />
                        </span>
                        <ArrowLeft className="w-4 h-4 text-white/20 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white group-hover:text-amber-500 transition-colors">{topic.title}</h4>
                        <p className="text-[11px] text-white/40 mt-1 font-medium">{topic.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Books Grid */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-amber-500" />
                  <h3 className="text-2xl font-black font-headline text-white">دواوين السنة النبوية</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {MAIN_BOOKS.map((book) => (
                    <Link key={book.id} href={`/hadith/${book.id}`}>
                      <motion.div
                        whileHover={{ y: -10 }}
                        className="group p-1 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-[3rem] h-full"
                      >
                        <div className="relative h-full p-10 rounded-[2.8rem] bg-[#0d0d0d] border border-white/5 overflow-hidden flex flex-col justify-between space-y-8">
                          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", book.bg)} />

                          <div className="relative z-10 flex justify-between items-start">
                            <div className={cn("w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform", book.color)}>
                              <BookOpen className="w-8 h-8" />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {(book as any).isNew && (
                                <span className="px-3 py-1 rounded-full bg-amber-500 text-[8px] font-black uppercase text-black animate-pulse shadow-lg shadow-amber-500/20">جديد</span>
                              )}
                              <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                                {book.tag}
                              </span>
                            </div>
                          </div>

                          <div className="relative z-10 space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter group-hover:text-amber-500 transition-colors">
                              {book.name}
                            </h2>
                            <div className="text-sm font-bold text-white/40">{book.author}</div>
                            <p className="text-white/20 text-xs leading-relaxed font-medium line-clamp-2">
                              {book.desc}
                            </p>
                          </div>

                          {/* Read Progress Bar */}
                          {mounted && progressMap[book.id] > 0 && (
                            <div className="relative z-10 space-y-2 mt-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                              <div className="flex justify-between items-center text-[9px] font-black text-white/30 uppercase tracking-wider">
                                <span>نسبة قراءة الكتاب</span>
                                <span className={cn("font-bold", book.color)}>{progressMap[book.id]}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full transition-all duration-500 bg-gradient-to-l", book.color?.replace('text-', 'from-') || 'from-primary', "to-white")}
                                  style={{ width: `${progressMap[book.id]}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">عدد الأحاديث</span>
                              <span className={cn("text-xl font-black", book.color)}>{book.count}</span>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="about-info"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="p-16 rounded-[4rem] bg-white/5 border border-white/5 space-y-10">
                <h2 className="text-5xl font-black font-headline">عن الموسوعة الشاملة</h2>
                <p className="text-xl text-white/40 leading-loose">
                  تعد هذه الموسوعة مشروعاً رقمياً طموحاً يهدف إلى رقمنة السنة النبوية الشريفة باستخدام أحدث تقنيات الويب، مع التركيز التام على دقة المصادر من "الكتب الستة"، وتصنيفها بطريقة تسهل على الباحث والقارئ الوصول إلى المعلومة الصحيحة بيسر وسهولة.
                </p>
                <div className="space-y-6">
                  {['فحص وتدقيق يدوي وبرمجي للأحاديث', 'دعم درجات الصحة والضعف', 'دليل موضوعي وفقهي شامل', 'مشاركة وتنزيل بصيغ متعددة'].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-emerald-500 font-bold">
                      <Zap className="w-5 h-5 fill-current" /> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-16 rounded-[4rem] bg-amber-500/[0.03] border border-amber-500/10 space-y-10 border-dashed">
                <h3 className="text-3xl font-black uppercase tracking-widest text-amber-500">منهجية التحقيق</h3>
                <p className="text-white/40 leading-loose">
                  تعتمد الموسوعة على "أمهات الكتب الحديثية" بإسنادها الكامل، مع استعراض أحكام كبار المحدثين في العصر الحديث مثل الشيخ الألباني رحمه الله، مما يجعلها مرجعاً موثوقاً لطالب العلم وللمسلم غير المتخصص على حد سواء.
                </p>
                <button className="h-16 px-10 rounded-2xl bg-amber-500 text-black font-black hover:scale-105 transition-transform flex items-center gap-4">
                  تحميل الدليل المنهجي للموسوعة <Zap className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 👤 Narrator Detail Modal */}
      <AnimatePresence>
        {selectedNarrator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4"
            onClick={() => setSelectedNarrator(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-zinc-950/95 border border-white/10 rounded-[3rem] p-8 md:p-12 text-right relative overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative backgrounds */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/10 relative z-10">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    {selectedNarrator.count}
                  </span>
                  <h2 className="text-3xl font-black text-white mt-2">{selectedNarrator.name}</h2>
                  <p className="text-white/40 text-xs font-bold">{selectedNarrator.fullName}</p>
                </div>
                <button
                  onClick={() => setSelectedNarrator(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-all font-black text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">نبذة تعريفية</h4>
                  <p className="text-white/70 text-sm leading-relaxed font-medium">
                    {selectedNarrator.bio}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">محطات تاريخية وحقائق</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedNarrator.details.map((detail, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 items-start">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-black shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed font-bold">
                          {detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end relative z-10">
                <Button
                  onClick={() => setSelectedNarrator(null)}
                  className="px-8 py-3 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-xs"
                >
                  إغلاق النافذة
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💎 Footer Navigation Hints */}
      <section className="container mx-auto px-4 mt-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">سهولة الوصول</div>
            <p className="text-sm font-medium">بحث متقدم بالأرقام والمواضيع والأبواب</p>
          </div>
          <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">التوثيق العلمي</div>
            <p className="text-sm font-medium">عرض درجات الأحاديث من المصادر المعتمدة</p>
          </div>
          <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">المشاركة الذكية</div>
            <p className="text-sm font-medium">إمكانية نسخ الأحاديث مع تخريجها الكامل</p>
          </div>
        </div>
      </section>
    </div>
  );
}
