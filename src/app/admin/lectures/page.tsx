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
import { doc, runTransaction } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Wand2, Search } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function AdminLecturesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
    const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
    const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false);
    const [isUpdatingAll, setIsUpdatingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: allLectures, isLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'] });
    const { data: allSeries } = useCollection<Series>('series');

    const filteredLectures = useMemo(() => {
        if (!allLectures) return [];
        if (!searchTerm) return allLectures;
        
        return allLectures.filter(lecture =>
            lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lecture.programName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lecture.seriesTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allLectures, searchTerm]);
    
    const isAllSelected = filteredLectures.length > 0 ? selectedLectures.length === filteredLectures.length : false;
    
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLectures(filteredLectures.map(l => l.id) || []);
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
                const statsRef = doc(firestore, 'stats', 'global');
                const statsDoc = await transaction.get(statsRef);
                const newLecturesCount = Math.max(0, (statsDoc.data()?.lectures || 0) - 1);
                transaction.set(statsRef, { lectures: newLecturesCount }, { merge: true });

                // Decrement series lectureCount if it exists
                if (lectureToDelete.seriesId) {
                    const seriesRef = doc(firestore, 'series', lectureToDelete.seriesId);
                    const seriesDoc = await transaction.get(seriesRef);
                    if (seriesDoc.exists()) {
                        const newSeriesLecturesCount = Math.max(0, (seriesDoc.data().lectureCount || 0) - 1);
                        transaction.update(seriesRef, { lectureCount: newSeriesLecturesCount });
                    }
                }
                
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
        
        try {
            await runTransaction(firestore, async (transaction) => {
                const lecturesToDelete = allLectures.filter(l => selectedLectures.includes(l.id));
                const seriesUpdateCounts: Record<string, number> = {};
                
                lecturesToDelete.forEach(lecture => {
                    if (lecture.seriesId) {
                        if (!seriesUpdateCounts[lecture.seriesId]) {
                            seriesUpdateCounts[lecture.seriesId] = 0;
                        }
                        seriesUpdateCounts[lecture.seriesId]++; // count how many to remove from each series
                    }
                });

                // Update series counts
                for (const seriesId in seriesUpdateCounts) {
                    const seriesRef = doc(firestore, 'series', seriesId);
                    const seriesDoc = await transaction.get(seriesRef);
                    if (seriesDoc.exists()) {
                        const currentCount = seriesDoc.data().lectureCount || 0;
                        const newCount = Math.max(0, currentCount - seriesUpdateCounts[seriesId]);
                        transaction.update(seriesRef, { lectureCount: newCount });
                    }
                }
                
                // Update global lecture count
                const statsRef = doc(firestore, 'stats', 'global');
                const statsDoc = await transaction.get(statsRef);
                const currentLectures = statsDoc.data()?.lectures || 0;
                const newLecturesCount = Math.max(0, currentLectures - lecturesToDelete.length);
                transaction.set(statsRef, { lectures: newLecturesCount }, { merge: true });

                // Delete all selected lectures
                lecturesToDelete.forEach(lecture => {
                    const lectureRef = doc(firestore, 'lectures', lecture.id);
                    transaction.delete(lectureRef);
                });
            });

            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف ${selectedLectures.length} محاضرة بنجاح.`,
            });
            setSelectedLectures([]);
        } catch(error) {
            console.error("Error batch deleting lectures:", error);
            toast({
                variant: "destructive",
                title: "فشل الحذف المجمع",
                description: "لم نتمكن من حذف المحاضرات المحددة.",
            });
        } finally {
             setIsBatchConfirmOpen(false);
        }
    };

    const handleUpdateAllMetadata = async () => {
        if (!firestore || !allLectures) return;
        
        const lecturesToUpdate = allLectures.filter(l => l.youtubeUrl);

        if (lecturesToUpdate.length === 0) {
            toast({
                title: "لا يوجد ما يمكن تحديثه",
                description: "لم يتم العثور على محاضرات مرتبطة بيوتيوب لتحديث بياناتها.",
            });
            return;
        }

        setIsUpdatingAll(true);
        toast({
            title: "بدء تحديث البيانات...",
            description: `جاري تحديث بيانات ${lecturesToUpdate.length} محاضرة. قد تستغرق هذه العملية بعض الوقت.`,
        });

        // Use a transaction for the updates
        try {
            await runTransaction(firestore, async (transaction) => {
                const updatePromises = lecturesToUpdate.map(async (lecture) => {
                    if (!lecture.youtubeUrl) return;
                    try {
                        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: lecture.youtubeUrl, fetchVideoInfo: true }),
                        });
                        
                        const data = await response.json();

                        if (response.ok && data.videoInfo) {
                            const lectureRef = doc(firestore, 'lectures', lecture.id);
                            const updateData: Partial<Lecture> = {
                                youtubeViewCount: data.videoInfo.viewCount || lecture.youtubeViewCount || 0,
                                title: data.videoInfo.title || lecture.title,
                                description: data.videoInfo.description || lecture.description,
                                duration: data.videoInfo.durationInSeconds || lecture.duration,
                            };
                            transaction.update(lectureRef, updateData);
                        } else {
                           console.warn(`Could not update metadata for ${lecture.title}: ${data.message}`);
                        }
                    } catch (error) {
                        console.error(`Failed to fetch metadata for ${lecture.title}:`, error);
                    }
                });

                await Promise.all(updatePromises);
            });

            toast({
                title: "اكتمل التحديث!",
                description: `تم محاولة تحديث بيانات ${lecturesToUpdate.length} محاضرة.`,
            });
        } catch(e) {
             console.error("Error in transaction for updating all metadata:", e);
             toast({
                variant: "destructive",
                title: "فشل حفظ التحديثات",
                description: "حدث خطأ أثناء حفظ البيانات المحدثة.",
            });
        }


        setIsUpdatingAll(false);
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
                <Button variant="outline" onClick={handleUpdateAllMetadata} disabled={isUpdatingAll || isLoading}>
                    {isUpdatingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    تحديث كل البيانات
                </Button>
                <Button asChild>
                <Link href="/admin/lectures/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    إضافة محاضرة جديدة
                </Link>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="mb-4 max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث بالاسم، السلسلة، أو البرنامج..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-10"
                    />
                </div>
            </div>
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
                <TableHead className="hidden md:table-cell">البرنامج</TableHead>
                <TableHead className="hidden md:table-cell">السلسلة</TableHead>
                <TableHead>الاقتراحات</TableHead>
                <TableHead className="hidden md:table-cell">تاريخ الإضافة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredLectures.map((lecture) => (
                <TableRow key={lecture.id} data-state={selectedLectures.includes(lecture.id) && "selected"}>
                    <TableCell>
                         <Checkbox
                            checked={selectedLectures.includes(lecture.id)}
                            onCheckedChange={(checked) => handleSelectOne(lecture.id, !!checked)}
                            aria-label={`Select lecture ${lecture.title}`}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{lecture.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{lecture.programName || 'غير محدد'}</TableCell>
                    <TableCell className="hidden md:table-cell">{lecture.seriesTitle || 'محاضرة مستقلة'}</TableCell>
                    <TableCell>{lecture.suggestionCount || 0}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {(lecture.createdAt as any)?.toDate?.().toLocaleDateString('ar-EG') || 'غير محدد'}
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
            {!isLoading && filteredLectures.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                {allLectures && allLectures.length > 0 ? "لا توجد محاضرات تطابق بحثك." : "لم تتم إضافة أي محاضرات بعد."}
              </p>
            )}
        </CardContent>
        </Card>
        <DeleteConfirmationDialog 
            isOpen={isBatchConfirmOpen}
            onClose={() => setIsBatchConfirmOpen(false)}
            onConfirm={handleDeleteSelected}
            title={`حذف ${selectedLectures.length} محاضرة`}
            description={`هل أنت متأكد من رغبتك في حذف المحاضرات المحددة؟ لا يمكن التراجع عن هذا الإجراء.`}
            confirmButtonText="نعم، قم بالحذف"
        />
      </>
    );
}
