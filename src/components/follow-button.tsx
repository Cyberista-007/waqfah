
"use client";

import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, runTransaction, increment, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
    sheikhId?: string;
    channelId?: string;
}

export function FollowButton({ sheikhId, channelId }: FollowButtonProps) {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const isSheikhFollow = !!sheikhId;
    const isChannelFollow = !!channelId;

    const followingPath = user ? (isSheikhFollow ? `users/${user.uid}/following` : `users/${user.uid}/followingChannels`) : null;
    const { data: following, isLoading: followingLoading } = useCollection(followingPath);

    const isFollowing = following?.some(f => f.id === (sheikhId || channelId)) || false;
    const isLoading = isUserLoading || followingLoading;
    
    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول",
                description: "يجب عليك تسجيل الدخول أولاً لتتمكن من المتابعة.",
            });
            router.push('/auth/login');
            return;
        }

        if (!sheikhId && !channelId) return;

        const followRef = isSheikhFollow 
            ? doc(firestore, 'users', user.uid, 'following', sheikhId!)
            : doc(firestore, 'users', user.uid, 'followingChannels', channelId!);
        
        const targetRef = isSheikhFollow
            ? doc(firestore, 'sheikhs', sheikhId!)
            : doc(firestore, 'channels', channelId!);

        try {
            await runTransaction(firestore, async (transaction) => {
                const targetDoc = await transaction.get(targetRef);
                if (!targetDoc.exists()) {
                    throw isSheikhFollow ? "Sheikh does not exist!" : "Channel does not exist!";
                }

                if (isFollowing) {
                    // Unfollow logic
                    transaction.delete(followRef);
                    transaction.update(targetRef, { followerCount: increment(-1) });
                } else {
                    // Follow logic
                    const followData = { followedAt: Timestamp.now() };
                    transaction.set(followRef, followData);
                    transaction.update(targetRef, { followerCount: increment(1) });
                }
            });

             toast({
                title: isFollowing ? "تم إلغاء المتابعة" : "تمت المتابعة بنجاح",
            });

        } catch (error: any) {
             if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: followRef.path,
                    operation: isFollowing ? 'delete' : 'create',
                    requestResourceData: isFollowing ? undefined : { followedAt: 'server_timestamp' }
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                console.error("Error following/unfollowing:", error);
                toast({
                    variant: "destructive",
                    title: "حدث خطأ",
                    description: "لم نتمكن من إتمام العملية. يرجى المحاولة مرة أخرى.",
                });
            }
        }
    };

    if (isLoading) {
        return <Button disabled size="lg" className="w-full"><Loader2 className="animate-spin" /></Button>;
    }

    return (
        <Button onClick={handleFollow} size="lg" variant={isFollowing ? "secondary" : "default"} className="w-full">
            {isFollowing ? (
                <>
                    <UserCheck className="me-2 h-5 w-5" />
                    <span>تتابعه</span>
                </>
            ) : (
                <>
                    <UserPlus className="me-2 h-5 w-5" />
                    <span>متابعة</span>
                </>
            )}
        </Button>
    );
}
