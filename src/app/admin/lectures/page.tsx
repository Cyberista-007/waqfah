
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Lecture } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function AdminLecturesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const lecturesQuery = useMemoFirebase(
        () => query(collection(firestore, 'lectures'), orderBy('createdAt', 'desc')),
        [firestore]
    );
    const { data: allLectures, isLoading } = useCollection<Lecture>(lecturesQuery);

    const handleDelete = (title: string) => {
        toast({
            variant: "destructive",
            title: "تم الحذف (محاكاة)",
            description: `تم حذف محاضرة "${title}".`,
        });
    };

    if (isLoading) {
        return <p>جار تحميل المحاضرات...</p>;
    }

    return (
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline">إدارة المحاضرات</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف المحاضرات في الموقع.
            </CardDescription>
            </div>
            <Button asChild>
            <Link href="/admin/lectures/new">إضافة محاضرة جديدة</Link>
            </Button>
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
                {allLectures?.map((lecture) => (
                <TableRow key={lecture.id}>
                    <TableCell className="font-medium">{lecture.title}</TableCell>
                    <TableCell>{lecture.seriesTitle}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {lecture.createdAt?.toDate ? lecture.createdAt.toDate().toLocaleDateString('ar-EG') : 'غير معروف'}
                    </TableCell>
                    <TableCell className="text-left">
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/lectures/${lecture.id}/edit`}>
                            تعديل
                        </Link>
                        </Button>
                        <Button onClick={() => handleDelete(lecture.title)} variant="destructive" size="sm">
                            حذف
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
}
