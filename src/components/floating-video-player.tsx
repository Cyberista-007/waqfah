'use client';

import { useAudioPlayer } from './audio-player-provider';
import { X, Maximize2, GripHorizontal, CheckCircle2, Bookmark, Play, Pause, RotateCcw, RotateCw, Captions, PictureInPicture } from 'lucide-react';
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

    // Native PiP State
    const [isNativePiP, setIsNativePiP] = useState(false);
    const pipWindowRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // Playback State
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const canvasVideoRef = useRef<HTMLVideoElement | null>(null);
    const canvasDrawIntervalRef = useRef<number | null>(null);
    const isPlayingRef = useRef(false);
    const iframeTrackRef = useRef<any>(null);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        iframeTrackRef.current = iframeTrack;
    }, [iframeTrack]);

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

    const createPlayer = useCallback(() => {
        if (!isPlayerVisible || !iframeTrack || iframeTrack.type !== 'youtube') return;
        if (!playerContainerRef.current) return;

        if (videoPlayerRef.current && typeof videoPlayerRef.current.destroy === 'function') {
            videoPlayerRef.current.destroy();
        }

        new (window as any).YT.Player(playerContainerRef.current, {
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
    }, [isPlayerVisible, iframeTrack, onPlayerReady, onPlayerStateChange, videoPlayerRef]);

    useEffect(() => {
        if (!isPlayerVisible || !iframeTrack || iframeTrack.type !== 'youtube') {
            if (videoPlayerRef.current && typeof videoPlayerRef.current.destroy === 'function') {
                videoPlayerRef.current.destroy();
                videoPlayerRef.current = null;
            }
            setIsInitialized(false);
            return;
        }

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
    }, [isPlayerVisible, iframeTrack, createPlayer, videoPlayerRef]);

    const startCanvasPiP = async () => {
        try {
            // Clean up any existing Canvas PiP
            if (canvasDrawIntervalRef.current) {
                window.clearInterval(canvasDrawIntervalRef.current);
                canvasDrawIntervalRef.current = null;
            }
            if (canvasVideoRef.current) {
                try {
                    await document.exitPictureInPicture();
                } catch (e) {}
                canvasVideoRef.current = null;
            }

            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw initial frame
            const drawFrame = () => {
                ctx.fillStyle = '#0f172a'; // slate-900 slate background
                ctx.fillRect(0, 0, 640, 360);

                // Add radial glow in center
                const grad = ctx.createRadialGradient(320, 180, 50, 320, 180, 300);
                grad.addColorStop(0, '#1e3a8a'); // dark blue glow
                grad.addColorStop(1, '#0f172a');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 640, 360);

                // Draw logo icon or simple circle
                ctx.fillStyle = '#3b82f6';
                ctx.beginPath();
                ctx.arc(320, 100, 30, 0, 2 * Math.PI);
                ctx.fill();

                // Draw a play/pause symbol inside the circle
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                if (isPlayingRef.current) {
                    // Two lines for pause
                    ctx.fillRect(312, 88, 6, 24);
                    ctx.fillRect(322, 88, 6, 24);
                } else {
                    // Play triangle
                    ctx.moveTo(312, 88);
                    ctx.lineTo(334, 100);
                    ctx.lineTo(312, 112);
                    ctx.closePath();
                    ctx.fill();
                }

                // Draw title
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
                ctx.textAlign = 'center';
                const titleText = iframeTrackRef.current?.title || 'وقفات';
                // Clean the title from HTML entities or limit length
                const cleanTitle = titleText.substring(0, 45) + (titleText.length > 45 ? '...' : '');
                ctx.fillText(cleanTitle, 320, 180);

                // Draw Subtitle / Status
                ctx.fillStyle = '#94a3b8';
                ctx.font = '14px system-ui, -apple-system, sans-serif';
                ctx.fillText(isPlayingRef.current ? 'جاري التشغيل في الخلفية' : 'موقوف مؤقتاً', 320, 210);

                // Draw animated sound waves (visualizer mock)
                if (isPlayingRef.current) {
                    ctx.fillStyle = '#3b82f6';
                    const time = Date.now() * 0.006;
                    for (let i = 0; i < 15; i++) {
                        const waveHeight = 10 + Math.abs(Math.sin(time + i * 0.4)) * 30;
                        const x = 320 - (15 * 14) / 2 + i * 14;
                        ctx.fillRect(x, 270 - waveHeight / 2, 8, waveHeight);
                    }
                } else {
                    // Draw flat lines when paused
                    ctx.fillStyle = '#475569';
                    for (let i = 0; i < 15; i++) {
                        const x = 320 - (15 * 14) / 2 + i * 14;
                        ctx.fillRect(x, 270 - 4, 8, 8);
                    }
                }
            };

            drawFrame();

            // Capture stream
            const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : (canvas as any).mozCaptureStream(30);
            const video = document.createElement('video');
            video.muted = true;
            video.srcObject = stream;
            video.playsInline = true;
            video.width = 640;
            video.height = 360;

            video.style.position = 'fixed';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '1px';
            video.style.height = '1px';
            video.style.opacity = '0';
            video.style.pointerEvents = 'none';
            document.body.appendChild(video);

            // Important: We must play the video first on user click to get PiP permission
            await video.play();

            // Request PiP
            await video.requestPictureInPicture();
            
            canvasVideoRef.current = video;
            setIsNativePiP(true);

            // Periodically draw to keep canvas updated
            canvasDrawIntervalRef.current = window.setInterval(drawFrame, 33); // ~30 FPS

            video.addEventListener('leavepictureinpicture', () => {
                setIsNativePiP(false);
                if (canvasDrawIntervalRef.current) {
                    window.clearInterval(canvasDrawIntervalRef.current);
                    canvasDrawIntervalRef.current = null;
                }
                canvasVideoRef.current = null;
                video.remove();
            });

            // Listen to play/pause in the PiP window controls
            video.onplay = () => {
                if (videoPlayerRef.current && typeof videoPlayerRef.current.playVideo === 'function') {
                    videoPlayerRef.current.playVideo();
                }
                setIsPlaying(true);
            };

            video.onpause = () => {
                if (videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
                    videoPlayerRef.current.pauseVideo();
                }
                setIsPlaying(false);
            };

            toast({
                title: "تم تفعيل النافذة العائمة",
                description: "يمكنك الآن إغلاق المتصفح أو تصفح تطبيقات أخرى والاستماع للمحاضرة.",
            });

        } catch (error) {
            console.error("Failed to start Canvas PiP fallback:", error);
            toast({
                title: "فشل تفعيل النافذة العائمة",
                description: "لم نتمكن من تشغيل الفيديو العائم على هذا الجهاز.",
                variant: "destructive"
            });
        }
    };

    // Handle PiP Window Native Support
    const toggleNativePiP = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isNativePiP) {
            if (pipWindowRef.current) {
                pipWindowRef.current.close();
            } else if (document.pictureInPictureElement) {
                document.exitPictureInPicture().catch(() => {});
            }
            return;
        }

        if (typeof window === 'undefined') return;

        if (!('documentPictureInPicture' in window)) {
            // Check if standard HTML5 video PiP is supported
            const videoEl = document.createElement('video');
            const hasStandardPiP = ('requestPictureInPicture' in videoEl);
            
            if (!hasStandardPiP) {
                toast({
                    title: "المشغل العائم غير مدعوم",
                    description: "متصفحك لا يدعم هذه الميزة (أو تحتاج لاستخدام Chrome/Edge على الكمبيوتر).",
                    variant: "destructive"
                });
                return;
            }

            // Execute canvas-based Picture-in-Picture fallback
            await startCanvasPiP();
            return;
        }

        try {
            const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
                width: size.width,
                height: size.height,
            });

            pipWindowRef.current = pipWindow;
            setIsNativePiP(true);

            // Copy stylesheets so layout renders beautifully
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    pipWindow.document.head.appendChild(style);
                } catch (e) {
                    if (styleSheet.href) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = styleSheet.href;
                        pipWindow.document.head.appendChild(link);
                    }
                }
            });

            const playerContainer = playerContainerRef.current;
            if (playerContainer) {
                // If it is an iframe, update src with start time to avoid resetting playback
                if (playerContainer.tagName === 'IFRAME') {
                    const currentSrc = playerContainer.getAttribute('src') || '';
                    const baseUrl = currentSrc.split('?')[0];
                    const urlParams = new URLSearchParams(currentSrc.split('?')[1] || '');
                    urlParams.set('start', Math.floor(currentTime).toString());
                    urlParams.set('autoplay', '1');
                    playerContainer.setAttribute('src', `${baseUrl}?${urlParams.toString()}`);
                }

                // Remove pointer-events-none from parent so user can interact with the player
                playerContainer.parentElement?.classList.remove('pointer-events-none');
                
                // Append player to PiP document body
                pipWindow.document.body.appendChild(playerContainer);

                // Inline styles for absolute fit
                pipWindow.document.body.style.margin = '0';
                pipWindow.document.body.style.backgroundColor = 'black';
                pipWindow.document.body.style.overflow = 'hidden';
                playerContainer.style.width = '100vw';
                playerContainer.style.height = '100vh';

                // Re-bind YT.Player in PiP window once loaded
                playerContainer.onload = () => {
                    new (window as any).YT.Player(playerContainer, {
                        events: {
                            'onReady': (event: any) => {
                                videoPlayerRef.current = event.target;
                                setIsPlaying(true);
                            },
                            'onStateChange': (event: any) => {
                                if (event.data === 1) setIsPlaying(true);
                                else if (event.data === 2) setIsPlaying(false);
                                onPlayerStateChange(event);
                            }
                        }
                    });
                };
            }

            pipWindow.addEventListener('pagehide', () => {
                setIsNativePiP(false);
                pipWindowRef.current = null;

                const originalWrapper = document.getElementById('player-video-wrapper');
                const playerContainer = playerContainerRef.current;
                if (originalWrapper && playerContainer) {
                    originalWrapper.appendChild(playerContainer);
                    originalWrapper.classList.add('pointer-events-none');
                    playerContainer.style.width = '100%';
                    playerContainer.style.height = '100%';

                    if (playerContainer.tagName === 'IFRAME') {
                        const currentSrc = playerContainer.getAttribute('src') || '';
                        const baseUrl = currentSrc.split('?')[0];
                        const urlParams = new URLSearchParams(currentSrc.split('?')[1] || '');
                        urlParams.set('start', Math.floor(currentTime).toString());
                        urlParams.set('autoplay', isPlaying ? '1' : '0');
                        playerContainer.setAttribute('src', `${baseUrl}?${urlParams.toString()}`);
                    }

                    // Re-bind on main window
                    playerContainer.onload = () => {
                        createPlayer();
                    };
                }
            });

            toast({
                title: "تم تفعيل النافذة العائمة الخارجية",
                description: "الفيديو سيبقى عائماً خارج المتصفح وفوق جميع التطبيقات.",
            });

        } catch (err) {
            console.error("Failed to open Picture-in-Picture window:", err);
            toast({
                title: "فشل تفعيل النافذة العائمة",
                description: "حدث خطأ غير متوقع.",
                variant: "destructive"
            });
        }
    };

    // Close PiP on cleanup
    useEffect(() => {
        return () => {
            if (pipWindowRef.current) {
                pipWindowRef.current.close();
            }
            if (canvasDrawIntervalRef.current) {
                window.clearInterval(canvasDrawIntervalRef.current);
            }
            if (document.pictureInPictureElement && document.pictureInPictureElement === canvasVideoRef.current) {
                document.exitPictureInPicture().catch(() => {});
            }
        };
    }, []);

    useEffect(() => {
        if (!isPlayerVisible) {
            if (pipWindowRef.current) {
                pipWindowRef.current.close();
            }
            if (canvasDrawIntervalRef.current) {
                window.clearInterval(canvasDrawIntervalRef.current);
                canvasDrawIntervalRef.current = null;
            }
            if (document.pictureInPictureElement && document.pictureInPictureElement === canvasVideoRef.current) {
                document.exitPictureInPicture().catch(() => {});
            }
            canvasVideoRef.current = null;
        }
    }, [isPlayerVisible]);

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
                <div id="player-video-wrapper" className="w-full h-full relative z-0 pointer-events-none">
                    <div ref={playerContainerRef} id="youtube-player-container" className="w-full h-full scale-[1.01]" />
                </div>

                {/* Native PiP Overlay Indicator */}
                {isNativePiP && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-[45] text-center p-4">
                        <PictureInPicture className="w-12 h-12 text-blue-500 animate-pulse mb-3" />
                        <p className="text-sm font-black text-white">الفيديو نشط في النافذة العائمة الخارجية</p>
                        <p className="text-xs text-white/50 mt-1">تصفح الموقع بحرية، أو أغلق النافذة الخارجية للعودة.</p>
                    </div>
                )}

                {/* Center Playback Controls */}
                <div className={cn(
                    "absolute inset-0 z-30 flex items-center justify-center gap-6 transition-all duration-500",
                    (isHovered && !isNativePiP) ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
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
                        (isHovered && !isNativePiP) ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
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
                            className={cn(
                                "w-10 h-10 rounded-xl border pointer-events-auto backdrop-blur-md transition-all",
                                isNativePiP 
                                    ? "bg-blue-500 text-white border-blue-400 hover:bg-blue-600" 
                                    : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                            )}
                            onClick={toggleNativePiP}
                            title="نافذة عائمة خارج المتصفح (Picture-in-Picture)"
                        >
                            <PictureInPicture className="h-5 w-5" />
                        </Button>
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
                    (isHovered || isNativePiP) ? "opacity-0" : "opacity-60"
                )}>
                    <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 px-2 py-0.5 rounded-lg">
                        <span className="text-[10px] font-black text-blue-400 tracking-tighter uppercase">Waqfah Cinematic</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
