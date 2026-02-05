'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, GripVertical, CornerDownRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef, useCallback } from 'react';
import { DndContext, useDraggable, type DragMoveEvent, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';

// Default dimensions
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 300;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 180;
const COLLAPSED_WIDTH = 56;


export function FloatingVideoPlayer() {
    const { videoTrack, videoPlayerRef, isPlayerVisible, hideVideoPlayer, pauseTrack } = useAudioPlayer();
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // New state management for position and size
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [position, setPosition] = useState({
        x: typeof window !== 'undefined' ? window.innerWidth - DEFAULT_WIDTH - 32 : 0,
        y: 80,
    });
    
    // State for managing UI transitions and modes
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false); // To disable transitions during drag/resize

    // Draggable hooks from dnd-kit
    const { attributes: moveAttributes, listeners: moveListeners, setNodeRef: moveHandleRef } = useDraggable({
        id: 'video-player-move',
    });
    const { attributes: resizeAttributes, listeners: resizeListeners, setNodeRef: resizeHandleRef } = useDraggable({
        id: 'video-player-resize',
    });

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        videoPlayerRef.current = event.target;
    };

    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        // If video starts playing, pause the main audio player
        if (event.data === 1) { 
            pauseTrack();
        }
    };
    
    // --- Handlers for Drag and Resize ---
    const handleDragStart = (event: DragStartEvent) => {
        setIsInteracting(true);
    };

    const handleDragMove = (event: DragMoveEvent) => {
        if (!playerContainerRef.current) return;
        
        if (event.active.id === 'video-player-move') {
            setPosition((prev) => {
                const newX = prev.x + event.delta.x;
                const newY = prev.y + event.delta.y;

                // Constrain position within viewport
                const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
                const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - size.height));
                
                return { x: constrainedX, y: constrainedY };
            });
        } else if (event.active.id === 'video-player-resize') {
            setSize((prev) => {
                const newWidth = prev.width + event.delta.x;
                const newHeight = prev.height + event.delta.y;

                // Constrain size
                const constrainedWidth = Math.max(MIN_WIDTH, Math.min(newWidth, window.innerWidth - position.x));
                const constrainedHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, window.innerHeight - position.y));

                return { width: constrainedWidth, height: constrainedHeight };
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setIsInteracting(false);
    };
    
    // --- Handlers for UI buttons ---
    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed(prev => {
            if (!prev) { // If collapsing now
                if (videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
                    videoPlayerRef.current.pauseVideo();
                }
            }
            return !prev;
        });
    }, [videoPlayerRef]);

    const handleToggleMaximize = useCallback(() => {
        setIsMaximized(prev => !prev);
    }, []);

    const handleClose = () => {
        // Reset all states before hiding
        setIsCollapsed(false);
        setIsMaximized(false);
        hideVideoPlayer();
    };

    // Reset position when visibility changes or on window resize
    useEffect(() => {
        const handleResize = () => {
             setPosition({
                x: window.innerWidth - size.width - 32,
                y: 80,
            });
            setIsCollapsed(false);
            setIsMaximized(false);
        }

        if (isPlayerVisible) {
            window.addEventListener('resize', handleResize);
            handleResize(); // Initial position set
        }

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [isPlayerVisible, size.width]);


    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: { autoplay: 1, rel: 0 },
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
            <div
                ref={playerContainerRef}
                className={cn(
                    "fixed z-50 rounded-lg shadow-2xl bg-black overflow-hidden flex flex-col",
                    isInteracting ? "transition-none" : "transition-all duration-300 ease-in-out",
                    isPlayerVisible ? "opacity-100" : "opacity-0 pointer-events-none",
                )}
                style={
                    isMaximized ? {
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        borderRadius: 0,
                    } : {
                        top: `${position.y}px`,
                        left: isCollapsed ? `calc(100% - ${COLLAPSED_WIDTH}px)` : `${position.x}px`,
                        width: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${size.width}px`,
                        height: isCollapsed ? `${size.height}px` : `${size.height}px`, // Keep height on collapse
                    }
                }
            >
                {/* Drag Handle */}
                <div
                    ref={moveHandleRef}
                    {...moveListeners}
                    {...moveAttributes}
                    className="flex-shrink-0 h-8 w-full flex items-center justify-center text-white/50 cursor-move"
                >
                    <GripVertical className="h-5 w-5" />
                </div>
                
                {/* Player Content */}
                <div className="flex-grow w-full h-full relative">
                    {videoTrack && (
                         <YouTube
                            videoId={videoTrack.videoId}
                            opts={opts}
                            onReady={onPlayerReady}
                            onStateChange={onPlayerStateChange}
                            className="w-full h-full"
                            iframeClassName="w-full h-full"
                        />
                    )}
                </div>

                 {/* Controls Overlay */}
                <div className="absolute top-0 right-0 z-20 flex items-center bg-black/50 rounded-bl-lg transition-opacity">
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
                        {isCollapsed ? <ChevronRight className="h-5 w-5"/> : <ChevronLeft className="h-5 w-5" />}
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
                <div
                    ref={resizeHandleRef}
                    {...resizeListeners}
                    {...resizeAttributes}
                    className={cn(
                        "absolute bottom-0 right-0 w-5 h-5 z-30 cursor-se-resize flex items-center justify-center",
                        (isCollapsed || isMaximized) && "hidden"
                    )}
                >
                  <CornerDownRight className="w-3 h-3 text-white/40"/>
                </div>
            </div>
        </DndContext>
    );
}