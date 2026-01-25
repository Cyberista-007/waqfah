
"use client";

import { useState, useMemo } from "react";
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
import type { Lecture, Series } from "@/lib/types";
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, runTransaction, increment, writeBatch, getDocs, collection } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminLecturesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
    const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
    const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false);

    const { data: allLectures, isLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'] });
    const { data: allSeries } = useCollection<Series>('series');

    const isAllSelected = allLectures ? selectedLectures.length === allLectures.length : false;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLectures(allLectures?.map(l => l.id) || []);
        } else {
            setSelectedLectures([]);
        }
    };
    
    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedLectures(prev => [...prev, id]);
        } else {
            setSelectedLectures(prev => prev.filter(lectureId => lectureId !== id));
        }
    }

    const handleDelete = async () => {
        if (!lectureToDelete || !firestore) return;

        const lectureRef = doc(firestore, 'lectures', lectureToDelete.id);
        
        try {
            await runTransaction(firestore, async (transaction) => {
                // Decrement series lectureCount if it exists
                if (lectureToDelete.seriesId) {
                    const seriesRef = doc(firestore, 'series', lectureToDelete.seriesId);
                    const seriesDoc = await transaction.get(seriesRef);
                    if (seriesDoc.exists() && (seriesDoc.data().lectureCount || 0) > 0) {
                        transaction.update(seriesRef, { lectureCount: increment(-1) });
                    }
                }
                
                // Decrement global lecture count
                const statsRef = doc(firestore, 'stats', 'global');
                transaction.set(statsRef, { lectures: increment(-1) }, { merge: true });

                // Delete the lecture
                transaction.delete(lectureRef);
            });

            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف محاضرة "${lectureToDelete.title}".`,
            });
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: lectureRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                 console.error("Error deleting lecture:", error);
                 toast({
                    variant: "destructive",
                    title: "فشل الحذف",
                    description: "لم نتمكن من حذف المحاضرة. قد يكون السبب مشكلة في الشبكة أو خطأ آخر.",
                });
            }
        } finally {
            setLectureToDelete(null);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedLectures.length === 0 || !firestore || !allLectures) return;
        
        const batch = writeBatch(firestore);
        const lecturesToDelete = allLectures.filter(l => selectedLectures.includes(l.id));
        const seriesUpdateCounts: Record<string, number> = {};

        lecturesToDelete.forEach(lecture => {
            const lectureRef = doc(firestore, 'lectures', lecture.id);
            batch.delete(lectureRef);

            if (lecture.seriesId) {
                if (!seriesUpdateCounts[lecture.seriesId]) {
                    seriesUpdateCounts[lecture.seriesId] = 0;
                }
                seriesUpdateCounts[lecture.seriesId]--;
            }
        });

        // Decrement counts for each affected series
        for (const seriesId in seriesUpdateCounts) {
            const seriesRef = doc(firestore, 'series', seriesId);
            batch.update(seriesRef, { lectureCount: increment(seriesUpdateCounts[seriesId]) });
        }
        
        // Decrement global lecture count
        const statsRef = doc(firestore, 'stats', 'global');
        batch.set(statsRef, { lectures: increment(-lecturesToDelete.length) }, { merge: true });

        try {
            await batch.commit();
            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف ${lecturesToDelete.length} محاضرة بنجاح.`,
            });
            setSelectedLectures([]);
        } catch(error) {
            console.error("Error batch deleting lectures:", error);
            toast({
                variant: "destructive",
                title: "فشل الحذف المجمع",
                description: "لم نتمكن من حذف المحاضرات المحددة.",
            });
        }
    };

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline">إدارة المحاضرات</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف المحاضرات في الموقع.
            </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 {selectedLectures.length > 0 && (
                    <Button variant="destructive" onClick={() => setIsBatchConfirmOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        حذف المحدد ({selectedLectures.length})
                    </Button>
                )}
                <Button asChild>
                <Link href="/admin/lectures/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    إضافة محاضرة جديدة
                </Link>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Select all"
                    />
                </TableHead>
                <TableHead>عنوان المحاضرة</TableHead>
                <TableHead>الشيخ</TableHead>
                <TableHead>السلسلة</TableHead>
                <TableHead className="hidden md:table-cell">تاريخ الإضافة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : allLectures?.map((lecture) => (
                <TableRow key={lecture.id} data-state={selectedLectures.includes(lecture.id) && "selected"}>
                    <TableCell>
                         <Checkbox
                            checked={selectedLectures.includes(lecture.id)}
                            onCheckedChange={(checked) => handleSelectOne(lecture.id, !!checked)}
                            aria-label={`Select lecture ${lecture.title}`}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{lecture.title}</TableCell>
                    <TableCell>{lecture.sheikhName || 'غير محدد'}</TableCell>
                    <TableCell>{lecture.seriesTitle || 'محاضرة مستقلة'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {new Date(lecture.createdAt as any).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell className="text-left">
                    <div className="flex gap-2 justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/lectures/${lecture.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteConfirmationDialog 
                          isOpen={lectureToDelete?.id === lecture.id}
                          onClose={() => setLectureToDelete(null)}
                          onConfirm={handleDelete}
                          title="حذف المحاضرة"
                          description={`هل أنت متأكد من رغبتك في حذف محاضرة "${lectureToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                        >
                            <Button onClick={() => setLectureToDelete(lecture)} variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </DeleteConfirmationDialog>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            {!isLoading && !allLectures?.length && (
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي محاضرات بعد.</p>
            )}
        </CardContent>
        </Card>
        <DeleteConfirmationDialog 
            isOpen={isBatchConfirmOpen}
            onClose={() => setIsBatchConfirmOpen(false)}
            onConfirm={async () => {
                await handleDeleteSelected();
                setIsBatchConfirmOpen(false);
            }}
            title={`حذف ${selectedLectures.length} محاضرة`}
            description={`هل أنت متأكد من رغبتك في حذف المحاضرات المحددة؟ لا يمكن التراجع عن هذا الإجراء.`}
            confirmButtonText="نعم، قم بالحذف"
        />
      </>
    );
}
