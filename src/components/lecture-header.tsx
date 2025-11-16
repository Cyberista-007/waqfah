
"use client";

import Link from "next/link";
import type { Lecture } from "@/lib/types";
import { Button } from "./ui/button";
import { useAuth, useFirestore } from "@/firebase";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, runTransaction, increment } from "firebase/firestore";
import { Star } from "lucide-react";
import { FavoriteButton } from "./favorite-button";
import { useToast } from "@/hooks/use-toast";

interface LectureHeaderProps {
    lecture: Lecture;
    seriesLink: string;
}

export function LectureHeader({ lecture, seriesLink }: LectureHeaderProps) {
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [userRating, setUserRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [currentRating, setCurrentRating] = useState(lecture.rating);
    const [ratingCount, setRatingCount] = useState(lecture.ratingCount);

    useEffect(() => {
        const fetchRating = async () => {
            if (user && firestore) {
                const ratingRef = doc(firestore, 'lectures', lecture.id, 'ratings', user.uid);
                const ratingSnap = await getDoc(ratingRef);
                if (ratingSnap.exists()) {
                    setUserRating(ratingSnap.data().value);
                }
            }
        };
        fetchRating();
    }, [user, firestore, lecture.id]);

    const handleRating = async (ratingValue: number) => {
        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول للتقييم.",
            });
            return;
        }

        const lectureRef = doc(firestore, 'lectures', lecture.id);
        const ratingRef = doc(firestore, 'lectures', lecture.id, 'ratings', user.uid);

        try {
            await runTransaction(firestore, async (transaction) => {
                const lectureSnap = await transaction.get(lectureRef);
                const ratingSnap = await transaction.get(ratingRef);

                if (!lectureSnap.exists()) {
                    throw "Lecture does not exist!";
                }

                const oldRating = ratingSnap.exists() ? ratingSnap.data().value : 0;
                const oldRatingCount = lectureSnap.data().ratingCount || 0;
                const oldRatingTotal = (lectureSnap.data().rating || 0) * oldRatingCount;

                let newRatingCount = oldRatingCount;
                if (!ratingSnap.exists()) {
                    newRatingCount++;
                }

                const newRatingTotal = oldRatingTotal - oldRating + ratingValue;
                const newAverageRating = newRatingTotal / newRatingCount;

                transaction.update(lectureRef, {
                    rating: newAverageRating,
                    ratingCount: newRatingCount
                });

                transaction.set(ratingRef, {
                    value: ratingValue,
                    userId: user.uid,
                    lectureId: lecture.id,
                    createdAt: new Date(),
                });
            });

            setUserRating(ratingValue);
            // Optimistically update UI
            const newTotal = currentRating * ratingCount - (userRating || 0) + ratingValue;
            const newCount = userRating ? ratingCount : ratingCount + 1;
            setCurrentRating(newTotal / newCount);
            setRatingCount(newCount);

            toast({ title: "شكراً لتقييمك!" });
        } catch (e) {
            console.error("Transaction failed: ", e);
            toast({ variant: 'destructive', title: "حدث خطأ أثناء التقييم." });
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
