

'use client';

import { HomeSearch } from '@/components/home-search';
import { RecommendedLectures } from '@/components/recommended-lectures';
import { ContinueWatching } from '@/components/continue-listening';
import { SeriesCard } from '@/components/series-card';
import { LectureCard } from '@/components/lecture-card';
import { ProgramCard } from '@/components/program-card';
import { DownloaderModal } from './downloader-modal';
import { SpiritualPrescription } from './spiritual-prescription';
import { DailyChallenges } from './daily-challenges';
import { TasbihCard } from './tasbih-card';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { Marquee } from './marquee';
import { VerseOfTheDay } from './verse-of-the-day';
import { Suspense, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import type { Lecture, Series, Program, HomepageDetailedConfig, ScheduleItem, QAPair, Playlist, ListenHistoryItem, Inspiration, HeroBanner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, ShieldCheck, Smartphone, Search, Zap, Headphones, Users, Music, 
  Globe, Quote, HeartHandshake, Mail, Send, MessageCircle, Layers,
  Library, BookOpenCheck, BookOpen, Sparkles, Heart, Loader2, Star, Play, HandHeart, TriangleAlert, Shield,
  Medal, Trophy, ListMusic, Flame, BookCheck, HelpCircle, GraduationCap
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  ArrowLeft, ShieldCheck, Smartphone, Search, Zap, Headphones, Users, Music,
  Globe, Quote, HeartHandshake, Mail, Send, MessageCircle, Layers,
  BookOpen, Sparkles, Heart, Loader2, Star, Play
};

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PinnedItems } from '@/app/pinned-items';
import { ShortsCarousel } from '@/components/ShortsCarousel';
import { FeaturedStrips } from '@/components/featured-strips';
import { useAppearance } from '@/components/appearance-provider';
import { useUser, useCollection } from '@/firebase';
import { PageIndex } from './home-page-index';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';


// New Component for paginated sections
function PaginatedSection({
  title,
  items,
  renderItem,
  viewAllHref,
  itemsPerPage = 4,
  gridClassName,
}: {
  title: string;
  items: any[] | null;
  renderItem: (item: any, index: number) => React.ReactNode;
  viewAllHref: string;
  itemsPerPage?: number;
  gridClassName?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  if (!items || items.length === 0) {
    if (title === "أحدث المحاضرات") {
      return (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-headline">{title}</h2>
            <Button asChild variant="outline">
              <Link href={viewAllHref}>
                <span>عرض الكل</span>
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Link>
            </Button>
          </div>
          <div className="text-center py-10 text-muted-foreground">
            لا يوجد محتوى لعرضه حالياً في هذا القسم.
          </div>
        </section>
      )
    }
    return null;
  }

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + itemsPerPage, items.length));
  };

  const hasMoreToLoad = visibleCount < items.length;

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-headline">{title}</h2>
        <Button asChild variant="outline">
          <Link href={viewAllHref}>
            <span>عرض الكل</span>
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Link>
        </Button>
      </div>
      <div className={cn("grid gap-8", gridClassName || "grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))]")}>
        {items.slice(0, visibleCount).map((item, index) => renderItem(item, index))}
      </div>
      {hasMoreToLoad && (
        <div className="text-center mt-8">
          <Button onClick={handleShowMore}>تحميل المزيد</Button>
        </div>
      )}
    </section>
  );
}


interface HomePageClientProps {
  latestLectures: Lecture[];
  topPrograms: Program[];
  latestSeries: Series[];
  upcomingLesson?: ScheduleItem | null;
  latestQAPair?: QAPair | null;
  publicPlaylists?: Playlist[];
  homepageConfig?: HomepageDetailedConfig | null;
  stripLectures?: Lecture[];  // Extra lectures fetched server-side for strips
}

// Keywords per strip topic — used to auto-filter from latestLectures
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

export function HomePageClient({ latestLectures, topPrograms, latestSeries, homepageConfig, upcomingLesson, latestQAPair, publicPlaylists, stripLectures = [] }: HomePageClientProps) {
  const { heroImageUrl: customHeroUrl, heroTitle, heroSubtitle, heroBanners } = useAppearance();

  const heroImagePlaceholder = getPlaceholderImage('hero-background');
  const [heroImageUrl, setHeroImageUrl] = useState(customHeroUrl || heroImagePlaceholder?.imageUrl);

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const banners = useMemo(() => {
    if (heroBanners && heroBanners.length > 0) return heroBanners;
    
    // Default single banner if no plural banners defined
    return [{
        imageUrl: heroImageUrl || customHeroUrl || heroImagePlaceholder?.imageUrl || '',
        title: heroTitle || 'العلم الشرعي بين يديك',
        subtitle: heroSubtitle || 'منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.',
        link: undefined
    }] as HeroBanner[];
  }, [heroBanners, heroImageUrl, customHeroUrl, heroTitle, heroSubtitle, heroImagePlaceholder?.imageUrl]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
        setActiveBannerIndex(prev => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const { shorts, regularLectures } = useMemo(() => {
    if (!latestLectures) return { shorts: [], regularLectures: [] };
    const shortsArr: Lecture[] = [];
    const regularLecturesArr: Lecture[] = [];
    latestLectures.forEach(lecture => {
      if (lecture.duration <= 180) {
        shortsArr.push(lecture);
      } else {
        regularLecturesArr.push(lecture);
      }
    });
    return { shorts: shortsArr, regularLectures: regularLecturesArr };
  }, [latestLectures]);

  // Build featured strips — if admin configured strips in Firestore, use those.
  // Otherwise fall back to keyword-based auto-detection from latestLectures.
  const featuredStrips = useMemo(() => {
    if (!latestLectures) return [];

    // Merge latestLectures with stripLectures (strip-specific lectures fetched server-side)
    // Use a Map to deduplicate by ID
    const allAvailableLectures = [...latestLectures];
    const knownIds = new Set(latestLectures.map(l => l.id));
    for (const lec of stripLectures) {
      if (!knownIds.has(lec.id)) {
        allAvailableLectures.push(lec);
        knownIds.add(lec.id);
      }
    }

    if (allAvailableLectures.length === 0) return [];

    const lecturesById = Object.fromEntries(allAvailableLectures.map(l => [l.id, l]));

    // ── Priority 1: Admin-configured strips from Firestore ──
    if (homepageConfig?.featuredStrips?.length) {
      return homepageConfig.featuredStrips.map(strip => {
        const lectures = (strip.lectureIds || [])
          .map(id => lecturesById[id])
          .filter(Boolean) as typeof latestLectures;

        // If configured IDs don't match any loaded lectures, fall back to keyword search
        // using the strip title as the keyword
        if (lectures.length === 0) {
          const titleWords = strip.title.split(' ').filter(w => w.length > 2);
          const matched = latestLectures.filter(lec =>
            titleWords.some(kw =>
              lec.title?.includes(kw) || lec.description?.includes(kw)
            )
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
      }).filter(s => s.lectures.length > 0);
    }

    // ── Priority 2: Auto-detect from STRIP_TOPICS keywords ──
    return STRIP_TOPICS.map(topic => {
      const matched = latestLectures.filter(lec =>
        topic.keywords.some(kw =>
          lec.title?.includes(kw) ||
          lec.description?.includes(kw) ||
          lec.programName?.includes(kw)
        )
      );

      // If no matches by keyword, use 6 latest as fallback
      const lectures = matched.length >= 2 ? matched : latestLectures.slice(0, 6);

      return {
        title: topic.title,
        subtitle: topic.subtitle,
        accentColor: topic.accentColor,
        lectures,
        viewAllHref: topic.viewAllHref,
      };
    }).filter(s => s.lectures.length > 0);
  }, [latestLectures, stripLectures, homepageConfig]);

  const { user } = useUser();
  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: listenHistory } = useCollection<ListenHistoryItem>(listenHistoryPath);
  
  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists } = useCollection<Playlist>(playlistsPath);


  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], ['0%', '30%']);

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
              const highResBanner = data.channelInfo.bannerUrl.replace('=w1060', '=w2120').replace('=w1707', '=w2120');
              setHeroImageUrl(highResBanner);
            }
          }
        } catch (error) {
          console.error("Failed to fetch YouTube banner for hero:", error);
          setHeroImageUrl(heroImagePlaceholder?.imageUrl);
        }
      };
      fetchBanner();
    } else {
      setHeroImageUrl(heroImagePlaceholder?.imageUrl);
    }
  }, [topPrograms, heroImagePlaceholder?.imageUrl, customHeroUrl]);


  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="space-y-16"
    >
      <section id="hero" className="relative z-10 px-4 sm:px-0 pt-2 pb-12">
        <div className="relative w-full h-[70vh] min-h-[550px] max-h-[800px] overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5 group/hero">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeBannerIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                >
                    <motion.div style={{ y: heroY }} className="absolute inset-0 -top-[10%] h-[120%] w-full">
                        <Image
                            src={banners[activeBannerIndex].imageUrl}
                            alt={banners[activeBannerIndex].title || "Banner"}
                            fill
                            className="object-cover image-theme-filter brightness-[0.6] contrast-[1.1] transition-transform duration-[20000ms] ease-linear hover:scale-125"
                            priority
                        />
                    </motion.div>
                    
                    {/* Cinematic Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-[2]" />
                    <div className="absolute inset-0 bg-black/20 z-[1]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] z-[2]" />
                    
                    {/* Content Container */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pt-12 pb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-5xl"
                        >
                            <motion.h1 
                                className="text-5xl md:text-7xl lg:text-9xl font-black mb-6 font-headline tracking-tighter leading-[0.9] italic text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            >
                                <span className="block mb-2 translate-x-4 md:translate-x-8 opacity-90">
                                    {banners[activeBannerIndex].title?.split(' ')[0]}
                                </span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/90 to-primary/40 -translate-x-4 md:-translate-x-8">
                                    {banners[activeBannerIndex].title?.split(' ').slice(1).join(' ')}
                                </span>
                            </motion.h1>
                            
                            <motion.p 
                                className="text-lg md:text-2xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed font-tajawal drop-shadow-md"
                            >
                                {banners[activeBannerIndex].subtitle || heroSubtitle}
                            </motion.p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                {banners[activeBannerIndex].link && (
                                    <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-black bg-primary text-white border-none shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 hover:shadow-primary/40 transition-all duration-500">
                                        <Link href={banners[activeBannerIndex].link!}>استكشف الآن</Link>
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveBannerIndex(idx)}
                        className={cn(
                            "h-1 rounded-full transition-all duration-700",
                            idx === activeBannerIndex ? "w-10 bg-primary" : "w-2.5 bg-white/20 hover:bg-white/40"
                        )}
                    />
                ))}
            </div>

            {/* Knowledge Ticker */}
            <div className="absolute bottom-20 inset-x-0 z-20 h-12 flex items-center overflow-hidden pointer-events-none opacity-40">
                <Marquee speed={40} pauseOnHover={false}>
                    {[
                        "فقه العبادات", "تزكية النفوس", "عقيدة أهل السنة", "السيرة النبوية", 
                        "أصول الفقه", "علوم القرآن", "الرد على الشبهات", "مصطلح الحديث"
                    ].map((topic, i) => (
                        <div key={i} className="flex items-center gap-4 px-10">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            <span className="text-sm font-black font-headline tracking-widest text-white uppercase">{topic}</span>
                        </div>
                    ))}
                </Marquee>
            </div>

            {/* Search Anchor Integrated into Card Bottom */}
            <div className="absolute bottom-0 inset-x-0 z-30 pb-4 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto backdrop-blur-3xl bg-zinc-950/40 p-2 rounded-full border border-white/5 shadow-2xl transition-transform hover:scale-[1.02] duration-500 ring-1 ring-white/5">
                    <HomeSearch />
                </div>
            </div>
        </div>
      </section>

      {/* Premium Quick Access Categories */}
      <section id="categories" className="container px-4 mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {[
            { 
                name: "العقيدة", 
                icon: ShieldCheck, 
                color: "text-blue-400", 
                bg: "from-blue-500/20 to-transparent", 
                border: "border-blue-500/20",
                shadow: "shadow-blue-500/5",
                href: "/aqeedah" 
            },
            { 
                name: "الفقه", 
                icon: Layers, 
                color: "text-emerald-400", 
                bg: "from-emerald-500/20 to-transparent", 
                border: "border-emerald-500/20",
                shadow: "shadow-emerald-500/5",
                href: "/search?category=الفقه" 
            },
            { 
                name: "الحديث", 
                icon: BookOpen, 
                color: "text-amber-400", 
                bg: "from-amber-500/20 to-transparent", 
                border: "border-amber-500/20",
                shadow: "shadow-amber-500/5",
                href: "/hadith" 
            },
            { 
                name: "التفسير", 
                icon: Sparkles, 
                color: "text-purple-400", 
                bg: "from-purple-500/20 to-transparent", 
                border: "border-purple-500/20",
                shadow: "shadow-purple-500/5",
                href: "/search?category=التفسير" 
            },
            { 
                name: "السيرة", 
                icon: BookOpen, 
                color: "text-rose-400", 
                bg: "from-rose-500/20 to-transparent", 
                border: "border-rose-500/20",
                shadow: "shadow-rose-500/5",
                href: "/seerah" 
            },
            { 
                name: "القصص", 
                icon: Sparkles, 
                color: "text-indigo-400", 
                bg: "from-indigo-500/20 to-transparent", 
                border: "border-indigo-500/20",
                shadow: "shadow-indigo-500/5",
                href: "/stories" 
            },
            { 
                name: "الأذكار", 
                icon: Headphones, 
                color: "text-cyan-400", 
                bg: "from-cyan-500/20 to-transparent", 
                border: "border-cyan-500/20",
                shadow: "shadow-cyan-500/5",
                href: "/adhkar" 
            },
            { 
                name: "الشبهات", 
                icon: Shield, 
                color: "text-indigo-500", 
                bg: "from-indigo-600/20 to-transparent", 
                border: "border-indigo-600/20",
                shadow: "shadow-indigo-600/5",
                href: "/shubuhat" 
            },
            { 
                name: "الكتب", 
                icon: Library, 
                color: "text-amber-500", 
                bg: "from-amber-600/20 to-transparent", 
                border: "border-amber-600/20",
                shadow: "shadow-amber-600/5",
                href: "/books",
                image: "/images/book_card_cover.png"
            },
            { 
                name: "ما لا يسع جهله", 
                icon: BookOpenCheck, 
                color: "text-emerald-500", 
                bg: "from-emerald-600/20 to-transparent", 
                border: "border-emerald-600/20",
                shadow: "shadow-emerald-600/5",
                href: "/essential-knowledge",
                image: "/images/essential_knowledge_cover.png"
            }
          ].map((cat, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
            >
                <Link
                href={cat.href}
                className={cn(
                    "relative flex flex-col items-center justify-center p-10 rounded-[3rem] border backdrop-blur-xl transition-all duration-500 group overflow-hidden",
                    "bg-gradient-to-br bg-white/[0.01]",
                    cat.bg, cat.border, cat.shadow,
                    "hover:-translate-y-2 hover:border-white/10"
                )}
                >
                <div className={cn(
                    "p-6 rounded-2xl bg-white/5 border border-white/10 mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative",
                    cat.color,
                    cat.image && "p-0 overflow-hidden aspect-[3/4] w-24 flex items-center justify-center bg-black/40 border-white/20 shadow-2xl"
                )}>
                    {cat.image ? (
                        <Image 
                            src={cat.image} 
                            alt={cat.name} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <cat.icon size={32} strokeWidth={1.5} />
                    )}
                </div>
                <span className="font-black text-lg tracking-widest text-white/70 group-hover:text-white uppercase transition-colors">{cat.name}</span>
                </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📖 Verse of the Day */}
      <VerseOfTheDay />

      {/* ══════ Islamic Content Hub ══════ */}
      <section id="hub" className="container px-4 py-16 relative overflow-hidden">
        {/* Background Decorative Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none -z-10" />

        <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 fill-emerald-400" />
              محتوى إسلامي متكامل
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">كنوز إسلامية <span className="text-emerald-400">بين يديك</span></h2>
            <p className="text-white/30 text-lg mt-3 max-w-xl font-medium">أذكار، أحاديث، أدعية وآيات قرآنية — رحلة إيمانية شاملة في تطبيق واحد.</p>
          </motion.div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">تحديثات يومية</span>
                <span className="text-white/60 font-bold">محتوى متجدد</span>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 animate-pulse">
                <Heart className="w-6 h-6 fill-current" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Featured Bento Card (Quran) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="md:col-span-2 lg:col-span-2 lg:row-span-2"
          >
            <Link
              href="/quran"
              className="group relative flex flex-col h-full min-h-[400px] p-10 rounded-[3rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mb-8 shadow-2xl">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="mt-auto">
                  <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-3">الركن الأعظم</p>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tighter">آيات قرآنية مختارة للتدبّر واليقين</h3>
                  <p className="text-white/40 text-lg leading-relaxed max-w-md">تصفح مجموعات مختارة من كلام الله المقسم حسب المواضيع الإيمانية مع التفسير والتدبر.</p>
                  <div className="mt-8 inline-flex items-center gap-3 text-white font-black group/link">
                    ابدأ التدبر الآن 
                    <ArrowLeft className="w-5 h-5 group-hover/link:-translate-x-2 transition-transform text-emerald-400" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Other Hub Items */}
          {[
            {
              href: '/adhkar',
              label: 'الأذكار',
              sub: 'حصن المسلم اليومي من أذكار الصباح والمساء.',
              icon: Headphones,
              color: 'text-amber-400',
              bg: 'from-amber-500/10 to-transparent',
              border: 'border-amber-500/20 hover:border-amber-500/40',
              iconBg: 'bg-amber-500/10',
            },
            {
              href: '/hadith',
              label: 'الحديث',
              sub: 'أحاديث نبوية شريفة من أصح المصادر والكتب.',
              icon: BookOpen,
              color: 'text-violet-400',
              bg: 'from-violet-500/10 to-transparent',
              border: 'border-violet-500/20 hover:border-violet-500/40',
              iconBg: 'bg-violet-500/10',
            },
            {
              href: '/dua',
              label: 'الأدعية',
              sub: 'أدعية مأثورة ومعثور عليها من هدي النبوة.',
              icon: HandHeart,
              color: 'text-rose-400',
              bg: 'from-rose-500/10 to-transparent',
              border: 'border-rose-500/20 hover:border-rose-500/40',
              iconBg: 'bg-rose-500/10',
            },
            {
              href: '/muhlikat',
              label: 'المهلكات',
              sub: 'تشخيص أمراض القلوب وكيفية علاجها وتزكيتها.',
              icon: TriangleAlert,
              color: 'text-red-400',
              bg: 'from-red-500/10 to-transparent',
              border: 'border-red-500/20 hover:border-red-500/40',
              iconBg: 'bg-red-500/10',
            },
            {
              href: '/aqeedah',
              label: 'العقيدة',
              sub: 'شرح مبسط لأركان الإيمان الستة وأصول الاعتقاد.',
              icon: Shield,
              color: 'text-indigo-400',
              bg: 'from-indigo-500/10 to-transparent',
              border: 'border-indigo-500/20 hover:border-indigo-500/40',
              iconBg: 'bg-indigo-500/10',
              className: 'lg:col-span-2'
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(item.className)}
            >
              <Link
                href={item.href}
                className={cn(
                  'group relative h-full flex flex-col gap-4 p-8 rounded-[2.5rem] border bg-gradient-to-br backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl',
                  item.bg, item.border
                )}
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6', item.iconBg, item.border)}>
                  <item.icon className={cn('w-7 h-7', item.color)} />
                </div>
                <div>
                  <h4 className={cn('font-black text-xl mb-2', item.color)}>{item.label}</h4>
                  <p className="text-white/40 text-sm leading-relaxed font-medium">{item.sub}</p>
                </div>
                <ArrowLeft className={cn('w-5 h-5 absolute bottom-8 left-8 opacity-20 group-hover:opacity-100 transition-all group-hover:-translate-x-2', item.color)} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🧭 Additional Sections (Discovery Zone) */}
      <section className="container px-4 py-16">
        <div className="mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <h2 className="text-xl font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">أقسام إضافية</h2>
            <div className="h-px flex-1 bg-white/5" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
                { href: "/badges", label: "الأوسمة", icon: Medal, color: "text-amber-400" },
                { href: "/adhkar", label: "الأذكار", icon: Headphones, color: "text-blue-400" },
                { href: "/hadith", label: "الحديث", icon: BookOpen, color: "text-emerald-400" },
                { href: "/dua", label: "الأدعية", icon: HandHeart, color: "text-rose-400" },
                { href: "/quran", label: "القرآن", icon: Layers, color: "text-purple-400" },
                { href: "/muhlikat", label: "المهلكات", icon: TriangleAlert, color: "text-red-400" },
                { href: "/shubuhat", label: "الشبهات", icon: Shield, color: "text-indigo-400" },
                { href: "/essentials", label: "الأساسيات", icon: BookCheck, color: "text-cyan-400" },
                { href: "/aqeedah", label: "العقيدة", icon: ShieldCheck, color: "text-sky-400" },
                { href: "/curriculums", label: "المناهج", icon: GraduationCap, color: "text-orange-400" },
                { href: "/leaderboard", label: "الصدارة", icon: Trophy, color: "text-yellow-400" },
                { href: "/playlists", label: "القوائم", icon: ListMusic, color: "text-pink-400" },
                { href: "/books", label: "الكتب", icon: Library, color: "text-amber-500" },
                { href: "/challenges", label: "التحديات", icon: Flame, color: "text-orange-500" },
                { href: "/accountability", label: "المحاسبة", icon: BookCheck, color: "text-emerald-500" },
                { href: "/qa", label: "سؤال وجواب", icon: HelpCircle, color: "text-indigo-500" },
            ].map((section, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    viewport={{ once: true }}
                    transition={{ delay: (idx % 6) * 0.05 }}
                >
                    <Link
                        href={section.href}
                        className="flex flex-col items-center justify-center p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group h-full"
                    >
                        <div className={cn("p-4 rounded-2xl bg-white/5 mb-3 group-hover:scale-110 transition-transform", section.color)}>
                            <section.icon size={24} />
                        </div>
                        <span className="text-xs font-black text-white/50 group-hover:text-white transition-colors text-center">{section.label}</span>
                    </Link>
                </motion.div>
            ))}
        </div>
      </section>

      {/* ══════ Spiritual Prescription Tool ══════ */}
      <SpiritualPrescription />


      {/* 🎯 Challenges & Tasbih Section */}
      <section className="container px-4 py-16">
        <div className="flex flex-col gap-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <DailyChallenges />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <TasbihCard />
          </motion.div>
        </div>
      </section>

      {/* Learning Paths / Curriculum Highlights — MASTERCLASS ROADMAPS */}
      <section id="pathways" className="py-32 container px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10" />
        
        <div className="text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
            <Sparkles className="w-3.5 h-3.5" /> مسارات متكاملة
          </div>
          <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white drop-shadow-2xl">
            خارطة طريقٍ <span className="text-primary">ممنهجة</span>
          </h2>
          <p className="text-xl text-white/30 max-w-2xl mx-auto font-medium leading-relaxed italic text-center">
            "من أراد العلم فليقرأ القرآن، ومن أراد الفهم فليقرأ سيرة النبي ﷺ، ومن أراد الحكمة فليأخذ من كل فن نصيباً"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {(homepageConfig?.paths?.length ? homepageConfig.paths : [
            {
              title: "تأسيس طالب العلم",
              desc: "البداية الصحيحة لدراسة المتون العلمية والمقدمات الضرورية في كل فن.",
              parts: ["متن الآجرومية", "الأربعين النووية", "كتاب التوحيد"],
              icon: "BookOpen",
              color: "text-blue-400",
              accent: "bg-blue-500/10 border-blue-500/20"
            },
            {
              title: "مسار العبادة والقلوب",
              desc: "رحلة إيمانية تركز على تزكية النفس، السيرة النبوية، وفقه العبادات اليومية.",
              parts: ["فقه الصلاة", "تهذيب الأخلاق", "سيرة النبوة"],
              icon: "HeartHandshake",
              color: "text-rose-400",
              accent: "bg-rose-500/10 border-rose-500/20"
            },
            {
              title: "الردود والشبهات",
              desc: "حصن نفسك بعلم متين للرد على الشبهات المعاصرة بناءً على أصول أهل السنة.",
              parts: ["تنبيه الغبي", "ردود على الإلحاد", "أصول المنهج"],
              icon: "ShieldCheck",
              color: "text-emerald-400",
              accent: "bg-emerald-500/10 border-emerald-500/20"
            }
          ]).map((path: any, idx) => {
            const IconComponent = iconMap[path.icon as string] || BookOpen;
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className={cn(
                  "relative p-10 rounded-[3.5rem] border bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl transition-all duration-700 hover:-translate-y-4 hover:bg-white/[0.05] group overflow-hidden",
                  path.accent || "bg-primary/5 border-primary/10"
                )}
              >
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute top-10 left-10 text-[10rem] font-black text-white/[0.02] leading-none select-none pointer-events-none">{idx + 1}</div>
                
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 group-hover:rotate-6 border border-white/5", path.accent || "bg-primary/10")}>
                   <IconComponent className={cn("w-10 h-10", path.color || "text-primary")} />
                </div>
                
                <h3 className="text-3xl font-black font-headline mb-4 text-white tracking-tight">{path.title}</h3>
                <p className="text-white/40 text-base mb-10 leading-relaxed font-medium">{path.desc}</p>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">منهج المسار</div>
                  {path.parts.map((p: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 group/step">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border transition-colors", path.accent || "border-primary/20", path.color || "text-primary")}>
                         {i + 1}
                      </div>
                      <span className="text-white/60 text-sm font-bold group-hover/step:text-white transition-colors">{p}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-12 h-16 rounded-[1.5rem] font-black text-white bg-white/5 border border-white/10 hover:bg-primary hover:border-primary hover:text-white transition-all duration-500 gap-3 group/btn">
                  ابدأ الرحلة الآن 
                  <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-2 transition-transform" />
                </Button>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Merits / Landing Page Features — PREMIUM BENTO GRID */}
      <section id="merits" className="relative py-32 overflow-hidden">
        {/* Cinematic Background Decoration */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 blur-[150px] rounded-full -translate-x-1/2 -z-10" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2 -z-10" />
        
        <div className="container relative z-10 px-4">
          <div className="text-center mb-20 space-y-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
            >
               <Sparkles className="w-3.5 h-3.5" /> لماذا يختارون وقفة
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white drop-shadow-2xl">
              لماذا <span className="text-primary italic">وقفة</span>؟ ✨
            </h2>
            <p className="text-xl text-white/30 max-w-2xl mx-auto font-medium leading-relaxed">
              نجمَع بين أصالة المحتوى الشرعي وعالمية التطوير التقني، لنقدم لك صرحاً علمياً يليق بثوابتنا.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[100px]">
             {[
               {
                 icon: "ShieldCheck",
                 title: "محتوى شرعي موثوق",
                 desc: "نخبة من المشايخ والعلماء لضمان تقديم العلم الشرعي بوسطية واعتدال وفق منهج أهل السنة.",
                 color: "text-blue-400",
                 iconBg: "bg-blue-500/10",
                 border: "border-blue-500/20",
                 glow: "group-hover:shadow-blue-500/20",
                 className: "md:col-span-3 lg:col-span-8 lg:row-span-3",
                 featured: true
               },
               {
                 icon: "Smartphone",
                 title: "تجربة مستخدم حديثة",
                 desc: "واجهة سلسة تدعم جميع الأجهزة لراحتك الكاملة.",
                 color: "text-purple-400",
                 iconBg: "bg-purple-500/10",
                 border: "border-purple-500/20",
                 glow: "group-hover:shadow-purple-500/20",
                 className: "md:col-span-3 lg:col-span-4 lg:row-span-3"
               },
               {
                 icon: "Zap",
                 title: "سرعة وتفاعلية فائقة",
                 desc: "مشغل فيديو وصوت ذكي يواكب تطلعاتك.",
                 color: "text-amber-400",
                 iconBg: "bg-amber-500/10",
                 border: "border-amber-500/20",
                 glow: "group-hover:shadow-amber-500/20",
                 className: "md:col-span-3 lg:col-span-4 lg:row-span-3"
               },
               {
                 icon: "Search",
                 title: "محرك بحث ذكي",
                 desc: "صل لما تريد في ثوانٍ من بين آلاف الدروس والمحاضرات.",
                 color: "text-emerald-400",
                 iconBg: "bg-emerald-500/10",
                 border: "border-emerald-500/20",
                 glow: "group-hover:shadow-emerald-500/20",
                 className: "md:col-span-3 lg:col-span-5 lg:row-span-3"
               },
               {
                 icon: "Headphones",
                 title: "جودة صوت نقية",
                 desc: "استمتع بأفضل نقاء صوتي لتجربة استماع مريحة.",
                 color: "text-rose-400",
                 iconBg: "bg-rose-500/10",
                 border: "border-rose-500/20",
                 glow: "group-hover:shadow-rose-500/20",
                 className: "md:col-span-6 lg:col-span-3 lg:row-span-3"
               }
             ].map((feature, idx) => {
               const IconComponent = iconMap[feature.icon as string] || Star;
               return (
                 <motion.div
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className={cn(
                     "group relative rounded-[2.5rem] border bg-white/[0.02] backdrop-blur-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.04]",
                     feature.border,
                     feature.className
                   )}
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                   <div className="p-10 flex flex-col h-full">
                      <div className={cn("inline-flex p-5 rounded-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500", feature.iconBg, feature.border)}>
                        <IconComponent className={cn("w-10 h-10", feature.color)} />
                      </div>
                      <h3 className={cn("font-black mb-4 tracking-tighter text-white", feature.featured ? "text-3xl lg:text-4xl" : "text-2xl")}>{feature.title}</h3>
                      <p className={cn("text-white/40 leading-[1.8] font-medium", feature.featured ? "text-lg lg:text-xl" : "text-base")}>
                        {feature.desc}
                      </p>
                      
                      <div className="mt-auto pt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/10 group-hover:text-primary transition-colors">
                        إتقان في التفاصيل <ArrowLeft className="w-4 h-4" />
                      </div>
                   </div>
                 </motion.div>
               )
             })}
          </div>
        </div>
      </section>

      {/* App Showcase / Offline Mode — CINEMATIC UPGRADE */}
      <section id="app" className="py-32 relative overflow-hidden">
        <div className="container px-4">
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-[4rem] p-8 md:p-20 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -z-10" />
            <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] rounded-full -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                whileInView={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                  <Smartphone className="w-4 h-4" /> تطبيق عابر للمنصات
                </div>
                <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tighter leading-[0.95] text-white">
                  عِلمٌ راسخٌ.. <br /> <span className="text-primary italic">مَعك أينما كنت!</span>
                </h2>
                <p className="text-xl text-white/40 leading-relaxed max-w-xl font-medium">
                  حوّل "وقفة" إلى تطبيق متكامل على هاتفك بضغطة زر واحدة. استمتع بمميزات الاستماع دون اتصال والتحميل المباشر لتواكب رحلتك العلمية في كل الظروف.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {[
                    { t: "تثبيت فوري بضغطة", d: "أضف الموقع لشاشتك الرئيسية كأي تطبيق أصلي." },
                    { t: "استماع بلا إنترنت", d: "تحكم كامل في الملفات المحملة وقائمة الاستماع." },
                    { t: "تنبيهات فورية", d: "كن أول من يحضر المجالس والدروس الجديدة." },
                    { t: "تزامن سحابي", d: "اكمل من حيث توقفت على أي جهاز آخر." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                      <div className="mt-1 w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base mb-1">{item.t}</h4>
                        <p className="text-white/30 text-xs leading-relaxed">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6">
                   <Button size="lg" className="rounded-2xl h-16 px-10 bg-white text-black font-black text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
                      اكتشف طريقة التثبيت
                   </Button>
                </div>
              </motion.div>

              <div className="relative group perspective-1000">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                  whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative z-10"
                >
                  <div className="relative aspect-[9/19] max-w-[320px] mx-auto rounded-[3.5rem] border-[12px] border-[#151515] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden bg-[#0A0A0A]">
                    <div className="absolute top-0 inset-x-0 h-7 bg-[#151515]" /> {/* Notch area */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 rounded-full blur-sm" />
                    
                    {/* Mock App UI */}
                    <div className="p-6 pt-12 space-y-8">
                       <div className="flex justify-between items-center">
                          <div className="h-10 w-10 bg-primary/20 rounded-xl" />
                          <div className="h-6 w-24 bg-white/5 rounded-full" />
                       </div>
                       <div className="space-y-4">
                          <div className="h-40 w-full bg-white/5 rounded-3xl" />
                          <div className="h-6 w-3/4 bg-white/10 rounded-full" />
                          <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="h-32 bg-white/5 rounded-2xl" />
                          <div className="h-32 bg-white/5 rounded-2xl" />
                       </div>
                    </div>

                    {/* Overlay Player Mockup */}
                    <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-primary/40 animate-pulse" />
                       <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-full bg-white/10 rounded-full" />
                          <div className="h-1.5 w-1/2 bg-white/5 rounded-full" />
                       </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements with better styling */}
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -right-12 p-6 bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 z-20"
                  >
                    <Headphones className="w-10 h-10 text-primary" />
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full border-4 border-black" />
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-10 -left-12 p-6 bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 z-20"
                  >
                    <Zap className="w-10 h-10 text-amber-500" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics — CINEMATIC INFOGRAPHICS */}
      <section className="py-40 relative px-4">
        {/* Background Animation Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-primary/5 blur-[200px] rounded-full pointer-events-none z-0" />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-8">
            {[
              { label: "محاضرة علمية", value: "3,500+", icon: Music, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "مستمع نشط", value: "12,000+", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "برنامج دعوي", value: "85+", icon: Globe, color: "text-rose-400", bg: "bg-rose-500/10" },
              { label: "ساعة استماع", value: "150K+", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                className="relative group p-12 rounded-[3.5rem] bg-white/[0.01] backdrop-blur-3xl border border-white/5 transition-all duration-700 hover:bg-white/[0.04] hover:-translate-y-4 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* Dynamic Background Circle */}
                <div className={cn("absolute -bottom-10 -left-10 w-40 h-40 blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-1000", stat.bg)} />
                
                <div className={cn("inline-flex p-6 rounded-[2rem] mb-10 transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12 group-hover:shadow-xl border border-white/5", stat.bg)}>
                  <stat.icon className={cn("w-12 h-12", stat.color)} />
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-5xl lg:text-7xl font-black font-headline tracking-tighter text-white mb-4 italic"
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-white/20 text-xs font-black uppercase tracking-[0.4em] mb-2 group-hover:text-primary transition-colors">إحصائيات المنصة</div>
                <div className="text-white/60 font-bold text-lg">{stat.label}</div>
                
                <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-40 transition-all duration-1000 group-hover:scale-[50] blur-[1px]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 📜 Compact Premium Inspiration Slider */}
      <section className="py-16 container px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto">
          <InspirationSlider />
        </div>
      </section>

      <div className="container py-12 flex flex-col gap-16 lg:gap-24">

        {/* User-specific & Promoted Content */}
        <div className="space-y-16">
          <Suspense>
            <PinnedItems />
          </Suspense>
          <Suspense>
            <ContinueWatching />
          </Suspense>
        </div>

        {/* Discovery & Recommended (distinct section with subtle glass background) */}
        <div className="relative py-16 px-4 md:px-10 rounded-[3rem] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent border border-border/50 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 space-y-16">
            <Suspense>
              <RecommendedLectures />
            </Suspense>
            <div className="py-4 border-t border-border/40" />
            <ShortsCarousel shorts={shorts} />
          </div>
        </div>

        {/* ✨ Featured Topic Strips */}
        {featuredStrips.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-border/80 to-transparent" />
              <div className="px-5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                محتوى مختار ومنظم
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-border/80 to-transparent" />
            </div>
            <FeaturedStrips strips={featuredStrips} />
          </div>
        )}

        {/* Channel Categories / Browsing */}
        <div id="latest" className="space-y-20 mt-4">
          <PaginatedSection
            title="أبرز البرامج 🎙️"
            items={topPrograms}
            viewAllHref="/programs"
            itemsPerPage={4}
            renderItem={(item, index) => <ProgramCard program={item} index={index} key={item.id} />}
          />

          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

          <PaginatedSection
            title="أحدث المحاضرات 🎥"
            items={regularLectures}
            viewAllHref="/lectures"
            itemsPerPage={3}
            gridClassName="lg:grid-cols-3"
            renderItem={(item, index) => (
              <LectureCard 
                lecture={item} 
                index={index} 
                key={item.id} 
                listenHistory={listenHistory || undefined}
                playlists={playlists || undefined}
              />
            )}
          />

          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

          <PaginatedSection
            title="أحدث السلاسل 📚"
            items={latestSeries}
            viewAllHref="/series"
            itemsPerPage={3}
            gridClassName="lg:grid-cols-3"
            renderItem={(item, index) => <SeriesCard series={item} index={index} key={item.id} />}
          />
        </div>

        {/* Testimonials / Impact Section */}
        <section className="py-24 border-y border-border/40">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black font-headline tracking-tighter">أصوات من رحيب المنصة</h2>
            <p className="text-muted-foreground">أثر الوقف العلمي لا يقاس بالأرقام فحسب، بل بحياة تغيرت وعقول استنارت.</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-8">
            {[
              { name: "أحمد العتيبي", r: "طالب علم", q: "منصة وقفة وفرت علي عناء البحث الطويل. التنظيم هنا يجعلك تشعر أن العلم أصبح في متناول يدك دائماً." },
              { name: "سارة محمد", r: "باحثة ماجستير", q: "أفضل ميزة هي الاستماع دون إنترنت. في المواصلات أو السفر، رفيقي الوحيد هو محاضرات وقفة." },
              { name: "محمد خالد", r: "محاضر جامعي", q: "المحتوى هنا منتقى بعناية بالغة. الثقة في المشايخ هي ما يجعل هذه المنصة هي الأولى لي ولطلابي." }
            ].map((t, idx) => (
              <div key={idx} className="p-8 rounded-[2rem] bg-card/60 border border-border/50 relative group hover:shadow-xl transition-all">
                <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/10 transition-transform group-hover:scale-110" />
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
                </div>
                <p className="text-lg leading-relaxed mb-6 italic text-foreground/90">"{t.q}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-primary/50 flex items-center justify-center font-bold text-lg">{t.name[0]}</div>
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.r}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

        {/* Frequently Asked Questions (FAQ) */}
        <section id="faq" className="py-24 container px-4 max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">الأسئلة الشائعة</h2>
            <p className="text-muted-foreground text-lg italic">كل ما تحتاج معرفته عن استخدام المنصة ودعم المشروع.</p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {(homepageConfig?.faqs?.length ? homepageConfig.faqs : [
              { q: "هل المنصة مجانية بالكامل؟", a: "نعم، كافة الدروس والمحاضرات والمميزات التقنية على منصة وقفة مجانية ومتاحة للجميع كوقف لله سبحانه وتعالى." },
              { q: "كيف يمكنني استخدام ميزة الاستماع دون إنترنت؟", a: "بمجرد تثبيت المنصة كتطبيق PWA على هاتفك، سيتم حفظ المحاضرات التي تستمع إليها تلقائياً في ذاكرة التطبيق، أو يمكنك النقر على أيقونة الحفظ المتوفرة." },
              { q: "ما هو أفضل مسار للبدء بالنسبة للمبتدئين؟", a: "ننصح بشدة بالبدء بـ 'مسار تأسيس طالب العلم' المتوفر في قسم المسارات المقترحة، حيث يركز على المتون الأولية في العقيدة والفقه واللغة." },
              { q: "كيف يمكنني المساهمة في تطوير الموقع؟", a: "يمكنك المساهمة من خلال التبرع المادي عبر قسم التبرعات، أو التطوع التقني من خلال صفحة 'التواصل'، أو بمجرد نشر رابط الموقع ليعم النفع." }
            ]).map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-none bg-card/60 backdrop-blur-md rounded-2xl px-6 border border-border/50 overflow-hidden shadow-sm transition-all hover:bg-card/80">
                <AccordionTrigger className="text-right py-6 font-bold text-lg hover:no-underline hover:text-primary transition-colors">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-right text-muted-foreground leading-relaxed pb-6 text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 relative px-4 md:px-0">
          <div className="relative rounded-[3rem] bg-card/40 backdrop-blur-2xl border border-border/50 p-10 md:p-16 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 group hover-glow frosted-glass mx-auto max-w-6xl w-full">
            <div className="absolute top-0 right-[-10%] w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] animate-blob pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[20rem] h-[20rem] bg-emerald-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000 pointer-events-none" />
            <div className="relative z-10 space-y-6 max-w-xl text-center md:text-right">
              <div className="inline-flex p-4 rounded-3xl bg-primary/10 border border-primary/20 shadow-inner mb-2 group-hover:scale-110 transition-transform duration-500">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">ابقَ على اتصال بكل جديد</h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">اشترك في قائمتنا البريدية لتصلك أحدث المحاضرات والسلاسل العلمية فور صدورها.</p>
            </div>
            <div className="relative z-10 w-full max-w-md mx-auto md:mx-0">
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex-grow">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    className="w-full h-16 pr-12 pl-4 rounded-2xl bg-background/50 backdrop-blur-md border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none font-bold placeholder:font-medium"
                  />
                </div>
                <Button size="lg" className="h-16 px-8 rounded-2xl font-bold shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.5)] btn-magnetic bg-primary text-primary-foreground shrink-0 cursor-pointer">
                  <Send className="w-5 h-5 ml-2" /> اشترك
                </Button>
              </form>
              <div className="mt-8 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                <p className="text-sm text-muted-foreground font-bold">أو عبر المنصات الاجتماعية:</p>
                <Link href="#" className="p-3 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all group/icon cursor-pointer hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                  <MessageCircle className="w-5 h-5 text-sky-500 group-hover/icon:scale-110 transition-transform" />
                </Link>
                <Link href="#" className="p-3 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-blue-600/10 hover:border-blue-600/30 transition-all group/icon cursor-pointer hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <Send className="w-5 h-5 text-blue-600 group-hover/icon:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Community CTA */}
        <section className="py-12 relative px-4 md:px-0">
          <div className="rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-primary/20 p-12 md:p-20 text-foreground relative overflow-hidden group hover-glow frosted-glass mx-auto max-w-6xl w-full">
            <div className="absolute top-[0%] right-[0%] w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] group-hover:bg-primary/30 group-hover:scale-110 animate-blob transition-all duration-1000 pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[35rem] h-[35rem] bg-secondary/20 rounded-full blur-[120px] animate-blob animation-delay-2000 pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-right">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold shadow-inner">
                  <HeartHandshake className="w-5 h-5 animate-pulse" /> ساهم في الأجر
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-primary drop-shadow-sm">
                  كن جزءاً من رحلة نشر العلم ❤️
                </h2>
                <p className="text-xl text-muted-foreground font-bold leading-relaxed">
                  ساهم في استكمال هذا المشروع وتوسيع انتشاره ليصل العلم لكل طالب وراغب. وقفتك اليوم هي أجر مستمر.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 shrink-0 mx-auto lg:mx-0 min-w-max">
                <Button asChild size="lg" className="h-16 px-10 rounded-2xl text-lg font-black shadow-2xl btn-magnetic animate-pulse-subtle bg-primary text-primary-foreground hover:bg-primary cursor-pointer w-full sm:w-auto">
                  <Link href="/donations" className="flex items-center gap-3">
                    <Heart className="w-6 h-6 fill-current" />
                    ادعم المشروع الآن
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-lg font-bold border-primary/40 text-foreground hover:bg-primary/10 hover:border-primary/60 btn-magnetic cursor-pointer w-full sm:w-auto backdrop-blur-sm">
                  <Link href="/contact" className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    تطوع معنا
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <PageIndex />
      </motion.div>
  );
}

function InspirationSlider() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const { data: remoteQuotes, isLoading } = useCollection<Inspiration>('inspiration', {
    orderBy: ['createdAt', 'desc']
  });

  const fallbackQuotes = [
    {
      id: 'f1',
      text: '"إنما الأعمالُ بالنياتِ، وإنما لكلِّ امرئٍ ما نَوى"',
      author: 'عمر بن الخطاب',
      title: 'رواه البخاري ومسلم',
      type: 'hadith'
    },
    {
      id: 'f2',
      text: '"من سلَك طريقًا يلتَمِسُ فيه علمًا، سهَّل اللهُ له به طريقًا إلى الجنةِ"',
      author: 'أبو هريرة',
      title: 'رواه مسلم',
      type: 'hadith'
    },
    {
      id: 'f3',
      text: '"العلمُ صيدٌ والكتابةُ قيدُه ... قَيِّدْ صيودَكَ بالحبالِ الواثقَة"',
      author: 'الإمام الشافعي',
      title: 'رحمه الله تعالى',
      type: 'quote'
    }
  ];

  const quotes = remoteQuotes?.length ? remoteQuotes : (isLoading ? [] : (fallbackQuotes as any[]));

  useEffect(() => {
    if (isHovered || !quotes.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [quotes.length, isHovered]);

  const next = () => setIndex((prev) => (prev + 1) % quotes.length);
  const prev = () => setIndex((prev) => (prev - 1 + quotes.length) % quotes.length);

  if (isLoading && !quotes.length) {
      return (
          <div className="h-64 flex items-center justify-center bg-white/5 rounded-[3rem] animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
      )
  }

  if (!quotes.length) return null;

  const current = quotes[index];
  const Icon = current.type === 'hadith' ? Sparkles : current.type === 'quote' ? Quote : BookOpen;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      viewport={{ once: true }}
      className="group relative rounded-[2.5rem] border border-white/5 p-10 md:p-14 overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-primary/20 bg-[#080808]/40 backdrop-blur-3xl"
    >
      {/* 🕯️ Textured Cinema Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] " />
      
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
            x: isHovered ? [0, 10, 0] : 0
          }} 
          transition={{ duration: 20, repeat: Infinity }} 
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/20 rounded-full blur-[100px]" 
        />
      </div>

      {/* Manual Navigation Arrows */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={prev} className="pointer-events-auto opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-all rounded-full bg-white/5 h-12 w-12 border border-white/10">
          <ArrowLeft className="w-6 h-6 rotate-180" />
        </Button>
        <Button variant="ghost" size="icon" onClick={next} className="pointer-events-auto opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-all rounded-full bg-white/5 h-12 w-12 border border-white/10">
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-14"
          dir="rtl"
        >
          <div className="shrink-0 relative group-hover:scale-110 transition-transform duration-700">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="w-16 h-16 md:w-20 md:h-20 bg-background/50 border border-white/10 rounded-[1.5rem] flex items-center justify-center relative z-10 shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <Icon className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="flex-1 space-y-6 text-center md:text-right">
            <p className="text-xl md:text-2xl lg:text-3xl font-headline leading-relaxed font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
              {current.text}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-5">
              <div className="h-[1px] w-10 bg-gradient-to-l from-primary/50 to-transparent" />
              <div className="flex flex-col">
                <span className="text-lg md:text-xl text-primary font-black font-headline tracking-tighter">{current.author}</span>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">{current.title}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {quotes.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={cn(
                "h-1.5 rounded-full transition-all duration-700 relative overflow-hidden",
                i === index ? "w-10 bg-primary/20" : "w-3 bg-white/5 hover:bg-white/10"
            )} 
          >
            {i === index && (
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isHovered ? '50%' : '100%' }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="absolute inset-y-0 right-0 bg-primary"
                />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
