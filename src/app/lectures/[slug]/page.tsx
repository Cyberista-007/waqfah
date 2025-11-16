import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLectureBySlug } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download, Facebook, Heart, Play, Star, FileDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveTranscript } from '@/components/interactive-transcript';
import { Textarea } from '@/components/ui/textarea';
import RelatedLectures from '@/components/related-lectures';
import { PlayButton } from '@/components/play-button';

// Helper component for Brand Icons
const BrandIcon = ({ brand }: { brand: 'youtube' | 'twitter' | 'whatsapp' }) => {
    if (brand === 'youtube') return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.25,4,12,4,12,4S5.75,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.75,2,12,2,12s0,4.25,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.75,20,12,20,12,20s6.25,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.25,22,12,22,12S22,7.75,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/></svg>
    if (brand === 'twitter') return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.422.724-.665 1.561-.665 2.458 0 1.945 1.121 3.58 2.583 4.542-.962-.03-1.828-.297-2.6-.718v.065c0 2.713 1.905 4.98 4.428 5.495-.461.124-.943.19-1.442.19-.355 0-.699-.034-1.033-.098.7 2.22 2.733 3.83 5.148 3.874-2.09 1.64-4.723 2.61-7.578 2.61-.491 0-.976-.029-1.455-.086 2.705 1.74 5.923 2.76 9.38 2.76 10.619 0 16.44-8.79 16.44-16.44 0-.251 0-.501-.015-.748.995-.718 1.86-1.614 2.543-2.636z"/></svg>
    if (brand === 'whatsapp') return <svg className="w-5 h-5" fill="currentColor" viewBox="o 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.466 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.316 1.906 6.03l-.53 1.948 1.946-.52z"/></svg>
    return null;
}

type LectureDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: LectureDetailPageProps) {
  const lecture = await getLectureBySlug(params.slug);
  if (!lecture) {
    return { title: 'المحاضرة غير موجودة' };
  }
  return { title: lecture.title };
}

export default async function LectureDetailPage({ params }: LectureDetailPageProps) {
  const lecture = await getLectureBySlug(params.slug);

  if (!lecture) {
    notFound();
  }

  const seriesLink = `/series/${lecture.seriesId || lecture.seriesSlug}`;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-primary font-semibold mb-2">
            <Link href={seriesLink} className="hover:underline">{lecture.seriesTitle}</Link>
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-headline">{lecture.title}</h1>
        </div>
        <Button variant="ghost" size="icon" className="p-2 rounded-full bg-card shadow-sm border">
          <Heart className="w-6 h-6 text-muted-foreground hover:text-red-500 hover:fill-current transition-colors" />
          <span className="sr-only">إضافة للمفضلة</span>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-4">
          <PlayButton track={{ src: lecture.audioSrc, title: lecture.title }} />
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
            <Button asChild style={{backgroundColor: '#FF0000', color: 'white'}} className="hover:bg-red-700/90">
              <a href={lecture.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <BrandIcon brand="youtube" />
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
          <Button style={{backgroundColor: '#1877F2', color: 'white'}} className="w-full sm:w-auto hover:bg-blue-700/90"><Facebook className="me-2"/><span>فيسبوك</span></Button>
          <Button style={{backgroundColor: '#1DA1F2', color: 'white'}} className="w-full sm:w-auto hover:bg-sky-500/90"><BrandIcon brand="twitter"/><span className="ms-2">تويتر</span></Button>
          <Button style={{backgroundColor: '#25D366', color: 'white'}} className="w-full sm:w-auto hover:bg-green-600/90"><BrandIcon brand="whatsapp"/><span className="ms-2">واتساب</span></Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">عن المحاضرة (تفريغ تفاعلي)</CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveTranscript transcript={lecture.transcript || []} />
        </CardContent>
      </Card>

      <section>
        <h3 className="text-2xl font-bold mb-4 font-headline">تقييم المحاضرة</h3>
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-foreground">{lecture.rating.toFixed(1)}</p>
                    <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-6 h-6 transition-colors ${i < Math.round(lecture.rating) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground ms-2">({lecture.ratingCount} تقييم)</p>
                </div>
                 <p className="text-muted-foreground mt-2">
                    يرجى <Link href="/auth/login" className="text-primary hover:underline font-semibold">تسجيل الدخول</Link> لإضافة تقييمك.
                </p>
            </CardContent>
        </Card>
      </section>
      
      <RelatedLectures currentLectureSlug={lecture.slug} />

      <section>
        <h3 className="text-2xl font-bold mb-4 font-headline">التعليقات</h3>
        <Card>
            <CardContent className="p-6">
                <div className="mb-6">
                    <Textarea rows={3} placeholder="أضف تعليقاً... (يتطلب تسجيل الدخول)" disabled />
                    <Button className="mt-2" disabled>إضافة تعليق</Button>
                </div>
                 <div className="space-y-6">
                    <div className="border-b pb-4">
                        <p className="font-semibold">عبد الله محمد</p>
                        <p className="text-muted-foreground">جزاكم الله خيراً، محاضرة قيمة جداً.</p>
                        <p className="text-xs text-muted-foreground mt-1">منذ 3 أيام</p>
                    </div>
                    <div className="pb-4">
                        <p className="font-semibold">فاطمة علي</p>
                        <p className="text-muted-foreground">نفع الله بكم.</p>
                        <p className="text-xs text-muted-foreground mt-1">منذ أسبوع</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
