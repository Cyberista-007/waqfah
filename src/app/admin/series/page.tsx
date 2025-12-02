
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
import type { Lecture, Series } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { useState } from "react";
import { doc, runTransaction, increment, collection, query, where, getDocs, writeBatch } from "firebase/firestore";

export default function AdminSeriesPage() {
  const { data: allSeries, isLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });
  const { toast } = useToast();
  const firestore = useFirestore();

  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);

  const handleDeleteAttempt = (series: Series) => {
    setSeriesToDelete(series);
  };
  
  const handleDeleteConfirm = async () => {
    if (!seriesToDelete || !firestore) return;
    
    const seriesRef = doc(firestore, 'series', seriesToDelete.id);
    const statsRef = doc(firestore, 'stats', 'global');
    const lecturesRef = collection(firestore, 'lectures');
    const q = query(lecturesRef, where("seriesId", "==", seriesToDelete.id));

    try {
        const lecturesSnapshot = await getDocs(q);
        const lecturesToDeleteCount = lecturesSnapshot.size;

        const batch = writeBatch(firestore);

        // Delete all lectures in the series
        lecturesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete the series itself
        batch.delete(seriesRef);

        // Update stats
        batch.set(statsRef, { 
            series: increment(-1),
            lectures: increment(-lecturesToDeleteCount) 
        }, { merge: true });

        await batch.commit();

        toast({
            title: "تم الحذف بنجاح",
            description: `تم حذف سلسلة "${seriesToDelete.title}" وجميع محاضراتها البالغ عددها ${lecturesToDeleteCount}.`,
        });

    } catch (error) {
         console.error("Error deleting series and its lectures:", error);
         toast({
            variant: "destructive",
            title: "فشل الحذف",
            description: "لم نتمكن من حذف السلسلة والمحاضرات المرتبطة بها.",
        });
    } finally {
        setSeriesToDelete(null);
    }
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
                  <TableCell>{series.sheikhName || 'غير محدد'}</TableCell>
                  <TableCell>{series.lectureCount || 0}</TableCell>
                  <TableCell className="text-left">
                    <div className="flex gap-2 justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/series/${series.slug}/edit`}>
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
          description={`هل أنت متأكد من رغبتك في حذف سلسلة "${seriesToDelete?.title}"؟ سيتم حذف جميع المحاضرات المرتبطة بها بشكل دائم. لا يمكن التراجع عن هذا الإجراء.`}
        />
    </>
  );
}
