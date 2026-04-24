'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function TasbihCard() {
  const [count, setCount] = useState(0);
  const [vibrate, setVibrate] = useState(false);

  const increment = () => {
    setCount(prev => prev + 1);
    setVibrate(true);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setVibrate(false), 100);
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(0);
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-zinc-950/40 backdrop-blur-3xl border-white/5 rounded-[3rem] transition-all duration-700 hover:border-emerald-500/20 shadow-2xl h-full flex flex-col items-center justify-center min-h-[400px] cursor-pointer select-none"
      onClick={increment}
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />
        <div className="absolute top-10 right-10 text-white/[0.02] text-9xl font-black rotate-12 group-hover:rotate-6 transition-transform duration-1000">📿</div>
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.03]" />
      </div>

      <CardContent className="relative z-10 w-full flex flex-col items-center gap-8 p-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">
            <Sparkles className="w-3.5 h-3.5" />
            المسبحة الإلكترونية
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter">الذكر المستمر</h3>
        </div>

        {/* Counter Display */}
        <div className="relative w-56 h-56 flex items-center justify-center group/circle">
          <motion.div 
            animate={vibrate ? { scale: 0.92 } : { scale: 1 }}
            className="absolute inset-0 rounded-full border-4 border-white/5 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.05)]"
          >
            <div className="w-[92%] h-[92%] rounded-full border-2 border-dashed border-emerald-500/20 group-hover/circle:border-emerald-500/40 transition-colors animate-spin-slow" />
          </motion.div>

          <div className="relative z-10 text-center">
            <motion.div 
              key={count}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl"
            >
              {count}
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={reset}
            className="w-16 h-16 rounded-2xl hover:bg-rose-500/10 text-white/20 hover:text-rose-500 transition-all border border-white/5 hover:border-rose-500/20"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
          
          <div className="w-24 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group/btn">
             <Fingerprint className="w-8 h-8 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          اضغط على البطاقة للتسبيح
        </p>
      </CardContent>
    </Card>
  );
}
