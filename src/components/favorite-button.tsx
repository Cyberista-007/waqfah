import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useRouter } from "next/navigation";
import { FluidButton } from "./ui/fluid-button";

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

    const handleFavoriteClick = async () => {
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

        try {
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
        } catch (error) {
            console.error("Error toggling favorite:", error);
            throw error;
        }
    };
    
    const buttonContent = (
      <FluidButton 
          onClick={handleFavoriteClick} 
          variant={showLabel ? "outline" : "ghost"} 
          className={cn(
              "text-muted-foreground hover:text-red-500 min-w-0 transition-none",
              isFavorite && "text-red-500",
              !showLabel && "p-2 rounded-full",
              className
          )}
          disabled={isUserLoading || favoritesLoading}
          successText={isFavorite ? "تمت الإزالة" : "تمت الإضافة"}
      >
          <Heart className={cn("w-5 h-5 transition-colors", isFavorite && "fill-current")} />
          {showLabel && <span className="ms-2"> {isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}</span>}
      </FluidButton>
    )

    if (showLabel) {
        return buttonContent;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="inline-block">
                    {buttonContent}
                </div>
            </TooltipTrigger>
            <TooltipContent><p>{isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}</p></TooltipContent>
        </Tooltip>
    );
}
