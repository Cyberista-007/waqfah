
'use client';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Share2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface YoutubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  shareUrl: string;
}

export function YoutubePlayerModal({ isOpen, onClose, videoId, shareUrl }: YoutubePlayerModalProps) {
  const { toast } = useToast();
  if (!videoId) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-auto p-0 border-0 bg-black/80 backdrop-blur-sm shadow-none !rounded-lg overflow-hidden">
        <div className="absolute top-2 right-2 z-20 flex gap-2">
            <Button onClick={onClose} size="icon" variant="ghost" className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white">
              <X className="h-8 w-8" />
              <span className="sr-only">إغلاق</span>
            </Button>
        </div>
        <div className="absolute top-2 left-2 z-20 flex gap-2">
            <Button onClick={handleShare} size="icon" variant="ghost" className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white">
              <Share2 className="h-6 w-6" />
              <span className="sr-only">مشاركة</span>
            </Button>
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
            className="rounded-lg w-full h-full absolute top-0 left-0"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
