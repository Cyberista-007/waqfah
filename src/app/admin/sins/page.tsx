

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
import { useToast } from "@/hooks/use-toast";
import type { DestructiveSin } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc, writeBatch, collection } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, AlertTriangle, Database, LayoutGrid, Info, ExternalLink } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { SinForm } from "@/components/admin/sin-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Image from "next/image";
import { destructiveSinsData } from "@/lib/sins-data";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AdminSinsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { isAdmin } = useAdminAuth();
    const [itemToDelete, setItemToDelete] = useState<DestructiveSin | null>(null);
    const [itemToEdit, setItemToEdit] = useState<DestructiveSin | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);

    const { data: allItems, isLoading } = useCollection<DestructiveSin>('destructive_sins', { orderBy: ['title', 'asc'] });

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        const itemRef = doc(firestore, 'destructive_sins', itemToDelete.id);
        deleteDocumentNonBlocking(itemRef);
        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف "${itemToDelete.title}".`,
        });
        setItemToDelete(null);
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: DestructiveSin) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }

    const handleSeedData = async () => {
        if (!firestore) return;
        setIsSeeding(true);
        const batch = writeBatch(firestore);
        const sinsCollection = collection(firestore, 'destructive_sins');
        destructiveSinsData.forEach(sin => {
            const docRef = doc(sinsCollection, sin.id);
            batch.set(docRef, sin);
        });
        try {
            await batch.commit();
            toast({ title: "تمت إضافة البيانات الأولية بنجاح." });
        } catch (error) {
            console.error("Error seeding sins data:", error);
            toast({ variant: 'destructive', title: "فشل إضافة البيانات." });
        } finally {
            setIsSeeding(false);
        }
    };

    if (isFormOpen) {
      return (
        <div className="space-y-6">
            <Button onClick={handleFormClose} variant="ghost" className="gap-2">
                &rarr; العودة للقائمة
            </Button>
            <SinForm item={itemToEdit} onFormClose={handleFormClose} />
        </div>
      )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black font-headline flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        إدارة بطاقات "احذر المهلكات"
                    </h1>
                    <p className="text-muted-foreground mt-2">تحكم في المحتوى التحذيري الذي يظهر للمستخدمين في قسم المحاسبة.</p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && !isLoading && allItems?.length === 0 && (
                        <Button onClick={handleSeedData} disabled={isSeeding} variant="outline" className="rounded-xl">
                            {isSeeding ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Database className="me-2 h-4 w-4" />}
                            إضافة البيانات الأولية
                        </Button>
                    )}
                    <Button onClick={handleNew} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        إضافة بطاقة جديدة
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="font-bold text-muted-foreground">جاري تحميل البطاقات...</p>
                </div>
            ) : allItems && allItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allItems.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden border-border/50 hover:border-destructive/30 hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-gradient-to-b from-background to-muted/20">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                                <Button onClick={() => handleEdit(item)} variant="secondary" size="icon" className="h-9 w-9 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => setItemToDelete(item)} variant="destructive" size="icon" className="h-9 w-9 rounded-full shadow-md">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <CardContent className="p-8 pt-10 flex flex-col items-center text-center">
                                <div className="mb-6 h-24 w-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-inner p-4 group-hover:scale-110 transition-transform duration-500">
                                    {item.icon.startsWith('http') ? (
                                        <div className="relative w-full h-full">
                                            <Image src={item.icon} alt={item.title} fill className="object-contain" unoptimized />
                                        </div>
                                    ) : (
                                        <AlertTriangle className="h-12 w-12 text-destructive/50" />
                                    )}
                                </div>
                                <h3 className="text-xl font-black font-headline mb-2">{item.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{item.dialogTitle}</p>
                                
                                <div className="mt-6 pt-6 border-t w-full flex flex-col gap-3">
                                    {item.linkedVideoId ? (
                                        <Badge variant="outline" className="w-fit mx-auto gap-1 border-primary/20 text-primary bg-primary/5 py-1 px-3">
                                            <ExternalLink className="w-3 h-3" />
                                            محاضرة مرتبطة
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="w-fit mx-auto text-muted-foreground bg-muted/30 py-1 px-3">
                                            بدون فيديو
                                        </Badge>
                                    )}
                                    <div className="flex gap-2 justify-center">
                                         <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">{item.quranVerses?.length || 0} آية</span>
                                         <span className="text-[10px] font-bold text-muted-foreground/30">•</span>
                                         <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">{item.hadiths?.length || 0} حديث</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 bg-muted/20 rounded-[2rem] border-2 border-dashed text-center">
                    <Database className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-xl font-bold">لا يوجد بطاقات حالياً</h3>
                    <p className="text-muted-foreground mt-1">ابدأ بإضافة أول بطاقة تحذيرية للمنصة.</p>
                    <Button onClick={handleNew} variant="outline" className="mt-6 rounded-xl">
                        إضافة أول بطاقة
                    </Button>
                </div>
            )}

            <DeleteConfirmationDialog 
              isOpen={!!itemToDelete}
              onClose={() => setItemToDelete(null)}
              onConfirm={handleDelete}
              title="حذف البطاقة"
              description={`هل أنت متأكد من رغبتك في حذف بطاقة "${itemToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذفه من قسم المحاسبة لدى جميع المستخدمين.`}
            />
        </div>
    );
}
