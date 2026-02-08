
"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import type { Program, Lecture } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc, runTransaction, increment, writeBatch, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Podcast, Wand2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { ProgramForm } from "@/components/admin/program-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPlaceholderImage } from "@/lib/images";
import { getInitials } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";

export default function AdminProgramsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const youtubeUrl = searchParams.get('youtubeUrl');

    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
    const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(!!youtubeUrl);
    const [syncingProgramId, setSyncingProgramId] = useState<string | null>(null);

    const { data: allPrograms, isLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });

    const handleSyncProgramData = async (program: Program) => {
        if (!program.youtubeUrl || !firestore) {
            toast({
                variant: "destructive",
                title: "لا يوجد رابط يوتيوب",
                description: `لا يمكن تحديث بيانات البرنامج "${program.name}".`,
            });
            return;
        }

        setSyncingProgramId(program.id);
        toast({ title: `بدء مزامنة بيانات "${program.name}"...` });

        try {
            // 1. Fetch channel info to update program data
            const programInfoResponse = await fetch(`${window.location.origin}/api/youtube-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: program.youtubeUrl, fetchChannelInfo: true }),
            });

            if (programInfoResponse.ok) {
                const programData = await programInfoResponse.json();
                if (programData.channelInfo) {
                    const programRef = doc(firestore, 'programs', program.id);
                    await updateDoc(programRef, {
                        name: programData.channelInfo.name,
                        bio: programData.channelInfo.description,
                        imageUrl: programData.channelInfo.imageUrl,
                    });
                }
            } else {
                 console.warn(`Could not update program info for ${program.name}`);
            }

            // 2. Fetch all videos from the channel
            const videosResponse = await fetch(`${window.location.origin}/api/youtube-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: program.youtubeUrl }),
            });

            if (!videosResponse.ok) {
                const error = await videosResponse.json();
                throw new Error(error.message || "فشل في جلب فيديوهات القناة.");
            }

            const data = await videosResponse.json();
            const fetchedVideos: any[] = data.videos || [];

            // 3. Compare with existing lectures
            const q = query(collection(firestore, 'lectures'), where("programId", "==", program.id));
            const lecturesSnapshot = await getDocs(q);
            const existingYoutubeUrls = new Set(lecturesSnapshot.docs.map(doc => doc.data().youtubeUrl));

            const newVideos = fetchedVideos.filter(v => !existingYoutubeUrls.has(`https://www.youtube.com/watch?v=${v.videoId}`));

            if (newVideos.length > 0) {
                 toast({
                    title: `تم العثور على ${newVideos.length} محاضرة جديدة`,
                    description: 'يمكنك استيرادها الآن.',
                    duration: 10000,
                    action: <ToastAction altText="اذهب للاستيراد" asChild><Link href={`/admin/lectures/import?youtubeUrl=${encodeURIComponent(program.youtubeUrl!)}`}>اذهب للاستيراد</Link></ToastAction>,
                });
            } else {
                 toast({
                    title: 'البرنامج محدّث',
                    description: 'لا توجد محاضرات جديدة لاستيرادها.',
                });
            }

        } catch (error: any) {
            console.error("Error syncing program data:", error);
            toast({
                variant: "destructive",
                title: "فشلت المزامنة",
                description: error.message || "حدث خطأ غير متوقع.",
            });
        } finally {
            setSyncingProgramId(null);
        }
    };

    const handleDelete = async () => {
        if (!programToDelete || !firestore) return;
        
        const programRef = doc(firestore, 'programs', programToDelete.id);
        const statsRef = doc(firestore, 'stats', 'global');
        const seriesRef = collection(firestore, 'series');
        const lecturesRef = collection(firestore, 'lectures');

        const seriesQuery = query(seriesRef, where("programId", "==", programToDelete.id));
        const lecturesQuery = query(lecturesRef, where("programId", "==", programToDelete.id));
        
        try {
            const [seriesSnapshot, lecturesSnapshot] = await Promise.all([
                getDocs(seriesQuery),
                getDocs(lecturesQuery),
            ]);

            const seriesToDeleteCount = seriesSnapshot.size;
            const lecturesToDeleteCount = lecturesSnapshot.size;
            
            const batch = writeBatch(firestore);

            seriesSnapshot.forEach(doc => batch.delete(doc.ref));
            lecturesSnapshot.forEach(doc => batch.delete(doc.ref));
            batch.delete(programRef);

            batch.set(statsRef, { 
                programs: increment(-1),
                series: increment(-seriesToDeleteCount),
                lectures: increment(-lecturesToDeleteCount),
            }, { merge: true });
            
            await batch.commit();

            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف البرنامج "${programToDelete.name}" وجميع سلاسله ومحاضراته.`,
            });
        
        } catch (error) {
            console.error("Error deleting program and related content:", error);
            toast({
                variant: "destructive",
                title: "فشل الحذف",
                description: "لم نتمكن من حذف البرنامج والمحتوى المرتبط به.",
            });
        } finally {
            setProgramToDelete(null);
        }
    };
    
    const handleNew = () => {
      setProgramToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (program: Program) => {
        setProgramToEdit(program);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setProgramToEdit(null);
      // Remove the query param from URL if it exists
      router.replace('/admin/programs', { scroll: false });
    }

    if (isFormOpen) {
      return <ProgramForm program={programToEdit} onFormClose={handleFormClose} initialYoutubeUrl={youtubeUrl || undefined} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><Podcast/>إدارة البرامج</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف البرامج في الموقع.
            </CardDescription>
            </div>
            <Button onClick={handleNew} disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة برنامج جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>البرنامج</TableHead>
                <TableHead className="hidden md:table-cell">النبذة التعريفية</TableHead>
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
                ) : allPrograms?.map((program) => {
                    const placeholder = getPlaceholderImage(program.imageId);
                    const imageUrl = program.imageUrl || placeholder?.imageUrl;
                    return (
                        <TableRow key={program.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={imageUrl} alt={program.name} />
                                        <AvatarFallback>{getInitials(program.name)}</AvatarFallback>
                                    </Avatar>
                                    <span>{program.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-sm truncate text-muted-foreground">{program.bio}</TableCell>
                            <TableCell className="text-left">
                            <div className="flex gap-2 justify-end">
                                <Button onClick={() => handleSyncProgramData(program)} variant="outline" size="sm" disabled={syncingProgramId === program.id}>
                                    {syncingProgramId === program.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                                </Button>
                                <Button onClick={() => handleEdit(program)} variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => setProgramToDelete(program)} variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
            {!isLoading && !allPrograms?.length && (
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي برامج بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!programToDelete}
          onClose={() => setProgramToDelete(null)}
          onConfirm={handleDelete}
          title="حذف البرنامج"
          description={`هل أنت متأكد من رغبتك في حذف البرنامج "${programToDelete?.name}"؟ سيتم حذف جميع المحاضرات والسلاسل المرتبطة به بشكل دائم.`}
        />
      </>
    );
}

    