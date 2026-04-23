import { UserPlus, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useUser, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";
import { doc, runTransaction, increment, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { FluidButton } from "./ui/fluid-button";

interface FollowButtonProps {
    programId?: string;
    className?: string;
}

export function FollowButton({ programId, className }: FollowButtonProps) {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const targetId = programId;
    const targetCollection = 'programs';
    const followCollectionPath = 'following';

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
    const isLoading = !!(isUserLoading || (user && isFollowDocLoading));

    const handleFollow = async () => {
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
                    const followData = { programId: targetId, followedAt: Timestamp.now() };
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
                throw error;
            } else {
                console.error("Error following/unfollowing:", error);
                toast({
                    variant: "destructive",
                    title: "حدث خطأ",
                    description: "لم نتمكن من إتمام العملية. يرجى المحاولة مرة أخرى.",
                });
                throw error;
            }
        }
    };

    return (
        <FluidButton 
            onClick={handleFollow} 
            disabled={isLoading && !!user}
            variant={isFollowing ? "outline" : "primary"} 
            className={cn("w-full transition-all duration-300", className)}
            successText={isFollowing ? "تم إلغاء المتابعة" : "تمت المتابعة"}
        >
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
        </FluidButton>
    );
}
