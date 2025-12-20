
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
import type { Sheikh } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc, runTransaction, increment, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, MicVocal } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { SheikhForm } from "@/components/admin/sheikh-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPlaceholderImage } from "@/lib/images";
import { getInitials } from "@/lib/utils";

export default function AdminSheikhsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [sheikhToDelete, setSheikhToDelete] = useState<Sheikh | null>(null);
    const [sheikhToEdit, setSheikhToEdit] = useState<Sheikh | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allSheikhs, isLoading } = useCollection<Sheikh>('sheikhs', { orderBy: ['name', 'asc'] });

    const handleDelete = async () => {
        if (!sheikhToDelete || !firestore) return;
        
        const sheikhRef = doc(firestore, 'sheikhs', sheikhToDelete.id);
        const statsRef = doc(firestore, 'stats', 'global');
        const seriesRef = collection(firestore, 'series');
        const lecturesRef = collection(firestore, 'lectures');

        const seriesQuery = query(seriesRef, where("sheikhId", "==", sheikhToDelete.id));
        const lecturesQuery = query(lecturesRef, where("sheikhId", "==", sheikhToDelete.id));
        
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
            batch.delete(sheikhRef);

            batch.set(statsRef, { 
                sheikhs: increment(-1),
                series: increment(-seriesToDeleteCount),
                lectures: increment(-lecturesToDeleteCount),
            }, { merge: true });
            
            await batch.commit();

            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف الشيخ "${sheikhToDelete.name}" وجميع سلاسله ومحاضراته.`,
            });
        
        } catch (error) {
            console.error("Error deleting sheikh and related content:", error);
            toast({
                variant: "destructive",
                title: "فشل الحذف",
                description: "لم نتمكن من حذف الشيخ والمحتوى المرتبط به.",
            });
        } finally {
            setSheikhToDelete(null);
        }
    };
    
    const handleNew = () => {
      setSheikhToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (sheikh: Sheikh) => {
        setSheikhToEdit(sheikh);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setSheikhToEdit(null);
    }

    if (isFormOpen) {
      return <SheikhForm sheikh={sheikhToEdit} onFormClose={handleFormClose} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><MicVocal/>إدارة المشايخ</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف المشايخ في الموقع.
            </CardDescription>
            </div>
            <Button onClick={handleNew} disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة شيخ جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>الشيخ</TableHead>
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
                ) : allSheikhs?.map((sheikh) => {
                    const placeholder = getPlaceholderImage(sheikh.imageId);
                    return (
                        <TableRow key={sheikh.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={placeholder?.imageUrl} alt={sheikh.name} />
                                        <AvatarFallback>{getInitials(sheikh.name)}</AvatarFallback>
                                    </Avatar>
                                    <span>{sheikh.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-sm truncate text-muted-foreground">{sheikh.bio}</TableCell>
                            <TableCell className="text-left">
                            <div className="flex gap-2 justify-end">
                                <Button onClick={() => handleEdit(sheikh)} variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => setSheikhToDelete(sheikh)} variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
            {!isLoading && !allSheikhs?.length && (
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي مشايخ بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!sheikhToDelete}
          onClose={() => setSheikhToDelete(null)}
          onConfirm={handleDelete}
          title="حذف الشيخ"
          description={`هل أنت متأكد من رغبتك في حذف الشيخ "${sheikhToDelete?.name}"؟ سيتم حذف جميع المحاضرات والسلاسل المرتبطة به بشكل دائم.`}
        />
      </>
    );
}
