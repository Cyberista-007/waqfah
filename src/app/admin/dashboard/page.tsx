
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Book, Clapperboard, MessageSquare, ListVideo, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, collectionGroup } from "firebase/firestore";
import type { Lecture, Series, Book as BookType, Comment } from "@/lib/types";
import { TrafficChart } from "@/components/admin/traffic-chart";

export default function AdminDashboardPage() {
    const firestore = useFirestore();

    const lecturesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'lectures')) : null, [firestore]);
    const seriesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'series')) : null, [firestore]);
    const booksQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'books')) : null, [firestore]);
    const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
    
    const recentCommentsQuery = useMemoFirebase(
      () => firestore ? query(collectionGroup(firestore, 'comments'), where('status', '==', 'pending')) : null, 
      [firestore]
    );

    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>(lecturesQuery);
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>(seriesQuery);
    const { data: allBooks, isLoading: booksLoading } = useCollection<BookType>(booksQuery);
    const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);
    const { data: recentComments, isLoading: commentsLoading } = useCollection<Comment>(recentCommentsQuery);
    
    const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: number, icon: React.ElementType, isLoading: boolean }) => (
      <Card>
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
        
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard title="إجمالي المحاضرات" value={allLectures?.length ?? 0} icon={Clapperboard} isLoading={lecturesLoading} />
            <StatCard title="إجمالي السلاسل" value={allSeries?.length ?? 0} icon={ListVideo} isLoading={seriesLoading} />
            <StatCard title="إجمالي الكتب" value={allBooks?.length ?? 0} icon={Book} isLoading={booksLoading} />
            <StatCard title="إجمالي المستخدمين" value={allUsers?.length ?? 0} icon={Users} isLoading={usersLoading} />
            <StatCard title="التعليقات الجديدة" value={recentComments?.length ?? 0} icon={MessageSquare} isLoading={commentsLoading} />
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
                        {commentsLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              <Loader2 className="mx-auto my-4 h-8 w-8 animate-spin" />
                            </TableCell>
                          </TableRow>
                        ) : recentComments?.slice(0, 4).map(comment => (
                            <TableRow key={comment.id}>
                                <TableCell className="font-medium">{comment.userName}</TableCell>
                                <TableCell className="text-muted-foreground">{comment.text}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <Link href={`/lectures/${comment.lectureSlug}`} className="hover:underline">{comment.lectureTitle}</Link>
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
                {!commentsLoading && !recentComments?.length && <p className="text-center text-muted-foreground py-8">لا توجد تعليقات جديدة للمراجعة.</p>}
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
