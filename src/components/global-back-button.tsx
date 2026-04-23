
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Magnetic from './magnetic';
import { cn } from '@/lib/utils';

export function GlobalBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show on the homepage
  if (pathname === '/') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="fixed top-20 md:top-24 left-4 md:left-6 z-[60]"
      >
        <Magnetic>
          <button
            onClick={() => router.back()}
            className={cn(
                "group flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl",
                "bg-black/20 md:bg-white/5 backdrop-blur-2xl border border-white/10 text-white/60",
                "hover:bg-primary hover:text-white hover:border-primary transition-all duration-500",
                "shadow-2xl shadow-black/50 active:scale-90"
            )}
            title="رجوع"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        </Magnetic>
      </motion.div>
    </AnimatePresence>
  );
}
