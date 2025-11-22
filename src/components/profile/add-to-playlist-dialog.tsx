
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة إلى قائمة تشغيل</DialogTitle>
          <DialogDescription>اختر قائمة التشغيل التي تريد إضافة هذه المحاضرة إليها.</DialogDescription>
        </DialogHeader>

        {userPlaylists.length > 0 ? (
            <RadioGroup onValueChange={setSelectedPlaylistId} className="max-h-60 overflow-y-auto p-1">
            {userPlaylists.map(playlist => (
                <div key={playlist.id} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={playlist.id} id={playlist.id} />
                    <Label htmlFor={playlist.id} className="flex-grow cursor-pointer">{playlist.name}</Label>
                </div>
            ))}
            </RadioGroup>
        ) : (
            <div className="text-center p-4 border rounded-md">
                <p className="text-muted-foreground">لم تقم بإنشاء أي قوائم تشغيل بعد.</p>
                 <Button variant="link" onClick={handleCreateRedirect}>
                    إنشاء قائمة جديدة
                </Button>
            </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedPlaylistId}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            إضافة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
