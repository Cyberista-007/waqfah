'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, format, isToday, subDays } from 'date-fns';
import type { Locale } from 'date-fns';
import { ar } from 'date-fns/locale';
import { doc, Timestamp } from 'firebase/firestore';
import {
  BookCheck,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ImanHarvestReport } from '@/components/accountability/iman-harvest-report';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  AccountabilityAction,
  AccountabilityActionGroup,
  accountabilityStructure,
} from '@/lib/accountability-data';
import { useTranslation } from '@/lib/i18n';
import type { AccountabilityEntry, CustomAccountabilityAction } from '@/lib/types';
import { cn } from '@/lib/utils';

const DAILY_TARGET_POINTS = 55;

const PRAYER_META: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
    activeCardClass: string;
    dotClass: string;
  }
> = {
  fajr: {
    icon: Sunrise,
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    activeCardClass: 'bg-amber-500/10 border-amber-500/45 text-foreground shadow-sm',
    dotClass: 'bg-amber-500 border-amber-500 text-white',
  },
  dhuhr: {
    icon: Sun,
    badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    activeCardClass: 'bg-orange-500/10 border-orange-500/45 text-foreground shadow-sm',
    dotClass: 'bg-orange-500 border-orange-500 text-white',
  },
  asr: {
    icon: Sunset,
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    activeCardClass: 'bg-rose-500/10 border-rose-500/45 text-foreground shadow-sm',
    dotClass: 'bg-rose-500 border-rose-500 text-white',
  },
  maghrib: {
    icon: Sunset,
    badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    activeCardClass: 'bg-purple-500/10 border-purple-500/45 text-foreground shadow-sm',
    dotClass: 'bg-purple-500 border-purple-500 text-white',
  },
  isha: {
    icon: Moon,
    badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    activeCardClass: 'bg-blue-500/10 border-blue-500/45 text-foreground shadow-sm',
    dotClass: 'bg-blue-500 border-blue-500 text-white',
  },
  general: {
    icon: Sparkles,
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    activeCardClass: 'bg-emerald-500/10 border-emerald-500/45 text-foreground shadow-sm',
    dotClass: 'bg-emerald-500 border-emerald-500 text-white',
  },
};

function AddCustomActionDialog({ onAdd }: { onAdd: (title: string, points: number) => void }) {
  const { isRtl, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || points <= 0) return;
    onAdd(title.trim(), points);
    setTitle('');
    setPoints(2);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all text-xs font-bold"
        >
          <span>{t('إضافة نافلة أو ورد خاص', 'Add custom deed')}</span>
          <Plus className="w-4 h-4 shrink-0" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground rounded-2xl max-w-md" dir={isRtl ? 'rtl' : 'ltr'}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">
              {t('إضافة نافلة جديدة', 'Add New Custom Deed')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {t('أضف عملاً صالحاً إضافياً لتتبعه ضمن جدولك اليومي.', 'Track an additional good deed in your daily log.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="custom-action-title" className="text-xs font-bold text-foreground">
                {t('عنوان العمل', 'Deed Title')}
              </Label>
              <Input
                id="custom-action-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('مثال: ركعتا الضحى، صلة رحم...', 'e.g. Duha prayer, charity...')}
                className="bg-background border-border rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-action-points" className="text-xs font-bold text-foreground">
                {t('النقاط المستحقة', 'Points')}
              </Label>
              <Input
                id="custom-action-points"
                type="number"
                min={1}
                max={20}
                required
                value={points}
                onChange={(e) => setPoints(Math.max(1, Number(e.target.value)))}
                className="bg-background border-border rounded-xl font-bold"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">
              {t('إلغاء', 'Cancel')}
            </Button>
            <Button type="submit" className="rounded-xl font-bold">
              {t('إضافة', 'Add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActionOptionRow({
  label,
  points,
  isSelected,
  isSingleChoice,
  prayerKey,
  onToggle,
  onRemove,
}: {
  label: string;
  points: number;
  isSelected: boolean;
  isSingleChoice?: boolean;
  prayerKey: string;
  onToggle: () => void;
  onRemove?: (e: React.MouseEvent) => void;
}) {
  const { t } = useTranslation();
  const meta = PRAYER_META[prayerKey] || PRAYER_META.general;

  return (
    <div className="relative group flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-start transition-all',
          isSelected
            ? meta.activeCardClass
            : 'bg-background/60 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              'w-5 h-5 shrink-0 flex items-center justify-center border transition-all',
              isSingleChoice ? 'rounded-full' : 'rounded-md',
              isSelected ? meta.dotClass : 'border-border bg-background'
            )}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
          </span>
          <span className={cn('text-sm font-bold truncate', isSelected && 'text-foreground')}>
            {label}
          </span>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
          +{points} {t('نقطة', 'pts')}
        </span>
      </button>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('حذف العمل', 'Remove deed')}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function ActionGroupCard({
  group,
  prayerKey,
  completedActionIds,
  onActionToggle,
  customActions,
  onCustomActionToggle,
  onAddCustom,
  onRemoveCustom,
}: {
  group: AccountabilityActionGroup;
  prayerKey: string;
  completedActionIds: string[];
  onActionToggle: (actionId: string, groupId: string, type: 'single' | 'multi') => void;
  customActions: CustomAccountabilityAction[];
  onCustomActionToggle: (action: CustomAccountabilityAction) => void;
  onAddCustom: (title: string, points: number) => void;
  onRemoveCustom: (actionId: string) => void;
}) {
  const { t } = useTranslation();
  const isSingle = group.type === 'single';
  const showCustomActions = group.id.includes('sunnah') || group.id === 'charity';
  const completedInGroup = group.actions.filter((a) => completedActionIds.includes(a.id)).length;

  return (
    <Card className="bg-card/85 border-border rounded-2xl shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-black text-foreground">{group.title}</CardTitle>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {isSingle
              ? t('اختيار واحد', 'Single choice')
              : `${completedInGroup}/${group.actions.length}`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2.5 flex-1">
        {group.actions.map((action: AccountabilityAction) => (
          <ActionOptionRow
            key={action.id}
            label={action.label}
            points={action.points}
            isSelected={completedActionIds.includes(action.id)}
            isSingleChoice={isSingle}
            prayerKey={prayerKey}
            onToggle={() => onActionToggle(action.id, group.id, group.type)}
          />
        ))}

        {showCustomActions && (
          <>
            {customActions.map((action) => (
              <ActionOptionRow
                key={action.id}
                label={action.title}
                points={action.points}
                isSelected={completedActionIds.includes(action.id)}
                prayerKey={prayerKey}
                onToggle={() => onCustomActionToggle(action)}
                onRemove={(e) => {
                  e.stopPropagation();
                  onRemoveCustom(action.id);
                }}
              />
            ))}
            <div className="pt-1">
              <AddCustomActionDialog onAdd={onAddCustom} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function AccountabilityTracker({
  redirectToOnAuth = '/accountability',
  showHeader = true,
}: {
  redirectToOnAuth?: string;
  showHeader?: boolean;
}) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { isRtl, t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [gregorianMonth, setGregorianMonth] = useState<Date>(() => new Date());
  const [hijriMonth, setHijriMonth] = useState<Date>(() => new Date());
  const [activeTab, setActiveTab] = useState('fajr');

  const dateId = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

  const entryDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'accountability', dateId) : null),
    [user, firestore, dateId]
  );

  const { data: currentEntry, isLoading: isEntryLoading } = useDoc<AccountabilityEntry>(entryDocRef);

  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [customActions, setCustomActions] = useState<Record<string, CustomAccountabilityAction[]>>({});

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/auth/login?redirect_to=${redirectToOnAuth}`);
    }
  }, [isUserLoading, user, router, redirectToOnAuth]);

  useEffect(() => {
    if (currentEntry) {
      setCompletedActions(currentEntry.completedActionIds || []);
      setCustomActions(currentEntry.customActions || {});
    } else {
      setCompletedActions([]);
      setCustomActions({});
    }
  }, [currentEntry]);

  const gregorianFormatters = useMemo(
    () => ({
      formatWeekdayName: (weekday: Date, options?: { locale?: Locale }) =>
        new Intl.DateTimeFormat(options?.locale?.code === 'ar' ? 'ar-EG' : 'en-US', {
          weekday: 'short',
        })
          .format(weekday)
          .substring(0, 1)
          .toUpperCase(),
    }),
    []
  );

  const hijriFormatters = useMemo(
    () => ({
      formatDay: (date: Date) =>
        new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', { day: 'numeric' }).format(date),
      formatCaption: (date: Date) =>
        new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
          month: 'long',
          year: 'numeric',
        }).format(date),
      formatWeekdayName: (weekday: Date) =>
        new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { weekday: 'short' })
          .format(weekday)
          .substring(0, 1),
    }),
    []
  );

  const formattedGregorian = useMemo(
    () =>
      new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(selectedDate),
    [selectedDate]
  );

  const formattedHijri = useMemo(
    () =>
      new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(selectedDate),
    [selectedDate]
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setGregorianMonth(date);
    setHijriMonth(date);
  };

  const saveEntry = useCallback(
    (newCompleted: string[], newCustom: Record<string, CustomAccountabilityAction[]>) => {
      if (!entryDocRef || !user) return;

      let points = 0;
      const allActions = Object.values(accountabilityStructure).flatMap((p) =>
        p.groups.flatMap((g) => g.actions)
      );
      const allCustom = Object.values(newCustom).flat();

      newCompleted.forEach((actionId) => {
        const action = allActions.find((a) => a.id === actionId) || allCustom.find((a) => a.id === actionId);
        if (action) points += action.points;
      });

      setDocumentNonBlocking(
        entryDocRef,
        {
          userId: user.uid,
          date: Timestamp.fromDate(selectedDate),
          completedActionIds: newCompleted,
          customActions: newCustom,
          totalPoints: points,
        },
        { merge: true }
      );
    },
    [entryDocRef, user, selectedDate]
  );

  const totalPoints = useMemo(() => {
    let points = 0;
    const allActions = Object.values(accountabilityStructure).flatMap((p) =>
      p.groups.flatMap((g) => g.actions)
    );
    const allCustom = Object.values(customActions).flat();

    completedActions.forEach((actionId) => {
      const action = allActions.find((a) => a.id === actionId) || allCustom.find((a) => a.id === actionId);
      if (action) points += action.points;
    });
    return points;
  }, [completedActions, customActions]);

  const progressPercentage = Math.min(Math.round((totalPoints / DAILY_TARGET_POINTS) * 100), 100);

  const handleActionToggle = (actionId: string, groupId: string, type: 'single' | 'multi') => {
    const isSelected = completedActions.includes(actionId);
    let newCompleted = [...completedActions];

    if (type === 'single') {
      const group = Object.values(accountabilityStructure)
        .flatMap((p) => p.groups)
        .find((g) => g.id === groupId);
      const groupActionIds = group?.actions.map((a) => a.id) || [];
      newCompleted = newCompleted.filter((id) => !groupActionIds.includes(id));
      if (!isSelected) {
        newCompleted.push(actionId);
      }
    } else if (isSelected) {
      newCompleted = newCompleted.filter((id) => id !== actionId);
    } else {
      newCompleted.push(actionId);
    }

    setCompletedActions(newCompleted);
    saveEntry(newCompleted, customActions);
  };

  const handleAddCustomAction = (prayerKey: string) => (title: string, points: number) => {
    const newAction: CustomAccountabilityAction = {
      id: `custom_${Date.now()}`,
      title,
      points,
    };
    const newCustom = {
      ...customActions,
      [prayerKey]: [...(customActions[prayerKey] || []), newAction],
    };
    const newCompleted = [...completedActions, newAction.id];
    setCustomActions(newCustom);
    setCompletedActions(newCompleted);
    saveEntry(newCompleted, newCustom);
  };

  const handleRemoveCustomAction = (prayerKey: string, actionId: string) => {
    const newCustom = {
      ...customActions,
      [prayerKey]: (customActions[prayerKey] || []).filter((a) => a.id !== actionId),
    };
    const newCompleted = completedActions.filter((id) => id !== actionId);
    setCustomActions(newCustom);
    setCompletedActions(newCompleted);
    saveEntry(newCompleted, newCustom);
  };

  const getTabProgress = (key: string) => {
    const config = accountabilityStructure[key];
    if (!config) return { done: 0, total: 0 };
    let done = 0;
    const total = config.groups.length + (customActions[key]?.length || 0);
    config.groups.forEach((group) => {
      if (group.actions.some((a) => completedActions.includes(a.id))) {
        done += 1;
      }
    });
    (customActions[key] || []).forEach((c) => {
      if (completedActions.includes(c.id)) done += 1;
    });
    return { done, total };
  };

  if (isUserLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Clean Header (when standalone page) */}
      {showHeader && (
        <header className="non-printable rounded-3xl border border-border bg-card/85 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                <BookCheck className="w-3.5 h-3.5" />
                <span>{t('المتابعة التعبدية اليومية', 'Daily Worship Tracker')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-headline tracking-tight text-foreground">
                {t('محاسبة النفس اليومية', 'Daily Self-Accountability')}
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                &laquo;حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُوزَنُوا&raquo; — عمر بن الخطاب رضي الله عنه
              </p>
            </div>
          </div>
        </header>
      )}

      {/* Top Controls Bar: Date Navigation + Daily Score Progress */}
      <div className="non-printable grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Date Bar */}
        <div className="lg:col-span-7 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-border bg-card/85 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleDateSelect(subDays(selectedDate, 1))}
              className="rounded-xl h-10 w-10"
              title={t('اليوم السابق', 'Previous day')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleDateSelect(addDays(selectedDate, 1))}
              disabled={isToday(selectedDate)}
              className="rounded-xl h-10 w-10"
              title={t('اليوم التالي', 'Next day')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {!isToday(selectedDate) && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDateSelect(new Date())}
                className="rounded-xl h-10 px-3 text-xs font-bold gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('اليوم', 'Today')}</span>
              </Button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 min-w-[220px] h-10 justify-between rounded-xl px-3.5 text-xs sm:text-sm font-bold bg-background/80"
              >
                <span className="flex items-center gap-2 truncate">
                  <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{formattedHijri}</span>
                </span>
                <span className="text-[11px] font-medium text-muted-foreground shrink-0 hidden sm:inline">
                  {formattedGregorian}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 flex flex-col sm:flex-row bg-card border-border rounded-2xl overflow-hidden shadow-xl"
              dir="rtl"
            >
              <div className="p-2">
                <Calendar
                  locale={ar}
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={hijriMonth}
                  onMonthChange={setHijriMonth}
                  formatters={hijriFormatters}
                  dir="rtl"
                  components={{
                    Chevron: (props) =>
                      props.orientation === 'left' ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      ),
                  }}
                  classNames={{
                    caption_label: 'font-bold text-primary',
                    nav_button_previous: 'absolute right-1',
                    nav_button_next: 'absolute right-auto left-1',
                  }}
                />
              </div>
              <Separator orientation="vertical" className="hidden sm:block h-auto" />
              <div className="p-2 border-t sm:border-t-0 border-border">
                <Calendar
                  locale={ar}
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={gregorianMonth}
                  onMonthChange={setGregorianMonth}
                  formatters={gregorianFormatters}
                  dir="rtl"
                  components={{
                    Chevron: (props) =>
                      props.orientation === 'left' ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      ),
                  }}
                  classNames={{
                    nav_button_previous: 'absolute right-1',
                    nav_button_next: 'absolute right-auto left-1',
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Daily Score Card */}
        <div className="lg:col-span-5 flex items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card/85 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-muted-foreground">{t('الرصيد الإيماني اليومي', 'Daily Points')}</span>
                <span className="text-primary">{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-end shrink-0 ps-2 border-s border-border">
            <span className="text-2xl font-black text-foreground">{totalPoints}</span>
            <span className="text-xs font-bold text-muted-foreground"> / {DAILY_TARGET_POINTS}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="non-printable overflow-x-auto pb-2">
          <TabsList className="h-auto w-full sm:w-auto inline-flex items-center justify-start p-1.5 rounded-2xl bg-card/85 border border-border gap-1">
            {Object.entries(accountabilityStructure).map(([key, { name }]) => {
              const meta = PRAYER_META[key] || PRAYER_META.general;
              const Icon = meta.icon;
              const { done, total } = getTabProgress(key);
              const isAllDone = total > 0 && done >= total;

              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="group rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{name}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors',
                      isAllDone
                        ? 'bg-emerald-500/20 text-emerald-500 group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground'
                    )}
                  >
                    {done}/{total}
                  </span>
                </TabsTrigger>
              );
            })}

            <TabsTrigger
              value="iman-harvest"
              className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>{t('الحصاد الإيماني', 'Harvest Report')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="iman-harvest" className="mt-4">
          <ImanHarvestReport />
        </TabsContent>

        {isEntryLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          Object.entries(accountabilityStructure).map(([key, prayerConfig]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {prayerConfig.groups.map((group) => (
                  <ActionGroupCard
                    key={group.id}
                    group={group}
                    prayerKey={key}
                    completedActionIds={completedActions}
                    onActionToggle={handleActionToggle}
                    customActions={customActions[key] || []}
                    onCustomActionToggle={(action) =>
                      handleActionToggle(action.id, `custom-${key}`, 'multi')
                    }
                    onAddCustom={handleAddCustomAction(key)}
                    onRemoveCustom={(actionId) => handleRemoveCustomAction(key, actionId)}
                  />
                ))}
              </div>
            </TabsContent>
          ))
        )}
      </Tabs>
    </div>
  );
}
