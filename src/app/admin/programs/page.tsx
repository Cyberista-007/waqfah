
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
import type { Program } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc, runTransaction, increment, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Podcast } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { ProgramForm } from "@/components/admin/program-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPlaceholderImage } from "@/lib/images";
import { getInitials } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

export default function AdminProgramsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const youtubeUrl = searchParams.get('youtubeUrl');

    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
    const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(!!youtubeUrl);

    const { data: allPrograms, isLoading } = useCollection<Program>('programs', { orderBy: ['name', 'asc'] });

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
                <TableHead>النبذة التعريفية</TableHead>
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
                            <TableCell className="max-w-sm truncate text-muted-foreground">{program.bio}</TableCell>
                            <TableCell className="text-left">
                            <div className="flex gap-2 justify-end">
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
