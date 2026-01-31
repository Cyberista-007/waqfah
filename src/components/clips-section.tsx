"use client";

import { useCollection } from "@/firebase";
import { useAudioPlayer } from "./audio-player-provider";
import type { LectureClip, Lecture } from "@/lib/types";
import { Button } from "./ui/button";
import { Play, Share2, Loader2, Clapperboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./ui/card";
import { formatDuration } from "@/lib/utils";

interface ClipsSectionProps {
    lecture: Lecture;
}

export function ClipsSection({ lecture }: ClipsSectionProps) {
    const { playTrack } = useAudioPlayer();
    const { toast } = useToast();
    const { data: clips, isLoading } = useCollection<LectureClip>(`lectures/${lecture.id}/clips`, { orderBy: ['createdAt', 'desc'] });

    const handleShareClip = async (clipId: string) => {
        const clipUrl = `${window.location.origin}/lectures/${lecture.slug}?clip=${clipId}`;
        try {
            await navigator.clipboard.writeText(clipUrl);
            toast({ title: 'تم نسخ رابط المقطع!' });
        } catch (err) {
            toast({ variant: 'destructive', title: 'فشل نسخ الرابط' });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
    }
    
    if (!clips || clips.length === 0) {
        return (
            <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
                <Clapperboard className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg text-muted-foreground">لم يتم إنشاء أي مقاطع لهذه المحاضرة بعد.</p>
                <p className="text-sm text-muted-foreground">كن أول من ينشئ مقطعًا!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {clips.map(clip => (
                <Card key={clip.id} className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-bold">{clip.title}</p>
                        <p className="text-sm text-muted-foreground">
                            المدة: {formatDuration(clip.endTime - clip.startTime)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => playTrack(lecture, clip.startTime, clip.endTime)}
                         >
                            <Play className="h-5 w-5" />
                         </Button>
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShareClip(clip.id)}
                         >
                            <Share2 className="h-5 w-5" />
                         </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
