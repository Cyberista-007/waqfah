'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Sparkles, Share2, BookMarked, ArrowLeft, BookOpen, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const VERSES = [
  {
    text: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا",
    surah: "الأحزاب",
    number: 56,
    theme: "from-emerald-500/20 to-teal-500/5",
    accent: "text-emerald-400"
  },
  {
    text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    surah: "الطلاق",
    number: 2,
    theme: "from-amber-500/20 to-orange-500/5",
    accent: "text-amber-400"
  },
  {
    text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    surah: "الشرح",
    number: "5-6",
    theme: "from-blue-500/20 to-indigo-500/5",
    accent: "text-blue-400"
  },
  {
    text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    surah: "الرعد",
    number: 28,
    theme: "from-rose-500/20 to-pink-500/5",
    accent: "text-rose-400"
  }
];

const HADITHS = [
  {
    text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    narrator: "رواه مسلم",
    topic: "فضل العلم",
    theme: "from-blue-500/20 to-indigo-500/5",
    accent: "text-blue-400"
  },
  {
    text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    narrator: "رواه البخاري ومسلم",
    topic: "الإخلاص والنية",
    theme: "from-emerald-500/20 to-teal-500/5",
    accent: "text-emerald-400"
  },
  {
    text: "عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
    narrator: "رواه البخاري ومسلم",
    topic: "الصدق والأمانة",
    theme: "from-amber-500/20 to-orange-500/5",
    accent: "text-amber-400"
  }
];

const DUAS = [
  {
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    source: "مسند أحمد",
    category: "دعاء طلب العلم",
    theme: "from-purple-500/20 to-pink-500/5",
    accent: "text-purple-400"
  },
  {
    text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    source: "رواه الترمذي",
    category: "الثبات على الحق",
    theme: "from-rose-500/20 to-red-500/5",
    accent: "text-rose-400"
  },
  {
    text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    source: "سورة البقرة - الآية 201",
    category: "جوامع الدعاء",
    theme: "from-teal-500/20 to-emerald-500/5",
    accent: "text-teal-400"
  }
];

const WISDOMS = [
  {
    text: "العلم صيد والكتابة قيده، قيد صيودك بالحبال الواثقة",
    author: "الإمام الشافعي",
    category: "طلب العلم",
    theme: "from-amber-500/20 to-yellow-500/5",
    accent: "text-amber-400"
  },
  {
    text: "من وطَّن قلبه عند ربه سكن واستراح، ومن أرسله في الناس اضطرب واشتد به القلق",
    author: "ابن القيم",
    category: "أعمال القلوب",
    theme: "from-indigo-500/20 to-purple-500/5",
    accent: "text-indigo-400"
  },
  {
    text: "عليك بطريق الحق ولا تستوحش لقلة السالكين، وإياك وطريق الباطل ولا تغتر بكثرة الهالكين",
    author: "الفضيل بن عياض",
    category: "الاستقامة والثبات",
    theme: "from-emerald-500/20 to-teal-500/5",
    accent: "text-emerald-400"
  }
];

export function VerseOfTheDay() {
  const [activeTab, setActiveTab] = useState<'verse' | 'hadith' | 'dua' | 'wisdom'>('verse');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Generate deterministic index based on day of month to simulate daily updates
    const day = new Date().getDate();
    setCurrentIndex(day);
  }, []);

  const getActiveItem = () => {
    switch (activeTab) {
      case 'hadith':
        return HADITHS[currentIndex % HADITHS.length];
      case 'dua':
        return DUAS[currentIndex % DUAS.length];
      case 'wisdom':
        return WISDOMS[currentIndex % WISDOMS.length];
      case 'verse':
      default:
        return VERSES[currentIndex % VERSES.length];
    }
  };

  const item = getActiveItem();

  return (
    <section className="container px-4 py-20 relative">
      <div className="max-w-5xl mx-auto">
        {/* Sliding Tabs Control */}
        <div className="flex items-center justify-center p-1.5 bg-white/5 border border-white/10 rounded-full mb-8 max-w-md mx-auto backdrop-blur-xl">
          {[
            { id: 'verse', label: 'آية اليوم', icon: Sparkles },
            { id: 'hadith', label: 'حديث اليوم', icon: BookOpen },
            { id: 'dua', label: 'دعاء اليوم', icon: Heart },
            { id: 'wisdom', label: 'حكمة اليوم', icon: Quote }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all",
                  isActive ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" : "text-white/40 hover:text-white/80"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "relative p-10 md:p-20 rounded-[4rem] border border-white/10 backdrop-blur-3xl overflow-hidden group transition-all duration-1000",
            "bg-gradient-to-br", item.theme
          )}
        >
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 shadow-2xl"
            >
              <Quote className={cn("w-8 h-8 fill-current", item.accent)} />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <Sparkles className="w-3.5 h-3.5" /> 
              {activeTab === 'verse' && "آيةٌ تتدبّرها اليَوْم"}
              {activeTab === 'hadith' && "حديثٌ شريف نقتدي به"}
              {activeTab === 'dua' && "دعاءٌ مأثور نرجوه"}
              {activeTab === 'wisdom' && "حكمةٌ نافعة نتفكر فيها"}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + '-' + item.text}
                initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                className="space-y-8"
              >
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.4] tracking-tight font-quran drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                  {item.text}
                </h2>

                <div className="flex items-center justify-center gap-4 text-xl md:text-2xl font-bold text-white/40 italic">
                  <div className="h-px w-8 bg-white/10" />
                  {activeTab === 'verse' && <span>سورة {(item as any).surah} - الآية {(item as any).number}</span>}
                  {activeTab === 'hadith' && <span>{(item as any).narrator} - {(item as any).topic}</span>}
                  {activeTab === 'dua' && <span>{(item as any).source} - {(item as any).category}</span>}
                  {activeTab === 'wisdom' && <span>{(item as any).author} - {(item as any).category}</span>}
                  <div className="h-px w-8 bg-white/10" />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="rounded-full px-10 h-14 font-black bg-white/5 border border-white/10 text-white hover:bg-white/10 gap-3 group/btn">
                <BookMarked className="w-5 h-5 opacity-40 group-hover/btn:opacity-100 transition-opacity" />
                حفظ في المفضلة
              </Button>
              
              <Button size="lg" className="rounded-full px-10 h-14 font-black bg-primary text-white border-none shadow-lg shadow-primary/20 hover:scale-105 gap-3 group/share">
                <Share2 className="w-5 h-5" />
                {activeTab === 'verse' && "مشاركة الآية"}
                {activeTab === 'hadith' && "مشاركة الحديث"}
                {activeTab === 'dua' && "مشاركة الدعاء"}
                {activeTab === 'wisdom' && "مشاركة الحكمة"}
              </Button>

              <Button variant="ghost" className="rounded-full px-8 h-14 font-bold text-white/40 hover:text-white gap-3">
                {activeTab === 'verse' && "تفسير الآية"}
                {activeTab === 'hadith' && "شرح الحديث"}
                {activeTab === 'dua' && "فضل الدعاء"}
                {activeTab === 'wisdom' && "تأمل الأثر"}
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/5 rounded-tl-3xl" />
          <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/5 rounded-br-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
