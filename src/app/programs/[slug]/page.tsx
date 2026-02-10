
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
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShortsCarousel } from '@/components/ShortsCarousel';

function ProgramPageContent({ program }: { program: Program }) {
    // Fetch all data needed and filter on the client.
    // This is more robust against missing Firestore indexes.
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');

    const isLoading = lecturesLoading || seriesLoading;
    const [bannerUrl, setBannerUrl] = useState("https://picsum.photos/seed/program-banner/1600/400");

    useEffect(() => {
        if (program.youtubeUrl) {
            const fetchBanner = async () => {
                try {
                    const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: program.youtubeUrl, fetchChannelInfo: true }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.channelInfo?.bannerUrl) {
                            // YouTube banner URLs can be tweaked for size. Let's try to get a bigger one.
                            const highResBanner = data.channelInfo.bannerUrl.replace('=w1060', '=w2120').replace('=w1707', '=w2120');
                            setBannerUrl(highResBanner);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch YouTube banner:", error);
                }
            };
            fetchBanner();
        }
    }, [program.youtubeUrl]);


    // Memoize the filtering logic to run only when data changes
    const { programSeries, programLectures } = useMemo(() => {
        if (!allSeries || !allLectures) return { programSeries: [], programLectures: [] };

        const seriesForProgram = allSeries.filter(s => s.programId === program.id || s.programSlug === program.slug);
        const seriesIds = new Set(seriesForProgram.map(s => s.id));

        const lecturesForProgram = allLectures.filter(l => {
            // Direct link by programId or programSlug
            if (l.programId === program.id || l.programSlug === program.slug) {
                return true;
            }
            // Indirect link via a series that belongs to the program
            if (l.seriesId && seriesIds.has(l.seriesId)) {
                return true;
            }
            return false;
        });
        
        return { programSeries: seriesForProgram, programLectures: lecturesForProgram };
    }, [allSeries, allLectures, program.id, program.slug]);

    const { shorts, regularLectures } = useMemo(() => {
        if (!programLectures) return { shorts: [], regularLectures: [] };
        
        const sortedLectures = [...programLectures].sort((a, b) => {
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
    }, [programLectures]);


    const contentIsLoading = isLoading;
    const placeholder = getPlaceholderImage(program.imageId);
    const imageUrl = program.imageUrl || placeholder?.imageUrl;

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
                             <span>{programSeries?.length || 0} سلسلة</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{regularLectures.length || 0} محاضرة</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{shorts.length || 0} مقطع قصير</span>
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
                           <ShortsCarousel shorts={shorts} />
                        </section>
                    )}
                    
                    {regularLectures.length > 0 && (
                         <section className="px-4 sm:px-6 lg:px-8">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-headline">المحاضرات</h2>
                                {regularLectures.length > 4 && (
                                    <Button asChild variant="outline">
                                        <Link href={`/programs/${program.slug}/lectures`}>
                                            <span>عرض الكل</span>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                        </Link>
                                    </Button>
                                )}
                             </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {regularLectures.slice(0, 4).map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                            </div>
                        </section>
                    )}

                    {programSeries.length > 0 && (
                        <section className="px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-headline">السلاسل</h2>
                                {programSeries.length > 3 && (
                                    <Button asChild variant="outline">
                                        <Link href={`/programs/${program.slug}/series`}>
                                            <span>عرض الكل</span>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {programSeries.slice(0, 3).map((s, i) => <SeriesCard key={s.id} series={s} index={i} />)}
                            </div>
                        </section>
                    )}
                    
                    {shorts.length === 0 && regularLectures.length === 0 && programSeries.length === 0 && (
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
    const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const slug = decodeURIComponent(slugParam as string);

    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');

    const program = useMemo(() => {
        if (!allPrograms) return null;
        return allPrograms.find(p => p.slug === slug);
    }, [allPrograms, slug]);


    if (programsLoading) {
        return <HomePageSkeleton />;
    }

    if (!program) {
        notFound();
        return null;
    }

    return <ProgramPageContent program={program} />;
}
