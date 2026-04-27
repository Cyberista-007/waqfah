'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarPlus, Loader2, Clock, MapPin, Video, PlayCircle, Star, Sparkles, Calendar, ChevronLeft, Bell, Share2 } from 'lucide-react';
import type { ScheduleItem } from '@/lib/types';
import { useCollection } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

function generateICSLink(item: ScheduleItem) {
    if (!item.dateTime) return '#';
    const startTime = new Date(item.dateTime);
    if (isNaN(startTime.getTime())) return '#';
    const endTime = new Date(startTime.getTime() + (item.duration || 60) * 60 * 1000);

    const toICSFormat = (date: Date) => {
        return date.toISOString().replace(/-/g, '').replace(/:/g, '').replace(/\./g, '');
    }

    const event = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${toICSFormat(startTime)}`,
        `DTEND:${toICSFormat(endTime)}`,
        `SUMMARY:${item.title}`,
        `DESCRIPTION:${item.isLive ? "بث مباشر - منصة وقفة" : "درس مسجل - منصة وقفة"}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    return `data:text/calendar;charset=utf8,${encodeURIComponent(event)}`;
}

export default function SchedulePage() {
  const { data: scheduleItems, isLoading } = useCollection<ScheduleItem>('scheduled_lessons', { orderBy: ['dateTime', 'asc']});
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'recorded'>('all');

  const formattedItems = scheduleItems?.map(item => {
    if (!item.dateTime) return { 
        ...item, 
        date: 'غير محدد', 
        time: '', 
        rawDate: new Date(),
        day: '--',
        month: '--',
        weekday: 'غير محدد',
        fullDate: 'غير محدد'
    };
    const date = new Date(item.dateTime);
    return {
        ...item,
        rawDate: date,
        day: date.toLocaleDateString('ar-EG', { day: '2-digit' }),
        month: date.toLocaleDateString('ar-EG', { month: 'short' }),
        weekday: date.toLocaleDateString('ar-EG', { weekday: 'long' }),
        fullDate: date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    }
  }).filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return item.isLive;
    return !item.isLive;
  });

  return (
    <div className="min-h-screen pb-32 overflow-hidden bg-[#050505]">
      {/* 🎭 Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="container relative z-10 px-4">
        {/* 🏛️ Hero Section */}
        <section className="pt-24 pb-16 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner"
          >
            <Calendar className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 italic">Scientific Journey Schedule</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black font-headline tracking-tighter leading-tight"
          >
            جَدول <span className="text-primary italic">الدروس</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            تابع مواعيد البث المباشر والدروس المسجلة لنخبة من العلماء. صمم جدولك العلمي لتبقى على اتصال دائم بنور الوحي.
          </motion.p>

          {/* 🎛️ Filter Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 pt-8"
          >
            {[
              { id: 'all', label: 'الكل', icon: Sparkles },
              { id: 'live', label: 'بث مباشر', icon: Video, color: 'text-red-500' },
              { id: 'recorded', label: 'دروس مسجلة', icon: PlayCircle, color: 'text-blue-500' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={cn(
                  "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 border flex items-center gap-3",
                  activeFilter === filter.id 
                    ? "bg-white text-black border-white shadow-xl scale-105" 
                    : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                )}
              >
                <filter.icon className={cn("w-4 h-4", activeFilter === filter.id ? "" : filter.color)} />
                {filter.label}
              </button>
            ))}
          </motion.div>
        </section>

        {/* 📅 Timeline Grid */}
        <main className="max-w-5xl mx-auto mt-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-32 space-y-6">
              <Loader2 className="animate-spin h-12 w-12 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">جاري تنظيم المواعيد...</p>
            </div>
          ) : formattedItems && formattedItems.length > 0 ? (
            <div className="space-y-12">
              <AnimatePresence mode="popLayout">
                {formattedItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    layout
                    className="relative"
                  >
                    {/* Vertical Connector */}
                    {idx < formattedItems.length - 1 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-white/10 to-transparent hidden md:block" />
                    )}

                    <Card className="group relative border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Date Sidebar */}
                          <div className={cn(
                            "md:w-48 p-10 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-l border-white/5",
                            item.isLive ? "bg-red-500/5" : "bg-primary/5"
                          )}>
                            <span className="text-4xl font-black text-white mb-1">{item.day}</span>
                            <span className="text-sm font-black text-primary uppercase tracking-widest mb-4">{item.month}</span>
                            <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                              {item.weekday}
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 p-10 md:p-12 space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  {item.isLive ? (
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500 text-[9px] font-black text-white uppercase animate-pulse shadow-lg shadow-red-500/20">
                                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                      مباشر الآن
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase">
                                      درس مسجل
                                    </span>
                                  )}
                                  <div className="flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest">
                                    <Clock className="w-3.5 h-3.5" /> {item.time}
                                  </div>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black font-headline text-white group-hover:text-primary transition-colors leading-tight">
                                  {item.title}
                                </h3>
                              </div>

                              <div className="flex gap-3">
                                <Button asChild variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                   <Share2 className="w-4 h-4 text-white/40" />
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                   <Bell className="w-4 h-4 text-white/40" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-white/5">
                               <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-3 text-white/40 text-sm font-bold">
                                     <MapPin className="w-4 h-4 text-primary" /> منصة وقفة الرقمية
                                  </div>
                                  <div className="w-px h-4 bg-white/5 hidden sm:block" />
                                  <div className="flex items-center gap-3 text-white/40 text-sm font-bold">
                                     <Video className="w-4 h-4 text-emerald-400" /> جودة عالية FHD
                                  </div>
                               </div>

                               <Button asChild className="h-14 px-10 rounded-2xl bg-primary text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 gap-3 group/btn">
                                  <a href={generateICSLink(item)} download={`${item.title}.ics`}>
                                      أضف للمفكرة
                                      <CalendarPlus className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                                  </a>
                               </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-white/5 border-2 border-dashed border-white/10 rounded-[4rem] space-y-8"
            >
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                   <Calendar className="h-12 w-12 text-white/10" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black font-headline text-white/40">لا توجد دروس قادمة حالياً</h3>
                <p className="text-white/20 font-medium max-w-md mx-auto leading-relaxed italic">
                  نحن نعمل على تجهيز جدول علمي متميز. ابقَ على اطلاع من خلال متابعتنا على قنوات التواصل الاجتماعي.
                </p>
              </div>
              <Button onClick={() => setActiveFilter('all')} variant="outline" className="rounded-2xl px-12 h-14 border-white/10 font-black hover:bg-white/5 transition-all">
                استكشف كل الدروس
              </Button>
            </motion.div>
          )}
        </main>

        {/* 📜 Masterclass Quote */}
        <section className="mt-40 max-w-3xl mx-auto text-center space-y-8">
           <div className="p-1 w-20 h-1 bg-primary/20 mx-auto rounded-full" />
           <p className="text-2xl md:text-3xl font-black font-headline text-white/60 leading-relaxed italic">
              "إنما العلم بالتعلم، وإنما الحلم بالتحلم، ومن يتحر الخير يعطه، ومن يتق الشر يوقه"
           </p>
           <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">رسول الله ﷺ</div>
        </section>
      </div>
    </div>
  );
}

