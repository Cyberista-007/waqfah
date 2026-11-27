'use client';

import Link from 'next/link';
import {
  Radio,
  Calendar,
  Share2,
  Bell,
  Heart,
  Youtube,
  Clapperboard,
  Headphones,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function LivePage() {
  const { t, isRtl } = useTranslation();
  const { toast } = useToast();
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('البث المباشر — وقفة', 'Live Majalis — Waqfah'),
          url,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t('تم نسخ رابط البث المباشر!', 'Live page link copied!') });
    } catch {
      toast({ variant: 'destructive', title: t('فشل نسخ الرابط', 'Failed to copy link') });
    }
  };

  const handleToggleAlert = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    toast({
      title: next
        ? t('تم تفعيل تنبيهات البث', 'Stream alerts enabled')
        : t('تم إيقاف تنبيهات البث', 'Stream alerts disabled'),
      description: next
        ? t('يمكنك متابعة المواعيد المحدثة عبر صفحة الجدول الزمني.', 'Check the schedule page for upcoming sessions.')
        : undefined,
    });
  };

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-6xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              <Radio className="w-3.5 h-3.5" />
              <span>{t('مجالس الذكر المباشرة', 'Live Majalis')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('البث', 'Live')} <span className="text-primary">{t('المباشر', 'Streams')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'تابع البثوث المباشرة للدروس والمجالس العلمية، واطّلع على المواعيد القادمة.',
                'Follow live Islamic lectures and check upcoming broadcast schedules.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleAlert}
              variant={alertsEnabled ? 'default' : 'outline'}
              className="h-10 px-4 rounded-xl font-bold gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>{alertsEnabled ? t('التنبيه مفعّل', 'Notified') : t('تنبيه بالبث', 'Notify me')}</span>
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              title={t('مشاركة', 'Share')}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Player Stage */}
          <div className="lg:col-span-8 space-y-5">
            <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-border bg-zinc-950 shadow-xl flex flex-col items-center justify-center text-center p-6 sm:p-10">
              <div className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span>{t('في وضع الاستعداد', 'Standby')}</span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mb-5">
                <Youtube className="w-8 h-8 text-red-500" />
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {t('لا يوجد بث مباشر نشط في هذه اللحظة', 'No live broadcast is active right now')}
              </h2>
              <p className="text-sm text-white/60 max-w-md leading-relaxed mb-6">
                {t(
                  'يمكنك الاستماع إلى إذاعة وقفة المستمرة على مدار الساعة أو تصفح أرشيف المحاضرات المسجلة حتى موعد البث القادم.',
                  'Listen to 24/7 radio broadcasts or browse recorded lectures while waiting for the next live session.'
                )}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="h-11 px-5 rounded-xl font-bold gap-2">
                  <Link href="/radio">
                    <Headphones className="w-4 h-4" />
                    <span>{t('الاستماع للإذاعة المباشرة', 'Listen to Live Radio')}</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 px-5 rounded-xl font-bold gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Link href="/schedule">
                    <Calendar className="w-4 h-4" />
                    <span>{t('جدول المواعيد', 'Broadcast Schedule')}</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Info Bar */}
            <div className="bg-card/80 border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {t('دعم استمرارية البث العلمي', 'Support Live Broadcasts')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'ساهم في تطوير البثوث المباشرة ونشر العلم الشرعي.',
                    'Help sustain live broadcasts and Islamic education.'
                  )}
                </p>
              </div>
              <Button asChild className="h-10 px-5 rounded-xl font-bold gap-2 shrink-0">
                <Link href="/donations">
                  <Heart className="w-4 h-4" />
                  <span>{t('ادعم المنصة', 'Support Platform')}</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-card/80 border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border pb-3">
                <Clock className="w-4 h-4 text-primary" />
                <span>{t('روابط سريعة', 'Quick Access')}</span>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/schedule"
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors'
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{t('جدول الدروس', 'Class Schedule')}</p>
                    <p className="text-xs text-muted-foreground">{t('مواعيد المحاضرات والبثوث', 'Upcoming lesson times')}</p>
                  </div>
                </Link>

                <Link
                  href="/lectures"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Clapperboard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{t('مكتبة المحاضرات', 'Lectures Library')}</p>
                    <p className="text-xs text-muted-foreground">{t('شاهد الدروس المسجلة', 'Watch recorded lessons')}</p>
                  </div>
                </Link>

                <Link
                  href="/radio"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{t('إذاعة القرآن والدروس', 'Quran & Lessons Radio')}</p>
                    <p className="text-xs text-muted-foreground">{t('بث صوتي مباشر على مدار الساعة', '24/7 audio broadcast')}</p>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
