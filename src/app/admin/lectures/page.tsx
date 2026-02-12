

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import type { Lecture, Program, Series } from "@/lib/types";
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, runTransaction, increment, writeBatch, Timestamp } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Wand2, Search, Clapperboard, Video, ChevronDown } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function AdminLecturesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false);
    const [isUpdatingAll, setIsUpdatingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("lectures");
    const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);

    const [isBatchEditOpen, setIsBatchEditOpen] = useState(false);
    const [batchSeriesId, setBatchSeriesId] = useState("");
    const [batchProgramId, setBatchProgramId] = useState("");
    const [isBatchUpdating, setIsBatchUpdating] = useState(false);
    const [isUpdatingProgram, setIsUpdatingProgram] = useState<Record<string, boolean>>({});


    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'] });
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });
    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });
    
    const isLoading = lecturesLoading || seriesLoading || programsLoading;

    useEffect(() => {
        if (batchSeriesId && batchSeriesId !== 'none' && allSeries) {
            const series = allSeries.find(s => s.id === batchSeriesId);
            if (series?.programId) {
                setBatchProgramId(series.programId);
            }
        }
    }, [batchSeriesId, allSeries]);


    const { regularLectures, shorts } = useMemo(() => {
        if (!allLectures) return { regularLectures: [], shorts: [] };
        const regular: Lecture[] = [];
        const shortForm: Lecture[] = [];
        allLectures.forEach(l => {
            // Using <= 180 seconds (3 minutes) as the threshold for a short
            if (l.duration <= 180) {
                shortForm.push(l);
            } else {
                regular.push(l);
            }
        });
        return { regularLectures: regular, shorts: shortForm };
    }, [allLectures]);


    const itemsToDisplay = useMemo(() => {
        return activeTab === 'lectures' ? regularLectures : shorts;
    }, [activeTab, regularLectures, shorts]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return itemsToDisplay;
        return itemsToDisplay.filter(lecture =>
            lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lecture.programName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lecture.seriesTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [itemsToDisplay, searchTerm]);
    
    const groupedItems = useMemo(() => {
        const groups: Record<string, Lecture[]> = {};
        filteredItems.forEach(lecture => {
            const groupName = lecture.programName || 'محاضرات مستقلة';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(lecture);
        });
        // Set all as open by default when search term or tab changes
        if (!isLoading) {
            setOpenCollapsibles(Object.keys(groups));
        }
        return groups;
    }, [filteredItems, isLoading]);
    
    useEffect(() => {
        setSelectedItems([]);
    }, [activeTab]);

    const isAllSelected = filteredItems.length > 0 && selectedItems.length === filteredItems.length;
    
    const handleSelectAll = (checked: boolean) => {
        setSelectedItems(checked ? filteredItems.map(l => l.id) : []);
    };
    
    const handleSelectOne = (id: string, checked: boolean) => {
        setSelectedItems(prev => checked ? [...prev, id] : prev.filter(lectureId => lectureId !== id));
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

                if (lectureToDelete.seriesId) {
                    const seriesRef = doc(firestore, 'series', lectureToDelete.seriesId);
                    const seriesDoc = await transaction.get(seriesRef);
                    if (seriesDoc.exists()) {
                        const newSeriesLecturesCount = Math.max(0, (seriesDoc.data().lectureCount || 0) - 1);
                        transaction.update(seriesRef, { lectureCount: newSeriesLecturesCount });
                    }
                }
                
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
        if (selectedItems.length === 0 || !firestore || !allLectures) return;
        
        try {
            await runTransaction(firestore, async (transaction) => {
                const lecturesToDelete = allLectures.filter(l => selectedItems.includes(l.id));
                const seriesUpdateCounts: Record<string, number> = {};
                
                lecturesToDelete.forEach(lecture => {
                    if (lecture.seriesId) {
                        if (!seriesUpdateCounts[lecture.seriesId]) {
                            seriesUpdateCounts[lecture.seriesId] = 0;
                        }
                        seriesUpdateCounts[lecture.seriesId]--;
                    }
                });

                for (const seriesId in seriesUpdateCounts) {
                    const seriesRef = doc(firestore, 'series', seriesId);
                    transaction.update(seriesRef, { lectureCount: increment(seriesUpdateCounts[seriesId]) });
                }
                
                const statsRef = doc(firestore, 'stats', 'global');
                transaction.set(statsRef, { lectures: increment(-lecturesToDelete.length) }, { merge: true });

                lecturesToDelete.forEach(lecture => {
                    const lectureRef = doc(firestore, 'lectures', lecture.id);
                    transaction.delete(lectureRef);
                });
            });

            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف ${selectedItems.length} عنصر بنجاح.`,
            });
            setSelectedItems([]);
        } catch(error) {
            console.error("Error batch deleting lectures:", error);
            toast({
                variant: "destructive",
                title: "فشل الحذف المجمع",
                description: "لم نتمكن من حذف العناصر المحددة.",
            });
        } finally {
             setIsBatchConfirmOpen(false);
        }
    };
    
    const handleBatchUpdate = async () => {
        if (!firestore || selectedItems.length === 0) return;
        
        const seriesId = batchSeriesId; // Can be '', 'none', or an ID
        const programId = batchProgramId;

        if (!seriesId && !programId) {
            toast({ variant: 'destructive', title: 'لم يتم تحديد أي تغيير' });
            return;
        }

        setIsBatchUpdating(true);

        try {
            await runTransaction(firestore, async (transaction) => {
                const lecturesToUpdateRefs = selectedItems.map(id => doc(firestore, 'lectures', id));
                const lectureSnapshots = await Promise.all(lecturesToUpdateRefs.map(ref => transaction.get(ref)));

                const newSeries = seriesId && seriesId !== 'none' ? allSeries?.find(s => s.id === seriesId) : null;
                let newProgram = programId && programId !== 'none' ? allPrograms?.find(p => p.id === programId) : null;
                
                if (newSeries) {
                    newProgram = allPrograms?.find(p => p.id === newSeries.programId) || null;
                }

                const seriesCountChanges: Record<string, number> = {};

                for (const lectureSnap of lectureSnapshots) {
                    if (!lectureSnap.exists()) continue;
                    
                    const lectureData = lectureSnap.data() as Lecture;
                    const updatePayload: any = {};

                    const oldSeriesId = lectureData.seriesId;
                    
                    if (seriesId) {
                        const newSeriesId = newSeries ? newSeries.id : '';
                        if (oldSeriesId !== newSeriesId) {
                            updatePayload.seriesId = newSeriesId;
                            updatePayload.seriesTitle = newSeries ? newSeries.title : '';
                            updatePayload.seriesSlug = newSeries ? newSeries.slug : '';

                            if (oldSeriesId) seriesCountChanges[oldSeriesId] = (seriesCountChanges[oldSeriesId] || 0) - 1;
                            if (newSeriesId) seriesCountChanges[newSeriesId] = (seriesCountChanges[newSeriesId] || 0) + 1;
                        }
                    }
                    
                    const newProgramId = newProgram ? newProgram.id : '';
                    if (seriesId || programId) {
                        if (newSeries) {
                             updatePayload.programId = newProgram ? newProgram.id : '';
                             updatePayload.programName = newProgram ? newProgram.name : '';
                             updatePayload.programSlug = newProgram ? newProgram.slug : '';
                        } else if (programId) {
                             updatePayload.programId = newProgramId;
                             updatePayload.programName = newProgram ? newProgram.name : '';
                             updatePayload.programSlug = newProgram ? newProgram.slug : '';
                        }
                    }

                    if (Object.keys(updatePayload).length > 0) {
                        transaction.update(lectureSnap.ref, updatePayload);
                    }
                }
                
                for (const sId in seriesCountChanges) {
                    const change = seriesCountChanges[sId];
                    if (change !== 0) {
                        const seriesRef = doc(firestore, 'series', sId);
                        transaction.update(seriesRef, { lectureCount: increment(change) });
                    }
                }
            });

            toast({ title: "تم التحديث بنجاح", description: `تم تحديث ${selectedItems.length} محاضرة.` });
            
        } catch (error) {
            console.error("Batch update transaction failed:", error);
            toast({ variant: 'destructive', title: "فشل التحديث الجماعي" });
        } finally {
            setIsBatchUpdating(false);
            setIsBatchEditOpen(false);
            setSelectedItems([]);
            setBatchSeriesId('');
            setBatchProgramId('');
        }
    };


    const handleUpdateAllMetadata = async () => {
        if (!firestore || !allLectures) return;

        const lecturesToUpdate = allLectures.filter(l => l.youtubeUrl);
        if (lecturesToUpdate.length === 0) {
            toast({ title: "لا يوجد ما يمكن تحديثه", description: "لم يتم العثور على محاضرات مرتبطة بيوتيوب." });
            return;
        }

        setIsUpdatingAll(true);
        toast({ title: "بدء تحديث البيانات...", description: `جاري تحديث ${lecturesToUpdate.length} محاضرة. قد تستغرق هذه العملية بعض الوقت.` });

        const CHUNK_SIZE = 10;
        const allUpdateData = new Map<string, Partial<Lecture>>();
        let updatedCount = 0;

        try {
            for (let i = 0; i < lecturesToUpdate.length; i += CHUNK_SIZE) {
                const chunk = lecturesToUpdate.slice(i, i + CHUNK_SIZE);
                const promises = chunk.map(async (lecture) => {
                    if (!lecture.youtubeUrl) return null;
                    try {
                        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: lecture.youtubeUrl, fetchVideoInfo: true }),
                        });
                        const data = await response.json();
                        if (response.ok && data.videoInfo) {
                            const updateData: Partial<Lecture> = {
                                youtubeViewCount: data.videoInfo.viewCount || lecture.youtubeViewCount || 0,
                                title: data.videoInfo.title || lecture.title,
                                description: data.videoInfo.description || lecture.description,
                                duration: data.videoInfo.durationInSeconds || lecture.duration,
                            };
                            if (data.videoInfo.publishedAt) {
                                updateData.publishedAt = Timestamp.fromDate(new Date(data.videoInfo.publishedAt));
                            }
                            return { id: lecture.id, data: updateData };
                        } else {
                            console.warn(`Could not update metadata for ${lecture.title}: ${data.message}`);
                            return null;
                        }
                    } catch (error) {
                        console.error(`Failed to fetch metadata for ${lecture.title}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                results.forEach(result => {
                    if (result) {
                        allUpdateData.set(result.id, result.data);
                    }
                });
            }

            if (allUpdateData.size > 0) {
                updatedCount = allUpdateData.size;
                const batch = writeBatch(firestore);
                allUpdateData.forEach((data, id) => {
                    const lectureRef = doc(firestore, 'lectures', id);
                    batch.update(lectureRef, data);
                });
                await batch.commit();
            }

            toast({
                title: "اكتمل التحديث!",
                description: `تم محاولة تحديث ${lecturesToUpdate.length} محاضرة. تم تحديث ${updatedCount} منها بنجاح.`,
            });
        } catch (e) {
            console.error("Error in transaction for updating all metadata:", e);
            toast({
                variant: "destructive",
                title: "فشل حفظ التحديثات",
                description: "حدث خطأ أثناء حفظ البيانات المحدثة.",
            });
        }

        setIsUpdatingAll(false);
    };

    const handleUpdateProgramMetadata = async (lecturesToUpdate: Lecture[]) => {
        if (!firestore) return;

        const programName = lecturesToUpdate[0]?.programName || 'unknown';
        
        const lecturesWithYoutubeUrl = lecturesToUpdate.filter(l => l.youtubeUrl);
        if (lecturesWithYoutubeUrl.length === 0) {
            toast({ title: "لا يوجد ما يمكن تحديثه", description: "لم يتم العثور على محاضرات مرتبطة بيوتيوب في هذا البرنامج." });
            return;
        }

        setIsUpdatingProgram(prev => ({...prev, [programName]: true}));
        toast({ title: `بدء تحديث بيانات برنامج "${programName}"...`, description: `جاري تحديث ${lecturesWithYoutubeUrl.length} محاضرة.` });

        const CHUNK_SIZE = 10;
        const allUpdateData = new Map<string, Partial<Lecture>>();
        let updatedCount = 0;

        try {
            for (let i = 0; i < lecturesWithYoutubeUrl.length; i += CHUNK_SIZE) {
                const chunk = lecturesWithYoutubeUrl.slice(i, i + CHUNK_SIZE);
                const promises = chunk.map(async (lecture) => {
                    if (!lecture.youtubeUrl) return null;
                    try {
                        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: lecture.youtubeUrl, fetchVideoInfo: true }),
                        });
                        const data = await response.json();
                        if (response.ok && data.videoInfo) {
                            const updateData: Partial<Lecture> = {
                                youtubeViewCount: data.videoInfo.viewCount || lecture.youtubeViewCount || 0,
                                title: data.videoInfo.title || lecture.title,
                                description: data.videoInfo.description || lecture.description,
                                duration: data.videoInfo.durationInSeconds || lecture.duration,
                            };
                            if (data.videoInfo.publishedAt) {
                                updateData.publishedAt = Timestamp.fromDate(new Date(data.videoInfo.publishedAt));
                            }
                            return { id: lecture.id, data: updateData };
                        } else {
                            console.warn(`Could not update metadata for ${lecture.title}: ${data.message}`);
                            return null;
                        }
                    } catch (error) {
                        console.error(`Failed to fetch metadata for ${lecture.title}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                results.forEach(result => {
                    if (result) {
                        allUpdateData.set(result.id, result.data);
                    }
                });
            }

            if (allUpdateData.size > 0) {
                updatedCount = allUpdateData.size;
                const batch = writeBatch(firestore);
                allUpdateData.forEach((data, id) => {
                    const lectureRef = doc(firestore, 'lectures', id);
                    batch.update(lectureRef, data);
                });
                await batch.commit();
            }

            toast({
                title: "اكتمل التحديث!",
                description: `تم محاولة تحديث ${lecturesWithYoutubeUrl.length} محاضرة في برنامج "${programName}". تم تحديث ${updatedCount} منها بنجاح.`,
            });
        } catch (e) {
            console.error(`Error in transaction for updating program ${programName} metadata:`, e);
            toast({
                variant: "destructive",
                title: "فشل حفظ التحديثات",
                description: "حدث خطأ أثناء حفظ البيانات المحدثة.",
            });
        }

        setIsUpdatingProgram(prev => ({...prev, [programName]: false}));
    };

    const toggleCollapsible = (programName: string) => {
        setOpenCollapsibles(prev => 
            prev.includes(programName) 
                ? prev.filter(name => name !== programName)
                : [...prev, programName]
        );
    };

    const renderGroupedTable = (groupedData: Record<string, Lecture[]>) => {
        if (isLoading) {
            return <div className="text-center py-8"><Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /></div>;
        }
        if (Object.keys(groupedData).length === 0) {
            return <p className="py-8 text-center text-muted-foreground">
                {searchTerm ? "لا توجد عناصر تطابق بحثك." : "لم يتم إضافة أي عناصر بعد."}
            </p>;
        }
        return (
            <div className="space-y-4 pt-4">
                {Object.entries(groupedData).map(([programName, lectures]) => (
                    <Collapsible
                        key={programName}
                        open={openCollapsibles.includes(programName)}
                        onOpenChange={() => toggleCollapsible(programName)}
                        className="border rounded-lg bg-card"
                    >
                         <div className="flex justify-between items-center w-full p-4 bg-muted/30 rounded-t-lg">
                            <CollapsibleTrigger className="flex items-center gap-4 font-semibold text-lg text-right flex-grow">
                                <span>{programName} ({lectures.length})</span>
                                <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", openCollapsibles.includes(programName) && "rotate-180")} />
                            </CollapsibleTrigger>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateProgramMetadata(lectures)}
                                disabled={isUpdatingProgram[programName] || isLoading}
                                className="mr-4"
                            >
                                {isUpdatingProgram[programName] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                تحديث هذا البرنامج
                            </Button>
                        </div>
                        <CollapsibleContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>عنوان العنصر</TableHead>
                                        <TableHead className="hidden md:table-cell">السلسلة</TableHead>
                                        <TableHead className="hidden md:table-cell">القناة</TableHead>
                                        <TableHead>الاقتراحات</TableHead>
                                        <TableHead className="hidden md:table-cell">تاريخ الإضافة</TableHead>
                                        <TableHead className="text-left">إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lectures.map(lecture => (
                                        <TableRow key={lecture.id} data-state={selectedItems.includes(lecture.id) && "selected"}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedItems.includes(lecture.id)}
                                                    onCheckedChange={(checked) => handleSelectOne(lecture.id, !!checked)}
                                                    aria-label={`Select lecture ${lecture.title}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{lecture.title}</TableCell>
                                            <TableCell className="hidden md:table-cell">{lecture.seriesTitle || 'محاضرة مستقلة'}</TableCell>
                                            <TableCell className="hidden md:table-cell">{lecture.channelName || 'غير محدد'}</TableCell>
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
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        );
    };

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline">إدارة المحاضرات</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف المحاضرات والمقاطع القصيرة في الموقع.
            </CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="flex justify-between items-center mb-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث بالاسم، السلسلة، أو البرنامج..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                     <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Select all"
                        id="select-all"
                    />
                    <Label htmlFor="select-all">تحديد الكل</Label>
                    {selectedItems.length > 0 && (
                        <>
                            <Button variant="destructive" onClick={() => setIsBatchConfirmOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                حذف المحدد ({selectedItems.length})
                            </Button>
                             <Dialog open={isBatchEditOpen} onOpenChange={setIsBatchEditOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Edit className="mr-2 h-4 w-4" />
                                        تعديل جماعي ({selectedItems.length})
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>تعديل {selectedItems.length} محاضرة</DialogTitle>
                                        <DialogDescription>
                                            قم بتعيين سلسلة أو برنامج جديد للمحاضرات المحددة. سيتم تطبيق التغيير على جميع العناصر المحددة.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label htmlFor="batch-series">تعيين إلى سلسلة</Label>
                                            <Select value={batchSeriesId} onValueChange={setBatchSeriesId}>
                                                <SelectTrigger id="batch-series">
                                                    <SelectValue placeholder="اختر سلسلة..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">إزالة من السلسلة</SelectItem>
                                                    {allSeries?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="batch-program">تعيين إلى برنامج</Label>
                                            <Select value={batchProgramId} onValueChange={setBatchProgramId} disabled={!!batchSeriesId && batchSeriesId !== 'none'}>
                                                <SelectTrigger id="batch-program">
                                                    <SelectValue placeholder="اختر برنامجًا..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">محاضرة مستقلة (بدون برنامج)</SelectItem>
                                                    {allPrograms?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsBatchEditOpen(false)}>إلغاء</Button>
                                        <Button onClick={handleBatchUpdate} disabled={isBatchUpdating}>
                                            {isBatchUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            تطبيق التغييرات
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </div>
             <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lectures"><Clapperboard className="me-2 h-4 w-4"/>المحاضرات ({regularLectures.length})</TabsTrigger>
                    <TabsTrigger value="shorts"><Video className="me-2 h-4 w-4"/>المقاطع القصيرة ({shorts.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="lectures">
                    {renderGroupedTable(groupedItems)}
                </TabsContent>
                <TabsContent value="shorts">
                    {renderGroupedTable(groupedItems)}
                </TabsContent>
            </Tabs>
        </CardContent>
        </Card>
        <DeleteConfirmationDialog 
            isOpen={isBatchConfirmOpen}
            onClose={() => setIsBatchConfirmOpen(false)}
            onConfirm={handleDeleteSelected}
            title={`حذف ${selectedItems.length} عنصر`}
            description={`هل أنت متأكد من رغبتك في حذف العناصر المحددة؟ لا يمكن التراجع عن هذا الإجراء.`}
            confirmButtonText="نعم، قم بالحذف"
        />
      </>
    );
}
