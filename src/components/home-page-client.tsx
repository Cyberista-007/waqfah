'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { collection, getDocs, limit, orderBy, query, doc, getDoc } from 'firebase/firestore';
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
  Shuffle,
  Sparkles,
  Star,
  TriangleAlert,
  Trophy,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/images';
import { IMPACTFUL_HADITHS } from '@/data/impactful-hadiths';
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
import { useCollection, useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { LatestLecturesSection } from '@/components/latest-lectures-section';
import { FeaturedProgramsSection } from '@/components/featured-programs-section';
import { HomeSearch } from '@/components/home-search';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SeriesCard } from '@/components/series-card';

// Dynamically imported interactive & below-the-fold widgets
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
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'نخبة من كبار العلماء',
    desc: 'دروس ومحاضرات منتقاة على منهج السلف',
    icon: ShieldCheck,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'أدوات تدبر تفاعلية',
    desc: 'تفريغ ذكي، حفظ المتون، ومحاسبة النفس',
    icon: Sparkles,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'وقفي وخيري ١٠٠٪',
    desc: 'خالص لوجه الله، بلا إعلانات تجارية',
    icon: Heart,
    color: 'text-rose-500',
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
      { href: '/adhkar', label: 'الأذكار', icon: Headphones, color: 'text-cyan-500' },
      { href: '/dua', label: 'الأدعية', icon: HandHeart, color: 'text-rose-500' },
      { href: '/prayer', label: 'الصلاة والخشوع', icon: Sparkles, color: 'text-teal-500' },
      { href: '/muhlikat', label: 'المهلكات', icon: TriangleAlert, color: 'text-red-500' },
      { href: '/chastity', label: 'درع العفة', icon: Shield, color: 'text-slate-400' },
      { href: '/accountability', label: 'محاسبة النفس', icon: BookCheck, color: 'text-emerald-500' },
    ],
  },
  {
    id: 'knowledge',
    label: 'التأصيل والعلوم',
    items: [
      { href: '/curriculums', label: 'المناهج العلمية', icon: GraduationCap, color: 'text-orange-500' },
      { href: '/memorize', label: 'حفظ المتون', icon: BookOpen, color: 'text-indigo-500' },
      { href: '/sciences-tree', label: 'شجرة العلوم', icon: Compass, color: 'text-teal-500' },
      { href: '/shubuhat', label: 'رد الشبهات', icon: Shield, color: 'text-indigo-500' },
      { href: '/essentials', label: 'الأساسيات', icon: BookCheck, color: 'text-cyan-500' },
      { href: '/mirath', label: 'المواريث', icon: Scale, color: 'text-yellow-500' },
      { href: '/stories', label: 'القصص والعبر', icon: Sparkles, color: 'text-violet-500' },
      { href: '/qa', label: 'سؤال وجواب', icon: HelpCircle, color: 'text-blue-500' },
    ],
  },
  {
    id: 'sections',
    label: 'أقسام ومبادرات',
    items: [
      { href: '/bayan', label: 'بيان', icon: Sparkles, color: 'text-violet-500' },
      { href: '/athar', label: 'أثر', icon: Compass, color: 'text-amber-500' },
      { href: '/namaa', label: 'نماء', icon: Scale, color: 'text-emerald-500' },
      { href: '/adab', label: 'أدب', icon: BookCheck, color: 'text-sky-500' },
      { href: '/kanaf', label: 'كنف', icon: Heart, color: 'text-rose-500' },
      { href: '/playlists', label: 'قوائم التشغيل', icon: ListMusic, color: 'text-pink-500' },
      { href: '/challenges', label: 'التحديات', icon: Flame, color: 'text-orange-500' },
      { href: '/badges', label: 'الأوسمة', icon: Medal, color: 'text-amber-500' },
      { href: '/leaderboard', label: 'لوحة الصدارة', icon: Trophy, color: 'text-yellow-500' },
      { href: '/contact', label: 'اتصل بنا', icon: Mail, color: 'text-cyan-500' },
    ],
  },
];

const DEFAULT_PATHS: HomepagePathConfig[] = [
  {
    title: 'تأسيس طالب العلم',
    desc: 'البداية الصحيحة لدراسة المتون العلمية والمقدمات الضرورية في كل فن.',
    parts: ['متن الآجرومية', 'الأربعين النووية', 'كتاب التوحيد'],
    icon: 'BookOpen',
    color: 'text-blue-500',
    border: 'border-blue-500/25',
  },
  {
    title: 'مسار العبادة والقلوب',
    desc: 'رحلة إيمانية تركز على تزكية النفس، السيرة النبوية، وفقه العبادات اليومية.',
    parts: ['فقه الصلاة', 'تهذيب الأخلاق', 'سيرة النبوة'],
    icon: 'HeartHandshake',
    color: 'text-rose-500',
    border: 'border-rose-500/25',
  },
  {
    title: 'الردود والشبهات',
    desc: 'حصن نفسك بعلم متين للرد على الشبهات المعاصرة بناءً على أصول أهل السنة.',
    parts: ['تنبيه الغبي', 'ردود على الإلحاد', 'أصول المنهج'],
    icon: 'ShieldCheck',
    color: 'text-emerald-500',
    border: 'border-emerald-500/25',
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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-border/70">
      <div className="space-y-2.5">
        <div className="luxury-badge luxury-badge-primary w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-tight text-foreground">
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
          <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform duration-200" />
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-border/70">
            <div>
              <div className={cn('luxury-badge mb-2.5', meta.badgeClass)}>
                <SectionIcon className="w-3.5 h-3.5" />
                <span>{meta.badge}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-foreground tracking-tight">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{meta.subtitle}</p>
            </div>
            <Link href={viewAllHref} className="luxury-pill-btn group self-start sm:self-auto">
              <span>عرض الكل</span>
              <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
          <div className="text-center py-12 luxury-glass rounded-2xl text-muted-foreground font-medium">
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-border/70">
        <div>
          <div className={cn('luxury-badge mb-2.5', meta.badgeClass)}>
            <SectionIcon className="w-3.5 h-3.5" />
            <span>{meta.badge}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-headline text-foreground tracking-tight flex items-center gap-3">
            <span>{title}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {items.length}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium max-w-2xl">{meta.subtitle}</p>
        </div>
        <Link href={viewAllHref} className="luxury-pill-btn group self-start sm:self-auto">
          <span>عرض الكل</span>
          <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      {filterBar && <div className="mb-6">{filterBar}</div>}

      <div className={cn('grid gap-6', gridClassName || 'grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))]')}>
        {items.slice(0, visibleCount).map((item, index) => renderItem(item, index))}
      </div>

      {hasMoreToLoad && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={handleShowMore}
            className="luxury-pill-btn px-7 py-3 text-sm font-black cursor-pointer"
          >
            <span>تحميل المزيد من {title}</span>
            <ChevronDown className="w-4 h-4 text-primary" />
          </button>
        </div>
      )}
    </section>
  );
}

const FALLBACK_QUOTES: Inspiration[] = [
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

function InspirationSlider() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const { data: remoteQuotes } = useCollection<Inspiration>('inspiration', {
    orderBy: ['createdAt', 'desc'],
    once: true,
  });

  const quotes = useMemo(() => {
    const merged = [...(remoteQuotes ?? []), ...FALLBACK_QUOTES, ...IMPACTFUL_HADITHS];
    const seen = new Set<string>();
    return merged.filter((item) => {
      const normalized = item.text
        .replace(/[\u064B-\u065F\u0670"'«».,،؛؟!…\s]+/g, '')
        .trim();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }, [remoteQuotes]);

  useEffect(() => {
    if (isHovered || !quotes.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [quotes.length, isHovered]);

  if (!quotes.length) return null;

  const activeIndex = index % quotes.length;
  const current = quotes[activeIndex];
  const Icon = current.type === 'hadith' ? Sparkles : current.type === 'quote' ? Quote : BookOpen;

  const maxVisibleDots = 7;
  const dotWindowSize = Math.min(maxVisibleDots, quotes.length);
  const halfWindow = Math.floor(dotWindowSize / 2);
  let dotStart = Math.max(0, activeIndex - halfWindow);
  if (dotStart + dotWindowSize > quotes.length) {
    dotStart = Math.max(0, quotes.length - dotWindowSize);
  }

  const handleRandomQuote = () => {
    if (quotes.length <= 1) return;
    let next = activeIndex;
    while (next === activeIndex) {
      next = Math.floor(Math.random() * quotes.length);
    }
    setIndex(next);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-2xl bg-card border border-border p-7 sm:p-10 shadow-sm min-h-[180px]"
    >
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10" dir="rtl">
        <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary" />
        </div>

        <div className="flex-1 space-y-3 text-center md:text-right">
          <p className="text-xl md:text-2xl lg:text-[1.75rem] font-headline leading-relaxed font-black text-foreground">
            {current.text}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="h-[1px] w-7 bg-primary/50" />
            <div className="flex items-baseline gap-2.5 flex-wrap justify-center md:justify-start">
              <span className="text-base text-primary font-black font-headline">{current.author}</span>
              {current.title && (
                <span className="text-xs text-muted-foreground font-bold">{current.title}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIndex((prev) => (prev - 1 + quotes.length) % quotes.length)}
            aria-label="الاقتباس السابق"
            className="rounded-full bg-muted/60 hover:bg-muted h-9 w-9 border border-border text-foreground"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIndex((prev) => (prev + 1) % quotes.length)}
            aria-label="الاقتباس التالي"
            className="rounded-full bg-muted/60 hover:bg-muted h-9 w-9 border border-border text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRandomQuote}
            aria-label="حديث عشوائي"
            title="حديث عشوائي"
            className="rounded-full bg-muted/60 hover:bg-muted h-9 w-9 border border-border text-foreground"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3" dir="rtl">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: dotWindowSize }, (_, offset) => {
            const targetIndex = dotStart + offset;
            return (
              <button
                key={targetIndex}
                type="button"
                onClick={() => setIndex(targetIndex)}
                aria-label={`اقتباس ${targetIndex + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200 cursor-pointer',
                  targetIndex === activeIndex
                    ? 'w-7 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
              />
            );
          })}
        </div>
        <span className="text-[11px] font-bold text-muted-foreground tabular-nums px-2 py-0.5 rounded-full bg-muted border border-border">
          {activeIndex + 1} / {quotes.length}
        </span>
      </div>
    </div>
  );
}

export function HomePageClient({
  latestLectures: initialLectures,
  topPrograms: initialPrograms,
  latestSeries: initialSeries,
  homepageConfig: initialHomepageConfig,
  stripLectures = [],
}: HomePageClientProps) {
  const { heroImageUrl: customHeroUrl, heroTitle, heroSubtitle, heroBanners } = useAppearance();
  const { t, lang, isRtl } = useTranslation();
  const firestore = useFirestore();
  const heroImagePlaceholder = getPlaceholderImage('hero-background');

  // Use SSR data immediately; hydrate from client only if SSR yielded empty (e.g., static export)
  const [fallbackLectures, setFallbackLectures] = useState<Lecture[]>(initialLectures);
  const [fallbackPrograms, setFallbackPrograms] = useState<Program[]>(initialPrograms);
  const [fallbackSeries, setFallbackSeries] = useState<Series[]>(initialSeries);
  const [fallbackConfig, setFallbackConfig] = useState<HomepageDetailedConfig | null>(
    initialHomepageConfig ?? null
  );

  const latestLectures = initialLectures.length > 0 ? initialLectures : fallbackLectures;
  const topPrograms = initialPrograms.length > 0 ? initialPrograms : fallbackPrograms;
  const latestSeries = initialSeries.length > 0 ? initialSeries : fallbackSeries;
  const homepageConfig = initialHomepageConfig ?? fallbackConfig;

  useEffect(() => {
    const needsFallback =
      initialLectures.length === 0 &&
      initialPrograms.length === 0 &&
      initialSeries.length === 0;
    if (!needsFallback || !firestore) return;

    let cancelled = false;
    (async () => {
      try {
        const [lecSnap, progSnap, serSnap, cfgSnap] = await Promise.all([
          getDocs(query(collection(firestore, 'lectures'), orderBy('createdAt', 'desc'), limit(12))),
          getDocs(query(collection(firestore, 'programs'), orderBy('followerCount', 'desc'), limit(50))),
          getDocs(query(collection(firestore, 'series'), orderBy('createdAt', 'desc'), limit(12))),
          getDoc(doc(firestore, 'settings', 'homepage')),
        ]);
        if (cancelled) return;
        setFallbackLectures(lecSnap.docs.map((d) => ({ ...(d.data() as Lecture), id: d.id })));
        setFallbackPrograms(progSnap.docs.map((d) => ({ ...(d.data() as Program), id: d.id })));
        setFallbackSeries(serSnap.docs.map((d) => ({ ...(d.data() as Series), id: d.id })));
        if (cfgSnap.exists()) setFallbackConfig(cfgSnap.data() as HomepageDetailedConfig);
      } catch {
        // Ignore silent client fallback errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [firestore, initialLectures.length, initialPrograms.length, initialSeries.length]);

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

      const formatted = new Intl.DateTimeFormat(
        lang === 'ar' ? 'ar-SA-u-ca-islamic' : 'en-US-u-ca-islamic',
        { day: 'numeric', month: 'long', year: 'numeric' }
      ).format(now);
      setHijriDate(formatted);
    } catch {
      // Ignore if Intl Islamic calendar is unavailable
    }
  }, [lang, t]);

  const banners = useMemo(() => {
    if (heroBanners && heroBanners.length > 0) return heroBanners;
    return [
      {
        imageUrl: customHeroUrl || heroImagePlaceholder?.imageUrl || '',
        title: heroTitle || 'العلم الشرعي بين يديك',
        subtitle: heroSubtitle || 'منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.',
        link: undefined,
      },
    ] as HeroBanner[];
  }, [heroBanners, customHeroUrl, heroTitle, heroSubtitle, heroImagePlaceholder?.imageUrl]);

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
    <div className="pb-14 space-y-16 md:space-y-20">
      {/* ══════════════════════════════════════════════════════════════════
          1. EDITORIAL HERO SECTION (Thmanyah-Inspired Clarity & Hierarchy)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="container px-4 pt-4">
        <div
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-sm"
        >
          {/* Subtle Static Background Image */}
          {activeBanner?.imageUrl && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image
                src={activeBanner.imageUrl}
                alt={activeBanner.title || 'منصة وقفة العلمية'}
                fill
                priority
                className="object-cover opacity-[0.14]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 to-card/70" />
            </div>
          )}

          {/* Top Bar Inside Hero */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 pt-5 sm:pt-7">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{t('وقف علمي رقمي • بلا إعلانات', 'Digital Islamic Endowment • Ad-Free')}</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 border border-border text-muted-foreground text-xs font-bold">
                <span>{timeGreeting}</span>
                {hijriDate && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-black">{hijriDate}</span>
                  </>
                )}
              </div>
            </div>

            {banners.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                  aria-label="الشريحة السابقة"
                  className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:border-primary/50 transition-colors cursor-pointer"
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
                        'h-1.5 rounded-full transition-all duration-200 cursor-pointer',
                        idx === activeBannerIndex ? 'w-7 bg-primary' : 'w-2 bg-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBannerIndex((prev) => (prev + 1) % banners.length)}
                  aria-label="الشريحة التالية"
                  className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Center Editorial Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-5 py-9 sm:py-12 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-headline tracking-tight leading-[1.15] text-foreground mb-4">
              <span className="block">{headlineFirst}</span>
              {headlineSecond && (
                <span className="block text-primary mt-1">{headlineSecond}</span>
              )}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-7 leading-relaxed font-tajawal">
              {resolvedSubtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full px-7 h-12 text-sm sm:text-base font-black bg-primary text-primary-foreground shadow-sm"
              >
                <Link href={activeBanner?.link || '/pathways'} className="flex items-center gap-2">
                  <span>{t('ابدأ رحلتك العلمية', 'Start Learning')}</span>
                  <ArrowLeft className={cn('w-4 h-4', !isRtl && 'rotate-180')} />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAboutModalOpen(true)}
                size="lg"
                className="rounded-full px-6 h-12 text-sm sm:text-base font-bold border-border bg-background hover:bg-muted flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{t('التعريف بـ وقفة', 'About Waqfah')}</span>
              </Button>
            </div>

            {regularLectures[0] && (
              <div className="mt-6">
                <Link
                  href={`/lectures/${regularLectures[0].slug}`}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-muted/70 hover:bg-muted border border-border hover:border-primary/40 text-xs sm:text-sm text-foreground transition-colors max-w-full group/spot"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 text-primary fill-primary" />
                  </span>
                  <span className="text-primary font-black shrink-0">جديد المنصة:</span>
                  <span className="font-bold truncate max-w-[210px] sm:max-w-sm">{regularLectures[0].title}</span>
                  <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground group-hover/spot:-translate-x-1 transition-transform shrink-0" />
                </Link>
              </div>
            )}
          </div>

          {/* Search + Quick Access Bar */}
          <div className="relative z-10 px-4 sm:px-8 pb-6 sm:pb-8 space-y-4">
            <HomeSearch />

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {HERO_QUICK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/70 hover:bg-primary/10 border border-border hover:border-primary/40 text-foreground text-xs font-bold transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clean 4-Pillar Trust Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5" dir="rtl">
          {TRUST_PILLARS.map((pillar, idx) => {
            const PillarIcon = pillar.icon;
            return (
              <div key={idx} className="luxury-stat-card flex items-center gap-3.5">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
                    pillar.bg
                  )}
                >
                  <PillarIcon className={cn('w-5 h-5', pillar.color)} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black font-headline text-foreground truncate">{pillar.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-medium">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. PERSONALIZED RESUME SHELF (Pinned & Continue Watching)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="container px-4 space-y-10 empty:hidden">
        <Suspense>
          <PinnedItems />
        </Suspense>
        <Suspense>
          <ContinueWatching />
        </Suspense>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. EDITORIAL KNOWLEDGE HUB — "أبواب العلم والتزكية"
      ══════════════════════════════════════════════════════════════════ */}
      <section id="categories" className="container px-4">
        <SectionHeading
          badge={t('خريطة المعرفة الشرعية', 'Islamic Knowledge Map')}
          title={t('أبواب العلم', 'Doors of')}
          highlight={t('والتزكية', 'Knowledge')}
          subtitle={t('بوابة منظمة تجمع القرآن الكريم والسنة النبوية والعلوم الشرعية وأدوات طالب العلم في مكان واحد.', 'An organized gateway uniting the Quran, Sunnah, Islamic sciences, and student tools.')}
          actionHref="/sciences-tree"
          actionLabel={t('شجرة العلوم', 'Sciences Tree')}
        />

        {/* Primary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
          <div className="md:col-span-2 lg:row-span-2">
            <div className="flex flex-col justify-between h-full min-h-[300px] p-7 sm:p-8 rounded-2xl luxury-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                    <BookOpenCheck className="w-6 h-6" />
                  </div>
                  <span className="luxury-badge luxury-badge-emerald">الركن الأعظم</span>
                </div>
                <div className="space-y-2.5 pt-2">
                  <h3 className="text-2xl sm:text-3xl font-black font-headline text-foreground leading-tight">
                    القرآن الكريم والتدبر
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md font-medium">
                    تصفح المصحف الشامل مع التفسير الموضوعي، واستمع إلى البث المباشر لإذاعة القرآن الكريم وكبار القراء.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6">
                <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6">
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
                    <Radio className="w-4 h-4 text-emerald-500" />
                    <span>إذاعة القرآن</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {CORE_SCIENCES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.href} href={cat.href} className="block h-full group">
                <div className="luxury-card p-6 h-full flex flex-col justify-between gap-5">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${cat.accent}15`,
                        border: `1px solid ${cat.accent}35`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat.accent }} />
                    </div>
                    <ArrowLeft
                      className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:-translate-x-1 transition-all"
                      style={{ color: cat.accent }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-black text-lg text-foreground font-headline">{cat.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 2 Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" dir="rtl">
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
                <div className="relative luxury-card p-6 sm:p-7 overflow-hidden flex items-center justify-between gap-5 min-h-[135px]">
                  <div className="absolute inset-0 z-0 opacity-[0.08] group-hover:opacity-[0.14] transition-opacity duration-300">
                    <Image
                      src={spotlight.image}
                      alt={spotlight.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-card via-card/75 to-transparent" />
                  </div>
                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${spotlight.accent}15`,
                        border: `1px solid ${spotlight.accent}35`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: spotlight.accent }} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-black font-headline text-foreground">{spotlight.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md">{spotlight.desc}</p>
                    </div>
                  </div>
                  <ArrowLeft className="relative z-10 w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tabbed Compact Directory */}
        <div className="mt-6 p-5 sm:p-7 rounded-2xl bg-card border border-border" dir="rtl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
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
                    'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-colors cursor-pointer border',
                    activeDirectoryTab === group.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/60 text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  <span>{group.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      activeDirectoryTab === group.id ? 'bg-white/20 text-primary-foreground' : 'bg-background text-muted-foreground'
                    )}
                  >
                    {group.items.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-4">
            {currentDirectoryGroup.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 hover:bg-primary/10 border border-border/70 hover:border-primary/40 transition-colors group"
                >
                  <div className={cn('w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0', item.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground/85 group-hover:text-foreground truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. DAILY SPIRITUAL SANCTUARY (Verse of the Day & Prescription)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="spiritual" className="space-y-8">
        <VerseOfTheDay />
        <SpiritualPrescription />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. MEDIA DISCOVERY: RECOMMENDED, SHORTS, STRIPS & LATEST
      ══════════════════════════════════════════════════════════════════ */}
      <div className="container px-4 space-y-16">
        <div className="py-10 px-4 sm:px-8 rounded-2xl bg-card border border-border space-y-12">
          <Suspense>
            <RecommendedLectures />
          </Suspense>
          <div className="border-t border-border/60" />
          <ShortsCarousel shorts={shorts} />
        </div>

        {featuredStrips.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <div className="luxury-badge luxury-badge-primary">محتوى مختار ومنظم</div>
              <div className="flex-1 h-px bg-border" />
            </div>
            <FeaturedStrips strips={featuredStrips} />
          </div>
        )}

        <div id="latest" className="space-y-16">
          <FeaturedProgramsSection programs={topPrograms} />

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
      <section id="pathways" className="container px-4">
        <div className="text-center mb-10 space-y-3">
          <div className="luxury-badge luxury-badge-primary mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('مسارات علمية متدرجة', 'Structured Learning Paths')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-headline tracking-tight text-foreground">
            {t('خارطة طريقٍ', 'Structured')} <span className="text-primary">{t('ممنهجة', 'Roadmaps')}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-medium">
            {t('«من أراد العلم فليقرأ القرآن، ومن أراد الفهم فليقرأ سيرة النبي ﷺ، ومن أراد الحكمة فليأخذ من كل فن نصيباً»', 'Guided curriculums designed step-by-step for seekers of beneficial knowledge.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
          {paths.map((path, idx) => {
            const IconComponent = iconMap[path.icon as string] || BookOpen;
            return (
              <div
                key={idx}
                className="luxury-card p-7 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-5 left-5 text-6xl font-black text-foreground/[0.04] select-none pointer-events-none">
                  0{idx + 1}
                </div>

                <div>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-5 border bg-primary/10',
                      path.border || 'border-primary/20'
                    )}
                  >
                    <IconComponent className={cn('w-6 h-6', path.color || 'text-primary')} />
                  </div>

                  <h3 className="text-xl font-black font-headline mb-2.5 text-foreground">{path.title}</h3>
                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed font-medium">
                    {path.desc}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-border/70">
                    <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      منهج المسار
                    </div>
                    {path.parts.map((part, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border bg-muted/60',
                            path.border || 'border-primary/25',
                            path.color || 'text-primary'
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-foreground/90">{part}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full mt-7 h-11 rounded-xl font-black bg-muted hover:bg-primary text-foreground hover:text-primary-foreground border border-border hover:border-primary transition-colors"
                >
                  <Link href={getPathHref(path)} className="flex items-center justify-center gap-2">
                    <span>ابدأ المسار الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. INSPIRATION, TESTIMONIALS & FAQ
      ══════════════════════════════════════════════════════════════════ */}
      <section className="container px-4 space-y-16">
        <div className="max-w-4xl mx-auto">
          <InspirationSlider />
        </div>

        <div>
          <div className="text-center mb-10 space-y-2.5">
            <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tight text-foreground">
              أصوات من رحاب المنصة
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base font-medium">
              أثر الوقف العلمي لا يقاس بالأرقام فحسب، بل بحياة تغيرت وعقول استنارت.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" dir="rtl">
            {testimonials.map((tItem, idx) => (
              <div key={idx} className="p-6 rounded-2xl luxury-card relative flex flex-col justify-between">
                <Quote className="absolute top-5 left-5 w-8 h-8 text-primary/15" />
                <div>
                  <div className="flex gap-1 mb-3.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed mb-5 text-foreground/90 font-medium">«{tItem.quote}»</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-black text-sm text-primary">
                    {tItem.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{tItem.name}</h4>
                    <p className="text-xs text-muted-foreground">{tItem.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="faq" className="max-w-4xl mx-auto">
          <div className="text-center mb-8 space-y-2.5">
            <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tight text-foreground">
              الأسئلة الشائعة
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base font-medium">
              كل ما تحتاج معرفته عن استخدام المنصة ودعم المشروع.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-card rounded-2xl px-6 border border-border overflow-hidden transition-colors hover:border-primary/40"
              >
                <AccordionTrigger className="text-right py-4 font-bold text-base text-foreground hover:no-underline hover:text-primary transition-colors">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-right text-muted-foreground leading-relaxed pb-4 text-sm sm:text-base">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" dir="rtl">
          <div className="lg:col-span-7 rounded-2xl bg-card border border-primary/25 p-7 sm:p-9 flex flex-col justify-between gap-7">
            <div className="space-y-3.5">
              <div className="luxury-badge luxury-badge-primary w-fit">
                <HeartHandshake className="w-4 h-4" />
                <span>{t('ساهم في الأجر', 'Share the Reward')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-tight text-foreground">
                {t('كن جزءاً من رحلة', 'Be part of spreading')} <span className="text-primary">{t('نشر العلم', 'knowledge')}</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
                {t('ساهم في استكمال هذا المشروع الوقفي وتوسيع انتشاره ليصل العلم لكل طالب وراغب. وقفتك اليوم هي صدقة جارية وأجر مستمر.', 'Support this non-profit Islamic endowment so beneficial knowledge reaches every seeker worldwide.')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 px-7 rounded-xl text-sm sm:text-base font-black bg-primary text-primary-foreground"
              >
                <Link href="/donations" prefetch={false} className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{t('ادعم المشروع الآن', 'Support Now')}</span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 rounded-xl text-sm sm:text-base font-bold border-border hover:border-primary/50"
              >
                <Link href="/contact" prefetch={false} className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>{t('تطوع معنا', 'Volunteer')}</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-card border border-border p-7 sm:p-9 flex flex-col justify-between gap-6">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-headline text-foreground">{t('ابقَ على اتصال بكل جديد', 'Stay Updated')}</h3>
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
                  className="flex-1 h-11 px-4 rounded-xl bg-background border border-border text-sm font-bold outline-none"
                />
                <Button type="submit" className="h-11 px-5 rounded-xl font-bold shrink-0 cursor-pointer">
                  <Send className="w-4 h-4 ml-1.5" />
                  <span>اشترك</span>
                </Button>
              </div>
              {newsletterSent && (
                <p className="text-xs font-bold text-emerald-500">تم تسجيل بريدك بنجاح، جزاك الله خيراً.</p>
              )}
            </form>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <span className="text-xs text-muted-foreground font-bold">قنواتنا:</span>
              <Link
                href="/contact"
                aria-label="التواصل عبر الواتساب"
                className="p-2 rounded-xl bg-muted border border-border hover:border-sky-500/40 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-sky-500" />
              </Link>
              <Link
                href="/contact"
                aria-label="التواصل عبر تليجرام"
                className="p-2 rounded-xl bg-muted border border-border hover:border-blue-500/40 transition-colors"
              >
                <Send className="w-4 h-4 text-blue-500" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AboutPlatformModal open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen} />
    </div>
  );
}
