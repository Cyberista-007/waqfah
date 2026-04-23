'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, RotateCcw, X, Plus, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FloatingTasbih() {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-[100] md:bottom-10 md:right-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
            isOpen 
                ? "bg-rose-500 text-white rotate-90" 
                : "bg-white/10 backdrop-blur-3xl border border-white/20 text-emerald-400 hover:bg-emerald-500/20"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                <X className="w-8 h-8" />
              </motion.div>
            ) : (
              <motion.div key="p" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} className="relative">
                <Fingerprint className="w-8 h-8" />
                {count > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#09090b]">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Tasbih Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="w-full max-w-sm aspect-square bg-[#0c0c0c] rounded-[4rem] border border-white/10 shadow-[0_0_100px_rgba(16,185,129,0.15)] relative overflow-hidden flex flex-col items-center justify-center select-none"
              onClick={increment}
            >
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full" />
                 <div className="absolute top-10 right-10 text-white/[0.02] text-9xl font-black rotate-12">📿</div>
              </div>

              {/* Progress Circle Wrapper */}
              <div className="relative w-64 h-64 flex items-center justify-center group">
                 {/* Main Click Area */}
                 <motion.div 
                   animate={vibrate ? { scale: 0.95 } : { scale: 1 }}
                   className="absolute inset-0 rounded-full border-4 border-white/5 flex items-center justify-center"
                 >
                    <div className="w-[90%] h-[90%] rounded-full border-2 border-dashed border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors animate-spin-slow" />
                 </motion.div>

                 {/* Digital Display */}
                 <div className="relative z-10 text-center">
                    <motion.div 
                        key={count}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-8xl font-black text-white tabular-nums tracking-tighter"
                    >
                        {count}
                    </motion.div>
                    <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mt-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-3 h-3" /> تسبيح
                    </p>
                 </div>
              </div>

              {/* Actions */}
              <div className="absolute bottom-10 flex items-center gap-8 z-20">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={reset}
                    className="w-14 h-14 rounded-2xl hover:bg-white/5 text-white/20 hover:text-rose-400 transition-all border border-transparent hover:border-white/10"
                >
                    <RotateCcw className="w-6 h-6" />
                </Button>
                <div className="w-20 h-2 bg-white/5 rounded-full" />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="w-14 h-14 rounded-2xl hover:bg-white/5 text-white/20 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                    <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Instruction */}
              <div className="absolute bottom-28 text-white/10 text-[10px] font-black uppercase tracking-widest animate-pulse">
                اضغط في أي مكان للتسبيح
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
