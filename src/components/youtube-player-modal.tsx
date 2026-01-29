'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Share2, X, PictureInPicture } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface YoutubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  shareUrl: string;
}

export function YoutubePlayerModal({ isOpen, onClose, videoId, shareUrl }: YoutubePlayerModalProps) {
  const { toast } = useToast();
  const [isPip, setIsPip] = useState(false);

  if (!videoId) return null;

  const handlePipToggle = () => {
    setIsPip(prev => !prev);
  };
  
  const handleClose = () => {
    setIsPip(false);
    onClose();
  };


  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'مشاهدة محاضرة',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'تم نسخ الرابط بنجاح!' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'تم نسخ الرابط بنجاح!' });
      } catch (copyError) {
        toast({
          variant: 'destructive',
          title: 'فشلت المشاركة والنسخ',
          description: 'لم نتمكن من مشاركة أو نسخ الرابط.',
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={!isPip}>
      <DialogContent 
        className={cn(
          "w-full h-auto p-0 border-0 bg-transparent shadow-none !rounded-2xl overflow-hidden flex flex-col gap-2",
          isPip 
            ? "fixed bottom-5 right-5 w-[380px] h-auto translate-x-0 translate-y-0 z-[60] shadow-2xl aspect-video bg-black"
            : "max-w-4xl"
        )}
        onInteractOutside={(e) => {
          if (!isPip) {
            e.preventDefault();
          }
        }}
        hideCloseButton={true}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>مشغل فيديو يوتيوب</DialogTitle>
        </DialogHeader>
        <div className={cn("flex justify-end items-center bg-card rounded-t-2xl p-2", isPip && "hidden")}>
           <div className="flex items-center gap-1">
             <Button onClick={handlePipToggle} size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground">
                <PictureInPicture className="h-5 w-5" />
                <span className="sr-only">صورة داخل صورة</span>
             </Button>
             <Button onClick={handleShare} size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">مشاركة</span>
            </Button>
            <Button onClick={handleClose} size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground">
                <X className="h-6 w-6" />
                <span className="sr-only">إغلاق</span>
            </Button>
           </div>
        </div>
        <div className="relative aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className={cn("w-full h-full absolute top-0 left-0", isPip ? "rounded-2xl" : "rounded-b-2xl")}
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
