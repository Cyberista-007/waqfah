"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from './audio-player-provider';
import { Download, Loader2, PictureInPicture, Play, Pause, RotateCcw, RotateCw, Volume2, Captions, Maximize2, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DownloaderModal } from "./downloader-modal";

// Import CSS only on client side
// Import Plyr dynamically for client-side only
const Plyr = dynamic<any>(() => import("plyr-react").then((mod: any) => mod.default || mod.Plyr || mod), {
  ssr: false
});

import "plyr/dist/plyr.css";

interface Html5PlayerProps {
  videoId?: string | null;
  title?: string;
  thumbnailUrl?: string;
  className?: string;
  startTime?: number;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  transcript?: any[];
}

export function Html5Player({ videoId, title, thumbnailUrl, className, startTime = 0, onTimeUpdate, onEnded, transcript }: Html5PlayerProps) {

  const [mounted, setMounted] = useState(false);
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false);
  const [formats, setFormats] = useState<any[]>([]);
  const [isFetchingFormats, setIsFetchingFormats] = useState(false);

  // Playback State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Robustly extract video ID if it's a full URL
  const getCleanVideoId = (idOrUrl: string) => {
    if (!idOrUrl) return null;
    if (idOrUrl.includes('youtube.com') || idOrUrl.includes('youtu.be')) {
      const match = idOrUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:$|&|#|\/)/);
      return match ? match[1] : idOrUrl;
    }
    return idOrUrl.trim();
  };

  const cleanVideoId = videoId ? getCleanVideoId(videoId) : null;

  const fetchFormats = async () => {
    if (!cleanVideoId) return;
    setIsFetchingFormats(true);
    try {
      const response = await fetch(`/api/youtube-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${cleanVideoId}`,
          getFormats: true
        })
      });
      const data = await response.json();
      if (data.formats) {
        setFormats(data.formats);
        setIsDownloaderOpen(true);
      }
    } catch (error) {
      console.error("Error fetching formats:", error);
    } finally {
      setIsFetchingFormats(false);
    }
  };

  // Native YouTube API Integration
  useEffect(() => {
    if (!mounted || !cleanVideoId) return;

    let timeUpdateInterval: NodeJS.Timeout;

    const initYouTubePlayer = () => {
      ytPlayerRef.current = new (window as any).YT.Player(playerContainerRef.current, {
        videoId: cleanVideoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 0,
          cc_load_policy: 1,
          hl: 'ar'
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            
            // Start polling time for Karaoke sync
            timeUpdateInterval = setInterval(() => {
              if (event.target?.getCurrentTime) {
                const time = event.target.getCurrentTime();
                setCurrentTime(time);
                if (onTimeUpdate) onTimeUpdate(time);
              }
            }, 250);
          },
          onStateChange: (event: any) => {
            // 0 = ended, 1 = playing, 2 = paused
            if (event.data === 1) setIsPlaying(true);
            else if (event.data === 2) setIsPlaying(false);
            else if (event.data === 0 && onEnded) onEnded();
          }
        }
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        initYouTubePlayer();
      };
    } else {
      initYouTubePlayer();
    }

    return () => {
      if (timeUpdateInterval) clearInterval(timeUpdateInterval);
      if (ytPlayerRef.current?.destroy) {
        ytPlayerRef.current.destroy();
      }
    };
  }, [mounted, cleanVideoId]);



  const { playIframe } = useAudioPlayer();
  const { toast } = useToast();

  const handlePiP = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!cleanVideoId) return;

    // Pause the main video
    if (ytPlayerRef.current?.pauseVideo) {
      ytPlayerRef.current.pauseVideo();
    }

    toast({
      title: "تم تفعيل المشغل العائم",
      description: "يمكنك الآن متابعة المشاهدة أثناء تصفح الموقع.",
    });

    // Trigger the in-page cinematic floating player
    playIframe({
      type: 'youtube',
      src: cleanVideoId,
      title: title || "محاضرة وقفة",
      lectureId: typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : undefined
    });
  };

  const auraImageUrl = thumbnailUrl || (cleanVideoId ? `https://img.youtube.com/vi/${cleanVideoId}/maxresdefault.jpg` : null);

  return (
    <div
      className={cn("relative w-full aspect-video group", className)}
      dir="ltr"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 🔮 High-End Cinematic AmbiLight Aura (Refined) */}
      {auraImageUrl && mounted && (
        <div className="absolute inset-[-15%] z-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-700">
          {/* Layer 1: Intense Core Glow */}
          <motion.img
            src={auraImageUrl}
            alt=""
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: isPlaying ? [0.6, 0.9, 0.6] : 0.5
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 w-full h-full object-cover blur-[60px] saturate-[2.5] brightness-125"
          />
          
          {/* Layer 2: Wide Ambient Bloom */}
          <motion.img
            src={auraImageUrl}
            alt=""
            animate={{ 
              scale: [1.3, 1.2, 1.3],
              rotate: [0, 2, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 w-full h-full object-cover blur-[100px] saturate-[2] opacity-40 mix-blend-plus-lighter"
          />
        </div>
      )}

      <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-black ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 transition-transform duration-700 hover:scale-[1.005]">
        <div className="w-full h-full border-none">
          {mounted ? (
            <div ref={playerContainerRef} className="w-full h-full border-none outline-none" />
          ) : (
            <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center rounded-3xl">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
        </div>



        {/* Modern Integrated Top Buttons (Download & PiP) */}
        <div className="absolute top-4 left-4 z-50 pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
          <button
            onClick={handlePiP}
            className="flex items-center justify-center p-2.5 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-primary hover:scale-105 transition-all shadow-2xl cursor-pointer pointer-events-auto"
            title="تفعيل المشغل العائم"
          >
            <PictureInPicture className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); fetchFormats(); }}
            disabled={isFetchingFormats}
            className="flex items-center gap-2 px-5 py-2.5 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-primary/90 hover:scale-105 transition-all shadow-2xl font-bold text-xs"
          >
            {isFetchingFormats ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                جاري الطلب...
              </span>
            ) : (
              <>
                <Download className="h-4 w-4" /> تنزيل الفيديو
              </>
            )}
          </button>
        </div>

        <DownloaderModal
          isOpen={isDownloaderOpen}
          onOpenChange={setIsDownloaderOpen}
          formats={formats}
          title={title || "فيديو"}
          videoId={cleanVideoId}
        />

        </div>
    </div>
  );
}
