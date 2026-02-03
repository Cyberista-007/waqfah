
'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useAudioPlayer } from './audio-player-provider';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function FloatingVideoPlayer() {
  const { videoTrack, isPlayerVisible, videoPlayerRef, hideVideoPlayer, pauseTrack } = useAudioPlayer();

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    videoPlayerRef.current = event.target;
    pauseTrack(); // Pause audio when video is ready to play
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // If video starts playing, pause the audio track
    if (event.data === 1) { // 1 = playing
      pauseTrack();
    }
  };
  
  useEffect(() => {
    // When the floating player becomes invisible, pause the video.
    if (!isPlayerVisible && videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
        videoPlayerRef.current.pauseVideo();
    }
  }, [isPlayerVisible, videoPlayerRef]);

  if (!videoTrack) { // Do not render if no video has ever been selected.
    return null;
  }

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      rel: 0,
    },
  };

  return (
    <div
      className={cn(
        "fixed top-20 right-8 z-50 overflow-auto rounded-lg bg-black shadow-2xl resize-both",
        "w-[50vw] h-[50vh] min-h-[200px] min-w-[300px] max-w-full transition-transform duration-300",
        isPlayerVisible ? "translate-x-0" : "translate-x-[150%]"
      )}
    >
      <div className="w-full h-full relative group">
          <YouTube
            videoId={videoTrack.videoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
          />
          <div className="absolute top-0 right-0 p-1 flex items-center gap-1 bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
                onClick={hideVideoPlayer}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-black/75 hover:text-white"
                aria-label="إغلاق المشغل"
            >
                <X className="h-5 w-5" />
            </Button>
          </div>
      </div>
    </div>
  );
}
