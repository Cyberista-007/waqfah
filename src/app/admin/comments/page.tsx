
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collectionGroup, query, orderBy, doc } from "firebase/firestore";
import type { Comment } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useMemo } from "react";

export default function AdminCommentsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user } = useUser(); // Get user to ensure queries run only when authenticated

    // Query for all comments across all lectures, ordered by creation date.
    // Filtering will be done on the client-side.
    const commentsQuery = useMemoFirebase(
        () => (firestore && user ? query(collectionGroup(firestore, 'comments'), orderBy('createdAt', 'desc')) : null), 
        [firestore, user] // Depend on user to re-run query after login
    );
    const { data: allComments, isLoading, error } = useCollection<Comment>(commentsQuery);
    
    // Client-side filtering and sorting
    const comments = useMemo(() => {
        if (!allComments) return [];
        return allComments.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            // Add a secondary sort to keep the original order for items with the same status
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return dateB - dateA;
        });
    }, [allComments]);


    const handleAction = (comment: Comment, action: 'approved' | 'rejected') => {
        if (!firestore || !comment.id || !comment.lectureId) return;
        
        const commentRef = doc(firestore, 'lectures', comment.lectureId, 'comments', comment.id);

        updateDocumentNonBlocking(commentRef, { status: action });
        
        toast({
            title: `تم ${action === 'approved' ? 'قبول' : 'رفض'} التعليق بنجاح.`,
        });
    }

    const handleDelete = (comment: Comment) => {
        if (!firestore || !comment.id || !comment.lectureId) return;
        const commentRef = doc(firestore, 'lectures', comment.lectureId, 'comments', comment.id);
        deleteDocumentNonBlocking(commentRef);
        toast({
            variant: "destructive",
            title: "تم حذف التعليق بنجاح.",
        });
    }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  // Display a more specific error if it's a permission error
  if (error) {
      return (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle>خطأ في الأذونات</CardTitle>
                <CardDescription className="text-destructive">
                    حدث خطأ أثناء تحميل التعليقات. قد يكون السبب هو عدم وجود أذونات كافية.
                    تأكد من أن قواعد أمان Firestore تسمح باستعلام `collectionGroup` لمجموعة `comments` للمستخدمين المسجلين.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <code className="text-sm bg-muted p-2 rounded-md block whitespace-pre-wrap">{error.message}</code>
            </CardContent>
        </Card>
      );
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
                                {comment.status !== 'approved' && <Button onClick={() => handleAction(comment, 'approved')} variant="default" size="sm">قبول</Button>}
                                {comment.status !== 'rejected' && <Button onClick={() => handleAction(comment, 'rejected')} variant="secondary" size="sm">رفض</Button>}
                                <Button onClick={() => handleDelete(comment)} variant="link" size="sm" className="text-destructive">حذف</Button>
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

    