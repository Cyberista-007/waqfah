
'use client';

import YouTube, { type YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { X, GripVertical, Maximize2, Minimize2, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Define constants for player dimensions and constraints
const MIN_WIDTH = 320;
const MIN_HEIGHT = 180;
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 300;

export function FloatingVideoPlayer() {
    const { videoTrack, videoPlayerRef, isPlayerVisible, hideVideoPlayer, pauseTrack } = useAudioPlayer();
    
    // Player state
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    // Interaction state
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    // Refs for interaction logic
    const playerRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0, playerX: 0, playerY: 0 });
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

    // Store pre-maximize state
    const preMaximizeState = useRef({ x: 0, y: 0, width: 0, height: 0 });

    // Set initial position when player becomes visible
    useEffect(() => {
        if (isPlayerVisible) {
            setPosition({
                x: window.innerWidth - DEFAULT_WIDTH - 32, // 32 is padding
                y: 80,
            });
            setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
            setIsMaximized(false);
            setIsHidden(false);
        }
    }, [isPlayerVisible]);

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        if(videoPlayerRef) videoPlayerRef.current = event.target;
    };

    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        if (event.data === 1) { // playing
            pauseTrack();
        }
    };
    
    // --- Interaction Handlers ---

    const handleDragStart = (e: React.MouseEvent) => {
        if (isMaximized || isHidden) return;
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            playerX: position.x,
            playerY: position.y,
        };
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        if (isMaximized || isHidden) return;
        e.preventDefault();
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
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            
            let newX = dragStartRef.current.playerX + dx;
            let newY = dragStartRef.current.playerY + dy;

            // Boundary checks
            newX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
            newY = Math.max(0, Math.min(newY, window.innerHeight - size.height));

            setPosition({ x: newX, y: newY });
        }
        if (isResizing) {
            const dw = e.clientX - resizeStartRef.current.x;
            const dh = e.clientY - resizeStartRef.current.y;
            
            const newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.width + dw);
            const newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.height + dh);

            setSize({ width: newWidth, height: newHeight });
        }
    }, [isDragging, isResizing, size.width, size.height]);
    
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);


    // --- UI Action Handlers ---

    const toggleMaximize = () => {
        if (isMaximized) {
            // Restore
            setPosition(preMaximizeState.current);
            setSize({ width: preMaximizeState.current.width, height: preMaximizeState.current.height });
        } else {
            // Maximize
            preMaximizeState.current = { ...position, ...size };
            setPosition({ x: 0, y: 0 });
            setSize({ width: window.innerWidth, height: window.innerHeight });
        }
        setIsMaximized(!isMaximized);
    };

    const toggleHide = () => {
        if (isHidden && videoPlayerRef?.current) {
            videoPlayerRef.current.playVideo();
        } else if (!isHidden && videoPlayerRef?.current) {
            videoPlayerRef.current.pauseVideo();
        }
        setIsHidden(!isHidden);
    };

    // --- Dynamic Styles ---

    const playerStyle: React.CSSProperties = {
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: isMaximized ? '100vw' : `${size.width}px`,
        height: isMaximized ? '100vh' : `${size.height}px`,
        transform: isHidden ? `translateX(calc(100% - 40px))` : 'translateX(0)',
        transition: (isDragging || isResizing) ? 'none' : 'transform 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out',
    };

    if (!isPlayerVisible || !videoTrack) {
        return null;
    }

    return (
        <div
            ref={playerRef}
            style={playerStyle}
            className={cn(
                "fixed z-50 rounded-lg shadow-2xl bg-black overflow-hidden flex flex-col",
                isMaximized && "rounded-none"
            )}
        >
            {/* Interaction Overlay */}
            {(isDragging || isResizing) && <div className="absolute inset-0 z-20" />}
            
            {/* Control Bar */}
            <div className="relative flex-shrink-0 h-8 w-full flex items-center justify-center bg-black text-white/50 z-10">
                <div
                    onMouseDown={handleDragStart}
                    className={cn(
                        "flex-grow h-full flex items-center justify-center",
                        !isMaximized && !isHidden && "cursor-move"
                    )}
                >
                    <GripVertical className="h-5 w-5 pointer-events-none" />
                </div>
                 <div className="absolute top-0 right-0 h-8 flex items-center px-1">
                    <Button onClick={toggleMaximize} variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20">
                        {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button onClick={hideVideoPlayer} variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Video Content */}
            <div className="flex-grow w-full h-full bg-black">
                <YouTube
                    videoId={videoTrack.videoId}
                    opts={{
                        height: '100%',
                        width: '100%',
                        playerVars: { autoplay: 1, rel: 0, controls: 1, modestbranding: 1 },
                    }}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                />
            </div>
            
            {/* Hide/Show Button */}
             <Button
                onClick={toggleHide}
                variant="ghost"
                size="icon"
                className="absolute top-1/2 -translate-y-1/2 -left-0.5 h-16 w-8 z-30 bg-black/70 hover:bg-black rounded-r-lg rounded-l-none text-white opacity-50 hover:opacity-100"
            >
                {isHidden ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
            </Button>


            {/* Resize Handle */}
            {!isMaximized && !isHidden && (
                 <div
                    onMouseDown={handleResizeStart}
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-30"
                >
                    <div className="w-full h-full border-r-2 border-b-2 border-white/40" />
                </div>
            )}
        </div>
    );
}

