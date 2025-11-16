
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";

const initialComments = [
    { id: 1, user: "عبد الله محمد", text: "جزاكم الله خيراً، محاضرة قيمة جداً.", lecture: "أهمية التوحيد", status: "approved" },
    { id: 2, user: "فاطمة علي", text: "نفع الله بكم.", lecture: "فضل العلم", status: "approved" },
    { id: 3, user: "أحمد ياسر", text: "شرح ممتاز وواضح.", lecture: "المقدمة: العالم قبل البعثة", status: "pending" },
    { id: 4, user: "سارة محمود", text: "هل هناك جزء ثان لهذه المحاضرة؟", lecture: "شرح نواقض الإسلام", status: "pending" },
    { id: 5, user: "مستخدم مجهول", text: "This is spam.", lecture: "فضل العلم", status: "pending" },
];

export default function AdminCommentsPage() {
    const [comments, setComments] = useState(initialComments);
    const { toast } = useToast();

    const handleAction = (id: number, action: 'approve' | 'reject') => {
        setComments(comments.map(c => c.id === id ? {...c, status: action === 'approve' ? 'approved' : 'rejected' } : c));
        toast({
            title: `تم ${action === 'approve' ? 'قبول' : 'رفض'} التعليق بنجاح.`,
        });
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
                {comments.map(comment => (
                    <TableRow key={comment.id}>
                        <TableCell className="font-medium">{comment.user}</TableCell>
                        <TableCell className="text-muted-foreground">{comment.text}</TableCell>
                        <TableCell>
                            <Link href="#" className="hover:underline">{comment.lecture}</Link>
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
                                <Button disabled={comment.status === 'approved'} onClick={() => handleAction(comment.id, 'approve')} variant="default" size="sm">قبول</Button>
                                <Button disabled={comment.status === 'rejected'} onClick={() => handleAction(comment.id, 'reject')} variant="destructive" size="sm">رفض</Button>
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
