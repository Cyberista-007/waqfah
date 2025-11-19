
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLectureBySlug, getRelatedLectures } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download, Facebook, FileDown, Twitter, Youtube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveTranscript } from '@/components/interactive-transcript';
import { LectureHeader } from '@/components/lecture-header';
import { PlayButton } from '@/components/play-button';

type LectureDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: LectureDetailPageProps) {
  const lecture = await getLectureBySlug(params.slug);
  if (!lecture) {
    return { title: 'المحاضرة غير موجودة' };
  }
  return { title: lecture.title, description: lecture.description };
}

export default async function LectureDetailPage({ params }: LectureDetailPageProps) {
  const lecture = await getLectureBySlug(params.slug);

  if (!lecture) {
    notFound();
  }
  
  const relatedLectures = await getRelatedLectures(lecture.id, lecture.seriesId);

  const seriesLink = `/series/${lecture.seriesId}`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://your-domain.com/lectures/${lecture.slug}`;
  const shareText = `استمع إلى محاضرة "${lecture.title}" للشيخ أمجد سمير`;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-10">
      <LectureHeader lecture={lecture} seriesLink={seriesLink} />

      <Card className="shadow-lg">
        <CardContent className="p-4">
          <PlayButton track={{ src: lecture.audioSrc, title: lecture.title, id: lecture.id, seriesId: lecture.seriesId, seriesSlug: lecture.seriesSlug, seriesTitle: lecture.seriesTitle, imageId: lecture.imageId, slug: lecture.slug }} />
        </CardContent>
      </Card>
      
      <section>
        <h3 className="text-2xl font-bold mb-4 font-headline">روابط التحميل</h3>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={lecture.audioSrc} download>
              <Download className="w-5 h-5 me-2" />
              <span>تحميل صوت (MP3)</span>
            </a>
          </Button>
          {lecture.youtubeUrl && (
            <Button asChild variant="destructive">
              <a href={lecture.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <Youtube />
                <span className="ms-2">مشاهدة (يوتيوب)</span>
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
  );
}
