'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trophy, Star, Zap, Flame, Calendar, MousePointer2, HeartPulse, BookOpen, Sparkles, HandHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useSync } from '@/hooks/useSync';

const CHALLENGES = [
  { id: 1, title: 'الصلاة على النبي ﷺ', task: 'صلِّ على النبي 10 مرات بيقين وثبات', points: 10, icon: HeartPulse, color: 'emerald' },
  { id: 2, title: 'تدبّر آية', task: 'اقرأ آية واحدة من كتاب الله وتفكر في عمق معناها', points: 15, icon: BookOpen, color: 'blue' },
  { id: 3, title: 'ذكر الله', task: 'قل "سبحان الله وبحمده" 33 مرة بخشوع', points: 20, icon: Sparkles, color: 'amber' },
  { id: 4, title: 'دعاء بظهر الغيب', task: 'ادعُ لأخيك المسلم بظهر الغيب في ساعة استجابة', points: 25, icon: HandHeart, color: 'rose' },
];

export function DailyChallenges() {
  const { state: userState, updateState: syncUpdate } = useSync();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Handle daily reset logic
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('waqfah_challenges_date');
    
    if (savedDate !== today) {
      localStorage.setItem('waqfah_challenges_date', today);
      syncUpdate({ completedChallenges: [] });
    }
  }, [syncUpdate]);

  const completed = userState.completedChallenges || [];

  const toggleChallenge = (id: number) => {
    const isAlreadyDone = completed.includes(id);
    const next = isAlreadyDone ? completed.filter(c => c !== id) : [...completed, id];
    
    const challenge = CHALLENGES.find(ch => ch.id === id);
    const pointDiff = isAlreadyDone ? -(challenge?.points || 0) : (challenge?.points || 0);

    syncUpdate({ 
      completedChallenges: next,
      points: (userState.points || 0) + pointDiff
    });
    
    if (!isAlreadyDone) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#ffffff']
      });
    }
  };

  if (!mounted) return null;

  const totalPoints = completed.reduce((acc, id) => {
    const c = CHALLENGES.find(ch => ch.id === id);
    return acc + (c?.points || 0);
  }, 0);

  const allDone = completed.length === CHALLENGES.length;

  return (
    <section className="container px-4 py-8">
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-stretch">
          {/* Stats / Progress */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-8 text-center lg:text-right py-4">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <Trophy className="w-4 h-4" /> رفيق الصالحات
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">تحديات <span className="text-emerald-400">اليوم</span> <br/> الإيمانية</h2>
                <p className="text-white/40 font-medium text-lg max-w-sm lg:ms-auto">خطوات بسيطة، لكنها عظيمة في الميزان الرباني.</p>
            </div>
            
            <div className="bg-white/[0.02] rounded-[3rem] p-10 border border-white/5 flex flex-col items-center justify-center shadow-inner relative overflow-hidden group mt-auto h-full min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="14"
                            fill="transparent"
                            className="text-white/5"
                        />
                        <motion.circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="14"
                            strokeDasharray={88 * 2 * Math.PI}
                            initial={{ strokeDashoffset: 88 * 2 * Math.PI }}
                            animate={{ strokeDashoffset: 88 * 2 * Math.PI * (1 - completed.length / CHALLENGES.length) }}
                            strokeLinecap="round"
                            fill="transparent"
                            className="text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-black text-white drop-shadow-2xl tracking-tighter">{totalPoints}</span>
                        <span className="text-xs font-bold text-white/20 uppercase tracking-[0.4em] mt-2">نقطة</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Challenge List */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 h-full">
              {CHALLENGES.map((challenge, i) => {
                const isDone = completed.includes(challenge.id);
                const colorMap = {
                    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10',
                    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400 shadow-blue-500/10',
                    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400 shadow-amber-500/10',
                    rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400 shadow-rose-500/10'
                };
                const activeColor = colorMap[challenge.color as keyof typeof colorMap];
                
                return (
                  <motion.button
                    key={challenge.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ scale: 1.02, translateY: -8 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                    onClick={() => toggleChallenge(challenge.id)}
                    className={cn(
                      "flex flex-col items-start gap-8 p-10 rounded-[3.5rem] border transition-all duration-700 group relative overflow-hidden h-full text-right shadow-2xl min-h-[320px]",
                      isDone 
                        ? cn("bg-gradient-to-br", activeColor)
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                    )}
                  >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/5 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
                    
                    <div className="flex justify-between items-center w-full relative z-10">
                        <div className={cn(
                        "w-24 h-24 rounded-[2.2rem] flex items-center justify-center transition-all duration-700 shadow-2xl border border-white/5",
                        isDone ? "bg-white text-emerald-600 scale-110 rotate-[10deg]" : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"
                        )}>
                        {isDone ? <CheckCircle2 className="w-12 h-12" /> : <challenge.icon className="w-12 h-12" strokeWidth={1.2} />}
                        </div>
                        <div className={cn(
                            "px-6 py-2.5 rounded-full text-xs font-black backdrop-blur-md border transition-all duration-500",
                            isDone ? "bg-white/20 border-white/20 text-white" : "bg-white/5 border-white/5 text-white/20"
                        )}>
                        +{challenge.points} نقطة
                        </div>
                    </div>

                    <div className="relative z-10 space-y-4 mt-auto w-full">
                      <h3 className={cn("font-black text-3xl md:text-4xl tracking-tighter transition-colors", isDone ? "text-white" : "text-white/80 group-hover:text-white")}>
                        {challenge.title}
                      </h3>
                      <p className={cn("text-lg font-medium leading-relaxed", isDone ? "text-white/60" : "text-white/20 group-hover:text-white/40")}>
                        {challenge.task}
                      </p>
                    </div>

                    {isDone && (
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute bottom-10 left-10"
                        >
                            <Zap className="w-10 h-10 text-white/20 fill-current" />
                        </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {allDone && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/20 to-amber-500/20 border border-emerald-500/20 text-center"
              >
                <p className="text-emerald-400 text-xl font-black flex items-center justify-center gap-4">
                  <Star className="w-6 h-6 fill-current" />
                  أتممت تحديات اليوم بنجاح! طوبى لك.
                  <Star className="w-6 h-6 fill-current" />
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
