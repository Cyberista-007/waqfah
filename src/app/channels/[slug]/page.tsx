
import { notFound } from 'next/navigation';
import type { Channel, Lecture } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/images';
import { getInitials } from '@/lib/utils';
import { LectureCard } from '@/components/lecture-card';
import { Button } from '@/components/ui/button';
import { Youtube, Bell, Check } from 'lucide-react';
import { getChannelBySlug, getLecturesByChannel } from '@/lib/data';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


async function getChannelData(slug: string) {
    const channel = await getChannelBySlug(slug);

    if (!channel) {
        return null;
    }
    
    const lectures = await getLecturesByChannel(channel.id);

    return { channel, lectures };
}

export default async function ChannelPage({ params }: { params: { slug: string } }) {
    const data = await getChannelData(params.slug);

    if (!data) {
        notFound();
    }

    const { channel, lectures } = data;
    const placeholder = getPlaceholderImage(channel.imageId);
    const imageUrl = channel.imageUrl || placeholder?.imageUrl;
    
    // Using a generic banner for now
    const bannerUrl = "https://picsum.photos/seed/channel-banner/1600/400";


    return (
        <div className="container mx-auto px-0 py-0 -mt-8">
            {/* Banner Image */}
            <div className="relative h-40 md:h-64 w-full">
                <Image
                    src={bannerUrl}
                    alt={`${channel.name} banner`}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract texture"
                />
            </div>

            {/* Channel Header */}
            <div className="px-4 sm:px-6 py-4">
                 <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background -mt-12 sm:-mt-16 shrink-0">
                        <AvatarImage src={imageUrl} alt={channel.name} />
                        <AvatarFallback className="text-4xl">{getInitials(channel.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <h1 className="text-3xl font-extrabold font-headline">{channel.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                             <span>@{channel.slug}</span>
                             <span>1.24 مليون مشترك</span>
                             <span>{lectures.length} فيديو</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xl line-clamp-2">{channel.description}</p>
                         <div className="mt-4 flex flex-wrap gap-2">
                             <Button asChild className="bg-primary hover:bg-primary/90">
                                <a href={channel.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                    <div className="flex items-center">
                                       <Check className="me-1 h-5 w-5" />
                                       <span>تم الاشتراك</span>
                                       <Bell className="ms-2 h-5 w-5" />
                                    </div>
                                </a>
                            </Button>
                             <Button asChild variant="secondary">
                                <a href={channel.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                    الانضمام
                                </a>
                            </Button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
             <Tabs defaultValue="videos" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-5 md:w-auto md:inline-flex">
                    <TabsTrigger value="home">الصفحة الرئيسية</TabsTrigger>
                    <TabsTrigger value="videos">الفيديوهات</TabsTrigger>
                    <TabsTrigger value="shorts">Shorts</TabsTrigger>
                    <TabsTrigger value="playlists">قوائم التشغيل</TabsTrigger>
                    <TabsTrigger value="community">المنتدى</TabsTrigger>
                </TabsList>
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
                 <TabsContent value="playlists" className="mt-6 text-center py-16 border-2 border-dashed rounded-xl">
                    <p className="text-lg text-muted-foreground">سيتم عرض قوائم التشغيل هنا قريبًا.</p>
                </TabsContent>
                 <TabsContent value="community" className="mt-6 text-center py-16 border-2 border-dashed rounded-xl">
                    <p className="text-lg text-muted-foreground">سيتم عرض منشورات المنتدى هنا قريبًا.</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}
