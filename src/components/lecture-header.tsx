
'use client';

import Link from "next/link";
import type { Lecture, Playlist } from "@/lib/types";
import { Button } from "./ui/button";
import { useFirestore, useUser, useCollection, useDoc, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, runTransaction, increment, Timestamp } from "firebase/firestore";
import { Star, ListPlus, MicVocal, ArrowRight, Pin, Loader2 } from "lucide-react";
import { FavoriteButton } from "./favorite-button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { AddToPlaylistDialog } from "./profile/add-to-playlist-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import { cn, getInitials } from "@/lib/utils";
import { getPlaceholderImage } from "@/lib/images";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { Reveal } from "./reveal";
import { HoloBadge } from "./ui/glow";

interface LectureHeaderProps {
    lecture: Lecture;
    seriesLink?: string;
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
    const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
    const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const playlistsPath = user ? `users/${user.uid}/playlists` : null;
    const { data: playlists } = useCollection<Playlist>(playlistsPath);

    const suggestionDocPath = useMemoFirebase(
      () => (user && firestore ? doc(firestore, 'lectures', lecture.id, 'suggestions', user.uid) : null),
      [user, firestore, lecture.id]
    );
    const { data: suggestionDoc, isLoading: isSuggestionLoading } = useDoc(suggestionDocPath);
    const hasSuggested = !!suggestionDoc;
    
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
    
    const handleAddToPlaylistClick = () => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول",
                description: "يجب عليك تسجيل الدخول أولاً لتتمكن من إضافة المحاضرات إلى قائمة التشغيل.",
            });
            router.push('/auth/login');
            return;
        }
        setIsPlaylistDialogOpen(true);
    }
    
    const handleSuggestPin = async () => {
      if (!user || !firestore || hasSuggested || isSuggesting) {
        if (!user) {
          toast({ variant: 'destructive', title: 'يرجى تسجيل الدخول أولاً.' });
          router.push(`/auth/login?redirect_to=/lectures/${lecture.slug}`);
        }
        return;
      }

      setIsSuggesting(true);
      const lectureRef = doc(firestore, 'lectures', lecture.id);
      const suggestionRef = doc(firestore, 'lectures', lecture.id, 'suggestions', user.uid);

      try {
        await runTransaction(firestore, async (transaction) => {
          const lectureSnap = await transaction.get(lectureRef);
          if (!lectureSnap.exists()) throw new Error("Lecture not found.");

          const suggestionSnap = await transaction.get(suggestionRef);
          if (suggestionSnap.exists()) {
            // Already suggested, do nothing.
            return;
          }
          // Create suggestion doc and increment count
          transaction.set(suggestionRef, { userId: user.uid, createdAt: Timestamp.now() });
          transaction.update(lectureRef, { suggestionCount: increment(1) });
        });
        toast({ title: 'شكراً لاقتراحك!', description: 'تم تسجيل اقتراحك لتثبيت هذه المحاضرة.' });
      } catch (e: any) {
         toast({ variant: 'destructive', title: 'حدث خطأ', description: e.message || "لم نتمكن من تسجيل اقتراحك." });
      } finally {
        setIsSuggesting(false);
      }
    };

    const handleRating = async (ratingValue: number) => {
        if (isRatingSubmitting) return;

        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول للتقييم.",
            });
            router.push(`/auth/login?redirect_to=/lectures/${lecture.slug}`);
            return;
        }

        setIsRatingSubmitting(true);

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
        } catch (e: any) {
             if (e.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: ratingRef.path,
                    operation: 'write', // 'set' can be create or update, so 'write' is safer
                    requestResourceData: { value: ratingValue, userId: user.uid, lectureId: lecture.id }
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                console.error("Transaction failed: ", e);
                toast({ variant: 'destructive', title: "حدث خطأ أثناء التقييم." });
            }
        } finally {
            setIsRatingSubmitting(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                <div className="flex flex-col gap-6">
                    {/* Top Row: Series Info & Back Button */}
                    <div className="flex justify-between items-center w-full">
                        {lecture.seriesTitle && seriesLink ? (
                            <Link href={seriesLink} className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-full font-bold text-sm transition-all group">
                                <ListPlus className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                {lecture.seriesTitle}
                            </Link>
                        ) : <div />}
                        
                        <Button variant="ghost" onClick={() => router.back()} className="h-9 px-4 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full text-sm font-bold border border-transparent hover:border-white/10 transition-all">
                            <ArrowRight className="w-4 h-4 me-2" />
                            <span>رجوع</span>
                        </Button>
                    </div>

                    {/* Title & Rating */}
                    <div>
                        <Reveal direction="up" delay={0.1}>
                          <h1 className="text-4xl lg:text-5xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/60 pb-2 drop-shadow-sm leading-normal">
                              {lecture.title}
                          </h1>
                        </Reveal>

                        <div className="flex items-center gap-4 flex-wrap bg-white/5 w-max px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-black text-yellow-400 drop-shadow-md">{currentRating.toFixed(1)}</p>
                                <div className="flex items-center text-yellow-400 gap-1" onMouseLeave={() => setHoverRating(null)}>
                                    {[...Array(5)].map((_, i) => {
                                        const ratingValue = i + 1;
                                        const isActive = ratingValue <= (hoverRating || userRating || 0);
                                        return (
                                            <motion.div
                                                key={i}
                                                whileHover={{ scale: 1.3, rotate: 15 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="cursor-pointer p-0.5"
                                                onClick={() => handleRating(ratingValue)}
                                                onMouseEnter={() => setHoverRating(ratingValue)}
                                            >
                                                <Star
                                                    className={cn(
                                                        "w-6 h-6 transition-colors duration-500",
                                                        isActive 
                                                            ? "fill-current drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] text-yellow-500" 
                                                            : "text-white/10"
                                                    )}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <motion.p 
                                    key={ratingCount}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm font-bold text-muted-foreground ms-2 italic"
                                >
                                    ({ratingCount} تقييم)
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <Reveal direction="up" delay={0.3}>
                  <div className="flex flex-wrap items-center justify-start gap-3 w-full border-t border-border/20 pt-6 mt-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" onClick={handleSuggestPin} disabled={hasSuggested || isSuggesting || isSuggestionLoading} className="h-12 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/50 text-foreground border-white/10 border font-bold transition-all shadow-md">
                                {isSuggesting || isSuggestionLoading ? <Loader2 className="w-5 h-5 me-2 animate-spin" /> : <Pin className="w-5 h-5 me-2" />}
                                <span>{hasSuggested ? "تم الاقتراح للتثبيت" : "اقترح للتثبيت"}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card/90 backdrop-blur-xl border-border/50">
                            <p>عند الضغط على هذا الزر يظهر لمنشئ الموقع أنك تقترح تثبيت هذه المحاضرة في الرئيسية.</p>
                        </TooltipContent>
                    </Tooltip>
                        <Button variant="outline" onClick={handleAddToPlaylistClick} className="h-12 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/50 text-foreground border-white/10 border font-bold transition-all shadow-md">
                        <ListPlus className="w-5 h-5 me-2 text-blue-400" />
                        <span>إضافة لقائمة التشغيل</span>
                    </Button>
                    <FavoriteButton lectureId={lecture.id} showLabel className="h-12 rounded-xl bg-white/5 hover:bg-pink-500/10 hover:border-pink-500/50 hover:text-pink-500 text-foreground border-white/10 border font-bold transition-all shadow-md" />
                  </div>
                </Reveal>
            </div>
            {user && (
                <AddToPlaylistDialog
                    isOpen={isPlaylistDialogOpen}
                    onOpenChange={setIsPlaylistDialogOpen}
                    lectureId={lecture.id}
                    userPlaylists={playlists || []}
                />
            )}
        </TooltipProvider>
    );
}
