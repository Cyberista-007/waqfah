
import { notFound } from 'next/navigation';
import type { Channel, Lecture } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials } from '@/lib/utils';
import { LectureCard } from '@/components/lecture-card';
import { Button } from '@/components/ui/button';
import { Youtube, Bell, Check, Search } from 'lucide-react';
import { getChannelBySlug, getLecturesByChannel } from '@/lib/data';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


async function getChannelData(slug: string) {
    const channel = await getChannelBySlug(slug);

    if (!channel) {
        return { channel: null, lectures: [] };
    }
    
    const lectures = await getLecturesByChannel(channel.id);

    return { channel, lectures };
}

export default async function ChannelPage({ params }: { params: { slug: string } }) {
    const { channel, lectures } = await getChannelData(params.slug);

    if (!channel) {
        notFound();
    }

    const placeholder = getPlaceholderImage(channel.imageId);
    const imageUrl = channel.imageUrl || placeholder?.imageUrl;
    
    // Using a generic banner for now, as specified in the original code.
    const bannerUrl = "https://picsum.photos/seed/channel-banner/1600/400";


    return (
        <div className="container mx-auto px-0 py-0 -mt-8">
            {/* Banner Image */}
            <div className="relative h-40 md:h-56 w-full bg-muted">
                <Image
                    src={bannerUrl}
                    alt={`${channel.name} banner`}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract texture"
                    priority
                />
            </div>

            {/* Channel Header */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-0">
                 <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Avatar className="h-24 w-24 sm:h-36 sm:w-36 border-4 border-background -mt-12 sm:-mt-20 shrink-0">
                        <AvatarImage src={imageUrl} alt={channel.name} />
                        <AvatarFallback className="text-4xl">{getInitials(channel.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow pt-2">
                        <h1 className="text-3xl font-extrabold font-headline">{channel.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
                             <span>@{channel.slug}</span>
                             <span className="hidden sm:inline">·</span>
                             <span>{lectures.length} محاضرة</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xl line-clamp-2">{channel.description}</p>
                         <div className="mt-6 flex flex-wrap gap-2">
                             <Button size="lg" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                <div className="flex items-center">
                                   <Check className="me-1 h-5 w-5" />
                                   <span>تم الاشتراك</span>
                                   <Bell className="ms-2 h-5 w-5" />
                                </div>
                            </Button>
                             <Button size="lg" variant="secondary" className="rounded-full">
                                الانضمام
                            </Button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
             <Tabs defaultValue="home" className="w-full mt-6 sticky top-[60px] z-30 bg-background/95 backdrop-blur-sm">
                <div className="border-b">
                    <TabsList className="px-4 sm:px-6 lg:px-8 h-auto p-0 bg-transparent rounded-none gap-6">
                        <TabsTrigger value="home" className="h-12 data-[state=active]:shadow-none data-[state=active]:border-b-2 border-transparent rounded-none text-muted-foreground data-[state=active]:text-foreground">الصفحة الرئيسية</TabsTrigger>
                        <TabsTrigger value="videos" className="h-12 data-[state=active]:shadow-none data-[state=active]:border-b-2 border-transparent rounded-none text-muted-foreground data-[state=active]:text-foreground">الفيديوهات</TabsTrigger>
                        <TabsTrigger value="shorts" className="h-12 data-[state=active]:shadow-none data-[state=active]:border-b-2 border-transparent rounded-none text-muted-foreground data-[state=active]:text-foreground">Shorts</TabsTrigger>
                        <TabsTrigger value="live" className="h-12 data-[state=active]:shadow-none data-[state=active]:border-b-2 border-transparent rounded-none text-muted-foreground data-[state=active]:text-foreground">البث المباشر</TabsTrigger>
                        <TabsTrigger value="playlists" className="h-12 data-[state=active]:shadow-none data-[state=active]:border-b-2 border-transparent rounded-none text-muted-foreground data-[state=active]:text-foreground">قوائم التشغيل</TabsTrigger>
                        <TabsTrigger value="community" className="h-12 data-[state=active]:shadow-none data-[state=active]:border-b-2 border-transparent rounded-none text-muted-foreground data-[state=active]:text-foreground">المنشورات</TabsTrigger>
                        <div className="ms-auto hidden md:block">
                            <Button variant="ghost" size="icon"><Search className="h-5 w-5 text-muted-foreground" /></Button>
                        </div>
                    </TabsList>
                </div>
                <div className="px-4 sm:px-6 lg:px-8">
                    <TabsContent value="videos" className="mt-6">
                        {lectures.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lectures.map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed rounded-xl">
                                <p className="text-lg text-muted-foreground">
                                    لا توجد محاضرات مرتبطة بهذه القناة حالياً.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                     <TabsContent value="home" className="mt-6 text-center py-16 border-2 border-dashed rounded-xl">
                        <p className="text-lg text-muted-foreground">سيتم عرض المحتوى المميز هنا قريبًا.</p>
                    </TabsContent>
                     <TabsContent value="shorts" className="mt-6 text-center py-16 border-2 border-dashed rounded-xl">
                        <p className="text-lg text-muted-foreground">سيتم عرض فيديوهات Shorts هنا قريبًا.</p>
                    </TabsContent>
                     <TabsContent value="live" className="mt-6 text-center py-16 border-2 border-dashed rounded-xl">
                        <p className="text-lg text-muted-foreground">لا يوجد بث مباشر حاليًا.</p>
                    </TabsContent>
                     <TabsContent value="playlists" className="mt-6 text-center py-16 border-2 border-dashed rounded-xl">
                        <p className="text-lg text-muted-foreground">سيتم عرض قوائم التشغيل هنا قريبًا.</p>
                    </TabsContent>
                     <TabsContent value="community" className="mt-6 text-center py-16 border-2 border-dashed rounded-xl">
                        <p className="text-lg text-muted-foreground">سيتم عرض منشورات المنتدى هنا قريبًا.</p>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
