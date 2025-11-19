
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Book, Clapperboard, MessageSquare, ListVideo, Users, Loader2, Hash, HelpCircle, CalendarClock, Upload, UserCog, MicVocal } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCollection, useUser } from "@/firebase";
import type { Lecture, Series, Book as BookType, Sheikh } from "@/lib/types";
import { TrafficChart } from "@/components/admin/traffic-chart";

export default function AdminDashboardPage() {
    const { user } = useUser();

    const { data: allSheikhs, isLoading: sheikhsLoading } = useCollection<Sheikh>('sheikhs');
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const { data: allBooks, isLoading: booksLoading } = useCollection<BookType>('books');
    const { data: popularLectures, isLoading: popularLecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['viewCount', 'desc'], limit: 5 });

    const isLoading = sheikhsLoading || lecturesLoading || seriesLoading || booksLoading || popularLecturesLoading;

    const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: number, icon: React.ElementType, isLoading: boolean }) => (
      <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-headline">{title}</CardTitle>
              <Icon className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <p className="text-3xl font-bold">{value}</p>}
          </CardContent>
      </Card>
    );

  return (
    <div className="space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline">لوحة تحكم المدير</h1>
            <p className="text-muted-foreground mt-2">نظرة عامة على أداء الموقع والمحتوى.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="lg"><Link href="/admin/lectures/new">إضافة محاضرة</Link></Button>
            <Button asChild size="lg" variant="secondary"><Link href="/admin/series/new">إضافة سلسلة</Link></Button>
          </div>
        </header>
        
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="إجمالي المشايخ" value={allSheikhs?.length ?? 0} icon={MicVocal} isLoading={sheikhsLoading} />
            <StatCard title="إجمالي المحاضرات" value={allLectures?.length ?? 0} icon={Clapperboard} isLoading={lecturesLoading} />
            <StatCard title="إجمالي السلاسل" value={allSeries?.length ?? 0} icon={ListVideo} isLoading={seriesLoading} />
            <StatCard title="إجمالي الكتب" value={allBooks?.length ?? 0} icon={Book} isLoading={booksLoading} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold font-headline">إحصائيات الزوار (آخر 7 أيام)</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] w-full">
                  <TrafficChart />
                </CardContent>
            </Card>
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold font-headline">إدارة المحتوى</CardTitle>
                    <CardDescription>روابط سريعة للتحكم بالموقع</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/sheikhs"><span>إدارة المشايخ</span><MicVocal /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/lectures"><span>إدارة المحاضرات</span><Clapperboard /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/series"><span>إدارة السلاسل</span><ListVideo /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/books"><span>إدارة الكتب</span><Book /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/topics"><span>إدارة المواضيع</span><Hash /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/schedule"><span>جدول الدروس</span><CalendarClock /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/qa"><span>الأسئلة والأجوبة</span><HelpCircle /></Link></Button>
                </CardContent>
            </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                            {popularLecturesLoading ? (
                                <TableRow><TableCell colSpan={2} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                            ) : popularLectures?.map(lecture => (
                                <TableRow key={lecture.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/lectures/${lecture.slug}`} className="hover:underline" target="_blank">{lecture.title}</Link>
                                    </TableCell>
                                    <TableCell>{lecture.viewCount || 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold font-headline">أدوات إدارية متقدمة</CardTitle>
                    <CardDescription>أدوات لإدارة المحتوى والمستخدمين بكفاءة.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/users"><span>إدارة المستخدمين</span><UserCog /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/lectures/import"><span>استيراد المحاضرات</span><Upload /></Link></Button>
                </CardContent>
            </Card>
        </section>
    </div>
  );
}
