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
import type { Shubha } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, ShieldAlert } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { ShubhaForm } from "@/components/admin/shubha-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export default function AdminShubuhatPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<Shubha | null>(null);
    const [itemToEdit, setItemToEdit] = useState<Shubha | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allItems, isLoading } = useCollection<Shubha>('shubuhat', { orderBy: ['createdAt', 'desc'] });

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'shubuhat', itemToDelete.id);
        
        deleteDocumentNonBlocking(itemRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف الشبهة.`,
        });
        
        setItemToDelete(null); // Close the dialog
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: Shubha) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }

    if (isFormOpen) {
      return <ShubhaForm item={itemToEdit} onFormClose={handleFormClose} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><ShieldAlert/>إدارة منصة حصن اليقين (الشبهات)</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف الشبهات العلمية والردود الأكاديمية المفصلة.
            </CardDescription>
            </div>
            <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة شبهة جديدة
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>الشبهة</TableHead>
                <TableHead className="hidden md:table-cell">الملخص</TableHead>
                <TableHead className="hidden lg:table-cell">التصنيف</TableHead>
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
                    <TableCell className="font-medium max-w-xs md:max-w-sm truncate">{item.question}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-sm truncate text-muted-foreground">{item.summary}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{item.categoryId}</TableCell>
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
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي شبهات حتى الآن.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="حذف الشبهة"
          description={`هل أنت متأكد من رغبتك في حذف شبهة: "${itemToDelete?.question}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
