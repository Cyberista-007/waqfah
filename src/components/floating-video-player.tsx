'use client';

import YouTube, { type YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { GripVertical, X } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useState, useRef, useCallback } from 'react';

// Define constants for player dimensions
const MIN_WIDTH = 320;
const MIN_HEIGHT = 180;
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 300;
const GRAB_HANDLE_SIZE = 60; // The part of the player that must remain visible to be grabbed

export default function FloatingVideoPlayer() {
    const { iframeTrack, videoPlayerRef, isPlayerVisible, pauseTrack, hidePlayer } = useAudioPlayer();
    
    // Player state
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Interaction state
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    // Refs for interaction logic
    const playerRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0, playerX: 0, playerY: 0 });
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

    // Set initial position when player becomes visible
    useEffect(() => {
        if (isPlayerVisible) {
            setPosition({
                x: window.innerWidth - DEFAULT_WIDTH - 32, // 32 is padding
                y: 80,
            });
            setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
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
        // Check if the click is on a button inside the drag handle area
        if ((e.target as HTMLElement).closest('button')) {
            e.stopPropagation();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            playerX: position.x,
            playerY: position.y,
        };
    };

    const handleResizeStart = (e: React.MouseEvent) => {
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
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            
            let newX = dragStartRef.current.playerX + dx;
            let newY = dragStartRef.current.playerY + dy;

            // Clamp position to ensure a part of it is always visible
            newX = Math.max(-(size.width - GRAB_HANDLE_SIZE), Math.min(newX, window.innerWidth - GRAB_HANDLE_SIZE));
            newY = Math.max(0, Math.min(newY, window.innerHeight - size.height));

            setPosition({ x: newX, y: newY });
        }
        if (isResizing) {
            const dw = e.clientX - resizeStartRef.current.x;
            const dh = e.clientY - resizeStartRef.current.y;
            
            let newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.width + dw);
            let newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.height + dh);

            // Ensure resize doesn't go off-screen from its base position
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
        setIsDragging(false);
        setIsResizing(false);
    }, []);


    useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
    
    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isPlayerVisible || !videoPlayerRef.current || iframeTrack?.type !== 'youtube') return;
            
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
    }, [isPlayerVisible, videoPlayerRef, iframeTrack]);


    // --- Dynamic Styles ---
    const playerStyle: React.CSSProperties = {
        width: `${size.width}px`,
        height: `${size.height}px`,
        top: `${position.y}px`,
        left: `${position.x}px`,
        transition: isDragging || isResizing ? 'none' : 'top 0.1s ease-out, left 0.1s ease-out',
    };

    if (!isPlayerVisible || !iframeTrack) {
        return null;
    }

    const renderPlayer = () => {
        switch (iframeTrack.type) {
            case 'youtube':
                return (
                    <YouTube
                        videoId={iframeTrack.src}
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
                );
            case 'soundcloud':
                const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(iframeTrack.src)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
                return (
                    <iframe
                        width="100%"
                        height="100%"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay"
                        src={embedUrl}>
                    </iframe>
                );
            default:
                return null;
        }
    }

    return (
        <div
            ref={playerRef}
            style={playerStyle}
            className="fixed z-50 rounded-lg shadow-2xl bg-black overflow-hidden flex flex-col group"
        >
            {/* Control Bar */}
             <div
                onMouseDown={handleDragStart}
                className="flex-shrink-0 h-8 w-full flex items-center justify-between px-2 text-white/50 bg-black cursor-move"
                 role="button"
                 tabIndex={0}
                 aria-roledescription="draggable"
            >
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        hidePlayer();
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white rounded-md hover:bg-red-500"
                    aria-label="إغلاق المشغل"
                >
                    <X className="h-5 w-5" />
                </Button>
                 <GripVertical className="h-5 w-5 pointer-events-none" />
                 <div className="w-8"></div>
            </div>

            {/* Video Content */}
            <div className="flex-grow w-full h-full bg-black">
                {renderPlayer()}
            </div>
            
            {/* Resize Handle */}
            <div
                onMouseDown={handleResizeStart}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-30"
            >
                <div className="w-full h-full border-r-2 border-b-2 border-white/40" />
            </div>
        </div>
    );
}
