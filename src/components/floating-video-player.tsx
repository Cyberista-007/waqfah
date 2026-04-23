'use client';

import { useAudioPlayer } from './audio-player-provider';
import { X, Maximize2, GripHorizontal, CheckCircle2, Bookmark, Play, Pause, RotateCcw, RotateCw, Captions } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingVideoPlayer() {
    const { iframeTrack, videoPlayerRef, isPlayerVisible, hidePlayer, onPlayerStateChange, markVideoAsComplete } = useAudioPlayer();
    const { toast } = useToast();

    // Player State: Dimensions and Position
    const [size, setSize] = useState({ width: 480, height: 270 }); // 16:9 ratio
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isInitialized, setIsInitialized] = useState(false);

    // Playback State
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Resize state
    const [activeHandle, setActiveHandle] = useState<string | null>(null);
    const startPos = useRef({ x: 0, y: 0, w: 0, h: 0, posX: 0, posY: 0 });

    const onPlayerReady = useCallback((event: any) => {
        if (videoPlayerRef) videoPlayerRef.current = event.target;
        setDuration(event.target.getDuration());
        event.target.playVideo();
        setIsPlaying(true);
    }, [videoPlayerRef]);

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (!videoPlayerRef.current) return;
        if (isPlaying) {
            videoPlayerRef.current.pauseVideo();
            setIsPlaying(false);
        } else {
            videoPlayerRef.current.playVideo();
            setIsPlaying(true);
        }
    };

    const skip = (seconds: number) => {
        if (!videoPlayerRef.current) return;
        const current = videoPlayerRef.current.getCurrentTime();
        videoPlayerRef.current.seekTo(current + seconds, true);
        setCurrentTime(current + seconds);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoPlayerRef.current) return;
        const val = parseFloat(e.target.value);
        videoPlayerRef.current.seekTo(val, true);
        setCurrentTime(val);
    };

    // Playback Sync
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlayerVisible && videoPlayerRef.current && isPlaying) {
            interval = setInterval(() => {
                const time = videoPlayerRef.current.getCurrentTime();
                const total = videoPlayerRef.current.getDuration();
                setCurrentTime(time);
                if (total !== duration) setDuration(total);

                // Update isPlaying state if changed externally (e.g. ended)
                const state = videoPlayerRef.current.getPlayerState();
                if (state === 1 && !isPlaying) setIsPlaying(true);
                if (state !== 1 && isPlaying) setIsPlaying(false);
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlayerVisible, videoPlayerRef, isPlaying, duration]);

    // Initial positioning
    useEffect(() => {
        if (isPlayerVisible && !isInitialized) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const playerW = Math.min(480, w - 40);
            const playerH = (playerW * 9) / 16;

            setSize({ width: playerW, height: playerH });
            setPosition({
                x: w - playerW - 24,
                y: h - playerH - 100 // Above the mobile nav if present
            });
            setIsInitialized(true);
        }
    }, [isPlayerVisible, isInitialized]);

    useEffect(() => {
        if (!isPlayerVisible || !iframeTrack || iframeTrack.type !== 'youtube') {
            if (videoPlayerRef.current && typeof videoPlayerRef.current.destroy === 'function') {
                videoPlayerRef.current.destroy();
                videoPlayerRef.current = null;
            }
            setIsInitialized(false);
            return;
        }

        const createPlayer = () => {
            if (videoPlayerRef.current && typeof videoPlayerRef.current.destroy === 'function') {
                videoPlayerRef.current.destroy();
            }
            new (window as any).YT.Player('youtube-player-container', {
                videoId: iframeTrack.src,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    enablejsapi: 1,
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                },
            });
        };

        if (!(window as any).YT || !(window as any).YT.Player) {
            // Check if script already exists but YT is not yet ready
            const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
            if (!existingScript) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
            }
            
            // Set the callback if not already ready
            const previousCallback = (window as any).onYouTubeIframeAPIReady;
            (window as any).onYouTubeIframeAPIReady = () => {
                if (previousCallback) previousCallback();
                createPlayer();
            };
        } else {
            // Already loaded, create immediately
            // But wait for a tick to ensure the DOM element is rendered
            setTimeout(createPlayer, 0);
        }

        return () => {
            if ((window as any).onYouTubeIframeAPIReady) (window as any).onYouTubeIframeAPIReady = null;
        };
    }, [isPlayerVisible, iframeTrack, onPlayerReady, onPlayerStateChange, videoPlayerRef]);

    // Resize Logic
    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setActiveHandle(handle);
        startPos.current = {
            x: clientX,
            y: clientY,
            w: size.width,
            h: size.height,
            posX: position.x,
            posY: position.y
        };
    };

    const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!activeHandle) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startPos.current.x;
        const dy = clientY - startPos.current.y;

        let newWidth = startPos.current.w;
        let newHeight = startPos.current.h;
        let newX = startPos.current.posX;
        let newY = startPos.current.posY;

        const ASPECT_RATIO = 16 / 9;
        const MIN_W = 240;

        // 1. Calculate requested dimensions/position
        if (activeHandle === 'move') {
            newX = Math.max(0, Math.min(window.innerWidth - size.width, startPos.current.posX + dx));
            newY = Math.max(0, Math.min(window.innerHeight - size.height, startPos.current.posY + dy));
        } else if (activeHandle === 'top' || activeHandle === 'bottom') {
            // Vertical primary
            newHeight = activeHandle === 'bottom' 
                ? Math.max(MIN_W / ASPECT_RATIO, startPos.current.h + dy)
                : Math.max(MIN_W / ASPECT_RATIO, startPos.current.h - dy);
            newWidth = newHeight * ASPECT_RATIO;
        } else {
            // Horizontal primary or Corner
            newWidth = activeHandle.includes('right')
                ? Math.max(MIN_W, startPos.current.w + dx)
                : Math.max(MIN_W, startPos.current.w - dx);
            newHeight = newWidth / ASPECT_RATIO;
        }

        // 2. Apply viewport constraints and keep ratio
        // First pass: prevent exceeding screen from the right/bottom
        if (newX + newWidth > window.innerWidth) {
            newWidth = window.innerWidth - newX;
            newHeight = newWidth / ASPECT_RATIO;
        }
        if (newY + newHeight > window.innerHeight) {
            newHeight = window.innerHeight - newY;
            newWidth = newHeight * ASPECT_RATIO;
        }

        // Second pass: prevent exceeding screen from left/top if moving those edges
        if (activeHandle.includes('left')) {
            const tempX = startPos.current.posX + startPos.current.w - newWidth;
            if (tempX < 0) {
                newWidth = startPos.current.posX + startPos.current.w;
                newHeight = newWidth / ASPECT_RATIO;
                newX = 0;
            } else {
                newX = tempX;
            }
        }
        if (activeHandle.includes('top')) {
            const tempY = startPos.current.posY + startPos.current.h - newHeight;
            if (tempY < 0) {
                newHeight = startPos.current.posY + startPos.current.h;
                newWidth = newHeight * ASPECT_RATIO;
                newY = 0;
                // Re-sync newX if we were resizing from left-top
                if (activeHandle.includes('left')) {
                    newX = startPos.current.posX + startPos.current.w - newWidth;
                }
            } else {
                newY = tempY;
            }
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
    }, [activeHandle, size, position]);

    useEffect(() => {
        if (activeHandle) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', () => setActiveHandle(null));
            window.addEventListener('touchmove', handleResizeMove);
            window.addEventListener('touchend', () => setActiveHandle(null));
        }
        return () => {
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('touchmove', handleResizeMove);
        };
    }, [activeHandle, handleResizeMove]);

    if (!isPlayerVisible || !iframeTrack) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                    width: size.width,
                    height: size.height,
                    left: position.x,
                    top: position.y,
                    position: 'fixed'
                }}
                className={cn(
                    "z-[100] bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(14,165,229,0.15)] border border-white/10 group select-none transition-shadow duration-300",
                    activeHandle === 'move' ? "cursor-grabbing ring-2 ring-blue-500/50 shadow-[0_35px_80px_rgba(0,0,0,1)]" : "cursor-grab shadow-2xl"
                )}
                onMouseDown={(e) => handleResizeStart(e, 'move')}
                onTouchStart={(e) => handleResizeStart(e, 'move')}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* 8-Point Resize Handles */}
                <div className="absolute inset-0 pointer-events-none z-[100]">
                    {/* Corners */}
                    <div onMouseDown={(e) => handleResizeStart(e, 'top-left')} onTouchStart={(e) => handleResizeStart(e, 'top-left')} className="absolute top-0 left-0 w-6 h-6 pointer-events-auto cursor-nw-resize" />
                    <div onMouseDown={(e) => handleResizeStart(e, 'top-right')} onTouchStart={(e) => handleResizeStart(e, 'top-right')} className="absolute top-0 right-0 w-6 h-6 pointer-events-auto cursor-ne-resize" />
                    <div onMouseDown={(e) => handleResizeStart(e, 'bottom-left')} onTouchStart={(e) => handleResizeStart(e, 'bottom-left')} className="absolute bottom-0 left-0 w-6 h-6 pointer-events-auto cursor-sw-resize" />
                    <div onMouseDown={(e) => handleResizeStart(e, 'bottom-right')} onTouchStart={(e) => handleResizeStart(e, 'bottom-right')} className="absolute bottom-0 right-0 w-6 h-6 pointer-events-auto cursor-se-resize" />

                    {/* Edges */}
                    <div onMouseDown={(e) => handleResizeStart(e, 'top')} onTouchStart={(e) => handleResizeStart(e, 'top')} className="absolute top-0 left-6 right-6 h-2 pointer-events-auto cursor-n-resize" />
                    <div onMouseDown={(e) => handleResizeStart(e, 'bottom')} onTouchStart={(e) => handleResizeStart(e, 'bottom')} className="absolute bottom-0 left-6 right-6 h-2 pointer-events-auto cursor-s-resize" />
                    <div onMouseDown={(e) => handleResizeStart(e, 'left')} onTouchStart={(e) => handleResizeStart(e, 'left')} className="absolute left-0 top-6 bottom-6 w-2 pointer-events-auto cursor-w-resize" />
                    <div onMouseDown={(e) => handleResizeStart(e, 'right')} onTouchStart={(e) => handleResizeStart(e, 'right')} className="absolute right-0 top-6 bottom-6 w-2 pointer-events-auto cursor-e-resize" />
                </div>

                {/* Visual Polish: Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 pointer-events-none z-10" />

                {/* Video Container */}
                <div className="w-full h-full relative z-0 pointer-events-none">
                    <div id="youtube-player-container" className="w-full h-full scale-[1.01]" />
                </div>

                {/* Center Playback Controls */}
                <div className={cn(
                    "absolute inset-0 z-30 flex items-center justify-center gap-6 transition-all duration-500",
                    isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                )}>
                    <button 
                        onClick={() => skip(-10)} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="relative flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto active:scale-90 group/skip"
                        title="تأخر 10 ثواني"
                    >
                        <RotateCcw className="w-8 h-8 text-white drop-shadow-lg" />
                        <span className="absolute text-[9px] font-black text-white mt-1">10</span>
                    </button>

                    <button 
                        onClick={togglePlay} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-14 h-14 flex items-center justify-center pointer-events-auto hover:scale-110 transition-all active:scale-90 group/btn"
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8 text-white fill-white drop-shadow-md" />
                        ) : (
                            <Play className="w-8 h-8 text-white fill-white translate-x-1 drop-shadow-md" />
                        )}
                    </button>

                    <button 
                        onClick={() => skip(10)} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="relative flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto active:scale-90 group/skip"
                        title="تقدم 10 ثواني"
                    >
                        <RotateCw className="w-8 h-8 text-white drop-shadow-lg" />
                        <span className="absolute text-[9px] font-black text-white mt-1">10</span>
                    </button>
                </div>

                {/* Bottom Control Bar */}
                <div 
                    onMouseDown={(e) => e.stopPropagation()}
                    className={cn(
                        "absolute bottom-0 left-0 right-0 p-6 z-30 flex flex-col gap-3 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-500",
                        isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                    )}
                >
                    {/* Time Display */}
                    <div className="flex justify-between items-center text-white/90 text-sm font-bold font-mono tracking-tighter drop-shadow-md">
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                            <span className="text-white">{formatTime(currentTime)}</span>
                            <span className="text-white/40">/</span>
                            <span className="text-white/70">{formatTime(duration)}</span>
                        </div>
                        <button 
                            onMouseDown={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors pointer-events-auto"
                        >
                            <Captions className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden group/progress cursor-pointer pointer-events-auto"
                    >
                        <div 
                            className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300" 
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                        <input 
                            type="range"
                            min="0"
                            max={duration || 100}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                    </div>
                </div>

                {/* Cinematic Floating Header (Visible on Hover, Drag Handle always present) */}
                <div 
                    className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/95 via-black/40 to-transparent opacity-40 group-hover:opacity-100 transition-all duration-500 z-40 translate-y-[-10px] group-hover:translate-y-0"
                >
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={hidePlayer}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/80 flex items-center justify-center transition-all border border-white/10 pointer-events-auto backdrop-blur-md"
                            title="إغلاق"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => {
                                markVideoAsComplete();
                                hidePlayer();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-emerald-500/80 flex items-center justify-center transition-all border border-white/10 pointer-events-auto backdrop-blur-md"
                            title="تحديد كمكتمل"
                        >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center px-4">
                        <GripHorizontal className="w-6 h-6 text-white drop-shadow-md" />
                    </div>

                    <div className="flex gap-2 items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-500/80 text-white border border-white/10 pointer-events-auto backdrop-blur-md"
                            onClick={() => toast({ title: "تمت الإضافة للمشاهدة لاحقاً" })}
                        >
                            <Bookmark className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Glass Tag (Only visible when not hovered) */}
                <div className={cn(
                    "absolute bottom-4 left-4 z-20 flex items-center gap-2 transition-opacity duration-300",
                    isHovered ? "opacity-0" : "opacity-60"
                )}>
                    <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 px-2 py-0.5 rounded-lg">
                        <span className="text-[10px] font-black text-blue-400 tracking-tighter uppercase">Waqfah Cinematic</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
