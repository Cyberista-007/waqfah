
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

export default function AdminCommentsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const commentsQuery = useMemoFirebase(
        () => query(collectionGroup(firestore, 'comments'), orderBy('createdAt', 'desc')),
        [firestore]
    );
    const { data: comments, isLoading, error } = useCollection<Comment>(commentsQuery);

    const handleAction = async (comment: Comment, action: 'approved' | 'rejected') => {
        if (!firestore) return;
        
        const commentRef = doc(firestore, 'lectures', comment.lectureId, 'comments', comment.id);

        try {
            await updateDoc(commentRef, { status: action });
            toast({
                title: `تم ${action === 'approved' ? 'قبول' : 'رفض'} التعليق بنجاح.`,
            });
        } catch (e) {
            console.error(e);
            toast({
                variant: "destructive",
                title: "حدث خطأ",
                description: "لم نتمكن من تحديث حالة التعليق.",
            });
        }
    }

  if (isLoading) {
    return <div>جار تحميل التعليقات...</div>
  }

  if (error) {
      return <div>حدث خطأ أثناء تحميل التعليقات.</div>
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
                {comments?.map(comment => (
                    <TableRow key={comment.id}>
                        <TableCell className="font-medium">{comment.userName || 'مستخدم'}</TableCell>
                        <TableCell className="text-muted-foreground">{comment.text}</TableCell>
                        <TableCell>
                            <Link href={`/lectures/${comment.lectureSlug}`} className="hover:underline">{comment.lectureTitle}</Link>
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
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
