'use client';

import { useReadingMode } from './reading-provider';
import { Button } from '@/components/ui/button';
import { BookOpen, X, Plus, Minus, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ReadingModeToggle() {
  const { isReadingMode, toggleReadingMode, fontSize, setFontSize } = useReadingMode();

  return (
    <div className={cn("flex items-center gap-2", isReadingMode ? "fixed top-6 right-6 z-[110]" : "relative")}>
      <AnimatePresence>
        {isReadingMode && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full p-2 pr-4 shadow-2xl"
          >
             <div className="flex items-center gap-2 border-r border-white/10 pr-4 me-2">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFontSize(Math.min(fontSize + 2, 32))}
                    className="h-8 w-8 rounded-full hover:bg-white/10 text-white"
                >
                    <Plus className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1.5 px-2">
                    <Type className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs font-black text-white w-4 text-center">{fontSize}</span>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFontSize(Math.max(fontSize - 2, 14))}
                    className="h-8 w-8 rounded-full hover:bg-white/10 text-white"
                >
                    <Minus className="w-4 h-4" />
                </Button>
             </div>
             <Button 
                onClick={toggleReadingMode}
                className="h-10 px-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs gap-2 shadow-lg"
             >
                <X className="w-4 h-4" /> إنهاء التركيز
             </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isReadingMode && (
        <Button 
          onClick={toggleReadingMode}
          variant="outline"
          className="h-12 px-6 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-black text-sm gap-3 group"
        >
          <BookOpen className="w-5 h-5 text-emerald-400 transition-transform group-hover:scale-110" />
          نمط التركيز والقراءة
        </Button>
      )}
    </div>
  );
}
