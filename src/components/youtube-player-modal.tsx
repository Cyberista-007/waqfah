'use client';

import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from '@/components/ui/dialog';

interface YoutubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function YoutubePlayerModal({ isOpen, onClose, videoId }: YoutubePlayerModalProps) {
  if (!videoId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-lg w-full h-auto p-0 border-0 bg-transparent shadow-none !rounded-none">
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
