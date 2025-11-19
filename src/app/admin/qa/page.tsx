
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
import type { QAPair } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, HelpCircle } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { QAForm } from "@/components/admin/qa-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export default function AdminQAPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<QAPair | null>(null);
    const [itemToEdit, setItemToEdit] = useState<QAPair | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allItems, isLoading } = useCollection<QAPair>('question_answers');

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'question_answers', itemToDelete.id);
        
        deleteDocumentNonBlocking(itemRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف السؤال.`,
        });
        
        setItemToDelete(null); // Close the dialog
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: QAPair) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }

    if (isFormOpen) {
      return <QAForm item={itemToEdit} onFormClose={handleFormClose} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><HelpCircle/>إدارة الأسئلة والأجوبة</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف الأسئلة والأجوبة.
            </CardDescription>
            </div>
            <Button onClick={handleNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة سؤال جديد
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>السؤال</TableHead>
                <TableHead>الإجابة</TableHead>
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
                ) : allItems?.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-sm truncate">{item.question}</TableCell>
                    <TableCell className="max-w-sm truncate text-muted-foreground">{item.answer}</TableCell>
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
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي أسئلة بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="حذف السؤال"
          description={`هل أنت متأكد من رغبتك في حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
