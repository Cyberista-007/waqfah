

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Facebook, FileDown, Twitter, Youtube, Play, Notebook, Share2, Copy, Clapperboard, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureHeader } from '@/components/lecture-header';
import type { Lecture, LectureClip, ListenHistoryItem } from '@/lib/types';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LectureCard } from './lecture-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipCreationDialog } from './clip-creation-dialog';
import dynamic from 'next/dynamic';
import { DownloaderModal } from './downloader-modal';

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
const ClipsSection = dynamic(() => import('@/components/clips-section').then(mod => mod.ClipsSection), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>,
    ssr: false
});

function getYoutubeVideoId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const videoUrl = new URL(url);
    if (videoUrl.hostname === 'youtu.be') {
      return videoUrl.pathname.slice(1);
    }
    if (videoUrl.hostname.includes('youtube.com')) {
      const videoId = videoUrl.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
    }
  } catch (error) {
    console.error("Invalid YouTube URL", error);
    return null;
  }
  return null;
}

interface LectureClientPageProps {
    lecture: Lecture;
    relatedLectures: Lecture[];
}

export function LectureClientPage({ lecture, relatedLectures }: LectureClientPageProps) {
  const { playTrack, hideVideoPlayer, playVideo } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState('');
  const [isClipCreationOpen, setIsClipCreationOpen] = useState(false);
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false);
  const [downloadFormats, setDownloadFormats] = useState([]);
  const [isFetchingFormats, setIsFetchingFormats] = useState(false);

  const historyDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'listenHistory', lecture.id) : null),
    [user, firestore, lecture.id]
  );
  const { data: lectureHistory } = useDoc<ListenHistoryItem>(historyDocRef);


  useEffect(() => {
    // Set the share URL on the client side
    if (typeof window !== 'undefined') {
        setShareUrl(window.location.href.split('?')[0]);
    }
    
    // This effect runs only once on the client after hydration to check for a clip
    const searchParams = new URLSearchParams(window.location.search);
    const clipId = searchParams.get('clip');

    if (clipId && firestore) {
      const fetchAndPlayClip = async () => {
        try {
          const clipRef = doc(firestore, 'lectures', lecture.id, 'clips', clipId);
          const clipSnap = await getDoc(clipRef);
          if (clipSnap.exists()) {
            const clip = clipSnap.data() as LectureClip;
            playTrack(lecture, clip.startTime, clip.endTime);
            toast({
              title: `تشغيل مقطع: ${clip.title}`,
              description: "سيبدأ تشغيل المقطع المحدد تلقائيًا.",
            });
          } else {
             toast({ variant: 'destructive', title: "المقطع غير موجود." });
          }
        } catch(e) {
           console.error("Error fetching clip:", e);
           toast({ variant: 'destructive', title: "خطأ في جلب المقطع." });
        }
      };
      fetchAndPlayClip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  if (!lecture) {
    // This should technically not be reached if the server component handles it
    notFound();
  }
  
  const videoId = getYoutubeVideoId(lecture?.youtubeUrl);

  const handlePlay = () => {
    hideVideoPlayer();
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
      audioSrc: lecture.audioSrc,
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
          playVideo({ videoId, title: lecture.title });
      }
  }

  const seriesLink = `/series/${lecture.seriesSlug}`;
  const shareText = `استمع إلى محاضرة "${lecture.title}"`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'تم نسخ الرابط!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
    }
  }, [shareUrl, toast]);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();

    if (lecture.youtubeUrl) {
        setIsFetchingFormats(true);
        try {
            const response = await fetch('/api/youtube-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: lecture.youtubeUrl, getFormats: true }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'فشل في جلب صيغ التنزيل.');
            
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
    
    // Fallback to audio download
    const url = lecture.audioSrc;
    if (!url) {
        toast({ variant: 'destructive', title: 'رابط التحميل غير متوفر' });
        return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = lecture.title ? `${lecture.title}.mp3` : 'lecture.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: 'بدء التحميل...' });
    } catch (error) {
        console.error("Download failed:", error);
        toast({ variant: 'destructive', title: 'فشل التحميل' });
    }
  }, [lecture.audioSrc, lecture.title, lecture.youtubeUrl, toast]);

  const handleGenericShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // This can happen if user cancels the share dialog.
        console.log('Share was cancelled or failed.', error);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      handleCopyLink();
    }
  }, [shareText, shareUrl, handleCopyLink]);
  
  const handleCreateClip = () => {
      if (!user) {
          toast({
              variant: "destructive",
              title: "يرجى تسجيل الدخول أولاً.",
              description: "يجب أن تسجل دخولك لتتمكن من إنشاء المقاطع."
          });
          router.push(`/auth/login?redirect_to=/lectures/${lecture.slug}`);
          return;
      }
      setIsClipCreationOpen(true);
  }

  return (
    <>
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-10">
      <LectureHeader lecture={lecture} seriesLink={seriesLink} />

      <Card className="shadow-lg">
            <CardContent className="p-4">
            <Button 
                onClick={handlePlay}
                className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90 transition-colors"
                size="lg"
            >
                <Play className="w-6 h-6 me-2" />
                <span>استماع</span>
            </Button>
            </CardContent>
        </Card>
      
      <section>
        <h3 className="text-2xl font-bold mb-4 font-headline">الاستماع والتحميل</h3>
        <div className="flex flex-wrap gap-3">
           {videoId && (
            <Button variant="destructive" onClick={handleWatchVideo}>
              <Youtube />
              <span className="ms-2">مشاهدة (يوتيوب)</span>
            </Button>
          )}
          <Button onClick={handleDownload} disabled={isFetchingFormats}>
              {isFetchingFormats ? <Loader2 className="w-5 h-5 me-2 animate-spin" /> : <Download className="w-5 h-5 me-2" />}
              <span>تحميل</span>
          </Button>
           <Button onClick={handleCreateClip}>
              <Clapperboard className="w-5 h-5 me-2" />
              <span>إنشاء مقطع</span>
            </Button>
          {lecture.soundcloudUrl && (
            <Button asChild style={{ backgroundColor: '#ff5500', color: 'white' }}>
              <a href={lecture.soundcloudUrl} target="_blank" rel="noopener noreferrer">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor"><path d="M1.203 12.373a2.381 2.381 0 012.38-2.38c.63 0 1.23.25 1.68.7l.807.806V6.143a2.382 2.382 0 012.38-2.381h13.17a2.38 2.38 0 012.38 2.38v6.23h-2.38V6.143a.068.068 0 00-.07-.068H8.45a.068.068 0 00-.07.068v9.428a.068.068 0 00.07.068h.806v2.381h-.806a2.381 2.381 0 01-2.38-2.38v-3.111l-.808.807a2.38 2.38 0 01-3.367 0 2.38 2.38 0 010-3.367zm20.417.807v-1.587h2.38v1.587h-2.38zm-3.174 0v-1.587h2.38v1.587h-2.38zm-3.175 0v-1.587h2.38v1.587h-2.38z"/></svg>
                <span className="ms-2">استماع (ساوندكلاود)</span>
              </a>
            </Button>
          )}
           {lecture.telegramUrl && (
            <Button asChild style={{ backgroundColor: '#26A5E4', color: 'white' }}>
              <a href={lecture.telegramUrl} target="_blank" rel="noopener noreferrer">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.494 1.202-.82 1.23-.696.06-1.225-.46-1.9- .902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.794-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.04-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.24-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.39 4.027-1.633 4.476-1.636z"/></svg>
                <span className="ms-2">متابعة (تيليجرام)</span>
              </a>
            </Button>
          )}
          {lecture.pdfUrl && (
            <Button asChild variant="secondary">
              <a href={lecture.pdfUrl} download>
                <FileDown className="w-5 h-5 me-2" />
                <span>تحميل تفريغ (PDF)</span>
              </a>
            </Button>
          )}
        </div>
      </section>

       <section>
        <h3 className="text-2xl font-bold mb-4 font-headline">مشاركة المحاضرة</h3>
        <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"><Facebook/><span className="ms-2">فيسبوك</span></a>
            </Button>
             <Button asChild variant="outline">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"><Twitter/><span className="ms-2">تويتر</span></a>
            </Button>
            <Button asChild variant="outline">
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} data-action="share/whatsapp/share" target="_blank" rel="noopener noreferrer">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="currentColor"><path d="M16.75 13.96c-.25-.12-1.48-.72-1.71-.81-.23-.08-.39-.12-.56.12-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.23-.75-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.43s-.65-1.56-.88-2.15c-.23-.58-.47-.5-.65-.51-.17-.01-.37-.01-.56-.01s-.47.06-.72.31c-.25.25-.97.95-1.19 2.16-.22 1.21.36 2.39.41 2.56.05.17.97 1.57 2.38 2.98 1.41 1.41 2.5 1.88 3.29 2.2.79.32 1.48.29 2.01.18.53-.12 1.48-.6 1.69-.97.21-.37.21-.69.14-.81-.07-.12-.23-.19-.48-.31zM12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 1.95.56 3.81 1.59 5.39L2 22.04l5.66-1.56C9.17 21.43 10.54 22 12 22c5.5 0 9.96-4.46 9.96-9.96S17.5 2.04 12 2.04zm0 18.25c-1.85 0-3.6-.56-5.08-1.59l-.36-.21-3.69.97.98-3.6-.23-.38c-1.08-1.76-1.65-3.79-1.65-5.91 0-4.57 3.71-8.28 8.28-8.28 4.57 0 8.28 3.71 8.28 8.28.01 4.57-3.7 8.28-8.27 8.28z"/></svg>
                <span className="ms-2">واتساب</span>
              </a>
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="h-5 w-5 me-2" />
              <span>نسخ الرابط</span>
            </Button>
            <Button variant="outline" onClick={handleGenericShare}>
              <Share2 className="h-5 w-5 me-2" />
              <span>المزيد</span>
            </Button>
        </div>
      </section>

      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transcript">التفريغ النصي</TabsTrigger>
          <TabsTrigger value="clips">المقاطع</TabsTrigger>
          <TabsTrigger value="notes" disabled={!user}>ملاحظاتي</TabsTrigger>
        </TabsList>
        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">عن المحاضرة (تفريغ تفاعلي)</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveTranscript transcript={lecture.transcript || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clips">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Clapperboard className="h-6 w-6" />
                        مقاطع من المحاضرة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ClipsSection lecture={lecture} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="notes">
          {user ? (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Notebook className="h-6 w-6" />
                        ملاحظاتي الخاصة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <LectureNotes lectureId={lecture.id} userId={user.uid} />
                </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">الرجاء تسجيل الدخول لكتابة الملاحظات.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>


      <CommentsSection lectureId={lecture.id} />
      
      {relatedLectures.length > 0 && (
        <section>
            <h3 className="text-2xl font-semibold mb-4 font-headline">محاضرات ذات صلة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedLectures.map((related, index) => (
                    <LectureCard key={related.id} lecture={related} index={index} />
                ))}
            </div>
        </section>
      )}

    </div>
     <ClipCreationDialog 
        isOpen={isClipCreationOpen} 
        onOpenChange={setIsClipCreationOpen} 
        lectureId={lecture.id}
        lectureDuration={lecture.duration}
    />
    <DownloaderModal
        isOpen={isDownloaderOpen}
        onOpenChange={setIsDownloaderOpen}
        formats={downloadFormats}
        title={lecture.title}
    />
    </>
  );
}
