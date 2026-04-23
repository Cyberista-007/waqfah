
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Playlist } from '@/lib/types';
import { doc, arrayUnion } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface AddToPlaylistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lectureId: string;
  userPlaylists: Playlist[];
}

export function AddToPlaylistDialog({ isOpen, onOpenChange, lectureId, userPlaylists }: AddToPlaylistDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedPlaylistId || !firestore) {
        toast({ variant: 'destructive', title: "يرجى اختيار قائمة تشغيل."});
        return;
    }

    setIsSubmitting(true);
    const playlist = userPlaylists.find(p => p.id === selectedPlaylistId);
    if (!playlist) return;

    // Prevent adding duplicates
    if (playlist.lectureIds && playlist.lectureIds.includes(lectureId)) {
        toast({ title: "المحاضرة موجودة بالفعل في هذه القائمة." });
        setIsSubmitting(false);
        onOpenChange(false);
        return;
    }

    const playlistRef = doc(firestore, 'users', playlist.userId, 'playlists', playlist.id);

    try {
        await updateDocumentNonBlocking(playlistRef, {
            lectureIds: arrayUnion(lectureId)
        });
        toast({ title: "تمت الإضافة بنجاح!" });
        onOpenChange(false); // Close dialog on success
    } catch(e) {
        console.error("Failed to add to playlist:", e);
        toast({ variant: 'destructive', title: "فشلت الإضافة."});
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleCreateRedirect = () => {
      onOpenChange(false);
      router.push('/profile/playlists');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95%] sm:w-full bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-8 md:p-12 frosted-glass overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none z-0" />
        
        <DialogHeader className="relative z-10 space-y-3 mb-6">
          <DialogTitle className="text-3xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/60">
            إضافة إلى قائمة تشغيل
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/90 font-medium text-lg">
            اختر قائمة التشغيل التي تريد إضافة هذه المحاضرة إليها.
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10" dir="rtl">
            {userPlaylists.length > 0 ? (
                <RadioGroup onValueChange={setSelectedPlaylistId} className="max-h-72 overflow-y-auto pl-2 space-y-3 custom-scrollbar">
                {userPlaylists.map(playlist => (
                    <div 
                        key={playlist.id} 
                        className={cn(
                            "flex flex-row-reverse items-center justify-between gap-4 p-4 px-6 rounded-full border transition-all cursor-pointer group",
                            selectedPlaylistId === playlist.id 
                                ? "bg-primary/20 border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                        )}
                        onClick={() => setSelectedPlaylistId(playlist.id)}
                    >
                        <Label 
                            htmlFor={playlist.id} 
                            className="flex-grow cursor-pointer font-bold text-lg text-foreground group-hover:text-primary transition-colors text-right"
                        >
                            {playlist.name}
                        </Label>
                        <RadioGroupItem value={playlist.id} id={playlist.id} className="h-5 w-5 border-primary/40 text-primary shrink-0" />
                    </div>
                ))}
                </RadioGroup>
            ) : (
                <div className="text-center p-8 bg-white/5 border border-white/10 border-dashed rounded-[3rem] space-y-4">
                    <p className="text-muted-foreground font-bold text-lg">لم تقم بإنشاء أي قوائم تشغيل بعد.</p>
                     <Button variant="outline" onClick={handleCreateRedirect} className="w-full h-14 rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black">
                        إنشاء قائمة جديدة
                    </Button>
                </div>
            )}
        </div>

        <DialogFooter className="relative z-10 flex flex-row gap-3 pt-6 sm:justify-end" dir="rtl">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-14 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground font-bold text-lg">إلغاء</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedPlaylistId}
            className="flex-[2] h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
             {isSubmitting && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
            تأكيد الإضافة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
