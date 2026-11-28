'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { ProgramArtwork } from '@/components/program-artwork';
import { getPlaceholderImage } from '@/lib/images';
import type { Program } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChannelFilterStripProps {
  programs: Program[];
  selectedProgramId: string | null;
  onSelectProgram: (programId: string | null) => void;
  totalCount: number;
  hintText?: string;
}

/**
 * Shared square channel-tile showcase for filtering lectures by program/channel.
 */
export function ChannelFilterStrip({
  programs,
  selectedProgramId,
  onSelectProgram,
  totalCount,
  hintText = 'اضغط على صورة القناة لعرض فيديوهاتها:',
}: ChannelFilterStripProps) {
  if (!programs || programs.length === 0) return null;

  const selectedProgram = programs.find((p) => p.id === selectedProgramId) || null;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectProgram(null)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border',
              !selectedProgramId
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card/60 text-muted-foreground border-border hover:text-foreground hover:border-primary/40'
            )}
          >
            الكل ({totalCount})
          </button>
          <span className="text-xs text-muted-foreground font-medium">
            {hintText}
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
              onClick={() => onSelectProgram(isSelected ? null : program.id)}
              title={program.name}
              aria-label={program.name}
              aria-pressed={isSelected}
              className={cn(
                'group relative aspect-square rounded-2xl overflow-hidden border bg-card transition-all duration-200 cursor-pointer focus:outline-none',
                isSelected
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background border-primary scale-[1.03] shadow-lg'
                  : 'border-border/70 hover:scale-[1.03] shadow-sm'
              )}
            >
              <ProgramArtwork
                src={imgUrl}
                alt={program.name}
                fallbackText={program.name}
                compactFallback
              />

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
  );
}
