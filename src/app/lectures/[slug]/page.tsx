
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLectureBySlug, getRelatedLectures } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download, Facebook, FileDown, Twitter, Youtube, Play, Notebook } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveTranscript } from '@/components/interactive-transcript';
import { LectureHeader } from '@/components/lecture-header';
import { SiTelegram, SiSoundcloud } from '@icons-pack/react-simple-icons';
import type { Lecture } from '@/lib/types';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { YoutubePlayerModal } from '@/components/youtube-player-modal';
import { SeriesPageSkeleton } from '@/components/skeletons';
import { LectureNotes } from '@/components/lecture-notes';
import { CommentsSection } from '@/components/comments-section';


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


export default function LectureDetailPage({ params }: { params: { slug: string } }) {
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [relatedLectures, setRelatedLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = useAudioPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');


  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const fetchedLecture = await getLectureBySlug(params.slug);
        if (fetchedLecture) {
          setLecture(fetchedLecture);
          const fetchedRelated = await getRelatedLectures(fetchedLecture.id, fetchedLecture.seriesId);
          setRelatedLectures(fetchedRelated);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch lecture data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Set the share URL on the client side
    if (typeof window !== 'undefined') {
        setShareUrl(window.location.href);
    }

  }, [params.slug]);
  
  if (isLoading || !lecture) {
    return <SeriesPageSkeleton />;
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
    }, startTime);
  };


  const seriesLink = `/series/${lecture.seriesId}`;
  const shareText = `استمع إلى محاضرة "${lecture.title}" للشيخ أمجد سمير`;

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
                <SiSoundcloud size={20} />
                <span className="ms-2">استماع (ساوندكلاود)</span>
              </a>
            </Button>
          )}
           {lecture.telegramUrl && (
            <Button asChild style={{ backgroundColor: '#26A5E4', color: 'white' }}>
              <a href={lecture.telegramUrl} target="_blank" rel="noopener noreferrer">
                <SiTelegram size={20} />
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
                {relatedLectures.map(related => (
                    <Card key={related.slug} className="overflow-hidden">
                        <Link href={`/lectures/${related.slug}`}>
                            <CardContent className="p-4">
                                <h4 className="font-semibold font-headline hover:underline">
                                    {related.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">{related.seriesTitle}</p>
                            </CardContent>
                        </Link>
                    </Card>
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
