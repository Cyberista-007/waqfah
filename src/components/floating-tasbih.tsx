'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, RotateCcw, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FloatingTasbih() {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [vibrate, setVibrate] = useState(false);

  // Load count from local storage
  useEffect(() => {
    const saved = localStorage.getItem('floating_tasbih_count');
    if (saved) setCount(parseInt(saved));
  }, []);

  // Save count to local storage
  useEffect(() => {
    localStorage.setItem('floating_tasbih_count', count.toString());
  }, [count]);

  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(prev => prev + 1);
    setVibrate(true);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setVibrate(false), 100);
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل تريد تصفير العداد؟')) {
      setCount(0);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[100] hide-in-reading-mode">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-64 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-4xl overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 blur-[40px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">المسبحة العائمة</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); reset(e); }}
                  className="p-2 hover:bg-rose-500/10 text-white/20 hover:text-rose-500 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div 
                className="relative w-40 h-40 flex items-center justify-center cursor-pointer group"
                onClick={increment}
              >
                <motion.div 
                  animate={vibrate ? { scale: 0.95 } : { scale: 1 }}
                  className="absolute inset-0 rounded-full border-2 border-white/5 bg-white/[0.02] shadow-inner group-active:scale-95 transition-transform"
                />
                <div className="relative z-10 text-center">
                  <motion.div 
                    key={count}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black text-white tabular-nums tracking-tighter"
                  >
                    {count}
                  </motion.div>
                  <div className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] mt-1">تـسـبـيـح</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Fingerprint className={cn("w-6 h-6 transition-colors", vibrate ? "text-emerald-500" : "text-white/10")} />
                <p className="text-[8px] text-white/20 font-medium">اضغط على الدائرة للتسبيح</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all shadow-2xl relative overflow-hidden group border",
          isOpen 
            ? "bg-white text-black border-white" 
            : "bg-emerald-600 text-white border-emerald-500/50 shadow-glow-emerald"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative flex flex-col items-center">
              <Plus className="w-4 h-4 absolute -top-1 -right-1 opacity-50" />
              <Fingerprint className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
