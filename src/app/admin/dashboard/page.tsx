'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Book, Clapperboard, ListVideo, Loader2, Hash, HelpCircle, CalendarClock, UserCog, Podcast, Flame, LayoutDashboard, Palette, Megaphone, Heart, AlertTriangle, Pin, Upload, GraduationCap, Trophy, Calendar as CalendarIcon } from "lucide-react";
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


// New component for quick links
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
    
    // Links grouped by category
    const contentLinks = [
      { href: '/admin/programs', label: 'البرامج', icon: Podcast },
      { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
      { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
      { href: '/admin/books', label: 'الكتب', icon: Book },
      { href: '/admin/curriculums', label: 'المناهج', icon: GraduationCap },
      { href: '/admin/topics', label: 'المواضيع', icon: Hash },
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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-headline flex items-center gap-2"><LayoutDashboard className="h-9 w-9 animate-icon-draw"/>لوحة تحكم المدير</h1>
                    <p className="text-muted-foreground mt-2">نظرة عامة على أداء الموقع والمحتوى.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild size="lg"><Link href="/admin/lectures/new">إضافة محاضرة</Link></Button>
                    <Button asChild size="lg" variant="secondary"><Link href="/admin/series/new">إضافة سلسلة</Link></Button>
                </div>
            </header>
            
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="إجمالي البرامج" value={stats?.programs ?? 0} icon={Podcast} isLoading={statsLoading} />
                <StatCard title="إجمالي المحاضرات" value={stats?.lectures ?? 0} icon={Clapperboard} isLoading={statsLoading} />
                <StatCard title="إجمالي السلاسل" value={stats?.series ?? 0} icon={ListVideo} isLoading={statsLoading} />
                <StatCard title="إجمالي الكتب" value={stats?.books ?? 0} icon={Book} isLoading={statsLoading} />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
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

                     <Card className="rounded-2xl">
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

                <div className="space-y-8">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold font-headline">إدارة المحتوى</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                           {contentLinks.map(link => <QuickLink key={link.href} {...link} />)}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold font-headline">إدارة الميزات</CardTitle>
                        </CardHeader>
                         <CardContent className="flex flex-col gap-2">
                           {featuresLinks.map(link => <QuickLink key={link.href} {...link} />)}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold font-headline">إدارة الموقع</CardTitle>
                        </CardHeader>
                         <CardContent className="flex flex-col gap-2">
                           {siteAdminLinks.map(link => <QuickLink key={link.href} {...link} />)}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
