'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Zap, BookOpen } from 'lucide-react';
import { PILLARS, TERMINOLOGY } from './data';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { useReadingMode } from '@/components/reading-provider';
import { DailyChallenges } from '@/components/daily-challenges';

export default function AqeedahPage() {
  const { isReadingMode, fontSize } = useReadingMode();
  const [activeId, setActiveId] = useState('allah');
  const activePillar = PILLARS.find((p) => p.id === activeId) || PILLARS[0];

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-5xl">
        {/* Header */}
        <header
          className={cn(
            'flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/60 transition-all',
            isReadingMode && 'hidden'
          )}
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>أصول الدين</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              علم <span className="text-primary">العقيدة</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              أركان الإيمان الستة — شرح مبسط وأدلة شرعية من الكتاب والسنة.
            </p>
          </div>
          <ReadingModeToggle />
        </header>

        {isReadingMode && (
          <div className="flex justify-center">
            <ReadingModeToggle />
          </div>
        )}

        {/* Pillars Tabs */}
        <div className={cn('flex flex-wrap items-center gap-2', isReadingMode && 'hidden')}>
          {PILLARS.map((p) => {
            const Icon = p.icon;
            const isActive = activeId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Content */}
        <section
          className={cn(
            'bg-card/85 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6',
            isReadingMode && 'reading-content'
          )}
        >
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <div className={cn('p-3.5 rounded-2xl border bg-muted/50', activePillar.border)}>
              <activePillar.icon className={cn('w-7 h-7', activePillar.color)} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground">{activePillar.label}</h2>
              <p className="text-xs font-semibold text-muted-foreground">{activePillar.sublabel}</p>
            </div>
          </div>

          <div className="space-y-5">
            {activePillar.articles.map((article) => (
              <article
                key={article.id}
                className="p-5 sm:p-6 rounded-2xl bg-background/70 border border-border space-y-4"
              >
                <h3 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2.5">
                  <span className="w-1.5 h-6 rounded-full bg-primary shrink-0" />
                  <span>{article.title}</span>
                </h3>
                <p
                  className={cn(
                    'text-muted-foreground leading-relaxed text-sm md:text-base',
                    isReadingMode && 'reading-text'
                  )}
                  style={isReadingMode ? { fontSize: `${fontSize}px` } : {}}
                >
                  {article.body}
                </p>

                {article.evidence && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-2">
                    <p
                      className={cn(
                        'font-quran text-xl md:text-2xl text-foreground leading-relaxed',
                        isReadingMode && 'reading-text'
                      )}
                      style={isReadingMode ? { fontSize: `${fontSize + 6}px` } : {}}
                    >
                      &quot;{article.evidence}&quot;
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-background border border-border text-[11px] font-bold text-amber-500">
                      <Zap className="w-3 h-3" />
                      <span>الدليل من الوحي</span>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Terminology */}
        <section className={cn('space-y-5', isReadingMode && 'hidden')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">مفاهيم عقدية أساسية</h2>
              <p className="text-xs text-muted-foreground">مصطلحات لا غنى عنها في دراسة العقيدة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TERMINOLOGY.map((term, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-card/80 border border-border space-y-2 shadow-sm"
              >
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>{term.title}</span>
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {term.definition}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className={cn(isReadingMode && 'hidden')}>
          <DailyChallenges />
        </div>
      </div>
    </div>
  );
}
