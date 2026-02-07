
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Comment } from '@/lib/types';
import { collection, doc, Timestamp, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2, MessageCircle, MoreVertical, Trash2, UserX, ShieldBan, ShieldCheck, UserCog } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CommentsSectionProps {
  lectureId: string;
}

interface ActionPayload {
    type: 'deleteComment' | 'deleteUser' | 'banUser' | 'unbanUser';
    comment?: Comment;
    user?: { id: string; name: string; };
    duration?: 'day' | 'week' | 'month' | 'permanent';
}


function CommentItem({ comment, lectureId }: { comment: Comment, lectureId: string }) {
    const { user } = useUser();
    const { isAdmin } = useAdminAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [actionToConfirm, setActionToConfirm] = useState<ActionPayload | null>(null);

    const toDate = (timestamp: any): Date => {
        if (!timestamp) return new Date();
        if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
        if (typeof timestamp === 'object' && timestamp.seconds) return new Date(timestamp.seconds * 1000);
        return new Date(timestamp);
    };

    const commentDate = toDate(comment.createdAt);

    const canManageComment = (user && user.uid === comment.userId);
    const canAdmin = isAdmin && (!user || user.uid !== comment.userId);

    const handleDeleteComment = async () => {
        if (!firestore) return;
        const commentRef = doc(firestore, 'lectures', lectureId, 'comments', comment.id);
        deleteDocumentNonBlocking(commentRef);
        toast({ title: "تم حذف التعليق." });
        setActionToConfirm(null);
    };

    const handleUserAction = async () => {
        if (!actionToConfirm || !actionToConfirm.user || !user) return;
        const { type, user: targetUser, duration } = actionToConfirm;
        
        let apiAction: string;
        let body: any = { targetUid: targetUser.id };

        switch (type) {
            case 'deleteUser':
                apiAction = 'delete';
                break;
            case 'unbanUser':
                apiAction = 'unban';
                break;
            case 'banUser':
                apiAction = duration === 'permanent' ? 'ban_permanent' : 'ban_temporary';
                if (duration && duration !== 'permanent') {
                    body.duration = duration;
                }
                break;
            default:
                return;
        }

        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`${window.location.origin}/api/admin/users/manage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ action: apiAction, ...body }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'فشل تنفيذ الإجراء.');
            }
            toast({ title: 'تم تنفيذ الإجراء بنجاح', description: result.message });

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'حدث خطأ',
                description: error.message,
            });
        } finally {
            setActionToConfirm(null);
        }
    };
    
    const getConfirmationDetails = () => {
        if (!actionToConfirm) return null;
        const { type, user: targetUser, duration } = actionToConfirm;
        switch (type) {
            case 'deleteComment':
                return { title: 'حذف التعليق؟', description: 'هل أنت متأكد أنك تريد حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.', onConfirm: handleDeleteComment };
            case 'deleteUser':
                return { title: `حذف المستخدم ${targetUser?.name}؟`, description: 'سيؤدي هذا إلى حذف حساب المستخدم نهائيًا. لا يمكن التراجع عن هذا الإجراء.', onConfirm: handleUserAction };
            case 'unbanUser':
                 return { title: `إلغاء حظر ${targetUser?.name}؟`, description: 'سيتمكن المستخدم من المشاركة مرة أخرى.', onConfirm: handleUserAction };
            case 'banUser':
                const durationText = { day: 'يوم', week: 'أسبوع', month: 'شهر', permanent: 'بشكل دائم' }[duration!] || '';
                return { title: `حظر المستخدم ${targetUser?.name}؟`, description: `هل أنت متأكد أنك تريد حظر هذا المستخدم ${durationText}؟`, onConfirm: handleUserAction };
            default:
                return null;
        }
    }
    
    const confirmationDetails = getConfirmationDetails();

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
                {!isNaN(commentDate.getTime())
                    ? formatDistanceToNow(commentDate, { addSuffix: true, locale: ar })
                    : 'قبل فترة'
                }
            </span>
        </div>
        <p className="text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
      </div>

       {(canManageComment || canAdmin) && (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canManageComment && (
                        <DropdownMenuItem onSelect={() => setActionToConfirm({ type: 'deleteComment' })} className="text-destructive">
                            <Trash2 className="me-2 h-4 w-4" />
                            <span>حذف التعليق</span>
                        </DropdownMenuItem>
                    )}
                     {canAdmin && (
                        <>
                            <DropdownMenuItem onSelect={() => setActionToConfirm({ type: 'deleteComment' })} className="text-destructive">
                                <Trash2 className="me-2 h-4 w-4" />
                                <span>حذف تعليق (كمدير)</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <UserCog className="me-2 h-4 w-4" />
                                    <span>إدارة المستخدم</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onSelect={() => setActionToConfirm({ type: 'banUser', user: {id: comment.userId, name: comment.userName}, duration: 'day' })}>
                                        <ShieldBan className="me-2 h-4 w-4" />
                                        <span>حظر لمدة يوم</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setActionToConfirm({ type: 'banUser', user: {id: comment.userId, name: comment.userName}, duration: 'week' })}>
                                        <ShieldBan className="me-2 h-4 w-4" />
                                        <span>حظر لمدة أسبوع</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => setActionToConfirm({ type: 'banUser', user: {id: comment.userId, name: comment.userName}, duration: 'month' })}>
                                        <ShieldBan className="me-2 h-4 w-4" />
                                        <span>حظر لمدة شهر</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => setActionToConfirm({ type: 'unbanUser', user: {id: comment.userId, name: comment.userName} })}>
                                        <ShieldCheck className="me-2 h-4 w-4" />
                                        <span>إلغاء الحظر</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     <DropdownMenuItem onSelect={() => setActionToConfirm({ type: 'banUser', user: {id: comment.userId, name: comment.userName}, duration: 'permanent' })} className="text-destructive">
                                        <ShieldBan className="me-2 h-4 w-4" />
                                        <span>حظر دائم</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setActionToConfirm({ type: 'deleteUser', user: {id: comment.userId, name: comment.userName} })} className="text-destructive">
                                        <UserX className="me-2 h-4 w-4" />
                                        <span>حذف المستخدم</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {confirmationDetails && (
                 <AlertDialog open={!!actionToConfirm} onOpenChange={(open) => !open && setActionToConfirm(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmationDetails.title}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmationDetails.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmationDetails.onConfirm}>تأكيد</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
      )}
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
                comments.map(comment => <CommentItem key={comment.id} comment={comment} lectureId={lectureId} />)
            ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد تعليقات حتى الآن. كن أول من يعلّق!</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
