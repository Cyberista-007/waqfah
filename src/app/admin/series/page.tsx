
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
import { useCollection, useFirestore } from "@/firebase";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { useState } from "react";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";


export default function AdminSeriesPage() {
  const { data: allSeries, isLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);

  const handleDeleteAttempt = (series: Series) => {
    if (series.lectureCount && series.lectureCount > 0) {
      toast({
        variant: "destructive",
        title: "لا يمكن حذف السلسلة",
        description: `سلسلة "${series.title}" تحتوي على ${series.lectureCount} محاضرة. يجب حذف المحاضرات أولاً.`,
      });
      return;
    }
    // If lectureCount is 0, show confirmation dialog
    setSeriesToDelete(series);
  };
  
  const handleDeleteConfirm = async () => {
    if (!seriesToDelete || !firestore) return;
    
    const seriesRef = doc(firestore, 'series', seriesToDelete.id);
    deleteDocumentNonBlocking(seriesRef);

    toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف سلسلة "${seriesToDelete.title}".`,
    });
    setSeriesToDelete(null);
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-headline">إدارة السلاسل</CardTitle>
            <CardDescription>
              أضف أو عدّل أو احذف السلاسل العلمية في الموقع.
            </CardDescription>
          </div>
          <Button asChild disabled={isLoading}>
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
                <TableHead>الشيخ</TableHead>
                <TableHead>عدد المحاضرات</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ): allSeries?.map((series) => (
                <TableRow key={series.id}>
                  <TableCell className="font-medium">{series.title}</TableCell>
                  <TableCell>{series.sheikhName}</TableCell>
                  <TableCell>{series.lectureCount || 0}</TableCell>
                  <TableCell className="text-left">
                    <div className="flex gap-2 justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/series/${series.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteAttempt(series)}
                      >
                        <Trash2 className="h-4 w-4" />
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
      <DeleteConfirmationDialog 
          isOpen={!!seriesToDelete}
          onClose={() => setSeriesToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف السلسلة"
          description={`هل أنت متأكد من رغبتك في حذف سلسلة "${seriesToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
    </>
  );
}
