
"use client";

import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useUser, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";
import { doc, runTransaction, increment, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface FollowButtonProps {
    programId: string;
}

export function FollowButton({ programId }: FollowButtonProps) {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const followDocPath = useMemo(() => {
        if (!user || !programId) return null;
        return `users/${user.uid}/following/${programId}`;
    }, [user, programId]);

    const followDocRef = useMemoFirebase(
      () => (firestore && followDocPath ? doc(firestore, followDocPath) : null),
      [firestore, followDocPath]
    );

    const { data: followDoc, isLoading: isFollowDocLoading } = useDoc(followDocRef);
    
    const isFollowing = !!followDoc;
    const isLoading = isUserLoading || (user && isFollowDocLoading);

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول",
                description: "يجب عليك تسجيل الدخول أولاً لتتمكن من المتابعة.",
            });
            router.push('/auth/login');
            return;
        }

        if (!programId) return;

        const followRef = followDocRef!;
        const targetRef = doc(firestore, 'programs', programId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const targetDoc = await transaction.get(targetRef);
                if (!targetDoc.exists()) {
                    throw "Program does not exist!";
                }

                if (isFollowing) {
                    transaction.delete(followRef);
                    transaction.update(targetRef, { followerCount: increment(-1) });
                } else {
                    const followData = { programId, followedAt: Timestamp.now() };
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

    if (isLoading && user) {
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
