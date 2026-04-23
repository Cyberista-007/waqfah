'use client';

import { Search, Sparkles } from 'lucide-react';
import { useSearch } from './search-provider';
import { motion } from 'framer-motion';
import Magnetic from './magnetic';

export function HomeSearch() {
  const { openSearch } = useSearch();

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0">
        <motion.button 
          onClick={openSearch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between h-20 ps-8 pe-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-[40px] border border-white/10 text-white/30 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group/search text-start relative overflow-hidden"
        >
          {/* Internal Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover/search:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 text-primary group-hover/search:scale-110 transition-transform duration-500">
               <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">ابحث عن محاضرة، سلسلة، كتاب...</span>
          </div>

          <Magnetic>
             <div className="p-3 rounded-2xl bg-primary text-white shadow-lg group-hover/search:shadow-primary/40 transition-all duration-500">
                <Search className="w-6 h-6" />
             </div>
          </Magnetic>
        </motion.button>
    </div>
  );
}
