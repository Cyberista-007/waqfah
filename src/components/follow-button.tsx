
"use client";

import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { doc, runTransaction, increment, Timestamp, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
    sheikhId: string;
}

export function FollowButton({ sheikhId }: FollowButtonProps) {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const followingPath = user ? `users/${user.uid}/following` : null;
    const { data: following, isLoading: followingLoading } = useCollection(followingPath);

    const isFollowing = following?.some(f => f.id === sheikhId) || false;
    const isLoading = isUserLoading || followingLoading;
    
    const handleFollow = async () => {
        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول",
                description: "يجب عليك تسجيل الدخول أولاً لتتمكن من متابعة المشايخ.",
            });
            router.push('/auth/login');
            return;
        }

        const followRef = doc(firestore, 'users', user.uid, 'following', sheikhId);
        const sheikhRef = doc(firestore, 'sheikhs', sheikhId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const sheikhDoc = await transaction.get(sheikhRef);
                if (!sheikhDoc.exists()) {
                    throw "Sheikh does not exist!";
                }

                if (isFollowing) {
                    // Unfollow logic
                    transaction.delete(followRef);
                    transaction.update(sheikhRef, { followerCount: increment(-1) });
                } else {
                    // Follow logic
                    transaction.set(followRef, { sheikhId: sheikhId, followedAt: Timestamp.now() });
                    transaction.update(sheikhRef, { followerCount: increment(1) });
                }
            });

             toast({
                title: isFollowing ? "تم إلغاء المتابعة" : "تمت المتابعة بنجاح",
            });

        } catch (error) {
            console.error("Error following/unfollowing sheikh:", error);
            toast({
                variant: "destructive",
                title: "حدث خطأ",
                description: "لم نتمكن من إتمام العملية. يرجى المحاولة مرة أخرى.",
            });
        }
    };

    if (isLoading) {
        return <Button disabled size="lg"><Loader2 className="animate-spin" /></Button>;
    }

    return (
        <Button onClick={handleFollow} size="lg" variant={isFollowing ? "secondary" : "default"}>
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
