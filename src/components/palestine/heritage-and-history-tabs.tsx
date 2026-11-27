'use client';

import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  Calendar,
  Compass,
  Feather,
  History,
  Landmark,
  Lock,
  MapPin,
  Milestone,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ARCH_DETAILS,
  CITIES,
  GALLERY_IMAGES,
  GLOBAL_TRUTH_DATA,
  NAKBA_VILLAGES,
  NAKBA_VILLAGES_DATA,
  POETRY,
  RESISTANCE_CHRONICLES,
  RESOURCES,
  SYMBOLS,
  TATREEZ_PATTERNS,
  TIMELINE,
} from './constants';

const TRUTH_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Lock,
  Milestone,
  Users,
  Building2,
};

export function CitiesAndNakbaTab() {
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [villageQuery, setVillageQuery] = useState('');

  const activeCity = CITIES[selectedCityIndex] || CITIES[0];

  const filteredVillages = useMemo(() => {
    const q = villageQuery.trim();
    if (!q) return NAKBA_VILLAGES;
    return NAKBA_VILLAGES.filter((v) => v.includes(q));
  }, [villageQuery]);

  return (
    <div className="space-y-8">
      {/* Cities Explorer */}
      <Card className="bg-card/85 border-border rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" />
            <span>مدن فلسطين التاريخية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city, idx) => (
              <button
                key={city.name}
                type="button"
                onClick={() => setSelectedCityIndex(idx)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5',
                  selectedCityIndex === idx
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-background/80 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{city.name}</span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {activeCity.title}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground">{activeCity.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{activeCity.description}</p>
              {activeCity.knownFor && (
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-foreground">أبرز المعالم:</span>
                  {activeCity.knownFor.split('،').map((landmark) => (
                    <span
                      key={landmark}
                      className="px-2.5 py-1 rounded-lg bg-background border border-border text-muted-foreground font-medium"
                    >
                      {landmark.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-4 rounded-2xl overflow-hidden border border-border aspect-[4/3] bg-background">
              <img
                src={
                  activeCity.name === 'غزة'
                    ? '/palestine_gallery_gaza_sunset.png'
                    : activeCity.name === 'القدس'
                    ? '/palestine_gallery_jerusalem_old_city.png'
                    : '/palestine_landscape_olive_trees.png'
                }
                alt={activeCity.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Displaced Villages Memorial (1948) */}
      <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                <Landmark className="w-5 h-5 text-rose-500" />
                <span>ذاكرة القرى والمدن المهجّرة (نكبة ١٩٤٨)</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                كي لا ننسى: أكثر من ٥٠٠ قرية وبلدة هُجّر أهلها وما زال أبناؤها يحملون مفاتيح العودة.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                value={villageQuery}
                onChange={(e) => setVillageQuery(e.target.value)}
                placeholder="ابحث عن قرية..."
                className="pr-9 bg-background border-border rounded-xl text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NAKBA_VILLAGES_DATA.map((village) => (
              <div
                key={village.name}
                className="p-4 rounded-2xl border border-border bg-muted/35 hover:border-rose-500/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base text-foreground">{village.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                    قضاء {village.district}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{village.fact}</p>
                <div className="pt-1 text-[11px] font-semibold text-muted-foreground flex items-center justify-between border-t border-border/60">
                  <span>عام التهجير: {village.year}</span>
                  <span>السكان: ~{village.population}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-xs font-bold text-muted-foreground">
              أرشيف الأسماء ({filteredVillages.length} قرية):
            </p>
            <div className="flex flex-wrap gap-2">
              {filteredVillages.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-background border border-border text-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HistoryAndFactsTab() {
  return (
    <div className="space-y-8">
      {/* Main Chronological Timeline */}
      <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            <span>الخط الزمني للمحطات التاريخية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative border-r-2 border-border pr-6 space-y-6 mr-2">
            {TIMELINE.map((item) => (
              <div key={item.year + item.title} className="relative">
                <span className="absolute -right-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background" />
                <div className="p-4 rounded-2xl border border-border bg-muted/35 space-y-1.5">
                  <span className="inline-block text-xs font-black px-2.5 py-0.5 rounded-md bg-primary/10 text-primary">
                    {item.year}
                  </span>
                  <h4 className="font-black text-base text-foreground">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reality Facts + Resistance Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Milestone className="w-5 h-5 text-rose-500" />
              <span>حقائق الواقع على الأرض</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GLOBAL_TRUTH_DATA.map((item) => {
              const Icon = TRUTH_ICONS[item.icon || 'Lock'] || Lock;
              return (
                <div
                  key={item.title}
                  className="p-4 rounded-2xl border border-border bg-muted/35 space-y-2"
                >
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 w-fit">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span>محطات النضال الشعبي</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {RESISTANCE_CHRONICLES.map((item) => (
              <div
                key={item.year + item.title}
                className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/35"
              >
                <span className="text-xs font-black px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {item.year}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Curated Books & Documentaries */}
      <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>مصادر معرفية ووثائقيات موصى بها</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCES.map((res) => (
            <div
              key={res.title}
              className="p-4 rounded-2xl border border-border bg-muted/35 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {res.type}
                  </span>
                  {res.author && (
                    <span className="text-[11px] text-muted-foreground">{res.author}</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-foreground">{res.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{res.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function HeritageAndSymbolsTab() {
  return (
    <div className="space-y-8">
      {/* Cultural & National Symbols */}
      <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>رموز الهوية والصمود</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYMBOLS.map((sym) => (
            <div
              key={sym.name}
              className="p-4 rounded-2xl border border-border bg-muted/35 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                {sym.image ? (
                  <img
                    src={sym.image}
                    alt={sym.name}
                    className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center text-2xl shrink-0">
                    {sym.icon}
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="font-black text-base text-foreground">{sym.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{sym.description}</p>
                </div>
              </div>
              {sym.detail && (
                <p className="text-[11px] text-primary font-medium pt-2 border-t border-border/60">
                  {sym.detail}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Visual Gallery */}
      <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-xl font-black text-foreground">
            صور ومعالم من فلسطين
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ...GALLERY_IMAGES,
            { src: '/palestine_resilience_gaza.png', title: 'عزة غزة وصمودها', location: 'قطاع غزة' },
            { src: '/palestine_food.png', title: 'المطبخ والتراث الشعبي', location: 'البيت الفلسطيني' },
          ].map((item) => (
            <div
              key={item.src}
              className="group rounded-2xl border border-border overflow-hidden bg-muted/35"
            >
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3.5 flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <span className="text-[11px] text-muted-foreground">{item.location}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tatreez & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black text-foreground">
              نقوش التطريز الفلسطيني
            </CardTitle>
            <img
              src="/palestine_tatreez_detail.png"
              alt="التطريز الفلسطيني"
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {TATREEZ_PATTERNS.map((pat) => (
              <div key={pat.name} className="p-3.5 rounded-2xl border border-border bg-muted/35 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground">نقشة {pat.name}</h4>
                  <span className="text-[11px] text-rose-500 font-bold">{pat.origin}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{pat.meaning}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-black text-foreground">
              فنون العمارة والديوان الشعري
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARCH_DETAILS.map((arch) => (
                <div key={arch.title} className="p-3 rounded-xl border border-border bg-muted/35 space-y-1">
                  <span className="text-[10px] font-bold text-amber-500">{arch.period}</span>
                  <h4 className="font-bold text-xs text-foreground">{arch.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{arch.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-2 border-t border-border/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Feather className="w-3.5 h-3.5 text-primary" />
                <span>من مختارات الشعر الفلسطيني</span>
              </div>
              {POETRY.map((poem) => (
                <blockquote
                  key={poem.author}
                  className="p-3.5 rounded-xl border border-border bg-background/60 space-y-1"
                >
                  <p className="text-sm font-bold text-foreground leading-relaxed">&laquo;{poem.text}&raquo;</p>
                  <footer className="text-[11px] text-muted-foreground">
                    — {poem.author} {poem.title ? `(${poem.title})` : ''}
                  </footer>
                </blockquote>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
