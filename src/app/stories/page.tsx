'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { 
  BookOpen, Sparkles, Quote, ShieldCheck, Search, X, 
  ArrowLeft, LayoutGrid, Heart, Bookmark, Star, ChevronLeft,
  MapPin, Clock, Info, Copy, Share2, Play, Volume2, Eye,
  Palette, Sun, Moon, Coffee, MessageSquareHeart, CheckCircle, VolumeX
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
  const [readStoryIds, setReadStoryIds] = useState<string[]>([]);
  const [reflections, setReflections] = useState<{ [key: string]: string }>({});

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const storedRead = localStorage.getItem('waqfah_read_stories');
      if (storedRead) {
        setReadStoryIds(JSON.parse(storedRead));
      }
      const storedReflections = localStorage.getItem('waqfah_story_reflections');
      if (storedReflections) {
        setReflections(JSON.parse(storedReflections));
      }
    } catch (e) {
      console.error("Failed to load user story progress:", e);
    }
  }, []);

  // Save reflections utility
  const saveReflection = (storyId: string, text: string) => {
    const updated = { ...reflections, [storyId]: text };
    setReflections(updated);
    try {
      localStorage.setItem('waqfah_story_reflections', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save reflection:", e);
    }
  };

  // Mark story as read/unread
  const toggleMarkAsRead = (storyId: string) => {
    const isAlreadyRead = readStoryIds.includes(storyId);
    const updated = isAlreadyRead 
      ? readStoryIds.filter(id => id !== storyId)
      : [...readStoryIds, storyId];
    
    setReadStoryIds(updated);
    try {
      localStorage.setItem('waqfah_read_stories', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save read progress:", e);
    }
  };

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
    <div className="min-h-screen bg-transparent pb-20 overflow-hidden text-right" dir="rtl">
      {/* 🎬 Hero Section - Hidden in Reading Mode for Focus */}
      <AnimatePresence>
        {!isReadingMode && (
          <motion.section 
            initial={{ opacity: 1, height: "45vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background z-0" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none z-0" />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 space-y-6 pt-10"
            >
              <div className="flex items-center gap-4 justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest animate-pulse">
                  <Star className="w-3.5 h-3.5 fill-primary" /> قصص جديدة بانتظارك
                </div>
                {readStoryIds.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black">
                    <CheckCircle className="w-3.5 h-3.5" /> أتممت قراءة {readStoryIds.length} من {STORIES.length} قصص
                  </div>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter drop-shadow-2xl text-white">
                قصصٌ <span className="text-primary italic font-serif">وعِبَر</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 font-medium w-full max-w-xl mx-auto leading-relaxed italic opacity-85">
                أبحر في حكايات السلف ونور النبوة لتجد الحكمة التي تنير روحك وتثبت قلبك.
              </p>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 🌌 Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className={cn(
           "absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[150px] transition-all duration-1000 opacity-20",
           activeCategory === 'prophets' ? "bg-amber-500" : activeCategory === 'parables' ? "bg-emerald-500" : activeCategory === 'sunnah' ? "bg-blue-500" : "bg-primary"
         )} />
         <div className={cn(
           "absolute bottom-1/4 -left-20 w-[500px] h-[500px] rounded-full blur-[150px] transition-all duration-1000 opacity-20",
           activeCategory === 'prophets' ? "bg-amber-800" : activeCategory === 'parables' ? "bg-emerald-800" : activeCategory === 'sunnah' ? "bg-blue-800" : "bg-purple-900"
         )} />
      </div>

      {/* 🎛️ Controls Section */}
      <div className={cn(
        "container relative z-20 transition-all duration-500 max-w-6xl mx-auto px-4",
        isReadingMode ? "pt-10" : "-mt-10"
      )}>
        {/* Persistent Controls Header */}
        <motion.div 
          layout
          className={cn(
            "p-4 md:p-6 rounded-[2.5rem] bg-zinc-950/60 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row gap-6 items-center transition-all duration-500",
            isReadingMode ? "bg-black/60 border-primary/20 sticky top-8 z-[60] mb-12" : "mt-0"
          )}
        >
          {/* Search - Shrink in Reading Mode */}
          <div className={cn("relative flex-1 w-full transition-all", isReadingMode && "max-w-md")}>
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في العنوان، العبرة، أو محتوى السيرة..."
              className="w-full h-14 pr-12 pl-4 rounded-2xl bg-zinc-950/50 border border-white/10 text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-sm"
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
                <Sparkles className="w-5 h-5 text-primary group-hover:rotate-45 transition-transform" />
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
            className="mb-12 mt-8"
          >
             <div className="p-8 md:p-10 rounded-[3rem] bg-gradient-to-br from-primary/10 via-transparent to-white/[0.01] border border-white/5 relative overflow-hidden group shadow-inner">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-all">
                   <Quote className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                   <div className="p-5 rounded-[2rem] bg-primary/10 border border-primary/20">
                      <MessageSquareHeart className="w-8 h-8 text-primary" />
                   </div>
                   <div className="flex-1 space-y-2 text-center md:text-right">
                      <h4 className="text-primary font-black text-xs uppercase tracking-[0.4em]">حكمة اليوم الإيمانية</h4>
                      <p className="text-xl md:text-2xl font-black font-headline text-white leading-relaxed">
                         "إن لم ترَ ثمار صبـرك اليـوم، فسيُنبتهـا الله فـي أجمـل فصـول عُـمـرك."
                      </p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* Categories */}
        {!isReadingMode && (
          <div className="flex flex-wrap justify-center gap-3 mt-10 mb-12">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                "px-6 py-3 rounded-2xl font-black text-xs transition-all duration-300 border",
                activeCategory === 'all' 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
              )}
            >
              الكل
            </button>
            {STORY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-3 rounded-2xl font-black text-xs transition-all duration-300 border flex items-center gap-2",
                  activeCategory === cat.id 
                    ? "bg-white text-black border-white shadow-xl scale-105" 
                    : cn("bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10", cat.color)
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* 📚 Stories Grid */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
          isReadingMode && "w-full mx-auto grid-cols-1 max-w-3xl"
        )}>
          <AnimatePresence mode="popLayout">
            {filteredStories.map((story, i) => {
              const isRead = readStoryIds.includes(story.id);
              const hasReflection = !!reflections[story.id];
              return (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  index={i} 
                  isRead={isRead}
                  hasReflection={hasReflection}
                  isReadingMode={isReadingMode}
                  fontSize={fontSize}
                  onClick={() => setSelectedStory(story)} 
                />
              );
            })}
          </AnimatePresence>
        </div>

        {filteredStories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-24 space-y-4"
          >
            <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-black text-white">لم نجد قصصاً تطابق خياراتك</h3>
            <p className="text-zinc-500 text-sm">حاول البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.</p>
            <Button onClick={() => {setSearchQuery(''); setActiveCategory('all')}} variant="outline" className="rounded-xl px-6 border-white/10 hover:bg-white/5">إعادة تعيين</Button>
          </motion.div>
        )}
      </div>

      {/* 📖 Floating Reader Overlay */}
      <AnimatePresence>
        {selectedStory && (
          <StoryDetailModal 
            story={selectedStory} 
            isRead={readStoryIds.includes(selectedStory.id)}
            reflectionText={reflections[selectedStory.id] || ''}
            onToggleRead={() => toggleMarkAsRead(selectedStory.id)}
            onSaveReflection={(text) => saveReflection(selectedStory.id, text)}
            onClose={() => setSelectedStory(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StoryCard({ story, index, isRead, hasReflection, isReadingMode, fontSize, onClick }: { 
  story: Story, 
  index: number, 
  isRead: boolean,
  hasReflection: boolean,
  isReadingMode: boolean, 
  fontSize: number,
  onClick: () => void 
}) {
  const { toast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${story.title}\n\n${story.content}\n\nالمصدر: ${story.reference}`);
    toast({ title: 'تم نسخ القصة مع المصدر بنجاح!' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 100 }}
      whileHover={!isReadingMode ? { 
        y: -10,
        transition: { type: 'spring', stiffness: 300 }
      } : {}}
      className={cn(
        "group relative rounded-[2.5rem] border bg-gradient-to-b overflow-hidden cursor-pointer backdrop-blur-xl transition-all duration-500",
        story.bg, story.border,
        isReadingMode ? "p-8 border-white/5 bg-zinc-900/40" : "h-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-primary/10"
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      
      <div className={cn(
        "relative z-20 h-full flex flex-col p-8 md:p-9",
        isReadingMode && "p-0"
      )}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            <div className={cn(
              "px-3.5 py-1.5 rounded-xl border font-black text-[9px] uppercase tracking-widest",
              story.source === 'quran' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}>
              {story.source === 'quran' ? 'القرآن الكريم' : 'من السنة النبوية'}
            </div>
            {isRead && (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-black tracking-widest flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> مقروءة
              </div>
            )}
            {hasReflection && (
              <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-[9px] font-black tracking-widest flex items-center gap-1" title="لديك خاطرة مكتوبة">
                <Bookmark className="w-3 h-3 fill-current" /> تأمل
              </div>
            )}
          </div>
          <div className="flex gap-1.5">
             <button 
               onClick={handleCopy}
               className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all border border-white/5"
             >
                <Copy className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        <h3 className={cn(
          "font-black tracking-tight leading-tight mb-3 transition-colors",
          isReadingMode ? "text-4xl text-white underline decoration-primary/30 underline-offset-8" : "text-2xl text-white group-hover:text-primary"
        )}>
          {story.title}
        </h3>

        <p className={cn(
          "text-zinc-400 leading-relaxed font-medium mb-6",
          isReadingMode ? "text-lg md:text-xl" : "text-sm line-clamp-3"
        )}>
          {story.summary}
        </p>

        {!isReadingMode && (
          <div className="flex flex-wrap gap-2 mb-6">
             {["حكمة وعبرة", story.category].map(tag => (
               <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-zinc-500 text-[9px] font-bold">
                 # {tag}
               </span>
             ))}
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-500 group-hover:text-white transition-colors">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                <Info className={cn("w-5 h-5", story.color)} />
             </div>
             <span className="text-[10px] font-bold leading-none line-clamp-1">{story.reference}</span>
          </div>
          <div className="bg-white/5 h-12 px-6 rounded-2xl flex items-center text-xs font-black group-hover:bg-primary transition-all group-hover:text-white shadow-lg">
            اقرأ السيرة
            <ChevronLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StoryDetailModal({ story, isRead, reflectionText, onToggleRead, onSaveReflection, onClose }: { 
  story: Story, 
  isRead: boolean,
  reflectionText: string,
  onToggleRead: () => void,
  onSaveReflection: (text: string) => void,
  onClose: () => void 
}) {
  const { isReadingMode, fontSize } = useReadingMode();
  const [readingTheme, setReadingTheme] = useState<'dark' | 'antique' | 'deep'>('dark');
  const { scrollYProgress } = useScroll();
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  
  // Audio Narrator states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Initialize and clean up speech
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAudioToggle = () => {
    if (!window.speechSynthesis) {
      alert("سرد الصوت غير مدعوم في متصفحك الحالي.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any other speech
      const utterance = new SpeechSynthesisUtterance(story.content);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setSpeechUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    }
  };

  const shareStory = () => {
    const shareText = `من قصص وعِبر وقفة: "${story.title}"\n\nالعبرة: "${story.lesson}"\n\nاقرأ المزيد على منصة وقفة المعرفية 🌿`;
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: shareText,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert("تم نسخ نص القصة الجاهز للمشاركة بنجاح!");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-colors duration-500",
        isReadingMode ? (
          readingTheme === 'dark' ? "bg-[#0A0A0A]" : 
          readingTheme === 'antique' ? "bg-[#1A1814]" : "bg-black"
        ) : "bg-black/80 backdrop-blur-md p-4 md:p-8"
      )}
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 20 }}
        className={cn(
          "w-full overflow-hidden flex flex-col shadow-[0_30px_70px_rgba(0,0,0,0.5)] relative transition-all duration-500 border border-white/10",
          isReadingMode ? "h-full w-full rounded-none border-none" : "w-full max-w-4xl max-h-[90vh] rounded-[3rem]",
          readingTheme === 'antique' ? "bg-[#25221B] border-amber-900/20" : 
          readingTheme === 'deep' ? "bg-black" : "bg-[#0c0c0c]"
        )}
      >
        {/* Progress Bar */}
        <motion.div 
          className="absolute top-0 right-0 h-1 bg-primary z-50 origin-right"
          style={{ scaleX: scrollYProgress, width: '100%' }}
        />

        {/* Header Area */}
        <div className={cn(
          "relative z-10 px-6 py-8 md:px-14 border-b border-white/5 transition-all duration-300 bg-zinc-950/40",
          isReadingMode ? "pt-20" : "pt-12"
        )}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500 transition-all group"
              >
                <X className="w-5 h-5 text-zinc-400 group-hover:text-rose-500" />
              </button>
              <div className="flex flex-col">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] mb-0.5", 
                  story.source === 'quran' ? "text-emerald-400" : "text-blue-400"
                )}>
                  {story.source === 'quran' ? 'القرآن الكريم' : 'صحيح السنة النبوية'}
                </span>
                <div className="flex items-center gap-2">
                   <span className="text-zinc-500 text-xs font-bold">{story.reference}</span>
                   <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                   <span className="text-zinc-500 text-xs font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ٥ دقائق قراءة</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full md:w-auto overflow-x-auto">
                <button 
                  onClick={() => setReadingTheme('antique')}
                  className={cn("p-2.5 rounded-xl transition-all", readingTheme === 'antique' ? "bg-amber-500 text-black shadow-md" : "hover:bg-white/5 text-zinc-400")}
                  title="الوضع الكلاسيكي/القديم"
                >
                   <Coffee className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setReadingTheme('dark')}
                  className={cn("p-2.5 rounded-xl transition-all", readingTheme === 'dark' ? "bg-primary text-white shadow-lg" : "hover:bg-white/5 text-zinc-400")}
                  title="الوضع المظلم"
                >
                   <Moon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setReadingTheme('deep')}
                  className={cn("p-2.5 rounded-xl transition-all", readingTheme === 'deep' ? "bg-white text-black shadow-lg" : "hover:bg-white/5 text-zinc-400")}
                  title="الوضع الداكن العميق"
                >
                   <Palette className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <ReadingModeToggle />
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tight text-white">
            {story.title}
          </h2>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar relative z-10 transition-all duration-300",
          isReadingMode ? "px-6 md:px-24 py-16" : "px-6 md:px-14 py-10"
        )}>
          <div className="space-y-12">
             <div className="flex items-center gap-4 justify-center opacity-25">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-white" />
                <Star className="w-3.5 h-3.5 fill-white" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-white" />
             </div>

             {/* Interactive Audio Player widget */}
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <button 
                   onClick={handleAudioToggle}
                   className={cn(
                     "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                     isPlayingAudio ? "bg-rose-500 text-white" : "bg-primary text-white hover:scale-105"
                   )}
                 >
                   {isPlayingAudio ? <VolumeX className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                 </button>
                 <div>
                   <h6 className="text-xs font-black text-white">الاستماع السمعي الذكي</h6>
                   <p className="text-[10px] text-zinc-500 font-bold">انقر لتشغيل سرد القصة بالذكاء الاصطناعي</p>
                 </div>
               </div>

               {/* Waveform Equalizer */}
               {isPlayingAudio && (
                 <div className="flex items-end gap-1 h-6">
                   {[...Array(5)].map((_, i) => (
                     <motion.div
                       key={i}
                       className="w-1 bg-primary rounded-full"
                       animate={{ height: [6, 24, 6] }}
                       transition={{
                         duration: 0.8,
                         repeat: Infinity,
                         delay: i * 0.15,
                         ease: "easeInOut"
                       }}
                     />
                   ))}
                 </div>
               )}
             </div>

             {/* Content blocks with position marker highlight */}
             <div className="space-y-6">
               {story.content.split('\n\n').map((paragraph, index) => (
                 <p 
                   key={index}
                   onClick={() => setHighlightedIndex(index === highlightedIndex ? null : index)}
                   className={cn(
                     "leading-[2.2] tracking-wide transition-all duration-300 selection:bg-primary/30 font-medium cursor-pointer p-4 rounded-2xl border border-transparent",
                     highlightedIndex === index 
                       ? "bg-primary/10 border-primary/20 text-white shadow-inner scale-[1.01]" 
                       : "text-zinc-200 hover:bg-white/[0.01]",
                     readingTheme === 'antique' ? "text-amber-100/90" : ""
                   )} 
                   style={{ fontSize: `${fontSize + 3}px` }}
                 >
                   {paragraph}
                 </p>
               ))}
             </div>

             {/* Lesson Summary Callout */}
             <div className={cn(
               "p-8 md:p-10 rounded-[3rem] border relative overflow-hidden group shadow-lg mt-16",
               story.bg, story.border,
             )}>
                <div className="absolute top-0 left-0 p-8 opacity-10">
                   <Quote className="w-24 h-24 rotate-180" />
                </div>
                <div className="relative z-10 space-y-6">
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-zinc-950/40 flex items-center justify-center border border-white/5 shrink-0">
                         <Sparkles className={cn("w-9 h-9", story.color)} />
                      </div>
                      <div className="space-y-1 text-center md:text-right">
                         <h4 className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">جوهر العبرة والحكمة</h4>
                         <p className="text-xl md:text-2xl text-white font-black italic tracking-tight leading-relaxed">
                            "{story.lesson}"
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Reflection Journal Section */}
             <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquareHeart className="w-5 h-5 text-primary" />
                  <h5 className="text-lg font-black text-white">دفتر خواطري وتأملاتي (يحفظ تلقائياً)</h5>
                </div>
                <p className="text-zinc-500 text-xs font-bold leading-relaxed">
                  اكتب أفكارك حول القصة، وكيف ستنوي تطبيقها في حياتك اليومية لتكون علماً وعملاً:
                </p>
                <textarea
                  value={reflectionText}
                  onChange={(e) => onSaveReflection(e.target.value)}
                  placeholder="دوّن خواطرك الإيمانية هنا لتظل مرجعاً لك في المستقبل..."
                  rows={4}
                  className="w-full p-4 rounded-xl bg-zinc-950 border border-white/5 text-white text-sm placeholder:text-zinc-700 outline-none focus:border-primary/50 transition-all font-medium leading-relaxed"
                />
                <p className="text-[10px] text-zinc-500 font-bold text-left">💾 يتم حفظ هذه الخاطرة في متصفحك بشكل آمن.</p>
             </div>

             {/* Reflection actions */}
             <div className="pt-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <button 
                     onClick={onToggleRead}
                     className={cn(
                       "h-16 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-95",
                       isRead 
                         ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                         : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                     )}
                   >
                     <CheckCircle className={cn("w-5 h-5", isRead && "fill-current")} />
                     {isRead ? "أتممت القراءة (اضغط لإلغاء المارك)" : "تحديد كـ مقروءة ومكتملة"}
                   </button>
                   <button 
                     onClick={shareStory}
                     className="h-16 rounded-2xl bg-primary text-white font-black text-sm gap-2 hover:bg-primary/95 transition-all shadow-lg active:scale-95 flex items-center justify-center"
                   >
                      <Share2 className="w-5 h-5" />
                      مشاركة العبرة والقصة
                   </button>
                </div>
             </div>
          </div>
          
          <div className="h-20" />
        </div>
      </motion.div>
    </motion.div>
  );
}
