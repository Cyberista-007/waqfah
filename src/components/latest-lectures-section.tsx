'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import { LectureCard } from '@/components/lecture-card';
import { ProgramArtwork } from '@/components/program-artwork';
import { useCollection } from '@/firebase';
import { getPlaceholderImage } from '@/lib/images';
import type { Lecture, ListenHistoryItem, Playlist, Program } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LatestLecturesSectionProps {
  programs: Program[];
  regularLectures: Lecture[];
  listenHistory?: ListenHistoryItem[] | null;
  playlists?: Playlist[] | null;
}

function getTimestampSeconds(val: unknown): number {
  if (!val) return 0;
  if (typeof val === 'object' && val !== null) {
    const ts = val as { seconds?: number; toDate?: () => Date };
    if (typeof ts.seconds === 'number') return ts.seconds;
    if (typeof ts.toDate === 'function') return Math.floor(ts.toDate().getTime() / 1000);
  }
  if (typeof val === 'string' || typeof val === 'number') {
    const ms = new Date(val).getTime();
    return Number.isNaN(ms) ? 0 : Math.floor(ms / 1000);
  }
  return 0;
}

export function LatestLecturesSection({
  programs,
  regularLectures,
  listenHistory,
  playlists,
}: LatestLecturesSectionProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) || null,
    [programs, selectedProgramId]
  );

  const programImageMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const p of programs) {
      map[p.id] = p.imageUrl || getPlaceholderImage(p.imageId)?.imageUrl;
    }
    return map;
  }, [programs]);

  // Live cached query for up to 20 latest videos of the selected channel
  const { data: channelRawLectures, isLoading: isChannelLoading } = useCollection<Lecture>(
    selectedProgram ? 'lectures' : null,
    selectedProgram ? { where: ['programId', '==', selectedProgram.id], limit: 250, once: true } : undefined
  );

  const channelLatest20 = useMemo(() => {
    if (!selectedProgram) return [];

    // Combine Firestore query results + local fallback matches (in case older records only had programName/Slug)
    const map = new Map<string, Lecture>();
    (channelRawLectures || []).forEach((lec) => map.set(lec.id, lec));
    regularLectures.forEach((lec) => {
      if (
        lec.programId === selectedProgram.id ||
        (selectedProgram.slug && lec.programSlug === selectedProgram.slug) ||
        lec.programName === selectedProgram.name
      ) {
        if (!map.has(lec.id)) map.set(lec.id, lec);
      }
    });

    const allForChannel = Array.from(map.values()).sort((a, b) => {
      const tA = getTimestampSeconds(a.publishedAt) || getTimestampSeconds(a.createdAt);
      const tB = getTimestampSeconds(b.publishedAt) || getTimestampSeconds(b.createdAt);
      return tB - tA;
    });

    const longVideos = allForChannel.filter((l) => l.duration > 180);
    const chosen = longVideos.length > 0 ? longVideos : allForChannel;
    return chosen.slice(0, 20);
  }, [selectedProgram, channelRawLectures, regularLectures]);

  useEffect(() => {
    setVisibleCount(6);
  }, [regularLectures]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedProgramId]);

  const scrollHorizontal = (direction: 'next' | 'prev') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // In RTL, negative scrollLeft moves further into the list on Chrome/Edge/Firefox
    const step = Math.min(el.clientWidth * 0.8, 660);
    el.scrollBy({
      left: direction === 'next' ? -step : step,
      behavior: 'smooth',
    });
  };

  const hasMoreToLoad = visibleCount < regularLectures.length;

  return (
    <section className="relative">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-5 border-b border-border/60">
        <div>
          <div className="luxury-badge bg-primary/10 text-primary border-primary/20 mb-3">
            <Clapperboard className="w-3.5 h-3.5" />
            <span>طرحٌ متجدد</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-headline text-foreground tracking-tight flex items-center gap-3">
            <span>أحدث المحاضرات</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {selectedProgram ? channelLatest20.length : regularLectures.length}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium max-w-2xl">
            محاضرات وتوجيهات منتقاة بعناية لترسيخ العلم الشرعي وتزكية النفوس
          </p>
        </div>

        <Link href="/lectures" className="luxury-pill-btn group self-start sm:self-auto">
          <span>عرض الكل</span>
          <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1.5 transition-transform duration-300" />
        </Link>
      </div>

      {/* Square Channel Tiles Showcase (Thmanyah-style) */}
      {programs.length > 0 && (
        <div className="mb-8 space-y-4" dir="rtl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedProgramId(null)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border',
                  !selectedProgramId
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card/60 text-muted-foreground border-border hover:text-foreground hover:border-primary/40'
                )}
              >
                الكل ({regularLectures.length})
              </button>
              <span className="text-xs text-muted-foreground font-medium">
                اضغط على صورة القناة لعرض أحدث 20 فيديو:
              </span>
            </div>

            {selectedProgram && (
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-primary">{selectedProgram.name}</span>
                <Link
                  href={`/programs/${selectedProgram.slug}`}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>صفحة القناة</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
            {programs.map((program) => {
              const isSelected = selectedProgramId === program.id;
              const imgUrl =
                program.imageUrl || getPlaceholderImage(program.imageId)?.imageUrl || '';

              return (
                <button
                  key={program.id}
                  type="button"
                  onClick={() =>
                    setSelectedProgramId((prev) => (prev === program.id ? null : program.id))
                  }
                  title={program.name}
                  aria-label={program.name}
                  aria-pressed={isSelected}
                  className={cn(
                    'group relative aspect-square rounded-2xl overflow-hidden border bg-card transition-all duration-200 cursor-pointer focus:outline-none',
                    isSelected
                      ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background border-border scale-[1.03] shadow-lg'
                      : selectedProgramId
                      ? 'border-border/70 opacity-70 hover:opacity-100 hover:scale-[1.02]'
                      : 'border-border/70 hover:scale-[1.03] shadow-sm'
                  )}
                >
                  <ProgramArtwork
                    src={imgUrl}
                    alt={program.name}
                    fallbackText={program.name}
                    compactFallback
                  />

                  {/* Subtle bottom hover label */}
                  <div
                    className={cn(
                      'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1.5 transition-opacity duration-200 pointer-events-none',
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    <p className="text-[10px] font-bold text-white truncate text-center">
                      {program.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Display: Horizontal 20-video strip for selected channel OR default All grid */}
      {selectedProgram ? (
        <div className="space-y-4">
          {/* Selected Channel Controls Strip */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {selectedProgram.imageUrl && (
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-border shrink-0">
                  <ProgramArtwork
                    src={selectedProgram.imageUrl}
                    alt={selectedProgram.name}
                    fallbackText={selectedProgram.name}
                    compactFallback
                  />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-foreground truncate">
                  أحدث فيديوهات {selectedProgram.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  مرّر جانبياً لاستعراض حتى 20 فيديو
                </p>
              </div>
            </div>

            {channelLatest20.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollHorizontal('prev')}
                  aria-label="السابق"
                  className="w-9 h-9 rounded-full border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontal('next')}
                  aria-label="التالي"
                  className="w-9 h-9 rounded-full border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {isChannelLoading && channelLatest20.length === 0 ? (
            <div className="flex items-center justify-center py-16 rounded-2xl border border-border bg-card/50">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : channelLatest20.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-border bg-card/50 text-sm text-muted-foreground">
              لا توجد فيديوهات منشورة لهذه القناة حالياً.
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              dir="rtl"
              className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth custom-scrollbar"
            >
              {channelLatest20.map((item, index) => (
                <div key={item.id} className="w-[280px] sm:w-[310px] shrink-0 snap-start">
                  <LectureCard
                    lecture={item}
                    index={index}
                    listenHistory={listenHistory || undefined}
                    playlists={playlists || undefined}
                    programImageUrl={item.programId ? programImageMap[item.programId] : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : regularLectures.length === 0 ? (
        <div className="text-center py-14 luxury-glass rounded-3xl text-muted-foreground border border-border/40 font-medium">
          لا يوجد محتوى لعرضه حالياً في هذا القسم.
        </div>
      ) : (
        <>
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {regularLectures.slice(0, visibleCount).map((item, index) => (
              <LectureCard
                lecture={item}
                index={index}
                key={item.id}
                listenHistory={listenHistory || undefined}
                playlists={playlists || undefined}
                programImageUrl={item.programId ? programImageMap[item.programId] : undefined}
              />
            ))}
          </div>

          {hasMoreToLoad && (
            <div className="text-center mt-10">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) => Math.min(prev + 6, regularLectures.length))
                }
                className="luxury-pill-btn px-8 py-3.5 text-sm font-black group bg-card/60 hover:bg-primary/10 border-border hover:border-primary/40 text-foreground hover:text-primary transition-all duration-300 shadow-lg cursor-pointer"
              >
                <span>تحميل المزيد من أحدث المحاضرات</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300 text-primary" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
