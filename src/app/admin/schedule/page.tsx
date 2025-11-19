
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
import type { ScheduleItem } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, CalendarClock } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { ScheduleForm } from "@/components/admin/schedule-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";


export default function AdminSchedulePage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<ScheduleItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<ScheduleItem | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allItems, isLoading } = useCollection<ScheduleItem>('scheduled_lessons', { orderBy: ['dateTime', 'desc'] });

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'scheduled_lessons', itemToDelete.id);
        
        deleteDocumentNonBlocking(itemRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف الدرس.`,
        });
        
        setItemToDelete(null); // Close the dialog
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: ScheduleItem) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }

    if (isFormOpen) {
      return <ScheduleForm item={itemToEdit} onFormClose={handleFormClose} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><CalendarClock/>إدارة جدول الدروس</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف الدروس المجدولة والبث المباشر.
            </CardDescription>
            </div>
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة درس جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>عنوان الدرس</TableHead>
                <TableHead>التاريخ والوقت</TableHead>
                <TableHead>الحالة</TableHead>
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
                ) : allItems?.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-sm truncate">{item.title}</TableCell>
                    <TableCell>
                        {item.dateTime?.toDate ? item.dateTime.toDate().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' }) : 'غير محدد'}
                    </TableCell>
                    <TableCell>
                        {item.isLive && <Badge variant="destructive" className="animate-pulse">بث مباشر</Badge>}
                    </TableCell>
                    <TableCell className="text-left">
                    <div className="flex gap-2 justify-end">
                        <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setItemToDelete(item)} variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            {!isLoading && !allItems?.length && (
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي دروس مجدولة بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="حذف الدرس"
          description={`هل أنت متأكد من رغبتك في حذف هذا الدرس؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
