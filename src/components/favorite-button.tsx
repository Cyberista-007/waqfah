"use client";

import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
    lectureId: string;
    showLabel?: boolean;
    className?: string;
}

export function FavoriteButton({ lectureId, showLabel = false, className }: FavoriteButtonProps) {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const favoritesPath = user ? `users/${user.uid}/favorites` : null;
    const { data: favorites, isLoading: favoritesLoading } = useCollection(favoritesPath);

    const isFavorite = favorites?.some(fav => fav.id === lectureId) || false;

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
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
          onClick={handleFavoriteClick} 
          variant={showLabel ? "outline" : "ghost"} 
          size={showLabel ? "default" : "icon"} 
          className={cn(
              "h-10 w-10 text-muted-foreground hover:text-red-500",
              isFavorite && "text-red-500",
              className
          )}
          disabled={isUserLoading || favoritesLoading}
      >
          <Heart className={cn("w-5 h-5 transition-colors", isFavorite && "fill-current")} />
          {showLabel && <span className="ms-2"> {isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}</span>}
      </Button>
    )

    if (showLabel) {
        return buttonContent;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {buttonContent}
            </TooltipTrigger>
            <TooltipContent><p>{isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}</p></TooltipContent>
        </Tooltip>
    );
}
