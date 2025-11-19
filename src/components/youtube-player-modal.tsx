'use client';

import {
  Dialog,
  DialogContent,
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
      <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none">
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
