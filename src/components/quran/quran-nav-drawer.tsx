'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JUZ_DATA, SurahInfo } from './quran-constants';

export type NavTab = 'surahs' | 'juz' | 'bookmarks';

export function QuranNavDrawer({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
  surahs,
  currentPage,
  onSelectSurah,
  onSelectJuzPage,
  selectedSurah,
  bookmarks,
  onSelectBookmark,
}: {
  isOpen: boolean;
  activeTab: NavTab;
  onClose: () => void;
  onTabChange: (tab: NavTab) => void;
  surahs: SurahInfo[];
  currentPage: number;
  onSelectSurah: (n: number) => void;
  onSelectJuzPage: (page: number) => void;
  selectedSurah: number | null;
  bookmarks: string[];
  onSelectBookmark: (id: string) => void;
}) {
  const tabs: { id: NavTab; label: string }[] = [
    { id: 'surahs', label: 'السور' },
    { id: 'juz', label: 'الأجزاء' },
    { id: 'bookmarks', label: 'علامات' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm"
          />
          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-[401] w-80 bg-[#111] border-l border-white/10 flex flex-col shadow-2xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">مصحف وقفة</p>
                  <p className="text-[10px] text-white/30 font-bold mt-0.5">صفحة {currentPage}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-3 border-b border-white/10 shrink-0">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => onTabChange(t.id)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-xs font-black transition-all',
                    activeTab === t.id
                      ? 'bg-amber-500 text-black shadow-lg'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Surahs Tab */}
              {activeTab === 'surahs' && (
                <div className="py-2">
                  {surahs.map(s => (
                    <button
                      key={s.number}
                      onClick={() => { onSelectSurah(s.number); onClose(); }}
                      className={cn(
                        'w-full flex items-center justify-between px-5 py-3 text-right transition-all hover:bg-white/5',
                        selectedSurah === s.number && 'bg-amber-500/10 border-r-2 border-amber-400'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0',
                          s.revelationType === 'Meccan'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        )}>
                          🕌
                        </span>
                        <span className={cn(
                          'text-sm font-black',
                          selectedSurah === s.number ? 'text-amber-400' : 'text-white/80'
                        )}>
                          {s.number}. {s.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30 font-bold">{s.numberOfAyahs} آية</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Juz Tab */}
              {activeTab === 'juz' && (
                <div className="py-2">
                  {JUZ_DATA.map(j => (
                    <button
                      key={j.juz}
                      onClick={() => { onSelectJuzPage(j.page); onClose(); }}
                      className="w-full flex items-center justify-between px-5 py-3 text-right transition-all hover:bg-white/5 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-amber-500/20 transition-colors">
                          {j.juz}
                        </span>
                        <div>
                          <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors">
                            الجزء {j.juz}
                          </p>
                          <p className="text-[10px] text-amber-400/70 font-bold mt-0.5">
                            {j.surah}: <span className="text-white/40">{j.start}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/30 font-bold shrink-0">{j.page}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Bookmarks Tab */}
              {activeTab === 'bookmarks' && (
                <div className="py-2">
                  {bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 px-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                        <Bookmark className="w-7 h-7 text-white/20" />
                      </div>
                      <p className="text-white/30 text-xs font-bold">لا توجد علامات مرجعية بعد</p>
                      <p className="text-white/20 text-[10px]">اضغط على أيقونة الإشارة في أي آية لحفظها هنا</p>
                    </div>
                  ) : (
                    bookmarks.filter(b => b.startsWith('quran_')).map(b => (
                      <button
                        key={b}
                        onClick={() => { onSelectBookmark(b); onClose(); }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-right transition-all hover:bg-white/5"
                      >
                        <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-sm text-white/70 font-bold">{b.replace('quran_', '')}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
