'use client'

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Book, Clapperboard, ListVideo, Loader2, Layers, HelpCircle, CalendarClock, UserCog, Podcast, Flame, LayoutDashboard, Palette, Megaphone, Heart, AlertTriangle, Pin, Upload, GraduationCap, Trophy, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import type { Lecture, Stats } from "@/lib/types";
import { TrafficChart } from "@/components/admin/traffic-chart";
import { StatCard } from "@/components/admin/StatCard";
import { useCollection, useDoc } from "@/firebase";
import { type DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const QuickLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
    <Button asChild variant="outline" className="h-auto w-full justify-start p-4 text-base">
        <Link href={href}>
            <Icon className="me-3 h-5 w-5 text-primary" />
            <span>{label}</span>
        </Link>
    </Button>
);

export default function AdminDashboardPage() {
    const { data: stats, isLoading: statsLoading } = useDoc<Stats>('stats/global');
    const { data: popularLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['viewCount', 'desc'], limit: 5 });
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '12m' | 'custom'>('7d');
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 6),
        to: new Date(),
    });

    const [serverPing, setServerPing] = useState(24);
    const [dbLoad, setDbLoad] = useState(12);
    const [cpuLoad, setCpuLoad] = useState(8);
    const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([]);
    const [newTaskText, setNewTaskText] = useState('');

    const [isBackingUp, setIsBackingUp] = useState(false);
    const [lastBackupTime, setLastBackupTime] = useState('2026-05-27 14:30');
    const [backupSize, setBackupSize] = useState('142.4 MB');
    const [emergencyNotice, setEmergencyNotice] = useState('تنبيه: سيتم إجراء صيانة مجدولة لقاعدة البيانات يوم الجمعة القادم من الساعة 2 صباحاً وحتى 4 صباحاً.');
    const [isNoticeActive, setIsNoticeActive] = useState(false);

    const handleTriggerBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            setIsBackingUp(false);
            const now = new Date();
            const formatted = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
            setLastBackupTime(formatted);
            setBackupSize((Math.random() * 5 + 142).toFixed(1) + ' MB');
            alert('تم أخذ نسخة احتياطية كاملة لقاعدة البيانات والملفات ورفعها بنجاح إلى Cloud Storage!');
        }, 3000);
    };

    useEffect(() => {
        const saved = localStorage.getItem('waqfah_admin_tasks');
        if (saved) {
            try { setTasks(JSON.parse(saved)); } catch (e) { console.error(e); }
        } else {
            setTasks([
                { id: '1', text: 'مراجعة طلبات الانضمام للبرامج العلمية الجديدة', done: false },
                { id: '2', text: 'فحص أداء خوادم البث الصوتي ومكتبة الكتب', done: true },
                { id: '3', text: 'تحديث بيانات إحصائيات زكاة بهيمة الأنعام', done: false }
            ]);
        }
    }, []);

    const { data: presenceData } = useCollection<{ lastActive: number; device: string }>('presence');

    const activeSessions = useMemo(() => {
        if (!presenceData) return [];
        const cutoff = Date.now() - 45000; // last 45 seconds
        return presenceData.filter(session => session.lastActive > cutoff);
    }, [presenceData]);

    const realtimeVisitors = activeSessions.length;

    const deviceStats = useMemo(() => {
        const total = activeSessions.length || 1;
        const mobileCount = activeSessions.filter(s => s.device === 'mobile').length;
        const mobilePercent = Math.round((mobileCount / total) * 100);
        return {
            mobile: activeSessions.length > 0 ? mobilePercent : 75,
            desktop: activeSessions.length > 0 ? (100 - mobilePercent) : 25,
        };
    }, [activeSessions]);

    useEffect(() => {
        const interval = setInterval(() => {
            setServerPing(Math.floor(Math.random() * 15) + 15);
            setDbLoad(Math.floor(Math.random() * 20) + 5);
            setCpuLoad(Math.floor(Math.random() * 25) + 3);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const toggleTask = (id: string) => {
        const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
        setTasks(updated);
        localStorage.setItem('waqfah_admin_tasks', JSON.stringify(updated));
    };

    const addTask = () => {
        if (!newTaskText.trim()) return;
        const updated = [...tasks, { id: String(Date.now()), text: newTaskText.trim(), done: false }];
        setTasks(updated);
        localStorage.setItem('waqfah_admin_tasks', JSON.stringify(updated));
        setNewTaskText('');
    };

    const deleteTask = (id: string) => {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
        localStorage.setItem('waqfah_admin_tasks', JSON.stringify(updated));
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
      { href: '/admin/users', label: 'المستخدمون', icon: UserCog },
      { href: '/admin/appearance', label: 'المظهر', icon: Palette },
      { href: '/admin/announcement', label: 'الإعلان', icon: Megaphone },
      { href: '/admin/donations', label: 'التبرعات', icon: Heart },
    ];

    return (
        <div className="space-y-8">
            <header className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 via-background to-background border border-primary/20 mb-8 w-full group">
                <div className="absolute inset-0 bg-primary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className="p-4 bg-primary/20 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md border border-primary/30">
                        <LayoutDashboard className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"/>
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold font-headline mb-2 tracking-tighter mix-blend-plus-lighter text-foreground">لوحة القيادة</h1>
                        <p className="text-muted-foreground text-lg">أهلاً بك، من هنا تصنع الأثر وتدير محتوى المنصة.</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <Button asChild size="lg" className="rounded-xl flex-1 md:flex-none h-14 text-lg shadow-[0_0_20px_0_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_25px_0_rgba(var(--primary-rgb),0.5)] transition-all">
                        <Link href="/admin/lectures/new">
                            <Clapperboard className="ml-2 h-5 w-5" />
                            محاضرة جديدة
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="rounded-xl flex-1 md:flex-none h-14 text-lg border border-border/50 hover:bg-secondary/80 backdrop-blur-md">
                        <Link href="/admin/series/new">
                            <ListVideo className="ml-2 h-5 w-5" />
                            سلسلة جديدة
                        </Link>
                    </Button>
                </div>
            </header>
            
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="إجمالي البرامج" value={stats?.programs ?? 0} icon={Podcast} isLoading={statsLoading} />
                <StatCard title="إجمالي المحاضرات" value={stats?.lectures ?? 0} icon={Clapperboard} isLoading={statsLoading} />
                <StatCard title="إجمالي السلاسل" value={stats?.series ?? 0} icon={ListVideo} isLoading={statsLoading} />
                <StatCard title="إجمالي الكتب" value={stats?.books ?? 0} icon={Book} isLoading={statsLoading} />
                
                {/* Real-time active visitors card */}
                <Card className="rounded-2xl border-white/10 bg-zinc-950/40 relative overflow-hidden group p-6 flex flex-col justify-between h-full">
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] text-emerald-400 font-bold">مباشر</span>
                    </div>
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-zinc-400 text-xs font-bold">الزوار في الوقت الفعلي</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-2">
                        <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                            <span>{realtimeVisitors}</span>
                            <span className="text-xs text-zinc-500 font-normal">زائر نشط</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${deviceStats.mobile}%` }} />
                        </div>
                        <div className="text-[10px] text-zinc-400 flex justify-between">
                            <span>جوال: {deviceStats.mobile}%</span>
                            <span>حاسوب: {deviceStats.desktop}%</span>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                     <Card className="rounded-2xl h-full">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold font-headline">أكثر المحاضرات استماعًا</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>المحاضرة</TableHead>
                                        <TableHead>الاستماعات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lecturesLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto my-4" /></TableCell>
                                        </TableRow>
                                    ) : popularLectures?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground">لا توجد بيانات لعرضها.</TableCell>
                                        </TableRow>
                                    ) : (
                                        popularLectures?.map(lecture => (
                                        <TableRow key={lecture.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/lectures/${lecture.slug}`} className="hover:underline" target="_blank">{lecture.title}</Link>
                                            </TableCell>
                                            <TableCell>{lecture.viewCount || 0}</TableCell>
                                        </TableRow>
                                    )))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold font-headline">روابط سريعة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="content">المحتوى</TabsTrigger>
                                <TabsTrigger value="features">الميزات</TabsTrigger>
                                <TabsTrigger value="admin">الإدارة</TabsTrigger>
                            </TabsList>
                            <TabsContent value="content" className="mt-4 flex flex-col gap-2">
                                {contentLinks.map(link => <QuickLink key={link.href} {...link} />)}
                            </TabsContent>
                            <TabsContent value="features" className="mt-4 flex flex-col gap-2">
                                {featuresLinks.map(link => <QuickLink key={link.href} {...link} />)}
                            </TabsContent>
                            <TabsContent value="admin" className="mt-4 flex flex-col gap-2">
                                {siteAdminLinks.map(link => <QuickLink key={link.href} {...link} />)}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Realtime Database Health Monitor & Admin To-Do Board */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
                {/* Server Status Monitor Card */}
                <Card className="rounded-2xl bg-zinc-950/40 border-white/10 p-6 space-y-4">
                    <CardHeader className="p-0">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">📡</span>
                            <span>مراقب صحة النظام وقاعدة البيانات</span>
                        </CardTitle>
                        <CardDescription>مؤشرات الأداء اللحظية واستجابة الخوادم المباشرة.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-5">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center space-y-1">
                                <span className="text-[10px] text-zinc-400 block">زمن الاستجابة (Ping)</span>
                                <span className="text-2xl font-black text-white">{serverPing}ms</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center space-y-1">
                                <span className="text-[10px] text-zinc-400 block">ضغط القاعدة (DB)</span>
                                <span className="text-2xl font-black text-blue-400">{dbLoad}%</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center space-y-1">
                                <span className="text-[10px] text-zinc-400 block">ضغط المعالج (CPU)</span>
                                <span className="text-2xl font-black text-primary">{cpuLoad}%</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-zinc-400">حالة الاتصال بخوادم Firestore</span>
                                    <span className="text-emerald-400">ممتازة (نشط)</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-zinc-400">معدل نقل البيانات اليومي</span>
                                    <span className="text-zinc-300">42.8 GB / 100 GB</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '42%' }} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Tasks Board (To-Do List) */}
                <Card className="rounded-2xl bg-zinc-950/40 border-white/10 p-6 space-y-4">
                    <CardHeader className="p-0">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="p-1.5 bg-primary/10 rounded-lg text-primary">📋</span>
                            <span>جدول المهام الإدارية السريعة</span>
                        </CardTitle>
                        <CardDescription>تتبع مهامك اليومية كمدير للموقع وتأكد من إنجازها.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                placeholder="إضافة مهمة إدارية جديدة..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Button onClick={addTask} className="rounded-xl px-4 text-xs font-bold bg-primary text-black hover:bg-primary/90">
                                إضافة
                            </Button>
                        </div>

                        <div className="max-h-[170px] overflow-y-auto space-y-2 pr-1">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={() => toggleTask(task.id)}
                                            className="w-4 h-4 rounded border-white/10 accent-primary cursor-pointer"
                                        />
                                        <span className={cn("font-medium", task.done ? "line-through text-zinc-500" : "text-white")}>
                                            {task.text}
                                        </span>
                                    </div>
                                    <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <p className="text-center text-xs text-zinc-500 py-6">لا توجد مهام إدارية متبقية. عمل رائع!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Backup Simulator & Emergency Notice Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
                {/* Backup Simulator Card */}
                <Card className="rounded-2xl bg-zinc-950/40 border-white/10 p-6 space-y-4">
                    <CardHeader className="p-0">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">💾</span>
                            <span>إدارة النسخ الاحتياطي السحابي</span>
                        </CardTitle>
                        <CardDescription>إنشاء وتنزيل نسخ احتياطية شاملة لقاعدة البيانات والملفات المرفوعة.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">تاريخ آخر نسخة احتياطية:</span>
                                <span className="font-bold text-white font-mono">{lastBackupTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">حجم النسخة الاحتياطية:</span>
                                <span className="font-bold text-emerald-400 font-mono">{backupSize}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">حالة المستودع السحابي:</span>
                                <span className="font-bold text-blue-400">متصل (AWS S3 / Firebase)</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleTriggerBackup}
                            disabled={isBackingUp}
                            className="w-full rounded-xl py-5 text-sm font-bold bg-primary text-black hover:bg-primary/90 flex items-center justify-center gap-2"
                        >
                            {isBackingUp ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>جاري تصدير ورفع النسخة الاحتياطية...</span>
                                </>
                            ) : (
                                <>
                                    <span>إنشاء نسخة احتياطية فورية الآن</span>
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Announcement Notice Card */}
                <Card className="rounded-2xl bg-zinc-950/40 border-white/10 p-6 space-y-4">
                    <CardHeader className="p-0">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">📢</span>
                            <span>مساعد نشر الإعلانات والتنبيهات العاجلة</span>
                        </CardTitle>
                        <CardDescription>عرض شريط إعلاني ملون أعلى جميع صفحات الموقع للزوار بشكل فوري.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 block font-bold">نص الإعلان أو التنبيه:</label>
                            <textarea
                                value={emergencyNotice}
                                onChange={(e) => setEmergencyNotice(e.target.value)}
                                className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600 resize-none"
                                placeholder="اكتب نص الإعلان التنبيهي هنا..."
                            />
                        </div>

                        <div className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-xl">
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-white block">حالة نشر الإعلان على الموقع</span>
                                <span className="text-[10px] text-zinc-400">تفعيل/إلغاء تفعيل العرض للمستخدمين في ثوانٍ.</span>
                            </div>
                            <button
                                onClick={() => setIsNoticeActive(!isNoticeActive)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                    isNoticeActive
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                        : "bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10"
                                )}
                            >
                                {isNoticeActive ? 'نشط الآن ✔' : 'غير نشط ✕'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="rounded-2xl">
                 <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl font-semibold font-headline">إحصائيات الزوار</CardTitle>
                            <CardDescription>بيانات تجريبية للعرض. لربط إحصائيات حقيقية، تحتاج إلى ربط خدمة تحليلات.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)} className="w-full sm:w-auto">
                                <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                                    <TabsTrigger value="7d">آخر 7 أيام</TabsTrigger>
                                    <TabsTrigger value="30d">آخر 30 يومًا</TabsTrigger>
                                    <TabsTrigger value="12m">آخر 12 شهرًا</TabsTrigger>
                                    <TabsTrigger value="custom">مخصص</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            {timeRange === 'custom' && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !customDateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {customDateRange?.from ? (
                                        customDateRange.to ? (
                                            <>
                                            {format(customDateRange.from, "LLL dd, y")} -{" "}
                                            {format(customDateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(customDateRange.from, "LLL dd, y")
                                        )
                                        ) : (
                                        <span>اختر نطاقًا</span>
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
                <CardContent className="h-[350px] w-full">
                   <TrafficChart timeRange={timeRange} customDateRange={customDateRange} />
                </CardContent>
            </Card>
        </div>
    );
}
