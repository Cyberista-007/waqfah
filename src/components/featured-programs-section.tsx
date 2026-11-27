'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Tv } from 'lucide-react';

import { getPlaceholderImage } from '@/lib/images';
import type { Program } from '@/lib/types';
import { getInitials } from '@/lib/utils';

interface FeaturedProgramsSectionProps {
  programs: Program[];
}

const INITIAL_VISIBLE = 12;

export function FeaturedProgramsSection({ programs }: FeaturedProgramsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  if (!programs || programs.length === 0) {
    return null;
  }

  const displayedPrograms = programs.slice(0, visibleCount);
  const canShowMore = visibleCount < programs.length;
  const isExpanded = visibleCount > INITIAL_VISIBLE;

  return (
    <section className="relative" dir="rtl">
      {/* Minimal Header matching Thmanyah Featured Programs style */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-black font-headline text-foreground tracking-tight">
            أبرز البرامج
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/80">
            {programs.length}
          </span>
        </div>

        <Link
          href="/programs"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition-colors group shrink-0"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* 6-Column Square Artwork Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
        {displayedPrograms.map((program) => {
          const imageUrl =
            program.imageUrl || getPlaceholderImage(program.imageId)?.imageUrl || '';

          return (
            <Link
              key={program.id}
              href={`/programs/${program.slug}`}
              title={program.name}
              aria-label={program.name}
              className="group relative block aspect-square rounded-2xl overflow-hidden border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={program.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-muted/80 text-foreground p-4 text-center">
                  <Tv className="w-7 h-7 text-primary mb-2" />
                  <span className="font-headline font-black text-sm line-clamp-2 leading-snug">
                    {program.name || getInitials(program.name)}
                  </span>
                </div>
              )}

              {/* Subtle Title Overlay Only On Hover/Focus */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none">
                <p className="text-xs sm:text-sm font-black font-headline text-white truncate">
                  {program.name}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Expand / Collapse Controls */}
      {programs.length > INITIAL_VISIBLE && (
        <div className="flex justify-center gap-3 mt-8">
          {canShowMore && (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((prev) => Math.min(prev + INITIAL_VISIBLE, programs.length))
              }
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold bg-card border border-border hover:border-primary/40 hover:bg-primary/10 text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <span>عرض المزيد ({programs.length - visibleCount})</span>
              <ChevronDown className="w-4 h-4 text-primary" />
            </button>
          )}
          {isExpanded && (
            <button
              type="button"
              onClick={() => setVisibleCount(INITIAL_VISIBLE)}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold bg-muted/60 border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
