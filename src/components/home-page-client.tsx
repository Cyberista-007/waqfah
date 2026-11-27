'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft,
  BookCheck,
  BookOpen,
  BookOpenCheck,
  ChevronDown,
  Compass,
  Flame,
  GraduationCap,
  HandHeart,
  Headphones,
  Heart,
  HeartHandshake,
  HelpCircle,
  Layers,
  Library,
  ListMusic,
  Loader2,
  Mail,
  Medal,
  MessageCircle,
  Podcast,
  Play,
  Quote,
  Radio,
  Scale,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  TriangleAlert,
  Trophy,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/images';
import type {
  HeroBanner,
  HomepageDetailedConfig,
  HomepagePathConfig,
  Inspiration,
  Lecture,
  ListenHistoryItem,
  Playlist,
  Program,
  QAPair,
  ScheduleItem,
  Series,
} from '@/lib/types';
import { useAppearance } from '@/components/appearance-provider';
import { useTranslation } from '@/lib/i18n';
import { useCollection, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { LatestLecturesSection } from '@/components/latest-lectures-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SeriesCard } from '@/components/series-card';
import { LectureCard } from '@/components/lecture-card';
import { ProgramCard } from '@/components/program-card';

// Dynamically imported interactive & below-the-fold widgets
const HomeSearch = dynamic(() => import('@/components/home-search').then((m) => m.HomeSearch), { ssr: false });
const Marquee = dynamic(() => import('./marquee').then((m) => m.Marquee), { ssr: false });
const RecommendedLectures = dynamic(() => import('@/components/recommended-lectures').then((m) => m.RecommendedLectures), { ssr: false });
const ContinueWatching = dynamic(() => import('@/components/continue-listening').then((m) => m.ContinueWatching), { ssr: false });
const SpiritualPrescription = dynamic(() => import('./spiritual-prescription').then((m) => m.SpiritualPrescription), { ssr: false });
const VerseOfTheDay = dynamic(() => import('./verse-of-the-day').then((m) => m.VerseOfTheDay), { ssr: false });
const AboutPlatformModal = dynamic(() => import('@/components/about-platform-modal').then((m) => m.AboutPlatformModal), { ssr: false });
const PinnedItems = dynamic(() => import('@/app/pinned-items').then((m) => m.PinnedItems), { ssr: false, loading: () => null });
const ShortsCarousel = dynamic(() => import('@/components/ShortsCarousel').then((m) => m.ShortsCarousel), { ssr: false, loading: () => null });
const FeaturedStrips = dynamic(() => import('@/components/featured-strips').then((m) => m.FeaturedStrips), { ssr: false, loading: () => null });

interface HomePageClientProps {
  latestLectures: Lecture[];
  topPrograms: Program[];
  latestSeries: Series[];
  upcomingLesson?: ScheduleItem | null;
  latestQAPair?: QAPair | null;
  publicPlaylists?: Playlist[];
  homepageConfig?: HomepageDetailedConfig | null;
  stripLectures?: Lecture[];
}

const iconMap: Record<string, React.ElementType> = {
  ArrowLeft,
  ShieldCheck,
  Headphones,
  Layers,
  BookOpen,
  Sparkles,
  Heart,
  HeartHandshake,
  Star,
};

const STRIP_TOPICS = [
  {
    title: 'لا يسع الجاهل جهله',
    subtitle: 'قضايا مصيرية يجب أن يعرفها كل مسلم',
    accentColor: '#10b981',
    keywords: ['فلسطين', 'يجهل', 'لا يسع', 'واجب', 'مصير', 'الأمة'],
    viewAllHref: '/lectures',
  },
  {
    title: 'محاضرات في تزكية النفس',
    subtitle: 'رحلة القلب نحو الله تعالى',
    accentColor: '#8b5cf6',
    keywords: ['قلب', 'توبة', 'إخلاص', 'زهد', 'تزكية', 'نفس', 'روح'],
    viewAllHref: '/lectures',
  },
  {
    title: 'العقيدة والثوابت',
    subtitle: 'أصول لا يجوز الجهل بها',
    accentColor: '#f59e0b',
    keywords: ['توحيد', 'عقيدة', 'إيمان', 'شرك', 'سنة', 'أصول العقيدة'],
    viewAllHref: '/lectures',
  },
];

const HERO_QUICK_LINKS = [
  { label: 'إذاعة القرآن', href: '/quran?view=radio', icon: Radio },
  { label: 'المصحف الشامل', href: '/quran', icon: BookOpenCheck },
  { label: 'العقيدة', href: '/aqeedah', icon: ShieldCheck },
  { label: 'السيرة النبوية', href: '/seerah', icon: Compass },
  { label: 'الأذكار اليومية', href: '/adhkar', icon: Headphones },
];

const TRUST_PILLARS = [
  {
    title: '+٢٦,٠٠٠ حديث نبوي',
    desc: 'مسند الإمام أحمد ومصادر السنة المحققة',
    icon: BookOpen,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'نخبة من كبار العلماء',
    desc: 'دروس ومحاضرات منتقاة على منهج السلف',
    icon: ShieldCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'أدوات تدبر تفاعلية',
    desc: 'تفريغ ذكي، حفظ المتون، ومحاسبة النفس',
    icon: Sparkles,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'وقفي وخيري ١٠٠٪',
    desc: 'خالص لوجه الله، بلا إعلانات تجارية',
    icon: Heart,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
];

const CORE_SCIENCES = [
  {
    name: 'العقيدة والتوحيد',
    desc: 'أصول الدين وأركان الإيمان الستة وثوابت الاعتقاد',
    icon: ShieldCheck,
    accent: '#3b82f6',
    href: '/aqeedah',
  },
  {
    name: 'الحديث النبوي',
    desc: 'مصنفات السنة النبوية المشرفة وشروحها المحققة',
    icon: BookOpen,
    accent: '#f59e0b',
    href: '/hadith',
  },
  {
    name: 'السيرة النبوية',
    desc: 'رحلة تفاعلية في حياة الحبيب المصطفى ﷺ وغزواته',
    icon: Compass,
    accent: '#f43f5e',
    href: '/seerah',
  },
  {
    name: 'الفقه والتفسير',
    desc: 'أحكام العبادات والمعاملات وتدبر معاني التنزيل',
    icon: Layers,
    accent: '#14b8a6',
    href: '/search?category=الفقه',
  },
];

const DIRECTORY_GROUPS = [
  {
    id: 'worship',
    label: 'العبادات والرقائق',
    items: [
      { href: '/adhkar', label: 'الأذكار', icon: Headphones, color: 'text-cyan-400' },
      { href: '/dua', label: 'الأدعية', icon: HandHeart, color: 'text-rose-400' },
      { href: '/prayer', label: 'الصلاة والخشوع', icon: Sparkles, color: 'text-teal-400' },
      { href: '/muhlikat', label: 'المهلكات', icon: TriangleAlert, color: 'text-red-400' },
      { href: '/chastity', label: 'درع العفة', icon: Shield, color: 'text-slate-400' },
      { href: '/accountability', label: 'محاسبة النفس', icon: BookCheck, color: 'text-emerald-400' },
    ],
  },
  {
    id: 'knowledge',
    label: 'التأصيل والعلوم',
    items: [
      { href: '/curriculums', label: 'المناهج العلمية', icon: GraduationCap, color: 'text-orange-400' },
      { href: '/memorize', label: 'حفظ المتون', icon: BookOpen, color: 'text-indigo-400' },
      { href: '/sciences-tree', label: 'شجرة العلوم', icon: Compass, color: 'text-teal-400' },
      { href: '/shubuhat', label: 'رد الشبهات', icon: Shield, color: 'text-indigo-400' },
      { href: '/essentials', label: 'الأساسيات', icon: BookCheck, color: 'text-cyan-400' },
      { href: '/mirath', label: 'المواريث', icon: Scale, color: 'text-yellow-400' },
      { href: '/stories', label: 'القصص والعبر', icon: Sparkles, color: 'text-violet-400' },
      { href: '/qa', label: 'سؤال وجواب', icon: HelpCircle, color: 'text-blue-400' },
    ],
  },
  {
    id: 'sections',
    label: 'أقسام ومبادرات',
    items: [
      { href: '/bayan', label: 'بيان', icon: Sparkles, color: 'text-violet-400' },
      { href: '/athar', label: 'أثر', icon: Compass, color: 'text-amber-400' },
      { href: '/namaa', label: 'نماء', icon: Scale, color: 'text-emerald-400' },
      { href: '/adab', label: 'أدب', icon: BookCheck, color: 'text-sky-400' },
      { href: '/kanaf', label: 'كنف', icon: Heart, color: 'text-rose-400' },
      { href: '/playlists', label: 'قوائم التشغيل', icon: ListMusic, color: 'text-pink-400' },
      { href: '/challenges', label: 'التحديات', icon: Flame, color: 'text-orange-400' },
      { href: '/badges', label: 'الأوسمة', icon: Medal, color: 'text-amber-400' },
      { href: '/leaderboard', label: 'لوحة الصدارة', icon: Trophy, color: 'text-yellow-400' },
      { href: '/contact', label: 'اتصل بنا', icon: Mail, color: 'text-cyan-400' },
    ],
  },
];

const DEFAULT_PATHS: HomepagePathConfig[] = [
  {
    title: 'تأسيس طالب العلم',
    desc: 'البداية الصحيحة لدراسة المتون العلمية والمقدمات الضرورية في كل فن.',
    parts: ['متن الآجرومية', 'الأربعين النووية', 'كتاب التوحيد'],
    icon: 'BookOpen',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  {
    title: 'مسار العبادة والقلوب',
    desc: 'رحلة إيمانية تركز على تزكية النفس، السيرة النبوية، وفقه العبادات اليومية.',
    parts: ['فقه الصلاة', 'تهذيب الأخلاق', 'سيرة النبوة'],
    icon: 'HeartHandshake',
    color: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  {
    title: 'الردود والشبهات',
    desc: 'حصن نفسك بعلم متين للرد على الشبهات المعاصرة بناءً على أصول أهل السنة.',
    parts: ['تنبيه الغبي', 'ردود على الإلحاد', 'أصول المنهج'],
    icon: 'ShieldCheck',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    name: 'أحمد العتيبي',
    role: 'طالب علم',
    quote: 'منصة وقفة وفرت علي عناء البحث الطويل. التنظيم هنا يجعلك تشعر أن العلم أصبح في متناول يدك دائماً.',
  },
  {
    name: 'سارة محمد',
    role: 'باحثة ماجستير',
    quote: 'أفضل ميزة هي الاستماع دون إنترنت. في المواصلات أو السفر، رفيقي الوحيد هو محاضرات وقفة.',
  },
  {
    name: 'محمد خالد',
    role: 'محاضر جامعي',
    quote: 'المحتوى هنا منتقى بعناية بالغة. الثقة في المشايخ هي ما يجعل هذه المنصة هي الأولى لي ولطلابي.',
  },
];

const DEFAULT_FAQS = [
  {
    q: 'هل المنصة مجانية بالكامل؟',
    a: 'نعم، كافة الدروس والمحاضرات والمميزات التقنية على منصة وقفة مجانية ومتاحة للجميع كوقف لله سبحانه وتعالى.',
  },
  {
    q: 'كيف يمكنني استخدام ميزة الاستماع دون إنترنت؟',
    a: 'بمجرد تثبيت المنصة كتطبيق PWA على هاتفك، سيتم حفظ المحاضرات التي تستمع إليها تلقائياً في ذاكرة التطبيق، أو يمكنك النقر على أيقونة الحفظ المتوفرة.',
  },
  {
    q: 'ما هو أفضل مسار للبدء بالنسبة للمبتدئين؟',
    a: "ننصح بشدة بالبدء بـ 'مسار تأسيس طالب العلم' المتوفر في قسم المسارات المقترحة، حيث يركز على المتون الأولية في العقيدة والفقه واللغة.",
  },
  {
    q: 'كيف يمكنني المساهمة في تطوير الموقع؟',
    a: "يمكنك المساهمة من خلال التبرع المادي عبر قسم التبرعات، أو التطوع التقني من خلال صفحة 'التواصل'، أو بمجرد نشر رابط الموقع ليعم النفع.",
  },
];

function getSectionMeta(title: string) {
  if (title.includes('محاضرات')) {
    return {
      icon: Headphones,
      badge: 'مكتبة الدروس المسموعة',
      subtitle: 'محاضرات وتوجيهات منتقاة بعناية لترسيخ العلم الشرعي وتزكية النفوس',
      badgeClass: 'luxury-badge-emerald',
    };
  }
  if (title.includes('البرامج')) {
    return {
      icon: Podcast,
      badge: 'البرامج والقنوات العلمية',
      subtitle: 'قنوات ومسارات متسلسلة لنخبة من كبار العلماء والمشايخ الموثوقين',
      badgeClass: 'luxury-badge-primary',
    };
  }
  if (title.includes('السلاسل')) {
    return {
      icon: Layers,
      badge: 'الدورات والتأصيل العلمي',
      subtitle: 'شروحات رصينة ومتكاملة للمتون الفقهية والعقدية والكتب المعتمدة',
      badgeClass: 'luxury-badge-gold',
    };
  }
  return {
    icon: Sparkles,
    badge: 'محتوى مميز',
    subtitle: 'محتوى معرفي وإيماني متجدد لخدمة طالب العلم والمستفيد',
    badgeClass: 'luxury-badge-primary',
  };
}

function getPathHref(path: HomepagePathConfig): string {
  if (!path.linkType || path.linkType === 'none' || !path.linkId) return '/pathways';
  switch (path.linkType) {
    case 'series':
      return `/series/${path.linkId}`;
    case 'lecture':
      return `/lectures/${path.linkId}`;
    case 'playlist':
      return `/playlists/${path.linkId}`;
    case 'url':
      return path.linkId;
    default:
      return '/pathways';
  }
}

function SectionHeading({
  badge,
  title,
  highlight,
  subtitle,
  actionHref,
  actionLabel,
}: {
  badge: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <div className="space-y-3">
        <div className="luxury-badge luxury-badge-primary w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline tracking-tight text-foreground">
          {title} {highlight && <span className="text-primary">{highlight}</span>}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="luxury-pill-btn group self-start md:self-auto shrink-0">
          <span>{actionLabel}</span>
          <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform duration-300" />
        </Link>
      )}
    </div>
  );
}

function PaginatedSection({
  title,
  items,
  renderItem,
  viewAllHref,
  itemsPerPage = 4,
  gridClassName,
  filterBar,
}: {
  title: string;
  items: any[] | null;
  renderItem: (item: any, index: number) => React.ReactNode;
  viewAllHref: string;
  itemsPerPage?: number;
  gridClassName?: string;
  filterBar?: React.ReactNode;
}) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const meta = useMemo(() => getSectionMeta(title), [title]);
  const SectionIcon = meta.icon;

  useEffect(() => {
    setVisibleCount(itemsPerPage);
  }, [items, itemsPerPage]);

  if (!items || items.length === 0) {
    if (title.includes('محاضرات')) {
      return (
        <section className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-border/60">
            <div>
              <div className={cn('luxury-badge mb-3', meta.badgeClass)}>
                <SectionIcon className="w-3.5 h-3.5" />
                <span>{meta.badge}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-headline text-foreground tracking-tight">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 font-medium">{meta.subtitle}</p>
            </div>
            <Link href={viewAllHref} className="luxury-pill-btn group self-start sm:self-auto">
              <span>عرض الكل</span>
              <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>
          <div className="text-center py-14 luxury-glass rounded-3xl text-muted-foreground border border-border/40 font-medium">
            لا يوجد محتوى لعرضه حالياً في هذا القسم.
          </div>
        </section>
      );
    }
    return null;
  }

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + itemsPerPage, items.length));
  };

  const hasMoreToLoad = visibleCount < items.length;

  return (
    <section className="relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-border/60">
        <div>
          <div className={cn('luxury-badge mb-3', meta.badgeClass)}>
            <SectionIcon className="w-3.5 h-3.5" />
            <span>{meta.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-headline text-foreground tracking-tight flex items-center gap-3">
            <span>{title}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {items.length}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium max-w-2xl">{meta.subtitle}</p>
        </div>
        <Link href={viewAllHref} className="luxury-pill-btn group self-start sm:self-auto">
          <span>عرض الكل</span>
          <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1.5 transition-transform duration-300" />
        </Link>
      </div>

      {filterBar && <div className="mb-7">{filterBar}</div>}

      <div className={cn('grid gap-7', gridClassName || 'grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))]')}>
        {items.slice(0, visibleCount).map((item, index) => renderItem(item, index))}
      </div>

      {hasMoreToLoad && (
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={handleShowMore}
            className="luxury-pill-btn px-8 py-3.5 text-sm font-black group bg-card/60 hover:bg-primary/10 border-border hover:border-primary/40 text-foreground hover:text-primary transition-all duration-300 shadow-lg cursor-pointer"
          >
            <span>تحميل المزيد من {title}</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300 text-primary" />
          </button>
        </div>
      )}
    </section>
  );
}

function InspirationSlider() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const { data: remoteQuotes } = useCollection<Inspiration>('inspiration', {
    orderBy: ['createdAt', 'desc'],
    once: true,
  });

  const fallbackQuotes = [
    {
      id: 'f1',
      text: '"إنما الأعمالُ بالنياتِ، وإنما لكلِّ امرئٍ ما نَوى"',
      author: 'عمر بن الخطاب',
      title: 'رواه البخاري ومسلم',
      type: 'hadith',
    },
    {
      id: 'f2',
      text: '"من سلَك طريقًا يلتَمِسُ فيه علمًا، سهَّل اللهُ له به طريقًا إلى الجنةِ"',
      author: 'أبو هريرة',
      title: 'رواه مسلم',
      type: 'hadith',
    },
    {
      id: 'f3',
      text: '"العلمُ صيدٌ والكتابةُ قيدُه ... قَيِّدْ صيودَكَ بالحبالِ الواثقَة"',
      author: 'الإمام الشافعي',
      title: 'رحمه الله تعالى',
      type: 'quote',
    },
  ];

  const quotes = remoteQuotes?.length ? remoteQuotes : (fallbackQuotes as any[]);

  useEffect(() => {
    if (isHovered || !quotes.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [quotes.length, isHovered]);

  if (!quotes.length) return null;

  const current = quotes[index % quotes.length];
  const Icon = current.type === 'hadith' ? Sparkles : current.type === 'quote' ? Quote : BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      viewport={{ once: true }}
      className="group relative rounded-[2.25rem] luxury-glass border border-border/80 p-8 sm:p-12 overflow-hidden shadow-sm min-h-[190px]"
    >

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12" dir="rtl">
        <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-inner">
          <Icon className="w-8 h-8 text-primary" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
            className="flex-1 space-y-4 text-center md:text-right"
          >
            <p className="text-xl md:text-2xl lg:text-3xl font-headline leading-relaxed font-black text-foreground">
              {current.text}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="h-[1px] w-8 bg-primary/50" />
              <div className="flex items-baseline gap-2.5">
                <span className="text-base md:text-lg text-primary font-black font-headline">{current.author}</span>
                <span className="text-xs text-muted-foreground font-bold">{current.title}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIndex((prev) => (prev - 1 + quotes.length) % quotes.length)}
            aria-label="الاقتباس السابق"
            className="rounded-full bg-white/5 hover:bg-white/10 h-10 w-10 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIndex((prev) => (prev + 1) % quotes.length)}
            aria-label="الاقتباس التالي"
            className="rounded-full bg-white/5 hover:bg-white/10 h-10 w-10 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {quotes.map((_: any, i: number) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`اقتباس ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              i === index ? 'w-8 bg-primary' : 'w-2 bg-white/15 hover:bg-white/30'
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function HomePageClient({
  latestLectures,
  topPrograms,
  latestSeries,
  homepageConfig,
  stripLectures = [],
}: HomePageClientProps) {
  const { heroImageUrl: customHeroUrl, heroTitle, heroSubtitle, heroBanners } = useAppearance();
  const { t, lang, isRtl } = useTranslation();
  const heroImagePlaceholder = getPlaceholderImage('hero-background');
  const [heroImageUrl, setHeroImageUrl] = useState(customHeroUrl || heroImagePlaceholder?.imageUrl);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<string>('worship');
  const [hijriDate, setHijriDate] = useState<string>('');
  const [timeGreeting, setTimeGreeting] = useState<string>('طاب يومك بالعلم والإيمان');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  useEffect(() => {
    try {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 4 && hour < 12) setTimeGreeting(t('صباح الخير والبركة', 'Blessed Morning'));
      else if (hour >= 12 && hour < 17) setTimeGreeting(t('طاب يومك بذكر الله', 'Peaceful Day'));
      else setTimeGreeting(t('مساء السكينة والطمأنينة', 'Serene Evening'));

      const formatted = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-islamic' : 'en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
      setHijriDate(formatted);
    } catch {
      // Ignore if Intl Islamic calendar is unavailable
    }
  }, [lang, t]);

  const banners = useMemo(() => {
    if (heroBanners && heroBanners.length > 0) return heroBanners;
    return [
      {
        imageUrl: heroImageUrl || customHeroUrl || heroImagePlaceholder?.imageUrl || '',
        title: heroTitle || 'العلم الشرعي بين يديك',
        subtitle: heroSubtitle || 'منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.',
        link: undefined,
      },
    ] as HeroBanner[];
  }, [heroBanners, heroImageUrl, customHeroUrl, heroTitle, heroSubtitle, heroImagePlaceholder?.imageUrl]);

  useEffect(() => {
    if (banners.length <= 1 || isHeroHovered) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length, isHeroHovered]);

  const { shorts, regularLectures } = useMemo(() => {
    if (!latestLectures) return { shorts: [], regularLectures: [] };
    const shortsArr: Lecture[] = [];
    const regularLecturesArr: Lecture[] = [];
    latestLectures.forEach((lecture) => {
      if (lecture.duration <= 180) shortsArr.push(lecture);
      else regularLecturesArr.push(lecture);
    });
    return { shorts: shortsArr, regularLectures: regularLecturesArr };
  }, [latestLectures]);

  const featuredStrips = useMemo(() => {
    if (!latestLectures) return [];
    const allAvailableLectures = [...latestLectures];
    const knownIds = new Set(latestLectures.map((l) => l.id));
    for (const lec of stripLectures) {
      if (!knownIds.has(lec.id)) {
        allAvailableLectures.push(lec);
        knownIds.add(lec.id);
      }
    }
    if (allAvailableLectures.length === 0) return [];
    const lecturesById = Object.fromEntries(allAvailableLectures.map((l) => [l.id, l]));

    if (homepageConfig?.featuredStrips?.length) {
      return homepageConfig.featuredStrips
        .map((strip) => {
          const lectures = (strip.lectureIds || []).map((id) => lecturesById[id]).filter(Boolean);
          if (lectures.length === 0) {
            const titleWords = strip.title.split(' ').filter((w) => w.length > 2);
            const matched = latestLectures.filter((lec) =>
              titleWords.some((kw) => lec.title?.includes(kw) || lec.description?.includes(kw))
            );
            return {
              title: strip.title,
              subtitle: strip.subtitle,
              accentColor: strip.accentColor,
              lectures: matched.length > 0 ? matched : latestLectures.slice(0, 6),
              viewAllHref: strip.viewAllHref,
            };
          }
          return {
            title: strip.title,
            subtitle: strip.subtitle,
            accentColor: strip.accentColor,
            lectures,
            viewAllHref: strip.viewAllHref,
          };
        })
        .filter((s) => s.lectures.length > 0);
    }

    return STRIP_TOPICS.map((topic) => {
      const matched = latestLectures.filter((lec) =>
        topic.keywords.some(
          (kw) => lec.title?.includes(kw) || lec.description?.includes(kw) || lec.programName?.includes(kw)
        )
      );
      return {
        title: topic.title,
        subtitle: topic.subtitle,
        accentColor: topic.accentColor,
        lectures: matched.length >= 2 ? matched : latestLectures.slice(0, 6),
        viewAllHref: topic.viewAllHref,
      };
    }).filter((s) => s.lectures.length > 0);
  }, [latestLectures, stripLectures, homepageConfig]);

  const { user } = useUser();
  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(listenHistoryPath);

  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists } = useCollection<Playlist>(playlistsPath);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], ['0%', '22%']);

  useEffect(() => {
    if (customHeroUrl) {
      setHeroImageUrl(customHeroUrl);
      return;
    }
    const featuredProgram = topPrograms?.[0];
    if (featuredProgram?.youtubeUrl) {
      const fetchBanner = async () => {
        try {
          const response = await fetch('/api/youtube-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: featuredProgram.youtubeUrl }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.channelInfo?.bannerUrl) {
              const highResBanner = data.channelInfo.bannerUrl
                .replace('=w1060', '=w2120')
                .replace('=w1707', '=w2120');
              setHeroImageUrl(highResBanner);
            }
          }
        } catch {
          setHeroImageUrl(heroImagePlaceholder?.imageUrl);
        }
      };
      fetchBanner();
    } else {
      setHeroImageUrl(heroImagePlaceholder?.imageUrl);
    }
  }, [topPrograms, heroImagePlaceholder?.imageUrl, customHeroUrl]);

  const activeBanner = banners[activeBannerIndex] || banners[0];
  const rawTitle =
    lang === 'en' && (!activeBanner?.title || activeBanner.title === 'العلم الشرعي بين يديك')
      ? 'Islamic Knowledge Within Reach'
      : activeBanner?.title || t('العلم الشرعي بين يديك', 'Islamic Knowledge Within Reach');
  const titleWords = rawTitle.split(' ');
  const headlineFirst = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(' ');
  const headlineSecond = titleWords.slice(Math.ceil(titleWords.length / 2)).join(' ');
  const resolvedSubtitle =
    lang === 'en'
      ? 'A comprehensive platform for authentic Islamic lectures, Quran, Hadith, and structured learning paths.'
      : activeBanner?.subtitle || heroSubtitle;

  const paths = homepageConfig?.paths?.length ? homepageConfig.paths : DEFAULT_PATHS;
  const faqs = homepageConfig?.faqs?.length ? homepageConfig.faqs : DEFAULT_FAQS;
  const testimonials = homepageConfig?.testimonials?.length
    ? homepageConfig.testimonials.map((t) => ({ name: t.name, role: t.role, quote: t.quote }))
    : DEFAULT_TESTIMONIALS;

  const currentDirectoryGroup =
    DIRECTORY_GROUPS.find((g) => g.id === activeDirectoryTab) || DIRECTORY_GROUPS[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="pb-16 space-y-20 md:space-y-28"
    >
      {/* ══════════════════════════════════════════════════════════════════
          1. ARCHITECTURAL CINEMATIC HERO + INTEGRATED SEARCH & TRUST BAR
      ══════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative z-10 container px-4 pt-3">
        <div
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="relative w-full min-h-[600px] lg:min-h-[680px] overflow-hidden rounded-[2.25rem] sm:rounded-[3.25rem] border border-white/10 shadow-[0_35px_90px_-20px_rgba(0,0,0,0.75)] flex flex-col justify-between group/hero"
        >
          {/* Parallax Background Layer */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBannerIndex}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-0"
            >
              <motion.div style={{ y: heroY }} className="absolute inset-0 -top-[8%] h-[116%] w-full">
                {activeBanner?.imageUrl ? (
                  <Image
                    src={activeBanner.imageUrl}
                    alt={activeBanner.title || 'منصة وقفة العلمية'}
                    fill
                    priority
                    className="object-cover brightness-[0.45] contrast-[1.08]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
                )}
              </motion.div>
              {/* Atmospheric Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/35" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.22),transparent_60%)]" />
            </motion.div>
          </AnimatePresence>

          {/* Top Bar Inside Hero: Status Pill, Islamic Greeting & Banner Controls */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 sm:px-10 pt-6 sm:pt-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-white/90 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('وقف علمي رقمي • بلا إعلانات', 'Digital Islamic Endowment • Ad-Free')}</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 text-white/80 text-xs font-bold">
                <span>{timeGreeting}</span>
                {hijriDate && (
                  <>
                    <span className="text-white/30">•</span>
                    <span className="text-primary font-black">{hijriDate}</span>
                  </>
                )}
              </div>
            </div>

            {banners.length > 1 && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                  aria-label="الشريحة السابقة"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </button>
                <div className="flex items-center gap-1.5">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveBannerIndex(idx)}
                      aria-label={`الشريحة ${idx + 1}`}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-500 cursor-pointer relative overflow-hidden',
                        idx === activeBannerIndex ? 'w-8 bg-white/25' : 'w-2 bg-white/30 hover:bg-white/60'
                      )}
                    >
                      {idx === activeBannerIndex && (
                        <motion.span
                          key={`progress-${activeBannerIndex}-${isHeroHovered}`}
                          initial={{ width: '0%' }}
                          animate={{ width: isHeroHovered ? '50%' : '100%' }}
                          transition={{ duration: 8, ease: 'linear' }}
                          className="absolute inset-y-0 right-0 bg-primary rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBannerIndex((prev) => (prev + 1) % banners.length)}
                  aria-label="الشريحة التالية"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Center Editorial Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 py-10 sm:py-14 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-black font-headline tracking-tight leading-[1.12] text-white drop-shadow-2xl mb-5"
            >
              <span className="block">{headlineFirst}</span>
              {headlineSecond && (
                <span className="block text-transparent bg-clip-text bg-gradient-to-l from-primary via-primary/90 to-white/90 mt-1">
                  {headlineSecond}
                </span>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.7 }}
              className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed font-tajawal"
            >
              {resolvedSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-3.5"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 h-13 text-base font-black bg-primary text-primary-foreground shadow-[0_14px_32px_rgba(var(--primary-rgb),0.35)] hover:scale-[1.03] transition-all duration-300"
              >
                <Link href={activeBanner?.link || '/pathways'} className="flex items-center gap-2">
                  <span>{t('ابدأ رحلتك العلمية', 'Start Learning')}</span>
                  <ArrowLeft className={cn('w-4 h-4', !isRtl && 'rotate-180')} />
                </Link>
              </Button>
              <Button
                type="button"
                onClick={() => setIsAboutModalOpen(true)}
                size="lg"
                className="rounded-full px-7 h-13 text-base font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{t('التعريف بـ وقفة', 'About Waqfah')}</span>
              </Button>
            </motion.div>

            {regularLectures[0] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-6"
              >
                <Link
                  href={`/lectures/${regularLectures[0].slug}`}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/15 hover:border-primary/50 text-xs sm:text-sm text-white/90 transition-all duration-300 group/spot max-w-full"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 text-primary fill-primary" />
                  </span>
                  <span className="text-primary font-black shrink-0">جديد المنصة:</span>
                  <span className="font-bold truncate max-w-[220px] sm:max-w-sm">{regularLectures[0].title}</span>
                  <ArrowLeft className="w-3.5 h-3.5 text-white/60 group-hover/spot:-translate-x-1 transition-transform shrink-0" />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Bottom Search + Quick Access Bar */}
          <div className="relative z-20 px-4 sm:px-8 pb-6 sm:pb-8 space-y-4">
            <div className="max-w-3xl mx-auto">
              <HomeSearch />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {HERO_QUICK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-white/85 hover:text-white text-xs font-bold backdrop-blur-md transition-all duration-300"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden sm:block pt-2 opacity-40 pointer-events-none">
              <Marquee speed={45} pauseOnHover={false}>
                {[
                  'فقه العبادات',
                  'تزكية النفوس',
                  'عقيدة أهل السنة',
                  'السيرة النبوية',
                  'أصول الفقه',
                  'علوم القرآن',
                  'الرد على الشبهات',
                  'مصطلح الحديث',
                ].map((topic, i) => (
                  <div key={i} className="flex items-center gap-3 px-8">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-xs font-black font-headline tracking-wider text-white">
                      {topic}
                    </span>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </div>

        {/* Sleek 4-Pillar Trust Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-6" dir="rtl">
          {TRUST_PILLARS.map((pillar, idx) => {
            const PillarIcon = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="luxury-stat-card flex items-center gap-3.5 p-4 sm:p-5 group"
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110',
                    pillar.bg
                  )}
                >
                  <PillarIcon className={cn('w-5 h-5', pillar.color)} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black font-headline text-foreground truncate">{pillar.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-medium">{pillar.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. PERSONALIZED RESUME SHELF (Pinned & Continue Watching)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="container px-4 space-y-12 empty:hidden">
        <Suspense>
          <PinnedItems />
        </Suspense>
        <Suspense>
          <ContinueWatching />
        </Suspense>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. UNIFIED BENTO HUB — "أبواب العلم والتزكية"
      ══════════════════════════════════════════════════════════════════ */}
      <section id="categories" className="container px-4 relative z-20">
        <SectionHeading
          badge={t('خريطة المعرفة الشرعية', 'Islamic Knowledge Map')}
          title={t('أبواب العلم', 'Doors of')}
          highlight={t('والتزكية', 'Knowledge')}
          subtitle={t('بوابة منظمة تجمع القرآن الكريم والسنة النبوية والعلوم الشرعية وأدوات طالب العلم في مكان واحد.', 'An organized gateway uniting the Quran, Sunnah, Islamic sciences, and student tools.')}
          actionHref="/sciences-tree"
          actionLabel={t('شجرة العلوم', 'Sciences Tree')}
        />

        {/* Primary Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" dir="rtl">
          {/* Featured 2x2 Quran & Radio Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:row-span-2"
          >
            <div className="group relative flex flex-col justify-between h-full min-h-[340px] p-8 sm:p-10 rounded-[2rem] luxury-card overflow-hidden">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <BookOpenCheck className="w-7 h-7" />
                  </div>
                  <span className="luxury-badge luxury-badge-emerald">الركن الأعظم</span>
                </div>
                <div className="space-y-3 pt-4">
                  <h3 className="text-3xl sm:text-4xl font-black font-headline text-foreground leading-tight">
                    القرآن الكريم والتدبر
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-md font-medium">
                    تصفح المصحف الشامل مع التفسير الموضوعي، واستمع إلى البث المباشر لإذاعة القرآن الكريم وكبار القراء.
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3 pt-8">
                <Button asChild className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6">
                  <Link href="/quran" prefetch={false} className="flex items-center gap-2">
                    <span>المصحف والتدبر</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-emerald-500/30 hover:bg-emerald-500/10 text-foreground font-bold px-5"
                >
                  <Link href="/quran?view=radio" className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>إذاعة القرآن</span>
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* 4 Core Science Cards */}
          {CORE_SCIENCES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.href}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link href={cat.href} className="block h-full group">
                  <div className="luxury-card p-6 sm:p-7 h-full flex flex-col justify-between gap-6">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: `${cat.accent}18`,
                          border: `1px solid ${cat.accent}35`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: cat.accent }} />
                      </div>
                      <ArrowLeft
                        className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:-translate-x-1 transition-all"
                        style={{ color: cat.accent }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-black text-xl text-foreground font-headline">{cat.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* 2 Wide Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5" dir="rtl">
          {[
            {
              name: 'ما لا يسع المسلم جهله',
              desc: 'العلوم والأساسيات العينية المفروضة والتأصيل الشرعي الميسر للمبتدئين',
              icon: BookOpenCheck,
              accent: '#10b981',
              href: '/essential-knowledge',
              image: '/images/essential_knowledge_cover.png',
            },
            {
              name: 'المكتبة والكتب المشروحة',
              desc: 'المكتبة العلمية الرقمية للمتون والمؤلفات المعتمدة وشروحها الصوتية',
              icon: Library,
              accent: '#f59e0b',
              href: '/books',
              image: '/images/book_card_cover.png',
            },
          ].map((spotlight) => {
            const Icon = spotlight.icon;
            return (
              <Link key={spotlight.href} href={spotlight.href} className="group block">
                <div className="relative luxury-card p-7 sm:p-8 overflow-hidden flex items-center justify-between gap-6 min-h-[155px]">
                  <div className="absolute inset-0 z-0 opacity-[0.1] group-hover:opacity-[0.18] transition-opacity duration-500">
                    <Image
                      src={spotlight.image}
                      alt={spotlight.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/70 to-transparent" />
                  </div>
                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${spotlight.accent}18`,
                        border: `1px solid ${spotlight.accent}35`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: spotlight.accent }} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black font-headline text-foreground">{spotlight.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium max-w-md">{spotlight.desc}</p>
                    </div>
                  </div>
                  <ArrowLeft className="relative z-10 w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1.5 transition-all shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tabbed Compact Directory for All Remaining Sections */}
        <div className="mt-8 p-6 sm:p-8 rounded-[2rem] luxury-glass border border-border/60" dir="rtl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/50">
            <div>
              <h3 className="text-lg font-black font-headline text-foreground">استكشف بقية الأقسام والأدوات</h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                وصول سريع للأذكار، المتون، المبادرات، وأدوات المتابعة
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIRECTORY_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveDirectoryTab(group.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border',
                    activeDirectoryTab === group.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card/50 text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/40'
                  )}
                >
                  <span>{group.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      activeDirectoryTab === group.id ? 'bg-white/20 text-primary-foreground' : 'bg-background/60 text-muted-foreground'
                    )}
                  >
                    {group.items.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentDirectoryGroup.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-5"
            >
              {currentDirectoryGroup.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/40 hover:bg-primary/10 border border-border/50 hover:border-primary/40 transition-all duration-200 group"
                  >
                    <div className={cn('w-9 h-9 rounded-lg bg-background/60 border border-border/50 flex items-center justify-center shrink-0', item.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground/85 group-hover:text-foreground truncate">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. DAILY SPIRITUAL SANCTUARY (Verse of the Day & Prescription)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="spiritual" className="space-y-12">
        <VerseOfTheDay />
        <SpiritualPrescription />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. MEDIA DISCOVERY: RECOMMENDED, SHORTS, STRIPS & LATEST
      ══════════════════════════════════════════════════════════════════ */}
      <div className="container px-4 space-y-20">
        {/* Recommended & Shorts */}
        <div className="relative py-12 px-4 sm:px-8 rounded-[2.5rem] bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent border border-border/60 overflow-hidden">
          <div className="relative z-10 space-y-14">
            <Suspense>
              <RecommendedLectures />
            </Suspense>
            <div className="border-t border-border/50" />
            <ShortsCarousel shorts={shorts} />
          </div>
        </div>

        {/* Featured Topic Strips */}
        {featuredStrips.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-border/80 to-transparent" />
              <div className="luxury-badge luxury-badge-primary">محتوى مختار ومنظم</div>
              <div className="flex-1 h-px bg-gradient-to-l from-border/80 to-transparent" />
            </div>
            <FeaturedStrips strips={featuredStrips} />
          </div>
        )}

        {/* Main Media Catalog */}
        <div id="latest" className="space-y-20">
          <PaginatedSection
            title="أبرز البرامج"
            items={topPrograms}
            viewAllHref="/programs"
            itemsPerPage={4}
            renderItem={(item, index) => <ProgramCard program={item} index={index} key={item.id} />}
          />

          <LatestLecturesSection
            programs={topPrograms}
            regularLectures={regularLectures}
            listenHistory={listenHistory}
            playlists={playlists}
          />

          <PaginatedSection
            title="أحدث السلاسل"
            items={latestSeries}
            viewAllHref="/series"
            itemsPerPage={3}
            gridClassName="md:grid-cols-2 lg:grid-cols-3"
            renderItem={(item, index) => <SeriesCard series={item} index={index} key={item.id} />}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          6. STRUCTURED LEARNING PATHWAYS
      ══════════════════════════════════════════════════════════════════ */}
      <section id="pathways" className="container px-4 relative">
        <div className="text-center mb-12 space-y-4">
          <div className="luxury-badge luxury-badge-primary mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('مسارات علمية متدرجة', 'Structured Learning Paths')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-headline tracking-tight text-foreground">
            {t('خارطة طريقٍ', 'Structured')} <span className="text-primary">{t('ممنهجة', 'Roadmaps')}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            {t('«من أراد العلم فليقرأ القرآن، ومن أراد الفهم فليقرأ سيرة النبي ﷺ، ومن أراد الحكمة فليأخذ من كل فن نصيباً»', 'Guided curriculums designed step-by-step for seekers of beneficial knowledge.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8" dir="rtl">
          {paths.map((path, idx) => {
            const IconComponent = iconMap[path.icon as string] || BookOpen;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="luxury-card p-8 flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute top-6 left-6 text-7xl font-black text-foreground/[0.04] select-none pointer-events-none">
                  0{idx + 1}
                </div>

                <div>
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border bg-primary/10',
                      path.border || 'border-primary/20'
                    )}
                  >
                    <IconComponent className={cn('w-7 h-7', path.color || 'text-primary')} />
                  </div>

                  <h3 className="text-2xl font-black font-headline mb-3 text-foreground">{path.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed font-medium">
                    {path.desc}
                  </p>

                  <div className="space-y-3 pt-5 border-t border-border/60">
                    <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      منهج المسار
                    </div>
                    {path.parts.map((part, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border bg-card/60',
                            path.border || 'border-primary/25',
                            path.color || 'text-primary'
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-foreground/85">{part}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full mt-8 h-12 rounded-xl font-black bg-card hover:bg-primary text-foreground hover:text-primary-foreground border border-border hover:border-primary transition-all duration-300"
                >
                  <Link href={getPathHref(path)} className="flex items-center justify-center gap-2">
                    <span>ابدأ المسار الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. INSPIRATION, TESTIMONIALS & FAQ
      ══════════════════════════════════════════════════════════════════ */}
      <section className="container px-4 space-y-20">
        <div className="max-w-4xl mx-auto">
          <InspirationSlider />
        </div>

        {/* Testimonials */}
        <div>
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tight text-foreground">
              أصوات من رحاب المنصة
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base font-medium">
              أثر الوقف العلمي لا يقاس بالأرقام فحسب، بل بحياة تغيرت وعقول استنارت.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-7 rounded-[2rem] luxury-card relative flex flex-col justify-between">
                <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/15" />
                <div>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed mb-6 text-foreground/90 font-medium">«{t.quote}»</p>
                </div>
                <div className="flex items-center gap-3.5 pt-4 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-black text-sm text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tight text-foreground">
              الأسئلة الشائعة
            </h2>
            <p className="text-muted-foreground text-base font-medium">
              كل ما تحتاج معرفته عن استخدام المنصة ودعم المشروع.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-3.5">
            {faqs.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="luxury-glass rounded-2xl px-6 border border-border/60 overflow-hidden transition-all hover:border-primary/35"
              >
                <AccordionTrigger className="text-right py-5 font-bold text-base md:text-lg text-foreground hover:no-underline hover:text-primary transition-colors">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-right text-muted-foreground leading-relaxed pb-5 text-sm sm:text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. UNIFIED CLOSING: WAQF CONTRIBUTION & NEWSLETTER
      ══════════════════════════════════════════════════════════════════ */}
      <section className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" dir="rtl">
          {/* Waqf CTA Card */}
          <div className="lg:col-span-7 rounded-[2.25rem] luxury-glass border border-primary/25 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between gap-8">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 rounded-full blur-[90px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="luxury-badge luxury-badge-primary w-fit">
                <HeartHandshake className="w-4 h-4" />
                <span>{t('ساهم في الأجر', 'Share the Reward')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-headline tracking-tight text-foreground">
                {t('كن جزءاً من رحلة', 'Be part of spreading')} <span className="text-primary">{t('نشر العلم', 'knowledge')}</span>
              </h2>
              <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
                {t('ساهم في استكمال هذا المشروع الوقفي وتوسيع انتشاره ليصل العلم لكل طالب وراغب. وقفتك اليوم هي صدقة جارية وأجر مستمر.', 'Support this non-profit Islamic endowment so beneficial knowledge reaches every seeker worldwide.')}
              </p>
            </div>
            <div className="relative z-10 flex flex-wrap gap-3.5">
              <Button
                asChild
                size="lg"
                className="h-13 px-8 rounded-xl text-base font-black bg-primary text-primary-foreground shadow-lg"
              >
                <Link href="/donations" prefetch={false} className="flex items-center gap-2.5">
                  <Heart className="w-5 h-5 fill-current" />
                  <span>{t('ادعم المشروع الآن', 'Support Now')}</span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 px-7 rounded-xl text-base font-bold border-border hover:border-primary/50"
              >
                <Link href="/contact" prefetch={false} className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>{t('تطوع معنا', 'Volunteer')}</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Newsletter Card */}
          <div className="lg:col-span-5 rounded-[2.25rem] luxury-glass border border-border/60 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black font-headline text-foreground">{t('ابقَ على اتصال بكل جديد', 'Stay Updated')}</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {t('اشترك لتصلك أحدث المحاضرات والسلاسل العلمية فور صدورها.', 'Subscribe to receive the latest lectures and series upon release.')}
              </p>
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newsletterEmail.trim()) return;
                setNewsletterSent(true);
                setNewsletterEmail('');
              }}
            >
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterSent) setNewsletterSent(false);
                  }}
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 h-12 px-4 rounded-xl bg-background/60 border border-border text-sm font-bold outline-none"
                />
                <Button type="submit" className="h-12 px-6 rounded-xl font-bold shrink-0 cursor-pointer">
                  <Send className="w-4 h-4 ml-1.5" />
                  <span>اشترك</span>
                </Button>
              </div>
              {newsletterSent && (
                <p className="text-xs font-bold text-emerald-400">تم تسجيل بريدك بنجاح، جزاك الله خيراً.</p>
              )}
            </form>

            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground font-bold">قنواتنا:</span>
              <Link
                href="/contact"
                aria-label="التواصل عبر الواتساب"
                className="p-2.5 rounded-xl bg-card/60 border border-border/60 hover:border-sky-500/40 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-sky-400" />
              </Link>
              <Link
                href="/contact"
                aria-label="التواصل عبر تليجرام"
                className="p-2.5 rounded-xl bg-card/60 border border-border/60 hover:border-blue-500/40 transition-colors"
              >
                <Send className="w-4 h-4 text-blue-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AboutPlatformModal open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen} />
    </motion.div>
  );
}
