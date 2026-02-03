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

  // State for draggable/resizable PiP
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 380, height: 213.75 }); // Default 16:9
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const pipRef = useRef<HTMLDivElement>(null);
  
  const interactionStartRef = useRef<{
      x: number;
      y: number;
      initialX: number;
      initialY: number;
      width: number;
      height: number;
  } | null>(null);

  
  // Effect to set initial PiP position
  useEffect(() => {
    if (isPip && position.x === 0 && position.y === 0) {
        const initialWidth = window.innerWidth > 400 ? 380 : 320;
        const initialHeight = initialWidth * (9/16);
        setSize({width: initialWidth, height: initialHeight});
        setPosition({
            x: window.innerWidth - initialWidth - 20,
            y: window.innerHeight - initialHeight - 80, // 80 to avoid mobile nav
        });
    }
  }, [isPip, position.x, position.y]);

  const getEventCoords = (e: MouseEvent | TouchEvent) => {
    return 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only drag, don't prevent default for buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsDragging(true);
    const { x, y } = getEventCoords(e.nativeEvent);
    interactionStartRef.current = {
      x, y,
      initialX: position.x, initialY: position.y,
      width: 0, height: 0 // Not needed for dragging
    };
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent drag from firing
    setIsResizing(true);
    const { x, y } = getEventCoords(e.nativeEvent);
    interactionStartRef.current = {
      x, y,
      initialX: 0, initialY: 0, // Not needed
      width: size.width,
      height: size.height,
    };
  };
  
  const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (isDragging || isResizing) {
        // This is crucial to prevent page scrolling on mobile while dragging
        e.preventDefault();
    }

    if (!interactionStartRef.current) return;
    const { x, y } = getEventCoords(e);
    
    if (isDragging) {
      const dx = x - interactionStartRef.current.x;
      const dy = y - interactionStartRef.current.y;
      
      const newX = interactionStartRef.current.initialX + dx;
      const newY = interactionStartRef.current.initialY + dy;

      // Boundary checks
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - size.height));

      setPosition({
        x: boundedX,
        y: boundedY,
      });
    }
    
    if (isResizing) {
      const dx = x - interactionStartRef.current.x;
      const newWidth = interactionStartRef.current.width + dx;
      if (newWidth >= 200 && newWidth <= 800) { // Min/Max width
        setSize({
          width: newWidth,
          height: newWidth * (9 / 16),
        });
      }
    }
  }, [isDragging, isResizing, size.width, size.height]);

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    interactionStartRef.current = null;
  }, []);

  useEffect(() => {
    const touchMoveOptions = { passive: false };
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleInteractionMove);
      document.addEventListener('touchmove', handleInteractionMove, touchMoveOptions);
      document.addEventListener('mouseup', handleInteractionEnd);
      document.addEventListener('touchend', handleInteractionEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleInteractionMove);
      document.removeEventListener('touchmove', handleInteractionMove, touchMoveOptions);
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [isDragging, isResizing, handleInteractionMove, handleInteractionEnd]);


  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
  };

  const handlePipToggle = () => {
    setIsPip(prev => !prev);
  };
  
  const handleClose = () => {
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
    },
  };


  if (!videoId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={!isPip}>
      <DialogContent 
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
          className={cn("flex justify-between items-center bg-card rounded-t-2xl p-2 touch-none", isPip && "cursor-grab")}
          onMouseDown={isPip ? handleDragStart : undefined}
          onTouchStart={isPip ? handleDragStart : undefined}
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
                  onMouseDown={handleResizeStart}
                  onTouchStart={handleResizeStart}
                  className="absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize z-10"
              />
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
