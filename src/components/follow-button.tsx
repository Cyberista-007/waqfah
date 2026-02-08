"use client";

import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useUser, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";
import { doc, runTransaction, increment, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface FollowButtonProps {
    programId?: string;
    channelId?: string;
}

export function FollowButton({ programId, channelId }: FollowButtonProps) {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const targetId = programId || channelId;
    const targetCollection = programId ? 'programs' : 'channels';
    // TODO: The following collection is currently specific to programs.
    // To fully support channel follows, a new collection or a more generic schema is needed.
    const followCollectionPath = programId ? 'following' : null;

    const followDocPath = useMemo(() => {
        if (!user || !targetId || !followCollectionPath) return null;
        return `users/${user.uid}/${followCollectionPath}/${targetId}`;
    }, [user, targetId, followCollectionPath]);

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
        
        // Disable follow for channels for now
        if (channelId) {
            toast({
                title: "قريبا!",
                description: "ميزة متابعة القنوات قيد التطوير.",
            });
            return;
        }

        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول",
                description: "يجب عليك تسجيل الدخول أولاً لتتمكن من المتابعة.",
            });
            router.push('/auth/login');
            return;
        }

        if (!targetId || !followDocRef) return;

        const targetRef = doc(firestore, targetCollection, targetId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const targetDoc = await transaction.get(targetRef);
                if (!targetDoc.exists()) {
                    throw "Target does not exist!";
                }

                if (isFollowing) {
                    transaction.delete(followDocRef);
                    transaction.update(targetRef, { followerCount: increment(-1) });
                } else {
                    const followData = { [programId ? 'programId' : 'channelId']: targetId, followedAt: Timestamp.now() };
                    transaction.set(followDocRef, followData);
                    transaction.update(targetRef, { followerCount: increment(1) });
                }
            });

             toast({
                title: isFollowing ? "تم إلغاء المتابعة" : "تمت المتابعة بنجاح",
            });

        } catch (error: any) {
             if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: followDocRef.path,
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
        <Button onClick={handleFollow} size="lg" variant={isFollowing ? "secondary" : "default"} className="w-full" disabled={!!channelId}>
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
