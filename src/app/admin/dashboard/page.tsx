
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllLectures } from "@/lib/data";
import { BarChart, Book, Clapperboard, MessageSquare, Users } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

const trafficData = [
  { name: 'قبل 6 أيام', visits: 1200, users: 800 },
  { name: 'قبل 5 أيام', visits: 1500, users: 950 },
  { name: 'قبل 4 أيام', visits: 1300, users: 900 },
  { name: 'قبل 3 أيام', visits: 1700, users: 1100 },
  { name: 'قبل 2 يوم', visits: 1600, users: 1050 },
  { name: 'الأمس', visits: 1900, users: 1250 },
  { name: 'اليوم', visits: 2400, users: 1500 },
];

export default function AdminDashboardPage() {
    const allLectures = getAllLectures();
    const lectureCount = allLectures.length;
    const userCount = "1,500";
    const newCommentsCount = 25;
    const bookCount = 3; 
    const seriesCount = 4;

  return (
    <div className="space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline">لوحة تحكم المدير</h1>
            <p className="text-muted-foreground mt-2">نظرة عامة على أداء الموقع والمحتوى.</p>
          </div>
          <Button size="lg" className="bg-primary/90 hover:bg-primary">إضافة محاضرة جديدة</Button>
        </header>
        
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground font-headline">إجمالي المحاضرات</CardTitle>
                    <Clapperboard className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{lectureCount}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground font-headline">المستخدمون</CardTitle>
                    <Users className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{userCount}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground font-headline">الكتب</CardTitle>
                    <Book className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{bookCount}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground font-headline">التعليقات الجديدة</CardTitle>
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{newCommentsCount}</p>
                </CardContent>
            </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold font-headline">إحصائيات الزوار (آخر 7 أيام)</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] w-full">
                    <ResponsiveContainer>
                        <LineChart data={trafficData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis stroke="hsl(var(--foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                    color: 'hsl(var(--card-foreground))'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="visits" name="الزيارات" stroke="hsl(var(--primary-foreground))" strokeWidth={2} />
                            <Line type="monotone" dataKey="users" name="المستخدمون" stroke="hsl(var(--accent-foreground))" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold font-headline">إدارة المحتوى</CardTitle>
                    <CardDescription>أدوات سريعة للتحكم بالموقع</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button size="lg" className="w-full">إدارة السلاسل ({seriesCount})</Button>
                    <Button size="lg" className="w-full">إدارة الكتب ({bookCount})</Button>
                    <Button size="lg" className="w-full">إدارة الأسئلة والأجوبة</Button>
                    <Button size="lg" variant="secondary" className="w-full">مراجعة التعليقات</Button>
                </CardContent>
            </Card>
        </section>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold font-headline">أحدث المحاضرات</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>عنوان المحاضرة</TableHead>
                            <TableHead>السلسلة</TableHead>
                            <TableHead className="hidden md:table-cell">تاريخ الإضافة</TableHead>
                            <TableHead className="text-left">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allLectures.slice(0, 5).map(lecture => (
                            <TableRow key={lecture.slug}>
                                <TableCell className="font-medium">{lecture.title}</TableCell>
                                <TableCell>{lecture.seriesTitle}</TableCell>
                                <TableCell className="hidden md:table-cell">{new Date(lecture.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                                <TableCell className="text-left">
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">تعديل</Button>
                                        <Button variant="destructive" size="sm">حذف</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}

    