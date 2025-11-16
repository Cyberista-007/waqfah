
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
import { getAllSeries } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AdminSeriesPage() {
  const allSeries = getAllSeries();
  const { toast } = useToast();

  const handleDelete = (title: string) => {
    toast({
      title: "تم الحذف (محاكاة)",
      description: `تم حذف سلسلة "${title}". هذه العملية هي محاكاة.`,
      variant: "destructive",
    });
  };

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
            {allSeries.map((series) => (
              <TableRow key={series.slug}>
                <TableCell className="font-medium">{series.title}</TableCell>
                <TableCell>{series.lectureCount}</TableCell>
                <TableCell className="text-left">
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/series/${series.slug}/edit`}>
                        تعديل
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(series.title)}
                    >
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
