'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Sparkles,
  Brain,
  CloudRain,
  Sun,
  Zap,
  Moon,
  Anchor,
  ArrowLeft,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MOODS = [
  {
    id: 'sad',
    label: 'أشعر بالحزن',
    icon: CloudRain,
    hexColor: '#3b82f6',
    desc: 'جرعة السلوان وبشرى الفرج',
    color: 'text-blue-500',
  },
  {
    id: 'anxious',
    label: 'متوتر أو قلق',
    icon: Zap,
    hexColor: '#f59e0b',
    desc: 'جرعة السكينة واليقين',
    color: 'text-amber-500',
  },
  {
    id: 'weak-faith',
    label: 'فتور في الإيمان',
    icon: Moon,
    hexColor: '#a855f7',
    desc: 'جرعة الإحياء والوصل',
    color: 'text-purple-500',
  },
  {
    id: 'happy',
    label: 'ممتن وسعيد',
    icon: Sun,
    hexColor: '#f97316',
    desc: 'جرعة الشكر وحفظ النعمة',
    color: 'text-orange-500',
  },
  {
    id: 'distracted',
    label: 'مشتت الذهن',
    icon: Brain,
    hexColor: '#10b981',
    desc: 'جرعة التركيز والجمع',
    color: 'text-emerald-500',
  },
  {
    id: 'need-strength',
    label: 'أحتاج قوة وعزيمة',
    icon: Anchor,
    hexColor: '#f43f5e',
    desc: 'جرعة الثبات والاستبصار',
    color: 'text-rose-500',
  },
];

const PRESCRIPTIONS: Record<
  string,
  { aya: string; adhkar: string; advice: string; actionLink: string; actionLabel: string }
> = {
  sad: {
    aya: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
    adhkar: 'سبحان الله وبحمده (100 مرة)',
    advice: 'تذكر أن الدنيا دار ممر، وأن مع العسر يسراً.',
    actionLink: '/dua',
    actionLabel: 'أدعية كشف الكرب',
  },
  anxious: {
    aya: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    adhkar: 'لا حول ولا قوة إلا بالله (فضل عظيم في إزالة الهم)',
    advice: 'سلم أمرك لله، فما قدّره الله كان، وما لم يقدّره لم يكن.',
    actionLink: '/adhkar',
    actionLabel: 'أذكار الطمأنينة',
  },
  'weak-faith': {
    aya: 'إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهَ وَجِلَتْ قُلُوبُهُمْ',
    adhkar: 'يا مقلب القلوب ثبت قلبي على دينك',
    advice: 'جدد إيمانك بسماع آيات الله، وصحبة العلماء الربانيين.',
    actionLink: '/aqeedah',
    actionLabel: 'تجديد أصول الإيمان',
  },
  happy: {
    aya: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    adhkar: 'الحمد لله ملء السماوات وملء الأرض',
    advice: 'الشكر قيد النعم، فزد من الطاعة ليزيدك الله من فضله.',
    actionLink: '/hadith',
    actionLabel: 'أحاديث في فضل الشكر',
  },
  distracted: {
    aya: 'وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ',
    adhkar: 'أستغفر الله العظيم (تصفية للقلب والذهن)',
    advice: 'اخلُ بنفسك دقائق، واذكر الله بصدق، ستجد السكينة.',
    actionLink: '/adhkar',
    actionLabel: 'أذكار التركيز',
  },
  'need-strength': {
    aya: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    adhkar: 'حسبُنا الله ونعم الوكيل',
    advice: 'القوة تُستمد من القوي المتين، فلا تعجز واستعن بالله.',
    actionLink: '/muhlikat',
    actionLabel: 'تقوية العزيمة',
  },
};

export function SpiritualPrescription() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isFormulating, setIsFormulating] = useState(false);
  const [formulationStep, setFormulationStep] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const selectedMoodData = MOODS.find((m) => m.id === selectedMood);
  const prescription = selectedMood ? PRESCRIPTIONS[selectedMood] : null;

  const handleMoodSelect = (moodId: string) => {
    clearTimers();
    setSelectedMood(moodId);
    setIsFormulating(true);
    setFormulationStep(0);

    timersRef.current.push(
      setTimeout(() => setFormulationStep(1), 450),
      setTimeout(() => setFormulationStep(2), 900),
      setTimeout(() => setIsFormulating(false), 1350)
    );
  };

  return (
    <section className="container px-4 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-black mb-4">
            <Heart className="w-3.5 h-3.5 fill-current" /> الوصفة الإيمانية
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-headline text-foreground tracking-tight mb-3">
            كيف تجد <span className="text-rose-500">قلبك</span> اليوم؟
          </h2>
          <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl mx-auto">
            اختر حالتك النفسية لنقترح عليك ورداً علاجياً مخصصاً من آيات الذكر الحكيم وأوراد النبوة.
          </p>
        </div>

        {!selectedMood ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOODS.map((mood) => {
              const MoodIcon = mood.icon;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => handleMoodSelect(mood.id)}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 text-right cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 w-full">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-muted/70 shrink-0">
                      <MoodIcon className={cn('w-5 h-5', mood.color)} />
                    </div>
                    <div className="flex flex-col flex-grow min-w-0">
                      <span className="text-foreground group-hover:text-primary transition-colors font-bold text-base leading-tight">
                        {mood.label}
                      </span>
                      <span className="text-muted-foreground text-xs mt-1 font-medium">
                        {mood.desc}
                      </span>
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: mood.hexColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : isFormulating ? (
          <div className="bg-card border border-border rounded-2xl p-8 md:p-14 flex flex-col items-center justify-center min-h-[340px]">
            <div className="w-full max-w-md space-y-4">
              {[
                { label: 'استشعار نبض القلب...', icon: Heart },
                { label: 'استحضار الشفاء من الوحي الشريف...', icon: Sparkles },
                { label: 'تركيب الورد المقترح ونصيحة القلب...', icon: Brain },
              ].map((step, idx) => {
                const isCompleted = formulationStep > idx;
                const isActive = formulationStep === idx;
                const StepIcon = step.icon;

                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all duration-200',
                      isActive
                        ? 'bg-muted/80 border-primary/40'
                        : isCompleted
                        ? 'border-border/60 opacity-70'
                        : 'border-transparent opacity-30'
                    )}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border border-border bg-background">
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="flex-grow text-right flex items-center gap-3">
                      <StepIcon
                        className={cn('w-4 h-4 shrink-0', isActive && 'animate-pulse')}
                        style={{ color: isActive ? selectedMoodData?.hexColor : undefined }}
                      />
                      <span className="font-bold text-sm text-foreground">{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : prescription ? (
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <button
                type="button"
                onClick={() => {
                  clearTimers();
                  setSelectedMood(null);
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold text-sm cursor-pointer group"
              >
                <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                <span>العودة للاختيار</span>
              </button>

              <div
                className="px-4 py-1.5 rounded-full border text-xs font-black"
                style={{
                  backgroundColor: `${selectedMoodData?.hexColor}15`,
                  borderColor: `${selectedMoodData?.hexColor}40`,
                  color: selectedMoodData?.hexColor,
                }}
              >
                الوصفة الروحية المقترحة
              </div>
            </div>

            <div className="space-y-8">
              <div className="text-center py-6 px-5 rounded-2xl bg-muted/50 border border-border">
                <p className="text-muted-foreground text-xs font-black tracking-wider mb-4">
                  الدستور الرباني الشافي
                </p>
                <h3 className="font-amiri text-3xl sm:text-4xl md:text-5xl text-foreground leading-relaxed">
                  « {prescription.aya} »
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Sparkles className="w-5 h-5" style={{ color: selectedMoodData?.hexColor }} />
                    <h4 className="text-base font-black text-foreground">الورد المقترح (العلاج)</h4>
                  </div>
                  <p
                    className="text-foreground/90 text-base leading-relaxed font-bold pr-3 border-r-2"
                    style={{ borderColor: selectedMoodData?.hexColor }}
                  >
                    {prescription.adhkar}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Brain className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-base font-black text-foreground">نصيحة القلب</h4>
                  </div>
                  <p className="text-muted-foreground text-base leading-relaxed font-medium pr-3 border-r-2 border-emerald-500">
                    {prescription.advice}
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-8 rounded-full font-black text-sm sm:text-base text-white shadow-sm"
                  style={{ backgroundColor: selectedMoodData?.hexColor }}
                >
                  <Link href={prescription.actionLink} className="flex items-center gap-3">
                    <span>{prescription.actionLabel}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
