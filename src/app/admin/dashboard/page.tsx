
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Book, Clapperboard, MessageSquare, ListVideo } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Lecture, Series, Book as BookType } from "@/lib/types"; // Renamed to avoid conflict with lucide icon
import { TrafficChart } from "@/components/admin/traffic-chart";

const recentComments = [
    { id: 1, user: "عبد الله محمد", text: "جزاكم الله خيراً، محاضرة قيمة جداً.", lecture: "أهمية التوحيد", status: "approved" },
    { id: 2, user: "فاطمة علي", text: "نفع الله بكم.", lecture: "فضل العلم", status: "approved" },
    { id: 3, user: "أحمد ياسر", text: "شرح ممتاز وواضح.", lecture: "المقدمة: العالم قبل البعثة", status: "pending" },
    { id: 4, user: "سارة محمود", text: "هل هناك جزء ثان لهذه المحاضرة؟", lecture: "شرح نواقض الإسلام", status: "pending" },
];


export default function AdminDashboardPage() {
    const firestore = useFirestore();

    const lecturesQuery = useMemoFirebase(() => query(collection(firestore, 'lectures')), [firestore]);
    const seriesQuery = useMemoFirebase(() => query(collection(firestore, 'series')), [firestore]);
    const booksQuery = useMemoFirebase(() => query(collection(firestore, 'books')), [firestore]);
    
    const { data: allLectures } = useCollection<Lecture>(lecturesQuery);
    const { data: allSeries } = useCollection<Series>(seriesQuery);
    const { data: allBooks } = useCollection<BookType>(booksQuery);
    
    const lectureCount = allLectures?.length ?? 0;
    const seriesCount = allSeries?.length ?? 0;
    const bookCount = allBooks?.length ?? 0;
    const newCommentsCount = recentComments.filter(c => c.status === 'pending').length;

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
                    <CardTitle className="text-sm font-medium text-muted-foreground font-headline">إجمالي السلاسل</CardTitle>
                    <ListVideo className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{seriesCount}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground font-headline">إجمالي الكتب</CardTitle>
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
                     <p className="text-xs text-muted-foreground">في انتظار المراجعة</p>
                </CardContent>
            </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold font-headline">إحصائيات الزوار (آخر 7 أيام)</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] w-full">
                  <TrafficChart />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold font-headline">إدارة المحتوى</CardTitle>
                    <CardDescription>روابط سريعة للتحكم بالموقع</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/lectures"><span>إدارة المحاضرات</span><Clapperboard /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/series"><span>إدارة السلاسل</span><ListVideo /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/books"><span>إدارة الكتب</span><Book /></Link></Button>
                    <Button asChild size="lg" className="w-full justify-between"><Link href="/admin/comments"><span>مراجعة التعليقات</span><MessageSquare /></Link></Button>
                </CardContent>
            </Card>
        </section>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold font-headline">أحدث التعليقات</CardTitle>
                <CardDescription>نظرة سريعة على آخر تعليقات الزوار.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>المستخدم</TableHead>
                            <TableHead>التعليق</TableHead>
                            <TableHead className="hidden md:table-cell">المحاضرة</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead className="text-left">إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentComments.map(comment => (
                            <TableRow key={comment.id}>
                                <TableCell className="font-medium">{comment.user}</TableCell>
                                <TableCell className="text-muted-foreground">{comment.text}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <Link href="#" className="hover:underline">{comment.lecture}</Link>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={comment.status === 'approved' ? 'default' : 'secondary'}>
                                        {comment.status === 'approved' ? 'مقبول' : 'قيد المراجعة'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-left">
                                     <Button asChild variant="outline" size="sm">
                                        <Link href="/admin/comments">مراجعة</Link>
                                     </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="mt-4 text-center">
                    <Button asChild variant="secondary">
                        <Link href="/admin/comments">عرض كل التعليقات</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
