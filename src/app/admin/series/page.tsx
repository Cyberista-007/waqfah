
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
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";

export default function AdminSeriesPage() {
  const firestore = useFirestore();
  const seriesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'series'), orderBy('title')) : null),
    [firestore]
  );
  const { data: allSeries, isLoading } = useCollection<Series>(seriesQuery);

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
          <Link href="/admin/series/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            إضافة سلسلة جديدة
          </Link>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ): allSeries?.map((series) => (
              <TableRow key={series.id}>
                <TableCell className="font-medium">{series.title}</TableCell>
                <TableCell>{series.lectureCount || 0}</TableCell>
                <TableCell className="text-left">
                  <div className="flex gap-2 justify-end">
                    <Button asChild variant="outline" size="sm">
                      {/* Ensure the link uses the document ID for editing */}
                      <Link href={`/admin/series/${series.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="destructive" size="sm">
                       {/* Ensure the link uses the document ID for deleting */}
                      <Link href={`/admin/series/${series.id}/delete`}>
                        <Trash2 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && !allSeries?.length && (
          <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي سلاسل بعد.</p>
        )}
      </CardContent>
    </Card>
  );
}
