'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture, Series } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials } from '@/lib/utils';
import { LectureCard } from '@/components/lecture-card';
import { SeriesCard } from '@/components/series-card';
import Image from 'next/image';
import { FollowButton } from '@/components/follow-button';
import { Users, Loader2, ArrowLeft } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { HomePageSkeleton } from '@/components/skeletons';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ProgramPageContent({ program }: { program: Program }) {
    const firestore = useFirestore();

    const [lectures, setLectures] = useState<Lecture[] | null>(null);
    const [series, setSeries] = useState<Series[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!program || !firestore) {
        setIsLoading(false);
        return;
      }

      let isMounted = true;
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch series associated with the program
          const seriesQuery = query(collection(firestore, 'series'), where('programId', '==', program.id));
          const seriesSnap = await getDocs(seriesQuery);
          const seriesData = seriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Series));
          if (isMounted) setSeries(seriesData);

          const allProgramLectures: Lecture[] = [];

          // 1. Fetch lectures that are directly associated with the program.
          const directLecturesQuery = query(collection(firestore, 'lectures'), where('programId', '==', program.id));
          const directLecturesSnap = await getDocs(directLecturesQuery);
          directLecturesSnap.forEach(doc => {
            allProgramLectures.push({ id: doc.id, ...doc.data() } as Lecture);
          });
          
          // 2. Fetch lectures from all series belonging to this program.
          const seriesIds = seriesData.map(s => s.id).filter(Boolean);
          if (seriesIds.length > 0) {
            const lecturePromises = [];
            // Firestore 'in' query can handle up to 30 items.
            for (let i = 0; i < seriesIds.length; i += 30) {
                const chunk = seriesIds.slice(i, i + 30);
                const lecturesQuery = query(collection(firestore, 'lectures'), where('seriesId', 'in', chunk));
                lecturePromises.push(getDocs(lecturesQuery));
            }
            const lectureSnapshots = await Promise.all(lecturePromises);
            lectureSnapshots.forEach(snap => {
                snap.forEach(doc => {
                    allProgramLectures.push({ id: doc.id, ...doc.data() } as Lecture);
                });
            });
          }

          // 3. Deduplicate lectures
          const uniqueLectures = Array.from(new Map(allProgramLectures.map(l => [l.id, l])).values());
          
          if (isMounted) {
            setLectures(uniqueLectures);
          }

        } catch (error) {
          console.error("Error fetching program content:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [program, firestore]);

    const { shorts, regularLectures } = useMemo(() => {
        if (!lectures) return { shorts: [], regularLectures: [] };
        
        // Show most recent first
        const sortedLectures = [...lectures].sort((a, b) => {
            const toDate = (ts: any): Date => ts?.toDate ? ts.toDate() : new Date(ts || 0);
            return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
        });

        const shortsArr: Lecture[] = [];
        const regularLecturesArr: Lecture[] = [];
        sortedLectures.forEach(lecture => {
            if (lecture.duration <= 180) {
                shortsArr.push(lecture);
            } else {
                regularLecturesArr.push(lecture);
            }
        });
        return { shorts: shortsArr, regularLectures: regularLecturesArr };
    }, [lectures]);


    const contentIsLoading = isLoading;

    const placeholder = getPlaceholderImage(program.imageId);
    const imageUrl = program.imageUrl || placeholder?.imageUrl;
    const bannerUrl = "https://picsum.photos/seed/program-banner/1600/400";

    return (
        <div className="container mx-auto px-0 py-0 -mt-8 space-y-12">
            {/* Banner Image */}
            <div className="relative h-40 md:h-56 w-full bg-muted">
                <Image
                    src={bannerUrl}
                    alt={`${program.name} banner`}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract texture"
                    priority
                />
            </div>

            {/* Program Header */}
            <div className="px-4 sm:px-6 lg:px-8">
                 <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Avatar className="h-24 w-24 sm:h-36 sm:w-36 border-4 border-background -mt-12 sm:-mt-20 shrink-0">
                        {imageUrl && <AvatarImage src={imageUrl} alt={program.name} />}
                        <AvatarFallback className="text-4xl">{getInitials(program.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow pt-2">
                        <h1 className="text-3xl lg:text-4xl font-extrabold font-headline">{program.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
                             <span>@{program.slug}</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{series?.length || 0} سلسلة</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{lectures?.length || 0} محاضرة</span>
                             {program.followerCount && program.followerCount > 0 && (
                                <>
                                  <span className="hidden sm:inline">·</span>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{program.followerCount} متابع</span>
                                  </div>
                                </>
                             )}
                        </div>
                        <p className="text-base text-muted-foreground mt-3 max-w-xl line-clamp-3">{program.bio}</p>
                         <div className="mt-6 flex flex-wrap gap-2">
                             <FollowButton programId={program.id} />
                         </div>
                    </div>
                </div>
            </div>

            {contentIsLoading && (
                 <div className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                 </div>
            )}

            {!contentIsLoading && (
                <>
                    {shorts.length > 0 && (
                        <section className="px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-headline">مقاطع قصيرة</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {shorts.slice(0, 4).map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                            </div>
                        </section>
                    )}
                    
                    {(series?.length || 0) > 0 && (
                        <section className="px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-headline">السلاسل</h2>
                                <Button asChild variant="outline">
                                    <Link href={`/programs/${program.slug}/series`}>
                                        <span>عرض الكل</span>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {series!.slice(0, 3).map((s, i) => <SeriesCard key={s.id} series={s} index={i} />)}
                            </div>
                        </section>
                    )}
                    
                    {regularLectures.length > 0 && (
                         <section className="px-4 sm:px-6 lg:px-8">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-headline">المحاضرات</h2>
                                <Button asChild variant="outline">
                                    <Link href={`/programs/${program.slug}/lectures`}>
                                        <span>عرض الكل</span>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                    </Link>
                                </Button>
                             </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {regularLectures.slice(0, 4).map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                            </div>
                        </section>
                    )}

                    {shorts.length === 0 && regularLectures.length === 0 && (series?.length || 0) === 0 && (
                         <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20 px-4 sm:px-6 lg:px-8">
                            <p className="text-lg text-muted-foreground">
                                لا يوجد محتوى في هذا البرنامج حالياً.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function ProgramPage() {
    const params = useParams();
    const slug = decodeURIComponent(params.slug as string);

    const { data: programs, isLoading: programsLoading } = useCollection<Program>('programs', {
        where: ['slug', '==', slug],
        limit: 1
    });

    if (programsLoading) {
        return <HomePageSkeleton />;
    }

    const program = programs?.[0];

    if (!program) {
        notFound();
        return null;
    }

    return <ProgramPageContent program={program} />;
}
