import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/images';
import { Card } from '@/components/ui/card';
import type { Sheikh, Lecture, Series } from '@/lib/types';
import { getSheikhBySlug, getLecturesBySheikh, getSeriesBySheikh } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import { Clapperboard, ListVideo } from 'lucide-react';


type SheikhDetailPageProps = {
  params: {
    slug: string;
  };
};

async function getSheikhData(slug: string) {
    const sheikh = await getSheikhBySlug(slug);
    if (!sheikh) return null;

    const [lectures, series] = await Promise.all([
        getLecturesBySheikh(sheikh.id),
        getSeriesBySheikh(sheikh.id)
    ]);

    return { sheikh, lectures, series };
}


export async function generateMetadata({ params }: SheikhDetailPageProps) {
  const data = await getSheikhData(params.slug);
  if (!data?.sheikh) {
    return { title: 'الشيخ غير موجود' };
  }
  return { 
      title: `الشيخ ${data.sheikh.name}`,
      description: data.sheikh.bio,
 };
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}


export default async function SheikhDetailPage({ params }: SheikhDetailPageProps) {
  const data = await getSheikhData(params.slug);

  if (!data) {
    notFound();
  }

  const { sheikh, lectures, series } = data;
  const placeholder = getPlaceholderImage(sheikh.imageId);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
      <header className="flex flex-col md:flex-row items-center gap-8">
        <Avatar className="h-40 w-40 border-4 border-primary">
            <AvatarImage src={placeholder?.imageUrl} alt={sheikh.name} />
            <AvatarFallback className="text-6xl">{getInitials(sheikh.name)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-right">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-2 font-headline">{sheikh.name}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">{sheikh.bio}</p>
        </div>
      </header>

      <Tabs defaultValue="series" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="series"><ListVideo className="me-2"/>السلاسل ({series.length})</TabsTrigger>
            <TabsTrigger value="lectures"><Clapperboard className="me-2"/>المحاضرات ({lectures.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="series" className="mt-6">
            {series.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {series.map(s => <SeriesCard key={s.id} series={s} />)}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد سلاسل لهذا الشيخ بعد.</p>
            )}
        </TabsContent>
        
        <TabsContent value="lectures" className="mt-6">
            {lectures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {lectures.map(l => <LectureCard key={l.id} lecture={l} />)}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد محاضرات لهذا الشيخ بعد.</p>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
