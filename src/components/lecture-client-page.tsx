'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, notFound, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Facebook, FileDown, Twitter, Youtube, Play, Notebook, Share2, Copy, ChevronsUpDown, X, Loader2, MessageCircle, Sparkles, Zap, Star, ShieldCheck, Headphones, Eye, Info, Layers, Shuffle, ListMusic, Repeat, Repeat1, Brain, Check, AlertCircle, Award, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureHeader } from '@/components/lecture-header';
import type { Lecture, ListenHistoryItem, Playlist } from '@/lib/types';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LectureCard } from './lecture-card';
import { downloadAudioForOffline, deleteAudioFromOffline, checkIsAudioOffline } from '@/lib/offline-audio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { DownloaderModal } from './downloader-modal';
import { getVideoIdFromUrl, formatDuration } from '@/lib/utils';
import { Html5Player } from './html5-player';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListVideo, SkipForward, SkipBack, FileText, PictureInPicture, Pause, Volume2, RotateCcw, RotateCw } from 'lucide-react';
import { LectureChapters } from '@/components/lecture-chapters';
import Image from 'next/image';
import Link from 'next/link';
import { getPlaceholderImage } from '@/lib/images';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import Magnetic from './magnetic';

const InteractiveTranscript = dynamic(() => import('@/components/interactive-transcript').then(mod => mod.InteractiveTranscript), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>,
    ssr: false
});
const LectureNotes = dynamic(() => import('@/components/lecture-notes').then(mod => mod.LectureNotes), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>,
    ssr: false
});
const CommentsSection = dynamic(() => import('@/components/comments-section').then(mod => mod.CommentsSection), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>,
    ssr: false
});

interface LectureClientPageProps {
    lecture: Lecture;
    relatedLectures: Lecture[];
    playlist?: Playlist;
}

const revealVariant: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export function LectureClientPage({ lecture, relatedLectures, playlist }: LectureClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlist');
  const userId = searchParams.get('u');
  const { playTrack, hidePlayer, playIframe, videoPlayerRef } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false);
  const [downloadFormats, setDownloadFormats] = useState([]);
  const [isFetchingFormats, setIsFetchingFormats] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [initialTime, setInitialTime] = useState(0);

  const [videoDuration, setVideoDuration] = useState(0);

  const videoId = useMemo(() => getVideoIdFromUrl(lecture?.youtubeUrl), [lecture?.youtubeUrl]);
  const isVideoAvailable = !!videoId;
  const [playMode, setPlayMode] = useState<'video' | 'audio'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('waqfah_lecture_play_mode') as 'video' | 'audio') || 'video';
    }
    return 'video';
  });
  const currentPlayMode = isVideoAvailable ? playMode : 'audio';
  const [isInlineAudioPlaying, setIsInlineAudioPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const inlineAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioYtPlayerRef = useRef<any>(null);
  const audioYtContainerRef = useRef<HTMLDivElement | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerFrameRef = useRef<number>(0);
  const visualizerStartRef = useRef<number>(Date.now());

  const playableAudioSrc = useMemo(() => {
    if (!lecture?.audioSrc) return '';
    const isYt = lecture.audioSrc.includes('youtube.com') || lecture.audioSrc.includes('youtu.be') || isVideoAvailable;
    // For YouTube-based lectures in audio mode, we use the hidden iframe approach (see below)
    // so we return empty string to avoid triggering a broken /api/download request
    if (isYt) return '';
    return lecture.audioSrc;
  }, [lecture?.audioSrc, isVideoAvailable]);

  // Poll video duration periodically
  useEffect(() => {
    if (currentPlayMode === 'video' && videoPlayerRef.current && typeof videoPlayerRef.current.getDuration === 'function') {
      try {
        const d = videoPlayerRef.current.getDuration();
        if (d > 0 && d !== videoDuration) {
          setVideoDuration(d);
        }
      } catch (e) {}
    }
  }, [playerCurrentTime, videoPlayerRef, videoDuration, currentPlayMode]);

  useEffect(() => {
    if (inlineAudioRef.current) {
      inlineAudioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  useEffect(() => {
    if (inlineAudioRef.current) {
      inlineAudioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (initialTime > 0 && inlineAudioRef.current) {
      inlineAudioRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  // Close sidebar by default on mobile/tablet screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Initialize hidden YT.Player for audio-only mode
  useEffect(() => {
    if (!videoId || currentPlayMode !== 'audio') return;
    if (!audioYtContainerRef.current) return;

    let pollInterval: NodeJS.Timeout;

    const initAudioPlayer = () => {
      if (audioYtPlayerRef.current?.destroy) {
        audioYtPlayerRef.current.destroy();
      }
      audioYtPlayerRef.current = new (window as any).YT.Player(audioYtContainerRef.current, {
        videoId,
        width: '0',
        height: '0',
        playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: (e: any) => {
            const dur = e.target.getDuration();
            if (dur > 0) setVideoDuration(dur);
            e.target.setVolume(audioVolume * 100);
            e.target.playVideo();
            setIsInlineAudioPlaying(true);
            // Poll current time every second
            pollInterval = setInterval(() => {
              if (!audioYtPlayerRef.current?.getCurrentTime) return;
              const t = audioYtPlayerRef.current.getCurrentTime();
              const d = audioYtPlayerRef.current.getDuration();
              setPlayerCurrentTime(t);
              if (d > 0) setVideoDuration(d);
            }, 500);
          },
          onStateChange: (e: any) => {
            if (e.data === 1) setIsInlineAudioPlaying(true);
            else if (e.data === 2 || e.data === 0) setIsInlineAudioPlaying(false);
            if (e.data === 0) handleVideoEnded();
          },
        },
      });
    };

    if (!(window as any).YT || !(window as any).YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = initAudioPlayer;
    } else {
      initAudioPlayer();
    }

    return () => {
      clearInterval(pollInterval);
      if (audioYtPlayerRef.current?.destroy) {
        audioYtPlayerRef.current.destroy();
        audioYtPlayerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, currentPlayMode]);

  // ── Media Session API — lock screen & background audio ──
  useEffect(() => {
    if (currentPlayMode !== 'audio' || !videoId) return;
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const artwork = getLectureImageUrl(lecture);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: lecture.title,
      artist: lecture.programName || lecture.seriesTitle || 'وقفة',
      album: lecture.seriesTitle || '',
      artwork: [
        { src: artwork, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      audioYtPlayerRef.current?.playVideo();
      setIsInlineAudioPlaying(true);
      navigator.mediaSession.playbackState = 'playing';
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audioYtPlayerRef.current?.pauseVideo();
      setIsInlineAudioPlaying(false);
      navigator.mediaSession.playbackState = 'paused';
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skip = details.seekOffset ?? 10;
      const cur = audioYtPlayerRef.current?.getCurrentTime?.() ?? 0;
      audioYtPlayerRef.current?.seekTo(Math.max(0, cur - skip), true);
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skip = details.seekOffset ?? 10;
      const cur = audioYtPlayerRef.current?.getCurrentTime?.() ?? 0;
      const dur = audioYtPlayerRef.current?.getDuration?.() ?? videoDuration;
      audioYtPlayerRef.current?.seekTo(Math.min(dur, cur + skip), true);
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        audioYtPlayerRef.current?.seekTo(details.seekTime, true);
        setPlayerCurrentTime(details.seekTime);
      }
    });

    return () => {
      // Clear handlers on unmount
      ['play', 'pause', 'seekbackward', 'seekforward', 'seekto'].forEach((action) => {
        try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, null); } catch {}
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayMode, videoId, lecture.title, videoDuration]);

  // Update Media Session playback state & position whenever time changes
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (currentPlayMode !== 'audio' || !videoId || videoDuration <= 0) return;
    try {
      navigator.mediaSession.playbackState = isInlineAudioPlaying ? 'playing' : 'paused';
      navigator.mediaSession.setPositionState({
        duration: videoDuration,
        playbackRate: playbackRate,
        position: Math.min(playerCurrentTime, videoDuration),
      });
    } catch {}
  }, [isInlineAudioPlaying, playerCurrentTime, videoDuration, playbackRate, currentPlayMode, videoId]);


  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BAR_COUNT = 40;
    // Pre-compute per-bar phase offsets & speed factors (deterministic, not random)
    const phases  = Array.from({ length: BAR_COUNT }, (_, i) => i * 0.42);
    const speeds  = Array.from({ length: BAR_COUNT }, (_, i) => 0.28 + (i % 7) * 0.04);
    const heights = new Float32Array(BAR_COUNT).fill(0.04); // current interpolated height

    const draw = (ts: number) => {
      const now = ts / 1000; // seconds
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const barW = (W / BAR_COUNT) * 0.68;
      const gap  = (W / BAR_COUNT) * 0.32;

      for (let i = 0; i < BAR_COUNT; i++) {
        // Target amplitude: two slow sine waves combined, range 0-1
        const target = isInlineAudioPlaying
          ? Math.abs(
              Math.sin(now * speeds[i]       + phases[i]) * 0.55 +
              Math.sin(now * speeds[i] * 0.5 + phases[i] * 1.7) * 0.45
            )
          : 0.04;

        // Lerp toward target — 8% per frame ≈ very smooth glide
        heights[i] += (target - heights[i]) * 0.08;

        const barH = Math.max(2, heights[i] * H * 0.88);
        const x = i * (barW + gap) + gap / 2;
        const y = H - barH;

        const grad = ctx.createLinearGradient(0, y, 0, H);
        const alpha = isInlineAudioPlaying ? 0.92 : 0.28;
        grad.addColorStop(0, `rgba(220, 38, 38, ${alpha})`);
        grad.addColorStop(1, `rgba(239, 68, 68, ${alpha * 0.3})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      }

      visualizerFrameRef.current = requestAnimationFrame(draw);
    };

    visualizerFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(visualizerFrameRef.current);
  }, [isInlineAudioPlaying]);

  // Generate deterministic heatmap path based on lectureId
  const heatmapPath = useMemo(() => {
    if (!lecture.id) return "";
    let seed = 0;
    for (let i = 0; i < lecture.id.length; i++) {
        seed += lecture.id.charCodeAt(i);
    }
    const points: number[] = [];
    for (let i = 0; i < 15; i++) {
        const val = 15 + ((Math.sin(seed + i * 1.9) + 1) / 2) * 70;
        points.push(Math.round(val));
    }
    let path = "M 0 100";
    const stepX = 1000 / (points.length - 1);
    for (let i = 0; i < points.length; i++) {
        const x = i * stepX;
        const y = 100 - points[i];
        if (i === 0) {
            path += ` L ${x} ${y}`;
        } else {
            const prevX = (i - 1) * stepX;
            const cpX1 = prevX + stepX / 2;
            const cpY1 = 100 - points[i - 1];
            const cpX2 = prevX + stepX / 2;
            const cpY2 = y;
            path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
        }
    }
    path += " L 1000 100 Z";
    return path;
  }, [lecture.id]);

  const handleHeatmapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    // In RTL layout, the beginning of the video is at the right edge
    const percentage = (width - clickX) / width;
    
    let totalDuration = videoDuration || lecture.duration || 3600;
    const targetTime = percentage * totalDuration;
    
    if (currentPlayMode === 'audio' && inlineAudioRef.current) {
        inlineAudioRef.current.currentTime = targetTime;
        if (inlineAudioRef.current.paused) {
            inlineAudioRef.current.play().catch(console.error);
        }
    } else if (videoPlayerRef.current && typeof videoPlayerRef.current.seekTo === 'function') {
        try {
            videoPlayerRef.current.seekTo(targetTime, true);
            const playerState = videoPlayerRef.current.getPlayerState();
            if (playerState !== 1) {
                videoPlayerRef.current.playVideo();
            }
        } catch (err) {
            console.error(err);
        }
    }
  };

  const historyDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'listenHistory', lecture.id) : null),
    [user, firestore, lecture.id]
  );
  const { data: lectureHistory } = useDoc<ListenHistoryItem>(historyDocRef);

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: allHistory } = useCollection<ListenHistoryItem>(listenHistoryPath);

  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists } = useCollection<Playlist>(playlistsPath);

  const [aiData, setAiData] = useState<{
    summary: string;
    keyTakeaways: string[];
    quiz: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [isOfflineDownloading, setIsOfflineDownloading] = useState(false);
  const [offlineDownloadProgress, setOfflineDownloadProgress] = useState(0);

  useEffect(() => {
    const checkCache = async () => {
      const isCached = await checkIsAudioOffline(playableAudioSrc);
      setIsOfflineCached(isCached);
    };
    checkCache();
  }, [playableAudioSrc]);

  const handleOfflineToggle = async () => {
    if (isOfflineCached) return;
    setIsOfflineDownloading(true);
    setOfflineDownloadProgress(0);
    try {
      const lectureToDownload = {
        ...lecture,
        audioSrc: playableAudioSrc
      };
      await downloadAudioForOffline(lectureToDownload, (progress) => {
        setOfflineDownloadProgress(progress);
      });
      setIsOfflineCached(true);
      toast({
        title: 'تم الحفظ للاستماع دون اتصال!',
        description: 'يمكنك الآن الاستماع لهذه المحاضرة في أي وقت بدون إنترنت.',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'فشل الحفظ دون اتصال',
        description: error.message || 'حدث خطأ غير متوقع.',
      });
    } finally {
      setIsOfflineDownloading(false);
    }
  };

  const handleDeleteOffline = async () => {
    try {
      await deleteAudioFromOffline(lecture.id, playableAudioSrc);
      setIsOfflineCached(false);
      toast({
        title: 'تم إزالة المحاضرة من الذاكرة المؤقتة',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'فشل حذف الملف',
        description: error.message,
      });
    }
  };

  const fetchAiSummary = async () => {
    if (aiData) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureSlug: lecture.slug })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء الاتصال بالخادم.');
      }
      setAiData(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'فشل تحميل التحليل الذكي للمحاضرة.');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const queryParams = new URLSearchParams(window.location.search);
        const t = parseInt(queryParams.get('t') || '0', 10);
        if (!isNaN(t) && t > 0) {
            setInitialTime(t);
            setPlayerCurrentTime(t); // also update generic time state
        }
        
        let path = window.location.href.split('?')[0];
        if (t > 0) path += `?t=${t}`;
        setShareUrl(path);
    }
  }, []);
  
  if (!lecture) notFound();

  const handlePlay = () => {
    hidePlayer();
    let startTime = 0;
    if (lectureHistory && lectureHistory.position && lectureHistory.duration && (lectureHistory.duration - lectureHistory.position) > 10 && lectureHistory.position > 5) {
        startTime = lectureHistory.position;
        toast({
            title: "تكملة الاستماع",
            description: `تم استئناف المحاضرة من حيث توقفت.`,
        });
    }
    playTrack({
      id: lecture.id,
      title: lecture.title,
      audioSrc: playableAudioSrc,
      imageId: lecture.imageId,
      seriesId: lecture.seriesId,
      seriesSlug: lecture.seriesSlug,
      seriesTitle: lecture.seriesTitle,
      slug: lecture.slug,
      programName: lecture.programName,
    }, startTime);
  };
  
  const handleWatchVideo = () => {
      if (videoId) {
          playIframe({ type: 'youtube', src: videoId, title: lecture.title, lectureId: lecture.id, seriesId: lecture.seriesId });
      }
  }

  const getLectureImageUrl = (item: Lecture) => {
    const vId = getVideoIdFromUrl(item.youtubeUrl);
    if (vId) return `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`;
    return getPlaceholderImage(item.imageId)?.imageUrl || `https://picsum.photos/seed/${item.slug}/600/400`;
  };

  const seriesLink = `/series/${lecture.seriesSlug}`;
  const shareText = `استمع إلى محاضرة "${lecture.title}"`;

  const handleCopyLink = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const path = window.location.href.split('?')[0];
    const time = currentPlayMode === 'audio' && inlineAudioRef.current
      ? Math.floor(inlineAudioRef.current.currentTime)
      : videoPlayerRef.current?.getCurrentTime 
        ? Math.floor(videoPlayerRef.current.getCurrentTime()) 
        : playerCurrentTime;
    const currentShareUrl = time > 0 ? `${path}?t=${time}` : path;

    try {
      await navigator.clipboard.writeText(currentShareUrl);
      toast({ title: 'تم نسخ الرابط!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
    }
  }, [playerCurrentTime, videoPlayerRef, toast, currentPlayMode]);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const path = window.location.href.split('?')[0];
    const time = currentPlayMode === 'audio' && inlineAudioRef.current
      ? Math.floor(inlineAudioRef.current.currentTime)
      : videoPlayerRef.current?.getCurrentTime 
        ? Math.floor(videoPlayerRef.current.getCurrentTime()) 
        : playerCurrentTime;
    const currentShareUrl = time > 0 ? `${path}?t=${time}` : path;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: currentShareUrl,
        });
      } catch (error) {
        console.log('Share was cancelled or failed.', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(currentShareUrl);
        toast({ title: 'تم نسخ الرابط!' });
      } catch (err) {
        toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
      }
    }
  }, [shareText, playerCurrentTime, videoPlayerRef, toast, currentPlayMode]);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (lecture.youtubeUrl) {
        setIsFetchingFormats(true);
        try {
            const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: lecture.youtubeUrl, getFormats: true }),
            });
            const data = await response.json();
            if (!response.status || response.status >= 400) {
                throw new Error(data.description || data.message || 'فشل في جلب صيغ التنزيل.');
            }
            if (data.formats && data.formats.length > 0) {
                setDownloadFormats(data.formats);
                setIsDownloaderOpen(true);
            } else {
                toast({ variant: 'destructive', title: 'لم يتم العثور على صيغ تنزيل متاحة.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: error.message });
        } finally {
            setIsFetchingFormats(false);
        }
        return;
    }
    const audioUrl = lecture.audioSrc;
    if (!audioUrl) {
        toast({ variant: 'destructive', title: 'رابط التحميل غير متوفر' });
        return;
    }
    try {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${lecture.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: 'بدأ التحميل!', description: 'جاري تحميل الملف الصوتي...' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء محاولة التنزيل' });
    }
  }, [lecture, toast]);

  const currentIndex = relatedLectures.findIndex(l => l.id === lecture.id);
  const prevLecture = currentIndex > 0 ? relatedLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex >= 0 && currentIndex < relatedLectures.length - 1 ? relatedLectures[currentIndex + 1] : null;

  const handleVideoEnded = useCallback(() => {
    if (repeatMode === 'one') {
        // Just reload the same page or trigger a restart
        window.location.reload();
        return;
    }

    if (isShuffle) {
        const otherLectures = relatedLectures.filter(l => l.id !== lecture.id);
        if (otherLectures.length > 0) {
            const randomIdx = Math.floor(Math.random() * otherLectures.length);
            const target = otherLectures[randomIdx];
            router.push(`/lectures/${target.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`);
            return;
        }
    }

    if (nextLecture) {
        router.push(`/lectures/${nextLecture.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`);
    } else if (repeatMode === 'all' && relatedLectures.length > 0) {
        const first = relatedLectures[0];
        router.push(`/lectures/${first.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`);
    }
  }, [repeatMode, isShuffle, relatedLectures, lecture.id, nextLecture, router, playlistId, userId]);

  return (
    <>
    {/* 🎭 Cinematic Backdrop Glow */}
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden hidden md:block">
        <div 
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] opacity-40 animate-pulse-subtle"
            style={{ animationDuration: '8s' }}
        />
        <div 
            className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[140px] opacity-30 animate-pulse-subtle"
            style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
    </div>

    <div className={cn("container mx-auto px-3 sm:px-6 py-4 md:py-8 space-y-6 md:space-y-12 transition-all duration-700", isTheaterMode && "max-w-none px-0 py-0")}>
      
      {/* 🎬 Cinematic Player & Playlist Layout */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={revealVariant}
        className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 bg-card/20 p-1.5 md:p-4 rounded-3xl md:rounded-[3rem] border border-white/5 shadow-2xl relative z-10 frosted-glass w-full backdrop-blur-3xl",
            isTheaterMode && "rounded-none border-none p-0 lg:gap-0 lg:h-screen"
        )}
      >
         {/* 🎥 Right Area: Main Video Player & Info */}
          <div className={cn(
             "order-1 flex flex-col gap-6 md:gap-8 transition-all duration-700 ease-in-out",
             isSidebarOpen ? "lg:col-span-9" : "lg:col-span-12",
             isTheaterMode && "lg:col-span-12"
          )}>
            <div className={cn(
                "relative bg-[#050505] rounded-3xl md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.6)] group flex items-center justify-center w-full transition-all duration-700",
                currentPlayMode === 'audio' 
                    ? "aspect-auto min-h-[480px] md:aspect-video md:min-h-0" 
                    : "aspect-video",
                isTheaterMode && "rounded-none h-screen aspect-auto"
            )}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
                
                {/* Mode Switcher Float (Audio / Video) - desktop only, mobile uses bottom switcher */}
                {isVideoAvailable && (
                  <div className="absolute top-4 left-4 z-20 hidden md:flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 gap-1 opacity-80 hover:opacity-100 transition-opacity">
                      <button
                          onClick={() => {
                              setPlayMode('video');
                              localStorage.setItem('waqfah_lecture_play_mode', 'video');
                              if (inlineAudioRef.current) {
                                  inlineAudioRef.current.pause();
                              }
                          }}
                          className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5",
                              currentPlayMode === 'video' 
                                  ? "bg-primary text-white" 
                                  : "text-white/60 hover:text-white"
                          )}
                      >
                          <ListVideo className="w-3.5 h-3.5" />
                          فيديو
                      </button>
                      <button
                          onClick={() => {
                              setPlayMode('audio');
                              localStorage.setItem('waqfah_lecture_play_mode', 'audio');
                              // Pause YouTube player if active
                              if (videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
                                  try {
                                      videoPlayerRef.current.pauseVideo();
                                  } catch (e) {}
                              }
                          }}
                          className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5",
                              currentPlayMode === 'audio' 
                                  ? "bg-primary text-white" 
                                  : "text-white/60 hover:text-white"
                          )}
                      >
                          <Headphones className="w-3.5 h-3.5" />
                          صوت
                      </button>
                  </div>
                )}

                {currentPlayMode === 'video' && videoId ? (
                <Html5Player 
                    videoId={videoId} 
                    title={lecture.title} 
                    thumbnailUrl={getLectureImageUrl(lecture)} 
                    className="w-full h-full rounded-none" 
                    startTime={initialTime}
                    onTimeUpdate={setPlayerCurrentTime}
                    onEnded={handleVideoEnded}
                    transcript={lecture.transcript}
                />
                ) : (
                  // Inline Audio Player UI!
                  <div className="w-full h-full flex flex-col md:flex-row items-center justify-between p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-[#0c0d12] to-[#040406]">
                      {/* Aura Ambient Background */}
                      <Image 
                        src={getLectureImageUrl(lecture)} 
                        fill 
                        className="object-cover opacity-20 blur-[80px] scale-125 select-none pointer-events-none" 
                        alt="audio-bg-glow" 
                      />

                      {/* Hidden YT.Player container for audio-only mode */}
                      {videoId ? (
                        <div ref={audioYtContainerRef} className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden />
                      ) : (
                        <audio
                          ref={inlineAudioRef}
                          src={playableAudioSrc}
                          preload="none"
                          onTimeUpdate={(e) => {
                            const time = e.currentTarget.currentTime;
                            setPlayerCurrentTime(time);
                          }}
                          onDurationChange={(e) => {
                            setVideoDuration(e.currentTarget.duration);
                          }}
                          onPlay={() => setIsInlineAudioPlaying(true)}
                          onPause={() => setIsInlineAudioPlaying(false)}
                          onEnded={handleVideoEnded}
                        />
                      )}

                      {/* Left/Center side: Cover Art & Equalizer */}
                      <div className="flex flex-col items-center md:items-start gap-4 md:gap-6 z-10 md:w-1/2">
                          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                              <Image
                                  src={getLectureImageUrl(lecture)}
                                  fill
                                  className={cn("object-cover transition-transform duration-700", isInlineAudioPlaying && "scale-105")}
                                  alt="Cover Art"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Headphones className="w-10 h-10 text-white" />
                              </div>
                          </div>

                          <div className="text-center md:text-right">
                              <h3 className="text-lg md:text-xl font-black text-white line-clamp-1 leading-snug">{lecture.title}</h3>
                              <p className="text-xs text-primary font-black mt-1">{lecture.seriesTitle}</p>
                          </div>
                      </div>

                      {/* Right side: Player Controls */}
                      <div className="flex flex-col justify-center items-center w-full md:w-1/2 gap-4 z-10 px-4 mt-4 md:mt-0">
                          {/* Canvas Audio Visualizer */}
                          <canvas
                              ref={visualizerCanvasRef}
                              width={320}
                              height={48}
                              className="w-full h-12 rounded-xl"
                          />

                          {/* Progress bar */}
                          <div className="w-full space-y-0.5">
                              <input
                                  type="range"
                                  min="0"
                                  max={videoDuration || 1}
                                  step="1"
                                  value={playerCurrentTime}
                                  onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setPlayerCurrentTime(val);
                                      if (videoId && audioYtPlayerRef.current?.seekTo) {
                                          audioYtPlayerRef.current.seekTo(val, true);
                                      } else if (inlineAudioRef.current) {
                                          inlineAudioRef.current.currentTime = val;
                                      }
                                  }}
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                              />
                              <div className="flex justify-between text-[9px] text-white/40 font-black">
                                  <span>{formatDuration(playerCurrentTime)}</span>
                                  <span>{formatDuration(videoDuration || lecture.duration || 0)}</span>
                              </div>
                          </div>

                          {/* Control Buttons */}
                          <div className="flex items-center gap-4">
                              {/* 10s back */}
                              <button
                                  onClick={() => {
                                      if (videoId && audioYtPlayerRef.current?.seekTo) {
                                          const cur = audioYtPlayerRef.current.getCurrentTime();
                                          audioYtPlayerRef.current.seekTo(Math.max(0, cur - 10), true);
                                      } else if (inlineAudioRef.current) {
                                          inlineAudioRef.current.currentTime = Math.max(0, inlineAudioRef.current.currentTime - 10);
                                      }
                                  }}
                                  className="p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all active:scale-95"
                                  title="تراجع 10 ثوانٍ"
                              >
                                  <RotateCcw className="w-4 h-4" />
                              </button>

                              {/* Play / Pause */}
                              <button
                                  onClick={() => {
                                      if (videoId && audioYtPlayerRef.current) {
                                          if (isInlineAudioPlaying) {
                                              audioYtPlayerRef.current.pauseVideo();
                                          } else {
                                              audioYtPlayerRef.current.playVideo();
                                          }
                                      } else if (inlineAudioRef.current) {
                                          if (isInlineAudioPlaying) {
                                              inlineAudioRef.current.pause();
                                          } else {
                                              inlineAudioRef.current.play().catch(console.error);
                                          }
                                      }
                                  }}
                                  className="p-4 rounded-full bg-primary text-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] active:scale-95"
                              >
                                  {isInlineAudioPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                              </button>

                              {/* 10s forward */}
                              <button
                                  onClick={() => {
                                      if (videoId && audioYtPlayerRef.current?.seekTo) {
                                          const cur = audioYtPlayerRef.current.getCurrentTime();
                                          audioYtPlayerRef.current.seekTo(Math.min(videoDuration, cur + 10), true);
                                      } else if (inlineAudioRef.current) {
                                          inlineAudioRef.current.currentTime = Math.min(videoDuration, inlineAudioRef.current.currentTime + 10);
                                      }
                                  }}
                                  className="p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all active:scale-95"
                                  title="تقدم 10 ثوانٍ"
                              >
                                  <RotateCw className="w-4 h-4" />
                              </button>
                          </div>

                          {/* Bottom controls row (Speed, Volume) */}
                          <div className="flex items-center justify-between w-full border-t border-white/5 pt-2">
                              {/* Speed selector */}
                              <div className="flex items-center gap-1">
                                  {['1x', '1.25x', '1.5x', '2x'].map((speedStr) => {
                                      const val = parseFloat(speedStr);
                                      return (
                                          <button
                                              key={speedStr}
                                              onClick={() => setPlaybackRate(val)}
                                              className={cn(
                                                  "px-2 py-0.5 rounded text-[9px] font-black transition-all border",
                                                  playbackRate === val 
                                                      ? "bg-primary text-white border-primary" 
                                                      : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white"
                                              )}
                                          >
                                              {speedStr}
                                          </button>
                                      );
                                  })}
                              </div>

                              {/* Volume selector */}
                              <div className="flex items-center gap-2">
                                  <Volume2 className="w-3.5 h-3.5 text-white/40" />
                                  <input
                                      type="range"
                                      min="0"
                                      max="1"
                                      step="0.05"
                                      value={audioVolume}
                                      onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                                      className="w-12 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
                )}
            </div>

            {/* 📈 Visual Progress Heatmap (Most Rewatched) */}
            {videoId && !isTheaterMode && (
                <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-5 -mt-2 md:-mt-4 shadow-xl backdrop-blur-xl relative overflow-hidden group/heatmap" dir="rtl">
                    {/* Background glow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-xs md:text-sm font-bold text-white/80 font-headline">
                                <span className="md:hidden">خريطة المشاهدة والتكرار</span>
                                <span className="hidden md:inline">خريطة المشاهدة والتكرار (Heatmap & Most Rewatched)</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-black">نشط الآن</span>
                        </div>
                    </div>

                    {/* Interactive Heatmap Progress Container */}
                    <div 
                        onClick={handleHeatmapClick}
                        className="relative h-12 sm:h-14 w-full cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04] hover:border-white/10"
                    >
                        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="heatmap-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
                                    <stop offset="50%" stopColor="rgb(147, 51, 234)" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={heatmapPath}
                                fill="url(#heatmap-gradient)"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        
                        {/* Dynamic Progress indicator overlay bar */}
                        <div 
                            className="absolute top-0 bottom-0 bg-primary/10 pointer-events-none"
                            style={{ right: 0, left: `${100 - (playerCurrentTime / (videoDuration || lecture.duration || 3600)) * 100}%` }}
                        />
                        
                        {/* Dynamic Current Playback Glow Line */}
                        <div 
                            className="absolute top-0 bottom-0 w-[2px] bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)] pointer-events-none transition-all duration-150"
                            style={{ right: `${(playerCurrentTime / (videoDuration || lecture.duration || 3600)) * 100}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-[9px] md:text-[11px] text-white/40 font-black">
                        <span>البداية</span>
                        <span className="text-white/60 font-bold bg-white/5 px-2 py-0.5 rounded hidden sm:inline">انقر على المنحنى للانتقال المباشر للمشهد</span>
                        <span className="text-white/60 font-bold bg-white/5 px-2 py-0.5 rounded sm:hidden">انقر للانتقال للمشهد</span>
                        <span>النهاية</span>
                    </div>
                </div>
            )}

            {/* 📝 Integrated Top Action Bar */}
            {!isTheaterMode && (
                <div className="flex flex-col gap-8 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" dir="rtl">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white font-headline leading-tight tracking-tighter">{lecture.title}</h1>
                            <div className="flex items-center gap-6">
                                <Link href={seriesLink} className="group/link flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 hover:bg-primary/20 transition-all">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-primary font-black text-sm">{lecture.seriesTitle}</span>
                                </Link>
                                <div className="flex items-center gap-4 text-muted-foreground/60 font-black text-xs uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> 2.4K</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> مباشر</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Mode Switcher inside Page Action Bar */}
                            {isVideoAvailable && (
                              <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-[2rem] gap-1.5 h-16 items-center">
                                  <button
                                      onClick={() => {
                                          setPlayMode('video');
                                          localStorage.setItem('waqfah_lecture_play_mode', 'video');
                                          if (inlineAudioRef.current) {
                                              inlineAudioRef.current.pause();
                                          }
                                      }}
                                      className={cn(
                                          "px-5 h-full rounded-2xl text-xs font-black transition-all flex items-center gap-2",
                                          currentPlayMode === 'video' 
                                              ? "bg-primary text-primary-foreground shadow-lg" 
                                              : "text-white/60 hover:text-white hover:bg-white/5"
                                      )}
                                  >
                                      <ListVideo className="w-4 h-4" />
                                      <span>مشاهدة فيديو</span>
                                  </button>
                                  <button
                                      onClick={() => {
                                          setPlayMode('audio');
                                          localStorage.setItem('waqfah_lecture_play_mode', 'audio');
                                          if (videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
                                              try {
                                                  videoPlayerRef.current.pauseVideo();
                                              } catch (e) {}
                                          }
                                      }}
                                      className={cn(
                                          "px-5 h-full rounded-2xl text-xs font-black transition-all flex items-center gap-2",
                                          currentPlayMode === 'audio' 
                                              ? "bg-primary text-primary-foreground shadow-lg" 
                                              : "text-white/60 hover:text-white hover:bg-white/5"
                                      )}
                                  >
                                      <Headphones className="w-4 h-4" />
                                      <span>استماع صوتي</span>
                                  </button>
                              </div>
                            )}

                            <Button 
                                onClick={handleDownload} 
                                disabled={isFetchingFormats}
                                className="flex-1 md:flex-none h-16 px-10 rounded-3xl bg-primary text-white font-black text-lg shadow-2xl shadow-primary/20 hover:scale-105 transition-all group"
                            >
                                {isFetchingFormats ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 transition-transform group-hover:-translate-y-1" />}
                                <span className="ms-3">تنزيل</span>
                            </Button>
                            
                            <Button 
                                onClick={() => setIsTheaterMode(true)}
                                className="h-16 w-16 md:w-auto md:px-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black transition-all shadow-xl group"
                                title="وضع السينما"
                            >
                                <Layers className="w-6 h-6 md:me-3 transition-transform group-hover:rotate-12" />
                                <span className="hidden md:inline">سينما</span>
                            </Button>

                            <Button 
                                onClick={handleWatchVideo}
                                className="h-16 w-16 md:w-auto md:px-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black transition-all shadow-xl group"
                                title="تفعيل المشغل العائم"
                            >
                                <PictureInPicture className="w-6 h-6 md:me-3 transition-transform group-hover:scale-110" />
                                <span className="hidden md:inline">مشغل عائم</span>
                            </Button>

                            {/* New Sidebar Toggle in Action Bar */}
                            <Button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={cn(
                                    "h-16 w-16 md:w-auto md:px-8 rounded-3xl border transition-all shadow-xl group",
                                    isSidebarOpen 
                                        ? "bg-primary/20 border-primary/30 text-primary" 
                                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                )}
                                title={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
                            >
                                <ListVideo className={cn("w-6 h-6 md:me-3 transition-transform", !isSidebarOpen && "animate-pulse")} />
                                <span className="hidden md:inline">{isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}</span>
                            </Button>

                            <Button 
                                onClick={handleShare}
                                aria-label="مشاركة المحاضرة"
                                className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all shadow-xl"
                            >
                                <Share2 className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>
             )}
          </div>

          <AnimatePresence>
          {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 50, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: 50, width: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={cn(
                "lg:col-span-3 order-2 flex flex-col bg-[#0f0f0f] rounded-3xl border border-white/5 overflow-hidden shadow-2xl h-[450px] lg:h-full transition-all duration-500",
                isTheaterMode && "hidden lg:flex lg:col-span-3 lg:rounded-none lg:border-l lg:h-screen lg:max-h-none"
            )}
          >
            <div className="p-4 border-b border-white/5 bg-[#1a1a1a] z-10">
               <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="font-black text-lg font-headline text-white line-clamp-1">
                        {playlist ? playlist.name : 'رحلة الاستماع'}
                    </h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                        {lecture.programName || 'Abdallah El Ghamry'} - {relatedLectures.findIndex(l => l.id === lecture.id) + 1} من {relatedLectures.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" aria-label="تغيير الاتجاه" className="rounded-full hover:bg-white/5 text-white/60 h-8 w-8">
                        <ChevronsUpDown className="w-4 h-4 rotate-90" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="إغلاق القائمة"
                        className="rounded-full hover:bg-white/5 text-white/60 h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={cn(
                        "rounded-full transition-all h-8 w-8",
                        isShuffle ? "bg-primary text-white shadow-lg" : "hover:bg-white/5 text-white/60"
                    )}
                    title={isShuffle ? "إيقاف الترتيب العشوائي" : "تشغيل الترتيب العشوائي"}
                    aria-label={isShuffle ? "إيقاف الترتيب العشوائي" : "تشغيل الترتيب العشوائي"}
                  >
                      <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                        if (repeatMode === 'none') setRepeatMode('all');
                        else if (repeatMode === 'all') setRepeatMode('one');
                        else setRepeatMode('none');
                    }}
                    className={cn(
                        "rounded-full transition-all h-8 w-8",
                        repeatMode !== 'none' ? "bg-primary text-white shadow-lg" : "hover:bg-white/5 text-white/60"
                    )}
                    title={repeatMode === 'none' ? "تكرار الكل" : repeatMode === 'all' ? "تكرار هذه الحلقة" : "إيقاف التكرار"}
                    aria-label={repeatMode === 'none' ? "تكرار الكل" : repeatMode === 'all' ? "تكرار هذه الحلقة" : "إيقاف التكرار"}
                  >
                      {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                  </Button>
               </div>
            </div>
            <ScrollArea className="flex-1">
               <div className="p-0">
                  {relatedLectures.map((item, idx) => {
                     const isCurrent = item.id === lecture.id;
                     const history = allHistory?.find(h => h.id === item.id);
                     const progress = history && history.duration ? (history.position / history.duration) * 100 : 0;

                     return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link 
                            href={`/lectures/${item.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`} 
                            className={cn(
                                "flex gap-4 p-4 hover:bg-white/[0.05] transition-all group items-center relative active:scale-[0.98]",
                                isCurrent ? "bg-white/[0.08]" : ""
                            )}
                          >
                              {/* Index / Indicator */}
                              <div className="w-6 flex shrink-0 items-center justify-center">
                                  {isCurrent ? (
                                      <Play className="w-3 h-3 text-white fill-current" />
                                  ) : (
                                      <span className="text-[10px] font-black text-white/30 group-hover:text-white/60 transition-colors">{idx + 1}</span>
                                  )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                 <h4 className={cn(
                                     "font-black text-sm line-clamp-2 transition-colors leading-relaxed",
                                     isCurrent ? "text-white" : "text-white/80 group-hover:text-white"
                                 )}>{item.title}</h4>
                                 <div className="mt-1">
                                     <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{item.programName || 'Abdallah El Ghamry'}</p>
                                 </div>
                              </div>

                              {/* Thumbnail */}
                              <div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-900 shadow-lg">
                                 <Image 
                                    src={getLectureImageUrl(item)} 
                                    alt={item.title} 
                                    fill 
                                    className={cn(
                                        "object-cover transition-all",
                                        isCurrent ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                                    )}
                                 />
                                 
                                 {/* Progress Bar Overlay */}
                                 {progress > 0 && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-red-600/30 w-full z-10">
                                        <div className="h-full bg-red-600" style={{ width: `${progress}%` }} />
                                    </div>
                                 )}

                                 <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded transition-opacity z-20">
                                     {formatDuration(item.duration ?? 0)}
                                 </div>
                              </div>
                          </Link>
                        </motion.div>
                     );
                  })}
               </div>
            </ScrollArea>
          </motion.div>
          )}
          </AnimatePresence>
      </motion.div>

      {/* 🚀 Next / Prev Navigation */}
      {(prevLecture || nextLecture) && !isTheaterMode && (
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={revealVariant}
           className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-4 shadow-xl relative z-10"
        >
          {nextLecture ? (
            <Button asChild variant="default" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg gap-3 order-1 sm:order-2 shadow-lg hover:scale-[1.02] transition-transform">
               <Link href={`/lectures/${nextLecture.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`}>
                 <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] text-white/70 uppercase tracking-widest font-black">المحطة التالية</span>
                    <span className="truncate max-w-[200px] block">{nextLecture.title}</span>
                 </div>
                 <SkipForward className="w-5 h-5 shrink-0" />
               </Link>
            </Button>
          ) : <div className="hidden sm:block order-2"></div>}
          
          {prevLecture ? (
            <Button asChild variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 font-bold text-lg gap-3 order-2 sm:order-1 transition-all">
               <Link href={`/lectures/${prevLecture.slug}`}>
                 <SkipBack className="w-5 h-5 shrink-0 text-muted-foreground" />
                 <div className="flex flex-col items-end leading-tight">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">المحطة السابقة</span>
                    <span className="truncate max-w-[200px] block">{prevLecture.title}</span>
                 </div>
               </Link>
            </Button>
          ) : <div className="hidden sm:block order-1"></div>}
        </motion.div>
      )}

      {/* 🧾 Lecture Bento Layout (Information, Tools, Share) */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariant}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10"
      >
        
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        عن هذه المحاضرة
                    </div>
                </div>
                <LectureHeader lecture={lecture} seriesLink={seriesLink} />
            </div>
        </div>

        {/* 📖 Chapters — show between Info and Tools when available */}
        {lecture.chapters && lecture.chapters.length > 0 && (
          <div className="lg:col-span-2">
            <LectureChapters
              chapters={lecture.chapters}
              currentTime={playerCurrentTime}
              onSeek={(t) => {
                if (currentPlayMode === 'audio' && inlineAudioRef.current) {
                  inlineAudioRef.current.currentTime = t;
                  if (inlineAudioRef.current.paused) {
                    inlineAudioRef.current.play().catch(console.error);
                  }
                } else if (videoPlayerRef.current && typeof videoPlayerRef.current.seekTo === 'function') {
                  try {
                    videoPlayerRef.current.seekTo(t, true);
                    const playerState = videoPlayerRef.current.getPlayerState();
                    if (playerState !== 1) {
                      videoPlayerRef.current.playVideo();
                    }
                  } catch (e) {
                    console.error("Error seeking via chapter click:", e);
                  }
                }
              }}
            />
          </div>
        )}

        {/* Tools & Share Stack */}
        <div className="flex flex-col gap-8">
            
            {/* Tools Card */}
            <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group flex-1">
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />
                <h3 className="text-2xl font-black mb-8 font-headline text-white flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                    المختبر العلمي
                </h3>
                <div className="flex flex-col gap-4 relative z-10">
                    <Button onClick={handleDownload} disabled={isFetchingFormats} className="w-full justify-between h-16 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all group/btn shadow-lg">
                        <div className="flex items-center">
                            {isFetchingFormats ? <Loader2 className="w-6 h-6 me-4 animate-spin text-blue-400" /> : <Download className="w-6 h-6 me-4 text-blue-400 transition-transform group-hover/btn:-translate-y-1" />}
                            <span className="font-black text-lg">تحميل المحاضرة</span>
                        </div>
                        <div className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">MP3/MP4</div>
                    </Button>
                    {lecture.pdfUrl && (
                        <Button asChild variant="secondary" className="w-full justify-between h-16 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all group/btn shadow-lg">
                            <a href={lecture.pdfUrl} download className="flex items-center w-full justify-between">
                                <div className="flex items-center">
                                    <FileDown className="w-6 h-6 me-4 text-emerald-400 transition-transform group-hover/btn:scale-110" />
                                    <span className="font-black text-lg">التفريغ النصي</span>
                                </div>
                                <div className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">PDF</div>
                            </a>
                        </Button>
                    )}
                    {lecture.audioSrc && (
                        <Button 
                            onClick={handleOfflineToggle} 
                            disabled={isOfflineDownloading}
                            className={cn(
                                "w-full justify-between h-16 px-6 rounded-2xl transition-all group/btn shadow-lg",
                                isOfflineCached 
                                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" 
                                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-foreground"
                            )}
                        >
                            <div className="flex items-center w-full justify-between">
                                <div className="flex items-center">
                                    {isOfflineDownloading ? (
                                        <Loader2 className="w-6 h-6 me-4 animate-spin text-primary" />
                                    ) : isOfflineCached ? (
                                        <Check className="w-6 h-6 me-4 text-emerald-400" />
                                    ) : (
                                        <Wifi className="w-6 h-6 me-4 text-primary transition-transform group-hover/btn:scale-110" />
                                    )}
                                    <span className="font-black text-lg">
                                        {isOfflineDownloading 
                                            ? `جاري الحفظ دون اتصال (${offlineDownloadProgress}%)` 
                                            : isOfflineCached 
                                                ? 'محفوظة للاستماع دون اتصال' 
                                                : 'حفظ للاستماع دون اتصال'}
                                    </span>
                                </div>
                                {isOfflineCached ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteOffline();
                                        }}
                                        className="text-xs font-black bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1 rounded-full border border-red-500/20 transition-colors z-20"
                                    >
                                        حذف من الجهاز
                                    </button>
                                ) : (
                                    <div className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">Offline</div>
                                )}
                            </div>
                        </Button>
                    )}
                </div>
            </section>
            
            {/* Share Card */}
            <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500" />
                <h3 className="text-2xl font-black mb-8 font-headline text-white flex items-center gap-3">
                    <Share2 className="w-6 h-6 text-emerald-400" />
                    نشر الخير
                </h3>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <Button asChild variant="outline" className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all p-4">
                        <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} data-action="share/whatsapp/share" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                            <MessageCircle className="w-8 h-8 text-[#25D366] fill-[#25D366]/20" />
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all p-4">
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                            <Facebook className="w-8 h-8 text-[#1877F2] fill-[#1877F2]/20" />
                        </a>
                    </Button>
                    <Button variant="outline" onClick={handleCopyLink} className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all">
                        <Copy className="w-6 h-6" />
                    </Button>
                    <Button variant="outline" onClick={handleShare} className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-primary/20 transition-all">
                        <Share2 className="w-6 h-6" />
                    </Button>
                </div>
            </section>

        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariant}
      >
        <Tabs defaultValue="transcript" className="w-full mt-10">
            <div className="flex justify-center mb-10">
                <TabsList className="grid max-w-3xl grid-cols-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] h-20 p-2 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <TabsTrigger value="transcript" className="rounded-[1.5rem] text-sm md:text-lg font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 md:me-2" /> التفريغ
                </TabsTrigger>
                <TabsTrigger value="ai" onClick={fetchAiSummary} className="rounded-[1.5rem] text-sm md:text-lg font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
                    <Brain className="w-4 h-4 md:w-5 md:h-5 md:me-2" /> الذكاء الاصطناعي
                </TabsTrigger>
                <TabsTrigger value="notes" disabled={!user} className="rounded-[1.5rem] text-sm md:text-lg font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
                    ملاحظاتي
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-[1.5rem] text-sm md:text-lg font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
                    التعليقات
                </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="transcript" className="mt-0 outline-none">
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
                    <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-white/5 pb-10">
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-primary/20 rounded-[2rem] shadow-inner">
                                <FileText className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black font-headline text-white tracking-tighter">التفريغ النصي التفاعلي</h2>
                                <p className="text-muted-foreground text-lg font-bold mt-1 opacity-70 italic">مُزامنة ذكية، اضغط على أي جملة للانتقال إليها مباشرة.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                        <InteractiveTranscript transcript={lecture.transcript || []} />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 outline-none">
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
                    
                    <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-white/5 pb-10">
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-primary/20 rounded-[2rem] shadow-inner">
                                <Brain className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black font-headline text-white tracking-tighter">المساعد التعليمي الذكي</h2>
                                <p className="text-muted-foreground text-lg font-bold mt-1 opacity-70 italic">تلخيص ذكي للمحاضرة واختبارات تفاعلية لقياس الفهم.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 min-h-[300px]">
                        {isAiLoading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="animate-spin h-12 w-12 text-primary" />
                                <p className="text-muted-foreground font-bold text-lg">جاري تحليل المحاضرة وتلخيصها وتوليد الاختبار...</p>
                            </div>
                        )}

                        {aiError && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                                <h3 className="text-2xl font-black text-white mb-2">فشل التحليل الذكي</h3>
                                <p className="text-muted-foreground font-bold max-w-md">{aiError}</p>
                                <Button onClick={fetchAiSummary} className="mt-6 rounded-xl">إعادة المحاولة</Button>
                            </div>
                        )}

                        {!isAiLoading && !aiError && !aiData && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Brain className="w-20 h-20 text-white/10 mb-6" />
                                <h3 className="text-2xl font-black text-white/50 mb-2">الملخص الذكي والاختبار</h3>
                                <p className="text-muted-foreground font-bold max-w-md mb-8">اضغط على زر التوليد لبدء تحليل المحاضرة بالذكاء الاصطناعي والحصول على ملخص شامل واختبار فهم ذاتي.</p>
                                <Button onClick={fetchAiSummary} className="rounded-2xl h-14 px-8 font-black text-lg bg-primary hover:bg-primary/95 text-white">توليد التلخيص الذكي</Button>
                            </div>
                        )}

                        {aiData && (
                            <div className="space-y-12" dir="rtl">
                                {/* Summary Section */}
                                <section className="space-y-6 text-right">
                                    <h3 className="text-2xl font-black text-white font-headline border-r-4 border-primary pr-3 leading-none">الملخص العام للمحاضرة</h3>
                                    <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 text-zinc-300 text-lg leading-relaxed whitespace-pre-line font-medium">
                                        {aiData.summary}
                                    </div>
                                </section>

                                {/* Key Takeaways */}
                                {aiData.keyTakeaways && aiData.keyTakeaways.length > 0 && (
                                    <section className="space-y-6 text-right">
                                        <h3 className="text-2xl font-black text-white font-headline border-r-4 border-primary pr-3 leading-none">الفوائد والفرائد المستخلصة</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {aiData.keyTakeaways.map((takeaway, idx) => (
                                                <div key={idx} className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden group">
                                                    <span className="absolute -top-4 -left-4 text-8xl font-black text-primary/5 select-none">{idx + 1}</span>
                                                    <span className="inline-flex items-center justify-center h-10 w-10 bg-primary/20 rounded-xl mb-4 text-primary font-black">{idx + 1}</span>
                                                    <p className="text-zinc-200 text-base font-bold leading-relaxed relative z-10">{takeaway}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Interactive Quiz */}
                                {aiData.quiz && aiData.quiz.length > 0 && (
                                    <section className="space-y-6 pt-6 border-t border-white/5 text-right">
                                        <div className="flex items-center gap-3 justify-start">
                                            <Award className="w-7 h-7 text-amber-500" />
                                            <h3 className="text-2xl font-black text-white font-headline leading-none">اختبر فهمك للدرس</h3>
                                        </div>
                                        <p className="text-muted-foreground font-medium text-base">أسئلة تفاعلية مبنية على محتوى الدرس، اختر الإجابة المناسبة وتعرف على مستواك.</p>

                                        <div className="space-y-8 mt-6">
                                            {aiData.quiz.map((q, qIdx) => {
                                                const isAnswered = selectedAnswers[qIdx] !== undefined;
                                                const selectedOpt = selectedAnswers[qIdx];
                                                
                                                return (
                                                    <div key={qIdx} className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 space-y-4">
                                                        <h4 className="text-xl font-black text-white leading-relaxed">السؤال {qIdx + 1}: {q.question}</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {q.options.map((opt, optIdx) => {
                                                                const isSelected = selectedOpt === optIdx;
                                                                const isCorrectOpt = q.correctAnswer === optIdx;
                                                                
                                                                let optBg = "bg-white/5 hover:bg-white/10 text-white/90 border-white/10";
                                                                if (isAnswered) {
                                                                    if (isCorrectOpt) {
                                                                        optBg = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold";
                                                                    } else if (isSelected) {
                                                                        optBg = "bg-red-500/20 text-red-400 border-red-500/40 font-bold";
                                                                    } else {
                                                                        optBg = "bg-white/2 text-white/40 border-white/5";
                                                                    }
                                                                }

                                                                return (
                                                                    <button
                                                                        key={optIdx}
                                                                        disabled={isAnswered}
                                                                        onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                                                        className={cn(
                                                                            "w-full text-right p-4 rounded-xl border text-base font-bold transition-all flex items-center justify-between",
                                                                            optBg
                                                                        )}
                                                                    >
                                                                        <span>{opt}</span>
                                                                        {isAnswered && isCorrectOpt && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
                                                                        {isAnswered && isSelected && !isCorrectOpt && <X className="w-5 h-5 text-red-400 shrink-0" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        {isAnswered && (
                                                            <div className="mt-4 p-4 bg-primary/10 rounded-2xl border border-primary/20 space-y-1">
                                                                <span className="text-xs font-black text-primary uppercase tracking-widest block">الشرح والتوضيح:</span>
                                                                <p className="text-sm text-zinc-300 leading-relaxed font-bold">{q.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 outline-none">
            {user ? (
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
                    <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-white/5 pb-10">
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-primary/20 rounded-[2rem] shadow-inner">
                                <Notebook className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black font-headline text-white tracking-tighter">مختبر الملاحظات</h2>
                                <p className="text-muted-foreground text-lg font-bold mt-1 opacity-70 italic">سجل فوائدك الربانية هنا.. فهي ذخرك الحقيقي.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> مشفرة بالكامل
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <LectureNotes lecture={lecture} userId={user.uid} />
                    </div>
                </div>
            ) : (
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-24 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                <Notebook className="h-24 w-24 text-muted-foreground/20 mb-8" />
                <h3 className="text-3xl font-black font-headline mb-4 text-white">تحتاج لمفتاح لدخول هذا المختبر</h3>
                <p className="text-xl text-muted-foreground max-w-md mb-10 font-bold opacity-60 italic leading-relaxed">الرجاء تسجيل الدخول لتتمكن من كتابة وحفظ ومراجعة ملاحظاتك الخاصة على هذه المحاضرة في مساحتك السرية.</p>
                <Button asChild className="rounded-2xl px-12 h-16 text-xl font-black shadow-2xl shadow-primary/30" size="lg">
                    <Link href={`/auth/login?redirect_to=/lectures/${lecture.slug}`}>تسجيل الدخول الآن</Link>
                </Button>
                </div>
            )}
            </TabsContent>

            <TabsContent value="comments" className="mt-0 outline-none">
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
                <div className="relative z-10">
                    <CommentsSection lectureId={lecture.id} />
                </div>
            </div>
            </TabsContent>
        </Tabs>
      </motion.div>

    </div>
    <DownloaderModal
        isOpen={isDownloaderOpen}
        onOpenChange={setIsDownloaderOpen}
        formats={downloadFormats}
        title={lecture.title}
        videoId={videoId}
    />
    </>
  );
}
