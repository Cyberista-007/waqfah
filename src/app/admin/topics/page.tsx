
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
import type { Topic } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, orderBy } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Hash } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { TopicForm } from "@/components/admin/topic-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export default function AdminTopicsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<Topic | null>(null);
    const [itemToEdit, setItemToEdit] = useState<Topic | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const topicsQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'topics'), orderBy('name')) : null),
        [firestore]
    );
    const { data: allItems, isLoading } = useCollection<Topic>(topicsQuery);

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'topics', itemToDelete.id);
        
        deleteDocumentNonBlocking(itemRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف موضوع "${itemToDelete.name}".`,
        });
        
        setItemToDelete(null); // Close the dialog
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: Topic) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }

    if (isFormOpen) {
      return <TopicForm topic={itemToEdit} onFormClose={handleFormClose} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><Hash/>إدارة المواضيع</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف المواضيع لتصنيف المحتوى.
            </CardDescription>
            </div>
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة موضوع جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>اسم الموضوع</TableHead>
                <TableHead>عدد المحاضرات</TableHead>
                <TableHead>عدد السلاسل</TableHead>
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
                    <TableCell className="font-medium max-w-sm truncate">{item.name}</TableCell>
                    <TableCell>{item.lectureIds?.length || 0}</TableCell>
                    <TableCell>{item.seriesIds?.length || 0}</TableCell>
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
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي مواضيع بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="حذف الموضوع"
          description={`هل أنت متأكد من رغبتك في حذف موضوع "${itemToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
