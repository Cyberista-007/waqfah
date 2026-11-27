'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CalendarPlus,
  Loader2,
  Clock,
  MapPin,
  Video,
  PlayCircle,
  Sparkles,
  Calendar,
  Share2,
} from 'lucide-react';
import { useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ScheduleItem } from '@/lib/types';

function generateICSLink(item: ScheduleItem) {
  if (!item.dateTime) return '#';
  const startTime = new Date(item.dateTime);
  if (isNaN(startTime.getTime())) return '#';
  const endTime = new Date(startTime.getTime() + (item.duration || 60) * 60 * 1000);

  const toICSFormat = (date: Date) =>
    date.toISOString().replace(/-/g, '').replace(/:/g, '').replace(/\./g, '');

  const event = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${toICSFormat(startTime)}`,
    `DTEND:${toICSFormat(endTime)}`,
    `SUMMARY:${item.title}`,
    `DESCRIPTION:${item.isLive ? 'بث مباشر - منصة وقفة' : 'درس مسجل - منصة وقفة'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  return `data:text/calendar;charset=utf8,${encodeURIComponent(event)}`;
}

export default function SchedulePage() {
  const { t, isRtl, lang } = useTranslation();
  const { toast } = useToast();
  const { data: scheduleItems, isLoading } = useCollection<ScheduleItem>('scheduled_lessons', {
    orderBy: ['dateTime', 'asc'],
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'recorded'>('all');

  const localeCode = lang === 'ar' ? 'ar-EG' : 'en-US';

  const formattedItems = scheduleItems
    ?.map((item) => {
      if (!item.dateTime) {
        return {
          ...item,
          time: '',
          day: '--',
          month: '--',
          weekday: t('غير محدد', 'TBD'),
        };
      }
      const date = new Date(item.dateTime);
      return {
        ...item,
        day: date.toLocaleDateString(localeCode, { day: '2-digit' }),
        month: date.toLocaleDateString(localeCode, { month: 'short' }),
        weekday: date.toLocaleDateString(localeCode, { weekday: 'long' }),
        time: date.toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' }),
      };
    })
    .filter((item) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'live') return item.isLive;
      return !item.isLive;
    });

  const handleShareItem = async (title: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: t('تم نسخ رابط الموعد!', 'Schedule link copied!') });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: t('تم نسخ رابط الموعد!', 'Schedule link copied!') });
      } catch {}
    }
  };

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-5xl">
        {/* Clean Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('المواعيد واللقاءات العلمية', 'Lessons & Broadcast Schedule')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('جدول', 'Lessons')} <span className="text-primary">{t('الدروس', 'Schedule')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'تابع مواعيد البث المباشر والدروس المجدولة، وأضفها مباشرة إلى تقويمك.',
                'Track upcoming live broadcasts and scheduled lessons, and export to your calendar.'
              )}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-xl self-start md:self-auto">
            {[
              { id: 'all', label: t('الكل', 'All'), icon: Sparkles },
              { id: 'live', label: t('بث مباشر', 'Live'), icon: Video },
              { id: 'recorded', label: t('مسجلة', 'Recorded'), icon: PlayCircle },
            ].map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={cn(
                    'px-3.5 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <filter.icon className="w-3.5 h-3.5" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Schedule List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin h-9 w-9 text-primary" />
            <p className="text-xs font-bold text-muted-foreground">
              {t('جاري تحميل المواعيد...', 'Loading schedule...')}
            </p>
          </div>
        ) : formattedItems && formattedItems.length > 0 ? (
          <div className="space-y-4">
            {formattedItems.map((item) => (
              <div
                key={item.id}
                className="bg-card/80 border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:border-primary/40 transition-colors"
              >
                {/* Date Badge Sidebar */}
                <div
                  className={cn(
                    'sm:w-36 p-5 flex sm:flex-col items-center justify-between sm:justify-center text-center border-b sm:border-b-0 sm:border-l border-border shrink-0 gap-2',
                    item.isLive ? 'bg-red-500/10' : 'bg-primary/5'
                  )}
                >
                  <div>
                    <span className="text-3xl font-black text-foreground block leading-none">{item.day}</span>
                    <span className="text-xs font-bold text-primary mt-1 block">{item.month}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-background border border-border text-[11px] font-bold text-muted-foreground">
                    {item.weekday}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>{t('بث مباشر', 'Live')}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                            {t('درس مجدول', 'Scheduled')}
                          </span>
                        )}
                        {item.time && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.time}</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug">
                        {item.title}
                      </h2>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShareItem(item.title)}
                      className="h-9 w-9 rounded-xl shrink-0"
                      title={t('مشاركة', 'Share')}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{t('منصة وقفة', 'Waqfah Platform')}</span>
                      </span>
                    </div>

                    <Button asChild size="sm" className="h-9 px-4 rounded-xl font-bold gap-2">
                      <a href={generateICSLink(item)} download={`${item.title}.ics`}>
                        <CalendarPlus className="w-4 h-4" />
                        <span>{t('إضافة للتقويم', 'Add to Calendar')}</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-4">
            <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {t('لا توجد دروس مجدولة حالياً', 'No scheduled lessons right now')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('يمكنك تصفح الدروس المسجلة في مكتبة المحاضرات.', 'Browse recorded classes in the lectures library.')}
              </p>
            </div>
            {activeFilter !== 'all' && (
              <Button variant="outline" onClick={() => setActiveFilter('all')} className="rounded-xl font-bold">
                {t('عرض الكل', 'Show All')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
