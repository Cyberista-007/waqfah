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
    'العقيدة والمنهج': { border: 'border-blue-500/30', shadow: 'shadow-blue-500/10', badge: 'bg-blue-500/20 text-blue-100 border-blue-400/40', icon: 'text-blue-400', glow: 'from-blue-500/10' },
    'الحديث الشريف':  { border: 'border-amber-500/30', shadow: 'shadow-amber-500/10', badge: 'bg-amber-500/20 text-amber-100 border-amber-400/40', icon: 'text-amber-400', glow: 'from-amber-500/10' },
    'الفقه':          { border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40', icon: 'text-emerald-400', glow: 'from-emerald-500/10' },
    'التفسير':        { border: 'border-purple-500/30', shadow: 'shadow-purple-500/10', badge: 'bg-purple-500/20 text-purple-100 border-purple-400/40', icon: 'text-purple-400', glow: 'from-purple-500/10' },
    'السيرة':         { border: 'border-rose-500/30', shadow: 'shadow-rose-500/10', badge: 'bg-rose-500/20 text-rose-100 border-rose-400/40', icon: 'text-rose-400', glow: 'from-rose-500/10' },
};

const defaultColors = {
    border: 'border-border',
    shadow: 'shadow-sm',
    badge: 'bg-black/60 text-white border-white/25',
    icon: 'text-emerald-400',
    glow: 'from-emerald-500/5',
};

const BookCardComponent = ({ book, index = 0 }: BookCardProps) => {
    const colors = (book.category && categoryColors[book.category]) || defaultColors;
    const coverSrc = book.imageUrl || `https://picsum.photos/seed/${book.slug || book.id}/300/420`;

    return (
        <div
            className={cn(
                'group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer',
                'bg-card border border-border shadow-sm',
                'transition-all duration-300 ease-out',
                'hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-lg',
            )}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* ── Book Cover ── */}
            <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: '3/4' }}>
                <Image
                    src={coverSrc}
                    alt={`غلاف كتاب ${book.title}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top-right: Category badge */}
                {book.category && (
                    <div className={cn(
                        'absolute top-3 right-3 text-[10px] font-black',
                        'px-2.5 py-1 rounded-full border bg-black/60 backdrop-blur-md text-white border-white/20',
                    )}>
                        {book.category}
                    </div>
                )}

                {/* Top-left: Arrow reveal on hover */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center">
                        <ArrowUpRight size={12} className="text-white" />
                    </div>
                </div>

                {/* Bottom-left: Book icon */}
                <div className="absolute bottom-3 left-3">
                    <div className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center">
                        <BookOpen size={12} className={colors.icon} />
                    </div>
                </div>
            </div>

            {/* ── Info ── */}
            <div className="flex flex-col gap-2 p-4 flex-1">
                {/* Title */}
                <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 text-right">
                    {book.title}
                </h3>

                {/* Author */}
                {book.author && (
                    <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[11px] text-muted-foreground line-clamp-1">{book.author}</span>
                        <User size={10} className="text-muted-foreground flex-shrink-0" />
                    </div>
                )}

                {/* Divider */}
                <div className="h-px w-full bg-border mt-1" />

                {/* Download CTA */}
                <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className={cn(
                        'group/dl flex items-center justify-center gap-2 w-full mt-auto',
                        'py-2 rounded-xl text-xs font-bold',
                        'bg-muted/60 hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary',
                        'text-foreground',
                        'transition-colors duration-200',
                    )}
                    onClick={e => e.stopPropagation()}
                >
                    <Download
                        size={12}
                        className="transition-transform duration-300 group-hover/dl:-translate-y-0.5"
                    />
                    <span>تحميل PDF</span>
                </a>
            </div>
        </div>
    );
};

export const BookCard = memo(BookCardComponent);
