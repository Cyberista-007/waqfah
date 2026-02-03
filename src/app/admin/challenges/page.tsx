
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
import type { Challenge } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Flame } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { ChallengeForm } from "@/components/admin/challenge-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";


export default function AdminChallengesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<Challenge | null>(null);
    const [itemToEdit, setItemToEdit] = useState<Challenge | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allItems, isLoading } = useCollection<Challenge>('challenges', { orderBy: ['endDate', 'desc'] });

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'challenges', itemToDelete.id);
        
        deleteDocumentNonBlocking(itemRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف التحدي "${itemToDelete.title}".`,
        });
        
        setItemToDelete(null);
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: Challenge) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }
    
    const toDate = (timestamp: any): Date => {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
      return new Date(timestamp);
    }

    if (isFormOpen) {
      return <ChallengeForm item={itemToEdit} onFormClose={handleFormClose} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><Flame/>إدارة التحديات</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف تحديات الاستماع.
            </CardDescription>
            </div>
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة تحدي جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>عنوان التحدي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الانتهاء</TableHead>
                <TableHead>المشاركون</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : allItems?.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-sm truncate">{item.title}</TableCell>
                    <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {format(toDate(item.endDate), "yyyy/MM/dd")}
                    </TableCell>
                     <TableCell>{item.participantCount || 0}</TableCell>
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
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي تحديات بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="حذف التحدي"
          description={`هل أنت متأكد من رغبتك في حذف تحدي "${itemToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
