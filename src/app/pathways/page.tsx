'use client';

import Link from 'next/link';
import {
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  ArrowLeft,
  GraduationCap,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const PATHWAYS = [
  {
    id: 'foundation',
    titleAr: 'تأسيس طالب العلم',
    titleEn: 'Student Foundation',
    subtitleAr: 'المرحلة التمهيدية لبناء وعي شرعي رصين',
    subtitleEn: 'Foundational track for solid Islamic knowledge',
    descAr: 'مسار مخصص لكل مسلم يريد معرفة أصول دينه وما لا يسعه جهله من العقيدة والفقه والأخلاق.',
    descEn: 'Essential Aqeedah, Fiqh, and character modules every Muslim should master.',
    icon: GraduationCap,
    accent: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    href: '/series',
    modules: [
      { id: 'm1', titleAr: 'كتاب التوحيد', titleEn: 'Kitab At-Tawhid', lectures: 12, status: 'completed' },
      { id: 'm2', titleAr: 'الأربعين النووية', titleEn: '40 Hadith Nawawi', lectures: 40, status: 'active' },
      { id: 'm3', titleAr: 'متن الآجرومية', titleEn: 'Al-Ajurrumiyyah', lectures: 25, status: 'locked' },
      { id: 'm4', titleAr: 'فقه العبادات', titleEn: 'Fiqh of Worship', lectures: 18, status: 'locked' },
    ],
    progress: 35,
  },
  {
    id: 'heart',
    titleAr: 'مسار العبادة والقلوب',
    titleEn: 'Worship & Hearts Purification',
    subtitleAr: 'رحلة تزكية النفس وتهذيب السلوك',
    subtitleEn: 'Spiritual purification and prophetic manners',
    descAr: 'تركيز عميق على أعمال القلوب، السيرة النبوية، وكيفية تحويل العبادات من عادات إلى قربات.',
    descEn: 'Deep focus on deeds of the heart, Seerah, and sincerity in worship.',
    icon: HeartHandshake,
    accent: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    href: '/topics',
    modules: [
      { id: 'm5', titleAr: 'تهذيب الأخلاق', titleEn: 'Character Refinement', lectures: 15, status: 'active' },
      { id: 'm6', titleAr: 'السيرة النبوية', titleEn: 'Prophetic Biography', lectures: 52, status: 'locked' },
      { id: 'm7', titleAr: 'أعمال القلوب', titleEn: 'Deeds of the Heart', lectures: 20, status: 'locked' },
    ],
    progress: 0,
  },
  {
    id: 'defence',
    titleAr: 'الحصن المنيع',
    titleEn: 'Intellectual Fortress',
    subtitleAr: 'تفنيد الشبهات وتأصيل الثوابت',
    subtitleEn: 'Addressing doubts and grounding Islamic certainty',
    descAr: 'تعلم أصول المنهج وكيفية التعامل مع الشبهات المعاصرة والرد عليها بعلم وبصيرة.',
    descEn: 'Sound methodology for navigating modern doubts with knowledge and clarity.',
    icon: ShieldCheck,
    accent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    href: '/shubuhat',
    modules: [
      { id: 'm8', titleAr: 'أصول المنهج', titleEn: 'Foundational Methodology', lectures: 10, status: 'active' },
      { id: 'm9', titleAr: 'براهين الإيمان', titleEn: 'Proofs of Faith', lectures: 14, status: 'locked' },
      { id: 'm10', titleAr: 'شبهات عصرية', titleEn: 'Contemporary Doubts', lectures: 8, status: 'locked' },
    ],
    progress: 0,
  },
];

export default function PathwaysPage() {
  const { t, isRtl, lang } = useTranslation();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-10 max-w-6xl">
        {/* Clean Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>{t('مسارات التعلم الممنهجة', 'Structured Learning Pathways')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('رحلة العلم', 'Knowledge')} <span className="text-primary">{t('والإيمان', 'Pathways')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                '«من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة»',
                'Step-by-step guided tracks designed to build grounded knowledge systematically.'
              )}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold shadow-sm self-start md:self-auto">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>{PATHWAYS.length} {t('مسارات رئيسية', 'Core Tracks')}</span>
          </div>
        </header>

        {/* Pathways List */}
        <div className="space-y-8">
          {PATHWAYS.map((path) => (
            <section
              key={path.id}
              className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Summary Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className={cn('w-14 h-14 rounded-2xl border flex items-center justify-center', path.accent)}>
                  <path.icon className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black font-headline text-foreground">
                    {isAr ? path.titleAr : path.titleEn}
                  </h2>
                  <p className="text-xs font-bold text-primary">
                    {isAr ? path.subtitleAr : path.subtitleEn}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isAr ? path.descAr : path.descEn}
                </p>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">{t('نسبة الإنجاز', 'Track Progress')}</span>
                    <span className="text-primary">{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} className="h-2" />
                </div>

                <Button asChild className="w-full h-11 rounded-xl font-bold gap-2">
                  <Link href={path.href}>
                    <span>{t('استعراض مواد المسار', 'Explore Track Materials')}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              {/* Modules Column */}
              <div className="lg:col-span-7 space-y-3">
                {path.modules.map((mod, mIdx) => (
                  <div
                    key={mod.id}
                    className={cn(
                      'p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors',
                      mod.status === 'completed'
                        ? 'bg-emerald-500/5 border-emerald-500/25'
                        : mod.status === 'active'
                          ? 'bg-primary/5 border-primary/25'
                          : 'bg-muted/30 border-border opacity-70'
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0',
                          mod.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : mod.status === 'active'
                              ? 'bg-primary/15 text-primary'
                              : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {mod.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : mod.status === 'locked' ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          mIdx + 1
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">
                          {isAr ? mod.titleAr : mod.titleEn}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {mod.lectures} {t('محاضرة', 'Lectures')}
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild={mod.status !== 'locked'}
                      size="sm"
                      variant={mod.status === 'locked' ? 'ghost' : 'outline'}
                      disabled={mod.status === 'locked'}
                      className="rounded-xl font-bold shrink-0"
                    >
                      {mod.status === 'locked' ? (
                        <span>{t('قريباً', 'Locked')}</span>
                      ) : (
                        <Link href={path.href}>
                          {mod.status === 'completed' ? t('مراجعة', 'Review') : t('ابدأ الآن', 'Start')}
                        </Link>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
