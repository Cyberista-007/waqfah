

"use client";

import Link from "next/link";
import type { Lecture } from "@/lib/types";
import { Button } from "./ui/button";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, runTransaction, increment, Timestamp } from "firebase/firestore";
import { Star } from "lucide-react";
import { FavoriteButton } from "./favorite-button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface LectureHeaderProps {
    lecture: Lecture;
    seriesLink: string;
}

export function LectureHeader({ lecture, seriesLink }: LectureHeaderProps) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [userRating, setUserRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [currentRating, setCurrentRating] = useState(lecture.rating || 0);
    const [ratingCount, setRatingCount] = useState(lecture.ratingCount || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchRating = async () => {
            if (user && firestore) {
                const ratingRef = doc(firestore, 'lectures', lecture.id, 'ratings', user.uid);
                try {
                    const ratingSnap = await getDoc(ratingRef);
                    if (ratingSnap.exists()) {
                        setUserRating(ratingSnap.data().value);
                    }
                } catch(e) {
                    // This might fail due to permissions before login, which is fine.
                }
            }
        };
        if (!isUserLoading) {
            fetchRating();
        }
    }, [user, firestore, lecture.id, isUserLoading]);

    const handleRating = async (ratingValue: number) => {
        if (isSubmitting) return;

        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول للتقييم.",
            });
            router.push(`/auth/login?redirect_to=/lectures/${lecture.slug}`);
            return;
        }

        setIsSubmitting(true);

        const lectureRef = doc(firestore, 'lectures', lecture.id);
        const ratingRef = doc(firestore, 'lectures', lecture.id, 'ratings', user.uid);

        try {
            await runTransaction(firestore, async (transaction) => {
                const lectureSnap = await transaction.get(lectureRef);
                const ratingSnap = await transaction.get(ratingRef);

                if (!lectureSnap.exists()) {
                    throw "Lecture does not exist!";
                }

                const oldRatingVal = ratingSnap.exists() ? ratingSnap.data().value : 0;
                const currentLectureData = lectureSnap.data();
                const currentRatingCount = currentLectureData.ratingCount || 0;
                const currentRatingTotal = (currentLectureData.rating || 0) * currentRatingCount;

                let newRatingCount = currentRatingCount;
                if (!ratingSnap.exists()) {
                    newRatingCount++;
                }

                const newRatingTotal = currentRatingTotal - oldRatingVal + ratingValue;
                const newAverageRating = newRatingCount > 0 ? newRatingTotal / newRatingCount : 0;

                transaction.update(lectureRef, {
                    rating: newAverageRating,
                    ratingCount: newRatingCount
                });

                transaction.set(ratingRef, {
                    value: ratingValue,
                    userId: user.uid,
                    lectureId: lecture.id,
                    createdAt: Timestamp.now(),
                });

                 // Optimistically update UI state after successful transaction
                setUserRating(ratingValue);
                setRatingCount(newRatingCount);
                setCurrentRating(newAverageRating);
            });

            toast({ title: "شكراً لتقييمك!" });
        } catch (e) {
            console.error("Transaction failed: ", e);
            toast({ variant: 'destructive', title: "حدث خطأ أثناء التقييم." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-primary font-semibold mb-2">
                        <Link href={seriesLink} className="hover:underline">{lecture.seriesTitle}</Link>
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-bold font-headline">{lecture.title}</h1>
                </div>
                <FavoriteButton lectureId={lecture.id} showLabel />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-foreground">{currentRating.toFixed(1)}</p>
                    <div className="flex items-center text-yellow-400" onMouseLeave={() => setHoverRating(null)}>
                        {[...Array(5)].map((_, i) => {
                            const ratingValue = i + 1;
                            return (
                                <Star
                                    key={i}
                                    className={`w-6 h-6 transition-colors cursor-pointer ${ratingValue <= (hoverRating || userRating || 0) ? 'fill-current' : 'text-gray-300'}`}
                                    onMouseEnter={() => setHoverRating(ratingValue)}
                                    onClick={() => handleRating(ratingValue)}
                                />
                            );
                        })}
                    </div>
                    <p className="text-sm text-muted-foreground ms-2">({ratingCount} تقييم)</p>
                </div>
            </div>
        </div>
    );
}
