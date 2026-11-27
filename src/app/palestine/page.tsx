'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Compass,
  Flag,
  HandHelping,
  History,
  Quote,
  Shield,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionAndQuizTab } from '@/components/palestine/action-and-quiz-tab';
import {
  FAMOUS_FIGURES,
  FLAG_COLORS,
  GLOBAL_QUOTES,
  SECTIONS,
  VERSES,
} from '@/components/palestine/constants';
import {
  CitiesAndNakbaTab,
  HeritageAndSymbolsTab,
  HistoryAndFactsTab,
} from '@/components/palestine/heritage-and-history-tabs';

export default function PalestinePage() {
  const [activeTab, setActiveTab] = useState('identity');
  const [verseIndex, setVerseIndex] = useState(0);

  const activeVerse = VERSES[verseIndex] || VERSES[0];

  const jumpToTab = (tab: string) => {
    setActiveTab(tab);
    const tabsEl = document.getElementById('palestine-tabs-section');
    tabsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main
      id="palestine-portal-root"
      className="min-h-screen bg-background text-foreground pb-20"
      dir="rtl"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        {/* Editorial Hero */}
        <section className="rounded-3xl border border-border bg-card/85 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <span className="flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-zinc-200" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                </span>
                <span>بوابة الوعي والهوية الفلسطينية</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black font-headline tracking-tight leading-tight text-foreground">
                فلسطين —{' '}
                <span className="text-emerald-600 dark:text-emerald-400">الأرض المباركة</span>{' '}
                والحقُّ الثابت
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                ملف معرفي وتفاعلي منظم يوثّق مكانة المسجد الأقصى، تاريخ المدن والقرى المهجّرة،
                رموز التراث والصمود، ومساحة تفاعلية للدعاء وتوقيع ميثاق الوفاء.
              </p>

              {/* Rotating Quranic Verse Box */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border bg-muted/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>آيات في الأرض المباركة</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {VERSES.map((v, idx) => (
                      <button
                        key={v.source}
                        type="button"
                        onClick={() => setVerseIndex(idx)}
                        className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-colors ${
                          verseIndex === idx
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="font-headline text-base sm:text-lg font-bold text-foreground leading-loose">
                  &laquo;{activeVerse.text}&raquo;
                </p>
                <p className="text-xs font-semibold text-muted-foreground">{activeVerse.source}</p>
              </div>

              {/* Quick Navigation Actions */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => jumpToTab('action')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <HandHelping className="w-4 h-4" />
                  <span>وقّع ميثاق التضامن والدعاء</span>
                </button>
                <button
                  type="button"
                  onClick={() => jumpToTab('cities')}
                  className="px-4 py-2.5 rounded-xl bg-background border border-border hover:bg-muted text-foreground text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-primary" />
                  <span>استكشف المدن والقرى</span>
                </button>
              </div>
            </div>

            {/* Hero Showcase Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-border aspect-[4/3] lg:aspect-[5/4] bg-muted shadow-sm">
                <img
                  src="/palestine_hero_cinematic_1777220019628.png"
                  alt="المسجد الأقصى المبارك - القدس"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 text-white">
                  <div className="text-sm font-black">المسجد الأقصى المبارك</div>
                  <div className="text-xs text-white/80">القدس الشريف — أولى القبلتين وثالث الحرمين</div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Palestinian Flag Bottom Accent */}
          <div className="grid grid-cols-4 h-1.5 w-full">
            <div className="bg-zinc-900 dark:bg-black" />
            <div className="bg-zinc-200 dark:bg-white" />
            <div className="bg-[#00843D]" />
            <div className="bg-[#E4312B]" />
          </div>
        </section>

        {/* Core Pillars Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <Card
                key={sec.id}
                className="bg-card/85 border-border rounded-2xl hover:border-primary/40 transition-colors"
              >
                <CardContent className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-muted border border-border">
                      <Icon className={`w-4 h-4 ${sec.color}`} />
                    </div>
                    <h2 className="font-black text-base text-foreground">{sec.title}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{sec.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Organized Tabbed Sections */}
        <section id="palestine-tabs-section" className="scroll-mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6" dir="rtl">
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-auto w-full sm:w-auto inline-flex p-1.5 rounded-2xl bg-card/85 border border-border gap-1">
                <TabsTrigger
                  value="identity"
                  className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Star className="w-4 h-4" />
                  <span>الأقصى والهوية</span>
                </TabsTrigger>
                <TabsTrigger
                  value="cities"
                  className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Compass className="w-4 h-4" />
                  <span>المدن والقرى</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <History className="w-4 h-4" />
                  <span>التاريخ والواقع</span>
                </TabsTrigger>
                <TabsTrigger
                  value="heritage"
                  className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>التراث والرموز</span>
                </TabsTrigger>
                <TabsTrigger
                  value="action"
                  className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                >
                  <Shield className="w-4 h-4" />
                  <span>تضامن واختبار</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Al-Aqsa, Flag Meanings, Figures & Global Quotes */}
            <TabsContent value="identity" className="space-y-8 mt-0">
              {/* Al-Aqsa Detail */}
              <Card className="bg-card/85 border-border rounded-3xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 p-6 sm:p-8 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                      <Star className="w-3.5 h-3.5" />
                      <span>أولى القبلتين وثالث الحرمين الشريفين</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                      المسجد الأقصى المبارك
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      يمتد المسجد الأقصى على مساحة ١٤٤ دونماً في البلدة القديمة بالقدس، وهو اسم يشمل
                      كل ما دار عليه السور من مصلّيات وساحات ومآذن وأبواب، وفي قلبه الجامع القِبلي
                      ذو القبة الرصاصية وقبة الصخرة المشرفة.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                        <div className="text-xs font-black text-primary">١٤٤ دونماً</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">المساحة الإجمالية للمسجد</div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                        <div className="text-xs font-black text-primary">١٥ باباً</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">منها ١٠ مفتوحة و٥ مغلقة</div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                        <div className="text-xs font-black text-primary">ثاني مسجد</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">وُضع في الأرض بعد الحرام</div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 min-h-[240px] bg-muted border-t lg:border-t-0 lg:border-r border-border">
                    <img
                      src="/palestine_gallery_jerusalem_old_city.png"
                      alt="أزقة البلدة القديمة والقدس"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Card>

              {/* Flag Colors Meaning */}
              <Card className="bg-card/85 border-border rounded-3xl shadow-sm">
                <CardHeader className="border-b border-border/60 pb-4">
                  <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                    <Flag className="w-5 h-5 text-emerald-500" />
                    <span>دلالات ألوان العلم الفلسطيني</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {FLAG_COLORS.map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-2xl border border-border bg-muted/35 space-y-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <h3 className="font-black text-sm text-foreground">{item.label}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.meaning}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Personalities & Global Voices */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="lg:col-span-8 bg-card/85 border-border rounded-3xl shadow-sm">
                  <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>أعلام وأقلام فلسطينية</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FAMOUS_FIGURES.map((person) => (
                      <div
                        key={person.name}
                        className="p-4 rounded-2xl border border-border bg-muted/35 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-black text-sm text-foreground">{person.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {person.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {person.description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-4 bg-card/85 border-border rounded-3xl shadow-sm">
                  <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                      <Quote className="w-5 h-5 text-amber-500" />
                      <span>شهادات عالمية</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {GLOBAL_QUOTES.map((q) => (
                      <div
                        key={q.author}
                        className="p-4 rounded-2xl border border-border bg-muted/35 space-y-2"
                      >
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">
                          &laquo;{q.text}&raquo;
                        </p>
                        <div className="text-[11px] text-muted-foreground">
                          <strong className="text-foreground">{q.author}</strong> — {q.role}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cities" className="mt-0">
              <CitiesAndNakbaTab />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <HistoryAndFactsTab />
            </TabsContent>

            <TabsContent value="heritage" className="mt-0">
              <HeritageAndSymbolsTab />
            </TabsContent>

            <TabsContent value="action" className="mt-0">
              <ActionAndQuizTab />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
