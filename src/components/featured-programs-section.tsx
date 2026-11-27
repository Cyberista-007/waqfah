'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Podcast } from 'lucide-react';

import { ProgramCard } from '@/components/program-card';
import type { Program } from '@/lib/types';

interface FeaturedProgramsSectionProps {
  programs: Program[];
}

export function FeaturedProgramsSection({ programs }: FeaturedProgramsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(4);

  if (!programs || programs.length === 0) {
    return null;
  }

  const displayedPrograms = programs.slice(0, visibleCount);
  const canShowMore = visibleCount < programs.length;
  const isExpanded = visibleCount > 4;

  return (
    <section className="relative" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-border/60">
        <div>
          <div className="luxury-badge bg-amber-500/10 text-amber-500 border-amber-500/20 mb-3">
            <Podcast className="w-3.5 h-3.5" />
            <span>منابر العلم والدعوة</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-headline text-foreground tracking-tight flex items-center gap-3">
            <span>أبرز البرامج</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {programs.length}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium max-w-2xl">
            قنوات ومسارات علمية ودعوية منتقاة لنخبة من العلماء والدعاة
          </p>
        </div>

        <Link href="/programs" className="luxury-pill-btn group self-start sm:self-auto">
          <span>عرض الكل</span>
          <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1.5 transition-transform duration-300" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayedPrograms.map((program, index) => (
          <ProgramCard key={program.id} program={program} index={index} />
        ))}
      </div>

      {/* Expand / Collapse Controls */}
      {programs.length > 4 && (
        <div className="flex justify-center gap-3 mt-8">
          {canShowMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 4, programs.length))}
              className="luxury-pill-btn px-6 py-2.5 text-xs sm:text-sm font-bold bg-card/70 hover:bg-primary/10 border-border hover:border-primary/40 text-foreground hover:text-primary transition-all cursor-pointer"
            >
              <span>عرض المزيد ({programs.length - visibleCount})</span>
              <ChevronDown className="w-4 h-4 text-primary" />
            </button>
          )}
          {isExpanded && (
            <button
              type="button"
              onClick={() => setVisibleCount(4)}
              className="luxury-pill-btn px-5 py-2.5 text-xs sm:text-sm font-bold bg-muted/50 hover:bg-muted border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <span>عرض أقل</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
