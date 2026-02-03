'use client';

import { useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React from 'react';

interface YoutubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  showPipHint?: boolean;
}

export function YoutubePlayerModal({ isOpen, onClose, videoId, showPipHint = false }: YoutubePlayerModalProps) {
  const playerRef = useRef<any>(null);
  const [isHintVisible, setIsHintVisible] = React.useState(false);

  useEffect(() => {
    if (isOpen && showPipHint) {
      setIsHintVisible(true);
      const timer = setTimeout(() => {
        setIsHintVisible(false);
      }, 10000); // Hide after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, showPipHint]);

  // Reset hint when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsHintVisible(false);
    }
  }, [isOpen]);


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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 border-0 bg-black/50 shadow-none">
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
          {isHintVisible && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-none rounded-lg text-white text-center p-4"
              onClick={() => setIsHintVisible(false)}
            >
              <div>
                <h3 className="font-bold text-xl mb-2">لتفعيل وضع الفيديو العائم</h3>
                <p>انقر بزر الماوس الأيمن مرتين على الفيديو واختر "صورة داخل صورة"</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
