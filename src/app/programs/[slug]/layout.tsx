'use client';

import { useParams, notFound, usePathname } from 'next/navigation';
import type { Program, Lecture, Series } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials } from '@/lib/utils';
import { Users, Video, Clapperboard, ListVideo, Home } from 'lucide-react';
import Image from 'next/image';
import { FollowButton } from '@/components/follow-button';
import { useCollection } from '@/firebase';
import { HomePageSkeleton } from '@/components/skeletons';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// This will be the main layout component for a program page.
// It will contain the header, banner, and the tab navigation.

function ProgramHeader({ program, contentCounts }: { program: Program, contentCounts: { lectures: number, shorts: number, series: number } }) {
    const pathname = usePathname();
    const [bannerUrl, setBannerUrl] = useState("https://picsum.photos/seed/program-banner/1600/400");
    
    const tabs = [
        { href: `/programs/${program.slug}`, label: "الرئيسية", icon: Home },
        { href: `/programs/${program.slug}/lectures`, label: "المحاضرات", icon: Clapperboard },
        { href: `/programs/${program.slug}/shorts`, label: "مقاطع قصيرة", icon: Video },
        { href: `/programs/${program.slug}/series`, label: "السلاسل", icon: ListVideo },
    ];

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

    const placeholder = getPlaceholderImage(program.imageId);
    const imageUrl = program.imageUrl || placeholder?.imageUrl;

    return (
        <div className="container mx-auto px-0 py-0 -mt-8 space-y-8">
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
                            <span>{contentCounts.series} سلسلة</span>
                            <span className="hidden sm:inline">·</span>
                            <span>{contentCounts.lectures} محاضرة</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{contentCounts.shorts} مقطع قصير</span>
                            {program.followerCount > 0 && (
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

             {/* Tabs */}
             <div className="border-b">
                <nav className="container -mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.label}
                            href={tab.href}
                            className={cn(
                                'group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-lg',
                                pathname === tab.href
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            )}
                        >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}


export default function ProgramLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const slug = decodeURIComponent(slugParam as string);

    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');

    const isLoading = programsLoading || lecturesLoading || seriesLoading;

    const programData = useMemo(() => {
        if (isLoading || !allPrograms || !allLectures || !allSeries) {
            return { program: null, contentCounts: { lectures: 0, shorts: 0, series: 0 } };
        }
        
        const program = allPrograms.find(p => p.slug === slug);
        if (!program) return { program: null, contentCounts: { lectures: 0, shorts: 0, series: 0 } };

        const seriesForProgram = allSeries.filter(s => s.programId === program.id || s.programSlug === program.slug);
        const seriesIds = new Set(seriesForProgram.map(s => s.id));

        let lectureCount = 0;
        let shortCount = 0;

        allLectures.forEach(l => {
             const belongsToProgram = (l.programId === program.id || l.programSlug === program.slug) || (l.seriesId && seriesIds.has(l.seriesId));
             if (belongsToProgram) {
                if (l.duration <= 180) {
                    shortCount++;
                } else {
                    lectureCount++;
                }
             }
        });
        
        return {
            program,
            contentCounts: {
                lectures: lectureCount,
                shorts: shortCount,
                series: seriesForProgram.length
            }
        };
    }, [isLoading, allPrograms, allLectures, allSeries, slug]);

    const { program, contentCounts } = programData;

    if (isLoading) {
        return <HomePageSkeleton />;
    }

    if (!program) {
        notFound();
        return null;
    }

    return (
        <div className="space-y-12">
            <ProgramHeader program={program} contentCounts={contentCounts} />
            <main className="container py-8">{children}</main>
        </div>
    )
}
