
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Share2, X, PictureInPicture, Grab } from 'lucide-react';
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
  const playerRef = useRef<any>(null); // Use 'any' for the YouTube player object
  const [startTime, setStartTime] = useState(0);

  // State for draggable/resizable PiP
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 380, height: 213.75 }); // Default 16:9
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const pipRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ initialX: 0, initialY: 0, mouseX: 0, mouseY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  // Effect to set initial PiP position
  useEffect(() => {
    if (isPip && position.x === 0 && position.y === 0) {
        setPosition({
            x: window.innerWidth - size.width - 20,
            y: window.innerHeight - size.height - 20,
        });
    }
  }, [isPip, position.x, position.y, size.width, size.height]);


  const handleDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      initialX: position.x,
      initialY: position.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      });
    }
    if (isResizing) {
      const dx = e.clientX - resizeStartRef.current.x;
      const newWidth = resizeStartRef.current.width + dx;
      if (newWidth >= 250 && newWidth <= 800) { // Min/Max width
        setSize({
          width: newWidth,
          height: newWidth * (9 / 16), // Maintain 16:9 aspect ratio
        });
      }
    }
  }, [isDragging, isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
  };

  const handlePipToggle = () => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    setStartTime(currentTime);
    setIsPip(prev => !prev);
  };
  
  const handleClose = () => {
    setStartTime(0);
    playerRef.current?.pauseVideo();
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

  const pipStyle: React.CSSProperties = isPip ? {
    position: 'fixed',
    left: position.x,
    top: position.y,
    width: size.width,
    height: 'auto', // Let aspect ratio control height
    transform: 'none',
  } : {};
  
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      rel: 0,
      start: Math.floor(startTime),
    },
  };


  if (!videoId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={!isPip}>
      <DialogContent 
        key={isPip ? `pip-${startTime}` : 'modal'} // Force re-render with new start time on toggle
        ref={pipRef}
        style={pipStyle}
        className={cn(
          "p-0 border-0 shadow-none !rounded-2xl overflow-hidden flex flex-col gap-0",
          isPip 
            ? "fixed z-[60] shadow-2xl aspect-video bg-black"
            : "max-w-4xl bg-transparent w-full h-auto",
           isDragging && "cursor-grabbing"
        )}
        onInteractOutside={(e) => {
          if (isPip) {
            e.preventDefault();
          }
        }}
        hideCloseButton={true}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>مشغل فيديو يوتيوب</DialogTitle>
        </DialogHeader>
        <div 
          className={cn("flex justify-between items-center bg-card rounded-t-2xl p-2", isPip && "cursor-grab")}
          onMouseDown={isPip ? handleDragMouseDown : undefined}
        >
           <div className={cn("flex items-center gap-1 text-muted-foreground", !isPip && "hidden")}>
             <Grab className="h-5 w-5" />
           </div>
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
        <div className="relative w-full flex-grow bg-black aspect-video">
           <YouTube
             videoId={videoId}
             opts={opts}
             onReady={onPlayerReady}
             className={cn("w-full h-full absolute top-0 left-0", isPip ? "" : "rounded-b-2xl")}
           />
           {isPip && (
              <div 
                  onMouseDown={handleResizeMouseDown}
                  className="absolute -bottom-1 -right-1 w-4 h-4 cursor-nwse-resize z-10"
              />
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
