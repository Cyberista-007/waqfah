'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListVideo, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import type { LectureChapter } from '@/lib/types';

interface LectureChaptersProps {
  chapters: LectureChapter[];
  currentTime?: number;      // current playback position in seconds
  onSeek?: (time: number) => void; // called when user clicks a chapter
  className?: string;
}

export function LectureChapters({ chapters, currentTime = 0, onSeek, className }: LectureChaptersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!chapters || chapters.length === 0) return null;

  // Sort chapters by startTime
  const sorted = [...chapters].sort((a, b) => a.startTime - b.startTime);

  // Find active chapter index
  const activeIdx = sorted.reduce((acc, ch, idx) => {
    return currentTime >= ch.startTime ? idx : acc;
  }, 0);

  return (
    <div className={cn('rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListVideo className="w-4 h-4 text-primary" />
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">فصول المحاضرة</p>
            <p className="text-[11px] text-muted-foreground">{chapters.length} فصل</p>
          </div>
        </div>
        {isExpanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
        }
      </button>

      {/* Chapters list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-2 divide-y divide-border/30">
              {sorted.map((chapter, idx) => {
                const isActive = idx === activeIdx;
                const nextChapter = sorted[idx + 1];
                const chapterDuration = nextChapter
                  ? nextChapter.startTime - chapter.startTime
                  : undefined;

                return (
                  <motion.button
                    key={idx}
                    onClick={() => onSeek?.(chapter.startTime)}
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full flex items-center gap-4 px-5 py-3.5 text-right transition-all',
                      'hover:bg-muted/40 cursor-pointer',
                      isActive && 'bg-primary/8'
                    )}
                  >
                    {/* Number / Active indicator */}
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {isActive ? '▶' : idx + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm leading-tight truncate',
                        isActive ? 'font-bold text-primary' : 'font-medium text-foreground/80'
                      )}>
                        {chapter.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                          {formatDuration(chapter.startTime)}
                        </span>
                        {chapterDuration && (
                          <span className="text-[10px] text-muted-foreground/50">
                            · {formatDuration(chapterDuration)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active bar */}
                    {isActive && (
                      <div className="w-1 h-full absolute left-0 top-0 bg-primary rounded-r-full" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
