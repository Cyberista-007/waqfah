'use client';

import Image from 'next/image';
import { memo } from 'react';
import { Download, BookOpen, User, ArrowUpRight } from 'lucide-react';
import type { Book } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BookCardProps {
    book: Book;
    index?: number;
}

const categoryColors: Record<string, { border: string; shadow: string; badge: string; icon: string; glow: string }> = {
    'العقيدة والمنهج': { border: 'border-blue-500/30', shadow: 'shadow-blue-500/10', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: 'text-blue-400', glow: 'from-blue-500/10' },
    'الحديث الشريف':  { border: 'border-amber-500/30', shadow: 'shadow-amber-500/10', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: 'text-amber-400', glow: 'from-amber-500/10' },
    'الفقه':          { border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: 'text-emerald-400', glow: 'from-emerald-500/10' },
    'التفسير':        { border: 'border-purple-500/30', shadow: 'shadow-purple-500/10', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: 'text-purple-400', glow: 'from-purple-500/10' },
    'السيرة':         { border: 'border-rose-500/30', shadow: 'shadow-rose-500/10', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: 'text-rose-400', glow: 'from-rose-500/10' },
};

const defaultColors = {
    border: 'border-white/10',
    shadow: 'shadow-black/20',
    badge: 'bg-white/10 text-white/60 border-white/20',
    icon: 'text-emerald-400',
    glow: 'from-emerald-500/5',
};

const BookCardComponent = ({ book, index = 0 }: BookCardProps) => {
    const colors = (book.category && categoryColors[book.category]) || defaultColors;
    const coverSrc = book.imageUrl || `https://picsum.photos/seed/${book.slug || book.id}/300/420`;

    return (
        <div
            className={cn(
                'group relative flex flex-col rounded-[2.25rem] overflow-hidden cursor-pointer',
                'bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(255,255,255,0.05),0_15px_35px_rgba(0,0,0,0.5)]',
                'transition-all duration-500 ease-out',
                'hover:-translate-y-2 hover:border-emerald-500/25 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(255,255,255,0.05),0_25px_50px_rgba(16,185,129,0.04)] hover:bg-white/[0.03]',
            )}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* ── Book Cover ── */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <Image
                    src={coverSrc}
                    alt={`غلاف كتاب ${book.title}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                {/* Shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Top-right: Category badge */}
                {book.category && (
                    <div className={cn(
                        'absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase',
                        'px-2.5 py-1 rounded-full border backdrop-blur-md',
                        colors.badge
                    )}>
                        {book.category}
                    </div>
                )}

                {/* Top-left: Arrow reveal on hover */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center">
                        <ArrowUpRight size={12} className="text-white" />
                    </div>
                </div>

                {/* Bottom-left: Book icon */}
                <div className="absolute bottom-3 left-3">
                    <div className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <BookOpen size={12} className={colors.icon} />
                    </div>
                </div>
            </div>

            {/* ── Info ── */}
            <div className="flex flex-col gap-2 p-4 flex-1">
                {/* Title */}
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 text-right">
                    {book.title}
                </h3>

                {/* Author */}
                {book.author && (
                    <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[11px] text-white/45 line-clamp-1">{book.author}</span>
                        <User size={10} className="text-white/30 flex-shrink-0" />
                    </div>
                )}

                {/* Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent mt-1" />

                {/* Download CTA */}
                <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className={cn(
                        'group/dl flex items-center justify-center gap-2 w-full mt-auto',
                        'py-2 rounded-xl text-xs font-bold',
                        'bg-white/5 hover:bg-white/12 border border-white/8 hover:border-white/20',
                        'text-white/60 hover:text-white',
                        'transition-all duration-300',
                    )}
                    onClick={e => e.stopPropagation()}
                >
                    <Download
                        size={12}
                        className={cn('transition-transform duration-300 group-hover/dl:-translate-y-0.5', colors.icon)}
                    />
                    <span>تحميل PDF</span>
                </a>
            </div>
        </div>
    );
};

export const BookCard = memo(BookCardComponent);
