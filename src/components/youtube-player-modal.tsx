
'use client';

import { useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface YoutubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function YoutubePlayerModal({ isOpen, onClose, videoId }: YoutubePlayerModalProps) {
  const playerRef = useRef<any>(null);

  const handleClose = () => {
    // Attempt to pause video on close, but don't worry if it fails
    try {
        playerRef.current?.pauseVideo();
    } catch (e) {
        console.warn("Could not pause video on close", e);
    }
    onClose();
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
  };
  
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      rel: 0,
    },
  };

  if (!videoId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full p-0 border-0 bg-transparent shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>مشغل فيديو يوتيوب</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onPlayerReady}
            className="w-full h-full absolute top-0 left-0 rounded-lg overflow-hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
