
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, orderBy, doc, updateDoc } from "firebase/firestore";
import type { Comment } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminCommentsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const commentsQuery = useMemoFirebase(
        () => firestore ? query(collectionGroup(firestore, 'comments'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );
    const { data: comments, isLoading, error } = useCollection<Comment>(commentsQuery);

    const handleAction = (comment: Comment, action: 'approved' | 'rejected') => {
        if (!firestore || !comment.id) return;
        
        // Path needs lectureId and the comment's own ID.
        // Assuming comment documents have a lectureId field.
        if (!comment.lectureId) {
             toast({
                variant: "destructive",
                title: "خطأ في البيانات",
                description: "لم يتم العثور على معرف المحاضرة للتعليق.",
            });
            return;
        }

        const commentRef = doc(firestore, 'lectures', comment.lectureId, 'comments', comment.id);

        updateDocumentNonBlocking(commentRef, { status: action });
        
        toast({
            title: `تم ${action === 'approved' ? 'قبول' : 'رفض'} التعليق بنجاح.`,
        });
    }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  if (error) {
      return <div>حدث خطأ أثناء تحميل التعليقات: {error.message}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">مراجعة التعليقات</CardTitle>
        <CardDescription>هنا يمكنك مراجعة وإدارة تعليقات المستخدمين.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>التعليق</TableHead>
                    <TableHead>على محاضرة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {comments && comments.length > 0 ? comments.map(comment => (
                    <TableRow key={comment.id}>
                        <TableCell className="font-medium">{comment.userName || 'مستخدم'}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[300px] truncate">{comment.text}</TableCell>
                        <TableCell>
                            {comment.lectureSlug ? (
                                <Link href={`/lectures/${comment.lectureSlug}`} className="hover:underline" target="_blank">
                                    {comment.lectureTitle || 'محاضرة'}
                                </Link>
                            ) : (
                                <span>{comment.lectureTitle || 'محاضرة'}</span>
                            )}
                        </TableCell>
                        <TableCell>
                             <Badge variant={
                                comment.status === 'approved' ? 'default' : 
                                comment.status === 'pending' ? 'secondary' : 'destructive'
                             }>
                                {comment.status === 'approved' ? 'مقبول' : 
                                 comment.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                            <div className="flex gap-2">
                                <Button disabled={comment.status === 'approved'} onClick={() => handleAction(comment, 'approved')} variant="default" size="sm">قبول</Button>
                                <Button disabled={comment.status === 'rejected'} onClick={() => handleAction(comment, 'rejected')} variant="destructive" size="sm">رفض</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            لا توجد تعليقات للمراجعة حالياً.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
