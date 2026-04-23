'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { 
  BookOpen, Sparkles, Quote, ShieldCheck, Search, X, 
  ArrowLeft, LayoutGrid, Heart, Bookmark, Star, ChevronLeft,
  MapPin, Clock, Info, Copy, Share2, Play, Volume2, Eye,
  Palette, Sun, Moon, Coffee, MessageSquareHeart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { Button } from '@/components/ui/button';
import { STORIES, STORY_CATEGORIES, Story } from './data';

export default function StoriesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const { isReadingMode, fontSize } = useReadingMode();

  const filteredStories = useMemo(() => {
    return STORIES.filter(story => {
      const matchesCategory = activeCategory === 'all' || story.category === activeCategory;
      const matchesSearch = story.title.includes(searchQuery) || 
                           story.content.includes(searchQuery) ||
                           story.lesson.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20 overflow-hidden">
      {/* 🎬 Hero Section - Hidden in Reading Mode for Focus */}
      <AnimatePresence>
        {!isReadingMode && (
          <motion.section 
            initial={{ opacity: 1, height: "50vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background z-0" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none z-0" />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 space-y-8"
            >
              <div className="flex items-center gap-4 justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-black uppercase tracking-widest animate-pulse">
                  <Star className="w-4 h-4 fill-primary" /> قصص جديدة بانتظارك
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-sm font-black">
                  <Coffee className="w-4 h-4" /> سلسلة الهدى • اليوم ٥
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black font-headline tracking-tighter drop-shadow-2xl text-white">
                قصصٌ <span className="text-primary italic">وعِبَر</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed italic opacity-80">
                أبحر في حكايات السلف ونور النبوة لتجد الحكمة التي تنير دربك.
              </p>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 🌌 Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className={cn(
           "absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[150px] transition-all duration-1000 opacity-20",
           activeCategory === 'quran' ? "bg-emerald-500" : activeCategory === 'sunnah' ? "bg-blue-500" : "bg-primary"
         )} />
         <div className={cn(
           "absolute bottom-1/4 -left-20 w-[500px] h-[500px] rounded-full blur-[150px] transition-all duration-1000 opacity-20",
           activeCategory === 'quran' ? "bg-emerald-800" : activeCategory === 'sunnah' ? "bg-blue-800" : "bg-purple-900"
         )} />
      </div>

      {/* 🎛️ Controls Section */}
      <div className={cn(
        "container relative z-20 transition-all duration-500",
        isReadingMode ? "pt-10" : "-mt-10 px-4"
      )}>
        {/* Persistent Controls Header */}
        <motion.div 
          layout
          className={cn(
            "p-4 md:p-6 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row gap-6 items-center transition-all duration-500",
            isReadingMode ? "bg-black/60 border-primary/20 sticky top-8 z-[60] mb-12" : "mt-0"
          )}
        >
          {/* Search - Shrink in Reading Mode */}
          <div className={cn("relative flex-1 w-full transition-all", isReadingMode && "max-w-md")}>
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في القصص، العِبَر، أو المصادر..."
              className="w-full h-14 pr-12 pl-4 rounded-2xl bg-background/50 border border-white/10 focus:border-primary outline-none transition-all font-bold"
            />
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => {
                 const random = STORIES[Math.floor(Math.random() * STORIES.length)];
                 setSelectedStory(random);
               }}
               className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 text-white font-black text-sm transition-all flex items-center gap-3 group"
             >
                <Sparkles className="w-5 h-5 text-primary group-hover:animate-spin" />
                <span className="hidden md:inline">قصة عشوائية</span>
             </button>
             <div className="h-10 w-px bg-white/10 hidden md:block" />
             <ReadingModeToggle />
          </div>
        </motion.div>

        {/* Daily Motivation Mosaic */}
        {!isReadingMode && searchQuery === '' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
             <div className="p-8 md:p-12 rounded-[3.5rem] bg-gradient-to-br from-primary/20 via-transparent to-white/[0.02] border border-white/5 relative overflow-hidden group shadow-inner">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
                   <Quote className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                   <div className="p-6 rounded-[2rem] bg-primary/10 border border-primary/20">
                      <MessageSquareHeart className="w-10 h-10 text-primary" />
                   </div>
                   <div className="flex-1 space-y-4 text-center md:text-right">
                      <h4 className="text-primary font-black text-sm uppercase tracking-[0.4em]">الحكمة اليومية</h4>
                      <p className="text-3xl md:text-4xl lg:text-5xl font-black font-headline text-white drop-shadow-xl leading-tight">
                         "إن لم ترَ ثمار صبـرك اليـوم، فسيُنبتهـا الله فـي أجمـل فصـول عُـمـرك."
                      </p>
                   </div>
                   <button className="h-16 px-10 rounded-2xl bg-white text-black font-black hover:bg-primary hover:text-white transition-all shadow-2xl">
                      تأمل أكثر
                   </button>
                </div>
             </div>
          </motion.div>
        )}

        {/* Categories */}
        {!isReadingMode && (
          <div className="flex flex-wrap justify-center gap-4 mt-12 mb-16">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                "px-8 py-4 rounded-2xl font-black text-sm transition-all duration-500 border",
                activeCategory === 'all' 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "bg-card/40 text-muted-foreground border-white/5 hover:bg-white/10"
              )}
            >
              الكل
            </button>
            {STORY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-8 py-4 rounded-2xl font-black text-sm transition-all duration-500 border flex items-center gap-3",
                  activeCategory === cat.id 
                    ? "bg-white text-black border-white shadow-xl scale-105" 
                    : cn("bg-card/40 text-muted-foreground border-white/5 hover:bg-white/10", cat.color)
                )}
              >
                <cat.icon className="w-5 h-5" />
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* 📚 Stories Grid */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
          isReadingMode && "max-w-4xl mx-auto grid-cols-1"
        )}>
          <AnimatePresence mode="popLayout">
            {filteredStories.map((story, i) => (
              <StoryCard 
                key={story.id} 
                story={story} 
                index={i} 
                isReadingMode={isReadingMode}
                fontSize={fontSize}
                onClick={() => setSelectedStory(story)} 
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredStories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-32 space-y-6"
          >
            <div className="w-24 h-24 bg-card/60 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-black text-white">لم نجد قصصاً تطابق بحثك</h3>
            <p className="text-muted-foreground">حاول البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.</p>
            <Button onClick={() => {setSearchQuery(''); setActiveCategory('all')}} variant="outline" className="rounded-xl px-8 h-12 border-white/10">إعادة تعيين</Button>
          </motion.div>
        )}
      </div>

      {/* 📖 Floating Reader Overlay */}
      <AnimatePresence>
        {selectedStory && (
          <StoryDetailModal 
            story={selectedStory as Story} 
            onClose={() => setSelectedStory(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StoryCard({ story, index, isReadingMode, fontSize, onClick }: { 
  story: Story, 
  index: number, 
  isReadingMode: boolean, 
  fontSize: number,
  onClick: () => void 
}) {
  const { toast } = useToast();
  const isNew = index === 0 || index === 2; // Logic for "New" badge simulation

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${story.title}\n\n${story.content}\n\nالمصدر: ${story.reference}`);
    toast({ title: 'تم نسخ القصة مع المصدر' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
      whileHover={!isReadingMode ? { 
        y: -15,
        transition: { type: 'spring', stiffness: 400 }
      } : {}}
      className={cn(
        "group relative rounded-[2.5rem] border bg-gradient-to-b overflow-hidden cursor-pointer backdrop-blur-xl transition-all duration-700",
        story.bg, story.border,
        isReadingMode ? "p-8 border-white/5 bg-card/20" : "h-[400px] shadow-2xl hover:shadow-primary/20"
      )}
      onClick={onClick}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      
      {/* New Badge */}
      {isNew && !isReadingMode && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-primary/40 animate-bounce">
           <Star className="w-3 h-3 fill-white" /> جديد
        </div>
      )}

      <div className={cn(
        "relative z-20 h-full flex flex-col p-8 md:p-9",
        isReadingMode && "p-0"
      )}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            <div className={cn(
              "px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest",
              story.source === 'quran' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}>
              {story.source === 'quran' ? 'القرآن الكريم' : 'من السنة النبوية'}
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <Clock className="w-3 h-3" /> ٥ دقائق
            </div>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={handleCopy}
               className="p-3 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all border border-white/5"
             >
                <Copy className="w-4 h-4" />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); toast({ title: 'تمت الإضافة للمفضلة' }) }}
               className="p-3 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all border border-white/5"
             >
                <Heart className="w-4 h-4" />
             </button>
          </div>
        </div>

        <h3 className={cn(
          "font-black tracking-tight leading-tight mb-4 transition-colors",
          isReadingMode ? "text-4xl text-white underline decoration-primary/30 underline-offset-8" : "text-3xl text-white group-hover:text-primary"
        )} style={{ fontSize: isReadingMode ? `${fontSize * 1.5}px` : undefined }}>
          {story.title}
        </h3>

        <p className={cn(
          "text-white/60 leading-relaxed font-medium mb-8",
          isReadingMode ? "text-xl md:text-2xl" : "text-base line-clamp-3"
        )} style={{ fontSize: isReadingMode ? `${fontSize}px` : undefined }}>
          {story.summary}
        </p>

        {/* Lesson Tags */}
        {!isReadingMode && (
          <div className="flex flex-wrap gap-2 mb-8">
             {["حكمة", "عبرة"].map(tag => (
               <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-white/30 text-[10px] font-bold">
                 # {tag}
               </span>
             ))}
          </div>
        )}

        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white/40 group-hover:text-white transition-colors">
             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <Info className={cn("w-6 h-6", story.color)} />
             </div>
             <span className="text-xs font-bold leading-none">{story.reference}</span>
          </div>
          <div className="bg-white/5 h-14 px-8 rounded-2xl flex items-center text-xs font-black group-hover:bg-primary transition-all group-hover:text-white shadow-2xl">
            اقرأ السيرة
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StoryDetailModal({ story, onClose }: { story: Story, onClose: () => void }) {
  const { isReadingMode, fontSize } = useReadingMode();
  const [readingTheme, setReadingTheme] = useState<'dark' | 'antique' | 'deep'>('dark');
  const { scrollYProgress } = useScroll();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-colors duration-700",
        isReadingMode ? (
          readingTheme === 'dark' ? "bg-[#0A0A0A]" : 
          readingTheme === 'antique' ? "bg-[#1A1814]" : "bg-black"
        ) : "bg-black/80 backdrop-blur-3xl p-4 md:p-8"
      )}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className={cn(
          "w-full overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative transition-all duration-700 border border-white/10",
          isReadingMode ? "h-full max-w-full rounded-none border-none" : "max-w-5xl max-h-full rounded-[3.5rem]",
          readingTheme === 'antique' ? "bg-[#25221B] border-amber-900/20" : 
          readingTheme === 'deep' ? "bg-black" : "bg-[#080808]"
        )}
      >
        {/* Progress Bar */}
        <motion.div 
          className="absolute top-0 right-0 h-1.5 bg-primary z-50 origin-right"
          style={{ scaleX: scrollYProgress, width: '100%' }}
        />

        {/* Reading Mode Texture Overlay */}
        {isReadingMode && (
           <div className={cn(
             "absolute inset-0 pointer-events-none z-0",
             readingTheme === 'antique' ? "opacity-10 bg-[url('https://www.transparenttextures.com/patterns/papyros.png')]" : "opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"
           )} />
        )}

        {/* Header Area */}
        <div className={cn(
          "relative z-10 px-8 py-10 md:px-20 border-b border-white/5 transition-all duration-500",
          isReadingMode ? "pt-24" : "pt-16 bg-gradient-to-br from-white/[0.03] to-transparent"
        )}>
          <div className="flex items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-6">
              <button 
                onClick={onClose}
                className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500 transition-all group"
              >
                <X className="w-6 h-6 text-white/40 group-hover:text-red-500" />
              </button>
              <div className="flex flex-col">
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-[0.3em] mb-1", 
                  story.source === 'quran' ? "text-emerald-400" : "text-blue-400"
                )}>
                  {story.source === 'quran' ? 'القرآن الكريم' : 'صحيح السنة النبوية'}
                </span>
                <div className="flex items-center gap-3">
                   <span className="text-white/40 text-xs font-bold">{story.reference}</span>
                   <span className="w-1 h-1 bg-white/20 rounded-full" />
                   <span className="text-white/40 text-xs font-bold flex items-center gap-2"><Clock className="w-3 h-3" /> 5 دقائق قراءة</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setReadingTheme('antique')}
                  className={cn("p-3 rounded-xl transition-all", readingTheme === 'antique' ? "bg-amber-500 text-black shadow-lg" : "hover:bg-white/5 text-white/40")}
                >
                   <Coffee className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setReadingTheme('dark')}
                  className={cn("p-3 rounded-xl transition-all", readingTheme === 'dark' ? "bg-primary text-white shadow-lg" : "hover:bg-white/5 text-white/40")}
                >
                   <Moon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setReadingTheme('deep')}
                  className={cn("p-3 rounded-xl transition-all", readingTheme === 'deep' ? "bg-white text-black shadow-lg" : "hover:bg-white/5 text-white/40")}
                >
                   <Palette className="w-4 h-4" />
                </button>
                <div className="w-px h-8 bg-white/10 mx-1" />
                <ReadingModeToggle />
            </div>
          </div>

          <motion.h2 
            layout
            className={cn(
              "font-black font-headline tracking-tighter text-white transition-all duration-700",
              isReadingMode ? "text-6xl md:text-8xl lg:text-9xl italic" : "text-5xl md:text-7xl"
            )}
          >
            {story.title}
          </motion.h2>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar relative z-10 transition-all duration-700",
          isReadingMode ? "px-8 md:px-32 lg:px-[25%] py-24" : "px-8 md:px-20 py-16"
        )}>
          <div className="space-y-16">
             <div className="flex items-center gap-8 justify-center opacity-30">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-white" />
                <Star className="w-4 h-4 fill-white" />
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-white" />
             </div>

             <motion.p 
               layout
               className={cn(
                 "leading-[2.5] tracking-wide transition-all duration-500 selection:bg-primary/30",
                 isReadingMode ? "font-headline font-medium text-center drop-shadow-sm text-white" : "font-medium text-white/90",
                 readingTheme === 'antique' ? "text-amber-100/90" : ""
               )} 
               style={{ fontSize: isReadingMode ? `${fontSize + 12}px` : `${fontSize + 6}px` }}
             >
                {story.content}
             </motion.p>

             {/* Lesson Summary Callout */}
             <motion.div 
               layout
               className={cn(
                 "p-12 md:p-20 rounded-[4rem] border relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] mt-32",
                 story.bg, story.border,
               )}
             >
                <div className="absolute top-0 left-0 p-12 opacity-10">
                   <Quote className="w-32 h-32 rotate-180" />
                </div>
                <div className="relative z-10 space-y-10">
                   <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className={cn("w-28 h-28 rounded-[2.5rem] flex items-center justify-center border-4 border-white/5 shrink-0 animate-bounce-slow", story.bg)}>
                         <Sparkles className={cn("w-12 h-12", story.color)} />
                      </div>
                      <div className="space-y-3 text-center md:text-right">
                         <h4 className="text-white/40 text-xs font-black uppercase tracking-[0.4em]">جوهر العبرة</h4>
                         <p className={cn(
                           "text-white font-black italic tracking-tight leading-tight",
                           isReadingMode ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"
                         )}>
                            "{story.lesson}"
                         </p>
                      </div>
                   </div>
                </div>
             </motion.div>

             {/* Reflection Section */}
             <div className="pt-20 space-y-12">
                <div className="text-center space-y-4">
                   <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                      <MessageSquareHeart className="w-4 h-4" /> وقفة تأمّل
                   </div>
                   <h5 className="text-3xl md:text-5xl font-black font-headline text-white italic">قف هنا للحظة..</h5>
                   <p className="text-white/40 text-lg max-w-xl mx-auto font-medium leading-relaxed">
                      كيف يمكن لمعاني هذه القصة أن تغير شيئاً في يومك؟ خذ أنفاساً عميقة واستحضر نية العمل بما تعلمت.
                   </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Button className="h-20 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xl gap-4 group/share">
                      <Share2 className="w-6 h-6 text-blue-400 group-hover/share:scale-125 transition-transform" />
                      شارك الفائدة مع غيرك
                   </Button>
                   <Button className="h-20 rounded-[2rem] bg-primary text-white font-black text-xl gap-4 hover:brightness-110 shadow-2xl shadow-primary/20 group/listen">
                      <Volume2 className="w-6 h-6 group-hover/listen:animate-pulse" />
                      استمع للسرد الصوتي
                   </Button>
                </div>
             </div>
          </div>
          
          <div className="h-48" />
        </div>

        {/* Floating Mini Controls for Reading Mode */}
        {isReadingMode && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 animate-fade-in-up">
             <button 
               onClick={onClose}
               className="h-16 px-10 rounded-[1.5rem] bg-white text-black font-black text-lg hover:bg-white/90 shadow-2xl flex items-center gap-3 transition-all active:scale-95"
             >
                <ArrowLeft className="w-5 h-5 rotate-180" />
                إنهاء القراءة
             </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

