
'use client';

import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import YouTube, { type YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { X, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';

export function FloatingVideoPlayer() {
    const { videoTrack, videoPlayerRef, isPlayerVisible, hideVideoPlayer, pauseTrack } = useAudioPlayer();
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Set initial position when player becomes visible
        if (isPlayerVisible) {
            setPosition({
                x: window.innerWidth - 500 - 32, // 500 is default width, 32 is padding
                y: 80,
            });
        }
    }, [isPlayerVisible]);

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        videoPlayerRef.current = event.target;
    };
     const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        if (event.data === 1) { // playing
            pauseTrack();
        }
    };

    if (!isPlayerVisible || !videoTrack) {
        return null;
    }

    const handleDragEnd = (event: any) => {
        setPosition(({ x, y }) => ({
            x: x + event.delta.x,
            y: y + event.delta.y,
        }));
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <DraggableVideo
                position={position}
                onClose={hideVideoPlayer}
            >
                <YouTube
                    videoId={videoTrack.videoId}
                    opts={{
                        height: '100%',
                        width: '100%',
                        playerVars: {
                            autoplay: 1,
                            rel: 0,
                            controls: 1,
                            modestbranding: 1
                        },
                    }}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                />
            </DraggableVideo>
        </DndContext>
    );
}

function DraggableVideo({ children, position, onClose }: { children: React.ReactNode, position: { x: number, y: number }, onClose: () => void }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'draggable-video-player',
    });
    
    const style: React.CSSProperties = {
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="z-50 w-[500px] h-[300px] rounded-lg shadow-2xl bg-black overflow-hidden flex flex-col"
        >
            <div
                {...listeners}
                {...attributes}
                className="flex-shrink-0 h-8 w-full flex items-center justify-center text-white/50 cursor-move bg-black"
            >
                <GripVertical className="h-5 w-5" />
                 <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 text-white hover:bg-white/20">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-grow w-full h-full">
                {children}
            </div>
        </div>
    );
}
