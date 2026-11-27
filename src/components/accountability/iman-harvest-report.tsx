'use client';

import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  Flame,
  Loader2,
  PieChart as PieChartIcon,
  Printer,
  ThumbsUp,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { subDays } from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { accountabilityStructure } from '@/lib/accountability-data';
import { useTranslation } from '@/lib/i18n';
import type { AccountabilityEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

const MAX_POSSIBLE_POINTS = 55;

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const CATEGORY_MAP: Record<string, string> = {
  prayer: 'الصلوات',
  adhkar: 'الأذكار',
  sunnah: 'السنن',
  witr: 'النوافل',
  quran: 'القرآن والعلم',
  knowledge: 'القرآن والعلم',
  charity: 'النوافل',
};

function toJsDate(rawDate: unknown): Date | null {
  if (!rawDate) return null;
  if (rawDate instanceof Date) return rawDate;
  if (typeof rawDate === 'object' && rawDate !== null) {
    const maybeTs = rawDate as { toDate?: () => Date; seconds?: number };
    if (typeof maybeTs.toDate === 'function') return maybeTs.toDate();
    if (typeof maybeTs.seconds === 'number') return new Date(maybeTs.seconds * 1000);
  }
  if (typeof rawDate === 'string' || typeof rawDate === 'number') {
    const d = new Date(rawDate);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

interface HarvestStats {
  commitmentDays: number;
  bestDay: string;
  avgPoints: number;
  fullCommitmentDays: number;
  completionPercentage: number;
  performanceData: { name: string; points: number }[];
  categoryDistribution: { name: string; value: number; fill: string }[];
  mostKept: { id: string; label: string; percentage: number }[];
  needsFocus: { id: string; label: string; percentage: number }[];
}

const PrintableReport = forwardRef<HTMLDivElement, { stats: HarvestStats; periodLabel: string }>(
  ({ stats, periodLabel }, ref) => (
    <div ref={ref} className="p-8 bg-white text-black font-body" dir="rtl">
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-1 font-headline">حصادك الإيماني</h1>
        <p className="text-gray-600 text-sm">
          تقرير ({periodLabel}) — صادر بتاريخ: {new Date().toLocaleDateString('ar-EG')}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 text-center">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-gray-500">أيام الالتزام</h3>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.commitmentDays}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-gray-500">التزام تام</h3>
          <p className="text-3xl font-bold text-purple-600 mt-1">{stats.fullCommitmentDays}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-gray-500">أفضل يوم</h3>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.bestDay}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-gray-500">نسبة الإنجاز</h3>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.completionPercentage}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-bold mb-3">تطور الأداء</h2>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" name="النقاط" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-3">توزيع العبادات</h2>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  label
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`print-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold mb-3 text-emerald-700">أكثر ما حافظت عليه</h2>
          <ul className="space-y-2 text-sm">
            {stats.mostKept.map((item) => (
              <li key={item.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                <span>{item.label}</span>
                <span className="font-bold">{Math.round(item.percentage)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-3 text-amber-700">يحتاج لتركيز أكبر</h2>
          <ul className="space-y-2 text-sm">
            {stats.needsFocus.map((item) => (
              <li key={item.id} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                <span>{item.label}</span>
                <span className="font-bold">{Math.round(item.percentage)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="mt-8 pt-4 border-t text-center text-gray-500 text-xs">
        تقرير صادر من منصة وقفة — محاسبة النفس اليومية
      </footer>
    </div>
  )
);
PrintableReport.displayName = 'PrintableReport';

export function ImanHarvestReport() {
  const { user } = useUser();
  const { toast } = useToast();
  const { isRtl, t } = useTranslation();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const componentRef = useRef<HTMLDivElement>(null);

  const thirtyDaysAgo = useMemo(() => subDays(new Date(), 30), []);
  const accountabilityPath = user ? `users/${user.uid}/accountability` : null;

  const { data: rawEntries, isLoading } = useCollection<AccountabilityEntry>(accountabilityPath, {
    where: ['date', '>=', thirtyDaysAgo],
    orderBy: ['date', 'desc'],
  });

  const filteredEntries = useMemo(() => {
    if (!rawEntries) return [];
    if (timeframe === 'monthly') return rawEntries;
    const sevenDaysAgo = subDays(new Date(), 7);
    return rawEntries.filter((entry) => {
      const d = toJsDate(entry.date);
      return d ? d >= sevenDaysAgo : true;
    });
  }, [rawEntries, timeframe]);

  const stats: HarvestStats = useMemo(() => {
    if (!filteredEntries.length) {
      return {
        commitmentDays: 0,
        bestDay: '-',
        avgPoints: 0,
        fullCommitmentDays: 0,
        completionPercentage: 0,
        performanceData: [],
        categoryDistribution: [],
        mostKept: [],
        needsFocus: [],
      };
    }

    const commitmentDays = filteredEntries.length;
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    let maxPoints = -1;
    let bestDayOfWeek = -1;
    filteredEntries.forEach((entry) => {
      const pts = entry.totalPoints || 0;
      if (pts > maxPoints) {
        maxPoints = pts;
        const d = toJsDate(entry.date);
        if (d) bestDayOfWeek = d.getDay();
      }
    });

    const bestDay = bestDayOfWeek !== -1 ? dayNames[bestDayOfWeek] : '-';
    const fullCommitmentDays = filteredEntries.filter(
      (entry) => (entry.totalPoints || 0) >= MAX_POSSIBLE_POINTS
    ).length;

    const totalPoints = filteredEntries.reduce((sum, entry) => sum + (entry.totalPoints || 0), 0);
    const avgPoints = commitmentDays > 0 ? Math.round(totalPoints / commitmentDays) : 0;
    const completionPercentage =
      avgPoints > 0 ? Math.min(Math.round((avgPoints / MAX_POSSIBLE_POINTS) * 100), 100) : 0;

    const chartSliceCount = timeframe === 'weekly' ? 7 : 14;
    const performanceData = filteredEntries
      .slice(0, chartSliceCount)
      .reverse()
      .map((entry) => {
        const d = toJsDate(entry.date);
        return {
          name: d
            ? d.toLocaleDateString('ar-EG', timeframe === 'weekly' ? { weekday: 'short' } : { day: 'numeric', month: 'numeric' })
            : '-',
          points: entry.totalPoints || 0,
        };
      });

    const categoryPoints: Record<string, number> = {
      الصلوات: 0,
      الأذكار: 0,
      السنن: 0,
      النوافل: 0,
      'القرآن والعلم': 0,
    };

    const allActions = Object.values(accountabilityStructure).flatMap((p) =>
      p.groups.flatMap((g) => g.actions.map((a) => ({ ...a, groupId: g.id })))
    );

    const actionCounts: Record<string, { count: number; label: string }> = {};
    allActions.forEach((a) => {
      actionCounts[a.id] = { count: 0, label: a.label };
    });

    filteredEntries.forEach((entry) => {
      const allCustom = Object.values(entry.customActions || {}).flat();
      entry.completedActionIds?.forEach((actionId) => {
        let points = 0;
        let categoryKey: string | undefined;

        if (actionId.startsWith('custom_')) {
          const customAction = allCustom.find((a) => a.id === actionId);
          if (customAction) {
            points = customAction.points;
            categoryKey = 'النوافل';
          }
        } else {
          const foundAction = allActions.find((a) => a.id === actionId);
          if (foundAction) {
            points = foundAction.points;
            actionCounts[foundAction.id].count += 1;
            const groupKey = Object.keys(CATEGORY_MAP).find((key) =>
              foundAction.groupId.includes(key)
            );
            categoryKey = groupKey ? CATEGORY_MAP[groupKey] : 'النوافل';
          }
        }

        if (points > 0 && categoryKey && Object.prototype.hasOwnProperty.call(categoryPoints, categoryKey)) {
          categoryPoints[categoryKey] += points;
        }
      });
    });

    const categoryDistribution = Object.entries(categoryPoints)
      .filter(([, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }));

    const actionPerformance = Object.entries(actionCounts)
      .map(([id, { count, label }]) => ({
        id,
        label,
        percentage: (count / commitmentDays) * 100,
      }))
      .sort((a, b) => a.percentage - b.percentage);

    const mostKept = actionPerformance.filter((a) => a.percentage >= 70).slice(-5).reverse();
    const needsFocus = actionPerformance.filter((a) => a.percentage < 70).slice(0, 5);

    return {
      commitmentDays,
      bestDay,
      avgPoints,
      fullCommitmentDays,
      completionPercentage,
      performanceData,
      categoryDistribution,
      mostKept,
      needsFocus,
    };
  }, [filteredEntries, timeframe]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadData = useCallback(() => {
    if (!filteredEntries.length) {
      toast({
        variant: 'destructive',
        title: t('لا توجد بيانات للتحميل', 'No data to export'),
      });
      return;
    }

    const payload = {
      reportDate: new Date().toISOString(),
      timeframe,
      stats,
      entries: filteredEntries,
    };

    const dataStr = JSON.stringify(
      payload,
      (_key, value) => {
        if (value && typeof value === 'object' && typeof value.toDate === 'function') {
          return value.toDate().toISOString();
        }
        if (value && typeof value === 'object' && typeof value.seconds === 'number') {
          return new Date(value.seconds * 1000).toISOString();
        }
        return value;
      },
      2
    );

    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iman-harvest-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: t('تم تصدير البيانات', 'Export complete'),
      description: t('تم تنزيل تقرير الحصاد الإيماني بصيغة JSON.', 'Report downloaded as JSON.'),
    });
  }, [filteredEntries, stats, timeframe, toast, t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 rounded-2xl border border-border bg-card/60">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const periodLabel = timeframe === 'weekly' ? t('أسبوعي', 'Weekly') : t('شهري', 'Monthly');

  return (
    <>
      <div className="non-printable space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Report Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card/85">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>{t('الحصاد الإيماني', 'Faith Harvest Report')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('ملخص التزامك وتطور عباداتك خلال الفترة المختارة', 'Summary of your worship consistency')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
              <Button
                type="button"
                variant={timeframe === 'weekly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe('weekly')}
                className="rounded-lg text-xs font-bold h-8"
              >
                {t('7 أيام', '7 Days')}
              </Button>
              <Button
                type="button"
                variant={timeframe === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe('monthly')}
                className="rounded-lg text-xs font-bold h-8"
              >
                {t('30 يوماً', '30 Days')}
              </Button>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="rounded-xl gap-1.5 text-xs font-bold h-9">
              <Printer className="w-3.5 h-3.5" />
              <span>{t('طباعة / PDF', 'Print / PDF')}</span>
            </Button>

            <Button type="button" variant="outline" size="sm" onClick={handleDownloadData} className="rounded-xl gap-1.5 text-xs font-bold h-9">
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/85 border-border rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground">{t('أيام التسجيل', 'Logged Days')}</p>
                <p className="text-2xl sm:text-3xl font-black text-foreground mt-1">{stats.commitmentDays}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/85 border-border rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground">{t('التزام تام', 'Full Days')}</p>
                <p className="text-2xl sm:text-3xl font-black text-foreground mt-1">{stats.fullCommitmentDays}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/85 border-border rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground">{t('أفضل يوم', 'Best Day')}</p>
                <p className="text-xl sm:text-2xl font-black text-foreground mt-1">{stats.bestDay}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/85 border-border rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground">{t('متوسط الإنجاز', 'Avg Score')}</p>
                <p className="text-2xl sm:text-3xl font-black text-foreground mt-1">{stats.completionPercentage}%</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/85 border-border rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>{t('تطور النقاط اليومية', 'Daily Points Trend')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] pt-4">
              {stats.performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.performanceData} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accountabilityTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="points"
                      name={t('النقاط', 'Points')}
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#accountabilityTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  {t('لا توجد بيانات كافية لعرض الرسم البياني بعد', 'Not enough logged days yet')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/85 border-border rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <PieChartIcon className="w-4 h-4 text-primary" />
                <span>{t('توزيع النقاط حسب العبادة', 'Points by Category')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {stats.categoryDistribution.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-[220px] w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categoryDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={82}
                          paddingAngle={5}
                        >
                          {stats.categoryDistribution.map((entry, index) => (
                            <Cell key={`cat-${index}`} fill={entry.fill} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '12px',
                            color: 'hsl(var(--foreground))',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-1/2">
                    {stats.categoryDistribution.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                          <span className="font-bold text-foreground">{entry.name}</span>
                        </div>
                        <span className="font-mono font-bold text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  {t('سجل عباداتك اليومية ليظهر التوزيع هنا', 'Start logging actions to see distribution')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Most Kept vs Needs Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/85 border-border rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-500">
                <ThumbsUp className="w-4 h-4" />
                <span>{t('أكثر الأعمال مواظبة', 'Most Consistent')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {stats.mostKept.length > 0 ? (
                stats.mostKept.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm"
                  >
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="font-mono font-bold text-emerald-500">{Math.round(item.percentage)}%</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  {t('ستظهر الأعمال الأكثر استمراراً عند توفر سجلات كافية.', 'Appears once enough days are logged.')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/85 border-border rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('جوانب تحتاج إلى تعزيز', 'Needs More Focus')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {stats.needsFocus.length > 0 ? (
                stats.needsFocus.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm"
                  >
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="font-mono font-bold text-amber-500">{Math.round(item.percentage)}%</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  {t('ما شاء الله! لا توجد جوانب منخفضة في هذه الفترة.', 'Great consistency in this period.')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden print:block">
        <div className="printable-area">
          <PrintableReport ref={componentRef} stats={stats} periodLabel={periodLabel} />
        </div>
      </div>
    </>
  );
}
