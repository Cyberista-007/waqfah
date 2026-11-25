'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { doc, setDoc } from 'firebase/firestore';
import { subDays, format } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import {
  Activity,
  AlertTriangle,
  ArrowUpLeft,
  Book,
  Calendar as CalendarIcon,
  CalendarClock,
  CheckCircle2,
  Clapperboard,
  Download,
  Flame,
  GraduationCap,
  Heart,
  HelpCircle,
  Layers,
  LayoutDashboard,
  ListVideo,
  Loader2,
  Megaphone,
  Palette,
  Pin,
  Plus,
  Podcast,
  Save,
  Trash2,
  Trophy,
  Upload,
  UserCog,
} from 'lucide-react';

import type { AnnouncementSettings, Lecture, Stats } from '@/lib/types';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/admin/StatCard';
import { TrafficChart } from '@/components/admin/traffic-chart';

const QuickLink = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => (
  <Link
    href={href}
    className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-primary/10 border border-border/60 hover:border-primary/40 transition-all group"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-bold text-foreground">{label}</span>
    </div>
    <ArrowUpLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
  </Link>
);

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const { data: stats, isLoading: statsLoading } = useDoc<Stats>('stats/global');
  const { data: popularLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', {
    orderBy: ['viewCount', 'desc'],
    limit: 5,
  });
  const { data: presenceData } = useCollection<{ lastActive: number; device: string }>('presence');
  const { data: announcementDoc } = useDoc<AnnouncementSettings>('settings/announcement');

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '12m' | 'custom'>('7d');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  // Tasks state
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Real Announcement state synced with Firestore settings/announcement
  const [noticeText, setNoticeText] = useState('');
  const [isNoticeActive, setIsNoticeActive] = useState(false);
  const [isSavingNotice, setIsSavingNotice] = useState(false);

  // Real JSON Snapshot export state
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportTime, setLastExportTime] = useState<string>('لم يتم التصدير بعد');

  useEffect(() => {
    if (announcementDoc) {
      setNoticeText(announcementDoc.text || '');
      setIsNoticeActive(Boolean(announcementDoc.isActive));
    }
  }, [announcementDoc]);

  useEffect(() => {
    const saved = localStorage.getItem('waqfah_admin_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
        return;
      } catch {
        // fallback below
      }
    }
    setTasks([
      { id: '1', text: 'مراجعة طلبات الانضمام للبرامج العلمية الجديدة', done: false },
      { id: '2', text: 'فحص أداء البث الصوتي ومكتبة الكتب', done: true },
      { id: '3', text: 'تحديث عناصر الصفحة الرئيسية والمختارات', done: false },
    ]);
  }, []);

  const activeSessions = useMemo(() => {
    if (!presenceData) return [];
    const cutoff = Date.now() - 45000;
    return presenceData.filter((session) => session.lastActive > cutoff);
  }, [presenceData]);

  const realtimeVisitors = activeSessions.length;

  const deviceStats = useMemo(() => {
    if (activeSessions.length === 0) return { mobile: 0, desktop: 0 };
    const mobileCount = activeSessions.filter((s) => s.device === 'mobile').length;
    const mobilePercent = Math.round((mobileCount / activeSessions.length) * 100);
    return {
      mobile: mobilePercent,
      desktop: 100 - mobilePercent,
    };
  }, [activeSessions]);

  const handleSaveAnnouncement = async (nextActive?: boolean) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'خطأ في الاتصال بقاعدة البيانات.' });
      return;
    }
    const targetActive = typeof nextActive === 'boolean' ? nextActive : isNoticeActive;
    if (targetActive && !noticeText.trim()) {
      toast({ variant: 'destructive', title: 'لا يمكن تفعيل شريط إعلان فارغ.' });
      return;
    }

    setIsSavingNotice(true);
    try {
      await setDoc(
        doc(firestore, 'settings', 'announcement'),
        { text: noticeText.trim(), isActive: targetActive },
        { merge: true }
      );
      setIsNoticeActive(targetActive);
      toast({
        title: targetActive ? 'تم تفعيل شريط الإعلان على الموقع!' : 'تم حفظ إعدادات الإعلان.',
      });
    } catch {
      toast({ variant: 'destructive', title: 'تعذر حفظ إعدادات الإعلان.' });
    } finally {
      setIsSavingNotice(false);
    }
  };

  const handleExportSnapshot = () => {
    setIsExporting(true);
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        stats: stats || {},
        announcement: announcementDoc || {},
        popularLectures: (popularLectures || []).map((l) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          programName: l.programName,
          viewCount: l.viewCount || 0,
        })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `waqfah-snapshot-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastExportTime(format(new Date(), 'yyyy-MM-dd HH:mm'));
      toast({ title: 'تم تصدير نسخة البيانات (JSON) بنجاح!' });
    } catch {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء تصدير البيانات.' });
    } finally {
      setIsExporting(false);
    }
  };

  const persistTasks = (updated: { id: string; text: string; done: boolean }[]) => {
    setTasks(updated);
    localStorage.setItem('waqfah_admin_tasks', JSON.stringify(updated));
  };

  const toggleTask = (id: string) => {
    persistTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    persistTasks([...tasks, { id: String(Date.now()), text: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const deleteTask = (id: string) => {
    persistTasks(tasks.filter((t) => t.id !== id));
  };

  const contentLinks = [
    { href: '/admin/programs', label: 'البرامج', icon: Podcast },
    { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
    { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
    { href: '/admin/books', label: 'الكتب', icon: Book },
    { href: '/admin/curriculums', label: 'المناهج', icon: GraduationCap },
    { href: '/admin/topics', label: 'المسارات', icon: Layers },
    { href: '/admin/import', label: 'استيراد المحتوى', icon: Upload },
  ];

  const featuresLinks = [
    { href: '/admin/pinned', label: 'العناصر المثبتة', icon: Pin },
    { href: '/admin/challenges', label: 'التحديات', icon: Flame },
    { href: '/admin/badges', label: 'الأوسمة', icon: Trophy },
    { href: '/admin/schedule', label: 'جدول الدروس', icon: CalendarClock },
    { href: '/admin/qa', label: 'سؤال وجواب', icon: HelpCircle },
    { href: '/admin/sins', label: 'إدارة المهلكات', icon: AlertTriangle },
  ];

  const siteAdminLinks = [
    { href: '/admin/homepage', label: 'الصفحة الرئيسية', icon: LayoutDashboard },
    { href: '/admin/users', label: 'المستخدمون', icon: UserCog },
    { href: '/admin/appearance', label: 'المظهر', icon: Palette },
    { href: '/admin/announcement', label: 'الإعلان', icon: Megaphone },
    { href: '/admin/donations', label: 'التبرعات', icon: Heart },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Executive Hero Header */}
      <header className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 sm:p-8 rounded-3xl overflow-hidden luxury-glass border border-primary/20">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/15 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <LayoutDashboard className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black font-headline tracking-tight text-foreground">
              لوحة القيادة
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1 font-medium">
              أهلاً بك، من هنا تتابع مؤشرات المنصة وتدير المحتوى الشرعي بفاعلية.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3 w-full lg:w-auto">
          <Button asChild className="rounded-xl h-11 px-5 font-black flex-1 sm:flex-none">
            <Link href="/admin/lectures/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>محاضرة جديدة</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="rounded-xl h-11 px-5 font-bold flex-1 sm:flex-none">
            <Link href="/admin/series/new" className="flex items-center gap-2">
              <ListVideo className="h-4 w-4" />
              <span>سلسلة جديدة</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl h-11 px-5 font-bold flex-1 sm:flex-none">
            <Link href="/admin/import" className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              <span>استيراد</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard title="إجمالي البرامج" value={stats?.programs ?? 0} icon={Podcast} isLoading={statsLoading} />
        <StatCard title="إجمالي المحاضرات" value={stats?.lectures ?? 0} icon={Clapperboard} isLoading={statsLoading} />
        <StatCard title="إجمالي السلاسل" value={stats?.series ?? 0} icon={ListVideo} isLoading={statsLoading} />
        <StatCard title="إجمالي الكتب" value={stats?.books ?? 0} icon={Book} isLoading={statsLoading} />

        {/* Real-time Active Visitors Card */}
        <Card className="rounded-2xl luxury-card border-border/70 p-5 flex flex-col justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground font-headline">
              الزوار الآن
            </CardTitle>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-black">مباشر</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-foreground font-mono flex items-baseline gap-1.5">
              <span>{realtimeVisitors}</span>
              <span className="text-xs text-muted-foreground font-sans font-bold">زائر نشط</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${deviceStats.mobile}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground flex justify-between font-bold">
              <span>جوال: {deviceStats.mobile}%</span>
              <span>حاسوب: {deviceStats.desktop}%</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Popular Lectures & Quick Links */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 rounded-2xl border-border/70 bg-card/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black font-headline">أكثر المحاضرات استماعاً</CardTitle>
              <CardDescription className="text-xs mt-1">أعلى 5 محاضرات من حيث المشاهدات والاستماع</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs font-bold text-primary">
              <Link href="/admin/lectures">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المحاضرة</TableHead>
                  <TableHead className="text-right">البرنامج</TableHead>
                  <TableHead className="text-left">الاستماعات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lecturesLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : !popularLectures?.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      لا توجد بيانات لعرضها.
                    </TableCell>
                  </TableRow>
                ) : (
                  popularLectures.map((lecture, idx) => (
                    <TableRow key={lecture.id}>
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <Link
                            href={`/lectures/${lecture.slug}`}
                            className="hover:text-primary hover:underline line-clamp-1"
                            target="_blank"
                          >
                            {lecture.title}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {lecture.programName || '—'}
                      </TableCell>
                      <TableCell className="text-left font-mono font-bold">
                        {(lecture.viewCount || 0).toLocaleString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-black font-headline">روابط سريعة</CardTitle>
            <CardDescription className="text-xs">وصول مباشر لأقسام الإدارة</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">المحتوى</TabsTrigger>
                <TabsTrigger value="features">الميزات</TabsTrigger>
                <TabsTrigger value="admin">الإدارة</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="mt-4 flex flex-col gap-2">
                {contentLinks.map((link) => (
                  <QuickLink key={link.href} {...link} />
                ))}
              </TabsContent>
              <TabsContent value="features" className="mt-4 flex flex-col gap-2">
                {featuresLinks.map((link) => (
                  <QuickLink key={link.href} {...link} />
                ))}
              </TabsContent>
              <TabsContent value="admin" className="mt-4 flex flex-col gap-2">
                {siteAdminLinks.map((link) => (
                  <QuickLink key={link.href} {...link} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Live Announcement Control, Snapshot Export & Admin Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Firestore Announcement Control */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-xl p-6 flex flex-col justify-between gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-black flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Megaphone className="w-4 h-4" />
              </span>
              <span>شريط الإعلان المباشر</span>
            </CardTitle>
            <CardDescription className="text-xs">
              يتصل مباشرة بقاعدة البيانات لعرض التنبيه أعلى صفحات الموقع.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <textarea
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              className="w-full h-24 bg-background/60 border border-border rounded-xl p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground resize-none outline-none"
              placeholder="اكتب نص الإعلان أو التنبيه هنا..."
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={isSavingNotice}
                onClick={() => handleSaveAnnouncement(!isNoticeActive)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer',
                  isNoticeActive
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-muted/60 text-muted-foreground border-border hover:text-foreground'
                )}
              >
                {isNoticeActive ? 'نشط الآن ✔' : 'غير نشط'}
              </button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingNotice}
                onClick={() => handleSaveAnnouncement()}
                className="rounded-xl px-4 font-bold cursor-pointer"
              >
                {isSavingNotice ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin ml-1.5" />
                ) : (
                  <Save className="w-3.5 h-3.5 ml-1.5" />
                )}
                <span>حفظ</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* JSON Snapshot Export & System Status */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-xl p-6 flex flex-col justify-between gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-black flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Activity className="w-4 h-4" />
              </span>
              <span>تصدير البيانات وحالة النظام</span>
            </CardTitle>
            <CardDescription className="text-xs">
              تنزيل نسخة JSON فورية من الإحصائيات وأبرز المحاضرات وإعدادات الإعلان.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="bg-background/50 border border-border/60 p-4 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">حالة قاعدة البيانات:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Firestore متصل
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">آخر تصدير محلي:</span>
                <span className="font-bold text-foreground font-mono">{lastExportTime}</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleExportSnapshot}
              disabled={isExporting}
              className="w-full rounded-xl h-11 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>تصدير نسخة JSON الآن</span>
            </Button>
          </CardContent>
        </Card>

        {/* Admin To-Do Board */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-xl p-6 flex flex-col justify-between gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-black flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span>مهام الإدارة السريعة</span>
            </CardTitle>
            <CardDescription className="text-xs">تُحفظ تلقائياً في متصفحك لمتابعة أعمالك اليومية.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="إضافة مهمة جديدة..."
                className="flex-1 h-9 bg-background/60 border border-border rounded-xl px-3 text-xs font-bold text-foreground outline-none"
              />
              <Button type="button" size="sm" onClick={addTask} className="rounded-xl px-3.5 h-9 text-xs font-black cursor-pointer">
                إضافة
              </Button>
            </div>

            <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-2 pl-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2 bg-background/50 border border-border/60 p-2.5 rounded-xl text-xs"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
                    />
                    <span
                      className={cn(
                        'font-bold truncate',
                        task.done ? 'line-through text-muted-foreground' : 'text-foreground'
                      )}
                    >
                      {task.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label="حذف المهمة"
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-5">لا توجد مهام متبقية.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Analytics Chart */}
      <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-black font-headline">مؤشر الزيارات التقديري</CardTitle>
              <CardDescription className="text-xs mt-1">
                بيانات عرض تقديرية لمتابعة الاتجاه العام. لبيانات دقيقة يُنصح بربط Vercel Analytics أو GA4.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                  <TabsTrigger value="7d">7 أيام</TabsTrigger>
                  <TabsTrigger value="30d">30 يوماً</TabsTrigger>
                  <TabsTrigger value="12m">12 شهراً</TabsTrigger>
                  <TabsTrigger value="custom">مخصص</TabsTrigger>
                </TabsList>
              </Tabs>
              {timeRange === 'custom' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        'w-[240px] justify-start text-left font-normal rounded-xl',
                        !customDateRange && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {customDateRange?.from ? (
                        customDateRange.to ? (
                          <>
                            {format(customDateRange.from, 'LLL dd, y')} - {format(customDateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(customDateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>اختر نطاقاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={customDateRange?.from}
                      selected={customDateRange}
                      onSelect={setCustomDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[320px] w-full">
          <TrafficChart timeRange={timeRange} customDateRange={customDateRange} />
        </CardContent>
      </Card>
    </div>
  );
}
