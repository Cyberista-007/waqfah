'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Facebook,
  FileDown,
  Play,
  Notebook,
  Share2,
  Copy,
  X,
  Loader2,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Headphones,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  Shuffle,
  Repeat,
  Repeat1,
  Brain,
  Check,
  AlertCircle,
  Award,
  Wifi,
  ListVideo,
  SkipForward,
  SkipBack,
  FileText,
  PictureInPicture,
  Pause,
  Volume2,
  RotateCcw,
  RotateCw,
  Clock,
  Trash2,
} from 'lucide-react';
import { doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LectureHeader } from '@/components/lecture-header';
import { LectureChapters } from '@/components/lecture-chapters';
import { DownloaderModal } from './downloader-modal';
import { Html5Player } from './html5-player';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { downloadAudioForOffline, deleteAudioFromOffline, checkIsAudioOffline } from '@/lib/offline-audio';
import { getVideoIdFromUrl, formatDuration, formatViews, cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/images';
import type { Lecture, ListenHistoryItem, Playlist } from '@/lib/types';

const InteractiveTranscript = dynamic(
  () => import('@/components/interactive-transcript').then((mod) => mod.InteractiveTranscript),
  {
    loading: () => (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-7 w-7 text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

const LectureNotes = dynamic(
  () => import('@/components/lecture-notes').then((mod) => mod.LectureNotes),
  {
    loading: () => (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-7 w-7 text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

const CommentsSection = dynamic(
  () => import('@/components/comments-section').then((mod) => mod.CommentsSection),
  {
    loading: () => (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-7 w-7 text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

interface LectureClientPageProps {
  lecture: Lecture;
  relatedLectures: Lecture[];
  playlist?: Playlist;
}

export function LectureClientPage({ lecture, relatedLectures, playlist }: LectureClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlist');
  const userId = searchParams.get('u');
  const { playIframe, videoPlayerRef } = useAudioPlayer();
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

  const playableAudioSrc = useMemo(() => {
    if (!lecture?.audioSrc) return '';
    const isYt =
      lecture.audioSrc.includes('youtube.com') ||
      lecture.audioSrc.includes('youtu.be') ||
      isVideoAvailable;
    if (isYt) return '';
    return lecture.audioSrc;
  }, [lecture?.audioSrc, isVideoAvailable]);

  const getLectureImageUrl = useCallback((item: Lecture) => {
    const vId = getVideoIdFromUrl(item.youtubeUrl);
    if (vId) return `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`;
    return getPlaceholderImage(item.imageId)?.imageUrl || `https://picsum.photos/seed/${item.slug}/600/400`;
  }, []);

  // Poll video duration periodically
  useEffect(() => {
    if (
      currentPlayMode === 'video' &&
      videoPlayerRef.current &&
      typeof videoPlayerRef.current.getDuration === 'function'
    ) {
      try {
        const d = videoPlayerRef.current.getDuration();
        if (d > 0 && d !== videoDuration) {
          setVideoDuration(d);
        }
      } catch {}
    }
  }, [playerCurrentTime, videoPlayerRef, videoDuration, currentPlayMode]);

  useEffect(() => {
    if (inlineAudioRef.current) {
      inlineAudioRef.current.volume = audioVolume;
    }
    if (audioYtPlayerRef.current?.setVolume) {
      try {
        audioYtPlayerRef.current.setVolume(audioVolume * 100);
      } catch {}
    }
  }, [audioVolume]);

  useEffect(() => {
    if (inlineAudioRef.current) {
      inlineAudioRef.current.playbackRate = playbackRate;
    }
    if (audioYtPlayerRef.current?.setPlaybackRate) {
      try {
        audioYtPlayerRef.current.setPlaybackRate(playbackRate);
      } catch {}
    }
  }, [playbackRate]);

  useEffect(() => {
    if (initialTime > 0 && inlineAudioRef.current) {
      inlineAudioRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const currentIndex = relatedLectures.findIndex((l) => l.id === lecture.id);
  const prevLecture = currentIndex > 0 ? relatedLectures[currentIndex - 1] : null;
  const nextLecture =
    currentIndex >= 0 && currentIndex < relatedLectures.length - 1
      ? relatedLectures[currentIndex + 1]
      : null;

  const handleVideoEnded = useCallback(() => {
    if (repeatMode === 'one') {
      window.location.reload();
      return;
    }

    if (isShuffle) {
      const otherLectures = relatedLectures.filter((l) => l.id !== lecture.id);
      if (otherLectures.length > 0) {
        const randomIdx = Math.floor(Math.random() * otherLectures.length);
        const target = otherLectures[randomIdx];
        router.push(
          `/lectures/${target.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`
        );
        return;
      }
    }

    if (nextLecture) {
      router.push(
        `/lectures/${nextLecture.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`
      );
    } else if (repeatMode === 'all' && relatedLectures.length > 0) {
      const first = relatedLectures[0];
      router.push(
        `/lectures/${first.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`
      );
    }
  }, [repeatMode, isShuffle, relatedLectures, lecture.id, nextLecture, router, playlistId, userId]);

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

  // Media Session API for background / lock-screen controls
  useEffect(() => {
    if (currentPlayMode !== 'audio' || !videoId) return;
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const artwork = getLectureImageUrl(lecture);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: lecture.title,
      artist: lecture.programName || lecture.seriesTitle || 'وقفة',
      album: lecture.seriesTitle || '',
      artwork: [{ src: artwork, sizes: '512x512', type: 'image/jpeg' }],
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
      ['play', 'pause', 'seekbackward', 'seekforward', 'seekto'].forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action as MediaSessionAction, null);
        } catch {}
      });
    };
  }, [currentPlayMode, videoId, lecture, videoDuration, getLectureImageUrl]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (currentPlayMode !== 'audio' || !videoId || videoDuration <= 0) return;
    try {
      navigator.mediaSession.playbackState = isInlineAudioPlaying ? 'playing' : 'paused';
      navigator.mediaSession.setPositionState({
        duration: videoDuration,
        playbackRate,
        position: Math.min(playerCurrentTime, videoDuration),
      });
    } catch {}
  }, [isInlineAudioPlaying, playerCurrentTime, videoDuration, playbackRate, currentPlayMode, videoId]);

  // Canvas audio visualizer
  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BAR_COUNT = 40;
    const phases = Array.from({ length: BAR_COUNT }, (_, i) => i * 0.42);
    const speeds = Array.from({ length: BAR_COUNT }, (_, i) => 0.28 + (i % 7) * 0.04);
    const heights = new Float32Array(BAR_COUNT).fill(0.05);

    const draw = (ts: number) => {
      const now = ts / 1000;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const barW = (W / BAR_COUNT) * 0.65;
      const gap = (W / BAR_COUNT) * 0.35;

      for (let i = 0; i < BAR_COUNT; i++) {
        const target = isInlineAudioPlaying
          ? Math.abs(
              Math.sin(now * speeds[i] + phases[i]) * 0.55 +
                Math.sin(now * speeds[i] * 0.5 + phases[i] * 1.7) * 0.45
            )
          : 0.06;

        heights[i] += (target - heights[i]) * 0.08;
        const barH = Math.max(3, heights[i] * H * 0.88);
        const x = i * (barW + gap) + gap / 2;
        const y = H - barH;

        const grad = ctx.createLinearGradient(0, y, 0, H);
        const alpha = isInlineAudioPlaying ? 0.92 : 0.3;
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

  const historyDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'listenHistory', lecture.id) : null),
    [user, firestore, lecture.id]
  );
  useDoc<ListenHistoryItem>(historyDocRef);

  const listenHistoryPath = user ? `users/${user.uid}/listenHistory` : null;
  const { data: allHistory } = useCollection<ListenHistoryItem>(listenHistoryPath);

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
      await downloadAudioForOffline({ ...lecture, audioSrc: playableAudioSrc }, (progress) => {
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
      toast({ title: 'تمت إزالة المحاضرة من الذاكرة المؤقتة' });
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
        body: JSON.stringify({ lectureSlug: lecture.slug }),
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
        setPlayerCurrentTime(t);
      }

      let path = window.location.href.split('?')[0];
      if (t > 0) path += `?t=${t}`;
      setShareUrl(path);
    }
  }, []);

  if (!lecture) notFound();

  const switchPlayMode = (mode: 'video' | 'audio') => {
    setPlayMode(mode);
    localStorage.setItem('waqfah_lecture_play_mode', mode);
    if (mode === 'video' && inlineAudioRef.current) {
      inlineAudioRef.current.pause();
    }
    if (mode === 'audio' && videoPlayerRef.current && typeof videoPlayerRef.current.pauseVideo === 'function') {
      try {
        videoPlayerRef.current.pauseVideo();
      } catch {}
    }
  };

  const handleWatchVideo = () => {
    if (videoId) {
      playIframe({
        type: 'youtube',
        src: videoId,
        title: lecture.title,
        lectureId: lecture.id,
        seriesId: lecture.seriesId,
      });
    }
  };

  const seriesLink = `/series/${lecture.seriesSlug}`;
  const shareText = `استمع إلى محاضرة "${lecture.title}"`;

  const getCurrentShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const path = window.location.href.split('?')[0];
    const time =
      currentPlayMode === 'audio' && inlineAudioRef.current
        ? Math.floor(inlineAudioRef.current.currentTime)
        : videoPlayerRef.current?.getCurrentTime
          ? Math.floor(videoPlayerRef.current.getCurrentTime())
          : Math.floor(playerCurrentTime);
    return time > 0 ? `${path}?t=${time}` : path;
  }, [currentPlayMode, playerCurrentTime, videoPlayerRef]);

  const handleCopyLink = useCallback(async () => {
    const url = getCurrentShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'تم نسخ الرابط!' });
    } catch {
      toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
    }
  }, [getCurrentShareUrl, toast]);

  const handleShare = useCallback(async () => {
    const url = getCurrentShareUrl();
    if (!url) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'تم نسخ الرابط!' });
    } catch {
      toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
    }
  }, [getCurrentShareUrl, shareText, toast]);

  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
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
      } catch {
        toast({ variant: 'destructive', title: 'حدث خطأ أثناء محاولة التنزيل' });
      }
    },
    [lecture, toast]
  );

  const seekAudio = (deltaSeconds: number) => {
    if (videoId && audioYtPlayerRef.current?.seekTo) {
      const cur = audioYtPlayerRef.current.getCurrentTime();
      const dur = videoDuration || audioYtPlayerRef.current.getDuration?.() || 0;
      const target = Math.max(0, Math.min(dur || Infinity, cur + deltaSeconds));
      audioYtPlayerRef.current.seekTo(target, true);
      setPlayerCurrentTime(target);
    } else if (inlineAudioRef.current) {
      const target = Math.max(
        0,
        Math.min(videoDuration || Infinity, inlineAudioRef.current.currentTime + deltaSeconds)
      );
      inlineAudioRef.current.currentTime = target;
      setPlayerCurrentTime(target);
    }
  };

  const toggleAudioPlay = () => {
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
  };

  const handleSeekToTime = (t: number) => {
    if (currentPlayMode === 'audio') {
      if (videoId && audioYtPlayerRef.current?.seekTo) {
        audioYtPlayerRef.current.seekTo(t, true);
        audioYtPlayerRef.current.playVideo();
      } else if (inlineAudioRef.current) {
        inlineAudioRef.current.currentTime = t;
        if (inlineAudioRef.current.paused) {
          inlineAudioRef.current.play().catch(console.error);
        }
      }
      setPlayerCurrentTime(t);
    } else if (videoPlayerRef.current && typeof videoPlayerRef.current.seekTo === 'function') {
      try {
        videoPlayerRef.current.seekTo(t, true);
        const playerState = videoPlayerRef.current.getPlayerState();
        if (playerState !== 1) {
          videoPlayerRef.current.playVideo();
        }
      } catch (err) {
        console.error('Error seeking via chapter click:', err);
      }
    }
  };

  return (
    <>
      <div
        className={cn(
          'mx-auto transition-all duration-500',
          isTheaterMode ? 'w-full max-w-none px-0 py-0' : 'container px-3 sm:px-6 py-5 md:py-8 space-y-8'
        )}
        dir="rtl"
      >
        {/* ── 1. MEDIA STAGE + PLAYLIST SIDEBAR ── */}
        <div
          className={cn(
            'grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch',
            isTheaterMode && 'gap-0 lg:h-screen'
          )}
        >
          {/* Main Player Stage */}
          <div
            className={cn(
              'order-1 flex flex-col gap-4 transition-all duration-500',
              isSidebarOpen && !isTheaterMode ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'
            )}
          >
            <div
              className={cn(
                'relative bg-black overflow-hidden border border-border/60 shadow-2xl flex items-center justify-center w-full',
                isTheaterMode
                  ? 'rounded-none h-screen border-none'
                  : currentPlayMode === 'audio'
                    ? 'rounded-2xl md:rounded-3xl min-h-[420px] md:aspect-video md:min-h-0'
                    : 'rounded-2xl md:rounded-3xl aspect-video'
              )}
            >
              {/* Floating Mode Switcher & Theater Exit */}
              <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
                {isVideoAvailable && (
                  <div className="flex bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15 gap-1">
                    <button
                      onClick={() => switchPlayMode('video')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                        currentPlayMode === 'video'
                          ? 'bg-primary text-primary-foreground shadow'
                          : 'text-white/70 hover:text-white'
                      )}
                    >
                      <ListVideo className="w-3.5 h-3.5" />
                      <span>فيديو</span>
                    </button>
                    <button
                      onClick={() => switchPlayMode('audio')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                        currentPlayMode === 'audio'
                          ? 'bg-primary text-primary-foreground shadow'
                          : 'text-white/70 hover:text-white'
                      )}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>صوت</span>
                    </button>
                  </div>
                )}

                {isTheaterMode && (
                  <button
                    onClick={() => setIsTheaterMode(false)}
                    className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-white/15 transition-all"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>خروج من السينما</span>
                  </button>
                )}
              </div>

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
                /* Inline Audio Player */
                <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
                  <Image
                    src={getLectureImageUrl(lecture)}
                    fill
                    className="object-cover opacity-20 blur-3xl scale-125 select-none pointer-events-none"
                    alt=""
                  />

                  {videoId ? (
                    <div
                      ref={audioYtContainerRef}
                      className="absolute w-0 h-0 overflow-hidden pointer-events-none"
                      aria-hidden
                    />
                  ) : (
                    <audio
                      ref={inlineAudioRef}
                      src={playableAudioSrc}
                      preload="none"
                      onTimeUpdate={(e) => setPlayerCurrentTime(e.currentTarget.currentTime)}
                      onDurationChange={(e) => setVideoDuration(e.currentTarget.duration)}
                      onPlay={() => setIsInlineAudioPlaying(true)}
                      onPause={() => setIsInlineAudioPlaying(false)}
                      onEnded={handleVideoEnded}
                    />
                  )}

                  {/* Cover Art */}
                  <div className="flex flex-col items-center md:items-start gap-4 z-10 md:w-5/12">
                    <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/15">
                      <Image
                        src={getLectureImageUrl(lecture)}
                        fill
                        className={cn(
                          'object-cover transition-transform duration-700',
                          isInlineAudioPlaying && 'scale-105'
                        )}
                        alt={lecture.title}
                      />
                    </div>
                    <div className="text-center md:text-right space-y-1">
                      <h2 className="text-base md:text-lg font-bold text-white line-clamp-2 leading-snug">
                        {lecture.title}
                      </h2>
                      {lecture.programName && (
                        <p className="text-xs text-primary font-semibold">{lecture.programName}</p>
                      )}
                    </div>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex flex-col justify-center items-center w-full md:w-7/12 gap-4 z-10">
                    <canvas
                      ref={visualizerCanvasRef}
                      width={320}
                      height={48}
                      className="w-full h-12 rounded-xl"
                    />

                    {/* Seek Slider */}
                    <div className="w-full space-y-1">
                      <input
                        type="range"
                        min="0"
                        max={videoDuration || lecture.duration || 1}
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
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[11px] text-white/60 font-mono">
                        <span>{formatDuration(playerCurrentTime)}</span>
                        <span>{formatDuration(videoDuration || lecture.duration || 0)}</span>
                      </div>
                    </div>

                    {/* Transport Buttons */}
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => seekAudio(-10)}
                        className="p-2.5 rounded-full hover:bg-white/10 text-white/75 hover:text-white transition-all active:scale-95"
                        title="تراجع 10 ثوانٍ"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={toggleAudioPlay}
                        className="p-4 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-all shadow-lg active:scale-95"
                        aria-label={isInlineAudioPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                      >
                        {isInlineAudioPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current" />
                        )}
                      </button>

                      <button
                        onClick={() => seekAudio(10)}
                        className="p-2.5 rounded-full hover:bg-white/10 text-white/75 hover:text-white transition-all active:scale-95"
                        title="تقدم 10 ثوانٍ"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Speed & Volume */}
                    <div className="flex items-center justify-between w-full border-t border-white/10 pt-3">
                      <div className="flex items-center gap-1.5">
                        {[1, 1.25, 1.5, 2].map((val) => (
                          <button
                            key={val}
                            onClick={() => setPlaybackRate(val)}
                            className={cn(
                              'px-2 py-0.5 rounded-md text-[10px] font-bold transition-all border',
                              playbackRate === val
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            {val}x
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3.5 h-3.5 text-white/60" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={audioVolume}
                          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                          className="w-16 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── 2. LECTURE TITLE, METADATA & ACTION BAR ── */}
            {!isTheaterMode && (
              <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-5 shadow-sm">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {lecture.seriesTitle && (
                      <Link
                        href={seriesLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{lecture.seriesTitle}</span>
                      </Link>
                    )}
                    {lecture.programName && lecture.programSlug && (
                      <Link
                        href={`/programs/${lecture.programSlug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-foreground font-semibold hover:bg-accent transition-colors"
                      >
                        <Headphones className="w-3.5 h-3.5 text-primary" />
                        <span>{lecture.programName}</span>
                      </Link>
                    )}
                    {(lecture.youtubeViewCount ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{formatViews(lecture.youtubeViewCount ?? 0)} مشاهدة</span>
                      </span>
                    )}
                    {(lecture.duration ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(lecture.duration ?? 0)}</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black text-foreground font-headline leading-snug">
                    {lecture.title}
                  </h1>
                </div>

                {/* Action Pills Row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                  <Button
                    onClick={handleDownload}
                    disabled={isFetchingFormats}
                    size="sm"
                    className="h-10 px-4 rounded-xl font-bold gap-2"
                  >
                    {isFetchingFormats ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>تنزيل</span>
                  </Button>

                  {lecture.audioSrc && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={handleOfflineToggle}
                        disabled={isOfflineDownloading}
                        variant={isOfflineCached ? 'secondary' : 'outline'}
                        size="sm"
                        className={cn(
                          'h-10 px-4 rounded-xl font-bold gap-2',
                          isOfflineCached && 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                        )}
                      >
                        {isOfflineDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isOfflineCached ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Wifi className="w-4 h-4" />
                        )}
                        <span>
                          {isOfflineDownloading
                            ? `جاري الحفظ (${offlineDownloadProgress}%)`
                            : isOfflineCached
                              ? 'محفوظة دون اتصال'
                              : 'حفظ دون اتصال'}
                        </span>
                      </Button>

                      {isOfflineCached && (
                        <Button
                          onClick={handleDeleteOffline}
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                          title="حذف من الجهاز"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {lecture.pdfUrl && (
                    <Button asChild variant="outline" size="sm" className="h-10 px-4 rounded-xl font-bold gap-2">
                      <a href={lecture.pdfUrl} download>
                        <FileDown className="w-4 h-4 text-emerald-500" />
                        <span>التفريغ PDF</span>
                      </a>
                    </Button>
                  )}

                  {videoId && (
                    <Button
                      onClick={handleWatchVideo}
                      variant="outline"
                      size="sm"
                      className="h-10 px-4 rounded-xl font-bold gap-2"
                    >
                      <PictureInPicture className="w-4 h-4" />
                      <span className="hidden sm:inline">مشغل عائم</span>
                    </Button>
                  )}

                  <Button
                    onClick={() => setIsTheaterMode(true)}
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 rounded-xl font-bold gap-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="hidden sm:inline">وضع السينما</span>
                  </Button>

                  <Button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    variant={isSidebarOpen ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-10 px-4 rounded-xl font-bold gap-2"
                  >
                    <ListVideo className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isSidebarOpen ? 'إخفاء القائمة' : 'عرض القائمة'}
                    </span>
                  </Button>

                  <div className="flex items-center gap-1.5 mr-auto">
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      title="نسخ الرابط"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      title="مشاركة"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl" title="واتساب">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl" title="فيسبوك">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="w-4 h-4 text-[#1877F2]" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Playlist / Up Next Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && !isTheaterMode && (
              <motion.aside
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-4 xl:col-span-3 order-2 flex flex-col bg-card/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-border overflow-hidden shadow-sm max-h-[520px] lg:max-h-[680px]"
              >
                <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground truncate">
                      {playlist ? playlist.name : 'قائمة المحاضرات'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lecture.programName || 'وقفة'} • {currentIndex + 1} من {relatedLectures.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsShuffle(!isShuffle)}
                      className={cn(
                        'rounded-lg h-8 w-8',
                        isShuffle ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      )}
                      title={isShuffle ? 'إيقاف الترتيب العشوائي' : 'ترتيب عشوائي'}
                    >
                      <Shuffle className="w-3.5 h-3.5" />
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
                        'rounded-lg h-8 w-8',
                        repeatMode !== 'none'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground'
                      )}
                      title={
                        repeatMode === 'none'
                          ? 'تكرار الكل'
                          : repeatMode === 'all'
                            ? 'تكرار الحلقة'
                            : 'إيقاف التكرار'
                      }
                    >
                      {repeatMode === 'one' ? (
                        <Repeat1 className="w-3.5 h-3.5" />
                      ) : (
                        <Repeat className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSidebarOpen(false)}
                      className="rounded-lg h-8 w-8 text-muted-foreground"
                      aria-label="إغلاق القائمة"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="divide-y divide-border/40">
                    {relatedLectures.map((item, idx) => {
                      const isCurrent = item.id === lecture.id;
                      const history = allHistory?.find((h) => h.id === item.id);
                      const progress =
                        history && history.duration ? (history.position / history.duration) * 100 : 0;

                      return (
                        <Link
                          key={item.id}
                          href={`/lectures/${item.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`}
                          className={cn(
                            'flex gap-3 p-3 hover:bg-accent/50 transition-colors items-center group',
                            isCurrent && 'bg-primary/10'
                          )}
                        >
                          <div className="w-5 shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {isCurrent ? (
                              <Play className="w-3.5 h-3.5 text-primary fill-current" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          <div className="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                            <Image
                              src={getLectureImageUrl(item)}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                            {progress > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                              {formatDuration(item.duration ?? 0)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <h4
                              className={cn(
                                'text-xs font-bold line-clamp-2 leading-snug',
                                isCurrent ? 'text-primary' : 'text-foreground group-hover:text-primary'
                              )}
                            >
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {item.programName || 'وقفة'}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </ScrollArea>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* ── 3. NEXT / PREVIOUS NAVIGATION ── */}
        {(prevLecture || nextLecture) && !isTheaterMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prevLecture ? (
              <Link
                href={`/lectures/${prevLecture.slug}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card/70 border border-border hover:border-primary/40 hover:bg-accent/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <SkipBack className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-muted-foreground block">المحاضرة السابقة</span>
                  <span className="text-sm font-bold text-foreground truncate block">{prevLecture.title}</span>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {nextLecture && (
              <Link
                href={`/lectures/${nextLecture.slug}${playlistId ? `?playlist=${playlistId}${userId ? `&u=${userId}` : ''}` : ''}`}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-all group"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-primary block">المحاضرة التالية</span>
                  <span className="text-sm font-bold text-foreground truncate block">{nextLecture.title}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <SkipForward className="w-4 h-4" />
                </div>
              </Link>
            )}
          </div>
        )}

        {/* ── 4. DETAILS, CHAPTERS & INTERACTIVE TABS ── */}
        {!isTheaterMode && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* About & Rating / Actions */}
              <div
                className={cn(
                  'bg-card/70 backdrop-blur-xl border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm',
                  lecture.chapters && lecture.chapters.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
                )}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-primary mb-4">
                  <Info className="w-4 h-4" />
                  <span>تفاصيل المحاضرة والتقييم</span>
                </div>
                <LectureHeader lecture={lecture} seriesLink={seriesLink} />
              </div>

              {/* Chapters */}
              {lecture.chapters && lecture.chapters.length > 0 && (
                <div className="lg:col-span-5">
                  <LectureChapters
                    chapters={lecture.chapters}
                    currentTime={playerCurrentTime}
                    onSeek={handleSeekToTime}
                  />
                </div>
              )}
            </div>

            {/* Interactive Workspace Tabs */}
            <Tabs defaultValue="transcript" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted/60 border border-border rounded-2xl h-12 p-1">
                  <TabsTrigger value="transcript" className="rounded-xl text-xs sm:text-sm font-bold gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>التفريغ</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="ai"
                    onClick={fetchAiSummary}
                    className="rounded-xl text-xs sm:text-sm font-bold gap-1.5"
                  >
                    <Brain className="w-4 h-4" />
                    <span>الذكاء</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    disabled={!user}
                    className="rounded-xl text-xs sm:text-sm font-bold gap-1.5"
                  >
                    <Notebook className="w-4 h-4 hidden sm:inline" />
                    <span>ملاحظاتي</span>
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="rounded-xl text-xs sm:text-sm font-bold">
                    التعليقات
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="transcript" className="mt-0 outline-none">
                <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">التفريغ النصي التفاعلي</h2>
                      <p className="text-xs text-muted-foreground">
                        اضغط على أي جملة للانتقال إليها مباشرة في المحاضرة.
                      </p>
                    </div>
                  </div>
                  <div className="h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    <InteractiveTranscript transcript={lecture.transcript || []} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="mt-0 outline-none">
                <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">المساعد التعليمي الذكي</h2>
                      <p className="text-xs text-muted-foreground">
                        تلخيص ذكي للمحاضرة وأبرز الفوائد مع اختبار تفاعلي لقياس الفهم.
                      </p>
                    </div>
                  </div>

                  {isAiLoading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 className="animate-spin h-10 w-10 text-primary" />
                      <p className="text-sm text-muted-foreground font-semibold">
                        جاري تحليل المحاضرة وتلخيصها وتوليد الاختبار...
                      </p>
                    </div>
                  )}

                  {aiError && (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                      <AlertCircle className="w-12 h-12 text-destructive" />
                      <h3 className="text-lg font-bold text-foreground">فشل التحليل الذكي</h3>
                      <p className="text-sm text-muted-foreground max-w-md">{aiError}</p>
                      <Button onClick={fetchAiSummary} className="mt-2 rounded-xl">
                        إعادة المحاولة
                      </Button>
                    </div>
                  )}

                  {!isAiLoading && !aiError && !aiData && (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                      <Brain className="w-14 h-14 text-muted-foreground/30" />
                      <h3 className="text-lg font-bold text-foreground">الملخص الذكي والاختبار</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        اضغط على زر التوليد لتحليل المحاضرة والحصول على ملخص شامل واختبار فهم ذاتي.
                      </p>
                      <Button onClick={fetchAiSummary} className="mt-2 rounded-xl px-6 font-bold">
                        توليد التلخيص الذكي
                      </Button>
                    </div>
                  )}

                  {aiData && (
                    <div className="space-y-8">
                      <section className="space-y-3">
                        <h3 className="text-lg font-bold text-foreground border-r-4 border-primary pr-3">
                          الملخص العام للمحاضرة
                        </h3>
                        <div className="bg-muted/40 rounded-2xl p-5 border border-border text-foreground/90 text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {aiData.summary}
                        </div>
                      </section>

                      {aiData.keyTakeaways && aiData.keyTakeaways.length > 0 && (
                        <section className="space-y-3">
                          <h3 className="text-lg font-bold text-foreground border-r-4 border-primary pr-3">
                            الفوائد المستخلصة
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {aiData.keyTakeaways.map((takeaway, idx) => (
                              <div
                                key={idx}
                                className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2"
                              >
                                <span className="inline-flex items-center justify-center h-7 w-7 bg-primary/15 rounded-lg text-primary text-xs font-bold">
                                  {idx + 1}
                                </span>
                                <p className="text-sm text-foreground font-medium leading-relaxed">
                                  {takeaway}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {aiData.quiz && aiData.quiz.length > 0 && (
                        <section className="space-y-4 pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h3 className="text-lg font-bold text-foreground">اختبر فهمك للدرس</h3>
                          </div>
                          <div className="space-y-5">
                            {aiData.quiz.map((q, qIdx) => {
                              const isAnswered = selectedAnswers[qIdx] !== undefined;
                              const selectedOpt = selectedAnswers[qIdx];

                              return (
                                <div
                                  key={qIdx}
                                  className="bg-muted/30 rounded-2xl p-5 border border-border space-y-3"
                                >
                                  <h4 className="text-base font-bold text-foreground">
                                    السؤال {qIdx + 1}: {q.question}
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt, optIdx) => {
                                      const isSelected = selectedOpt === optIdx;
                                      const isCorrectOpt = q.correctAnswer === optIdx;

                                      let optStyle =
                                        'bg-card hover:bg-accent text-foreground border-border';
                                      if (isAnswered) {
                                        if (isCorrectOpt) {
                                          optStyle =
                                            'bg-emerald-500/15 text-emerald-500 border-emerald-500/40 font-bold';
                                        } else if (isSelected) {
                                          optStyle =
                                            'bg-destructive/15 text-destructive border-destructive/40 font-bold';
                                        } else {
                                          optStyle = 'bg-muted/30 text-muted-foreground border-border/50';
                                        }
                                      }

                                      return (
                                        <button
                                          key={optIdx}
                                          disabled={isAnswered}
                                          onClick={() =>
                                            setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                                          }
                                          className={cn(
                                            'w-full text-right p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between gap-2',
                                            optStyle
                                          )}
                                        >
                                          <span>{opt}</span>
                                          {isAnswered && isCorrectOpt && (
                                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                          )}
                                          {isAnswered && isSelected && !isCorrectOpt && (
                                            <X className="w-4 h-4 text-destructive shrink-0" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {isAnswered && (
                                    <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 space-y-1">
                                      <span className="text-xs font-bold text-primary block">
                                        التوضيح:
                                      </span>
                                      <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                                        {q.explanation}
                                      </p>
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
              </TabsContent>

              <TabsContent value="notes" className="mt-0 outline-none">
                {user ? (
                  <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                          <Notebook className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">ملاحظاتي</h2>
                          <p className="text-xs text-muted-foreground">
                            سجل فوائدك وخواطرك المرتبطة بهذه المحاضرة.
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-muted border border-border text-[11px] font-bold text-primary flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>محفوظة بحسابك</span>
                      </div>
                    </div>
                    <LectureNotes lecture={lecture} userId={user.uid} />
                  </div>
                ) : (
                  <div className="bg-card/70 border border-border rounded-2xl md:rounded-3xl p-10 text-center space-y-4">
                    <Notebook className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                    <h3 className="text-lg font-bold text-foreground">
                      سجّل الدخول لحفظ ملاحظاتك
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      قم بتسجيل الدخول لتتمكن من كتابة ومراجعة ملاحظاتك الخاصة على هذه المحاضرة.
                    </p>
                    <Button asChild className="rounded-xl px-6 font-bold">
                      <Link href={`/auth/login?redirect_to=/lectures/${lecture.slug}`}>
                        تسجيل الدخول
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="mt-0 outline-none">
                <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm">
                  <CommentsSection lectureId={lecture.id} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
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
