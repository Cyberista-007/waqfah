

"use client";

import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, setDoc, deleteDoc, collection, Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
    lectureId: string;
    showLabel?: boolean;
}

export function FavoriteButton({ lectureId, showLabel = false }: FavoriteButtonProps) {
    const { toast } = useToast();
    const { user, isUserLoading } = useAuth();
    const firestore = useFirestore();
    const router = useRouter();

    const favoritesQuery = useMemoFirebase(
        () => (user && firestore ? collection(firestore, 'users', user.uid, 'favorites') : null),
        [user, firestore]
    );
    const { data: favorites, isLoading: favoritesLoading } = useCollection(favoritesQuery);

    const isFavorite = favorites?.some(fav => fav.id === lectureId) || false;

    const handleFavorite = async () => {
        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "يرجى تسجيل الدخول",
                description: "يجب عليك تسجيل الدخول أولاً لتتمكن من إضافة المحاضرات إلى المفضلة.",
            });
            router.push('/auth/login');
            return;
        }

        const favRef = doc(firestore, 'users', user.uid, 'favorites', lectureId);

        if (isFavorite) {
            await deleteDoc(favRef);
            toast({
                title: "تمت الإزالة من المفضلة",
            });
        } else {
            await setDoc(favRef, { lectureId: lectureId, addedAt: Timestamp.now() });
            toast({
                title: "تمت الإضافة إلى المفضلة",
            });
        }
    };
    
    const buttonContent = (
      <Button 
          onClick={handleFavorite} 
          variant={showLabel ? "outline" : "ghost"} 
          size={showLabel ? "default" : "icon"} 
          className={cn(
              !showLabel && "text-white bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-full h-10 w-10",
              isFavorite && !showLabel && "text-red-500",
          )}
          disabled={isUserLoading || favoritesLoading}
      >
          <Heart className={cn("w-5 h-5 transition-colors", isFavorite && "fill-current text-red-500")} />
          {showLabel && <span className="ms-2"> {isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}</span>}
      </Button>
    )

    if (showLabel) {
        return buttonContent;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {buttonContent}
                </TooltipTrigger>
                <TooltipContent><p>{isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
