
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Lecture } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminLecturesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isDeleting, setIsDeleting] = useState<Lecture | null>(null);

    const lecturesQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'lectures'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );
    const { data: allLectures, isLoading } = useCollection<Lecture>(lecturesQuery);

    const handleDelete = async () => {
        if (!isDeleting || !firestore) return;

        const docRef = doc(firestore, 'lectures', isDeleting.id);
        deleteDocumentNonBlocking(docRef);

        toast({
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف محاضرة "${isDeleting.title}".`,
        });
        setIsDeleting(null); // Close the dialog
    };

    return (
        <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline">إدارة المحاضرات</CardTitle>
            <CardDescription>
                أضف أو عدّل أو احذف المحاضرات في الموقع.
            </CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/lectures/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                إضافة محاضرة جديدة
              </Link>
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>عنوان المحاضرة</TableHead>
                <TableHead>السلسلة</TableHead>
                <TableHead className="hidden md:table-cell">تاريخ الإضافة</TableHead>
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
                ) : allLectures?.map((lecture) => (
                <TableRow key={lecture.id}>
                    <TableCell className="font-medium">{lecture.title}</TableCell>
                    <TableCell>{lecture.seriesTitle}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {lecture.createdAt?.toDate ? lecture.createdAt.toDate().toLocaleDateString('ar-EG') : 'غير معروف'}
                    </TableCell>
                    <TableCell className="text-left">
                    <div className="flex gap-2 justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/lectures/${lecture.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button onClick={() => setIsDeleting(lecture)} variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            {!isLoading && !allLectures?.length && (
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي محاضرات بعد.</p>
            )}
        </CardContent>
        </Card>
        
        <DeleteConfirmationDialog 
          isOpen={!!isDeleting}
          onClose={() => setIsDeleting(null)}
          onConfirm={handleDelete}
          title="حذف المحاضرة"
          description={`هل أنت متأكد من رغبتك في حذف محاضرة "${isDeleting?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      </>
    );
}
