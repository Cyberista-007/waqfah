
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Comment } from '@/lib/types';
import { collection, doc, Timestamp, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

interface CommentsSectionProps {
  lectureId: string;
}

function CommentItem({ comment }: { comment: Comment }) {
  const commentDate = comment.createdAt ? new Date(comment.createdAt) : new Date();
  
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={comment.userPhotoURL} alt={comment.userName} />
        <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
            <span className="font-bold">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(commentDate, { addSuffix: true, locale: ar })}
            </span>
        </div>
        <p className="text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
      </div>
    </div>
  );
}

export function CommentsSection({ lectureId }: CommentsSectionProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsPath = useMemo(() => `lectures/${lectureId}/comments`, [lectureId]);
  const { data: comments, isLoading: commentsLoading } = useCollection<Comment>(
    commentsPath, 
    { orderBy: ['createdAt', 'desc'] }
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!firestore || !user || !newComment.trim()) return;

      setIsSubmitting(true);

      const commentsCollection = collection(firestore, commentsPath);
      const commentData = {
          userId: user.uid,
          userName: user.displayName || 'مستخدم',
          userPhotoURL: user.photoURL || '',
          text: newComment,
          createdAt: Timestamp.now(),
      };

      try {
        await addDocumentNonBlocking(commentsCollection, commentData);
        setNewComment('');
      } catch(error) {
        console.error("Error posting comment:", error);
      } finally {
        setIsSubmitting(false);
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            التعليقات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="comment-form">
          {isUserLoading ? (
            <div className="flex items-center justify-center h-24 border rounded-md">
                <Loader2 className="animate-spin" />
            </div>
          ) : user ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
               <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب تعليقك هنا..."
                    rows={3}
                    disabled={isSubmitting}
                  />
               </div>
               <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                        {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        إضافة تعليق
                    </Button>
               </div>
            </form>
          ) : (
             <div className="text-center p-6 border rounded-md bg-muted/30">
                <p className="text-muted-foreground mb-4">يجب عليك تسجيل الدخول لتتمكن من إضافة تعليق.</p>
                <Button asChild>
                    <Link href={`/auth/login?redirect_to=/lectures/${lectureId}`}>تسجيل الدخول</Link>
                </Button>
             </div>
          )}
        </div>

        <div className="comments-list space-y-6">
            {commentsLoading ? (
                 <div className="flex items-center justify-center h-24">
                    <Loader2 className="animate-spin" />
                </div>
            ) : comments && comments.length > 0 ? (
                comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
            ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد تعليقات حتى الآن. كن أول من يعلّق!</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
