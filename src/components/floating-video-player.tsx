
'use client';

import YouTube, { type YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { X, GripVertical, Maximize2, Minimize2, ChevronsLeft, ChevronsRight, ChevronsDown, ChevronsUp } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Define constants for player dimensions and constraints
const MIN_WIDTH = 320;
const MIN_HEIGHT = 180;
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 300;
const VISIBLE_PART = 40; // The part of the player that remains visible when docked


export function FloatingVideoPlayer() {
    const { videoTrack, videoPlayerRef, isPlayerVisible, hideVideoPlayer, pauseTrack } = useAudioPlayer();
    
    // Player state
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [dockedTo, setDockedTo] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null);
    const [preDockPosition, setPreDockPosition] = useState({ x: 0, y: 0 });
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });


    // Interaction state
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    // Refs for interaction logic
    const playerRef = useRef<HTMLDivElement>(null);
    const interactionOverlayRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0, playerX: 0, playerY: 0 });
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

    // Store pre-maximize state
    const preMaximizeState = useRef({ x: 0, y: 0, width: 0, height: 0 });

    // Effect to track window size
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        handleResize(); // Initial size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Set initial position when player becomes visible
    useEffect(() => {
        if (isPlayerVisible) {
            setPosition({
                x: window.innerWidth - DEFAULT_WIDTH - 32, // 32 is padding
                y: 80,
            });
            setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
            setIsMaximized(false);
            setDockedTo(null);
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
        if (isMaximized || dockedTo) return;
        e.preventDefault();
        if (interactionOverlayRef.current) {
            interactionOverlayRef.current.style.display = 'block';
        }
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            playerX: position.x,
            playerY: position.y,
        };
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        if (isMaximized || dockedTo) return;
        e.preventDefault();
         if (interactionOverlayRef.current) {
            interactionOverlayRef.current.style.display = 'block';
        }
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
            
            let newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.width + dw);
            let newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.height + dh);

            // Ensure resize doesn't go off-screen
            if (position.x + newWidth > window.innerWidth) {
                newWidth = window.innerWidth - position.x;
            }
             if (position.y + newHeight > window.innerHeight) {
                newHeight = window.innerHeight - position.y;
            }


            setSize({ width: newWidth, height: newHeight });
        }
    }, [isDragging, isResizing, size.width, size.height, position.x, position.y]);
    
    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            const threshold = 50; // pixels from edge to trigger snap
            let newDockedTo: 'left' | 'right' | 'top' | 'bottom' | null = null;

            if (position.x <= threshold) {
                newDockedTo = 'left';
            } else if (position.x + size.width >= windowSize.width - threshold) {
                newDockedTo = 'right';
            } else if (position.y <= threshold) {
                newDockedTo = 'top';
            } else if (position.y + size.height >= windowSize.height - threshold) {
                newDockedTo = 'bottom';
            }

            if (newDockedTo) {
                setPreDockPosition(position); // Save position before docking
                if (videoPlayerRef?.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
                    videoPlayerRef.current.pauseVideo();
                }
                setDockedTo(newDockedTo);
            }
        }

        if (interactionOverlayRef.current) {
            interactionOverlayRef.current.style.display = 'none';
        }
        setIsDragging(false);
        setIsResizing(false);
    }, [isDragging, position, size, windowSize.width, windowSize.height, videoPlayerRef]);


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
    const handleUndock = () => {
        setDockedTo(null);
        setPosition(preDockPosition); // Restore position
        if (videoPlayerRef?.current && typeof videoPlayerRef.current.playVideo === 'function') {
            videoPlayerRef.current.playVideo();
        }
    };

    const toggleMaximize = useCallback(() => {
        if (dockedTo) {
            setDockedTo(null);
            setPosition(preDockPosition);
        }

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
    }, [dockedTo, isMaximized, position, preDockPosition, size, window.innerWidth, window.innerHeight]);


    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isPlayerVisible || !videoPlayerRef.current) return;
            
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
                return;
            }
            
            const player = videoPlayerRef.current;
            const playerState = typeof player.getPlayerState === 'function' ? player.getPlayerState() : -1;

            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    if (playerState === 1) { // playing
                        player.pauseVideo();
                    } else {
                        player.playVideo();
                    }
                    break;
                case 'KeyM':
                    event.preventDefault();
                    if (player.isMuted()) {
                        player.unMute();
                    } else {
                        player.mute();
                    }
                    break;
                case 'KeyF':
                    event.preventDefault();
                    toggleMaximize();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    player.getCurrentTime().then(currentTime => player.seekTo(currentTime - 10, true));
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    player.getCurrentTime().then(currentTime => player.seekTo(currentTime + 10, true));
                    break;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlayerVisible, toggleMaximize]);


    // --- Dynamic Styles ---
    const playerStyle: React.CSSProperties = {
        width: isMaximized ? '100vw' : `${size.width}px`,
        height: isMaximized ? '100vh' : `${size.height}px`,
        transition: isDragging || isResizing ? 'none' : 'top 0.3s ease-in-out, left 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out',
    };
    
    if (dockedTo) {
        switch (dockedTo) {
            case 'left':
                playerStyle.left = `${-(size.width - VISIBLE_PART)}px`;
                playerStyle.top = `${position.y}px`;
                break;
            case 'right':
                playerStyle.left = `${windowSize.width - VISIBLE_PART}px`;
                playerStyle.top = `${position.y}px`;
                break;
            case 'top':
                playerStyle.top = `${-(size.height - VISIBLE_PART)}px`;
                playerStyle.left = `${position.x}px`;
                break;
            case 'bottom':
                playerStyle.top = `${windowSize.height - VISIBLE_PART}px`;
                playerStyle.left = `${position.x}px`;
                break;
        }
    } else {
        playerStyle.top = `${position.y}px`;
        playerStyle.left = `${position.x}px`;
    }

    if (!isPlayerVisible || !videoTrack) {
        return null;
    }

    return (
        <div
            ref={playerRef}
            style={playerStyle}
            className={cn(
                "fixed z-50 rounded-lg shadow-2xl bg-black overflow-hidden flex flex-col group",
                isMaximized && "rounded-none"
            )}
        >
            {/* Interaction Overlay */}
            <div ref={interactionOverlayRef} className="absolute inset-0 z-20" style={{ display: 'none' }} />
            
            {/* Control Bar */}
            <div
                onMouseDown={handleDragStart}
                className={cn(
                    "flex-shrink-0 h-8 w-full flex items-center justify-center text-white/50 bg-black",
                   !isMaximized && !dockedTo && "cursor-move"
                )}
                 role="button"
                 tabIndex={0}
                 aria-roledescription="draggable"
            >
                <GripVertical className="h-5 w-5 pointer-events-none" />
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
            
            {/* Undocking Controls */}
            {!isMaximized && (
                 <>
                    {dockedTo === 'left' && <Button onClick={handleUndock} variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-1 h-12 w-12 text-white"><ChevronsRight /></Button>}
                    {dockedTo === 'right' && <Button onClick={handleUndock} variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 left-1 h-12 w-12 text-white"><ChevronsLeft /></Button>}
                    {dockedTo === 'top' && <Button onClick={handleUndock} variant="ghost" size="icon" className="absolute left-1/2 -translate-x-1/2 bottom-1 h-12 w-12 text-white"><ChevronsDown /></Button>}
                    {dockedTo === 'bottom' && <Button onClick={handleUndock} variant="ghost" size="icon" className="absolute left-1/2 -translate-x-1/2 top-1 h-12 w-12 text-white"><ChevronsUp /></Button>}
                </>
            )}


            {/* Resize Handle */}
            {!isMaximized && !dockedTo && (
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
