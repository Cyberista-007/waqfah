
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
import type { Series } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function AdminSeriesPage() {
  const firestore = useFirestore();
  const seriesQuery = useMemoFirebase(
    () => query(collection(firestore, 'series'), orderBy('title')),
    [firestore]
  );
  const { data: allSeries, isLoading } = useCollection<Series>(seriesQuery);

  if (isLoading) {
      return <p>جار تحميل السلاسل...</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-2xl font-headline">إدارة السلاسل</CardTitle>
          <CardDescription>
            أضف أو عدّل أو احذف السلاسل العلمية في الموقع.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/series/new">إضافة سلسلة جديدة</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان السلسلة</TableHead>
              <TableHead>عدد المحاضرات</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allSeries?.map((series) => (
              <TableRow key={series.id}>
                <TableCell className="font-medium">{series.title}</TableCell>
                <TableCell>{series.lectureCount}</TableCell>
                <TableCell className="text-left">
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/series/${series.id}/edit`}>
                        تعديل
                      </Link>
                    </Button>
                    <Button asChild variant="destructive" size="sm">
                      <Link href={`/admin/series/${series.id}/delete`}>
                        حذف
                      </Link>
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
