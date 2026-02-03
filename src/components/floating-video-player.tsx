'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { Grip, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';
import { DndContext, useDraggable, type DragMoveEvent, type DragStartEvent } from '@dnd-kit/core';

// This is the actual draggable content of the player
function PlayerContent() {
  const { videoTrack, videoPlayerRef, pauseTrack } = useAudioPlayer();
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'youtube-player-handle',
  });

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    videoPlayerRef.current = event.target;
    pauseTrack();
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
    // The draggable node ref is attached here
    <div ref={setNodeRef} className="w-full h-full flex flex-col bg-black rounded-lg">
      {/* The drag listeners are attached to this handle */}
      <div 
          {...listeners}
          {...attributes}
          className="flex-shrink-0 h-8 w-full flex items-center justify-center text-white/50 cursor-move"
      >
          <Grip className="h-5 w-5" />
      </div>
      {/* The video container takes up the remaining space. */}
      <div className="flex-grow w-full relative">
        <YouTube
            videoId={videoTrack.videoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
        />
      </div>
    </div>
  );
}


// This component manages the position, visibility, and dnd context
export function FloatingVideoPlayer() {
    const { isPlayerVisible, hideVideoPlayer } = useAudioPlayer();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const initialPositionOnDrag = useRef({ x: 0, y: 0 });

    const handleDragStart = (event: DragStartEvent) => {
        initialPositionOnDrag.current = position;
    };

    const handleDragMove = (event: DragMoveEvent) => {
        setPosition({
            x: initialPositionOnDrag.current.x + event.delta.x,
            y: initialPositionOnDrag.current.y + event.delta.y,
        });
    };
    
     useEffect(() => {
        // Reset position when hidden
        if (!isPlayerVisible) {
            // A small delay to allow the fade-out animation to finish
            setTimeout(() => {
                setPosition({ x: 0, y: 0 });
            }, 300);
        }
    }, [isPlayerVisible]);

    return (
        <div
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
            className={cn(
                "fixed top-20 right-8 z-50 rounded-lg shadow-2xl resize-both overflow-hidden",
                "w-[50vw] h-[50vh] min-h-[240px] min-w-[320px] max-w-full",
                "transition-opacity duration-300",
                isPlayerVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove}>
                <PlayerContent />
            </DndContext>
            <Button
                onClick={hideVideoPlayer}
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-8 w-8 rounded-full text-white hover:bg-black/75 hover:text-white z-20"
                aria-label="إغلاق المشغل"
            >
                <X className="h-5 w-5" />
            </Button>
            {/* This transparent div sits on top of the bottom-right corner to allow the resize handle to be grabbed */}
            <div className="absolute bottom-0 right-0 w-4 h-4 z-30" />
        </div>
    );
}
