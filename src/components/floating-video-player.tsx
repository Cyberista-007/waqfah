'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { Grip, X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef, useCallback } from 'react';
import { DndContext, useDraggable, type DragStartEvent, type DragMoveEvent, type DragEndEvent } from '@dnd-kit/core';

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
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const handleDragStart = (event: DragStartEvent) => {
        setIsDragging(true);
        initialPositionOnDrag.current = position;
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        setIsDragging(false);
    }

    const handleDragMove = (event: DragMoveEvent) => {
        const playerNode = playerContainerRef.current;
        if (!playerNode) return;

        const { width, height } = playerNode.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate proposed new position
        let newX = initialPositionOnDrag.current.x + event.delta.x;
        let newY = initialPositionOnDrag.current.y + event.delta.y;
        
        // Constrain X position
        newX = Math.max(0, Math.min(newX, viewportWidth - width));
        
        // Constrain Y position
        newY = Math.max(0, Math.min(newY, viewportHeight - height));

        setPosition({
            x: newX,
            y: newY,
        });
    };
    
    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed(prev => {
            const isNowCollapsing = !prev;
            if (isNowCollapsing && videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
                videoPlayerRef.current.pauseVideo();
            }
            setPosition({ x: 0, y: 0 });
            return isNowCollapsing;
        });
    }, [videoPlayerRef]);

    const handleToggleMaximize = useCallback(() => {
        setIsMaximized(prev => !prev);
        setPosition({ x: 0, y: 0 }); 
    }, []);

    const handleClose = () => {
        setIsCollapsed(false);
        setIsMaximized(false);
        setPosition({ x: 0, y: 0 });
        hideVideoPlayer();
    };
    
    useEffect(() => {
        if (!isPlayerVisible) {
            setTimeout(() => {
                setPosition({ x: 0, y: 0 });
                setIsCollapsed(false);
                setIsMaximized(false);
            }, 300);
        }
    }, [isPlayerVisible]);
    
    return (
        <div
            ref={playerContainerRef}
            className={cn(
                "fixed z-50 rounded-lg shadow-2xl overflow-hidden",
                isMaximized 
                    ? "w-screen h-screen top-0 right-0 border-none rounded-none" 
                    : "top-20 right-8 w-[50vw] h-[50vh] min-h-[240px] min-w-[320px] max-w-full",
                isDragging ? "transition-none" : "transition-all duration-300 ease-in-out",
                isPlayerVisible ? "opacity-100" : "opacity-0 pointer-events-none",
                !isCollapsed && !isMaximized && "resize-both"
            )}
            style={{
                transform: isMaximized
                    ? 'translate3d(0, 0, 0)'
                    : `translateX(${isCollapsed ? 'calc(100% - 56px)' : '0px'}) translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
        >
            {/* Handle to expand when collapsed */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleCollapse}
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 left-0 h-16 w-14 z-40 bg-black/70 rounded-r-none rounded-l-lg text-white transition-opacity",
                    isCollapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
            
            <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} disabled={isCollapsed || isMaximized}>
                <PlayerContent />
            </DndContext>
            
            {/* Buttons visible when expanded */}
            <div className={cn("absolute top-0 right-0 z-20 flex items-center bg-black/50 rounded-bl-lg transition-opacity", isCollapsed && "opacity-0")}>
                <Button
                    onClick={handleToggleMaximize}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-white hover:bg-black/75 hover:text-white"
                    aria-label={isMaximized ? "تصغير" : "تكبير"}
                >
                    {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
                <Button
                    onClick={handleToggleCollapse}
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 rounded-full text-white hover:bg-black/75 hover:text-white", isMaximized && "hidden")}
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
            <div className={cn("absolute bottom-0 right-0 w-4 h-4 z-30 cursor-se-resize", (isCollapsed || isMaximized) && "hidden")} />
        </div>
    );
}