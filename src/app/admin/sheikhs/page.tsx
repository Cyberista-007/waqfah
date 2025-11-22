
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
import { useToast } from "@/hooks/use-toast";
import type { Sheikh, Series, Lecture } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc, runTransaction, increment } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, MicVocal } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { SheikhForm } from "@/components/admin/sheikh-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlaceholderImage } from "@/lib/images";
import { getInitials } from "@/lib/utils";

export default function AdminSheikhsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<Sheikh | null>(null);
    const [itemToEdit, setItemToEdit] = useState<Sheikh | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allItems, isLoading } = useCollection<Sheikh>('sheikhs', { orderBy: ['name', 'asc'] });
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');

    const sheikhStats = useMemo(() => {
        if (!allItems || !allSeries || !allLectures) return {};

        const stats: { [sheikhId: string]: { seriesCount: number, lecturesCount: number } } = {};
        
        allItems.forEach(sheikh => {
            stats[sheikh.id] = {
                seriesCount: allSeries.filter(s => s.sheikhId === sheikh.id).length,
                lecturesCount: allLectures.filter(l => l.sheikhId === sheikh.id).length
            };
        });
        
        return stats;

    }, [allItems, allSeries, allLectures]);
    
    const handleDeleteAttempt = (item: Sheikh) => {
        const stats = sheikhStats[item.id];
        if (stats && (stats.seriesCount > 0 || stats.lecturesCount > 0)) {
            toast({
                variant: "destructive",
                title: "لا يمكن حذف الشيخ",
                description: "يجب أولاً حذف جميع السلاسل والمحاضرات المرتبطة بهذا الشيخ.",
            });
            return;
        }
        setItemToDelete(item);
    };

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'sheikhs', itemToDelete.id);
        const statsRef = doc(firestore, 'stats', 'global');

        try {
            await runTransaction(firestore, async (transaction) => {
                transaction.delete(itemRef);
                transaction.update(statsRef, { sheikhs: increment(-1) });
            });
            toast({
                variant: "destructive",
                title: "تم الحذف بنجاح",
                description: `تم حذف الشيخ "${itemToDelete.name}".`,
            });
        } catch (error) {
             console.error("Error deleting sheikh:", error);
             toast({
                variant: "destructive",
                title: "فشل الحذف",
                description: "لم نتمكن من حذف الشيخ.",
            });
        } finally {
            setItemToDelete(null); // Close the dialog
        }
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: Sheikh) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }

    if (isFormOpen) {
      return <SheikhForm sheikh={itemToEdit} onFormClose={handleFormClose} />
    }
    
    const pageIsLoading = isLoading || seriesLoading || lecturesLoading;

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
            <Button onClick={handleNew} disabled={pageIsLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة شيخ جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>الشيخ</TableHead>
                <TableHead>عدد السلاسل</TableHead>
                <TableHead>عدد المحاضرات</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pageIsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : allItems?.map((item) => {
                    const image = getPlaceholderImage(item.imageId);
                    const stats = sheikhStats[item.id] || { seriesCount: 0, lecturesCount: 0 };

                    return(
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={image?.imageUrl || ''} alt={item.name} />
                                        <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                                    </Avatar>
                                    <span>{item.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{stats.seriesCount}</TableCell>
                            <TableCell>{stats.lecturesCount}</TableCell>
                            <TableCell className="text-left">
                            <div className="flex gap-2 justify-end">
                                <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleDeleteAttempt(item)} variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                    )}
                )}
            </TableBody>
            </Table>
            {!pageIsLoading && !allItems?.length && (
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي مشايخ بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="حذف الشيخ"
          description={`هل أنت متأكد من رغبتك في حذف الشيخ "${itemToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
