'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Sparkles, Share2, BookMarked, ArrowLeft } from 'lucide-react';
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

export function VerseOfTheDay() {
  const [verse, setVerse] = useState(VERSES[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Random verse on each visit for now
    const randomVerse = VERSES[Math.floor(Math.random() * VERSES.length)];
    setVerse(randomVerse);
    setIsLoaded(true);
  }, []);

  return (
    <section className="container px-4 py-20 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "relative p-10 md:p-20 rounded-[4rem] border border-white/10 backdrop-blur-3xl overflow-hidden group",
            "bg-gradient-to-br", verse.theme
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
              <Quote className={cn("w-8 h-8 fill-current", verse.accent)} />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <Sparkles className="w-3.5 h-3.5" /> آيةٌ تتدبّرها اليَوْم
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={verse.text}
                initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                className="space-y-8"
              >
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.4] tracking-tight font-quran drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                  {verse.text}
                </h2>

                <div className="flex items-center justify-center gap-4 text-xl md:text-2xl font-bold text-white/40 italic">
                  <div className="h-px w-8 bg-white/10" />
                  <span>سورة {verse.surah} - الآية {verse.number}</span>
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
                مشاركة الآية
              </Button>

              <Button variant="ghost" className="rounded-full px-8 h-14 font-bold text-white/40 hover:text-white gap-3">
                تفسير الآية
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
