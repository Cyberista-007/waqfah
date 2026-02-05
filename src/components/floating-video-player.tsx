'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { Grip, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef, useCallback } from 'react';
import { DndContext, useDraggable, type DragEndEvent, type DragStartEvent, type DragMoveEvent } from '@dnd-kit/core';

function PlayerContent() {
  const { videoTrack, videoPlayerRef, pauseTrack } = useAudioPlayer();
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'youtube-player-handle',
  });

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    videoPlayerRef.current = event.target;
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) { 
      pauseTrack();
    }
  };

  if (!videoTrack) return null;

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: { autoplay: 1, rel: 0 },
  };

  return (
    <div ref={setNodeRef} className="w-full h-full flex flex-col bg-black rounded-lg overflow-hidden">
      <div 
          {...listeners}
          {...attributes}
          className="flex-shrink-0 h-8 w-full flex items-center justify-center text-white/50 cursor-move bg-black"
      >
          <Grip className="h-5 w-5" />
      </div>
      <div className="flex-grow w-full h-full relative">
        <YouTube
            videoId={videoTrack.videoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
            iframeClassName="w-full h-full"
        />
      </div>
    </div>
  );
}


export function FloatingVideoPlayer() {
    const { videoPlayerRef, isPlayerVisible, hideVideoPlayer } = useAudioPlayer();
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const initialPositionOnDrag = useRef({ x: 0, y: 0 });
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const handleDragStart = (event: DragStartEvent) => {
        initialPositionOnDrag.current = position;
    };

    const handleDragMove = (event: DragMoveEvent) => {
        setPosition({
            x: initialPositionOnDrag.current.x + event.delta.x,
            y: initialPositionOnDrag.current.y + event.delta.y,
        });
    };
    
    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed(prev => {
            const isNowCollapsing = !prev;
            if (isNowCollapsing && videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
                videoPlayerRef.current.pauseVideo();
            }
            // Reset drag position when collapsing/expanding for simplicity
            setPosition({ x: 0, y: 0 });
            return isNowCollapsing;
        });
    }, [videoPlayerRef]);

    const handleClose = () => {
        setIsCollapsed(false);
        setPosition({ x: 0, y: 0 });
        hideVideoPlayer();
    };
    
    useEffect(() => {
        if (!isPlayerVisible) {
            setTimeout(() => {
                setPosition({ x: 0, y: 0 });
                setIsCollapsed(false);
            }, 300);
        }
    }, [isPlayerVisible]);
    
    return (
        <div
            ref={playerContainerRef}
            className={cn(
                "fixed top-20 right-8 z-50 rounded-lg shadow-2xl overflow-hidden",
                "w-[50vw] h-[50vh] min-h-[240px] min-w-[320px] max-w-full",
                "transition-transform duration-300 ease-in-out",
                isPlayerVisible ? "opacity-100" : "opacity-0 pointer-events-none",
                !isCollapsed && "resize-both"
            )}
            style={{
                transform: `translateX(${isCollapsed ? 'calc(100% - 56px)' : '0px'}) translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
        >
            {/* Handle to expand when collapsed */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleCollapse}
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 left-0 h-16 w-14 z-40 bg-black/70 rounded-r-none rounded-l-lg text-white transition-opacity",
                    isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
            
            <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} disabled={isCollapsed}>
                <PlayerContent />
            </DndContext>
            
            {/* Buttons visible when expanded */}
            <div className={cn("absolute top-0 right-0 z-20 flex items-center bg-black/50 rounded-bl-lg transition-opacity", isCollapsed && "opacity-0")}>
                <Button
                    onClick={handleToggleCollapse}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-white hover:bg-black/75 hover:text-white"
                    aria-label="إخفاء المشغل"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-white hover:bg-black/75 hover:text-white"
                    aria-label="إغلاق المشغل"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
            
            {/* Resize Handle */}
            <div className={cn("absolute bottom-0 right-0 w-4 h-4 z-30 cursor-se-resize", isCollapsed && "hidden")} />
        </div>
    );
}
