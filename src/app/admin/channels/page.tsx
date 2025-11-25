
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
import type { Channel } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, Youtube } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { ChannelForm } from "@/components/admin/channel-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlaceholderImage } from "@/lib/images";

export default function AdminChannelsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [itemToDelete, setItemToDelete] = useState<Channel | null>(null);
    const [itemToEdit, setItemToEdit] = useState<Channel | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: allItems, isLoading } = useCollection<Channel>('channels', { orderBy: ['name', 'asc'] });

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;
        
        const itemRef = doc(firestore, 'channels', itemToDelete.id);
        
        deleteDocumentNonBlocking(itemRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف قناة "${itemToDelete.name}".`,
        });
        
        setItemToDelete(null);
    };
    
    const handleNew = () => {
      setItemToEdit(null);
      setIsFormOpen(true);
    }
    
    const handleEdit = (item: Channel) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    }
    
    const handleFormClose = () => {
      setIsFormOpen(false);
      setItemToEdit(null);
    }

    if (isFormOpen) {
      return <ChannelForm item={itemToEdit} onFormClose={handleFormClose} />
    }

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><Youtube/>إدارة القنوات</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف القنوات في الموقع.
            </CardDescription>
            </div>
            <Button onClick={handleNew} disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة قناة جديدة
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>القناة</TableHead>
                <TableHead>الوصف</TableHead>
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
                    const placeholder = getPlaceholderImage(item.imageId);
                    const imageUrl = item.imageUrl || placeholder?.imageUrl;
                    return(
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={imageUrl || ''} alt={item.name} />
                                        <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{item.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-sm truncate text-muted-foreground">{item.description}</TableCell>
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
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي قنوات بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="حذف القناة"
          description={`هل أنت متأكد من رغبتك في حذف قناة "${itemToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
