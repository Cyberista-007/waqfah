
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Facebook, FileDown, Twitter, Youtube, Play, Notebook, Share2, Copy, ChevronsUpDown, X, Loader2, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LectureHeader } from '@/components/lecture-header';
import type { Lecture, ListenHistoryItem } from '@/lib/types';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LectureCard } from './lecture-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { DownloaderModal } from './downloader-modal';
import { getVideoIdFromUrl } from '@/lib/utils';

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
}

export function LectureClientPage({ lecture, relatedLectures }: LectureClientPageProps) {
  const { playTrack, hidePlayer, playIframe } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
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
  }, []);
  
  if (!lecture) {
    // This should technically not be reached if the server component handles it
    notFound();
  }
  
  const videoId = getVideoIdFromUrl(lecture?.youtubeUrl);

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
          playIframe({ type: 'youtube', src: videoId, title: lecture.title, lectureId: lecture.id, seriesId: lecture.seriesId });
      }
  }

  const handlePlaySoundcloud = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lecture.soundcloudUrl) {
      playIframe({ type: 'soundcloud', src: lecture.soundcloudUrl, title: lecture.title });
    }
  };

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
            const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: lecture.youtubeUrl, getFormats: true }),
            });
            const data = await response.json();
            if (!response.ok) {
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
    
    // Fallback for non-YouTube audio download
    const audioUrl = lecture.audioSrc;
    if (!audioUrl) {
        toast({ variant: 'destructive', title: 'رابط التحميل غير متوفر' });
        return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = audioUrl;
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

  return (
    <>
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-10">
      <LectureHeader lecture={lecture} seriesLink={seriesLink} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={handlePlay} size="lg" className="h-16 text-lg">
            <Play className="w-6 h-6 me-3" />
            <span>استماع صوتي</span>
        </Button>
        {videoId ? (
            <Button onClick={handleWatchVideo} size="lg" variant="secondary" className="h-16 text-lg">
                <Youtube className="w-6 h-6 me-3" />
                <span>مشاهدة فيديو</span>
            </Button>
        ) : lecture.soundcloudUrl ? (
             <Button onClick={handlePlaySoundcloud} size="lg" variant="secondary" className="h-16 text-lg" style={{ backgroundColor: '#ff5500', color: 'white' }}>
                 <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 me-3" fill="currentColor"><path d="M1.203 12.373a2.381 2.381 0 012.38-2.38c.63 0 1.23.25 1.68.7l.807.806V6.143a2.382 2.382 0 012.38-2.381h13.17a2.38 2.38 0 012.38 2.38v6.23h-2.38V6.143a.068.068 0 00-.07-.068H8.45a.068.068 0 00-.07.068v9.428a.068.068 0 00.07.068h.806v2.381h-.806a2.381 2.381 0 01-2.38-2.38v-3.111l-.808.807a2.38 2.38 0 01-3.367 0 2.38 2.38 0 010-3.367zm20.417.807v-1.587h2.38v1.587h-2.38zm-3.174 0v-1.587h2.38v1.587h-2.38zm-3.175 0v-1.587h2.38v1.587h-2.38z"/></svg>
                <span>استمع على ساوندكلاود</span>
            </Button>
        ) : (
            <Button size="lg" variant="secondary" className="h-16 text-lg" disabled>
                <Youtube className="w-6 h-6 me-3" />
                <span>فيديو غير متاح</span>
            </Button>
        )}
      </div>

      <section>
        <h3 className="text-2xl font-bold mb-4 font-headline">أدوات إضافية</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDownload} disabled={isFetchingFormats}>
              {isFetchingFormats ? <Loader2 className="w-5 h-5 me-2 animate-spin" /> : <Download className="w-5 h-5 me-2" />}
              <span>تحميل</span>
          </Button>
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
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52s-.67-.161-.923-.223c-.253-.062-.522-.072-.79-.072-.267 0-.701.099-1.065.465-.364.365-1.399 1.36-1.399 3.315 0 1.955 1.433 3.845 1.63 4.118.198.273 2.783 4.237 6.75 5.973 1.04.453 1.947.534 2.65.534.825 0 1.581-.347 2.203-.659.622-.312 1.89-1.233 2.162-1.755.273-.522.273-.972.198-1.121-.075-.149-.274-.224-.572-.372zM12.001 2.003C6.486 2.003 2 6.488 2 12.002c0 1.98.592 3.832 1.688 5.432L2.04 22.001l5.736-1.57c1.554.965 3.344 1.54 5.225 1.54h.001c5.514 0 9.998-4.485 9.998-9.998C22 6.488 17.515 2.003 12.001 2.003z"/></svg>
                <span className="ms-2">واتساب</span>
              </a>
            </Button>
            {lecture.soundcloudUrl && (
            <Button onClick={handlePlaySoundcloud} style={{ backgroundColor: '#ff5500', color: 'white' }}>
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="currentColor"><path d="M1.203 12.373a2.381 2.381 0 012.38-2.38c.63 0 1.23.25 1.68.7l.807.806V6.143a2.382 2.382 0 012.38-2.381h13.17a2.38 2.38 0 012.38 2.38v6.23h-2.38V6.143a.068.068 0 00-.07-.068H8.45a.068.068 0 00-.07.068v9.428a.068.068 0 00.07.068h.806v2.381h-.806a2.381 2.381 0 01-2.38-2.38v-3.111l-.808.807a2.38 2.38 0 01-3.367 0 2.38 2.38 0 010-3.367zm20.417.807v-1.587h2.38v1.587h-2.38zm-3.174 0v-1.587h2.38v1.587h-2.38zm-3.175 0v-1.587h2.38v1.587h-2.38z"/></svg>
                <span className="ms-2">ساوندكلاود</span>
            </Button>
          )}
           {lecture.telegramUrl && (
            <Button asChild style={{ backgroundColor: '#26A5E4', color: 'white' }}>
              <a href={lecture.telegramUrl} target="_blank" rel="noopener noreferrer">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.494 1.202-.82 1.23-.696.06-1.225-.46-1.9- .902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.794-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.04-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.24-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.39 4.027-1.633 4.476-1.636z"/></svg>
                <span className="ms-2">تيليجرام</span>
              </a>
            </Button>
          )}
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
        <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="transcript">التفريغ النصي</TabsTrigger>
              <TabsTrigger value="comments">التعليقات</TabsTrigger>
              <TabsTrigger value="notes" disabled={!user}>ملاحظاتي</TabsTrigger>
            </TabsList>
        </div>
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
        <TabsContent value="comments">
          <CommentsSection lectureId={lecture.id} />
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
                    <LectureNotes lecture={lecture} userId={user.uid} />
                </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">الرجاء تسجيل الدخول لكتابة الملاحظات.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
