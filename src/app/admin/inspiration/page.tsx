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
import type { Inspiration } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Quote as QuoteIcon } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { InspirationForm } from "@/components/admin/inspiration-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export default function AdminInspirationPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<Inspiration | null>(null);
    const [itemToEdit, setItemToEdit] = useState<Inspiration | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allItems, isLoading } = useCollection<Inspiration>('inspiration', {
        orderBy: ['createdAt', 'desc']
    });

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'inspiration', itemToDelete.id);
        
        deleteDocumentNonBlocking(itemRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف الحكمة.`,
        });
        
        setItemToDelete(null); // Close the dialog
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: Inspiration) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }

    if (isFormOpen) {
      return <InspirationForm item={itemToEdit} onFormClose={handleFormClose} />
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black font-headline tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <QuoteIcon className="h-8 w-8 text-primary" />
                        </div>
                        الأحاديث والحكم
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">إدارة الحكم والأحاديث التي تظهر في الصفحة الرئيسية.</p>
                </div>
                <Button onClick={handleNew} className="h-14 px-8 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
                    <PlusCircle className="ml-2 h-5 w-5" />
                    إضافة حكمة جديدة
                </Button>
            </div>

            <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-xl">
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead className="text-right">النص</TableHead>
                                <TableHead className="text-right">القائل</TableHead>
                                <TableHead className="text-right hidden md:table-cell">النوع</TableHead>
                                <TableHead className="text-left">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <Loader2 className="mx-auto my-12 h-10 w-10 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                            ) : allItems?.map((item) => (
                            <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                <TableCell className="max-w-md">
                                    <p className="font-medium line-clamp-2 md:text-lg">{item.text}</p>
                                    {item.title && <span className="text-xs text-muted-foreground opacity-60">({item.title})</span>}
                                </TableCell>
                                <TableCell>
                                    <span className="font-bold text-primary">{item.author}</span>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="text-sm opacity-70">
                                            {item.type === 'hadith' ? 'حديث نبوي' : item.type === 'quote' ? 'قول عالم' : 'حكمة'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-left">
                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={() => handleEdit(item)} variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-primary hover:text-white transition-all">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => setItemToDelete(item)} variant="destructive" size="sm" className="rounded-xl shadow-lg shadow-destructive/20 transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!isLoading && !allItems?.length && (
                    <div className="py-20 text-center space-y-4">
                        <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
                            <QuoteIcon className="h-10 w-10 text-muted-foreground opacity-20" />
                        </div>
                        <p className="text-xl text-muted-foreground font-medium">لم تتم إضافة أي أحاديث أو حكم بعد.</p>
                        <Button onClick={handleNew} variant="outline" className="rounded-xl">ابدأ بإضافة أول حكمة</Button>
                    </div>
                    )}
                </CardContent>
            </Card>
            
            <DeleteConfirmationDialog 
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                title="حذف الحكمة"
                description={`هل أنت متأكد من رغبتك في حذف هذه الحكمة؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
        </div>
    );
}
