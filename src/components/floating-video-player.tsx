'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, GripVertical, CornerDownRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef, useCallback } from 'react';

// Default dimensions
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 300;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 180;
const COLLAPSED_WIDTH = 56;
const BORDER_SNAP = 20;

export function FloatingVideoPlayer() {
    const { videoTrack, videoPlayerRef, isPlayerVisible, hideVideoPlayer, pauseTrack } = useAudioPlayer();
    
    // Player state
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Initial position, will be updated
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    // Interaction state
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });
    const resizeStartRef = useRef({ x: 0, y: 0, initialW: 0, initialH: 0 });

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        videoPlayerRef.current = event.target;
    };

    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        if (event.data === 1) { 
            pauseTrack();
        }
    };
    
    // --- Interaction Handlers (Manual Implementation) ---

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStartRef.current = { x: currentX, y: currentY, initialX: position.x, initialY: position.y };
    };

    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsResizing(true);
        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        resizeStartRef.current = { x: currentX, y: currentY, initialW: size.width, initialH: size.height };
    };

    const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        if (isDragging) {
            const dx = currentX - dragStartRef.current.x;
            const dy = currentY - dragStartRef.current.y;
            setPosition({
                x: dragStartRef.current.initialX + dx,
                y: dragStartRef.current.initialY + dy,
            });
        } else if (isResizing) {
            const dw = currentX - resizeStartRef.current.x;
            const dh = currentY - resizeStartRef.current.y;
            setSize({
                width: Math.max(MIN_WIDTH, resizeStartRef.current.initialW + dw),
                height: Math.max(MIN_HEIGHT, resizeStartRef.current.initialH + dh),
            });
        }
    }, [isDragging, isResizing]);

    const handleInteractionEnd = useCallback(() => {
        if (isDragging) {
            // Snap to edges if close enough
            setPosition(currentPos => {
                let newX = currentPos.x;
                if (currentPos.x < BORDER_SNAP) newX = 0;
                if (currentPos.x > window.innerWidth - size.width - BORDER_SNAP) newX = window.innerWidth - size.width;
                
                let newY = currentPos.y;
                if (currentPos.y < BORDER_SNAP) newY = 0;
                if (currentPos.y > window.innerHeight - size.height - BORDER_SNAP) newY = window.innerHeight - size.height;
                
                return { x: newX, y: newY };
            });
        }
        setIsDragging(false);
        setIsResizing(false);
    }, [isDragging, size.width, size.height]);
    
    // Add/remove global listeners
    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleInteractionMove);
            window.addEventListener('touchmove', handleInteractionMove);
            window.addEventListener('mouseup', handleInteractionEnd);
            window.addEventListener('touchend', handleInteractionEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleInteractionMove);
            window.removeEventListener('touchmove', handleInteractionMove);
            window.removeEventListener('mouseup', handleInteractionEnd);
            window.removeEventListener('touchend', handleInteractionEnd);
        };
    }, [isDragging, isResizing, handleInteractionMove, handleInteractionEnd]);
    
    // --- UI Control Handlers ---

    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed(prev => {
            if (!prev) {
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
        setIsCollapsed(false);
        setIsMaximized(false);
        hideVideoPlayer();
    };

    // --- Effects for position and visibility ---

    useEffect(() => {
        const resetPosition = () => {
            setPosition({
                x: window.innerWidth - DEFAULT_WIDTH - 32,
                y: 80,
            });
            setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
            setIsMaximized(false);
            setIsCollapsed(false);
        };

        if (isPlayerVisible) {
            window.addEventListener('resize', resetPosition);
            resetPosition(); // Set initial position
        }

        return () => {
            window.removeEventListener('resize', resetPosition);
        };
    }, [isPlayerVisible]);

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: { autoplay: 1, rel: 0, controls: 1, modestbranding: 1 },
    };
    
    const isInteracting = isDragging || isResizing;

    return (
        <div
            className={cn(
                "fixed z-50 rounded-lg shadow-2xl bg-black overflow-hidden flex flex-col group",
                isInteracting ? "transition-none" : "transition-all duration-300 ease-in-out",
                isPlayerVisible ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            style={
                isMaximized ? {
                    top: 0, left: 0, width: '100vw', height: '100vh', borderRadius: 0,
                } : isCollapsed ? {
                    transform: `translateX(calc(100vw - ${COLLAPSED_WIDTH}px)) translateY(${position.y}px)`,
                    width: `${COLLAPSED_WIDTH}px`,
                    height: `${size.height}px`,
                }
                : {
                    transform: `translateX(${position.x}px) translateY(${position.y}px)`,
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                }
            }
        >
            {/* Interaction Overlay: Prevents iframe from capturing events */}
            {isInteracting && <div className="absolute inset-0 z-50" />}

            {/* Main Content */}
            <div
                className="flex-shrink-0 h-8 w-full flex items-center justify-between px-2 bg-black text-white/50"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <GripVertical className="h-5 w-5" />
                <div className="flex items-center">
                    <Button onClick={handleToggleMaximize} variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20">
                        {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button onClick={handleClose} variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
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

            {/* Collapse/Expand Toggle Button */}
            <Button
                onClick={handleToggleCollapse}
                variant="ghost"
                size="icon"
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-16 w-10 z-40 bg-black/70 text-white rounded-none",
                    "transition-opacity opacity-0 group-hover:opacity-100",
                    isCollapsed ? "right-full rounded-r-lg" : "left-full rounded-l-lg",
                    isMaximized && "hidden"
                )}
            >
                {isCollapsed ? <ChevronRight className="h-5 w-5"/> : <ChevronLeft className="h-5 w-5" />}
            </Button>
            
            {/* Resize Handle */}
            <div
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
                className={cn(
                    "absolute bottom-0 right-0 w-5 h-5 z-30 cursor-se-resize flex items-center justify-center",
                    (isCollapsed || isMaximized) && "hidden"
                )}
            >
              <CornerDownRight className="w-3 h-3 text-white/40" style={{transform: 'rotate(90deg)'}}/>
            </div>
        </div>
    );
}