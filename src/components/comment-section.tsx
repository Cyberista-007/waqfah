
"use client";

import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Lecture, Comment as CommentType } from "@/lib/types";
import { collection, query, where, orderBy, Timestamp } from "firebase/firestore";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { FormEvent, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2, Send } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
    lecture: Lecture;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function CommentSection({ lecture }: CommentSectionProps) {
    const firestore = useFirestore();
    const { user } = useAuth();
    const { toast } = useToast();
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const commentsQuery = useMemoFirebase(
        () => firestore ? query(
            collection(firestore, 'lectures', lecture.id, 'comments'), 
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
        ) : null,
        [firestore, lecture.id]
    );
    const { data: comments, isLoading } = useCollection<CommentType>(commentsQuery);

    const handleCommentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !commentText.trim()) return;

        setIsSubmitting(true);
        const commentsCollection = collection(firestore, 'lectures', lecture.id, 'comments');
        
        try {
            await addDocumentNonBlocking(commentsCollection, {
                lectureId: lecture.id,
                lectureSlug: lecture.slug,
                lectureTitle: lecture.title,
                userId: user.uid,
                userName: user.displayName || "مستخدم مجهول",
                userImage: user.photoURL || "",
                text: commentText,
                status: 'pending',
                createdAt: Timestamp.now(),
            });

            toast({
                title: "تم إرسال تعليقك بنجاح!",
                description: "سيظهر تعليقك بعد مراجعته من قبل الإدارة.",
            });
            setCommentText("");
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "حدث خطأ أثناء إرسال التعليق.",
            })
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardContent className="p-6">
                {user ? (
                    <form onSubmit={handleCommentSubmit} className="mb-6">
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <Textarea 
                                    rows={3} 
                                    placeholder="أضف تعليقاً..." 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <Button className="mt-2" disabled={!commentText.trim() || isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                                    إضافة تعليق
                                </Button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="mb-6 text-center bg-muted p-4 rounded-md">
                        <p className="text-muted-foreground">
                            <Link href="/auth/login" className="text-primary hover:underline font-semibold">سجل الدخول</Link> لإضافة تعليق.
                        </p>
                    </div>
                )}
                 
                 <div className="space-y-6">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-24">
                            <Loader2 className="w-8 h-8 animate-spin" />
                         </div>
                    ) : comments && comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
                               <Avatar>
                                    <AvatarImage src={comment.userImage || undefined} />
                                    <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{comment.userName}</p>
                                    <p className="text-muted-foreground">{comment.text}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true, locale: ar }) : ''}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
