'use client';

import React, { useState, useEffect } from 'react';
import { Quote, Sparkles, Share2, BookMarked, ArrowLeft, BookOpen, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const VERSES = [
  {
    text: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا",
    surah: "الأحزاب",
    number: 56,
    accent: "text-emerald-500",
  },
  {
    text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    surah: "الطلاق",
    number: 2,
    accent: "text-amber-500",
  },
  {
    text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    surah: "الشرح",
    number: "5-6",
    accent: "text-blue-500",
  },
  {
    text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    surah: "الرعد",
    number: 28,
    accent: "text-rose-500",
  },
];

const HADITHS = [
  {
    text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    narrator: "رواه مسلم",
    topic: "فضل العلم",
    accent: "text-blue-500",
  },
  {
    text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    narrator: "رواه البخاري ومسلم",
    topic: "الإخلاص والنية",
    accent: "text-emerald-500",
  },
  {
    text: "عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
    narrator: "رواه البخاري ومسلم",
    topic: "الصدق والأمانة",
    accent: "text-amber-500",
  },
];

const DUAS = [
  {
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    source: "مسند أحمد",
    category: "دعاء طلب العلم",
    accent: "text-purple-500",
  },
  {
    text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    source: "رواه الترمذي",
    category: "الثبات على الحق",
    accent: "text-rose-500",
  },
  {
    text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    source: "سورة البقرة - الآية 201",
    category: "جوامع الدعاء",
    accent: "text-teal-500",
  },
];

const WISDOMS = [
  {
    text: "العلم صيد والكتابة قيده، قيد صيودك بالحبال الواثقة",
    author: "الإمام الشافعي",
    category: "طلب العلم",
    accent: "text-amber-500",
  },
  {
    text: "من وطَّن قلبه عند ربه سكن واستراح، ومن أرسله في الناس اضطرب واشتد به القلق",
    author: "ابن القيم",
    category: "أعمال القلوب",
    accent: "text-indigo-500",
  },
  {
    text: "عليك بطريق الحق ولا تستوحش لقلة السالكين، وإياك وطريق الباطل ولا تغتر بكثرة الهالكين",
    author: "الفضيل بن عياض",
    category: "الاستقامة والثبات",
    accent: "text-emerald-500",
  },
];

export function VerseOfTheDay() {
  const [activeTab, setActiveTab] = useState<'verse' | 'hadith' | 'dua' | 'wisdom'>('verse');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(new Date().getDate());
  }, []);

  const getActiveItem = () => {
    switch (activeTab) {
      case 'hadith':
        return HADITHS[currentIndex % HADITHS.length];
      case 'dua':
        return DUAS[currentIndex % DUAS.length];
      case 'wisdom':
        return WISDOMS[currentIndex % WISDOMS.length];
      case 'verse':
      default:
        return VERSES[currentIndex % VERSES.length];
    }
  };

  const item = getActiveItem();

  return (
    <section className="container px-4 sm:px-6 lg:px-12 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Clean Editorial Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-muted/60 border border-border rounded-full mb-7 max-w-lg mx-auto">
          {[
            { id: 'verse', label: 'آية اليوم', icon: Sparkles },
            { id: 'hadith', label: 'حديث اليوم', icon: BookOpen },
            { id: 'dua', label: 'دعاء اليوم', icon: Heart },
            { id: 'wisdom', label: 'حكمة اليوم', icon: Quote },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative p-7 sm:p-10 md:p-12 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-muted border border-border flex items-center justify-center mb-5">
              <Quote className={cn('w-5 h-5', item.accent)} />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-muted border border-border text-muted-foreground text-[11px] font-black mb-5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {activeTab === 'verse' && 'آيةٌ تتدبّرها اليَوْم'}
              {activeTab === 'hadith' && 'حديثٌ شريف نقتدي به'}
              {activeTab === 'dua' && 'دعاءٌ مأثور نرجوه'}
              {activeTab === 'wisdom' && 'حكمةٌ نافعة نتفكر فيها'}
            </div>

            <div className="space-y-5 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-[1.65] font-quran">
                {item.text}
              </h2>

              <div className="flex items-center justify-center gap-4 text-sm sm:text-base font-bold text-muted-foreground">
                <div className="h-px w-6 bg-border" />
                {activeTab === 'verse' && (
                  <span>سورة {(item as any).surah} - الآية {(item as any).number}</span>
                )}
                {activeTab === 'hadith' && (
                  <span>{(item as any).narrator} - {(item as any).topic}</span>
                )}
                {activeTab === 'dua' && (
                  <span>{(item as any).source} - {(item as any).category}</span>
                )}
                {activeTab === 'wisdom' && (
                  <span>{(item as any).author} - {(item as any).category}</span>
                )}
                <div className="h-px w-6 bg-border" />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-6 h-11 text-xs sm:text-sm font-bold gap-2"
              >
                <BookMarked className="w-4 h-4 text-muted-foreground" />
                حفظ في المفضلة
              </Button>

              <Button
                size="lg"
                className="rounded-full px-7 h-11 text-xs sm:text-sm font-black bg-primary text-primary-foreground gap-2"
              >
                <Share2 className="w-4 h-4" />
                {activeTab === 'verse' && 'مشاركة الآية'}
                {activeTab === 'hadith' && 'مشاركة الحديث'}
                {activeTab === 'dua' && 'مشاركة الدعاء'}
                {activeTab === 'wisdom' && 'مشاركة الحكمة'}
              </Button>

              <Button
                variant="ghost"
                className="rounded-full px-5 h-11 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground gap-2"
              >
                {activeTab === 'verse' && 'تفسير الآية'}
                {activeTab === 'hadith' && 'شرح الحديث'}
                {activeTab === 'dua' && 'فضل الدعاء'}
                {activeTab === 'wisdom' && 'تأمل الأثر'}
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
