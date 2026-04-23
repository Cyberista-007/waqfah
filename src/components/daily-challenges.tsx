'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trophy, Star, Zap, Flame, Calendar, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const CHALLENGES = [
  { id: 1, title: 'الصلاة على النبي ﷺ', task: 'صلِّ على النبي 10 مرات بيقين', points: 10, icon: HeartPulse },
  { id: 2, title: 'تدبّر آية', task: 'اقرأ آية واحدة وتفكر في معناها', points: 15, icon: BookOpen },
  { id: 3, title: 'ذكر الله', task: 'قل "سبحان الله وبحمده" 33 مرة', points: 20, icon: Sparkles },
  { id: 4, title: 'دعاء بظهر الغيب', task: 'ادعُ لأخيك المسلم بظهر الغيب', points: 25, icon: HandHeart },
];

import { HeartPulse, BookOpen, Sparkles, HandHeart } from 'lucide-react';

export function DailyChallenges() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('waqfah_daily_challenges');
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('waqfah_challenges_date');
    
    if (saved && savedDate === today) {
      setCompleted(JSON.parse(saved));
    } else {
      localStorage.setItem('waqfah_challenges_date', today);
      localStorage.removeItem('waqfah_daily_challenges');
    }
  }, []);

  const toggleChallenge = (id: number) => {
    setCompleted(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      localStorage.setItem('waqfah_daily_challenges', JSON.stringify(next));
      
      if (!prev.includes(id)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#fbbf24', '#ffffff']
        });
      }
      return next;
    });
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

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Stats / Progress */}
          <div className="lg:w-1/3 text-center lg:text-right space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <Trophy className="w-4 h-4" /> رفيق الصالحات
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">تحديات <span className="text-emerald-400">اليوم</span> الإيمانية</h2>
            <p className="text-white/40 font-medium">خطوات بسيطة، لكنها عظيمة في الميزان.</p>
            
            <div className="pt-6">
                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 flex flex-col items-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-white/5"
                            />
                            <motion.circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={58 * 2 * Math.PI}
                                initial={{ strokeDashoffset: 58 * 2 * Math.PI }}
                                animate={{ strokeDashoffset: 58 * 2 * Math.PI * (1 - completed.length / CHALLENGES.length) }}
                                strokeLinecap="round"
                                fill="transparent"
                                className="text-emerald-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-white">{totalPoints}</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">نقطة</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Challenge List */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHALLENGES.map((challenge, i) => {
                const isDone = completed.includes(challenge.id);
                return (
                  <motion.button
                    key={challenge.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => toggleChallenge(challenge.id)}
                    className={cn(
                      "flex items-center gap-5 p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden",
                      isDone 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                      isDone ? "bg-emerald-500 text-white" : "bg-white/5 text-white/40"
                    )}>
                      {isDone ? <CheckCircle2 className="w-6 h-6" /> : <challenge.icon className="w-6 h-6" />}
                    </div>
                    <div className="text-right flex-1">
                      <h3 className={cn("font-black text-lg transition-colors", isDone ? "text-emerald-400" : "text-white")}>
                        {challenge.title}
                      </h3>
                      <p className="text-white/30 text-xs font-medium">{challenge.task}</p>
                    </div>
                    <div className="bg-white/5 px-2.5 py-1 rounded-lg text-[10px] font-black text-white/20">
                      +{challenge.points}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {allDone && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-amber-500/20 border border-emerald-500/20 text-center"
              >
                <p className="text-emerald-400 font-black flex items-center justify-center gap-3">
                  <Star className="w-5 h-5 fill-current" />
                  أتممت تحديات اليوم بنجاح! طوبى لك.
                  <Star className="w-5 h-5 fill-current" />
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
