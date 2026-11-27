'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import {
  doc,
  runTransaction,
  writeBatch,
  deleteDoc,
  increment,
  Timestamp,
} from "firebase/firestore";

import { useToast } from "@/hooks/use-toast";
import {
  useDoc,
  useFirestore,
  useUser,
  errorEmitter,
  FirestorePermissionError,
  useMemoFirebase,
} from "@/firebase";
import { cn } from "@/lib/utils";
import { FluidButton } from "./ui/fluid-button";

interface FollowButtonProps {
  programId?: string;
  className?: string;
}

const RETRIABLE_TRANSACTION_CODES = new Set([
  "unavailable",
  "aborted",
  "failed-precondition",
  "deadline-exceeded",
]);

export function FollowButton({ programId, className }: FollowButtonProps) {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [lastSuccessText, setLastSuccessText] = useState("تمت المتابعة");

  const targetId = programId;
  const targetCollection = "programs";
  const followCollectionPath = "following";

  const followDocPath = useMemo(() => {
    if (!user || !targetId) return null;
    return `users/${user.uid}/${followCollectionPath}/${targetId}`;
  }, [user, targetId]);

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
      router.push("/auth/login");
      return;
    }

    if (!targetId || !followDocRef) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "تعذر تحديد القناة المطلوبة.",
      });
      throw new Error("INVALID_PROGRAM_ID");
    }

    const targetRef = doc(firestore, targetCollection, targetId);
    const optimisticUnfollow = isFollowing;
    setLastSuccessText(optimisticUnfollow ? "تم إلغاء المتابعة" : "تمت المتابعة");

    let didUnfollow = optimisticUnfollow;

    try {
      try {
        didUnfollow = await runTransaction(firestore, async (transaction) => {
          const [targetDoc, followSnap] = await Promise.all([
            transaction.get(targetRef),
            transaction.get(followDocRef),
          ]);

          const currentlyFollowing = followSnap.exists();

          if (!targetDoc.exists()) {
            if (currentlyFollowing) {
              transaction.delete(followDocRef);
              return true;
            }
            throw new Error("TARGET_NOT_FOUND");
          }

          const rawCount = targetDoc.data()?.followerCount;
          const currentCount =
            typeof rawCount === "number" && Number.isFinite(rawCount) ? rawCount : 0;

          if (currentlyFollowing) {
            transaction.delete(followDocRef);
            transaction.update(targetRef, {
              followerCount: Math.max(0, currentCount - 1),
            });
            return true;
          }

          transaction.set(followDocRef, {
            programId: targetId,
            followedAt: Timestamp.now(),
          });
          transaction.update(targetRef, {
            followerCount: Math.max(0, currentCount) + 1,
          });
          return false;
        });
      } catch (txError: any) {
        if (!RETRIABLE_TRANSACTION_CODES.has(txError?.code)) {
          throw txError;
        }

        // Fallback to offline-compatible writeBatch when transaction is blocked by network or multi-tab lock
        const batch = writeBatch(firestore);
        if (optimisticUnfollow) {
          batch.delete(followDocRef);
          batch.update(targetRef, { followerCount: increment(-1) });
        } else {
          batch.set(followDocRef, {
            programId: targetId,
            followedAt: Timestamp.now(),
          });
          batch.update(targetRef, { followerCount: increment(1) });
        }

        try {
          await batch.commit();
        } catch (batchError: any) {
          if (batchError?.code === "not-found" && optimisticUnfollow) {
            await deleteDoc(followDocRef);
          } else {
            throw batchError;
          }
        }
      }

      setLastSuccessText(didUnfollow ? "تم إلغاء المتابعة" : "تمت المتابعة");
      toast({
        title: didUnfollow ? "تم إلغاء المتابعة" : "تمت المتابعة بنجاح",
      });
    } catch (error: any) {
      if (error?.code === "permission-denied") {
        const permissionError = new FirestorePermissionError({
          path: followDocRef.path,
          operation: isFollowing ? "delete" : "create",
          requestResourceData: isFollowing
            ? undefined
            : { programId: targetId, followedAt: "server_timestamp" },
        });
        errorEmitter.emit("permission-error", permissionError);
        toast({
          variant: "destructive",
          title: "لا توجد صلاحية كافية",
          description: "يرجى التأكد من تسجيل الدخول أو إعادة المحاولة لاحقاً.",
        });
        throw error;
      }

      if (error?.message === "TARGET_NOT_FOUND") {
        toast({
          variant: "destructive",
          title: "القناة غير متوفرة حالياً",
          description: "قد يكون تم تحديث بيانات القناة، يرجى تحديث الصفحة ثم المحاولة.",
        });
        throw error;
      }

      console.error("Error following/unfollowing:", error?.code || error?.message || error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من إتمام العملية. يرجى المحاولة مرة أخرى.",
      });
      throw error;
    }
  };

  return (
    <FluidButton
      onClick={handleFollow}
      disabled={isLoading && !!user}
      variant={isFollowing ? "outline" : "primary"}
      className={cn("w-full transition-all duration-300", className)}
      successText={lastSuccessText}
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
