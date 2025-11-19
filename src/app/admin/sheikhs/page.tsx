
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
import { doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, MicVocal } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { SheikhForm } from "@/components/admin/sheikh-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlaceholderImage } from "@/lib/images";

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function AdminSheikhsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<Sheikh | null>(null);
    const [itemToEdit, setItemToEdit] = useState<Sheikh | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allItems, isLoading } = useCollection<Sheikh>('sheikhs', { orderBy: ['name', 'asc'] });

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'sheikhs', itemToDelete.id);
        
        // Note: In a real app, you should check if this sheikh has any content before deleting.
        deleteDocumentNonBlocking(itemRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف الشيخ "${itemToDelete.name}".`,
        });
        
        setItemToDelete(null); // Close the dialog
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
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة شيخ جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>الشيخ</TableHead>
                <TableHead>تاريخ الإضافة</TableHead>
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
                ) : allItems?.map((item) => {
                    const image = getPlaceholderImage(item.imageId);
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
                            <TableCell>
                                {new Date(item.createdAt as any).toLocaleDateString('ar-EG')}
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
                    )}
                )}
            </TableBody>
            </Table>
            {!isLoading && !allItems?.length && (
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
