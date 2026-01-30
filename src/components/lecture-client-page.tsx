
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Facebook, FileDown, Twitter, Youtube, Play, Notebook } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveTranscript } from '@/components/interactive-transcript';
import { LectureHeader } from '@/components/lecture-header';
import type { Lecture } from '@/lib/types';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { YoutubePlayerModal } from '@/components/youtube-player-modal';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { LectureNotes } from '@/components/lecture-notes';
import { CommentsSection } from '@/components/comments-section';
import { LectureCard } from './lecture-card';

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
  const { playTrack } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');


  useEffect(() => {
    // Set the share URL on the client side
    if (typeof window !== 'undefined') {
        setShareUrl(window.location.href);
    }
  }, []);
  
  if (!lecture) {
    // This should technically not be reached if the server component handles it
    notFound();
  }
  
  const videoId = getYoutubeVideoId(lecture?.youtubeUrl);

  const handlePlay = async () => {
    let startTime = 0;
    if (user && firestore) {
        const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', lecture.id);
        const historySnap = await getDoc(historyRef);
        if (historySnap.exists()) {
            const data = historySnap.data();
            if (data.position && data.duration && (data.duration - data.position) > 10 && data.position > 5) {
                startTime = data.position;
                toast({
                    title: "تكملة الاستماع",
                    description: `تم استئناف المحاضرة من حيث توقفت.`,
                });
            }
        }
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


  const seriesLink = `/series/${lecture.seriesSlug}`;
  const shareText = `استمع إلى محاضرة "${lecture.title}"`;

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
          <Button asChild>
            <a href={lecture.audioSrc} download>
              <Download className="w-5 h-5 me-2" />
              <span>تحميل صوت (MP3)</span>
            </a>
          </Button>
          {videoId && (
            <Button variant="destructive" onClick={() => setIsModalOpen(true)}>
              <Youtube />
              <span className="ms-2">مشاهدة (يوتيوب)</span>
            </Button>
          )}
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
        </div>
      </section>

      {user && (
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
      )}

      {lecture.transcript && lecture.transcript.length > 0 && (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline">عن المحاضرة (تفريغ تفاعلي)</CardTitle>
            </CardHeader>
            <CardContent>
            <InteractiveTranscript transcript={lecture.transcript || []} />
            </CardContent>
        </Card>
      )}

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
    {videoId && (
      <YoutubePlayerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoId={videoId}
        shareUrl={shareUrl}
      />
    )}
    </>
  );
}
