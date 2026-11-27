'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tv, Users } from 'lucide-react';

import { FollowButton } from '@/components/follow-button';
import { getPlaceholderImage } from '@/lib/images';
import type { Program } from '@/lib/types';
import { cn, getInitials } from '@/lib/utils';

interface ProgramCardProps {
  program: Program;
  index?: number;
  pinnedMessage?: string;
}

const ProgramCardComponent = ({ program, pinnedMessage }: ProgramCardProps) => {
  const imageUrl =
    program.imageUrl || getPlaceholderImage(program.imageId)?.imageUrl || '';
  const followers = program.followerCount || 0;

  return (
    <article
      dir="rtl"
      className={cn(
        'group h-full flex flex-col justify-between rounded-2xl border border-border bg-card/85 p-5 shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md'
      )}
    >
      <div className="space-y-4">
        {/* Top Row: Square Channel Artwork + Title & Followers */}
        <Link
          href={`/programs/${program.slug}`}
          className="flex items-center gap-3.5 group/link"
        >
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden border border-border bg-muted shrink-0 shadow-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={program.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/link:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10 text-primary font-black text-sm">
                <Tv className="w-4 h-4 mb-0.5" />
                <span className="text-[11px] leading-none">{getInitials(program.name)}</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5 text-right">
            <h3 className="font-headline text-lg font-black text-foreground group-hover/link:text-primary transition-colors line-clamp-1 leading-snug">
              {program.name}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/80 border border-border text-[11px] font-bold text-muted-foreground">
              <Users className="w-3 h-3 text-primary" />
              <span>{followers.toLocaleString('ar-EG')} متابع</span>
            </div>
          </div>
        </Link>

        {/* Bio / Description */}
        <Link href={`/programs/${program.slug}`} className="block">
          <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {program.bio || 'استكشف الدروس والسلاسل العلمية المنشورة عبر هذا البرنامج.'}
          </p>
        </Link>

        {/* Optional Pinned Note */}
        {pinnedMessage && (
          <div className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-[11px] font-medium text-primary line-clamp-2 leading-relaxed">
              &laquo;{pinnedMessage}&raquo;
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center gap-2">
        <div className="flex-1">
          <FollowButton
            programId={program.id}
            className="h-9 rounded-xl text-xs font-bold w-full shadow-none"
          />
        </div>
        <Link
          href={`/programs/${program.slug}`}
          aria-label={`تصفح قناة ${program.name}`}
          className="h-9 px-3 rounded-xl border border-border bg-background/80 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>القناة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};

export const ProgramCard = memo(ProgramCardComponent);
